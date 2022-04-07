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
import { PREFIX_PEBL, PREFIX_PEBL_THREAD, PREFIX_PEBL_EXTENSION } from "../utils/constants";
import { ActivityObject } from "./xapiStatement"

export class Annotation extends XApiStatement {
  readonly book: string;
  readonly type: string;
  readonly cfi: string;
  readonly idRef: string;
  readonly title: string;
  readonly style: string;
  readonly text?: string;
  readonly owner: string | string[];
  pinned?: boolean;
  pinMessage?: string;

  constructor(raw: { [key: string]: any }) {
    super(raw);

    let object = this.object as ActivityObject;
    if (!object.definition)
      object.definition = {};

    this.title = (object.definition.name && object.definition.name["en-US"]) || "";
    this.text = object.definition.description && object.definition.description["en-US"];

    this.book = object.id;
    if (this.book.indexOf(PREFIX_PEBL) != -1)
      this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL) + PREFIX_PEBL.length);
    else if (this.book.indexOf(PREFIX_PEBL_THREAD) != -1)
      this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL_THREAD) + PREFIX_PEBL_THREAD.length);

    this.owner = this.getActorId();

    if (!object.definition.extensions)
      object.definition.extensions = {};
    let extensions = object.definition.extensions;

    this.type = extensions[PREFIX_PEBL_EXTENSION + "type"];
    this.cfi = extensions[PREFIX_PEBL_EXTENSION + "cfi"];
    this.idRef = extensions[PREFIX_PEBL_EXTENSION + "idRef"];
    this.style = extensions[PREFIX_PEBL_EXTENSION + "style"];

    if (extensions[PREFIX_PEBL_EXTENSION + "bookId"])
      this.book = extensions[PREFIX_PEBL_EXTENSION + "bookId"];

    this.pinned = raw.pinned;
    this.pinMessage = raw.pinMessage;
  }

  static is(x: XApiStatement): boolean {
    if (!XApiStatement.is(x))
      return false;

    let verb = x.verb.display["en-US"];
    return (verb == "commented") || (verb == "bookmarked") || (verb == "annotated");
  }
}
