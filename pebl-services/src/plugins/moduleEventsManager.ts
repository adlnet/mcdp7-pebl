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
import { ModuleEventsManager } from "../interfaces/moduleEventsManager";
import { ModuleEvent, ModuleRating, ModuleFeedback, ModuleExample, ModuleExampleRating, ModuleExampleFeedback, ModuleRemovedEvent } from "../models/moduleEvent";
import { generateUserModuleEventsKey, generateModuleEventsKey, LogCategory, Severity } from "../utils/constants";
import { MessageTemplate } from "../models/messageTemplate";
import { PermissionSet } from "../models/permission";
import { auditLogger } from "../main";

export class DefaultModuleEventsManager extends PeBLPlugin implements ModuleEventsManager {
  private sessionData: SessionDataManager;

  constructor(sessionData: SessionDataManager) {
    super();
    this.sessionData = sessionData;

    this.addMessageTemplate(new MessageTemplate("getModuleEvents",
      this.validateGetModuleEvents.bind(this),
      this.authorizeGetModuleEvents.bind(this),
      (payload: { [key: string]: any }) => {
        return this.getModuleEvents(payload.identity);
      }));

    this.addMessageTemplate(new MessageTemplate("saveModuleEvents",
      this.validateSaveModuleEvents.bind(this),
      this.authorizeSaveModuleEvents.bind(this),
      (payload: { [key: string]: any }) => {
        return this.saveModuleEvents(payload.identity, payload.events);
      }));

    this.addMessageTemplate(new MessageTemplate("deleteModuleEvent",
      this.validateDeleteModuleEvent.bind(this),
      this.authorizeDeleteModuleEvent.bind(this),
      (payload: { [key: string]: any }) => {
        return this.deleteModuleEvent(payload.identity, payload.xId);
      }));
  }

  validateGetModuleEvents(payload: { [key: string]: any }): boolean {
    return true;
  }

  authorizeGetModuleEvents(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
    let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

    return canUser || canGroup;
  }

  validateSaveModuleEvents(payload: { [key: string]: any }): boolean {
    if (payload.events && Array.isArray(payload.events) && payload.events.length > 0) {
      for (let event in payload.events) {
        if (ModuleRating.is(payload.events[event]))
          payload.events[event] = new ModuleRating(payload.events[event]);
        else if (ModuleFeedback.is(payload.events[event]))
          payload.events[event] = new ModuleFeedback(payload.events[event]);
        else if (ModuleExample.is(payload.events[event]))
          payload.events[event] = new ModuleExample(payload.events[event]);
        else if (ModuleExampleRating.is(payload.events[event]))
          payload.events[event] = new ModuleExampleRating(payload.events[event]);
        else if (ModuleExampleFeedback.is(payload.events[event]))
          payload.events[event] = new ModuleExampleFeedback(payload.events[event]);
        else if (ModuleRemovedEvent.is(payload.events[event]))
          payload.events[event] = new ModuleRemovedEvent(payload.events[event]);
        else
          return false;
      }
      return true;
    }
    return false;
  }

  authorizeSaveModuleEvents(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
    let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

    return canUser || canGroup;
  }

  validateDeleteModuleEvent(payload: { [key: string]: any }): boolean {
    if (payload.xId && typeof payload.xId == "string")
      return true;
    return false;
  }

  authorizeDeleteModuleEvent(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
    let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

    return canUser || canGroup;
  }

  async getModuleEvents(identity: string): Promise<ModuleEvent[]> {
    let result: string[] = await this.sessionData.getHashValues(generateUserModuleEventsKey(identity));
    return result.map(function(x) {
      return new ModuleEvent(JSON.parse(x));
    });
  }

  async saveModuleEvents(identity: string, events: ModuleEvent[]): Promise<true> {
    let arr = [];
    for (let stmt of events) {
      arr.push(JSON.stringify(stmt));
    }
    await this.sessionData.queueForLrs(arr);
    return true;
  }

  async deleteModuleEvent(identity: string, id: string): Promise<boolean> {
    let data = await this.sessionData.getHashValue(generateUserModuleEventsKey(identity), generateModuleEventsKey(id));
    if (data) {
      await this.sessionData.queueForLrsVoid(data);
    }
    let result = await this.sessionData.deleteHashValue(generateUserModuleEventsKey(identity), generateModuleEventsKey(id));
    if (!result) {
      auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelModuleEvent", identity, id);
    }
    return result;
  }
}
