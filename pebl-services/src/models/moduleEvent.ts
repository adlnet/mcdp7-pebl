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
import { PREFIX_PEBL_EXTENSION } from "../utils/constants";

export class ModuleEvent extends XApiStatement {
  constructor(raw: { [key: string]: any }) {
    super(raw);
  }
}

export class ModuleRating extends ModuleEvent {
  readonly rating?: string;
  readonly idref?: string;
  readonly programId?: string;

  constructor(raw: { [key: string]: any }) {
    super(raw);

    let object = this.object as ActivityObject;

    if (object.definition && object.definition.name)
      this.rating = object.definition.name["en-US"];

    if (object.definition && object.definition.extensions) {
      let extensions = object.definition.extensions;

      this.idref = extensions[PREFIX_PEBL_EXTENSION + "idref"];
      this.programId = extensions[PREFIX_PEBL_EXTENSION + "programId"];
    }

  }

  static is(x: XApiStatement): boolean {
    if (!XApiStatement.is(x))
      return false;

    let verb = x.verb.display["en-US"];
    return (verb == "moduleRating")
  }
}

export class ModuleFeedback extends ModuleEvent {
  readonly feedback?: string;
  readonly willingToDiscuss?: string;
  readonly idref?: string;
  readonly programId?: string;

  constructor(raw: { [key: string]: any }) {
    super(raw);

    let object = this.object as ActivityObject;

    if (object.definition && object.definition.name)
      this.feedback = object.definition.name["en-US"];

    if (object.definition && object.definition.extensions) {
      let extensions = object.definition.extensions;

      this.willingToDiscuss = extensions[PREFIX_PEBL_EXTENSION + "willingToDiscuss"];
      this.idref = extensions[PREFIX_PEBL_EXTENSION + "idref"];
      this.programId = extensions[PREFIX_PEBL_EXTENSION + "programId"];
    }

  }

  static is(x: XApiStatement): boolean {
    if (!XApiStatement.is(x))
      return false;

    let verb = x.verb.display["en-US"];
    return (verb == "moduleFeedback")
  }
}

export class ModuleExample extends ModuleEvent {
  readonly example?: string;
  readonly description?: string;
  readonly idref?: string;
  readonly youtubeUrl?: string;
  readonly imageUrl?: string;
  readonly websiteUrl?: string;
  readonly quotedPerson?: string;
  readonly quotedTeam?: string;

  constructor(raw: { [key: string]: any }) {
    super(raw);

    let object = this.object as ActivityObject;

    if (object.definition && object.definition.name)
      this.example = object.definition.name["en-US"];

    if (object.definition && object.definition.description)
      this.description = object.definition.description["en-US"];

    if (object.definition && object.definition.extensions) {
      let extensions = object.definition.extensions;

      this.idref = extensions[PREFIX_PEBL_EXTENSION + "idref"];
      this.youtubeUrl = extensions[PREFIX_PEBL_EXTENSION + "youtubeUrl"];
      this.imageUrl = extensions[PREFIX_PEBL_EXTENSION + "imageUrl"];
      this.websiteUrl = extensions[PREFIX_PEBL_EXTENSION + "websiteUrl"];
      this.quotedPerson = extensions[PREFIX_PEBL_EXTENSION + "quotedPerson"];
      this.quotedTeam = extensions[PREFIX_PEBL_EXTENSION + "quotedTeam"];
    }
  }

  static is(x: XApiStatement): boolean {
    if (!XApiStatement.is(x))
      return false;

    let verb = x.verb.display["en-US"];
    return (verb == "moduleExample");
  }
}

export class ModuleExampleRating extends ModuleEvent {
  readonly rating?: string;
  readonly idref?: string;
  readonly programId?: string;
  readonly exampleId?: string;

  constructor(raw: { [key: string]: any }) {
    super(raw);

    let object = this.object as ActivityObject;

    if (object.definition && object.definition.name)
      this.rating = object.definition.name["en-US"];

    if (object.definition && object.definition.extensions) {
      let extensions = object.definition.extensions;

      this.idref = extensions[PREFIX_PEBL_EXTENSION + "idref"];
      this.programId = extensions[PREFIX_PEBL_EXTENSION + "programId"];
      this.exampleId = extensions[PREFIX_PEBL_EXTENSION + "exampleId"];
    }

  }

  static is(x: XApiStatement): boolean {
    if (!XApiStatement.is(x))
      return false;

    let verb = x.verb.display["en-US"];
    return (verb == "moduleExampleRating")
  }
}

export class ModuleExampleFeedback extends ModuleEvent {
  readonly feedback?: string;
  readonly willingToDiscuss?: string;
  readonly idref?: string;
  readonly programId?: string;
  readonly exampleId?: string;

  constructor(raw: { [key: string]: any }) {
    super(raw);

    let object = this.object as ActivityObject;

    if (object.definition && object.definition.name)
      this.feedback = object.definition.name["en-US"];

    if (object.definition && object.definition.extensions) {
      let extensions = object.definition.extensions;

      this.willingToDiscuss = extensions[PREFIX_PEBL_EXTENSION + "willingToDiscuss"];
      this.idref = extensions[PREFIX_PEBL_EXTENSION + "idref"];
      this.programId = extensions[PREFIX_PEBL_EXTENSION + "programId"];
      this.exampleId = extensions[PREFIX_PEBL_EXTENSION + "exampleId"];
    }

  }

  static is(x: XApiStatement): boolean {
    if (!XApiStatement.is(x))
      return false;

    let verb = x.verb.display["en-US"];
    return (verb == "moduleExampleFeedback");
  }
}

export class ModuleRemovedEvent extends ModuleEvent {
  readonly idref?: string;
  readonly eventId?: string;
  readonly type?: string;

  constructor(raw: { [key: string]: any }) {
    super(raw);

    let object = this.object as ActivityObject;

    if (object.definition && object.definition.name)
      this.idref = object.definition.name["en-US"];

    if (object.definition && object.definition.description)
      this.eventId = object.definition.description["en-US"];

    if (object.definition && object.definition.extensions) {
      let extensions = object.definition.extensions;

      this.type = extensions[PREFIX_PEBL_EXTENSION + "type"];
    }

  }

  static is(x: XApiStatement): boolean {
    if (!XApiStatement.is(x))
      return false;

    let verb = x.verb.display["en-US"];
    return (verb == "moduleRemovedEvent");
  }
}
