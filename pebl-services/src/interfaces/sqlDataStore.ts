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

import { Action } from '../models/action';
import { Session } from '../models/session';
import { Message } from '../models/message';
import { Question } from '../models/question';

export interface SqlDataStore {
  insertCompletions(data: Action[]): Promise<void>;
  getCompletions(bookId: string, teamId: string, classId: string, timestamp: number): Promise<any[]>;

  insertLogins(data: Session[]): Promise<void>;
  getLogins(teamId: string, classId: string, timestamp: number): Promise<string[]>;

  insertReportedThreadedMessages(data: Message[]): Promise<void>;
  insertDiscussions(data: Message[]): Promise<void>;
  getReportedThreadedMessages(bookId: string, teamId: string, classId: string): Promise<any[]>;
  deleteReportedThreadedMessage(data: string[]): Promise<void>;
  getLeastAnsweredDiscussions(bookId: string, teamId: string, classId: string): Promise<any[]>;
  getMostAnsweredDiscussions(bookId: string, teamId: string, classId: string): Promise<any[]>;

  insertQuizAttempts(data: Question[]): Promise<void>;
  getQuizAttempts(bookId: string, teamId: string, classId: string): Promise<any[]>;

  archiveData(id: string, data: { [key: string]: string }): Promise<void>;
  getArchivedData(id: string): Promise<{ [key: string]: string }>;
}
