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
import { Question } from "../models/question";
import { Quiz } from "../models/quiz";

export interface QuizManager extends PeBLPlugin {

  // validateGetQuestions(payload: { [key: string]: any }): boolean;
  validateSaveQuestions(payload: { [key: string]: any }): boolean;
  // validateDeleteQuestion(payload: { [key: string]: any }): boolean;

  // validateGetQuizes(payload: { [key: string]: any }): boolean;
  validateSaveQuizes(payload: { [key: string]: any }): boolean;
  // validateDeleteQuiz(payload: { [key: string]: any }): boolean;

  // getQuestions(identity: string, callback: ((stmts: Question[]) => void)): void
  saveQuestions(identity: string, stmts: Question[], callback: ((success: boolean) => void)): void;
  // deleteQuestion(identity: string, id: string, callback: ((success: boolean) => void)): void;

  // getQuizes(identity: string, callback: ((stmts: Quiz[]) => void)): void
  saveQuizes(identity: string, stmts: Quiz[], callback: ((success: boolean) => void)): void;
  // deleteQuiz(identity: string, id: string, callback: ((success: boolean) => void)): void;
}
