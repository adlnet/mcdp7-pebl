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
import { ActionManager } from "../interfaces/actionManager";
import { SessionDataManager } from "../interfaces/sessionDataManager";
import { Action } from "../models/action";
import { PermissionSet } from "../models/permission";
import { MessageTemplate } from "../models/messageTemplate";
import { SqlDataStore } from "../interfaces/sqlDataStore";

export class DefaultActionManager extends PeBLPlugin implements ActionManager {
  private sessionData: SessionDataManager;
  private sqlData: SqlDataStore;

  constructor(sessionData: SessionDataManager, sqlData: SqlDataStore) {
    super();
    this.sessionData = sessionData;
    this.sqlData = sqlData;
    // this.addMessageTemplate(new MessageTemplate("getActions",
    //   this.validateGetActions.bind(this),
    //   this.authorizeGetActions.bind(this),
    //   (payload: { [key: string]: any }) => {
    //     this.getActions(payload.identity, dispatchCallback);
    //   }));

    this.addMessageTemplate(new MessageTemplate("saveActions",
      this.validateSaveActions.bind(this),
      this.authorizeSaveActions.bind(this),
      (payload: { [key: string]: any }) => {
        return this.saveActions(payload.identity, payload.actions);
      }));

    this.addMessageTemplate(new MessageTemplate("getChapterCompletionPercentages",
      this.validateGetChapterCompletionPercentages.bind(this),
      this.authorizeGetChapterCompletionPercentages.bind(this),
      (payload: { [key: string]: any }) => {
        return this.getChapterCompletionPercentages(payload.identity, payload.params)
      }))

    // this.addMessageTemplate(new MessageTemplate("deleteAction",
    //   this.validateDeleteAction.bind(this),
    //   this.authorizeDeleteAction.bind(this),
    //   (payload: { [key: string]: any }) => {
    //     this.deleteAction(payload.identity, payload.xId, dispatchCallback);
    //   }));
  }

  // validateGetActions(payload: { [key: string]: any }): boolean {
  //   //TODO
  //   return true;
  // }

  // authorizeGetActions(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
  //   let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

  //   return canUser || canGroup;
  // }

  validateGetChapterCompletionPercentages(payload: { [key: string]: any }): boolean {
    if (payload.params && Array.isArray(payload.params) && payload.params.length > 0) {
      for (let params of payload.params) {
        if (!params.bookId || typeof params.bookId !== 'string' || params.bookId.length === 0)
          return false;
        if (!params.teamId || typeof params.teamId !== 'string' || params.teamId.length === 0)
          return false;
        if (!params.classId || typeof params.classId !== 'string' || params.classId.length == 0)
          return false;
        if (!params.timestamp || typeof params.timestamp !== 'number')
          return false;
      }
      return true;
    }
    return false;
  }

  authorizeGetChapterCompletionPercentages(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    if (username !== payload.identity)
      return false;

    for (let params of payload.params) {
      if (!permissions.group[params.classId] || !permissions.group[params.classId][payload.requestType])
        return false;
    }

    return true;
  }

  validateSaveActions(payload: { [key: string]: any }): boolean {
    if (payload.actions && Array.isArray(payload.actions) && payload.actions.length > 0) {
      for (let action in payload.actions) {
        if (Action.is(payload.actions[action])) {
          payload.actions[action] = new Action(payload.actions[action]);
        }
        else
          return false;
      }
      return true;
    }
    return false;
  }

  authorizeSaveActions(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    if (permissions.user[payload.requestType]) {
      for (let key in payload.actions) {
        let obj = payload.actions[key];
        let identity = (<Action>obj).getActorId();
        let canUser = (username == identity);
        // let canGroup = permissions.group[identity] && permissions.group[identity][obj.requestType]

        if (!(canUser // || canGroup
        ))
          return false;
      }
    }

    return true;
  }

  // validateDeleteAction(payload: { [key: string]: any }): boolean {
  //   if (payload.xId && typeof payload.xId === "string")
  //     return true;
  //   return false;
  // }

  // authorizeDeleteAction(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
  //   let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

  //   return canUser || canGroup;
  // }

  // getActions(identity: string, callback: ((actions: Action[]) => void)): void {
  //   this.sessionData.getHashValues(generateUserActionsKey(identity),
  //     (result: string[]) => {
  //       callback(result.map(function(x) {
  //         return new Action(JSON.parse(x));
  //       }));
  //     });
  // }

  async getChapterCompletionPercentages(identity: string, params: { [key: string]: any }[]): Promise<{ [key: string]: any }> {
    if (params.length > 0) {
      let logins = await this.sqlData.getLogins(params[0].teamId, params[0].classId, params[0].timestamp);
      if (logins.length > 0) {
        let completions = await this.sqlData.getCompletions(params[0].bookId, params[0].teamId, params[0].classId, params[0].timestamp);
        let completionsByChapter = {} as { [key: string]: any };
        for (let completion of completions) {
          if (!completionsByChapter[completion.chapter])
            completionsByChapter[completion.chapter] = 0;
          completionsByChapter[completion.chapter]++;
        }

        for (let chapter in completionsByChapter) {
          completionsByChapter[chapter] = (completionsByChapter[chapter] / logins.length) * 100;
        }

        return { data: completionsByChapter };
      } else {
        return { data: {} };
      }
    }
    return {};
  }

  async saveActions(identity: string, actions: Action[]): Promise<true> {
    let arr = [];
    let completions = [];
    for (let action of actions) {
      arr.push(JSON.stringify(action));
      if (Action.isCompletion(action))
        completions.push(action);
    }
    await this.sessionData.queueForLrs(arr);
    if (completions.length > 0) {
      await this.sqlData.insertCompletions(completions);
    }
    return true;
  }

  // deleteAction(identity: string, id: string, callback: ((success: boolean) => void)): void {
  //   this.sessionData.getHashValue(generateUserActionsKey(identity), generateActionsKey(id), (data) => {
  //     if (data) {
  //       this.sessionData.queueForLrsVoid(data);
  //     }
  //     this.sessionData.deleteHashValue(generateUserActionsKey(identity),
  //       generateUserActionsKey(id), (result: boolean) => {
  //         if (!result) {
  //           auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelActionFail", identity, id);
  //           callback(false);
  //         } else
  //           callback(true);
  //       });
  //   });
  // }
}
