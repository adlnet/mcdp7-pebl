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

import { ServiceMessage } from "../models/serviceMessage";
import * as WebSocket from 'ws';

export interface MessageQueueManager {
  //TODO: Is there a priority for messages?
  initialize(): void;

  isUpgradeInProgress(): boolean;

  enqueueIncomingMessage(message: ServiceMessage): Promise<boolean>;
  enqueueOutgoingMessage(message: ServiceMessage): Promise<boolean>;

  createIncomingQueue(): Promise<boolean>;
  createOutgoingQueue(sessionId: string, websocket: WebSocket): Promise<boolean>;

  terminate(done: () => void): void;

  removeOutgoingQueue(sessionId: string): void;

  subscribeNotifications(userid: string, sessionId: string, websocket: WebSocket): Promise<boolean>;
  unsubscribeNotifications(userid: string): void;
}
