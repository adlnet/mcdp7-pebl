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

export interface NotificationManager extends PeBLPlugin {


  // validateGetNotifications(payload: { [key: string]: any }): boolean;
  // validateSaveNotifications(payload: { [key: string]: any }): boolean;
  validateDeleteNotification(payload: { [key: string]: any }): boolean;

  // getNotifications(identity: string, timestamp: number, callback: ((notifications: XApiStatement[]) => void)): void; //Retrieves all notifications for this user
  // getNotificationsForBook(identity: string, book: string): Notification[]; //Retrieves all notifications for the specified book for this user
  // saveNotifications(identity: string, notifications: XApiStatement[], callback: ((success: boolean) => void)): void; //Stores the notifications for this user
  deleteNotification(identity: string, records: { [key: string]: any }[], callback: ((success: boolean) => void)): void;

}
