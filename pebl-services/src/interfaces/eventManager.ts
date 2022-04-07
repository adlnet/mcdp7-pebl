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

export interface EventManager extends PeBLPlugin {

  // validateGetEvents(payload: { [key: string]: any }): boolean;
  validateSaveEvents(payload: { [key: string]: any }): boolean;
  // validateDeleteEvent(payload: { [key: string]: any }): boolean;

  // getEventsForBook(identity: string, book: string): XApiStatement[]; //Retrieve all events for this user made within the specific book
  // getEvents(identity: string, callback: ((stmts: XApiStatement[]) => void)): void //Retrieve all events for this user
  // saveEventsForBook(identity: string, book: string, events: XApiStatement[]): void; // Store the events for this user made within the specific book
  saveEvents(identity: string, stmts: XApiStatement[], callback: ((success: boolean) => void)): void; // Store the events for this user
  // deleteEvent(identity: string, id: string, callback: ((success: boolean) => void)): void; //Removes the event with the specified id
}
