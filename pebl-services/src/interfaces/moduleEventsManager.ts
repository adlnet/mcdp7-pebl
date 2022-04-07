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
import { ModuleEvent } from "../models/moduleEvent";

export interface ModuleEventsManager extends PeBLPlugin {

  // validateGetModuleEvents(payload: { [key: string]: any }): boolean;
  validateSaveModuleEvents(payload: { [key: string]: any }): boolean;
  // validateDeleteModuleEvent(payload: { [key: string]: any }): boolean;

  // getModuleEvents(identity: string, callback: ((events: ModuleEvent[]) => void)): void;
  saveModuleEvents(identity: string, events: ModuleEvent[], callback: ((success: boolean) => void)): void;
  // deleteModuleEvent(identity: string, id: string, callback: ((success: boolean) => void)): void;
}
