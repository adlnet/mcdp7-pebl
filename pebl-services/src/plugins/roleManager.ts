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
import { RoleManager } from "../interfaces/roleManager";
import { Role } from "../models/role";
import { SessionDataManager } from "../interfaces/sessionDataManager";
import { SET_ALL_ROLES, generateRoleToUsersKey, LogCategory, Severity } from "../utils/constants";
import { UserManager } from "../interfaces/userManager";
import { MessageTemplate } from "../models/messageTemplate";
import { PermissionSet } from "../models/permission";
import { auditLogger } from "../main";

export class DefaultRoleManager extends PeBLPlugin implements RoleManager {

  private sessionData: SessionDataManager;
  private userManager: UserManager;

  constructor(sessionData: SessionDataManager, userManager: UserManager) {
    super();
    this.sessionData = sessionData;
    this.userManager = userManager;
    this.addMessageTemplate(new MessageTemplate("addRole",
      this.validateAddRole.bind(this),
      this.authorizeAddRole.bind(this),
      (payload: { [key: string]: any }) => {
        return this.addRole(payload.id, payload.name, payload.permissions);
      }));

    this.addMessageTemplate(new MessageTemplate("deleteRole",
      this.validateDeleteRole.bind(this),
      this.authorizeDeleteRole.bind(this),
      (payload: { [key: string]: any }) => {
        return this.deleteRole(payload.id);
      }));

    this.addMessageTemplate(new MessageTemplate("updateRole",
      this.validateUpdateRole.bind(this),
      this.authorizeUpdateRole.bind(this),
      (payload: { [key: string]: any }) => {
        return this.updateRole(payload.id, payload.name, payload.permissions);
      }));

    this.addMessageTemplate(new MessageTemplate("getRoles",
      this.validateGetRole.bind(this),
      this.authorizeGetRoles.bind(this),
      (payload: { [key: string]: any }) => {
        return this.getRoles();
      }));
  }

  validateAddRole(payload: { [key: string]: any }): boolean {
    return false;
  }

  authorizeAddRole(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    return false;
  }

  validateDeleteRole(payload: { [key: string]: any }): boolean {
    return false;
  }

  authorizeDeleteRole(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    return false;
  }

  validateUpdateRole(payload: { [key: string]: any }): boolean {
    return false;
  }

  authorizeUpdateRole(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    return false;
  }

  validateGetRole(payload: { [key: string]: any }): boolean {
    return false;
  }

  authorizeGetRole(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    return false;
  }

  validateGetRoles(payload: { [key: string]: any }): boolean {
    return false;
  }

  authorizeGetRoles(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    return false;
  }

  // validateCopyRole(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // copyRole(id: string, newName: string): void {

  // }

  //Add a role based on a set of permissions
  async addRole(id: string, name: string, permissions: string[]): Promise<true> {
    let p: { [key: string]: boolean } = {};
    for (let permission of permissions) {
      p[permission] = true;
    }
    await this.sessionData.setHashValue(SET_ALL_ROLES,
      id,
      JSON.stringify({
        name: name,
        permissions: p
      }));
    return true;
  }

  //Remove a role    
  async deleteRole(id: string): Promise<boolean> {
    let deleted = await this.sessionData.deleteHashValue(SET_ALL_ROLES, id);
    if (!deleted) {
      auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelRoleFail", id);
    }
    let modified = Date.now() + "";
    let userIds: string[] = await this.sessionData.getHashValues(generateRoleToUsersKey(id));
    for (let userId of userIds) {
      await this.userManager.setLastModifiedPermissions(userId, modified);
    }
    await this.sessionData.deleteValue(generateRoleToUsersKey(id));
    return deleted;
  }

  //Updates the permission set and/or name of a role    
  async updateRole(id: string, name?: string, permissions?: string[]): Promise<true> {
    await this.sessionData.setHashValue(SET_ALL_ROLES,
      id,
      JSON.stringify({
        name: name,
        permissions: permissions
      }));
    let modified = Date.now() + "";
    let userIds: string[] = await this.sessionData.getHashValues(generateRoleToUsersKey(id));
    for (let userId of userIds) {
      await this.userManager.setLastModifiedPermissions(userId, modified);
    }
    return true;
  }

  async getMultiRole(ids: string[]): Promise<Role[]> {
    let data: string[] = await this.sessionData.getHashMultiField(SET_ALL_ROLES, ids);
    return (data.map((role) => Role.convert(role)));
  }

  //Get a role with the specified id
  async getRole(id: string): Promise<Role> {
    let rawData: string | undefined = await this.sessionData.getHashValue(SET_ALL_ROLES, id);
    let data: string;
    if (rawData === undefined) {
      data = "{}";
    } else {
      data = rawData;
    }
    return Role.convert(data);
  }

  //Get all the roles in the system    
  async getRoles(): Promise<Role[]> {
    let data: string[] = await this.sessionData.getHashValues(SET_ALL_ROLES);
    return data.map((x) => Role.convert(x));
  }

  async getUsersByRole(roleId: string): Promise<string[]> {
    return await this.sessionData.getSetValues(generateRoleToUsersKey(roleId));
  }
}
