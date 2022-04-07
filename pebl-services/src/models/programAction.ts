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
import { PREFIX_PEBL_EXTENSION } from "../utils/constants";
import { ActivityObject } from "./xapiStatement";

export class ProgramAction extends XApiStatement {
  readonly thread: string;
  readonly programId?: string;
  readonly action?: string;
  readonly previousValue?: any;
  readonly newValue?: any;

  constructor(raw: { [key: string]: any }) {
    super(raw);

    let object = this.object as ActivityObject;
    this.thread = object.id;

    if (object.definition && object.definition.name)
      this.programId = object.definition.name["en-US"];

    if (object.definition && object.definition.extensions) {
      let extensions = object.definition.extensions;


      this.previousValue = extensions[PREFIX_PEBL_EXTENSION + "previousValue"];
      this.newValue = extensions[PREFIX_PEBL_EXTENSION + "newValue"];
      this.action = extensions[PREFIX_PEBL_EXTENSION + "action"];
    }
  }

  static is(x: XApiStatement): boolean {
    if (!XApiStatement.is(x))
      return false;

    let verb = x.verb.display["en-US"];
    return (verb == "programLevelUp") || (verb == "programLevelDown") || (verb == "programInvited") || (verb == "programUninvited")
      || (verb == "programExpelled") || (verb == "programJoined") || (verb == "programActivityLaunched")
      || (verb == "programActivityCompleted") || (verb == "programActivityTeamCompleted") || (verb == "programModified")
      || (verb == "programDeleted") || (verb == "programCompleted") || (verb == "programCopied") || (verb == "programDiscussed")
  }
}
