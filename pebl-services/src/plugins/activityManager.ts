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
import { ActivityManager } from "../interfaces/activityManager";
import { SessionDataManager } from "../interfaces/sessionDataManager";

export class DefaultActivityManager extends PeBLPlugin implements ActivityManager {
  // private sessionData: SessionDataManager;

  constructor(sessionData: SessionDataManager) {
    super();
    // this.sessionData = sessionData;
    // this.addMessageTemplate(new MessageTemplate("getActivities",
    //   this.validateGetActivities.bind(this),
    //   this.authorizeGetActivities.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.getActivities(payload.identity, dispatchCallback);
    //   }));

    // this.addMessageTemplate(new MessageTemplate("saveActivities",
    //   this.validateSaveActivities.bind(this),
    //   this.authorizeSaveActivities.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.saveActivities(payload.identity, payload.activities, dispatchCallback);
    //   }));

    // this.addMessageTemplate(new MessageTemplate("deleteActivity",
    //   this.validateDeleteActivity.bind(this),
    //   this.authorizeDeleteActivity.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.deleteActivity(payload.identity, payload.xId, dispatchCallback);
    //   }));

    // this.addMessageTemplate(new MessageTemplate("getActivityEvents",
    //   this.validateGetActivityEvents.bind(this),
    //   this.authorizeGetActivityEvents.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.getActivityEvents(payload.identity, dispatchCallback);
    //   }));

    // this.addMessageTemplate(new MessageTemplate("saveActivityEvents",
    //   this.validateSaveActivityEvents.bind(this),
    //   this.authorizeSaveActivityEvents.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.saveActivityEvents(payload.identity, payload.events, dispatchCallback);
    //   }));

    // this.addMessageTemplate(new MessageTemplate("deleteActivityEvent",
    //   this.validateDeleteActivityEvent.bind(this),
    //   this.authorizeDeleteActivityEvent.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.deleteActivityEvent(payload.identity, payload.xId, dispatchCallback);
    //   }));
  }

  // validateGetActivities(payload: { [key: string]: any }): boolean {
  //   //TODO
  //   return false;
  // }

  // authorizeGetActivities(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // validateSaveActivities(payload: { [key: string]: any }): boolean {
  //   //TODO
  //   return false;
  // }

  // authorizeSaveActivities(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // validateDeleteActivity(payload: { [key: string]: any }): boolean {
  //   //TODO
  //   return false;
  // }

  // authorizeDeleteActivity(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // validateGetActivityEvents(payload: { [key: string]: any }): boolean {
  //   //TODO
  //   return false;
  // }

  // authorizeGetActivityEvents(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // validateSaveActivityEvents(payload: { [key: string]: any }): boolean {
  //   //TODO
  //   return false;
  // }

  // authorizeSaveActivityEvents(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // validateDeleteActivityEvent(payload: { [key: string]: any }): boolean {
  //   //TODO
  //   return false;
  // }

  // authorizeDeleteActivityEvent(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // getActivities(identity: string, callback: ((activities: Activity[]) => void)): void {
  //   this.sessionData.getHashValues(generateUserActivitiesKey(identity),
  //     (result: string[]) => {
  //       callback(result.map(function(x) {
  //         return new Activity(JSON.parse(x));
  //       }));
  //     });
  // }

  // saveActivities(identity: string, activities: Activity[], callback: ((success: boolean) => void)): void {
  //   let arr = [];
  //   for (let activity of activities) {
  //     let activityStr = JSON.stringify(activity);
  //     arr.push(generateActivitiesKey(activity.id));
  //     arr.push(activityStr);
  //     this.sessionData.queueForLrs(activityStr);
  //   }
  //   this.sessionData.setHashValues(generateUserActivitiesKey(identity), arr);
  //   callback(true);
  // }

  // deleteActivity(identity: string, id: string, callback: ((success: boolean) => void)): void {
  //   this.sessionData.deleteHashValue(generateUserActivitiesKey(identity),
  //     generateActivitiesKey(id),
  //     (result: boolean) => {
  //       if (!result) {
  //         auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelActivityFail", identity, id);
  //       }
  //       callback(result);
  //     });
  // }

  // getActivityEvents(identity: string, callback: ((events: ProgramAction[]) => void)): void {
  //   this.sessionData.getHashValues(generateUserActivityEventsKey(identity),
  //     (result: string[]) => {
  //       callback(result.map(function(x) {
  //         return new ProgramAction(JSON.parse(x));
  //       }));
  //     });
  // }

  // saveActivityEvents(identity: string, events: ProgramAction[], callback: ((success: boolean) => void)): void {
  //   let arr = [];
  //   for (let event of events) {
  //     let eventStr = JSON.stringify(event);
  //     arr.push(generateActivityEventsKey(event.id));
  //     arr.push(eventStr);
  //     this.sessionData.queueForLrs(eventStr);
  //   }
  //   this.sessionData.setHashValues(generateUserActivityEventsKey(identity), arr);
  //   callback(true);
  // }

  // deleteActivityEvent(identity: string, id: string, callback: ((success: boolean) => void)): void {
  //   this.sessionData.getHashValue(generateUserActivityEventsKey(identity), generateActivityEventsKey(id), (data) => {
  //     if (data) {
  //       this.sessionData.queueForLrsVoid(data);
  //     }
  //     this.sessionData.deleteHashValue(generateUserActivitiesKey(identity),
  //       generateActivityEventsKey(id), (result: boolean) => {
  //         if (!result) {
  //           auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelActivityEvtFail", identity, id);
  //         }
  //         callback(result);
  //       });
  //   });
  // }
}
