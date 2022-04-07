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
import { NavigationManager } from "../interfaces/navigationManager";
import { SessionDataManager } from "../interfaces/sessionDataManager";
import { MessageTemplate } from "../models/messageTemplate";
import { PermissionSet } from "../models/permission";
import { Navigation } from "../models/navigation";

export class DefaultNavigationManager extends PeBLPlugin implements NavigationManager {
  private sessionData: SessionDataManager;

  constructor(sessionData: SessionDataManager) {
    super();
    this.sessionData = sessionData;
    // this.addMessageTemplate(new MessageTemplate("getNavigations",
    //   this.validateGetNavigations.bind(this),
    //   this.authorizeGetNavigations.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.getNavigations(payload.identity, dispatchCallback);
    //   }));

    this.addMessageTemplate(new MessageTemplate("saveNavigations",
      this.validateSaveNavigations.bind(this),
      this.authorizeSaveNavigations.bind(this),
      (payload: { [key: string]: any }) => {
        return this.saveNavigations(payload.identity, payload.navigations);
      }));

    // this.addMessageTemplate(new MessageTemplate("deleteNavigation",
    //   this.validateDeleteNavigation.bind(this),
    //   this.authorizeDeleteNavigation.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.deleteNavigation(payload.identity, payload.xId, dispatchCallback);
    //   }));
  }

  // validateGetNavigations(payload: { [key: string]: any }): boolean {
  //   return true;
  // }

  // authorizeGetNavigations(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
  //   let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

  //   return canUser || canGroup;
  // }

  validateSaveNavigations(payload: { [key: string]: any }): boolean {
    if (payload.navigations && Array.isArray(payload.navigations) && payload.navigations.length > 0) {
      for (let nav in payload.navigations) {
        if (Navigation.is(payload.navigations[nav]))
          payload.navigations[nav] = new Navigation(payload.navigations[nav]);
        else
          return false;
      }
      return true;
    }
    return false;
  }

  authorizeSaveNavigations(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    if (permissions.user[payload.requestType]) {
      for (let key in payload.navigations) {
        let obj = payload.navigations[key];
        let identity = (<Navigation>obj).getActorId();
        let canUser = (username == identity)
        // let canGroup = permissions.group[obj.identity] && permissions.group[obj.identity][obj.requestType]

        if (!(canUser // || canGroup
        ))
          return false;
      }
    }

    return true;
  }

  // validateDeleteNavigation(payload: { [key: string]: any }): boolean {
  //   if (payload.xId && typeof payload.xId === "string")
  //     return true;
  //   return false;
  // }

  // authorizeDeleteNavigation(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
  //   let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

  //   return canUser || canGroup;
  // }

  // getNavigations(identity: string, callback: ((navigations: Navigation[]) => void)): void {
  //   this.sessionData.getHashValues(generateUserNavigationsKey(identity),
  //     (result: string[]) => {
  //       callback(result.map((x) => new Navigation(JSON.parse(x))));
  //     })
  // }

  async saveNavigations(identity: string, navigations: Navigation[]): Promise<true> {
    let arr = [];
    for (let navigation of navigations) {
      arr.push(JSON.stringify(navigation));
    }
    await this.sessionData.queueForLrs(arr);
    return true;
  }

  // deleteNavigation(identity: string, id: string, callback: ((success: boolean) => void)): void {
  //   this.sessionData.getHashValue(generateUserNavigationsKey(identity), generateNavigationsKey(id), (data) => {
  //     if (data) {
  //       this.sessionData.queueForLrsVoid(data);
  //     }
  //     this.sessionData.deleteHashValue(generateUserNavigationsKey(identity),
  //       generateNavigationsKey(id), (result: boolean) => {
  //         if (!result) {
  //           auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelNavigationFail", identity, id);
  //         }
  //         callback(result);
  //       });
  //   });
  // }

}
