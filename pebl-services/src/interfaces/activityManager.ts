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

export interface ActivityManager extends PeBLPlugin {

  // validateGetActivities(payload: { [key: string]: any }): boolean;
  // validateSaveActivities(payload: { [key: string]: any }): boolean;
  // validateDeleteActivity(payload: { [key: string]: any }): boolean;

  // validateGetActivityEvents(payload: { [key: string]: any }): boolean;
  // validateSaveActivityEvents(payload: { [key: string]: any }): boolean;
  // validateDeleteActivityEvent(payload: { [key: string]: any }): boolean;

  // getActivities(identity: string, callback: ((activities: Activity[]) => void)): void;
  // saveActivities(identity: string, activities: Activity[], callback: ((success: boolean) => void)): void;
  // deleteActivity(identity: string, id: string, callback: ((success: boolean) => void)): void;

  // getActivityEvents(identity: string, callback: ((events: ProgramAction[]) => void)): void;
  // saveActivityEvents(identity: string, events: ProgramAction[], callback: ((success: boolean) => void)): void;
  // deleteActivityEvent(identity: string, id: string, callback: ((success: boolean) => void)): void;
}
