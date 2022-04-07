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

import { Annotation } from "./annotation";
import { XApiStatement, ActivityObject } from "./xapiStatement";
import { PREFIX_PEBL_EXTENSION } from "../utils/constants";


export class SharedAnnotation extends Annotation {
  groupId: string;

  constructor(raw: { [key: string]: any }) {
    super(raw);

    let object = this.object as ActivityObject;

    if (object.definition && object.definition.extensions) {
      let extensions = object.definition.extensions;
      this.groupId = extensions[PREFIX_PEBL_EXTENSION + 'groupId'];
    } else {
      this.groupId = '';
    }

  }

  static is(x: any): boolean {
    if (!XApiStatement.is(x))
      return false;

    if (!x.groupId || typeof x.groupId !== 'string' || x.groupId.length === 0)
      return false;

    let verb = x.verb.display["en-US"];
    return (verb == "shared");
  }
}
