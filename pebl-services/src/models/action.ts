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
import { PREFIX_PEBL, PREFIX_PEBL_THREAD, PREFIX_PEBL_EXTENSION } from "../utils/constants";

export class Action extends XApiStatement {
  readonly activityId: string;
  readonly book: string;
  readonly target?: string;
  readonly idref?: string;
  readonly cfi?: string;
  readonly type?: string;
  readonly name?: string;
  readonly description?: string;
  readonly action: string;
  readonly currentTeam?: string;
  readonly currentClass?: string;

  constructor(raw: { [key: string]: any }) {
    super(raw);
    let object = this.object as ActivityObject;
    this.activityId = object.id;

    this.action = this.verb.display["en-US"];

    this.book = object.id;
    if (this.book.indexOf(PREFIX_PEBL) != -1)
      this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL) + PREFIX_PEBL.length);
    else if (this.book.indexOf(PREFIX_PEBL_THREAD) != -1)
      this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL_THREAD) + PREFIX_PEBL_THREAD.length);


    if (object.definition) {
      this.name = object.definition.name && object.definition.name["en-US"];
      this.description = object.definition.description && object.definition.description["en-US"];

      let extensions = object.definition.extensions;

      if (extensions) {
        this.target = extensions[PREFIX_PEBL_EXTENSION + "target"];
        this.type = extensions[PREFIX_PEBL_EXTENSION + "type"];
        this.idref = extensions[PREFIX_PEBL_EXTENSION + "idref"];
        this.cfi = extensions[PREFIX_PEBL_EXTENSION + "cfi"];
        if (extensions[PREFIX_PEBL_EXTENSION + "bookId"])
          this.book = extensions[PREFIX_PEBL_EXTENSION + "bookId"];

        this.currentTeam = extensions[PREFIX_PEBL_EXTENSION + "currentTeam"];
        this.currentClass = extensions[PREFIX_PEBL_EXTENSION + "currentClass"];
      }
    }
  }

  static is(x: any): boolean {
    if (!XApiStatement.is(x))
      return false;

    let verb = x.verb.display["en-US"];
    return (verb == "preferred") || (verb == "morphed") || (verb == "interacted") || (verb == "experienced") || (verb == "disliked") ||
      (verb == "liked") || (verb == "accessed") || (verb == "hid") || (verb == "showed") || (verb == "displayed") || (verb == "undisplayed") ||
      (verb == "searched") || (verb == "selected") || (verb == "unbookmarked") || (verb == "discarded") || (verb == "unshared") || (verb == "unannotated") ||
      (verb == "submitted");
  }

  static isCompletion(x: any): boolean {
    let verb = x.verb.display["en-US"];
    let type = x.object.definition.type;
    let chapter = x.object.definition.name;

    if (verb === 'experienced' && type === 'http://www.peblproject.com/activities/chapter' && chapter)
      return true;

    return false;
  }
}
