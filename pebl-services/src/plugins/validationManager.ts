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

import { PluginManager } from "../interfaces/pluginManager";


export class DefaultValidationManager {
  private pluginManager: PluginManager;

  constructor(pluginManager: PluginManager) {
    this.pluginManager = pluginManager;
  }

  isMessageFormat(obj: any): boolean {
    if (obj instanceof Object) {
      if ((typeof obj.requestType === "string") &&
        (typeof obj.identity === "string")) {
        return true;
      }
    }
    return false;
  }

  validate(obj: any): boolean {
    if (this.isMessageFormat(obj)) {
      let messageTemplate = this.pluginManager.getMessageTemplate(obj.requestType);
      if (messageTemplate) {
        return messageTemplate.validate(obj);
      }
    }

    return false;
  }
}
