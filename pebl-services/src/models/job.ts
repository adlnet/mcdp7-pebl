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

export class JobMessage {

  readonly timeout: number;
  readonly jobType: string;
  startTime?: number;
  finished?: boolean;

  constructor(jobType: string, timeout: number, startTime?: number, finished?: boolean) {
    this.jobType = jobType;
    this.timeout = timeout;
    this.startTime = startTime;
    this.finished = finished;
  }

  static parse(data: string): JobMessage {
    let o = JSON.parse(data);
    return new JobMessage(o.jobType, o.timeout, o.startTime, o.finished);
  }
}
