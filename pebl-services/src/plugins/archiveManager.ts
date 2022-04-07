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
import { SqlDataStore } from '../interfaces/sqlDataStore';
import { auditLogger } from "../main";
import * as CONSTS from "../utils/constants";

export class DefaultArchiveManager {
  private sessionData: SessionDataManager;
  private sqlData: SqlDataStore;

  constructor(sessionData: SessionDataManager, sqlData: SqlDataStore, config: { [key: string]: any }) {
    this.sqlData = sqlData;
    this.sessionData = sessionData;
  }

  // archiveUserAnnotations(userId: string): void {

  // }

  // archiveUserNotifications(userId: string): void {

  // }

  // archiveUserThreads(userId: string): void {

  // }

  // restoreUserAnnotations(userId: string): void {

  // }

  // restoreUserNotifications(userId: string): void {

  // }

  // restoreUserThreads(userId: string): void {

  // }

  private storeUserRecords(userId: string, records: { [key: string]: string }, callback: (stored: boolean) => void): void {
    this.sqlData.archiveData(userId, records).then(() => {
      callback(true);
    }, () => {
      callback(false);
    })
  }

  private retrieveUserRecords(userId: string, callback: (records: { [key: string]: string }) => void): void {
    this.sqlData.getArchivedData(userId).then((data) => {
      callback(data);
    })
  }

  // private clearUserRecords(records: { [key: string]: string }): void {

  // }

  setUserArchived(userId: string, isArchived: boolean): Promise<true> {
    return new Promise((resolve, reject) => {
      let keys: string[] = [
        CONSTS.generateUserAnnotationsKey(userId),
        CONSTS.generateUserSharedAnnotationsKey(userId),
        CONSTS.generateUserEventsKey(userId),
        CONSTS.generateUserMessagesKey(userId),
        CONSTS.generateUserClearedNotificationsKey(userId),
        CONSTS.generateUserClearedTimestamps(userId),
        CONSTS.generateUserActivitiesKey(userId),
        CONSTS.generateUserActivityEventsKey(userId),
        CONSTS.generateUserModuleEventsKey(userId),
        CONSTS.generateUserAssetKey(userId),
        CONSTS.generateUserMembershipKey(userId),
        CONSTS.generateUserReferencesKey(userId),
        CONSTS.generateUserActionsKey(userId),
        CONSTS.generateUserSessionsKey(userId),
        CONSTS.generateUserToGroupMembershipKey(userId),
        CONSTS.generateUserNavigationsKey(userId),
        CONSTS.generateUserQuizesKey(userId),
        CONSTS.generateUserQuestionsKey(userId),
        CONSTS.generateTimestampForUserId(userId),
        CONSTS.generateUserThreadsKey(userId),
        CONSTS.generateUserPrivateThreadsKey(userId)
      ];

      if (!isArchived) {
        this.sessionData.dumpKeys(keys).then((data?: { [key: string]: string }) => {
          if (data) {
            this.storeUserRecords(userId, data, (stored: boolean) => {
              if (stored) {
                this.sessionData.removeKeys(keys).then(() => {
                  this.sessionData.setHashValue(CONSTS.SET_ALL_ARCHIVE_USERS, userId, "t").then(() => {
                    return this.sessionData.deleteSortedTimestampMember(CONSTS.SET_ALL_USERS_LAST_ACTIVITY, userId);
                  }).then(() => {
                    resolve();
                  })
                })
              } else {
                auditLogger.report(CONSTS.LogCategory.STORAGE, CONSTS.Severity.ALERT, "ArchiveUserFail", userId);
                reject();
              }
            });
          }
        })
      } else {
        this.retrieveUserRecords(userId, (records) => {
          let promises = [];
          for (let key in records) {
            if (records[key] !== null)
              promises.push(this.sessionData.removeKeys([key]).then(() => {
                return this.sessionData.restoreKey(key, 0, <any>Buffer.from(records[key]))
              }));
          }
          Promise.all(promises).then(() => {
            this.sessionData.deleteHashValue(CONSTS.SET_ALL_ARCHIVE_USERS,
              userId).then(() => {
                resolve();
              })
          }, () => {
            auditLogger.report(CONSTS.LogCategory.STORAGE, CONSTS.Severity.CRITICAL, "RestoreUsersFail", userId);
            reject();
          })
        })
      }
    })
  }

  isUserArchived(userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.sessionData.getHashValue(CONSTS.SET_ALL_ARCHIVE_USERS, userId).then((data?: string) => {
        if (!data)
          resolve(false);
        else {
          resolve("t" === data);
        }
      }).catch((e) => {
        reject(e);
      })
    })
  }
}
