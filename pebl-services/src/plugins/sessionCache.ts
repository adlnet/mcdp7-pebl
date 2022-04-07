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

import { SessionDataManager } from '../interfaces/sessionDataManager';
import { RedisClient } from 'redis';
import { XApiStatement } from '../models/xapiStatement';
import { auditLogger } from '../main';
import { LogCategory, Severity } from '../utils/constants';

export class RedisSessionDataCache implements SessionDataManager {
  private redis: RedisClient;

  constructor(redisClient: RedisClient) {
    this.redis = redisClient;
  }

  broadcast(channel: string, message: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.redis.publish(channel, message, (err, result) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisPublishFail", err);
          reject();
        } else {
          resolve(result);
        }
      });
    });
  }

  setHashValues(key: string, values: string[]): Promise<true> {
    return new Promise((resolve, reject) => {
      this.redis.hmset(key, values, (err) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisSetHashVals", err);
          reject();
        } else {
          resolve(true);
        }
      });
    });
  }

  setHashValue(key: string, field: string, value: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.redis.hset(key, field, value, (err, result) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisSetHashValue", err);
          reject()
        } else {
          resolve(result);
        }
      });
    });
  }

  setHashValueIfNotExisting(key: string, field: string, value: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.redis.hsetnx(key, field, value, (err, result) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisSetHashValIfNotExist", err);
          reject();
        } else {
          resolve(result == 1);
        }
      });
    });
  }

  getHashValues(key: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.redis.hvals(key, (err, result) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisGetHashVals", err);
          reject();
        } else {
          resolve(result);
        }
      });
    });
  }

  getAllHashPairs(key: string): Promise<{ [key: string]: string }> {
    return new Promise((resolve, reject) => {
      this.redis.hgetall(key, (err, result) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisHashGetAll", err);
          reject();
        } else {
          resolve(result ? result : {});
        }
      });
    });
  }

  getHashKeys(key: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.redis.hvals(key, (err, result) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisGetHashKeys", err);
          reject();
        } else {
          resolve(result);
        }
      });
    });
  }

  getHashMultiField(key: string, field: string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (field.length != 0) {
        this.redis.hmget(key, ...field, (err, result) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisGetHashMultiField", err);
            reject();
          } else {
            resolve(result);
          }
        });
      } else {
        resolve([]);
      }
    });
  }

  getHashMultiKeys(keys: string[]): Promise<{ [key: string]: string[] }> {
    return new Promise((resolve, reject) => {
      if (keys.length != 0) {
        let obj = {} as { [key: string]: any };
        let batch = this.redis.batch();
        for (let key of keys) {
          batch.hvals(key, (err, resp) => {
            if (err) {
              auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisGetHashMultiKeys", err);
              reject();
            } else {
              obj[key] = resp;
            }
          });
        }
        batch.exec((err) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisGetHashMultiKeysBatch", err);
            reject();
          } else {
            resolve(obj);
          }
        });
      } else {
        resolve({});
      }
    });
  }

  getHashValue(key: string, field: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.redis.hget(key, field, (err, result) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisGetHashValue", err);
          reject();
        } else {
          resolve(result);
        }
      });
    });
  }

  deleteValue(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.redis.del(key, (err, result) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisDeleteValue", err);
          reject();
        } else {
          resolve(result == 1);
        }
      });
    });
  }

  deleteValues(keys: string[]): Promise<true> {
    return new Promise((resolve, reject) => {
      if (keys.length != 0) {
        // let obj = {} as { [key: string]: any };
        let batch = this.redis.batch();
        for (let key of keys) {
          batch.del(key, (err) => {
            if (err) {
              auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisDeleteValues", err);
              reject();
            } // else {
            //   obj[key] = resp;
            // }
          });
        }
        batch.exec((err) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisDelValsBatch", err);
            reject();
          } else {
            resolve(true);
          }
        });
      } else {
        resolve(true);
      }
    });
  }

  addSetValue(key: string, value: (string[] | string)): Promise<number> {
    return new Promise((resolve, reject) => {
      //this splices the value string[] into sadd(key, value[0], value[1], value[2]...)
      if (value instanceof Array) {
        if (value.length == 0) {
          resolve(0);
        } else {
          this.redis.sadd(key, ...value, (err, result) => {
            if (err) {
              auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisAddSetValue", err);
              reject()
            } else {
              resolve(result);
            }
          });
        }
      } else {
        this.redis.sadd(key, value, (err, result) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisAddSetValueSingle", err);
            reject();
          } else {
            resolve(result);
          }
        });
      }
    });
  }

  isMemberSetValue(key: string, id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.redis.sismember(key, id, (err, result) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisIsMemberSetVal", err);
          reject();
        } else {
          resolve(1 == result);
        }
      });
    });
  }

  incHashKey(key: string, id: string, increment: number): Promise<number> {
    return new Promise((resolve, reject) => {
      this.redis.hincrby(key, id, increment, (err, resp) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisGetHashMultiKeys", err);
          reject();
        } else {
          resolve(resp);
        }
      });
    });
  }

  incHashKeys(key: string, ids: string[], increment: number): Promise<{ [key: string]: number }> {
    return new Promise((resolve, reject) => {
      if (ids.length != 0) {
        let obj = {} as { [key: string]: any };
        let batch = this.redis.batch();
        for (let id of ids) {
          batch.hincrby(key, id, increment, (err, resp) => {
            if (err) {
              auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisIncKeys", err);
              reject();
            } else {
              obj[key] = resp;
            }
          });
        }
        batch.exec((err) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisIncKeysBatch", err);
            reject();
          } else {
            resolve(obj);
          }
        });
      } else {
        resolve({});
      }
    });
  }

  getSetValues(key: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.redis.smembers(key, (err, result) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisGetSetVals", err);
          reject();
        } else {
          resolve(result);
        }
      });
    });
  }

  unionSetValues(key: string | string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.redis.sunion(key, (err, result) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisUnionSetVals", err);
          reject();
        } else {
          resolve(result);
        }
      });
    });
  }

  deleteSetValue(key: string, value: (string | string[])): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (value instanceof Array) {
        //this splices the value string[] into sadd(key, value[0], value[1], value[2]...)
        this.redis.srem(key, ...value, (err, result) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisDeleteSetValue", err);
            reject();
          } else {
            resolve(result > 0)
          }
        });
      } else {
        this.redis.srem(key, value, (err, result) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisDeleteSetValueSingle", err);
            reject();
          } else {
            resolve(result > 0);
          }
        });
      }
    });
  }

  deleteHashValue(key: string, field: (string | string[])): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (field instanceof Array) {
        this.redis.hdel(key, ...field, (err, result) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisDeleteHashValue", err);
            reject();
          } else {
            resolve(result > 0);
          }
        });
      } else {
        this.redis.hdel(key, field, (err, result) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisDeleteHashValue", err);
            reject();
          } else {
            resolve(result > 0);
          }
        });
      }
    });
  }

  scan10(cursor: string, pattern: string): Promise<[string, string[]]> {
    return new Promise((resolve, reject) => {
      this.redis.scan(cursor,
        'MATCH',
        pattern,
        'COUNT',
        '10',
        (err: Error | null, result: [string, string[]]) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisScan", err);
            reject();
          } else {
            resolve(result);
          }
        });
    });
  }

  keys(pattern: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.redis.keys(pattern,
        (err, result) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisKeys", err);
            reject();
          } else {
            resolve(result);
          }
        });
    });
  }

  getHashValuesForFields(key: string, fields: string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.redis.hmget(key, fields, (err, result) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisGetHashValsForFields", err);
          reject();
        } else {
          resolve(result);
        }
      });
    });
  }

  addTimestampValue(key: string, timestamp: number, value: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.redis.zadd(key, timestamp, value, (err, resp) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisAddTimestamp", err);
          reject();
        } else {
          resolve(resp);
        }
      });
    });
  }

  addTimestampValues(key: string, timestampPairs: (number | string)[]): Promise<number> {
    return new Promise((resolve, reject) => {
      let tps: (number | string | ((err: any, x: number) => void))[] = timestampPairs;
      tps.push((err, resp) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisAddTimestamps", err);
          reject();
        } else {
          resolve(resp);
        }
        this.redis.zadd(key, ...timestampPairs);
      });
    });
  }

  getValuesGreaterThanTimestamp(key: string, timestamp: number): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.redis.zrangebyscore(key, timestamp, '+inf', (err, resp) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisGetValsMoreThanTime", err);
          reject();
        } else
          resolve(resp);
      });
    });
  }

  getValuesLessThanTimestamp(key: string, timestamp: number): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.redis.zrangebyscore(key, '-inf', timestamp, (err, resp) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisGetValsLessThanTime", err);
          reject();
        } else
          resolve(resp);
      })
    })
  }

  rankSortedSetMember(key: string, id: string): Promise<number | null> {
    return new Promise((resolve, reject) => {
      this.redis.zrank(key,
        id,
        (err, resp) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisRankSortedFail", err);
            reject();
          } else {
            resolve(resp);
          }
        });
    });
  }

  deleteSortedTimestampMember(key: string, memberId: (string | string[])): Promise<number> {
    return new Promise((resolve, reject) => {
      if (memberId instanceof Array) {
        this.redis.zrem(key, ...memberId, (err, result) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "DelSortedTimeMem", err);
            reject();
          } else {
            resolve(result);
          }
        });
      } else {
        this.redis.zrem(key, memberId, (err, result) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "DelSortedTimeMem", err);
            reject();
          } else {
            resolve(result);
          }
        });
      }
    });
  }

  removeBadLRSStatement(id: string): Promise<true> {
    return new Promise((resolve, reject) => {
      this.redis.lrem('outgoingXapi', -1, id, (err) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "DelBadLRSStmt", err);
          reject();
        } else {
          resolve(true);
        }
      });
    });
  }

  queueForLrs(value: string | string[]): Promise<number> {
    return new Promise((resolve, reject) => {
      if (value instanceof Array) {
        let v: (string | ((err: any, result: number) => void))[] = value;
        v.push((err, result) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisQueueLrs", err);
            reject();
          } else {
            resolve(result);
          }
        });
        this.redis.rpush('outgoingXapi', ...v);
      } else {
        this.redis.rpush('outgoingXapi', value, (err, result) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisQueueLrs", err);
            reject();
          } else {
            resolve(result);
          }
        });
      }
    });
  }

  queueForLrsVoid(value: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let stmt = new XApiStatement(JSON.parse(value));
      let voided = stmt.toVoidRecord();
      delete voided.id;
      this.redis.rpush('outgoingXapi', JSON.stringify(voided), (err, result) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisGetForLrs", err);
          reject();
        } else {
          resolve(result);
        }
      });
    });
  }

  retrieveForLrs(count: number): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.redis.lrange('outgoingXapi', 0, count, (err, resp) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisGetForLrs", err);
          reject();
        } else {
          resolve(resp);
        }
      });
    });
  }

  trimForLrs(count: number): Promise<true> {
    return new Promise((resolve, reject) => {
      this.redis.ltrim('outgoingXapi',
        count + 1,
        -1,
        (err) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisTrimLrs", err);
            reject();
          } else {
            resolve(true);
          }
        });
    });
  }

  dumpKey(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.redis.dump(<any>new Buffer(key), (err, data) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisDumpKey", err);
          reject();
        } else {
          resolve(data);
        }
      });
    });
  }

  dumpKeys(keys: string[]): Promise<{ [key: string]: string }> {
    return new Promise((resolve, reject) => {
      if (keys.length != 0) {
        let obj = {} as { [key: string]: string };
        let multi = this.redis.multi();
        for (let key of keys) {
          multi.dump(<any>new Buffer(key), (err, resp) => {
            if (err) {
              auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisDumpKeys", err);
              reject();
            } else {
              if (resp)
                obj[key] = resp;
            }
          });
        }
        multi.exec((err) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisGetHashMultiKeysBatch", err);
            reject();
          } else {
            resolve(obj);
          }
        });
      } else {
        resolve({});
      }
    });
  }

  restoreKey(key: string, ttl: number, data: string): Promise<true> {
    return new Promise((resolve, reject) => {
      this.redis.restore(key, ttl, data, (err) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisRestoreKey", err);
          reject();
        } else {
          resolve(true);
        }
      });
    });
  }

  removeKeys(keys: string[]): Promise<true> {
    return new Promise((resolve, reject) => {
      this.redis.del(keys, (err) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisDelKey", err);
          reject();
        } else {
          resolve(true);
        }
      })
    })
  }

  scoreSortedSet(key: string, id: string): Promise<number | null> {
    return new Promise((resolve, reject) => {
      this.redis.zscore(key, id, (err, data) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisScoreSortedSet", err);
          reject();
        } else {
          let d = parseFloat(data);
          resolve(Number.isNaN(d) ? null : d);
        }
      });
    });
  };

  rangeSortedSet(key: string, min: number, max: number, withScore: boolean): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (withScore)
        this.redis.zrangebyscore(key, min, max, "WITHSCORES", (err, resp) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisRangeSortedSScore", err);
            reject()
          } else
            resolve(resp);
        });
      else
        this.redis.zrangebyscore(key, min, max, (err, resp) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisRangeSortedSet", err);
            reject();
          } else
            resolve(resp);
        });
    });
  }

  rangeRevSortedSet(key: string, min: number, max: number, withScore: boolean): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (withScore)
        this.redis.zrevrangebyscore(key, max, min, "WITHSCORES", (err, resp) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisRRangeSortedSScore", err);
            reject();
          } else
            resolve(resp);
        });
      else
        this.redis.zrevrangebyscore(key, max, min, (err, resp) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisRRangeSortedSet", err);
            reject();
          } else
            resolve(resp);
        });
    });
  }

  countSortedSet(key: string, min: number, max: number): Promise<number> {
    return new Promise((resolve, reject) => {
      this.redis.zcount(key,
        min,
        max,
        (err, count) => {
          if (err) {
            auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisCountSortedSet", err);
            reject();
          } else {
            resolve(count);
          }
        });
    });
  }

  setString(key: string, data: string): Promise<true> {
    return new Promise((resolve, reject) => {
      this.redis.set(key, data, (err) => {
        if (err) {
          auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisSet", err);
          reject();
        } else {
          resolve(true);
        }
      });
    });
  }

  // restoreKeys(keys: string[], callback: (data?: { [key: string]: string }) => void): void {
  //   if (keys.length != 0) {
  //     let obj = {} as { [key: string]: string };
  //     let multi = this.redis.multi();
  //     for (let key of keys) {
  //       multi.dump(key, (err, resp) => {
  //         if (err) {
  //           auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisDumpKeys", err);
  //         } else {
  //           obj[key] = resp;
  //         }
  //       });
  //     }
  //     multi.exec((err, resp) => {
  //       if (err) {
  //         auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisGetHashMultiKeysBatch", err);
  //         callback({});
  //       } else {
  //         callback(obj);
  //       }
  //     });
  //   } else {
  //     callback({});
  //   }
  // }
}
