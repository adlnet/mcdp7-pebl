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

export interface SessionDataManager {

  setHashValues(key: string, values: string[]): Promise<true>;
  setHashValue(key: string, field: string, value: string): Promise<number>;
  setHashValueIfNotExisting(key: string, field: string, value: string): Promise<boolean>;

  getAllHashPairs(key: string): Promise<{ [key: string]: string }>;

  getHashValues(key: string): Promise<string[]>;
  getHashKeys(key: string): Promise<string[]>;
  incHashKey(key: string, id: string, increment: number): Promise<number>;
  incHashKeys(key: string, ids: string[], increment: number): Promise<{ [key: string]: number }>;
  getHashValue(key: string, field: string): Promise<string | undefined>;
  getHashMultiField(key: string, fields: string[]): Promise<string[]>;
  getHashMultiKeys(keys: string[]): Promise<{ [key: string]: string[] }>;

  deleteHashValue(key: string, field: (string | string[])): Promise<boolean>;
  deleteValue(key: string): Promise<boolean>;
  deleteValues(keys: string[]): Promise<true>;

  isMemberSetValue(key: string, id: string): Promise<boolean>;
  addSetValue(key: string, value: (string[] | string)): Promise<number>;
  getSetValues(key: string): Promise<string[]>;
  deleteSetValue(key: string, value: (string | string[])): Promise<boolean>
  unionSetValues(key: string | string[]): Promise<string[]>;

  addTimestampValue(key: string, timestamp: number, value: string): Promise<number>;
  addTimestampValues(key: string, timestampPairs: (number | string)[]): Promise<number>;

  getValuesGreaterThanTimestamp(key: string, timestamp: number): Promise<string[]>;
  getValuesLessThanTimestamp(key: string, timestamp: number): Promise<string[]>;
  deleteSortedTimestampMember(key: string, memberId: (string | string[])): Promise<number>;
  rankSortedSetMember(key: string, id: string): Promise<number | null>;
  scoreSortedSet(key: string, id: string): Promise<number | null>;
  countSortedSet(key: string, min: number, max: number): Promise<number | null>;
  rangeSortedSet(key: string, min: number, max: number, withScores: boolean): Promise<string[]>;
  rangeRevSortedSet(key: string, min: number, max: number, withScore: boolean): Promise<string[]>;

  queueForLrs(value: string | string[]): Promise<number>;
  queueForLrsVoid(value: string): Promise<number>;
  retrieveForLrs(count: number): Promise<string[] | undefined>;
  trimForLrs(count: number): Promise<true>;

  dumpKey(key: string): Promise<string>;
  dumpKeys(key: string[]): Promise<{ [key: string]: string }>;
  restoreKey(key: string, ttl: number, data: string): Promise<true>;
  // restoreKeys(data: { [key: string]: string }, ttl: number, callback?: (restored: { [key: string]: boolean }) => void): void;

  removeKeys(key: string[]): Promise<true>;

  scan10(cursor: string, pattern: string): Promise<[string, string[]]>;
  keys(pattern: string): Promise<string[]>;

  removeBadLRSStatement(id: string): Promise<true>;

  setString(key: string, data: string): Promise<true>;

  broadcast(channel: string, message: string): Promise<number>;
}
