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

import { Severity, LogCategory } from "../utils/constants";

export enum SyslogFacility {
  USER = 1, //user 
  DAEMON = 3, //daemon - anything that runs in the background like jobs
  AUTH = 4, //auth - anything that deals with authentication or authorization
  FTP = 11, //ftp - transferring files in and out of the server
  NETWORK = 16, //local0 - network traffic related like HTTP POST, GET, and DELETE
  STORAGE = 17, //local1 - things like DBs
  STANDARD = 18 //local2 - anything that doesn't fit into other categories most likely goes here

  //theses are open still, syslog format says that we can go from 16-23 for custom 
  //facility ids and still be in spec
  // OPEN1, //local3
  // OPEN2, //local4
  // OPEN3, //local5
  // OPEN4, //local6
  // OPEN5 //local7
}

export class ConsoleAuditLogManager {
  private logBuffers: string[][];

  private config: { [key: string]: any };
  private version: string;

  constructor(config: { [key: string]: any }) {
    this.config = config;
    this.logBuffers = [];
    for (let i = 0; i < 8; i++) {
      this.logBuffers.push([]);
    }
    this.version = (" PeBL-services." + this.config.version).substr(0, 48);
  }

  private syslogFormat(facility: LogCategory,
    severity: Severity,
    timestamp: Date,
    msgID: string,
    data: string): string {

    let str: string[] = [];

    str.push(" " + timestamp.toISOString()); // timestamp
    str.push(this.version); // service name
    str.push(" " + facility + msgID.trim().substr(0, 27)); //message type
    str.push(" " + data); //unstructured msg

    return str.join("");
  }

  /* 
   * @param message must be 27 or fewer characters and no spaces otherwise it will be truncated to 27
   */
  report(system: LogCategory, severity: Severity, message: string, ...data: any[] | { [key: string]: any }[] | string[]) {
    let msg = this.syslogFormat(system, severity, new Date(), message, JSON.stringify(data));
    if (severity > Severity.ERROR) {
      console.log(msg);
    } else {
      console.error(msg);
    }
  }

  flush(logCategory?: LogCategory): void {

  }
}
