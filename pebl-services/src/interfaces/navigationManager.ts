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
import { XApiStatement } from "../models/xapiStatement";

export interface NavigationManager extends PeBLPlugin {


  // validateGetNavigations(payload: { [key: string]: any }): boolean;
  validateSaveNavigations(payload: { [key: string]: any }): boolean;
  // validateDeleteNavigation(payload: { [key: string]: any }): boolean;

  // getNavigations(identity: string, callback: ((navigation: XApiStatement[]) => void)): void; //Retrieves all navigation for this user
  // getNotificationsForBook(identity: string, book: string): Notification[]; //Retrieves all navigation for the specified book for this user
  saveNavigations(identity: string, navigations: XApiStatement[]): Promise<true>; //Stores the navigation for this user
  // deleteNavigation(identity: string, id: string, callback: ((success: boolean) => void)): void; //Removes the navigation with the specified id

}
