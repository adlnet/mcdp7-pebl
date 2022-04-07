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

export interface MessageManager extends PeBLPlugin {

  // validateGetMessages(payload: { [key: string]: any }): boolean;
  // validateSaveMessages(payload: { [key: string]: any }): boolean;
  // validateDeleteMessages(payload: { [key: string]: any }): boolean;

  // getMessages(identity: string, timestamp: number, callback: ((messages: (Message | Voided)[]) => void)): void;

  // saveMessages(identity: string, messages: Message[], callback: ((success: boolean) => void)): void;

  // deleteMessage(identity: string, id: string, callback: ((success: boolean) => void)): void;

}
