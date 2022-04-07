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
import { MessageTemplate } from "../models/messageTemplate";
import { PeBLPlugin } from "../models/peblPlugin";
import { auditLogger } from "../main";
import { LogCategory, Severity } from "../utils/constants";


export class DefaultPluginManager implements PluginManager {
  private registeredTemplates: { [key: string]: MessageTemplate } = {};

  constructor() {

  }

  getMessageTemplates(): { [key: string]: MessageTemplate } {
    return this.registeredTemplates;
  }

  getMessageTemplate(verb: string): MessageTemplate | null {
    return this.registeredTemplates[verb];
  }

  register<T extends PeBLPlugin>(plugin: T): void {
    let messageTemplates = plugin.getMessageTemplates();
    for (let messageTemplate of messageTemplates) {
      if (!this.registeredTemplates[messageTemplate.verb]) {
        auditLogger.report(LogCategory.SYSTEM, Severity.INFO, "AddPluginVerb", messageTemplate.verb)
        this.registeredTemplates[messageTemplate.verb] = messageTemplate;
      } else {
        auditLogger.report(LogCategory.SYSTEM, Severity.CRITICAL, "OverwrotePluginMsgTemplate", messageTemplate.verb);
      }
    }
  }
}
