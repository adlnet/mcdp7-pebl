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

import { XApiStatement } from "./xapiStatement";
import { PREFIX_PEBL_THREAD, PREFIX_PEBL_EXTENSION } from "../utils/constants";
import { ActivityObject } from "./xapiStatement";

export class Membership extends XApiStatement {

  readonly thread: string;
  readonly membershipId?: string;
  readonly activityType?: string;
  readonly description?: string;
  readonly role?: string;
  readonly organization?: string;
  readonly organizationName?: string;

  constructor(raw: { [key: string]: any }) {
    super(raw);
    let object = this.object as ActivityObject;

    this.thread = object.id;
    if (this.thread.indexOf(PREFIX_PEBL_THREAD) != -1)
      this.thread = this.thread.substring(PREFIX_PEBL_THREAD.length);

    if (object.definition && object.definition.name)
      this.membershipId = object.definition.name["en-US"];
    if (object.definition)
      this.description = object.definition.description && object.definition.description["en-US"];

    if (object.definition && object.definition.extensions) {
      let extensions = object.definition.extensions;

      this.role = extensions[PREFIX_PEBL_EXTENSION + "role"];
      this.activityType = extensions[PREFIX_PEBL_EXTENSION + "activityType"];
      this.organization = extensions[PREFIX_PEBL_EXTENSION + "organization"];
      this.organizationName = extensions[PREFIX_PEBL_EXTENSION + "organizationName"];
    }

  }

  static is(x: XApiStatement): boolean {
    if (!XApiStatement.is(x))
      return false;

    let verb = x.verb.display["en-US"];
    return (verb == "joined");
  }
}
