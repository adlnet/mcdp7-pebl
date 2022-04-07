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

export class Endpoint {
  readonly host: string;
  readonly path: string;
  readonly headers: { [key: string]: any };
  readonly lastSyncedThreads: { [key: string]: Date }
  readonly lastSyncedBooksMine: { [key: string]: Date }
  readonly lastSyncedBooksShared: { [key: string]: Date }
  readonly lastSyncedActivityEvents: { [key: string]: Date }
  readonly lastSyncedModules: { [key: string]: Date }

  constructor(raw: { [key: string]: any }) {
    this.host = raw.host;
    this.path = raw.path ? (raw.path.endsWith("/") ? raw.path : raw.path + "/") : '/';
    this.headers = raw.headers;
    this.lastSyncedBooksMine = {};
    this.lastSyncedBooksShared = {};
    this.lastSyncedThreads = {};
    this.lastSyncedActivityEvents = {};
    this.lastSyncedModules = {};
  }

  toObject(urlPrefix: string = ""): { [key: string]: any } {
    return {
      host: this.host,
      path: this.path,
      headers: this.headers,
      lastSyncedThreads: this.lastSyncedThreads,
      lastSyncedBooksMine: this.lastSyncedBooksMine,
      lastSyncedBooksShared: this.lastSyncedBooksMine,
      lastSyncedActivityEvents: this.lastSyncedActivityEvents,
      lastSyncedModules: this.lastSyncedModules
    };
  }
}
