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

import { UserManager } from "../interfaces/userManager";
import { UserProfile } from "../models/userProfile";
import { PeBLPlugin } from "../models/peblPlugin";
import { SessionDataManager } from "../interfaces/sessionDataManager";
import { SET_ALL_USERS, generateUserToRolesKey, generateRoleToUsersKey, SET_ALL_USERS_LAST_MODIFIED_PERMISSIONS, SET_ALL_USERS_LAST_ACTIVITY, Severity, LogCategory } from "../utils/constants";
import { auditLogger } from "../main";

export class DefaultUserManager extends PeBLPlugin implements UserManager {

  private sessionData: SessionDataManager;

  constructor(redisCache: SessionDataManager) {
    super();
    this.sessionData = redisCache;
    // this.addMessageTemplate(new MessageTemplate("addUserProfile",
    //   this.validateAddUserProfile.bind(this),
    //   this.authorizeAddUserProfile.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.addUserProfile(payload.id, payload.userName, dispatchCallback, payload.userEmail);
    //   }));

    // this.addMessageTemplate(new MessageTemplate("deleteUserProfile",
    //   this.validateDeleteUserProfile.bind(this),
    //   this.authorizeDeleteUserProfile.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.deleteUserProfile(payload.id, dispatchCallback);
    //   }));

    // this.addMessageTemplate(new MessageTemplate("updateUserProfile",
    //   this.validateUpdateUserProfile.bind(this),
    //   this.authorizeUpdateUserProfile.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.updateUserProfile(payload.id, dispatchCallback, payload.userName, payload.userEmail);
    //   }));

    // this.addMessageTemplate(new MessageTemplate("getUserProfile",
    //   this.validateGetUserProfile.bind(this),
    //   this.authorizeGetUserProfile.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.getUserProfile(payload.id, dispatchCallback);
    //   }));

    // this.addMessageTemplate(new MessageTemplate("getUsers",
    //   this.validateGetUsers.bind(this),
    //   this.authorizeGetUsers.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.getUsers(dispatchCallback);
    //   }));
  }

  // validateAddUserProfile(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // validateDeleteUserProfile(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // validateUpdateUserProfile(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // validateGetUserProfile(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // validateGetUsers(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // authorizeAddUserProfile(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // authorizeDeleteUserProfile(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // authorizeGetUserProfile(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // authorizeUpdateUserProfile(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // authorizeGetUsers(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // Add a user with the specified metadata
  async addUserProfile(id: string, userName: string, userEmail?: string): Promise<true> {
    await this.sessionData.setHashValue(SET_ALL_USERS,
      id,
      JSON.stringify({
        name: userName,
        email: userEmail
      }));
    return true;
  }

  // Delete a user with the specified id
  async deleteUserProfile(id: string): Promise<boolean> {
    let deleted = await this.sessionData.deleteHashValue(SET_ALL_USERS, id);
    if (!deleted) {
      auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelUserProfileFail", id);
    }
    return deleted;
  }

  async addUserRoles(userId: string, roleIds: string[]): Promise<boolean> {
    auditLogger.report(LogCategory.PLUGIN, Severity.DEBUG, "AddUserRoles", userId, roleIds);
    let added = await this.sessionData.addSetValue(generateUserToRolesKey(userId), roleIds);
    if (added > 0) {
      await this.setLastModifiedPermissions(userId, Date.now() + "");
      for (let roleId of roleIds) {
        await this.sessionData.addSetValue(generateRoleToUsersKey(roleId), userId);
      }
      return true;
    } else {
      return false;
    }
  }

  async getUserRoles(userId: string): Promise<string[]> {
    return await this.sessionData.getSetValues(generateUserToRolesKey(userId));
  }

  async deleteUserRole(userId: string, roleId: string): Promise<boolean> {
    let deleted = await this.sessionData.deleteSetValue(generateUserToRolesKey(userId), roleId);
    if (!deleted) {
      auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelUserRoleFail", userId, roleId);
    }

    deleted = await this.sessionData.deleteSetValue(generateRoleToUsersKey(roleId), userId);
    if (!deleted) {
      auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelUserRoleFail", userId, roleId);
    }

    await this.setLastModifiedPermissions(userId, Date.now() + "");
    return deleted;
  }

  // Update user metadata
  async updateUserProfile(id: string, userName?: string, userEmail?: string): Promise<true> {
    await this.sessionData.setHashValue(SET_ALL_USERS,
      id,
      JSON.stringify({
        name: userName,
        email: userEmail
      }));
    return true;
  }

  //Get the specified users profile
  async getUserProfile(id: string): Promise<UserProfile> {
    let data: string | undefined = await this.sessionData.getHashValue(SET_ALL_USERS, id);
    if (data === undefined) {
      data = "{}";
    }
    return new UserProfile(JSON.parse(data));
  }

  // Get all users
  async getUsers(): Promise<UserProfile[]> {
    let data: string[] = await this.sessionData.getHashValues(SET_ALL_USERS);
    return data.map((x) => new UserProfile(JSON.parse(x)));
  }

  async getLastModifiedPermissions(identity: string): Promise<string> {
    let lastModified: string | undefined = await this.sessionData.getHashValue(SET_ALL_USERS_LAST_MODIFIED_PERMISSIONS, identity);
    return lastModified !== undefined ? lastModified : "";
  }

  async setLastModifiedPermissions(identity: string, lastModified: string): Promise<boolean> {
    return (await this.sessionData.setHashValue(SET_ALL_USERS_LAST_MODIFIED_PERMISSIONS, identity, lastModified)) > 0;
  }

  async setLastActivity(identity: string, lastActivity: number): Promise<boolean> {
    return (await this.sessionData.addTimestampValue(SET_ALL_USERS_LAST_ACTIVITY, lastActivity, identity)) > 0;
  }
}
