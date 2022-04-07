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

import { genUUID } from "../utils/utils";

export class Profile {
  readonly id: string;
  readonly type: string;
  timestamp: Date;
  etag?: string;
  identity?: string;
  readonly isNew: boolean = false;
  dirtyEdits: { [key: string]: boolean };
  delete?: boolean;

  constructor(raw: { [key: string]: any }) {
    this.dirtyEdits = {};
    if (!raw.id) {
      this.id = genUUID();
      this.isNew = true;
    } else {
      this.id = raw.id;
      this.isNew = false;
    }
    this.timestamp = (typeof (raw.timestamp) === "string") ? new Date(Date.parse(raw.timestamp)) : new Date();
    this.etag = raw.etag;
    this.type = raw.type;
    this.delete = raw.delete;
  }

  static is(raw: { [key: string]: any }): boolean {
    return (raw.id && raw.type) != null;
  }

  clearDirtyEdits(): void {
    this.dirtyEdits = {};
  }

  toTransportFormat(): { [key: string]: any } {
    return {
      type: this.type,
      timestamp: this.timestamp ? this.timestamp.toISOString() : (new Date()).toISOString(),
      id: this.id
    }
  };

  static merge(oldProfile: any, newProfile: any): Profile {
    let mergedProfile = {} as any;
    let oldKeys = Object.keys(oldProfile);
    let newKeys = Object.keys(newProfile);

    for (let key of oldKeys) {
      mergedProfile[key] = oldProfile[key];
    }

    for (let key of newKeys) {
      // Null properties were set for a reason and should not be changed.
      if (mergedProfile[key] == null) {
        // Leave it
      } else {
        mergedProfile[key] = newProfile[key];
      }
    }

    // If either is flagged for deletion, that should not be changed.
    if ((oldProfile.delete && oldProfile.delete == true) || (newProfile.delete && newProfile.delete == true)) {
      mergedProfile.delete = true;
    }

    // If either is flagged as completed, that should not be changed.
    if ((oldProfile.completed && oldProfile.completed == true) || (newProfile.completed && newProfile.completed == true)) {
      mergedProfile.completed = true;
    }

    return mergedProfile as Profile;
  }
}
