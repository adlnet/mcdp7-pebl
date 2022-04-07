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
import { PREFIX_PEBL_THREAD, PREFIX_PEBL_EXTENSION, NAMESPACE_USER_MESSAGES } from "../utils/constants";
import { ActivityObject } from "./xapiStatement";

export class Message extends XApiStatement {
  readonly thread: string;
  readonly text?: string;
  readonly prompt?: string;
  readonly name: string;
  readonly direct: boolean;
  readonly book?: string;
  readonly bookId?: string;
  readonly groupId?: string;
  readonly isPrivate?: boolean;
  readonly access?: "private" | "team" | "class" | "all";
  readonly type?: "written" | "table" | "checkboxes" | "radioboxes" | "buttons";
  readonly replyThread?: string;
  readonly cfi?: string;
  readonly idRef?: string;
  readonly peblAction?: string;
  pinned?: boolean;
  pinMessage?: string;
  readonly currentTeam?: string;
  readonly currentClass?: string;
  readonly contextUrl?: string;

  constructor(raw: { [key: string]: any }) {
    super(raw);

    let object = this.object as ActivityObject;
    this.thread = object.id;
    if (this.thread.indexOf(PREFIX_PEBL_THREAD) != -1)
      this.thread = this.thread.substring(PREFIX_PEBL_THREAD.length);


    if (object.definition && object.definition.name)
      this.prompt = object.definition.name["en-US"];
    this.name = this.actor.name || "";
    this.direct = this.thread == (NAMESPACE_USER_MESSAGES + this.getActorId());

    if (object.definition && object.definition.description)
      this.text = object.definition.description["en-US"];

    if (object.definition && object.definition.extensions) {
      let extensions = object.definition.extensions;
      if (extensions) {
        this.access = extensions[PREFIX_PEBL_EXTENSION + "access"];
        this.type = extensions[PREFIX_PEBL_EXTENSION + "type"];
        this.replyThread = extensions[PREFIX_PEBL_EXTENSION + "replyThread"];
        this.groupId = extensions[PREFIX_PEBL_EXTENSION + "groupId"];
        this.isPrivate = extensions[PREFIX_PEBL_EXTENSION + "isPrivate"];
        this.book = extensions[PREFIX_PEBL_EXTENSION + "book"];
        this.bookId = extensions[PREFIX_PEBL_EXTENSION + "bookId"];
        this.cfi = extensions[PREFIX_PEBL_EXTENSION + "cfi"];
        this.idRef = extensions[PREFIX_PEBL_EXTENSION + "idRef"];
        this.peblAction = extensions[PREFIX_PEBL_EXTENSION + "peblAction"];

        if (extensions[PREFIX_PEBL_EXTENSION + "thread"])
          this.thread = extensions[PREFIX_PEBL_EXTENSION + "thread"];

        this.currentTeam = extensions[PREFIX_PEBL_EXTENSION + "currentTeam"];
        this.currentClass = extensions[PREFIX_PEBL_EXTENSION + "currentClass"];
        this.contextUrl = extensions[PREFIX_PEBL_EXTENSION + "contextUrl"];
      }
    }

    this.pinned = raw.pinned;
    this.pinMessage = raw.pinMessage;
  }

  static is(x: XApiStatement): boolean {
    if (!XApiStatement.is(x))
      return false;

    let verb = x.verb.display["en-US"];
    return (verb == "responded") || (verb == "noted");
  }

  static isDiscussion(x: any): boolean {
    let type = x.object.definition.type;
    if (type === 'http://www.peblproject.com/activities/discussion')
      return true;
    return false;
  }
}
