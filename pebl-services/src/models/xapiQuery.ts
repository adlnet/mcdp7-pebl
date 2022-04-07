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

export class XApiQuery {
  statementId?: string;
  voidedStatementId?: string;
  agent?: string;
  verb?: string;
  activity?: string;
  registration?: string;
  related_activities?: boolean;
  related_agents?: boolean;
  since?: string;
  until?: string;
  limit?: number;
  format?: string;
  attachments?: boolean;
  ascending?: boolean;

  constructor(raw: { [key: string]: any }) {
    this.statementId = raw.statementId;
    this.voidedStatementId = raw.voidedStatementId;
    this.agent = raw.agent;
    this.verb = raw.verb;
    this.activity = raw.activity;
    this.registration = raw.registration;
    this.related_activities = raw.related_activities;
    this.related_agents = raw.related_agents;
    this.since = raw.since;
    this.until = raw.until;
    this.limit = raw.limit;
    this.format = raw.format;
    this.attachments = raw.attachments;
    this.ascending = raw.ascending;
  }

  toQueryString(): string {
    let self = this;
    let queryString = Object.keys(this).reduce(function(result: string[], key) {
      if ((<any>self)[key] !== undefined) {
        result.push(key + '=' + encodeURIComponent((<any>self)[key]));
      }
      return result;
    }, []).join('&');
    return queryString;
  }
}
