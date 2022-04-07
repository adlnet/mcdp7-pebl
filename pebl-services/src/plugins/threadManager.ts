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
import { ThreadManager } from "../interfaces/threadManager";
import { SessionDataManager } from "../interfaces/sessionDataManager";
import { Message } from "../models/message";
import { ServiceMessage } from "../models/serviceMessage";
import { MessageTemplate } from "../models/messageTemplate";
import { Voided } from "../models/xapiStatement";
import { PermissionSet } from "../models/permission";
import { generateBroadcastQueueForUserId, generateTimestampForThread, generateThreadKey, generateUserThreadsKey, generateUserPrivateThreadsKey, generateUserGroupThreadsKey, generateSubscribedUsersKey } from "../utils/constants";
import { GroupManager } from "../interfaces/groupManager";
import { SqlDataStore } from "../interfaces/sqlDataStore";

export class DefaultThreadManager extends PeBLPlugin implements ThreadManager {
  private sessionData: SessionDataManager;
  private groupManager: GroupManager;
  private sqlData: SqlDataStore;

  constructor(sessionData: SessionDataManager, sqlData: SqlDataStore, groupManager: GroupManager) {
    super();
    this.sessionData = sessionData;
    this.sqlData = sqlData;
    this.groupManager = groupManager;

    this.addMessageTemplate(new MessageTemplate("reportThreadedMessage",
      this.validateReportThreadedMessage.bind(this),
      this.authorizeReportThreadedMessage.bind(this),
      (payload: { [key: string]: any }) => {
        return this.reportThreadedMessage(payload.identity, payload.message);
      }))

    this.addMessageTemplate(new MessageTemplate("pinThreadedMessage",
      this.validatePinThreadedMessage.bind(this),
      this.authorizePinThreadedMessage.bind(this),
      (payload: { [key: string]: any }) => {
        return this.pinThreadedMessage(payload.identity, payload.message);
      }))

    this.addMessageTemplate(new MessageTemplate("unpinThreadedMessage",
      this.validateUnpinThreadedMessage.bind(this),
      this.authorizeUnpinThreadedMessage.bind(this),
      (payload: { [key: string]: any }) => {
        return this.unpinThreadedMessage(payload.identity, payload.message);
      }))

    this.addMessageTemplate(new MessageTemplate("saveThreadedMessage",
      this.validateStoreThreadedMessage.bind(this),
      this.authorizeStoreThreadedMessage.bind(this),
      (payload: { [key: string]: any }) => {
        return this.storeMessage(payload.identity, payload.message);
      }));

    this.addMessageTemplate(new MessageTemplate("getThreadedMessages",
      this.validateGetThreadedMessages.bind(this),
      this.authorizeGetThreadedMessages.bind(this),
      (payload: { [key: string]: any }) => {
        return this.getMessages(payload.identity, payload.requests);
      }));

    this.addMessageTemplate(new MessageTemplate("subscribeThread",
      this.validateSubscribeThread.bind(this),
      this.authorizeSubscribeThread.bind(this),
      (payload: { [key: string]: any }) => {
        return this.subscribeThread(payload.identity, payload.thread, payload.options);
      }));

    this.addMessageTemplate(new MessageTemplate("unsubscribeThread",
      this.validateUnsubscribeThread.bind(this),
      this.authorizeUnsubscribeThread.bind(this),
      (payload: { [key: string]: any }) => {
        return this.unsubscribeThread(payload.identity, payload.thread, payload.options);
      }));

    this.addMessageTemplate(new MessageTemplate("deleteThreadedMessage",
      this.validateDeleteThreadedMessage.bind(this),
      this.authorizeDeleteThreadedMessage.bind(this),
      (payload: { [key: string]: any }) => {
        return this.deleteMessage(payload.identity, payload.message);
      }));

    this.addMessageTemplate(new MessageTemplate("getSubscribedThreads",
      this.validateGetSubscribedThreads.bind(this),
      this.authorizeGetSubscribedThreads.bind(this),
      (payload: { [key: string]: any }) => {
        return this.getSubscribedThreads(payload.identity);
      }))

    this.addMessageTemplate(new MessageTemplate("getLeastAnsweredQuestions",
      this.validateGetLeastAnsweredQuestions.bind(this),
      this.authorizeGetLeastAnsweredQuestions.bind(this),
      (payload: { [key: string]: any }) => {
        return this.getLeastAnsweredQuestions(payload.identity, payload.params);
      }))

    this.addMessageTemplate(new MessageTemplate("getMostAnsweredQuestions",
      this.validateGetMostAnsweredQuestions.bind(this),
      this.authorizeGetMostAnsweredQuestions.bind(this),
      (payload: { [key: string]: any }) => {
        return this.getMostAnsweredQuestions(payload.identity, payload.params);
      }))

    this.addMessageTemplate(new MessageTemplate("getReportedThreadedMessages",
      this.validateGetReportedThreadedMessages.bind(this),
      this.authorizeGetReportedThreadedMessages.bind(this),
      (payload: { [key: string]: any }) => {
        return this.getReportedThreadedMessages(payload.identity, payload.params);
      }))
  }

  private validateThread(thread: string): boolean {
    //Validates the base thread to make sure its not pretending to be a group thread
    if (thread.includes('_group-') || thread.includes('_user-'))
      return false;
    else
      return true;
  }

  validateGetReportedThreadedMessages(payload: { [key: string]: any }): boolean {
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

  authorizeGetReportedThreadedMessages(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    if (username !== payload.identity)
      return false;

    for (let params of payload.params) {
      if (!permissions.group[params.classId] || !permissions.group[params.classId][payload.requestType])
        return false;
    }

    return true;
  }

  validateGetLeastAnsweredQuestions(payload: { [key: string]: any }): boolean {
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

  authorizeGetLeastAnsweredQuestions(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    if (username !== payload.identity)
      return false;

    for (let params of payload.params) {
      if (!permissions.group[params.classId] || !permissions.group[params.classId][payload.requestType])
        return false;
    }

    return true;
  }

  validateGetMostAnsweredQuestions(payload: { [key: string]: any }): boolean {
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

  authorizeGetMostAnsweredQuestions(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    if (username !== payload.identity)
      return false;

    for (let params of payload.params) {
      if (!permissions.group[params.classId] || !permissions.group[params.classId][payload.requestType])
        return false;
    }

    return true;
  }

  validateGetThreadedMessages(payload: { [key: string]: any }): boolean {
    if (payload.requests) {
      for (let requestIndex in payload.requests) {
        let request = payload.requests[requestIndex];
        if (request.thread && typeof request.thread === "string") {
          if (!this.validateThread(request.thread))
            return false;

          if (request.options) {
            if (!(request.options instanceof Object))
              return false;
            if (request.options.groupId && typeof request.options.groupId !== "string")
              return false;
            if (request.options.isPrivate && typeof request.options.isPrivate !== "boolean")
              return false;
          }
        }
      }
      return true;
    } else {
      let request = payload;
      if (request.thread && typeof request.thread === "string") {
        if (!this.validateThread(request.thread))
          return false;

        if (request.options) {
          if (!(request.options instanceof Object))
            return false;
          if (request.options.groupId && typeof request.options.groupId !== "string")
            return false;
          if (request.options.isPrivate && typeof request.options.isPrivate !== "boolean")
            return false;
        }

        payload.requests = [request];
        return true;
      }
    }

    return false;
  }

  authorizeGetThreadedMessages(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = false;
    let canGroup = false;

    if (username !== payload.identity || !permissions.user[payload.requestType])
      return false;

    for (let request of payload.requests) {
      if (request.options && request.options.isPrivate) {
        canUser = true;
      } else if (request.options && request.options.groupId) {
        if (permissions.group[request.options.groupId] && permissions.group[request.options.groupId][payload.requestType]) {
          canGroup = true;
        } else {
          return false;
        }
      } else {
        canUser = true;
      }
    }

    return canUser || canGroup;
  }

  authorizeReportThreadedMessage(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canGroup = false;

    if (username !== payload.identity)
      return false;

    for (let message of payload.message) {
      if (message.groupId) {
        if (permissions.group[message.groupId] && permissions.group[message.groupId][payload.requestType]) {
          canGroup = true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }

    return canGroup;
  }

  validateReportThreadedMessage(payload: { [key: string]: any }): boolean {
    if (Array.isArray(payload.message)) {
      for (let i = 0; i < payload.message.length; i++) {
        let message = payload.message[i];
        if (message && Message.is(message)) {
          if (!this.validateThread(message.thread))
            return false;

          payload.message[i] = new Message(message);
        }
      }
      return true;
    }
    return false;
  }

  validatePinThreadedMessage(payload: { [key: string]: any }): boolean {
    if (Array.isArray(payload.message)) {
      for (let i = 0; i < payload.message.length; i++) {
        let message = payload.message[i];
        if (message && Message.is(message)) {
          if (!this.validateThread(message.thread))
            return false;

          payload.message[i] = new Message(message);
        }
      }
      return true;
    }
    return false;
  }

  authorizePinThreadedMessage(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canGroup = false;

    if (username !== payload.identity)
      return false;

    for (let message of payload.message) {
      if (message.groupId) {
        if (permissions.group[message.groupId] && permissions.group[message.groupId][payload.requestType]) {
          canGroup = true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }

    return canGroup;
  }

  validateUnpinThreadedMessage(payload: { [key: string]: any }): boolean {
    if (Array.isArray(payload.message)) {
      for (let i = 0; i < payload.message.length; i++) {
        let message = payload.message[i];
        if (message && Message.is(message)) {
          if (!this.validateThread(message.thread))
            return false;

          payload.message[i] = new Message(message);
        }
      }
      return true;
    }
    return false;
  }

  authorizeUnpinThreadedMessage(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canGroup = false;

    if (username !== payload.identity)
      return false;

    for (let message of payload.message) {
      if (message.groupId) {
        if (permissions.group[message.groupId] && permissions.group[message.groupId][payload.requestType]) {
          canGroup = true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }

    return canGroup;
  }

  validateStoreThreadedMessage(payload: { [key: string]: any }): boolean {
    if (Array.isArray(payload.message)) {
      for (let i = 0; i < payload.message.length; i++) {
        let message = payload.message[i];
        if (message && Message.is(message)) {
          if (!this.validateThread(message.thread))
            return false;

          if (payload.message[i].pinned)
            return false;

          payload.message[i] = new Message(message);
        }
      }
      return true;
    }
    return false;
  }

  authorizeStoreThreadedMessage(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = false;
    let canGroup = false;

    if (username !== payload.identity || !permissions.user[payload.requestType])
      return false;
    for (let message of payload.message) {
      if (message.isPrivate) {
        canUser = true;
      } else if (message.groupId) {
        if (permissions.group[message.groupId] && permissions.group[message.groupId][payload.requestType]) {
          canGroup = true;
        } else {
          return false;
        }
      } else {
        canUser = true;
      }
    }


    return canUser || canGroup;
  }

  validateSubscribeThread(payload: { [key: string]: any }): boolean {
    if (Array.isArray(payload.thread) && Array.isArray(payload.options)) {
      for (let i = 0; i < payload.thread.length; i++) {
        let options = payload.options[i];
        let thread = payload.thread[i];
        if ((typeof thread === "string") && (!this.validateThread(thread)))
          return false;
        if (options.groupId && typeof options.groupId !== "string")
          return false;
        if (options.isPrivate && typeof options.isPrivate !== "boolean")
          return false;
      }
      return true;
    }
    return false;
  }

  authorizeSubscribeThread(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = false;
    let canGroup = false;

    if (username !== payload.identity || !permissions.user[payload.requestType])
      return false;

    for (let option of payload.options) {
      if (option.isPrivate) {
        canUser = true;
      } else if (option.groupId) {
        if (permissions.group[option.groupId] && permissions.group[option.groupId][payload.requestType]) {
          canGroup = true;
        } else {
          return false;
        }
      } else {
        canUser = true;
      }
    }

    return canUser || canGroup;
  }

  validateUnsubscribeThread(payload: { [key: string]: any }): boolean {
    if (payload.thread && typeof payload.thread === "string") {
      if (!this.validateThread(payload.thread))
        return false;

      if (payload.groupId && typeof payload.groupId !== "string")
        return false;

      if (payload.isPrivate && typeof payload.isPrivate !== "boolean")
        return false;
    }
    return false;
  }

  authorizeUnsubscribeThread(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = false;
    let canGroup = false;

    if (username !== payload.identity || !permissions.user[payload.requestType])
      return false;

    for (let option of payload.options) {
      if (option.isPrivate) {
        canUser = true;
      } else if (option.groupId) {
        if (permissions.group[option.groupId] && permissions.group[option.groupId][payload.requestType]) {
          canGroup = true;
        } else {
          return false;
        }
      } else {
        canUser = true;
      }
    }

    return canUser || canGroup;
  }

  validateDeleteThreadedMessage(payload: { [key: string]: any }): boolean {
    if (Array.isArray(payload.message)) {
      for (let i = 0; i < payload.message.length; i++) {
        let thread = payload.message[i].thread;
        let xId = payload.message[i].id;
        let message = payload.message[i];
        if (!thread || typeof thread !== "string" || !this.validateThread(thread))
          return false;
        if (!xId || typeof xId !== "string")
          return false;
        if (message.isPrivate && typeof message.isPrivate !== "boolean")
          return false;
        if (message.groupId && typeof message.groupId !== "string")
          return false;
      }
      return true;
    }
    return false;
  }

  authorizeDeleteThreadedMessage(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canGroup = false;

    if (username !== payload.identity)
      return false;

    for (let message of payload.message) {
      if (message.groupId) {
        if (permissions.group[message.groupId] && permissions.group[message.groupId][payload.requestType]) {
          canGroup = true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }


    return canGroup;
  }

  validateGetSubscribedThreads(payload: { [key: string]: any }): boolean {
    return true;
  }

  authorizeGetSubscribedThreads(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity) && (permissions.user[payload.requestType]);
    let canGroup = permissions.group[payload.identity] && permissions.group[payload.identity][payload.requestType];

    return canUser || canGroup;
  }

  async getReportedThreadedMessages(identity: string, params: { [key: string]: any }[]): Promise<{ [key: string]: any }> {
    if (params.length > 0) {
      let messages = await this.sqlData.getReportedThreadedMessages(params[0].bookId, params[0].teamId, params[0].classId);
      return { data: messages };
    }
    return {};
  }

  async getLeastAnsweredQuestions(identity: string, params: { [key: string]: any }[]): Promise<{ [key: string]: any }> {
    if (params.length > 0) {
      let discussions = await this.sqlData.getLeastAnsweredDiscussions(params[0].bookId, params[0].teamId, params[0].classId);
      return { data: discussions };
    }
    return {};
  }

  async getMostAnsweredQuestions(identity: string, params: { [key: string]: any }[]): Promise<{ [key: string]: any }> {
    if (params.length > 0) {
      let discussions = await this.sqlData.getMostAnsweredDiscussions(params[0].bookId, params[0].teamId, params[0].classId);
      return { data: discussions };
    }
    return {};
  }

  async subscribeThread(userId: string, baseThreads: string[], options: { [key: string]: any }[]): Promise<{ [key: string]: any }> {
    for (let i = 0; i < baseThreads.length; i++) {
      let thread = baseThreads[i];
      let option = options[i];
      if (option && option.groupId) {
        await this.sessionData.setHashValue(generateUserGroupThreadsKey(userId, option.groupId), thread, thread);
        await this.sessionData.setHashValue(generateSubscribedUsersKey(this.getGroupScopedThread(thread, option.groupId)),
          userId,
          userId);
      } else if (option && option.isPrivate) {
        await this.sessionData.setHashValue(generateUserPrivateThreadsKey(userId), thread, thread);
      } else {
        await this.sessionData.setHashValue(generateUserThreadsKey(userId), thread, thread);
        await this.sessionData.setHashValue(generateSubscribedUsersKey(thread), userId, userId);
      }
    }

    return {
      data: true,
      // thread: baseThreads,
      // options: options,
      requestType: "subscribeThread"
    };
  }

  async unsubscribeThread(userId: string, baseThreads: string[], options: { [key: string]: any }[]): Promise<true> {
    for (let i = 0; i < baseThreads.length; i++) {
      let thread = baseThreads[i];
      let option = options[i];
      if (option && option.groupId) {
        await this.sessionData.deleteHashValue(generateUserGroupThreadsKey(userId, option.groupId), thread);
        await this.sessionData.deleteHashValue(generateSubscribedUsersKey(this.getGroupScopedThread(thread, option.groupId)), userId);
      } else if (option && option.isPrivate) {
        await this.sessionData.deleteHashValue(generateUserPrivateThreadsKey(userId), thread);
      } else {
        await this.sessionData.deleteHashValue(generateUserThreadsKey(userId), thread);
        await this.sessionData.deleteHashValue(generateSubscribedUsersKey(thread), userId);
      }
    }
    return true;
  }

  private async getSubscribedUsers(realThread: string): Promise<string[]> {
    return this.sessionData.getHashValues(generateSubscribedUsersKey(realThread));
  }

  async getSubscribedThreads(userId: string): Promise<{ [key: string]: any }> {
    let threadsObject = {
      threads: [] as string[],
      privateThreads: [] as string[],
      groupThreads: {} as { [key: string]: string[] }
    };
    let groupIds = await this.groupManager.getUsersGroups(userId);
    let groupKeys = groupIds.map((groupId) => {
      return generateUserGroupThreadsKey(userId, groupId);
    });
    let groupThreads = await this.sessionData.getHashMultiKeys(groupKeys);
    threadsObject.groupThreads = groupThreads;
    let threads = await this.sessionData.getHashKeys(generateUserThreadsKey(userId));
    threadsObject.threads = threads;
    let privateThreads = await this.sessionData.getHashKeys(generateUserPrivateThreadsKey(userId));
    threadsObject.privateThreads = privateThreads;
    return { data: threadsObject, requestType: "getSubscribedThreads" };
  }

  private getGroupScopedThread(thread: string, groupId: string): string {
    return thread + '_group-' + groupId;
  }

  private getPrivateScopedThread(thread: string, username: string): string {
    return thread + '_user-' + username;
  }

  async reportThreadedMessage(userId: string, messages: Message[]): Promise<true> {
    let reports = [];
    for (let message of messages) {
      if (Message.isDiscussion(message))
        reports.push(message);
    }
    if (reports.length > 0)
      await this.sqlData.insertReportedThreadedMessages(reports);

    return true;
  }

  async pinThreadedMessage(userId: string, messages: Message[]): Promise<true> {
    for (let message of messages) {
      message.pinned = true;

      let thread = message.thread;
      if (message.groupId)
        thread = this.getGroupScopedThread(thread, message.groupId);
      else if (message.isPrivate)
        thread = this.getPrivateScopedThread(thread, userId);

      let date = new Date();
      message.stored = date.toISOString();

      let messageStr = JSON.stringify(message);

      await this.sessionData.addTimestampValue(generateTimestampForThread(thread), date.getTime(), message.id);
      await this.sessionData.setHashValue(generateThreadKey(thread), message.id, messageStr);

      if (!message.isPrivate) {
        let users = await this.getSubscribedUsers(thread);
        for (let user of users) {
          if (user !== userId) { //Don't send the message to the sender
            await this.sessionData.broadcast(generateBroadcastQueueForUserId(user), JSON.stringify(new ServiceMessage(user, {
              requestType: "newThreadedMessage",
              data: message,
              thread: message.thread,
              options: { isPrivate: message.isPrivate, groupId: message.groupId }
            })));
          }
        }
      }
    }
    return true;
  }

  async unpinThreadedMessage(userId: string, messages: Message[]): Promise<true> {
    for (let message of messages) {
      message.pinned = false;
      message.pinMessage = undefined;

      let thread = message.thread;
      if (message.groupId)
        thread = this.getGroupScopedThread(thread, message.groupId);
      else if (message.isPrivate)
        thread = this.getPrivateScopedThread(thread, userId);

      let date = new Date();
      message.stored = date.toISOString();

      let messageStr = JSON.stringify(message);

      await this.sessionData.addTimestampValue(generateTimestampForThread(thread), date.getTime(), message.id);
      await this.sessionData.setHashValue(generateThreadKey(thread), message.id, messageStr);

      if (!message.isPrivate) {
        let users = await this.getSubscribedUsers(thread);
        for (let user of users) {
          if (user !== userId) { //Don't send the message to the sender
            await this.sessionData.broadcast(generateBroadcastQueueForUserId(user), JSON.stringify(new ServiceMessage(user, {
              requestType: "newThreadedMessage",
              data: message,
              thread: message.thread,
              options: { isPrivate: message.isPrivate, groupId: message.groupId }
            })));
          }
        }
      }
    }
    return true;
  }

  async storeMessage(userId: string, messages: Message[]): Promise<true> {
    let date = new Date();
    let timestampString = date.toISOString();
    let timestamp = date.getTime();
    let discussions = [];

    for (let message of messages) {
      let thread = message.thread;
      if (message.groupId)
        thread = this.getGroupScopedThread(thread, message.groupId);
      else if (message.isPrivate)
        thread = this.getPrivateScopedThread(thread, userId);

      message.stored = timestampString;

      let messageCopy = JSON.parse(JSON.stringify(message));

      try {
        if (messageCopy.result && messageCopy.result.response) {
          let jsonMessage = JSON.parse(messageCopy.result.response);
          let stringResponse = jsonMessage.map((x: any) => { return x.text }).join();
          messageCopy.result.response = stringResponse;
        }
      } catch (e) {
        //TODO
      }

      let messageStr = JSON.stringify(message);

      await this.sessionData.queueForLrs(JSON.stringify(messageCopy));

      if (Message.isDiscussion(message))
        discussions.push(message);

      await this.sessionData.addTimestampValue(generateTimestampForThread(thread), timestamp, message.id);
      await this.sessionData.setHashValue(generateThreadKey(thread), message.id, messageStr);

      if (!message.isPrivate) {
        let users = await this.getSubscribedUsers(thread);
        for (let user of users) {
          if (user !== userId) { //Don't send the message to the sender
            await this.sessionData.broadcast(generateBroadcastQueueForUserId(user), JSON.stringify(new ServiceMessage(user, {
              requestType: "newThreadedMessage",
              data: message,
              thread: message.thread,
              options: { isPrivate: message.isPrivate, groupId: message.groupId }
            })));
          }
        }
      }
    }

    if (discussions.length > 0)
      await this.sqlData.insertDiscussions(discussions);

    return true;
  }

  async getMessages(userId: string, threadRequests: { [key: string]: any }[]): Promise<{ [key: string]: any }[]> {
    let results: { [key: string]: any }[] = [];

    for (let threadRequest of threadRequests) {
      let baseThread = threadRequest.thread;
      let timestamp = threadRequest.timestamp;
      let options = threadRequest.options;
      let thread = baseThread;
      if (options && options.groupId)
        thread = this.getGroupScopedThread(thread, options.groupId);
      else if (options && options.isPrivate)
        thread = this.getPrivateScopedThread(thread, userId);

      let data = await this.sessionData.getValuesGreaterThanTimestamp(generateTimestampForThread(thread), timestamp);
      let vals = await this.sessionData.getHashMultiField(generateThreadKey(thread), data);
      results.push({
        data: vals.map((val) => {
          let obj = JSON.parse(val);
          if (Message.is(obj))
            return new Message(obj);
          else
            return new Voided(obj);
        }),
        thread: baseThread,
        options: options
      });
    }

    return results;
  }

  async deleteMessage(userId: string, messages: Message[]): Promise<boolean> {
    let messageIds = [];
    for (let i = 0; i < messages.length; i++) {
      let baseThread = messages[i].thread;
      let messageId = messages[i].id;
      let message = messages[i];
      let thread = baseThread;
      if (message.groupId)
        thread = this.getGroupScopedThread(baseThread, message.groupId);
      else if (message.isPrivate)
        thread = this.getPrivateScopedThread(baseThread, userId)

      let data = await this.sessionData.getHashValue(generateThreadKey(thread), messageId);
      if (data) {
        await this.sessionData.queueForLrsVoid(data);
        let voided = new Message(JSON.parse(data)).toVoidRecord();
        await this.sessionData.addTimestampValue(generateTimestampForThread(thread), new Date(voided.stored).getTime(), voided.id);
        await this.sessionData.setHashValue(generateThreadKey(thread), voided.id, JSON.stringify(voided));
        if (!(message.isPrivate)) {
          let users = await this.getSubscribedUsers(thread);
          for (let user of users) {
            await this.sessionData.broadcast(generateBroadcastQueueForUserId(user),
              JSON.stringify(new ServiceMessage(user, {
                requestType: "newThreadedMessage",
                data: voided,
                thread: baseThread,
                options: {
                  isPrivate: message.isPrivate,
                  groupId: message.groupId
                }
              })));
          }
        }
      }
      await this.sessionData.deleteSortedTimestampMember(generateTimestampForThread(thread), messageId);
      await this.sessionData.deleteHashValue(generateThreadKey(thread), messageId);
      messageIds.push(messageId);
    }
    if (messageIds.length > 0) {
      await this.sqlData.deleteReportedThreadedMessage(messageIds)
    }
    return true;
  }
}
