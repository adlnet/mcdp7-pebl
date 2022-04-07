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
import { PREFIX_PEBL_EXTENSION, PREFIX_PEBL, PREFIX_PEBL_THREAD } from "../utils/constants";

export class Navigation extends XApiStatement {
  readonly activityId: string;
  readonly book: string;
  readonly firstCfi?: string;
  readonly lastCfi?: string;

  readonly type: string;

  constructor(raw: { [key: string]: any }) {
    super(raw);
    this.type = this.verb.display["en-US"];

    let object = this.object as ActivityObject;

    this.activityId = object.id;

    this.book = object.id;
    if (this.book.indexOf(PREFIX_PEBL) != -1)
      this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL) + PREFIX_PEBL.length);
    else if (this.book.indexOf(PREFIX_PEBL_THREAD) != -1)
      this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL_THREAD) + PREFIX_PEBL_THREAD.length);

    if (object.definition && object.definition.extensions) {
      let extensions = object.definition.extensions;

      this.firstCfi = extensions[PREFIX_PEBL_EXTENSION + "firstCfi"];
      this.lastCfi = extensions[PREFIX_PEBL_EXTENSION + "lastCfi"];
      if (extensions[PREFIX_PEBL_EXTENSION + "bookId"])
        this.book = extensions[PREFIX_PEBL_EXTENSION + "bookId"];
    }

  }

  static is(x: XApiStatement): boolean {
    if (!XApiStatement.is(x))
      return false;

    let verb = x.verb.display["en-US"];
    return (verb == "paged-next") || (verb == "paged-prev") || (verb == "paged-jump") || (verb == "interacted") ||
      (verb == "completed");
  }
}
