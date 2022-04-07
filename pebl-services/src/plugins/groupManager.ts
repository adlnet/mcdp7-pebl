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

import { GroupManager } from "../interfaces/groupManager"
import { PeBLPlugin } from "../models/peblPlugin";
import { Group } from "../models/group";
import { SessionDataManager } from "../interfaces/sessionDataManager";
import { PermissionSet } from "../models/permission";
import { SET_ALL_GROUPS, generateGroupToGroupMembershipKey, generateUserToGroupMembershipKey, generateGroupToUserMembersKey, generateGroupToGroupMembersKey, LogCategory, Severity } from "../utils/constants";
import { UserManager } from "../interfaces/userManager";
import { auditLogger } from "../main";
import { MessageTemplate } from "../models/messageTemplate";

export class DefaultGroupManager extends PeBLPlugin implements GroupManager {

  private sessionData: SessionDataManager;
  private userManager: UserManager;

  constructor(sessionData: SessionDataManager, userManager: UserManager) {
    super();
    this.sessionData = sessionData;
    this.userManager = userManager;
    this.addMessageTemplate(new MessageTemplate("addGroup",
      this.validateAddGroup.bind(this),
      this.authorizeAddGroup.bind(this),
      (payload: { [key: string]: any }) => {
        return this.addGroup(payload.id, payload.groupName, payload.groupDescription, payload.groupAvatar);
      }));

    this.addMessageTemplate(new MessageTemplate("deleteGroup",
      this.validateDeleteGroup.bind(this),
      this.authorizeDeleteGroup.bind(this),
      (payload: { [key: string]: any }) => {
        return this.deleteGroup(payload.id);
      }));

    this.addMessageTemplate(new MessageTemplate("updateGroup",
      this.validateUpdateGroup.bind(this),
      this.authorizeUpdateGroup.bind(this),
      (payload: { [key: string]: any }) => {
        return this.updateGroup(payload.id, payload.groupName, payload.groupDescription, payload.groupAvatar);
      }));

    this.addMessageTemplate(new MessageTemplate("addGroupMemberUser",
      this.validateAddGroupMemberUser.bind(this),
      this.authorizeAddGroupMemberUser.bind(this),
      (payload: { [key: string]: any }) => {
        return this.addGroupMemberUser(payload.id, payload.userId, payload.roles);
      }));

    this.addMessageTemplate(new MessageTemplate("deleteGroupMemberUser",
      this.validateDeleteGroupMemberUser.bind(this),
      this.authorizeDeleteGroupMemberUser.bind(this),
      (payload: { [key: string]: any }) => {
        return this.deleteGroupMemberUser(payload.id, payload.userId);
      }));

    this.addMessageTemplate(new MessageTemplate("updateGroupMemberUser",
      this.validateUpdateGroupMemberUser.bind(this),
      this.authorizeUpdateGroupMemberUser.bind(this),
      (payload: { [key: string]: any }) => {
        return this.updateGroupMemberUser(payload.id, payload.userId, payload.roles);
      }));

    this.addMessageTemplate(new MessageTemplate("getGroups",
      this.validateGetGroups.bind(this),
      this.authorizeGetGroups.bind(this),
      (payload: { [key: string]: any }) => {
        return this.getGroups();
      }));
  }

  validateAddGroup(payload: { [key: string]: any }): boolean {
    // if (!(typeof(payload.id) === 'string')) {
    //   return false;
    // }
    // if (!(typeof(payload.groupName) === 'string')) {
    //   return false;
    // }
    // if (!(typeof(payload.groupDescription) === 'string')) {
    //   return false;
    // }
    // if (payload.groupAvatar) {
    //   if (!(typeof(payload.groupAvatar) === 'string')) {
    //     return false;
    //   }
    // }

    return false;
  }

  validateDeleteGroup(payload: { [key: string]: any }): boolean {
    return false;
  }

  validateUpdateGroup(payload: { [key: string]: any }): boolean {
    return false;
  }

  validateAddGroupMemberUser(payload: { [key: string]: any }): boolean {
    return false;
  }

  validateDeleteGroupMemberUser(payload: { [key: string]: any }): boolean {
    return false;
  }

  validateUpdateGroupMemberUser(payload: { [key: string]: any }): boolean {
    return false;
  }

  validateGetGroups(payload: { [key: string]: any }): boolean {
    return false;
  }

  authorizeAddGroup(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    return false;
  }

  authorizeDeleteGroup(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    return false;
  }

  authorizeUpdateGroup(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    return false;
  }

  authorizeAddGroupMemberUser(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    return false;
  }

  authorizeDeleteGroupMemberUser(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    return false;
  }

  authorizeUpdateGroupMemberUser(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    return false;
  }

  authorizeGetGroups(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    return false;
  }

  async addGroup(id: string, groupName: string, groupDescription: string, groupAvatar?: string): Promise<true> {
    await this.sessionData.setHashValue(SET_ALL_GROUPS,
      id,
      JSON.stringify({
        name: groupName,
        description: groupDescription,
        avatar: groupAvatar
      }));
    return true;
  }

  async deleteGroup(id: string): Promise<boolean> {
    let deleted = await this.sessionData.deleteHashValue(SET_ALL_GROUPS, id);

    if (!deleted) {
      auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelGroupFail", id);
    }

    let modified = Date.now() + "";

    //TODO re-write using MULTI/EXEC
    let userIds: string[] = await this.getGroupMemberUsers(id);
    let groupIds: string[] = await this.getGroupMemberGroups(id);

    for (let userId of userIds) {
      await this.userManager.setLastModifiedPermissions(userId, modified);
      await this.deleteGroupMemberUser(id, userId);
    }

    for (let groupId of groupIds) {
      await this.deleteGroupMemberGroup(id, groupId);
    }

    let userSetDeleted = await this.sessionData.deleteValue(generateGroupToUserMembersKey(id));
    if (!userSetDeleted) {
      auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelGroupMemFail", id);
    }
    let groupSetDeleted = await this.sessionData.deleteValue(generateGroupToGroupMembersKey(id));
    if (!groupSetDeleted) {
      auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelGroupMemFail", id);
    }

    return deleted;
  }

  async getGroup(id: string): Promise<Group | null> {
    let group = await this.sessionData.getHashValue(SET_ALL_GROUPS, id);

    auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "GetGroupFail", id);
    return group !== undefined ? Group.convert(group) : null;
  }

  async updateGroup(id: string, groupName?: string, groupDescription?: string, groupAvatar?: string): Promise<true> {
    await this.sessionData.setHashValue(SET_ALL_GROUPS,
      id,
      JSON.stringify({
        name: groupName,
        description: groupDescription,
        avatar: groupAvatar
      }));
    return true;
  }


  async addGroupMemberUser(groupId: string, memberUserId: string, roleIds: string[]): Promise<true> {
    await this.sessionData.setHashValue(generateGroupToUserMembersKey(groupId), memberUserId, JSON.stringify(roleIds));
    await this.userManager.setLastModifiedPermissions(memberUserId, Date.now() + "");
    await this.sessionData.addSetValue(generateUserToGroupMembershipKey(memberUserId), groupId);
    return true;
  }

  async addGroupMemberGroup(groupId: string, memberGroupId: string, roleIds: string[]): Promise<true> {
    await this.sessionData.setHashValue(generateGroupToGroupMembersKey(groupId), memberGroupId, JSON.stringify(roleIds));
    //TODO groups need to trigger for nested groups
    //this.setLastModifiedPermissions(memberUserId, Date.now() + "");
    await this.sessionData.addSetValue(generateGroupToGroupMembershipKey(memberGroupId), groupId);
    return true;
  }

  async getGroupMemberUser(groupId: string, memberUserId: string): Promise<string[]> {
    let data = await this.sessionData.getHashValue(generateGroupToUserMembersKey(groupId), memberUserId);
    return data !== undefined ? JSON.parse(data) : [];
  }

  async getGroupMemberUsers(groupId: string): Promise<string[]> {
    let data: string[] = await this.sessionData.getHashKeys(generateGroupToUserMembersKey(groupId));
    return data !== undefined ? data : [];
  }

  async getGroupMemberGroup(groupId: string, memberGroupId: string): Promise<string[]> {
    let data = await this.sessionData.getHashValue(generateGroupToGroupMembersKey(groupId), memberGroupId);
    return data !== undefined ? JSON.parse(data) : [];
  }

  async getGroupMemberGroups(groupId: string): Promise<string[]> {
    let data: string[] = await this.sessionData.getHashKeys(generateGroupToGroupMembersKey(groupId));
    return data;
  }

  async deleteGroupMemberUser(groupId: string, memberUserId: string): Promise<boolean> {
    let deleted = await this.sessionData.deleteHashValue(generateGroupToUserMembersKey(groupId), memberUserId);
    if (!deleted) {
      auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelGroupMemUserFail", groupId, memberUserId);
    }
    await this.userManager.setLastModifiedPermissions(memberUserId, Date.now() + "");
    await this.sessionData.deleteSetValue(generateUserToGroupMembershipKey(memberUserId), groupId)
    return deleted;
  }

  async deleteGroupMemberGroup(groupId: string, memberGroupId: string): Promise<boolean> {
    let deleted = await this.sessionData.deleteHashValue(generateGroupToGroupMembersKey(groupId), memberGroupId);
    if (!deleted) {
      auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelGroupMemGroupFail", groupId, memberGroupId);
    }

    //TODO groups need to trigger for nested groups
    //this.setLastModifiedPermissions(memberUserId, Date.now() + "");
    await this.sessionData.deleteSetValue(generateGroupToGroupMembershipKey(memberGroupId), groupId);
    return deleted;
  }

  async updateGroupMemberUser(groupId: string, memberUserId: string, roleIds: string[]): Promise<true> {
    await this.sessionData.setHashValue(generateGroupToUserMembersKey(groupId), memberUserId, JSON.stringify(roleIds));
    await this.userManager.setLastModifiedPermissions(memberUserId, Date.now() + "");
    return true;
  }

  async updateGroupMemberGroup(groupId: string, memberGroupId: string, roleIds: string[]): Promise<true> {
    await this.sessionData.setHashValue(generateGroupToGroupMembersKey(groupId), memberGroupId, JSON.stringify(roleIds));
    //TODO groups need to trigger for nested groups
    //this.setLastModifiedPermissions(memberUserId, Date.now() + "");
    return true;
  }

  async getGroups(): Promise<Group[]> {
    let groupData = await this.sessionData.getHashValues(SET_ALL_GROUPS);
    return groupData.map((x) => Group.convert(x));
  }

  async getUsersGroups(userId: string): Promise<string[]> {
    let groupIds = await this.sessionData.getSetValues(generateUserToGroupMembershipKey(userId));
    return groupIds;
  }

  async getGroupsGroups(groupId: string): Promise<string[]> {
    let groupIds = await this.sessionData.getSetValues(generateGroupToGroupMembershipKey(groupId));
    return groupIds;
  }
}
