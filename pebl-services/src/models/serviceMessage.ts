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

export class ServiceMessage {
  //TODO
  readonly identity: string;
  readonly sessionId?: string;

  readonly payload: {
    [key: string]: any
  };
  messageId?: string;

  constructor(identity: string,
    payload: { [key: string]: any },
    sessionId?: string,
    messageId?: string) {

    this.identity = identity;
    this.payload = payload;
    this.sessionId = sessionId;
    this.messageId = messageId;
  }

  getRequestType(): string {
    return this.payload.requestType;
  }

  static parse(data: string): ServiceMessage {
    let o = JSON.parse(data);
    return new ServiceMessage(o.identity, o.payload, o.sessionId, o.messageId);
  }

}
