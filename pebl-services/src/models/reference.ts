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

import { XApiStatement, ActivityObject } from "./xapiStatement";
import { PREFIX_PEBL_EXTENSION, PREFIX_PEBL_THREAD } from "../utils/constants";

export class Reference extends XApiStatement {
  readonly thread: string;
  readonly book?: string;
  readonly docType?: string;
  readonly location?: string;
  readonly card?: string;
  readonly url?: string;
  readonly target?: string;
  readonly name?: string;
  readonly externalURL?: string;

  constructor(raw: { [key: string]: any }) {
    super(raw);
    let object = this.object as ActivityObject;
    this.thread = object.id;
    if (this.thread.indexOf(PREFIX_PEBL_THREAD) != -1)
      this.thread = this.thread.substring(PREFIX_PEBL_THREAD.length);

    if (object.definition && object.definition.name)
      this.name = object.definition.name["en-US"];

    if (object.definition && object.definition.extensions) {
      let extensions = object.definition.extensions;

      this.book = extensions[PREFIX_PEBL_EXTENSION + "book"];
      this.docType = extensions[PREFIX_PEBL_EXTENSION + "docType"];
      this.location = extensions[PREFIX_PEBL_EXTENSION + "location"];
      this.card = extensions[PREFIX_PEBL_EXTENSION + "card"];
      this.url = extensions[PREFIX_PEBL_EXTENSION + "url"];
      this.target = extensions[PREFIX_PEBL_EXTENSION + "target"];
      this.externalURL = extensions[PREFIX_PEBL_EXTENSION + "externalURL"];
    }

  }

  static is(x: XApiStatement): boolean {
    if (!XApiStatement.is(x))
      return false;

    let verb = x.verb.display["en-US"];
    return (verb == "pushed") || (verb == "pulled");
  }
}
