/*

Copyright 2021 Eduworks Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import { SessionDataManager } from "../interfaces/sessionDataManager";
import { SET_ALL_NOTIFICATIONS, SET_ALL_NOTIFICATIONS_REFS, SET_ALL_PEBL_CONFIG, DB_VERSION, LogCategory, Severity, generateUserClearedNotificationsKey, generateUserClearedTimestamps, generateThreadKey, generateTimestampForAnnotations, generateUserAnnotationsKey, generateAnnotationsKey } from "./constants";
import { auditLogger } from "../main";
import { Voided, XApiStatement } from "../models/xapiStatement";
import { SharedAnnotation } from "../models/sharedAnnotation";
import { Message } from "../models/message";
import { Reference } from "../models/reference";

let upgrades = [
  { //Refactor to single notification representation
    "version": 5,
    "fn": async (redis: SessionDataManager, completedUpgrade: () => void) => {
      await redis.deleteValue(SET_ALL_NOTIFICATIONS_REFS);
      let ids = await redis.keys("user:*:notifications");
      for (let id of ids) {
        let notificationSet: { [key: string]: string } = await redis.getAllHashPairs(id);
        let pairs: string[] = [];
        let incPairs = [];
        for (let notification in notificationSet) {
          let notificationId = notification.substring("notification:".length);
          pairs.push(notificationId);
          pairs.push(notificationSet[notification]);
          incPairs.push(notificationId);
        }
        await redis.incHashKeys(SET_ALL_NOTIFICATIONS_REFS, incPairs, 1);
        await redis.setHashValues(SET_ALL_NOTIFICATIONS, pairs)
      }
      await redis.deleteValues(ids);
      completedUpgrade();
    }
  },

  { //Refactor notifications to time with void pool
    "version": 6,
    "fn": async (redis: SessionDataManager, completedUpgrade: () => void) => {
      let prefixForUsernameLength = "timestamp:notifications:".length
      let allNotificationSet = await redis.getAllHashPairs(SET_ALL_NOTIFICATIONS);
      let userNotificationSets: string[] = await redis.keys("timestamp:notifications:*");
      for (let userNotificationSet of userNotificationSets) {
        let username = userNotificationSet.substring(prefixForUsernameLength);
        let userNotifications: string[] = await redis.getValuesGreaterThanTimestamp(userNotificationSet, 1);
        let voided: string[] = [];
        let earliestVoids: { [key: string]: number } = {};
        let voidLimit: { [key: string]: boolean } = {};
        for (let notificationId of userNotifications) {
          let notification = JSON.parse(allNotificationSet[notificationId]);
          if (Voided.is(notification)) {
            let v = new Voided(notification);
            let vt = allNotificationSet[v.target];
            if (vt) {
              let t = new XApiStatement(JSON.parse(vt));
              let voidLimited = false;
              if (Message.is(t)) {
                let m = new Message(t);
                if (!voidLimit[m.thread]) {
                  earliestVoids[m.thread] = new Date(v.stored).getTime();
                } else {
                  voidLimited = true;
                }
              } else if (SharedAnnotation.is(t)) {
                let sa = new SharedAnnotation(t);
                if (!voidLimit["sa" + sa.book]) {
                  earliestVoids["sa" + sa.book] = new Date(v.stored).getTime();
                } else {
                  voidLimited = true;
                }
              } else if (Reference.is(t)) {
                let r = new Reference(t);
                if (!voidLimit["r" + r.book]) {
                  earliestVoids["r" + r.book] = new Date(v.stored).getTime();
                } else {
                  voidLimited = true;
                }
              }
              if (voidLimited)
                voided.push(v.target);
            }
          } else {
            if (Message.is(notification)) {
              let m = new Message(notification);
              voidLimit[m.thread] = true
              if (m.getActorId() === username)
                voided.push(m.id);
            } else if (SharedAnnotation.is(notification)) {
              let sa = new SharedAnnotation(notification);
              voidLimit["sa" + sa.book] = true
              if (sa.getActorId() === username)
                voided.push(sa.id);
            } else if (Reference.is(notification)) {
              let r = new Reference(notification);
              voidLimit["r" + r.book] = true
              if (r.getActorId() === username)
                voided.push(r.id);
            }
          }
        }
        let earlyVoidKeys = Object.keys(earliestVoids);
        let voidKeysStore = [];
        for (let key of earlyVoidKeys) {
          voidKeysStore.push(key);
          voidKeysStore.push(earliestVoids[key] + "");
        }

        if (voidKeysStore.length > 0) {
          await redis.setHashValues(generateUserClearedTimestamps(username), voidKeysStore);
        }

        if (voided.length > 0) {
          await redis.addSetValue(generateUserClearedNotificationsKey(username), voided);
        }
        await redis.deleteValue(userNotificationSet);
      }
      await redis.deleteValue(SET_ALL_NOTIFICATIONS);
      await redis.deleteValue(SET_ALL_NOTIFICATIONS_REFS);
      completedUpgrade();
    }
  },

  { // fix void pool for previous messages sent
    "version": 7,
    "fn": async (redis: SessionDataManager, completedUpgrade: () => void) => {
      let userThreadsSet: string[] = await redis.keys("user:*:threads");
      for (let userThreads of userThreadsSet) {
        let username = userThreads.substring("user:".length, userThreads.length - ":threads".length);
        let toVoidIds: string[] = [];
        let threads: string[] = await redis.getHashValues(userThreads);
        let clearedUsername = generateUserClearedTimestamps(username);
        for (let thread of threads) {
          let timestampString = await redis.getHashValue(clearedUsername, thread);
          let timestamp = 0;
          if (timestampString) {
            timestamp = parseInt(timestampString);
          }
          let messages = await redis.getHashValues(generateThreadKey(thread));
          for (let message of messages) {
            let o = new XApiStatement(JSON.parse(message));
            if ((username === o.getActorId()) && (timestamp < new Date(o.stored).getTime())) {
              toVoidIds.push(o.id);
            }
          }
          await redis.addSetValue(generateUserClearedNotificationsKey(username), toVoidIds);
        }
      }
      completedUpgrade();
    }
  },

  { // clear incoming queue
    "version": 8,
    "fn": async (redis: SessionDataManager, completedUpgrade: () => void) => {
      await redis.deleteValue("rsmq:incomingMessages");
      await redis.deleteValue("rsmq:incomingMessages:Q");
      await redis.deleteSetValue("rsmq:QUEUES", "incomingMessages");
      completedUpgrade();
    }
  },


  { // remove xAPI with bad description field
    "version": 9,
    "fn": async (redis: SessionDataManager, completedUpgrade: () => void) => {
      await redis.deleteValue("outgoingXapi");
      completedUpgrade();
    }
  },

  { // remove orphaned annotations
    "version": 10,
    "fn": async (redis: SessionDataManager, completedUpgrade: () => void) => {

      let usersAnnotationTimestamps = await redis.keys(generateTimestampForAnnotations("*"));
      let subLength = generateTimestampForAnnotations("").length;

      for (let usersAnnotationTimestamp of usersAnnotationTimestamps) {
        let identity = usersAnnotationTimestamp.substring(subLength);
        let ids: string[] = await redis.getValuesGreaterThanTimestamp(generateTimestampForAnnotations(identity), 1);
        let result = await redis.getHashMultiField(generateUserAnnotationsKey(identity), ids.map((x) => generateAnnotationsKey(x)));
        let lookup: { [key: string]: true } = {};
        for (let r of result) {
          if (r)
            lookup[JSON.parse(r).id] = true;
        }

        let removeIds = [];
        for (let id of ids) {
          if (!lookup[id])
            removeIds.push(id);
        }
        if (removeIds.length > 0) {
          await redis.deleteSortedTimestampMember(generateTimestampForAnnotations(identity), removeIds);
        }
      }
      completedUpgrade();
    }
  }


];

async function setVersion(redis: SessionDataManager, version: number, callback: () => void) {
  await redis.setHashValue(SET_ALL_PEBL_CONFIG, DB_VERSION, version + "");
  auditLogger.report(LogCategory.SYSTEM, Severity.INFO, "RedisUpgradeFinished", version);
  callback();
}

export function currentRedisVersion(): number {
  let high = 0;
  for (let upgrade of upgrades) {
    if (upgrade.version > high) {
      high = upgrade.version;
    }
  }
  return high;
}

export function upgradeRedis(sessionCache: SessionDataManager, version: number, callback: () => void): void {
  let upgradesToApply = upgrades.filter((x) => {
    return x.version > version;
  }).sort((a, b): number => {
    return b.version - a.version;
  });

  let fn = async () => {
    let upgrade = upgradesToApply.pop();
    if (upgrade) {
      auditLogger.report(LogCategory.SYSTEM, Severity.INFO, "RedisUpgradeStarted", upgrade.version);
      await upgrade.fn(sessionCache,
        () => {
          if (upgrade) {
            setVersion(sessionCache, upgrade.version, fn);
          }
        });
    } else {
      callback();
    }
  }

  fn();
}
