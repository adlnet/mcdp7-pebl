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

import { SqlDataStore } from '../interfaces/sqlDataStore';
import { Pool } from 'pg';
import { Action } from '../models/action';
import { Session } from '../models/session';
import { Message } from '../models/message';
import { Question } from '../models/question';
import { auditLogger } from '../main';
import { LogCategory, Severity } from '../utils/constants';

export class PgSqlDataStore implements SqlDataStore {
  private pool: Pool | undefined;

  constructor(pool: Pool | undefined) {
    this.pool = pool;
    if (this.pool) {
      this.pool.connect().then((client) => {
        client.query('CREATE TABLE IF NOT EXISTS completions ( id uuid PRIMARY KEY, bookId VARCHAR ( 255 ), chapter VARCHAR ( 255 ), teamId VARCHAR ( 255 ), classId VARCHAR ( 255 ), identity VARCHAR ( 255 ), timestamp BIGINT);').then(() => {
          return client.query('CREATE TABLE IF NOT EXISTS logins (id uuid PRIMARY KEY, teamId VARCHAR ( 255 ), classId VARCHAR ( 255 ), identity VARCHAR ( 255 ), timestamp BIGINT);');
        }).then(() => {
          return client.query('CREATE TABLE IF NOT EXISTS discussions (id SERIAL PRIMARY KEY, bookId VARCHAR ( 255 ), thread VARCHAR ( 255 ), prompt TEXT, teamId VARCHAR ( 255 ), classId VARCHAR ( 255 ), count INTEGER, url TEXT, UNIQUE (thread, teamId, classId));');
        }).then(() => {
          return client.query('CREATE TABLE IF NOT EXISTS quizattempts (id SERIAL PRIMARY KEY, bookId VARCHAR ( 255 ), quizId VARCHAR ( 255 ), question TEXT, response TEXT, correct BOOL, teamId VARCHAR ( 255 ), classId VARCHAR ( 255 ), count INTEGER, url TEXT, UNIQUE (quizId, question, response, teamId, classId));');
        }).then(() => {
          return client.query('CREATE TABLE IF NOT EXISTS reportedmessages (id SERIAL PRIMARY KEY, messageId uuid, bookId VARCHAR ( 255 ), prompt TEXT, teamId VARCHAR ( 255 ), classId VARCHAR ( 255 ), identity VARCHAR ( 255 ), url TEXT, message TEXT, timestamp BIGINT, count INTEGER, UNIQUE (messageId, teamId, classId));');
        }).then(() => {
          return client.query('CREATE TABLE IF NOT EXISTS archived ( id VARCHAR ( 255 ) PRIMARY KEY, data JSON, UNIQUE (id));');
        }).finally(() => {
          client.release();
        })
      }).catch((e) => {
        auditLogger.report(LogCategory.STORAGE, Severity.EMERGENCY, "PostgresConnectFailed", e);
        process.exit(1);
      });
    } else {
      auditLogger.report(LogCategory.STORAGE, Severity.INFO, "PostgresConnectionStringMissing");
    }
  }

  async insertReportedThreadedMessages(data: Message[]) {
    if (this.pool) {
      const text = 'INSERT INTO reportedmessages(messageId, bookId, prompt, teamId, classId, identity, url, message, timestamp, count) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (messageId, teamId, classId) DO UPDATE SET count = reportedmessages.count + 1, url = $7;';
      const client = await this.pool.connect();
      try {
        for (let message of data) {
          message = new Message(message);
          const values = [message.id, message.bookId, message.prompt, message.currentTeam, message.currentClass, (<any>message.actor).account.name, message.contextUrl, JSON.stringify(message), new Date(message.timestamp as string).getTime(), 1];
          client.query(text, values);
        }
      } catch (e) {
        auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "InsertReportedThMsgFail", e);
      } finally {
        client.release();
      }

    }
  }

  async deleteReportedThreadedMessage(data: string[]) {
    if (this.pool) {
      const text = 'DELETE FROM reportedmessages WHERE messageId = $1;';
      const client = await this.pool.connect();
      try {
        for (let id of data) {
          const values = [id];
          client.query(text, values);
        }
      } catch (e) {
        auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "DelReportedThMsgFail", e);
      } finally {
        client.release();
      }
    }
  }

  getReportedThreadedMessages(bookId: string, teamId: string, classId: string): Promise<any[]> {
    return new Promise(async (resolve) => {
      if (this.pool) {
        const text = 'SELECT messageId, prompt, identity, url, message, count FROM reportedmessages WHERE bookId = $1 AND teamId = $2 AND classId = $3;';
        const client = await this.pool.connect();
        try {
          client.query(text, [bookId, teamId, classId]).then((res) => {
            resolve(res.rows);
          })
        } catch (e) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "GetReportedThMsgFail", e);
          resolve([]);
        } finally {
          client.release();
        }
      } else {
        resolve([]);
      }
    });
  }

  async insertQuizAttempts(data: Question[]) {
    if (this.pool) {
      const text = 'INSERT INTO quizattempts(bookId, quizId, question, response, correct, teamId, classId, count, url) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (quizId, question, response, teamId, classId) DO UPDATE SET count = quizattempts.count + 1, url = $9;';
      const client = await this.pool.connect();
      try {
        for (let question of data) {
          question = new Question(question);
          const values = [question.book, question.activityId, question.prompt, question.response, question.success, question.currentTeam, question.currentClass, 1, question.contextUrl];
          client.query(text, values);
        }
      } catch (e) {
        auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "InsertQuizAttemptFail", e);
      } finally {
        client.release();
      }
    }
  }

  getQuizAttempts(bookId: string, teamId: string, classId: string): Promise<any[]> {
    return new Promise(async (resolve) => {
      if (this.pool) {
        const text = 'SELECT quizId, question, response, correct, count, url FROM quizattempts WHERE bookId = $1 AND teamId = $2 AND classId = $3';
        const client = await this.pool.connect();
        try {
          client.query(text, [bookId, teamId, classId]).then((res) => {
            resolve(res.rows);
          })
        } catch (e) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "GetQuizAttemptFail", e);
          resolve([]);
        } finally {
          client.release();
        }
      } else {
        resolve([]);
      }
    });
  }

  async insertDiscussions(data: Message[]) {
    if (this.pool) {
      const text = 'INSERT INTO discussions(bookId, thread, prompt, teamId, classId, count, url) VALUES($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (thread, teamId, classId) DO UPDATE SET count = discussions.count + 1, url = $7;';
      const client = await this.pool.connect();
      try {
        for (let message of data) {
          message = new Message(message);
          const values = [message.bookId, message.thread, message.prompt, message.currentTeam, message.currentClass, 1, message.contextUrl];
          client.query(text, values);
        }
      } catch (e) {
        auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "InsertDiscussionFail", e);
      } finally {
        client.release();
      }
    }
  }

  getMostAnsweredDiscussions(bookId: string, teamId: string, classId: string): Promise<any[]> {
    return new Promise(async (resolve) => {
      if (this.pool) {
        const text = 'SELECT prompt, count, url FROM discussions WHERE bookId = $1 AND teamId = $2 AND classId = $3 ORDER BY count DESC LIMIT 5';
        const client = await this.pool.connect();
        try {
          client.query(text, [bookId, teamId, classId]).then((res) => {
            resolve(res.rows);
          })
        } catch (e) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "GetMostDiscussionFail", e);
          resolve([]);
        } finally {
          client.release();
        }
      } else {
        resolve([]);
      }
    });
  }

  async getLeastAnsweredDiscussions(bookId: string, teamId: string, classId: string): Promise<any[]> {
    return new Promise(async (resolve) => {
      if (this.pool) {
        const text = 'SELECT prompt, count, url FROM discussions WHERE bookId = $1 AND teamId = $2 AND classId = $3 ORDER BY count ASC LIMIT 5';
        const client = await this.pool.connect();
        try {
          client.query(text, [bookId, teamId, classId]).then((res) => {
            resolve(res.rows);
          })
        } catch (e) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "GetLeastDiscussionFail", e);
          resolve([]);
        } finally {
          client.release();
        }
      } else {
        resolve([]);
      }
    });
  }

  async insertLogins(data: Session[]) {
    if (this.pool) {
      const text = 'INSERT INTO logins(id, teamId, classId, identity, timestamp) VALUES($1, $2, $3, $4, $5);';
      const client = await this.pool.connect();
      try {
        for (let login of data) {
          const values = [login.id, login.currentTeam, login.currentClass, new Session(login).getActorId(), new Date(login.timestamp as string).getTime()];
          client.query(text, values);
        }
      } catch (e) {
        auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "InsertLoginFail", e);
      } finally {
        client.release();
      }
    }
  }

  getLogins(teamId: string, classId: string, timestamp: number): Promise<string[]> {
    return new Promise(async (resolve) => {
      if (this.pool) {
        const text = 'SELECT DISTINCT identity FROM logins WHERE teamId = $1 AND classId = $2 AND timestamp > $3;';
        const client = await this.pool.connect();
        try {
          client.query(text, [teamId, classId, timestamp]).then((res) => {
            resolve(res.rows);
          })
        } catch (e) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "GetLoginFail", e);
          resolve([]);
        } finally {
          client.release();
        }
      } else {
        resolve([]);
      }
    });
  }

  async insertCompletions(data: Action[]) {
    if (this.pool) {
      const text = 'INSERT INTO completions(id, bookId, chapter, teamId, classId, identity, timestamp) VALUES($1, $2, $3, $4, $5, $6, $7);';
      const client = await this.pool.connect();
      try {
        for (let action of data) {
          const values = [action.id, action.book, action.name, action.currentTeam, action.currentClass, new Action(action).getActorId(), new Date(action.timestamp as string).getTime()];
          client.query(text, values);
        }
      } catch (e) {
        auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "InsertCompletionFail", e);
      } finally {
        client.release();
      }
    }
  }

  getCompletions(bookId: string, teamId: string, classId: string, timestamp: number): Promise<{ [key: string]: string }[]> {
    return new Promise(async (resolve) => {
      if (this.pool) {
        const text = 'SELECT DISTINCT chapter, identity FROM completions WHERE bookId = $1 AND teamId = $2 AND classId = $3 AND timestamp > $4;';
        const client = await this.pool.connect();
        try {
          client.query(text, [bookId, teamId, classId, timestamp]).then((res) => {
            resolve(res.rows);
          })
        } catch (e) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "GetCompletionFail", e);
          resolve([]);
        } finally {
          client.release();
        }
      } else {
        resolve([]);
      }
    });
  }

  archiveData(id: string, data: { [key: string]: string }): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.pool) {
        const insertText = 'INSERT INTO archived(id, data) VALUES($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2;';
        const client = await this.pool.connect();
        try {
          const values = [id, data];
          client.query(insertText, values).then((res) => {
            resolve();
          });
        } catch (e) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "ArchiveDataFail", e);
          reject(e);
        } finally {
          client.release();
        }
      } else {
        reject();
      }
    })
  }

  getArchivedData(id: string): Promise<{ [key: string]: string }> {
    return new Promise(async (resolve) => {
      if (this.pool) {
        const text = 'SELECT data FROM archived WHERE id = $1;';
        const client = await this.pool.connect();
        try {
          client.query(text, [id]).then((res) => {
            if (res.rows && res.rows.length === 1)
              resolve(res.rows[0].data);
            else
              resolve({});
          })
        } catch (e) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "getArchivedDataFail", e);
          resolve({});
        } finally {
          client.release();
        }
      } else {
        resolve({});
      }
    })
  }
}
