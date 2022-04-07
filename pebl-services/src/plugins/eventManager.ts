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
import { XApiStatement } from "../models/xapiStatement";
import { EventManager } from "../interfaces/eventManager";
import { SessionDataManager } from "../interfaces/sessionDataManager";
import { MessageTemplate } from "../models/messageTemplate";
import { PermissionSet } from "../models/permission";

export class DefaultEventManager extends PeBLPlugin implements EventManager {

  private sessionData: SessionDataManager;

  constructor(sessionData: SessionDataManager) {
    super();
    this.sessionData = sessionData;
    // this.addMessageTemplate(new MessageTemplate("getEvents",
    //   this.validateGetEvents.bind(this),
    //   this.authorizeGetEvents.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.getEvents(payload.identity, dispatchCallback);
    //   }));

    this.addMessageTemplate(new MessageTemplate("saveEvents",
      this.validateSaveEvents.bind(this),
      this.authorizeSaveEvents.bind(this),
      (payload: { [key: string]: any }) => {
        return this.saveEvents(payload.identity, payload.stmts);
      }));

    // this.addMessageTemplate(new MessageTemplate("deleteEvent",
    //   this.validateDeleteEvent.bind(this),
    //   this.authorizeDeleteEvent.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.deleteEvent(payload.identity, payload.xId, dispatchCallback);
    //   }));
  }

  // validateGetEvents(payload: { [key: string]: any }): boolean {
  //   return true;
  // }

  // authorizeGetEvents(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
  //   let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

  //   return canUser || canGroup;
  // }

  validateSaveEvents(payload: { [key: string]: any }): boolean {
    if (payload.smts && Array.isArray(payload.smts) && payload.smts.length > 0) {
      for (let event in payload.smts) {
        if (XApiStatement.is(payload.smts[event]))
          payload.smts[event] = new XApiStatement(payload.smts[event]);
        else
          return false;
      }
      return true;
    }
    return false;
  }

  authorizeSaveEvents(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
    let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

    return canUser || canGroup;
  }

  // validateDeleteEvent(payload: { [key: string]: any }): boolean {
  //   if (payload.xId && typeof payload.xId == "string")
  //     return true;
  //   return false;
  // }

  // authorizeDeleteEvent(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
  //   let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

  //   return canUser || canGroup;
  // }

  // getEventsForBook(identity: string, book: string): XApiStatement[]; //Retrieve all events for this user made within the specific book

  //Retrieve all events for this user
  // getEvents(identity: string, callback: ((stmts: XApiStatement[]) => void)): void {
  //   this.sessionData.getHashValues(generateUserEventsKey(identity),
  //     (result: string[]) => {
  //       callback(result.map(function(x) {
  //         return new XApiStatement(JSON.parse(x));
  //       }));
  //     });
  // }

  // saveEventsForBook(identity: string, book: string, events: XApiStatement[]): void; // Store the events for this user made within the specific book

  // Store the events for this user
  async saveEvents(identity: string, stmts: XApiStatement[]): Promise<true> {
    let arr = [];
    for (let stmt of stmts) {
      arr.push(JSON.stringify(stmt));
    }
    this.sessionData.queueForLrs(arr);
    return true;
  }

  //Removes the event with the specified id
  // deleteEvent(identity: string, id: string, callback: ((success: boolean) => void)): void {
  //   this.sessionData.getHashValue(generateUserEventsKey(identity), generateEventsKey(id), (data) => {
  //     if (data) {
  //       this.sessionData.queueForLrsVoid(data);
  //     }
  //     this.sessionData.deleteHashValue(generateUserEventsKey(identity),
  //       generateEventsKey(id), (result: boolean) => {
  //         if (!result) {
  //           auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelEventFail", identity, id);
  //         }
  //         callback(result);
  //       });
  //   });
  // }
}
