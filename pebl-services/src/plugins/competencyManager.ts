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

import { PeBLPlugin } from "../models/peblPlugin";
import { CompetencyManager } from "../interfaces/competencyManager";
import { SessionDataManager } from "../interfaces/sessionDataManager";

export class DefaultCompetencyManager extends PeBLPlugin implements CompetencyManager {

  // private sessionData: SessionDataManager;

  constructor(sessionData: SessionDataManager) {
    super();
    // this.sessionData = sessionData;

  }

  // validateGetCompetencies(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // validateSaveCompetencies(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // validateDeleteCompetencies(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // getCompetencies(userProfile: UserProfile, callback: ((competencies: Competency[]) => void)): void {
  // 	this.redis.hvals(this.getUserKey(userProfile.identity) + ':' + competenciesKey, function(err, result) {
  // 		if (err) {
  // 			//TODO: handle error
  // 			callback([]);
  // 		} else {
  // 			callback(result.map(function(x) {
  // 				return new Competency(JSON.parse(x));
  // 			}));
  // 		}
  // 	})
  // }

  // saveCompetencies(userProfile: UserProfile, competencies: Competency[]): void {
  // 	let arr = [];
  // 	for (let competency of competencies) {
  // 		arr.push(this.getCompetenciesKey(competency.id));
  // 		arr.push(JSON.stringify(competency));
  // 	}
  // 	this.redis.hmset(this.getUserKey(userProfile.identity) + ':' + competenciesKey, arr);
  // }

  // deleteCompetency(userProfile: UserProfile, id: string): void {
  // 	this.redis.hdel(this.getUserKey(userProfile.identity) + ':' + competenciesKey, this.getCompetenciesKey(id), function(err, res) {
  // 		if (err) {
  // 			//TODO
  // 		} else {
  // 			//TODO
  // 		}
  // 	});
  // }

}
