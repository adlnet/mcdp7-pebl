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

import { GroupManager } from "../interfaces/groupManager";
import { UserManager } from "../interfaces/userManager";
import { RoleManager } from "../interfaces/roleManager";
import { PluginManager } from "../interfaces/pluginManager";
import { PermissionSet } from "../models/permission";
import { Role } from "../models/role";
import { auditLogger } from "../main";
import { LogCategory, Severity } from "../utils/constants";

export class DefaultAuthorizationManager {

  private groupManager: GroupManager;
  private userManager: UserManager;
  private roleManager: RoleManager;
  private pluginManager: PluginManager;

  constructor(pluginManager: PluginManager, groupManager: GroupManager, userManager: UserManager, roleManager: RoleManager) {
    this.groupManager = groupManager;
    this.userManager = userManager;
    this.roleManager = roleManager;
    this.pluginManager = pluginManager;
  }

  assemblePermissionSet(identity: string, session: Express.Session): Promise<void> {
    return new Promise(async (resolve) => {
      let lastModified: string = await this.userManager.getLastModifiedPermissions(identity);

      if ((session.lastModifiedPermissions === undefined) || (lastModified != session.lastModifiedPermissions)) {
        let roleIds: string[] = await this.userManager.getUserRoles(identity);
        let groupIds: string[] = await this.groupManager.getUsersGroups(identity);
        let userPermissions: { [permission: string]: boolean } = {};
        let groupPermissions: { [groupName: string]: { [permission: string]: boolean } } = {};

        let roles: Role[] = await this.roleManager.getMultiRole(roleIds);
        for (let role of roles) {
          for (let permission of Object.keys(role.permissions)) {
            userPermissions[permission] = true;
          }
        }

        //TODO: Do this the right way
        // Get permissions based on role from keycloak attributes
        if (session.identity && session.identity.role) {
          for (let groupId of session.identity.groups) {
            if (!groupPermissions[groupId])
              groupPermissions[groupId] = {};

            if (session.identity.role === 'learner')
              this.setGroupPermissionsLearner(groupPermissions[groupId]);
            else if (session.identity.role === 'instructor')
              this.setGroupPermissionsInstructor(groupPermissions[groupId]);
            else if (session.identity.role === 'admin')
              this.setGroupPermissionsAdmin(groupPermissions[groupId]);
          }

          // //TODO: HARD CODING ADMIN USER PERMISSION
          // if (session.identity.role === 'admin') {
          //   userPermissions['uploadEpub'] = true;
          //   userPermissions['deleteEpub'] = true;
          // }

          // Trey: allowing deletes for anyone
          userPermissions['uploadEpub'] = true;
          userPermissions['deleteEpub'] = true;
        }

        for (let groupId of groupIds) {
          //TODO implement nested group permission resolution
          let roleIds: string[] = await this.groupManager.getGroupMemberUser(groupId, identity);
          let roles: Role[] = await this.roleManager.getMultiRole(roleIds);
          for (let role of roles) {
            for (let permission of Object.keys(role.permissions)) {
              if (groupId) {
                groupPermissions[groupId][permission] = true;
              }
            }
          }
        }
        session.lastModifiedPermissions = lastModified;
        session.permissions = new PermissionSet(userPermissions, groupPermissions);
        auditLogger.report(LogCategory.AUTH, Severity.INFO, "AssembledPermissions", session.id, roleIds);
        session.save(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  authorize(username: string,
    permissions: PermissionSet,
    payload: { [key: string]: any }): boolean {

    let messageTemplate = this.pluginManager.getMessageTemplate(payload.requestType);
    if (messageTemplate) {
      return messageTemplate.authorize(username, permissions, payload);
    }

    return false;
  }

  private setGroupPermissionsLearner(permissionsObj: { [key: string]: boolean }) {
    permissionsObj['getSharedAnnotations'] = true;
    permissionsObj['saveSharedAnnotations'] = true;
    permissionsObj['subscribeSharedAnnotations'] = true;
    permissionsObj['unsubscribeSharedAnnotations'] = true;

    permissionsObj['subscribeThread'] = true;
    permissionsObj['unsubscribeThread'] = true;
    permissionsObj['getThreadedMessages'] = true;
    permissionsObj['saveThreadedMessage'] = true;
    permissionsObj['reportThreadedMessage'] = true;
  }

  private setGroupPermissionsInstructor(permissionsObj: { [key: string]: boolean }) {
    permissionsObj['getSharedAnnotations'] = true;
    permissionsObj['saveSharedAnnotations'] = true;
    permissionsObj['deleteSharedAnnotation'] = true;
    permissionsObj['pinSharedAnnotation'] = true;
    permissionsObj['unpinSharedAnnotation'] = true;
    permissionsObj['subscribeSharedAnnotations'] = true;
    permissionsObj['unsubscribeSharedAnnotations'] = true;


    permissionsObj['subscribeThread'] = true;
    permissionsObj['unsubscribeThread'] = true;
    permissionsObj['getThreadedMessages'] = true;
    permissionsObj['saveThreadedMessage'] = true;
    permissionsObj['reportThreadedMessage'] = true;
    permissionsObj['deleteThreadedMessage'] = true;
    permissionsObj['pinThreadedMessage'] = true;
    permissionsObj['unpinThreadedMessage'] = true;


    permissionsObj['getChapterCompletionPercentages'] = true;
    permissionsObj['getMostAnsweredQuestions'] = true;
    permissionsObj['getLeastAnsweredQuestions'] = true;
    permissionsObj['getQuizAttempts'] = true;
    permissionsObj['getReportedThreadedMessages'] = true;
  }

  private setGroupPermissionsAdmin(permissionsObj: { [key: string]: boolean }) {
    permissionsObj['getSharedAnnotations'] = true;
    permissionsObj['saveSharedAnnotations'] = true;
    permissionsObj['deleteSharedAnnotation'] = true;
    permissionsObj['pinSharedAnnotation'] = true;
    permissionsObj['unpinSharedAnnotation'] = true;
    permissionsObj['subscribeSharedAnnotations'] = true;
    permissionsObj['unsubscribeSharedAnnotations'] = true;


    permissionsObj['subscribeThread'] = true;
    permissionsObj['unsubscribeThread'] = true;
    permissionsObj['getThreadedMessages'] = true;
    permissionsObj['saveThreadedMessage'] = true;
    permissionsObj['reportThreadedMessage'] = true;
    permissionsObj['deleteThreadedMessage'] = true;
    permissionsObj['pinThreadedMessage'] = true;
    permissionsObj['unpinThreadedMessage'] = true;

    permissionsObj['getChapterCompletionPercentages'] = true;
    permissionsObj['getMostAnsweredQuestions'] = true;
    permissionsObj['getLeastAnsweredQuestions'] = true;
    permissionsObj['getQuizAttempts'] = true;
    permissionsObj['getReportedThreadedMessages'] = true;
  }
}
