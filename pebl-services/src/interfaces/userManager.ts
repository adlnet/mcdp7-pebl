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

import { UserProfile } from "../models/userProfile";
import { PeBLPlugin } from "../models/peblPlugin";

export interface UserManager extends PeBLPlugin {
  // validateAddUserProfile(payload: { [key: string]: any }): boolean;
  // validateDeleteUserProfile(payload: { [key: string]: any }): boolean;
  // validateUpdateUserProfile(payload: { [key: string]: any }): boolean;
  // validateGetUserProfile(payload: { [key: string]: any }): boolean;

  // validateGetUsers(payload: { [key: string]: any }): boolean;

  // authorizeAddUserProfile(username: string, permissions: any, payload: { [key: string]: any }): boolean;
  // authorizeDeleteUserProfile(username: string, permissions: any, payload: { [key: string]: any }): boolean;
  // authorizeUpdateUserProfile(username: string, permissions: any, payload: { [key: string]: any }): boolean;
  // authorizeGetUserProfile(username: string, permissions: any, payload: { [key: string]: any }): boolean;
  // authorizeGetUsers(username: string, permissions: any, payload: { [key: string]: any }): boolean;

  // Add a user with the specified metadata
  addUserProfile(id: string, userName: string, userEmail?: string): Promise<true>;
  // Delete a user with the specified id
  deleteUserProfile(id: string): Promise<boolean>;
  // Update user metadata
  updateUserProfile(id: string, userName?: string, userEmail?: string): Promise<true>;
  //Get the specified users profile
  getUserProfile(id: string): Promise<UserProfile>;

  addUserRoles(id: string, roleIds: string[]): Promise<boolean>;
  getUserRoles(id: string): Promise<string[]>;
  deleteUserRole(id: string, roleId: string): Promise<boolean>;

  getUsers(): Promise<UserProfile[]>; // Get all users

  setLastModifiedPermissions(identity: string, lastModified: string): Promise<boolean>;
  getLastModifiedPermissions(identity: string): Promise<string>;

  setLastActivity(identity: string, setLastActivity: number): Promise<boolean>;
}
