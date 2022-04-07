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

import { Severity, LogCategory, logCategoriesEnums } from "../utils/constants";
import { createWriteStream, WriteStream, stat, exists, rename, unlink, mkdir } from "fs";

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

export class SyslogAuditLogManager {
  private logBuffers: { [key: string]: string[] };
  private debugging: boolean;

  private readonly WARNING_BUFFER_ENTRIES = 3000;

  private config: { [key: string]: any };
  private hostname: string;
  private version: string;
  private logFileDirectory: string;
  private openStreams: { [key: string]: WriteStream };
  private canWriteStream: { [key: string]: boolean };
  private remainingStreamSize: { [key: string]: number };
  private logFileSize: number;

  constructor(config: { [key: string]: any }) {
    this.config = config;
    this.debugging = config.debugging ? config.debugging : false;
    this.hostname = config.serverName.substr(0, 255);
    this.logFileDirectory = this.config.logFileDirectory.endsWith("/") ?
      this.config.logFileDirectory.substring(0, this.config.logFileDirectory.length - 1) :
      this.config.logFileDirectory;

    this.logBuffers = {};
    this.openStreams = {};
    this.canWriteStream = {};
    this.remainingStreamSize = {};
    this.version = (" PeBL-services." + this.config.version).substr(0, 48);
    this.logFileSize = this.parseLogFileSize(this.config.logFileSizeLimit);

    for (let logCategory of logCategoriesEnums) {
      this.logBuffers[logCategory] = [];
    }

    mkdir(this.logFileDirectory, { recursive: true }, (err) => {
      if (err) {
        console.error("failed to create logging directory", err);
        process.exit(15);
      }
      for (let logCategory of logCategoriesEnums) {
        this.openLogFile(logCategory,
          this.logCategoryToLogFile(logCategory, this.logFileDirectory),
          (ws) => {
            this.openStreams[logCategory] = ws
          });
      }
    });
  }

  private openLogFile(logCategory: LogCategory, path: string, callback: (ws: WriteStream) => void): void {
    stat(path, (err, f) => {
      let openSize;
      if (err) {
        if (err.code === "ENOENT") {
          openSize = this.logFileSize;
        } else {
          console.log("Failure to open log files", err);
          process.exit(8);
        }
      } else {
        openSize = this.logFileSize - f.size;
      }
      if (openSize < 0) {
        this.archiveFile(path, () => {
          this.remainingStreamSize[logCategory] = this.logFileSize;
          let ws = createWriteStream(path, { flags: "a" });
          ws.on('drain', this.onDrain(logCategory));
          this.canWriteStream[logCategory] = true;
          callback(ws);
        });
      } else {
        this.remainingStreamSize[logCategory] = openSize;
        let ws = createWriteStream(path, { flags: "a" });
        ws.on('drain', this.onDrain(logCategory));
        this.canWriteStream[logCategory] = true;
        callback(ws);
      }
    });
  }

  private archiveFile(path: string, callback: () => void): void {
    if (this.config.logFileRotation <= 0) {
      exists(path, (isF) => {
        if (isF) {
          unlink(path, (err) => {
            if (err) {
              console.error("failed to remove log file", err);
              process.exit(11);
            }
            callback();
          });
        } else {
          callback();
        }
      });
    } else {
      let processFile = (i: number) => {
        let fileName: string;
        if (i == 0) {
          fileName = path;
        } else {
          fileName = path + "." + i;
        }
        exists(fileName, (isF) => {
          if (i < 1) {
            if (isF) {
              rename(path,
                path + "." + (i + 1),
                (err) => {
                  if (err) {
                    console.error("failed to rename log file", err);
                    process.exit(12);
                  }
                  callback();
                });
            } else {
              callback();
            }
          } else {
            if (isF) {
              if (this.config.logFileRotation <= (i + 1)) {
                unlink(fileName, (err) => {
                  if (err) {
                    console.error("failed to remove log file", err);
                    process.exit(13);
                  }
                  processFile(i - 1);
                });
              } else {
                rename(fileName,
                  path + "." + (i + 1),
                  (err) => {
                    if (err) {
                      console.error("failed to rename log file", err);
                      process.exit(14);
                    }
                    processFile(i - 1);
                  });
              }
            } else {
              processFile(i - 1);
            }
          }
        });
      };
      processFile(this.config.logFileRotation);
    }
  }

  private parseLogFileSize(str: string): number {
    let s = str.toLocaleLowerCase();
    let i = parseInt(s.substr(0, s.length - 2))
    if (s.endsWith("kb")) {
      return i * 1024;
    } else if (s.endsWith("mb")) {
      return i * 1024 * 1024;
    } else if (s.endsWith("gb")) {
      return i * 1024 * 1024 * 1024;
    }
    console.error("Invalid log file size <number>[k/m/g]b");
    process.exit(5);
  }

  private logCategoryToLogFile(logCategory: LogCategory, path: string): string {
    if (LogCategory.AUTH === logCategory) {
      return path + "/auth.log";
    } if (LogCategory.FILE_SYSTEM === logCategory) {
      return path + "/fs.log";
    } if (LogCategory.MESSAGE === logCategory) {
      return path + "/msg.log";
    } if (LogCategory.NETWORK === logCategory) {
      return path + "/network.log";
    } if (LogCategory.PLUGIN === logCategory) {
      return path + "/plugin.log";
    } if (LogCategory.STORAGE === logCategory) {
      return path + "/storage.log";
    } if (LogCategory.SYSTEM === logCategory) {
      return path + "/system.log";
    }
    console.error("Invalid log category path");
    process.exit(6);
  }

  private syslogFormat(facility: LogCategory,
    severity: Severity,
    timestamp: Date,
    msgID: string,
    data: string): string {

    let str: string = "";

    str += "<" + ((SyslogFacility.USER * 8) + severity) + ">"; //priority
    // str.push("<" + ((facility * 8) + severity) + ">"); //priority
    str += "1"; //version of syslog
    str += " " + timestamp.toISOString(); // timestamp
    str += " " + this.hostname; // this server host

    str += this.version; // service name

    str += " " + process.pid; // process id
    str += " " + facility + msgID.trim().substr(0, 27); //message type
    str += " -"; //structured data
    str += " BOM" + data; //unstructured msg

    return str + "\n";
  }

  /*
   * @param message must be 27 or fewer characters and no spaces otherwise it will be truncated to 27
   */
  report(system: LogCategory, severity: Severity, message: string, ...data: any[] | { [key: string]: any }[] | string[]) {
    if (this.debugging) {
      this.logBuffers[system].push(this.syslogFormat(system, severity, new Date(), message, JSON.stringify(data)));
    } else if (severity != Severity.DEBUG) {
      this.logBuffers[system].push(this.syslogFormat(system, severity, new Date(), message, JSON.stringify(data)));
    }
    this.processLogs(system);
    if (this.logBuffers[system].length > this.WARNING_BUFFER_ENTRIES) {
      console.error("Exceeding logging capacity warning");
    }
  }

  writeLog(logCategory: LogCategory, log: string, callback: () => void): void {
    let logSize = Buffer.byteLength(log, "utf-8");
    let remainingSize = this.remainingStreamSize[logCategory] - logSize
    if (remainingSize < 0) {
      this.canWriteStream[logCategory] = false;
      this.openLogFile(logCategory,
        this.logCategoryToLogFile(logCategory, this.logFileDirectory),
        (ws) => {
          this.openStreams[logCategory] = ws;
          let writeMore = ws.write(log);
          this.canWriteStream[logCategory] = writeMore
          if (writeMore) {
            callback();
          }
        });
    } else {
      this.remainingStreamSize[logCategory] = remainingSize;
      let writeMore = this.openStreams[logCategory].write(log);
      this.canWriteStream[logCategory] = writeMore;
      if (writeMore) {
        callback();
      }
    }
  }

  private processLogs(logCategory: LogCategory): void {
    if (this.canWriteStream[logCategory]) {
      let log = this.logBuffers[logCategory].shift();
      if (log) {
        this.writeLog(logCategory, log, () => {
          this.processLogs(logCategory);
        });
      }
    }
  }

  private onDrain(logCategory: LogCategory): () => void {
    let cb = () => {
      if (!this.canWriteStream[logCategory]) {
        this.canWriteStream[logCategory] = true;
        this.processLogs(logCategory);
      }
    };
    return cb
  }

  flush(logCategory?: LogCategory): void {
    // if (logCategory !== undefined) {
    //   // if (this.writeOutHandlers[logCategory]) {
    //   //   clearTimeout(<NodeJS.Timeout>this.writeOutHandlers[logCategory]);
    //   //   this.writeOutHandlers[logCategory] = undefined;
    //   // }
    //   // if (logCategory > Severity.ERROR) {
    //   //   console.log(this.logBuffers[logCategory].join("\n"));
    //   // } else {
    //   //   console.error(this.logBuffers[logCategory].join("\n"));
    //   // }
    //   this.logBuffers[logCategory] = [];
    // } else {
    for (let lce of logCategoriesEnums) {
      if (this.openStreams[lce]) {
        this.openStreams[lce].close();
      }
    }
    // }
  }
}
