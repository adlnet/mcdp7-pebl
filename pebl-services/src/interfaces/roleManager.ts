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

import { Role } from "../models/role";
import { PeBLPlugin } from "../models/peblPlugin";

export interface RoleManager extends PeBLPlugin {
  // validateAddRole(payload: { [key: string]: any }): boolean;
  // validateDeleteRole(payload: { [key: string]: any }): boolean;
  // validateUpdateRole(payload: { [key: string]: any }): boolean;

  // validateGetRole(payload: { [key: string]: any }): boolean;
  // validateGetRoles(payload: { [key: string]: any }): boolean;

  // validateCopyRole(payload: { [key: string]: any }): boolean;

  // copyRole(id: string, newName: string): void;

  addRole(id: string, name: string, permissions: string[]): Promise<true>; //Add a role based on a set of permissions
  deleteRole(id: string): Promise<boolean>; //Remove a role
  updateRole(id: string, name?: string, permissions?: string[]): Promise<true>; //Updates the permission set and/or name of a role

  getMultiRole(ids: string[]): Promise<Role[]>;
  getRole(id: string): Promise<Role>; //Get a role with the specified id

  getRoles(): Promise<Role[]>; //Get all the roles in the system

  getUsersByRole(roleId: string): Promise<string[]>;
}
