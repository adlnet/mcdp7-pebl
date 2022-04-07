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
import { QuizManager } from "../interfaces/quizManager";
import { SessionDataManager } from "../interfaces/sessionDataManager";
import { Quiz } from "../models/quiz";
import { Question } from "../models/question";
import { generateUserQuizesKey, generateQuizesKey, generateUserQuestionsKey, generateQuestionsKey, LogCategory, Severity } from "../utils/constants";
import { PermissionSet } from "../models/permission";
import { MessageTemplate } from "../models/messageTemplate";
import { auditLogger } from "../main";
import { SqlDataStore } from "../interfaces/sqlDataStore";

export class DefaultQuizManager extends PeBLPlugin implements QuizManager {
  private sessionData: SessionDataManager;
  private sqlData: SqlDataStore;

  constructor(sessionData: SessionDataManager, sqlData: SqlDataStore) {
    super();
    this.sessionData = sessionData;
    this.sqlData = sqlData;
    this.addMessageTemplate(new MessageTemplate("getQuizes",
      this.validateGetQuizes.bind(this),
      this.authorizeGetQuizes.bind(this),
      (payload: { [key: string]: any }) => {
        return this.getQuizes(payload.identity);
      }));

    this.addMessageTemplate(new MessageTemplate("saveQuizes",
      this.validateSaveQuizes.bind(this),
      this.authorizeSaveQuizes.bind(this),
      (payload: { [key: string]: any }) => {
        return this.saveQuizes(payload.identity, payload.quizes);
      }));

    this.addMessageTemplate(new MessageTemplate("deleteQuiz",
      this.validateDeleteQuiz.bind(this),
      this.authorizeDeleteQuiz.bind(this),
      (payload: { [key: string]: any }) => {
        return this.deleteQuiz(payload.identity, payload.xId);
      }));

    this.addMessageTemplate(new MessageTemplate("getQuestions",
      this.validateGetQuestions.bind(this),
      this.authorizeGetQuestions.bind(this),
      (payload: { [key: string]: any }) => {
        return this.getQuestions(payload.identity);
      }));

    this.addMessageTemplate(new MessageTemplate("saveQuestions",
      this.validateSaveQuestions.bind(this),
      this.authorizeSaveQuestions.bind(this),
      (payload: { [key: string]: any }) => {
        return this.saveQuestions(payload.identity, payload.questions);
      }));

    this.addMessageTemplate(new MessageTemplate("deleteQuestion",
      this.validateDeleteQuestion.bind(this),
      this.authorizeDeleteQuestion.bind(this),
      (payload: { [key: string]: any }) => {
        return this.deleteQuestion(payload.identity, payload.xId);
      }));

    this.addMessageTemplate(new MessageTemplate("getQuizAttempts",
      this.validateGetQuizAttempts.bind(this),
      this.authorizeGetQuizAttempts.bind(this),
      (payload: { [key: string]: any }) => {
        return this.getQuizAttempts(payload.identity, payload.params);
      }))
  }

  validateGetQuizAttempts(payload: { [key: string]: any }): boolean {
    if (payload.params && Array.isArray(payload.params) && payload.params.length > 0) {
      for (let params of payload.params) {
        if (!params.bookId || typeof params.bookId !== 'string' || params.bookId.length === 0)
          return false;
        if (!params.teamId || typeof params.teamId !== 'string' || params.teamId.length === 0)
          return false;
        if (!params.classId || typeof params.classId !== 'string' || params.classId.length == 0)
          return false;
      }
      return true;
    }
    return false;
  }

  authorizeGetQuizAttempts(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    if (username !== payload.identity)
      return false;

    for (let params of payload.params) {
      if (!permissions.group[params.classId] || !permissions.group[params.classId][payload.requestType])
        return false;
    }

    return true;
  }

  validateGetQuizes(payload: { [key: string]: any }): boolean {
    //TODO
    return true;
  }

  authorizeGetQuizes(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
    let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

    return canUser || canGroup;
  }

  validateSaveQuizes(payload: { [key: string]: any }): boolean {
    if (payload.quizes && Array.isArray(payload.quizes) && payload.quizes.length > 0) {
      for (let quiz in payload.quizes) {
        if (Quiz.is(payload.quizes[quiz])) {
          payload.quizes[quiz] = new Quiz(payload.quizes[quiz]);
        }
        else
          return false;
      }
      return true;
    }
    return false;
  }

  authorizeSaveQuizes(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
    let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

    return canUser || canGroup;
  }

  validateDeleteQuiz(payload: { [key: string]: any }): boolean {
    if (Array.isArray(payload.xId)) {
      for (let xId of payload.xId) {
        if (typeof xId === "string")
          return false;
      }
    }
    return true;
  }

  authorizeDeleteQuiz(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
    let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

    return canUser || canGroup;
  }

  validateGetQuestions(payload: { [key: string]: any }): boolean {
    //TODO
    return true;
  }

  authorizeGetQuestions(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
    let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

    return canUser || canGroup;
  }

  validateSaveQuestions(payload: { [key: string]: any }): boolean {
    if (payload.questions && Array.isArray(payload.questions) && payload.questions.length > 0) {
      for (let question in payload.questions) {
        if (Question.is(payload.questions[question])) {
          payload.questions[question] = new Question(payload.questions[question]);
        }
        else
          return false;
      }
      return true;
    }
    return false;
  }

  authorizeSaveQuestions(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
    let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

    return canUser || canGroup;
  }

  validateDeleteQuestion(payload: { [key: string]: any }): boolean {
    if (Array.isArray(payload.xId)) {
      for (let xId of payload.xId) {
        if (typeof xId === "string")
          return false;
      }
    }
    return true;
  }

  authorizeDeleteQuestion(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity) && (permissions.user[payload.requestType])
    let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType]

    return canUser || canGroup;
  }

  async getQuizAttempts(identity: string, params: { [key: string]: any }[]): Promise<{ [key: string]: any }> {
    if (params.length > 0) {
      let attempts = await this.sqlData.getQuizAttempts(params[0].bookId, params[0].teamId, params[0].classId);
      let attemptsObject = {} as any;
      for (let attempt of attempts) {
        if (!attemptsObject[attempt.quizid])
          attemptsObject[attempt.quizid] = {};

        if (!attemptsObject[attempt.quizid].prompt)
          attemptsObject[attempt.quizid].prompt = attempt.question;

        if (!attemptsObject[attempt.quizid].url)
          attemptsObject[attempt.quizid].url = attempt.url;

        if (!attemptsObject[attempt.quizid].responses)
          attemptsObject[attempt.quizid].responses = {}

        if (!attemptsObject[attempt.quizid].totalCount)
          attemptsObject[attempt.quizid].totalCount = 0;

        attemptsObject[attempt.quizid].totalCount += attempt.count;

        attemptsObject[attempt.quizid].responses[attempt.response] = {
          success: attempt.correct,
          count: attempt.count
        };
      }
      return { data: attemptsObject };
    }
    return {};
  }

  async getQuizes(identity: string): Promise<Quiz[]> {
    let result = await this.sessionData.getHashValues(generateUserQuizesKey(identity));
    return result.map(function(x) {
      return new Quiz(JSON.parse(x));
    });
  }

  async saveQuizes(identity: string, quizes: Quiz[]): Promise<true> {
    let arr = [];
    for (let quiz of quizes) {
      arr.push(JSON.stringify(quiz));
    }
    await this.sessionData.queueForLrs(arr);
    return true;
  }

  async deleteQuiz(identity: string, ids: string[]): Promise<true> {
    for (let id of ids) {
      let data = await this.sessionData.getHashValue(generateUserQuizesKey(identity), generateQuizesKey(id));
      if (data) {
        this.sessionData.queueForLrsVoid(data);
      }
      let result = await this.sessionData.deleteHashValue(generateUserQuizesKey(identity), generateQuizesKey(id));
      if (!result) {
        auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelActionFail", identity, id);
      }
    }
    return true;
  }

  async getQuestions(identity: string): Promise<Question[]> {
    let result = await this.sessionData.getHashValues(generateUserQuestionsKey(identity));
    return result.map(function(x) {
      return new Question(JSON.parse(x));
    });
  }

  async saveQuestions(identity: string, questions: Question[]): Promise<true> {
    let arr = [];
    for (let question of questions) {
      arr.push(JSON.stringify(question));
    }
    await this.sessionData.queueForLrs(arr);
    this.sqlData.insertQuizAttempts(questions);
    return true;
  }

  async deleteQuestion(identity: string, ids: string[]): Promise<true> {
    for (let id of ids) {
      let data = await this.sessionData.getHashValue(generateUserQuestionsKey(identity), generateQuestionsKey(id));
      if (data) {
        await this.sessionData.queueForLrsVoid(data);
      }
      let result = await this.sessionData.deleteHashValue(generateUserQuestionsKey(identity), generateQuestionsKey(id));
      if (!result) {
        auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelActionFail", identity, id);
      }
    }
    return true;
  }
}
