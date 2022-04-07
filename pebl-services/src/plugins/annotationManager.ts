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
import { AnnotationManager } from "../interfaces/annotationManager";
import { SessionDataManager } from "../interfaces/sessionDataManager";
import { Annotation } from "../models/annotation";
import { SharedAnnotation } from "../models/sharedAnnotation";
import { generateSubscribedSharedAnnotationsUsersKey, generateGroupSharedAnnotationsTimestamps, generateGroupSharedAnnotationsKey, generateUserAnnotationsKey, generateSharedAnnotationsKey, generateAnnotationsKey, generateTimestampForAnnotations, generateBroadcastQueueForUserId, LogCategory, Severity } from "../utils/constants";
import { MessageTemplate } from "../models/messageTemplate";
import { Voided } from "../models/xapiStatement";
import { PermissionSet } from "../models/permission";
import { ServiceMessage } from "../models/serviceMessage";
import { auditLogger } from "../main";


export class DefaultAnnotationManager extends PeBLPlugin implements AnnotationManager {

  private sessionData: SessionDataManager;

  constructor(sessionData: SessionDataManager) {
    super();
    this.sessionData = sessionData;
    this.addMessageTemplate(new MessageTemplate("getAnnotations",
      this.validateGetAnnotations.bind(this),
      this.authorizeGetAnnotations.bind(this),
      (payload: { [key: string]: any }) => {
        return this.getAnnotations(payload.identity, payload.timestamp);
      }));

    this.addMessageTemplate(new MessageTemplate("saveAnnotations",
      this.validateSaveAnnotations.bind(this),
      this.authorizeSaveAnnotations.bind(this),
      (payload: { [key: string]: any }) => {
        return this.saveAnnotations(payload.identity, payload.stmts);
      }));

    this.addMessageTemplate(new MessageTemplate("getSharedAnnotations",
      this.validateGetSharedAnnotations.bind(this),
      this.authorizeGetSharedAnnotations.bind(this),
      (payload: { [key: string]: any }) => {
        return this.getSharedAnnotations(payload.identity, payload.groupId, payload.timestamp);
      }));

    this.addMessageTemplate(new MessageTemplate("saveSharedAnnotations",
      this.validateSaveSharedAnnotations.bind(this),
      this.authorizeSaveSharedAnnotations.bind(this),
      (payload: { [key: string]: any }) => {
        return this.saveSharedAnnotations(payload.identity, payload.stmts);
      }));

    this.addMessageTemplate(new MessageTemplate("deleteAnnotation",
      this.validateDeleteAnnotation.bind(this),
      this.authorizeDeleteAnnotation.bind(this),
      (payload: { [key: string]: any }) => {
        return this.deleteAnnotation(payload.identity, payload.xId);
      }));

    this.addMessageTemplate(new MessageTemplate("deleteSharedAnnotation",
      this.validateDeleteSharedAnnotation.bind(this),
      this.authorizeDeleteSharedAnnotation.bind(this),
      (payload: { [key: string]: any }) => {
        return this.deleteSharedAnnotation(payload.identity, payload.annotation);
      }));

    this.addMessageTemplate(new MessageTemplate("pinSharedAnnotation",
      this.validatePinSharedAnnotation.bind(this),
      this.authorizePinSharedAnnotation.bind(this),
      (payload: { [key: string]: any }) => {
        return this.pinSharedAnnotation(payload.identity, payload.annotation);
      }));

    this.addMessageTemplate(new MessageTemplate("unpinSharedAnnotation",
      this.validateUnpinSharedAnnotation.bind(this),
      this.authorizeUnpinSharedAnnotation.bind(this),
      (payload: { [key: string]: any }) => {
        return this.unpinSharedAnnotation(payload.identity, payload.annotation);
      }));

    this.addMessageTemplate(new MessageTemplate("subscribeSharedAnnotations",
      this.validateSubscribeSharedAnnotations.bind(this),
      this.authorizeSubscribeSharedAnnotations.bind(this),
      (payload: { [key: string]: any }) => {
        return this.subscribeSharedAnnotations(payload.identity, payload.groupId);
      }));

    this.addMessageTemplate(new MessageTemplate("unsubscribeSharedAnnotations",
      this.validateUnsubscribeSharedAnnotations.bind(this),
      this.authorizeUnsubscribeSharedAnnotations.bind(this),
      (payload: { [key: string]: any }) => {
        return this.unsubscribeSharedAnnotations(payload.identity, payload.groupId);
      }));
  }

  validatePinSharedAnnotation(payload: { [key: string]: any }): boolean {
    if (payload.annotation && (payload.annotation instanceof Array) && (payload.annotation.length > 0)) {
      for (let annotationIndex in payload.annotation) {
        let annotation = payload.annotation[annotationIndex];

        if (SharedAnnotation.is(annotation)) {
          payload.annotation[annotationIndex] = new SharedAnnotation(annotation);
        } else {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  authorizePinSharedAnnotation(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    for (let annotation of payload.annotation) {
      if (!permissions.group[annotation.groupId] || !permissions.group[annotation.groupId][payload.requestType])
        return false;
    }
    return true;
  }

  validateUnpinSharedAnnotation(payload: { [key: string]: any }): boolean {
    if (payload.annotation && (payload.annotation instanceof Array) && (payload.annotation.length > 0)) {
      for (let annotationIndex in payload.annotation) {
        let annotation = payload.annotation[annotationIndex];

        if (SharedAnnotation.is(annotation)) {
          payload.annotation[annotationIndex] = new SharedAnnotation(annotation);
        } else {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  authorizeUnpinSharedAnnotation(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    for (let annotation of payload.annotation) {
      if (!permissions.group[annotation.groupId] || !permissions.group[annotation.groupId][payload.requestType])
        return false;
    }
    return true;
  }

  validateGetAnnotations(payload: { [key: string]: any }): boolean {
    return true;
  }

  authorizeGetAnnotations(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity && permissions.user[payload.requestType])

    return canUser;
  }

  validateSaveAnnotations(payload: { [key: string]: any }): boolean {
    if (payload.stmts && (payload.stmts instanceof Array) && (payload.stmts.length > 0)) {
      for (let annotationIndex in payload.stmts) {
        let annotation = payload.stmts[annotationIndex];
        if (Annotation.is(annotation)) {
          payload.stmts[annotationIndex] = new Annotation(annotation);
        } else {
          return false;
        }
      }
    }

    return true;
  }

  authorizeSaveAnnotations(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity && permissions.user[payload.requestType])

    return canUser;
  }

  validateGetSharedAnnotations(payload: { [key: string]: any }): boolean {
    if (!payload.groupId || typeof payload.groupId !== 'string' || payload.groupId.length === 0)
      return false;
    return true;
  }

  authorizeGetSharedAnnotations(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canGroup = permissions.group[payload.groupId] && permissions.group[payload.groupId][payload.requestType]

    return canGroup;
  }

  validateSaveSharedAnnotations(payload: { [key: string]: any }): boolean {
    if (payload.stmts && (payload.stmts instanceof Array) && (payload.stmts.length > 0)) {
      for (let annotationIndex in payload.stmts) {
        let annotation = payload.stmts[annotationIndex];

        if (annotation.pinned)
          return false;

        if (SharedAnnotation.is(annotation)) {
          payload.stmts[annotationIndex] = new SharedAnnotation(annotation);
        } else {
          return false;
        }
      }
    }

    return true;
  }

  authorizeSaveSharedAnnotations(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    for (let annotation of payload.stmts) {
      if (!permissions.group[annotation.groupId] || !permissions.group[annotation.groupId][payload.requestType])
        return false;
    }
    return true;
  }

  validateDeleteAnnotation(payload: { [key: string]: any }): boolean {
    if (Array.isArray(payload.xId)) {
      for (let id of payload.xId) {
        if (typeof id !== "string") {
          return false;
        }
      }
    }

    return true;
  }

  authorizeDeleteAnnotation(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    let canUser = (username == payload.identity) && (permissions.user[payload.requestType])

    return canUser;
  }

  validateDeleteSharedAnnotation(payload: { [key: string]: any }): boolean {
    if (Array.isArray(payload.annotation) && payload.annotation.length > 0) {
      for (let annotation of payload.annotation) {
        if (SharedAnnotation.is(annotation)) {
          annotation = new SharedAnnotation(annotation);
        } else {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  authorizeDeleteSharedAnnotation(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    for (let annotation of payload.annotation) {
      if ((!permissions.group[annotation.groupId] || !permissions.group[annotation.groupId][payload.requestType]) && annotation.owner !== username)
        return false;
    }

    return true;
  }

  validateSubscribeSharedAnnotations(payload: { [key: string]: any }): boolean {
    if (Array.isArray(payload.groupId)) {
      for (let i = 0; i < payload.groupId.length; i++) {
        let groupId = payload.groupId[i];
        if (typeof groupId !== "string" || groupId.length === 0)
          return false;
      }
      return true;
    }
    return false;
  }

  authorizeSubscribeSharedAnnotations(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    for (let groupId of payload.groupId) {
      if (!permissions.group[groupId] || !permissions.group[groupId][payload.requestType])
        return false;
    }

    return true;
  }

  validateUnsubscribeSharedAnnotations(payload: { [key: string]: any }): boolean {
    if (Array.isArray(payload.groupId)) {
      for (let i = 0; i < payload.groupId.length; i++) {
        let groupId = payload.groupId[i];
        if (typeof groupId !== "string" || groupId.length === 0)
          return false;
      }
      return true;
    }
    return false;
  }

  authorizeUnsubscribeSharedAnnotations(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    for (let groupId of payload.groupId) {
      if (!permissions.group[groupId] || !permissions.group[groupId][payload.requestType])
        return false;
    }

    return true;
  }

  async subscribeSharedAnnotations(userId: string, groupIds: string[]): Promise<{ [key: string]: any }> {
    for (let i = 0; i < groupIds.length; i++) {
      await this.sessionData.setHashValue(generateSubscribedSharedAnnotationsUsersKey(groupIds[i]), userId, userId);
    }

    return {
      data: true,
      requestType: "subscribeSharedAnnotations"
    };
  }

  async unsubscribeSharedAnnotations(userId: string, groupIds: string[]): Promise<true> {
    for (let i = 0; i < groupIds.length; i++) {
      await this.sessionData.deleteHashValue(generateSubscribedSharedAnnotationsUsersKey(groupIds[i]), userId);
    }
    return true;
  }

  async pinSharedAnnotation(identity: string, annotations: SharedAnnotation[]): Promise<true> {
    let date = new Date();
    for (let annotation of annotations) {
      annotation.stored = date.toISOString();
      annotation.pinned = true;
      let str = JSON.stringify(annotation);

      await this.sessionData.setHashValue(generateGroupSharedAnnotationsKey(annotation.groupId), generateSharedAnnotationsKey(annotation.id), str);
      await this.sessionData.addTimestampValue(generateGroupSharedAnnotationsTimestamps(annotation.groupId), date.getTime(), annotation.id);
      let users = await this.getSubscribedUsers(annotation.groupId);
      for (let user of users) {
        if (user !== identity) { //Don't send the message to the sender
          await this.sessionData.broadcast(generateBroadcastQueueForUserId(user), JSON.stringify(new ServiceMessage(user, {
            requestType: "newSharedAnnotation",
            data: [annotation]
          })));
        }
      }
    }

    return true;
  }

  async unpinSharedAnnotation(identity: string, annotations: SharedAnnotation[]): Promise<true> {
    let date = new Date();
    for (let annotation of annotations) {
      annotation.stored = date.toISOString();
      annotation.pinned = false;
      let str = JSON.stringify(annotation);

      await this.sessionData.setHashValue(generateGroupSharedAnnotationsKey(annotation.groupId), generateSharedAnnotationsKey(annotation.id), str);
      await this.sessionData.addTimestampValue(generateGroupSharedAnnotationsTimestamps(annotation.groupId), date.getTime(), annotation.id);
      let users = await this.getSubscribedUsers(annotation.groupId);
      for (let user of users) {
        if (user !== identity) { //Don't send the message to the sender
          await this.sessionData.broadcast(generateBroadcastQueueForUserId(user), JSON.stringify(new ServiceMessage(user, {
            requestType: "newSharedAnnotation",
            data: [annotation]
          })));
        }
      }
    }

    return true;
  }

  //TODO: Are xAPI statements being stored in the cache or a different format for the data?
  // getAnnotationsForBook(identity: string, book: string): Annotation[]; //Retrieve annotations made by the user within a specific book
  //Retrieve annotations made by the user across all books
  async getAnnotations(identity: string, timestamp: number): Promise<(Annotation | Voided)[]> {
    let data: string[] = await this.sessionData.getValuesGreaterThanTimestamp(generateTimestampForAnnotations(identity),
      timestamp);
    let result = await this.sessionData.getHashMultiField(generateUserAnnotationsKey(identity),
      data.map((x) => generateAnnotationsKey(x)));
    return result.map((x) => {
      let obj = JSON.parse(x);
      if (Annotation.is(obj))
        return new Annotation(obj);
      else
        return new Voided(obj);
    });
  }

  //Store annotations made by the user within the specific book
  async saveAnnotations(identity: string, stmts: Annotation[]): Promise<true> {
    let arr = [];
    let date = new Date();
    let xapi = [];
    for (let stmt of stmts) {
      stmt.stored = date.toISOString();
      let stmtStr = JSON.stringify(stmt);
      arr.push(generateAnnotationsKey(stmt.id));
      arr.push(stmtStr);
      xapi.push(stmtStr);
      await this.sessionData.addTimestampValue(generateTimestampForAnnotations(identity), date.getTime(), stmt.id);
    }
    await this.sessionData.queueForLrs(xapi);
    await this.sessionData.broadcast(generateBroadcastQueueForUserId(identity), JSON.stringify(new ServiceMessage(identity, {
      requestType: "newAnnotation",
      data: stmts
    })));
    await this.sessionData.setHashValues(generateUserAnnotationsKey(identity), arr);
    return true;
  }

  // getSharedAnnotationsForBook(identity: string, book: string): SharedAnnotation[]; //Retrieve shared annotations visible to the user made within a specific book

  //Retrieve shared annotations visible to the user made across all books
  async getSharedAnnotations(identity: string, groupId: string, timestamp: number): Promise<(SharedAnnotation | Voided)[]> {
    let data = await this.sessionData.getValuesGreaterThanTimestamp(generateGroupSharedAnnotationsTimestamps(groupId),
      timestamp);
    let result = await this.sessionData.getHashMultiField(generateGroupSharedAnnotationsKey(groupId),
      data.map((x) => generateSharedAnnotationsKey(x)));
    return result.map(function(x) {
      let obj = JSON.parse(x);
      if (SharedAnnotation.is(obj))
        return new SharedAnnotation(obj);
      else
        return new Voided(obj);
    });
  }

  //Store shared annotations visible to the user made within the specific book
  async saveSharedAnnotations(identity: string, stmts: SharedAnnotation[]): Promise<true> {
    let date = new Date();
    let xapi = [];
    for (let stmt of stmts) {
      stmt.stored = date.toISOString();
      let stmtStr = JSON.stringify(stmt);
      xapi.push(stmtStr);
      await this.sessionData.setHashValue(generateGroupSharedAnnotationsKey(stmt.groupId), generateSharedAnnotationsKey(stmt.id), stmtStr);
      await this.sessionData.addTimestampValue(generateGroupSharedAnnotationsTimestamps(stmt.groupId), date.getTime(), stmt.id);
      let users = await this.getSubscribedUsers(stmt.groupId);
      for (let user of users) {
        if (user !== identity) { //Don't send the message to the sender
          await this.sessionData.broadcast(generateBroadcastQueueForUserId(user), JSON.stringify(new ServiceMessage(user, {
            requestType: "newSharedAnnotation",
            data: [stmt]
          })));
        }
      }
    }
    await this.sessionData.queueForLrs(xapi);
    return true;
  }

  //Removes the annotation with the specific id    
  async deleteAnnotation(identity: string, ids: string[]): Promise<true> {
    for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      let data = await this.sessionData.getHashValue(generateUserAnnotationsKey(identity), generateAnnotationsKey(id));
      if (data) {
        await this.sessionData.queueForLrsVoid(data);
        let voided = new Annotation(JSON.parse(data)).toVoidRecord();
        await this.sessionData.addTimestampValue(generateTimestampForAnnotations(identity), new Date(voided.stored).getTime(), voided.id);
        await this.sessionData.setHashValue(generateUserAnnotationsKey(identity), generateAnnotationsKey(voided.id), JSON.stringify(voided));
        await this.sessionData.broadcast(generateBroadcastQueueForUserId(identity), JSON.stringify(new ServiceMessage(identity, {
          requestType: "newAnnotation",
          data: voided
        })));
      }
      let deletedTime: number = await this.sessionData.deleteSortedTimestampMember(generateTimestampForAnnotations(identity),
        id);
      if (!deletedTime) {
        auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelAnnotationFail", identity, id);
      }
      let deletedAnnotation = await this.sessionData.deleteHashValue(generateUserAnnotationsKey(identity),
        generateAnnotationsKey(id));
      if (!deletedAnnotation) {
        auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelAnnotationFail", identity, id);
      }
    }
    return true;
  }

  //Removes the shared annotation with the specific id
  async deleteSharedAnnotation(identity: string, annotations: SharedAnnotation[]): Promise<true> {
    for (let i = 0; i < annotations.length; i++) {
      let annotation = annotations[i];
      let data = await this.sessionData.getHashValue(generateGroupSharedAnnotationsKey(annotation.groupId), generateSharedAnnotationsKey(annotation.id));
      if (data) {
        await this.sessionData.queueForLrsVoid(data);
        let ann = new SharedAnnotation(JSON.parse(data));
        let voided = ann.toVoidRecord();
        await this.sessionData.addTimestampValue(generateGroupSharedAnnotationsTimestamps(ann.groupId), new Date(voided.stored).getTime(), voided.id);
        await this.sessionData.setHashValue(generateGroupSharedAnnotationsKey(ann.groupId), generateSharedAnnotationsKey(voided.id), JSON.stringify(voided));
        let users = await this.getSubscribedUsers(ann.groupId);
        for (let user of users) {
          if (user !== identity) { //Don't send the message to the sender
            await this.sessionData.broadcast(generateBroadcastQueueForUserId(user), JSON.stringify(new ServiceMessage(user, {
              requestType: "newSharedAnnotation",
              data: voided
            })));
          }
        }
      }

      let deletedTime = await this.sessionData.deleteSortedTimestampMember(generateGroupSharedAnnotationsTimestamps(annotation.groupId),
        annotation.id);
      if (!deletedTime) {
        auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelSharedAnnotationFail", identity, annotation.id);
      }
      let deletedAnnotation = await this.sessionData.deleteHashValue(generateGroupSharedAnnotationsKey(annotation.groupId),
        generateSharedAnnotationsKey(annotation.id));
      if (!deletedAnnotation) {
        auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelSharedAnnotationFail", identity, annotation.id);
      }
    }
    return true;
  }

  private async getSubscribedUsers(groupId: string): Promise<string[]> {
    return this.sessionData.getHashValues(generateSubscribedSharedAnnotationsUsersKey(groupId));
  }
}
