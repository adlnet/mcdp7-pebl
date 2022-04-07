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
import { SessionDataManager } from "../interfaces/sessionDataManager";
import { MessageManager } from "../interfaces/messageManager";

export class DefaultMessageManager extends PeBLPlugin implements MessageManager {

  // private sessionData: SessionDataManager;

  constructor(sessionData: SessionDataManager) {
    super();
    // this.sessionData = sessionData;
    // this.addMessageTemplate(new MessageTemplate("getMessages",
    //   this.validateGetMessages.bind(this),
    //   this.authorizeGetMessages.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.getMessages(payload.identity, payload.timestamp, dispatchCallback);
    //   }));

    // this.addMessageTemplate(new MessageTemplate("saveMessages",
    //   this.validateSaveMessages.bind(this),
    //   this.authorizeSaveMessages.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.saveMessages(payload.identity, payload.messages, dispatchCallback);
    //   }));

    // this.addMessageTemplate(new MessageTemplate("deleteMessage",
    //   this.validateDeleteMessages.bind(this),
    //   this.authorizeDeleteMessages.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.deleteMessage(payload.identity, payload.xId, dispatchCallback);
    //   }));
  }

  // validateGetMessages(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // authorizeGetMessages(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // validateSaveMessages(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // authorizeSaveMessages(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // validateDeleteMessages(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // authorizeDeleteMessages(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // getMessages(identity: string, timestamp: number, callback: ((messages: (Message | Voided)[]) => void)): void {
  //   this.sessionData.getValuesGreaterThanTimestamp(generateTimestampForUserId(identity), timestamp, (data) => {
  //     this.sessionData.getHashMultiField(generateUserMessagesKey(identity), data, (result) => {
  //       callback(result.map(function(x) {
  //         let obj = JSON.parse(x);
  //         if (Message.is(obj))
  //           return new Message(obj);
  //         else
  //           return new Voided(obj);
  //       }));
  //     });
  //   });
  // }

  // saveMessages(identity: string, messages: Message[], callback: ((success: boolean) => void)): void {
  //   let arr = [];
  //   let date = new Date();
  //   for (let message of messages) {
  //     message.stored = date.toISOString();
  //     let messageStr = JSON.stringify(message);
  //     arr.push(generateMessagesKey(message.id));
  //     arr.push(messageStr);
  //     this.sessionData.queueForLrs(messageStr);
  //     this.sessionData.addTimestampValue(generateTimestampForUserId(identity), date.getTime(), message.id);
  //     this.sessionData.broadcast(generateBroadcastQueueForUserId(identity), JSON.stringify(new ServiceMessage(identity, {
  //       requestType: "newMessage",
  //       data: message
  //     })));
  //   }
  //   this.sessionData.setHashValues(generateUserMessagesKey(identity), arr);
  //   callback(true);
  // }

  // deleteMessage(identity: string, id: string, callback: ((success: boolean) => void)): void {
  //   this.sessionData.getHashValue(generateUserMessagesKey(identity), generateMessagesKey(id), (data) => {
  //     if (data) {
  //       this.sessionData.queueForLrsVoid(data);
  //       let voided = new Message(JSON.parse(data)).toVoidRecord();
  //       this.sessionData.addTimestampValue(generateTimestampForUserId(identity), new Date(voided.stored).getTime(), voided.id);
  //       this.sessionData.setHashValues(generateUserMessagesKey(identity), [voided.id, JSON.stringify(voided)]);
  //       this.sessionData.broadcast(generateBroadcastQueueForUserId(identity), JSON.stringify(new ServiceMessage(identity, {
  //         requestType: "newMessage",
  //         data: voided
  //       })));
  //     }
  //     this.sessionData.deleteHashValue(generateUserMessagesKey(identity),
  //       generateMessagesKey(id), (result: boolean) => {
  //         if (!result) {
  //           auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelMsgFail", identity, id);
  //         }
  //         callback(result);
  //       });
  //   });
  // }
}
