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

export class Question extends XApiStatement {

  readonly book: string;

  readonly score?: number;
  readonly min?: number;
  readonly max?: number;

  readonly activityId?: string;

  readonly completion?: boolean;
  readonly success?: boolean;

  readonly answers?: string[];
  readonly prompt?: string;

  readonly response?: string;
  readonly currentTeam?: string;
  readonly currentClass?: string;
  readonly contextUrl?: string;

  constructor(raw: { [key: string]: any }) {
    super(raw);

    let object = this.object as ActivityObject;

    this.book = object.id;
    if (this.book.indexOf(PREFIX_PEBL) != -1)
      this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL) + PREFIX_PEBL.length);
    else if (this.book.indexOf(PREFIX_PEBL_THREAD) != -1)
      this.book = this.book.substring(this.book.indexOf(PREFIX_PEBL_THREAD) + PREFIX_PEBL_THREAD.length);

    if (this.result) {
      if (this.result.score) {
        if (this.result.score.raw)
          this.score = this.result.score.raw;
        if (this.result.score.min)
          this.min = this.result.score.min;
        if (this.result.score.max)
          this.max = this.result.score.max;
      }

      if (this.result.completion)
        this.completion = this.result.completion;
      if (this.result.success)
        this.success = this.result.success;
      if (this.result.response)
        this.response = this.result.response;
    }

    if (object.definition) {
      if (object.definition.description)
        this.prompt = object.definition.description["en-US"];

      this.activityId = object.id;

      if (object.definition.choices) {
        let choices = object.definition.choices;
        this.answers = [];
        for (let key of Object.keys(choices) as any) {
          this.answers.push(choices[key].description["en-US"]);
        }
      }

      let extensions = object.definition.extensions;
      if (extensions) {
        if (extensions[PREFIX_PEBL_EXTENSION + "bookId"])
          this.book = extensions[PREFIX_PEBL_EXTENSION + "bookId"];

        this.currentTeam = extensions[PREFIX_PEBL_EXTENSION + "currentTeam"];
        this.currentClass = extensions[PREFIX_PEBL_EXTENSION + "currentClass"];
        this.contextUrl = extensions[PREFIX_PEBL_EXTENSION + "contextUrl"];
      }

    }

  }

  static is(x: XApiStatement): boolean {
    let verb = x.verb.display["en-US"];
    return (verb == "attempted");
  }

}
