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
import { ReferenceManager } from "../interfaces/referenceManager";
import { SessionDataManager } from "../interfaces/sessionDataManager";
import { Reference } from "../models/reference";
import { generateUserReferencesKey, generateReferencesKey, generateTimestampForReference, generateBroadcastQueueForUserId, LogCategory, Severity } from "../utils/constants";
import { MessageTemplate } from "../models/messageTemplate";
import { PermissionSet } from "../models/permission";
import { Voided } from "../models/xapiStatement";
import { ServiceMessage } from "../models/serviceMessage";
import { NotificationManager } from "../interfaces/notificationManager";
import { auditLogger } from "../main";

export class DefaultReferenceManager extends PeBLPlugin implements ReferenceManager {
  private sessionData: SessionDataManager;
  // private notificationManager: NotificationManager;

  constructor(sessionData: SessionDataManager, notificationManager: NotificationManager) {
    super();
    this.sessionData = sessionData;
    // this.notificationManager = notificationManager;
    this.addMessageTemplate(new MessageTemplate("getReferences",
      this.validateGetReferences.bind(this),
      this.authorizeGetReferences.bind(this),
      (payload: { [key: string]: any }) => {
        return this.getReferences(payload.identity, payload.timestamp);
      }));

    this.addMessageTemplate(new MessageTemplate("saveReferences",
      this.validateSaveReferences.bind(this),
      this.authorizeSaveReferences.bind(this),
      (payload: { [key: string]: any }) => {
        return this.saveReferences(payload.identity, payload.references);
      }));

    this.addMessageTemplate(new MessageTemplate("deleteReference",
      this.validateDeleteReference.bind(this),
      this.authorizeDeleteReference.bind(this),
      (payload: { [key: string]: any }) => {
        return this.deleteReference(payload.identity, payload.xId);
      }));
  }

  validateGetReferences(payload: { [key: string]: any }): boolean {
    //TODO
    return true;
  }

  authorizeGetReferences(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
    let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

    return canUser || canGroup;
  }

  validateSaveReferences(payload: { [key: string]: any }): boolean {
    if (payload.references && (payload.references instanceof Array) && (payload.references.length > 0)) {
      for (let i in payload.references) {
        let ref = payload.references[i];
        if (Reference.is(ref)) {
          payload.references[i] = new Reference(ref);
        } else {
          return false;
        }
      }
    }

    return true;
  }

  authorizeSaveReferences(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
    let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

    return canUser || canGroup;
  }

  validateDeleteReference(payload: { [key: string]: any }): boolean {
    if (typeof (payload.xId) === "string") {
      return true;
    }

    return false;
  }

  authorizeDeleteReference(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
    let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

    return canUser || canGroup;
  }

  async getReferences(identity: string, timestamp: number): Promise<{ [key: string]: any }> {
    let data = await this.sessionData.getValuesGreaterThanTimestamp(generateTimestampForReference(identity), timestamp);
    let result = await this.sessionData.getHashMultiField(generateUserReferencesKey(identity), data.map((x) => generateReferencesKey(x)));
    return result.map(function(x) {
      let obj = JSON.parse(x);
      if (Reference.is(obj))
        return new Reference(obj);
      else
        return new Voided(obj);
    });
  }

  async saveReferences(identity: string, references: Reference[]): Promise<true> {
    let arr = [];
    let date = new Date();
    let notifs = [];
    for (let stmt of references) {
      stmt.stored = date.toISOString();
      notifs.push(stmt);
      let stmtStr = JSON.stringify(stmt);
      arr.push(generateReferencesKey(stmt.id));
      arr.push(stmtStr);
      await this.sessionData.queueForLrs(stmtStr);
      await this.sessionData.addTimestampValue(generateTimestampForReference(identity), date.getTime(), stmt.id);
      await this.sessionData.broadcast(generateBroadcastQueueForUserId(identity), JSON.stringify(new ServiceMessage(identity, {
        requestType: "newReference",
        data: stmt
      })));
    }
    // this.notificationManager.saveNotifications(identity, notifs, (success) => { });
    await this.sessionData.setHashValues(generateUserReferencesKey(identity), arr);
    return true;
  }

  async deleteReference(identity: string, id: string): Promise<boolean> {
    let data = await this.sessionData.getHashValue(generateUserReferencesKey(identity), generateReferencesKey(id));
    if (data) {
      await this.sessionData.queueForLrsVoid(data);
      let voided = new Reference(JSON.parse(data)).toVoidRecord();
      await this.sessionData.addTimestampValue(generateTimestampForReference(identity), new Date(voided.stored).getTime(), voided.id);
      await this.sessionData.setHashValue(generateUserReferencesKey(identity), generateReferencesKey(voided.id), JSON.stringify(voided));
    }
    let timeDelete = await this.sessionData.deleteSortedTimestampMember(generateTimestampForReference(identity), id) > 0;
    let refDelete = await this.sessionData.deleteHashValue(generateUserReferencesKey(identity), generateReferencesKey(id));
    if (!refDelete || !timeDelete) {
      auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelReferenceFail", identity, id);
    }
    return timeDelete && refDelete;
  }
}
