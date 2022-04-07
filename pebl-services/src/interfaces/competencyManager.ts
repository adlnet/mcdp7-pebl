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

export interface CompetencyManager extends PeBLPlugin {


  // validateGetCompetencies(payload: { [key: string]: any }): boolean;
  // validateSaveCompetencies(payload: { [key: string]: any }): boolean;
  // validateDeleteCompetencies(payload: { [key: string]: any }): boolean;

  // getCompetencies(identity: string, callback: ((competencies: Competency[]) => void)): void; //Retrueve competencies for this user
  // saveCompetencies(identity: string, competencies: Competency[]): void; //Store competencies for this user
  // deleteCompetency(identity: string, id: string): void; //Removes the competency with the specified id
}
