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

import { XApiStatement } from "../models/xapiStatement";
import { XApiQuery } from "../models/xapiQuery";
import { Activity } from "../models/activity";
import { Profile } from "../models/profile";


export interface LRS {
  storeStatements(stmts: XApiStatement[], successCb: ((string: string) => void), failureCb: ((e: Error | { [key: string]: any }) => void)): void; //Store the specified statements into an LRS
  voidStatements(stmts: XApiStatement[]): void; //Void the specified statements in an LRS

  parseStatements(strings: string[]): [XApiStatement[], Activity[], Profile[], { [key: string]: string }];
  getStatements(xApiQuery: XApiQuery, callback: ((stmts?: XApiStatement[]) => void)): void;

  storeActivity(activity: Activity, callback: ((success: boolean) => void)): void; //Store the specified activity into an LRS
  getActivity(activityType: string, callback: ((activity?: Activity) => void), activityId?: string): void;  //Retrieves the specified activity from an LRS
  removeActivity(activity: Activity, callback: ((success: boolean) => void)): void; //Removes the specified activity from an LRS

  storeProfile(profile: Profile, callback: ((success: boolean) => void)): void; //Store the specified profile into an LRS
  getProfile(profileType: string, callback: ((profile?: Profile) => void), profileId?: string): void; //Retrieves the specified profile from an LRS
  removeProfile(profile: Profile, callback: ((success: boolean) => void)): void; //Removes the specified profile from an LRS
}

