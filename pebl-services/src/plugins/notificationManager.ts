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

import { PeBLPlugin } from "../models/peblPlugin";
import { NotificationManager } from "../interfaces/notificationManager";
import { SessionDataManager } from "../interfaces/sessionDataManager";
import { MessageTemplate } from "../models/messageTemplate";
import { PermissionSet } from "../models/permission";
import { generateUserClearedTimestamps, generateUserClearedNotificationsKey, generateTimestampForThread, generateBroadcastQueueForUserId, LogCategory, Severity, generateTimestampForReference, TIMESTAMP_SHARED_ANNOTATIONS } from "../utils/constants";
import { ServiceMessage } from "../models/serviceMessage";
import { auditLogger } from "../main";

export class DefaultNotificationManager extends PeBLPlugin implements NotificationManager {
  private sessionData: SessionDataManager;

  constructor(sessionData: SessionDataManager) {
    super();
    this.sessionData = sessionData;
    // this.addMessageTemplate(new MessageTemplate("getNotifications",
    //   this.validateGetNotifications.bind(this),
    //   this.authorizeGetNotifications.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.getNotifications(payload.identity, payload.timestamp, dispatchCallback);
    //   }));

    // this.addMessageTemplate(new MessageTemplate("saveNotifications",
    //   this.validateSaveNotifications.bind(this),
    //   this.authorizeSaveNotifications.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.saveNotifications(payload.identity, payload.notifications, dispatchCallback);
    //   }));

    this.addMessageTemplate(new MessageTemplate("deleteNotification",
      this.validateDeleteNotification.bind(this),
      this.authorizeDeleteNotification.bind(this),
      (payload: { [key: string]: any }) => {
        return this.deleteNotification(payload.identity, payload.records);
      }));
  }

  // validateGetNotifications(payload: { [key: string]: any }): boolean {
  //   return true;
  // }

  // authorizeGetNotifications(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
  //   let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

  //   return canUser || canGroup;
  // }

  // validateSaveNotifications(payload: { [key: string]: any }): boolean {
  //   return false; //TODO
  // }

  // authorizeSaveNotifications(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   // let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
  //   // let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

  //   return false;// canUser || canGroup;
  // }

  validateDeleteNotification(payload: { [key: string]: any }): boolean {
    if (Array.isArray(payload.records) && (payload.records.length > 0)) {
      for (let recIndex in payload.records) {
        let rec = payload.records[recIndex];
        if (typeof rec.id !== "string")
          return false;
        if (typeof rec.type !== "string")
          return false;
        if (typeof rec.location !== "string")
          return false;
        if (typeof rec.stored !== "string")
          return false;
      }
    } else {
      return false;
    }
    return true;
  }

  authorizeDeleteNotification(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    if (permissions.user[payload.requestType]) {
      for (let key in payload.actions) {
        let obj = payload.actions[key];
        let identity = obj.identity;
        let canUser = (username == identity);
        // let canGroup = permissions.group[identity] && permissions.group[identity][obj.requestType]

        if (!(canUser // || canGroup
        ))
          return false;
      }
    }
    return true;
  }

  // getNotifications(identity: string, timestamp: number, callback: ((notifications: XApiStatement[]) => void)): void {
  // this.sessionData.getValuesGreaterThanTimestamp(generateTimestampForNotification(identity),
  //   timestamp,
  //   (data) => {
  //     this.sessionData.getHashMultiField(SET_ALL_NOTIFICATIONS,
  //       data,
  //       (result) => {
  //         callback(result.map(function(x) {
  //           let obj = JSON.parse(pakoInflate(x));
  //           if (XApiStatement.is(obj)) {
  //             return new XApiStatement(obj);
  //           } else {
  //             return new Voided(obj);
  //           }
  //         }));
  //       });
  //   });
  // }

  // saveNotifications(identity: string, notifications: XApiStatement[], callback: ((success: boolean) => void)): void {
  //   let userNotificationSet = [];
  //   let notificationSet = [];
  //   let notificationRefSet = [];
  //   let date = new Date();
  //   let isoDate = date.toISOString();
  //   let timestamp = date.getTime();
  //   for (let notification of notifications) {
  //     notification.stored = isoDate;
  //     notificationRefSet.push(notification.id);
  //     notificationSet.push(notification.id);
  //     notificationSet.push(pakoDeflate(JSON.stringify(notification)));
  //     userNotificationSet.push(timestamp);
  //     userNotificationSet.push(notification.id);
  //   }
  //   this.sessionData.addTimestampValues(generateTimestampForNotification(identity), userNotificationSet);
  //   this.sessionData.incHashKeys(SET_ALL_NOTIFICATIONS_REFS, notificationRefSet, 1);
  //   this.sessionData.setHashValues(SET_ALL_NOTIFICATIONS, notificationSet);
  //   this.sessionData.broadcast(generateBroadcastQueueForUserId(identity),
  //     JSON.stringify(new ServiceMessage(identity,
  //       {
  //         requestType: "getNotifications",
  //         data: notifications
  //       })));
  //   callback(true);
  // }

  private scanPotentialNotifications(potentialNotifications: string[],
    clearedNotificationsKey: string,
    clearedIdLookup: { [key: string]: boolean }): Promise<[string, string[]]> {

    return new Promise((resolve) => {
      let acc: string[] = [];
      let lastTime: string;
      let p = async () => {
        let time = potentialNotifications.pop();
        let potentialNotification = potentialNotifications.pop();
        if (time && potentialNotification) {
          if (potentialNotification.substring(0, 2) !== "v-") {
            if (clearedIdLookup[potentialNotification]) {
              acc.push(potentialNotification);
              lastTime = time;
              p();
            } else {
              let isMember = await this.sessionData.isMemberSetValue(clearedNotificationsKey, potentialNotification);
              if (isMember && potentialNotification && time) {
                acc.push(potentialNotification);
                lastTime = time;
                p();
              } else if (time) {
                resolve([time, acc]);
              }
            }
          } else {
            lastTime = time;
            p();
          }
        } else {
          resolve([(parseInt(lastTime) + 1) + "", acc]);
        }
      }
      p();
    });
  }

  private async processDeleteNotification(record: { [key: string]: any },
    mainSet: string,
    locationTimestampLookup: { [key: string]: number },
    clearedNotificationsKey: string,
    allRemovedIds: string[],
    clearedIdLookup: { [key: string]: boolean }): Promise<true> {

    let potentialNotifications = await this.sessionData.rangeRevSortedSet(mainSet,
      locationTimestampLookup[record.adjLocation],
      Number.MAX_SAFE_INTEGER,
      true);

    let pair: [string, string[]] = await this.scanPotentialNotifications(potentialNotifications,
      clearedNotificationsKey,
      clearedIdLookup);
    let newTimestamp = pair[0];
    let removeIds = pair[1];
    let time = parseInt(newTimestamp);
    if (record && (time > locationTimestampLookup[record.adjLocation]))
      locationTimestampLookup[record.adjLocation] = time;

    if (removeIds.length > 0) {
      allRemovedIds.push(...removeIds);
    }
    return true;
  }

  async deleteNotification(identity: string, records: { [key: string]: any }[]): Promise<true> {

    let locations: { [key: string]: boolean } = {};
    records.forEach((record) => {
      record.storedTime = new Date(record.stored).getTime();
    });

    records = records.sort((a, b) => {
      return b.storedTime - a.storedTime;
    });

    let newestClearedPerLocation: { [key: string]: { [key: string]: any } } = {};
    records.forEach((record) => {
      let location = record.location;
      if (record.type === "reference")
        location = "r" + location;
      else if (record.type === "sharedAnnotation")
        location = "sa" + location;
      record.adjLocation = location
      if (!locations[record.adjLocation]) {
        newestClearedPerLocation[record.id] = record;
        locations[record.adjLocation] = true;
      }
    });

    let userClearedTimestampsKey = generateUserClearedTimestamps(identity);
    let locationSet = Object.keys(locations);
    let locationTimestamps = await this.sessionData.getHashMultiField(userClearedTimestampsKey, locationSet);
    let locationTimestampLookup: { [key: string]: number } = {};
    for (let i = 0; i < locationTimestamps.length; i++) {
      let val = locationTimestamps[i];
      if (!val) {
        locationTimestampLookup[locationSet[i]] = 0;
      } else {
        locationTimestampLookup[locationSet[i]] = parseInt(val);
      }
    }

    let clearedIds: string[] = [];
    let clearedIdLookup: { [key: string]: boolean } = {};
    records.forEach((record) => {
      clearedIdLookup[record.id] = true;
      if (record.storedTime >= locationTimestampLookup[record.adjLocation]) {
        clearedIds.push(record.id);
      } else if (newestClearedPerLocation[record.id]) {
        delete newestClearedPerLocation[record.id];
      }
    });

    let clearedNotificationsKey = generateUserClearedNotificationsKey(identity);
    await this.sessionData.addSetValue(clearedNotificationsKey, clearedIds);

    let allRemovedIds: string[] = [];
    let newestRecords = Object.values(newestClearedPerLocation);
    for (let record of newestRecords) {
      let mainSet;
      if (record.type === "message") {
        mainSet = generateTimestampForThread(record.location);
      } else if (record.type === "sharedAnnotation") {
        mainSet = TIMESTAMP_SHARED_ANNOTATIONS;
      } else if (record.type === "reference") {
        mainSet = generateTimestampForReference(record.location);
      }
      if (mainSet) {
        await this.processDeleteNotification(record,
          mainSet,
          locationTimestampLookup,
          clearedNotificationsKey,
          allRemovedIds,
          clearedIdLookup);
      } else {
        auditLogger.report(LogCategory.SYSTEM, Severity.ERROR, "ClearNoificationMissingType", record);
      }
    }

    let timestampSet: string[] = [];
    for (let key in locationTimestampLookup) {
      timestampSet.push(key);
      timestampSet.push(locationTimestampLookup[key] + "");
    }
    await this.sessionData.setHashValues(userClearedTimestampsKey, timestampSet);
    if (allRemovedIds.length > 0) {
      await this.sessionData.deleteSetValue(clearedNotificationsKey, allRemovedIds);
      await this.sessionData.broadcast(generateBroadcastQueueForUserId(identity),
        JSON.stringify(new ServiceMessage(identity,
          {
            requestType: "removeClearedNotifications",
            clearedNotifications: allRemovedIds,
            clearedTimestamps: locationTimestampLookup
          })));
    }
    return true;
  }
}
