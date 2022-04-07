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
import { SessionManager } from "../interfaces/sessionManager";
import { Session } from "../models/session";
import { MessageTemplate } from "../models/messageTemplate";
import { PermissionSet } from "../models/permission";
import { SqlDataStore } from "../interfaces/sqlDataStore";

export class DefaultSessionManager extends PeBLPlugin implements SessionManager {
  private sessionData: SessionDataManager;
  private sqlData: SqlDataStore;

  constructor(sessionData: SessionDataManager, sqlData: SqlDataStore) {
    super();
    this.sessionData = sessionData;
    this.sqlData = sqlData;

    // this.addMessageTemplate(new MessageTemplate("getSessions",
    //   this.validateGetSessions.bind(this),
    //   this.authorizeGetSessions.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.getSessions(payload.identity, dispatchCallback);
    //   }));

    this.addMessageTemplate(new MessageTemplate("saveSessions",
      this.validateSaveSessions.bind(this),
      this.authorizeSaveSessions.bind(this),
      (payload: { [key: string]: any }) => {
        return this.saveSessions(payload.identity, payload.sessions);
      }));

    // this.addMessageTemplate(new MessageTemplate("deleteSession",
    //   this.validateDeleteSession.bind(this),
    //   this.authorizeDeleteSession.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.deleteSession(payload.identity, payload.xId, dispatchCallback);
    //   }));
  }

  // validateGetSessions(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // authorizeGetSessions(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  validateSaveSessions(payload: { [key: string]: any }): boolean {
    if (payload.sessions && (payload.sessions instanceof Array) && (payload.sessions.length > 0)) {
      for (let sessionIndex in payload.sessions) {
        let session = payload.sessions[sessionIndex];
        if (Session.is(session)) {
          payload.sessions[sessionIndex] = new Session(session);
        } else {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  authorizeSaveSessions(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    if (permissions.user[payload.requestType]) {
      for (let key in payload.sessions) {
        let obj = payload.sessions[key];
        let identity = (<Session>obj).getActorId();
        let canUser = (username == identity);

        if (!canUser)
          return false;
      }
      return true;
    }

    return false;
  }

  // validateDeleteSession(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // authorizeDeleteSession(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // getSessions(identity: string, callback: ((sessions: Session[]) => void)): void {
  //   this.sessionData.getHashValues(generateUserSessionsKey(identity),
  //     (result: string[]) => {
  //       callback(result.map(function(x) {
  //         return new Session(JSON.parse(x));
  //       }));
  //     });
  // }

  async saveSessions(identity: string, sessions: Session[]): Promise<true> {
    let logins = [];
    let arr = [];
    for (let session of sessions) {
      arr.push(JSON.stringify(session));
      if (Session.isLogin(session))
        logins.push(session);
    }
    await this.sessionData.queueForLrs(arr);
    if (logins.length > 0)
      await this.sqlData.insertLogins(logins);

    return true;
  }

  // deleteSession(identity: string, id: string, callback: ((success: boolean) => void)): void {
  //   this.sessionData.getHashValue(generateUserSessionsKey(identity), generateSessionsKey(id), (data) => {
  //     if (data) {
  //       this.sessionData.queueForLrsVoid(data);
  //     }
  //     this.sessionData.deleteHashValue(generateUserSessionsKey(identity),
  //       generateSessionsKey(id), (result: boolean) => {
  //         if (!result) {
  //           auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelMembershipFail", identity, id);
  //         }
  //         callback(result);
  //       });
  //   });
  // }
}
