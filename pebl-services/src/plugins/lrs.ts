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

import { LRS } from '../interfaces/lrsManager';
import * as network from '../utils/network';
import { Endpoint } from '../models/endpoint';
import { XApiStatement, Voided } from '../models/xapiStatement';
import { XApiQuery } from '../models/xapiQuery';
import { Activity } from '../models/activity';
import { Profile } from '../models/profile';
import { PREFIX_PEBL_THREAD, LogCategory, Severity } from '../utils/constants';
import { auditLogger } from '../main';

export class LRSPlugin implements LRS {
  private endpoint: Endpoint;

  constructor(endpoint: Endpoint) {
    this.endpoint = endpoint;
  }

  private cleanXApiStatement(xapi: { [key: string]: any }): { [key: string]: any } {
    if (xapi.object.definition) {
      if (xapi.object.definition.name && Object.keys(xapi.object.definition.name).length == 0) {
        delete xapi.object.definition.name;
      }
      if (xapi.object.definition.description && Object.keys(xapi.object.definition.description).length == 0) {
        delete xapi.object.definition.description;
      }
    }

    return xapi;
  }

  storeStatements(stmts: XApiStatement[], successCb: ((string: string) => void), failureCb: ((e: Error | { [key: string]: any }) => void)): void {

    let stmtSet: { [key: string]: { [key: string]: any } } = {};
    stmts.forEach((rec) => {
      delete rec.identity;
      rec = rec.toXAPI();
      if (rec.id && stmtSet[rec.id]) {
        auditLogger.report(LogCategory.SYSTEM, Severity.ERROR, "DupedxAPIID", rec.id);
      }
      let r = this.cleanXApiStatement(rec);
      if (r)
        stmtSet[rec.id] = r;
    });

    let path = this.endpoint.path + "statements";
    network.postData(this.endpoint.host, path, this.endpoint.headers, JSON.stringify(Object.values(stmtSet)), successCb, failureCb);
  }

  voidStatements(stmts: XApiStatement[]): Voided[] {
    let voidedStatements = stmts.map(function(stmt) {
      return stmt.toVoidRecord();
    });

    return voidedStatements;
  }

  parseStatements(strings: string[]): [XApiStatement[], Activity[], Profile[], { [key: string]: string }] {
    let statements = [] as XApiStatement[];
    let activities = [] as Activity[];
    let profiles = [] as Profile[];
    let lookup: { [key: string]: string } = {};
    for (let str of strings) {
      let obj = JSON.parse(str);
      if (XApiStatement.is(obj)) {
        let x = new XApiStatement(obj);
        if (x.id) {
          if (x.id.length > 36) {
            auditLogger.report(LogCategory.NETWORK, Severity.WARNING, "LRSInvalidxAPIID", x);
            delete x.id;
          } else {
            lookup[x.id] = str;
          }
        }
        statements.push(x);
      } else if (Activity.is(obj)) {
        let a = new Activity(obj);
        activities.push(a);
        lookup[a.id] = str;
      } else if (Profile.is(obj)) {
        let p = new Profile(obj);
        profiles.push(p);
        lookup[p.id] = str;
      }
    }
    return [statements, activities, profiles, lookup];
  }

  getStatements(xApiQuery: XApiQuery, callback: ((stmts: XApiStatement[]) => void)): void {
    let path = this.endpoint.path + "statements?" + xApiQuery.toQueryString();

    network.getData(this.endpoint.host, path, this.endpoint.headers, function(incomingData) {
      //TODO: deal with "more" link in response
      callback(JSON.parse(incomingData).statements);
    }, function(e) {
      callback([]);
    });
  }

  storeActivity(activity: Activity, callback: ((success: boolean) => void)): void {
    let jsObj = JSON.stringify(activity.toTransportFormat());

    let headers = JSON.parse(JSON.stringify(this.endpoint.headers));

    if (activity.etag) {
      Object.assign(headers, { "If-Match": activity.etag });
    }

    let path = this.endpoint.path + "activities/profile?activityId=" + encodeURIComponent(PREFIX_PEBL_THREAD + activity.type + "s") + "&profileId=" + activity.id;

    network.postData(this.endpoint.host, path, headers, jsObj, function() {
      callback(true);
    }, function() {
      callback(false);
    });
  }

  getActivity(activityType: string, callback: ((activity?: Activity) => void), activityId?: string): void {
    let path = this.endpoint.path + "activities/profile?activityId=" + encodeURIComponent(PREFIX_PEBL_THREAD + activityType + "s") + (activityId ? ("&profileId=" + encodeURIComponent(activityId)) : '') + "&t=" + Date.now();

    network.getData(this.endpoint.host, path, this.endpoint.headers, function(incomingData) {
      let jsonObj = JSON.parse(incomingData);
      callback(new Activity(jsonObj));
    }, function(e) {
      callback();
    });
  }

  removeActivity(activity: Activity, callback: ((success: boolean) => void)): void {
    let headers = JSON.parse(JSON.stringify(this.endpoint.headers));
    if (activity.etag) {
      Object.assign(headers, { "If-Match": activity.etag });
    }
    let path = this.endpoint.path + "activities/profile?activityId=" + encodeURIComponent(PREFIX_PEBL_THREAD + activity.type + "s") + "&profileId=" + activity.id;

    network.deleteData(this.endpoint.host, path, headers, function(incomingData) {
      callback(true);
    }, function(e) {
      callback(false);
    });
  }

  storeProfile(profile: Profile, callback: ((success: boolean) => void)): void {
    let jsObj = JSON.stringify(profile.toTransportFormat());

    let headers = JSON.parse(JSON.stringify(this.endpoint.headers));

    if (profile.etag) {
      Object.assign(headers, { "If-Match": profile.etag });
    }

    let path = this.endpoint.path + "agents/profile?agent=" + encodeURIComponent(PREFIX_PEBL_THREAD + profile.type + "s") + "&profileId=" + profile.id;

    network.postData(this.endpoint.host, path, headers, jsObj, function() {
      callback(true);
    }, function() {
      callback(false);
    });
  }

  getProfile(profileType: string, callback: ((profile?: Profile) => void), profileId?: string): void {
    let path = this.endpoint.path + "agents/profile?agent=" + encodeURIComponent(PREFIX_PEBL_THREAD + profileType + "s") + (profileId ? ("&profileId=" + encodeURIComponent(profileId)) : '') + "&t=" + Date.now();

    network.getData(this.endpoint.host, path, this.endpoint.headers, function(incomingData) {
      let jsonObj = JSON.parse(incomingData);
      callback(new Profile(jsonObj));
    }, function(e) {
      callback();
    });
  }

  removeProfile(profile: Profile, callback: ((success: boolean) => void)): void {
    let headers = JSON.parse(JSON.stringify(this.endpoint.headers));
    if (profile.etag) {
      Object.assign(headers, { "If-Match": profile.etag });
    }
    let path = this.endpoint.path + "agents/profile?agent=" + encodeURIComponent(PREFIX_PEBL_THREAD + profile.type + "s") + "&profileId=" + profile.id;

    network.deleteData(this.endpoint.host, path, headers, function(incomingData) {
      callback(true);
    }, function(e) {
      callback(false);
    });
  }

}
