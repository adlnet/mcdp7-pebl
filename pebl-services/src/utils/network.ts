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

import * as https from 'https';
import * as querystring from 'querystring';
import { Response } from 'express';
import { IncomingMessage } from 'http';
import { auditLogger } from '../main';
import { LogCategory, Severity } from './constants';

export function postFormData(
  host: string,
  path: string,
  headers: { [key: string]: any },
  data: { [key: string]: any },
  successCallback?: (incomingData: string) => void,
  failCallback?: (e: Error | { [key: string]: any }) => void): void {

  let outgoingData = querystring.stringify(data);

  var postOptions = {
    host: host,
    protocol: "https:",
    port: 443,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': outgoingData.length
    }
  }

  Object.assign(postOptions.headers, headers);
  var dataArr: string[] = [];
  const req = https.request(postOptions, function(resp: IncomingMessage) {
    resp.setEncoding("utf-8");

    resp.on("data", function(data) {
      dataArr.push(data);
    });

    resp.on("end", function() {
      let data = dataArr.join("");
      let statusCode = 200;
      if (resp.statusCode) {
        statusCode = resp.statusCode;
      }

      if (statusCode < 300) {
        auditLogger.report(LogCategory.NETWORK, Severity.INFO, "HTTPPOST", statusCode, host, path);
        if (successCallback) {
          successCallback(data);
        }
      } else {
        let message = "default bad post";
        if (resp.statusMessage) {
          message = resp.statusMessage;
        }
        auditLogger.report(LogCategory.NETWORK, Severity.ERROR, "HTTPPOST", statusCode, message, host, path, data);
        if (failCallback) {
          failCallback({
            error: message,
            message: data
          });
        }
      }
    });
  });

  req.on('error', function(e) {
    if (failCallback) {
      auditLogger.report(LogCategory.NETWORK, Severity.CRITICAL, "HTTPPOST", host, path, e);
      failCallback(e);
    }
  });
  req.write(outgoingData);
  req.end();
}

export function postData(
  host: string,
  path: string,
  headers: { [key: string]: any },
  rawData: string,
  successCallback?: (incomingData: string) => void,
  failCallback?: (e: Error | { [key: string]: any }) => void): void {

  let outgoingData = (rawData.startsWith("\"") && rawData.endsWith("\"")) ? rawData.substring(1, rawData.length - 1) : rawData;

  var postOptions = {
    host: host,
    protocol: "https:",
    port: 443,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  }

  Object.assign(postOptions.headers, headers); // Merge headers arg into postOptions
  var dataArr: string[] = [];
  const req = https.request(postOptions, function(resp: IncomingMessage) {
    resp.setEncoding("utf-8");

    resp.on("data", function(data) {
      dataArr.push(data);
    });

    resp.on("end", function() {
      let data = dataArr.join("");
      let statusCode = 200;
      if (resp.statusCode) {
        statusCode = resp.statusCode;
      }

      if (statusCode < 300) {
        auditLogger.report(LogCategory.NETWORK, Severity.INFO, "HTTPPOST", statusCode, host, path);
        if (successCallback) {
          successCallback(data);
        }
      } else {
        let message = "default bad post";
        if (resp.statusMessage) {
          message = resp.statusMessage;
        }
        auditLogger.report(LogCategory.NETWORK, Severity.ERROR, "HTTPPOST", statusCode, message, host, path, data);
        if (failCallback) {
          failCallback({
            error: message,
            message: data
          });
        }
      }
    });
  });

  req.on('error', function(e) {
    if (failCallback) {
      auditLogger.report(LogCategory.NETWORK, Severity.CRITICAL, "HTTPPOST", host, path, e);
      failCallback(e);
    }
  });
  req.write(outgoingData);
  req.end();
}

export function getData(
  host: string,
  path: string,
  headers: { [key: string]: any },
  successCallback?: (incomingData: string) => void,
  failCallback?: (e: Error | { [key: string]: any }) => void): void {

  var dataArr: string[] = [];
  const req = https.get(
    <any>{
      host: host,
      path: path,
      protocol: "https:",
      port: 443,
      method: "GET",
      headers: headers
    },
    function(resp: IncomingMessage) {
      resp.setEncoding("utf-8");
      resp.on("data", function(data) {
        dataArr.push(data);
      });
      resp.on("end", function() {
        let data = dataArr.join("");
        let statusCode = 200;
        if (resp.statusCode) {
          statusCode = resp.statusCode;
        }

        if (statusCode < 300) {
          auditLogger.report(LogCategory.NETWORK, Severity.INFO, "HTTPGET", statusCode, host, path)
          if (successCallback) {
            successCallback(data);
          }
        } else {
          let statusMessage = "HTTP GET errored";
          if (resp.statusMessage) {
            statusMessage = resp.statusMessage;
          }
          auditLogger.report(LogCategory.NETWORK, Severity.ERROR, "HTTPGET", statusCode, statusMessage, host, path, data)
          if (failCallback) {
            failCallback({
              error: statusMessage,
              message: data
            });
          }
        }
      });
    });
  req.on('error', function(e) {
    if (failCallback) {
      auditLogger.report(LogCategory.NETWORK, Severity.CRITICAL, "HTTPGET", host, path, e);
      failCallback(e);
    }
  });
}

export function deleteData(
  host: string,
  path: string,
  headers: { [key: string]: any },
  successCallback?: (incomingData: string) => void,
  failCallback?: (e: Error | { [key: string]: any }) => void): void {

  var dataArr: string[] = [];
  const req = https.request(
    <any>{
      host: host,
      path: path,
      protocol: "https:",
      port: 443,
      method: "DELETE",
      headers: headers
    },
    function(resp: IncomingMessage) {
      resp.setEncoding("utf-8");
      resp.on("data", function(data) {
        dataArr.push(data);
      });
      resp.on("end", function() {
        let data = dataArr.join("");
        let statusCode = 200;
        if (resp.statusCode) {
          statusCode = resp.statusCode;
        }

        if (statusCode < 300) {
          auditLogger.report(LogCategory.NETWORK, Severity.INFO, "HTTPDELETE", statusCode, host, path)
          if (successCallback) {
            successCallback(data);
          }
        } else {
          let statusMessage = "HTTP DELETE errored";
          if (resp.statusMessage) {
            statusMessage = resp.statusMessage;
          }
          auditLogger.report(LogCategory.NETWORK, Severity.ERROR, "HTTPDELETE", statusCode, statusMessage, host, path, data)
          if (failCallback) {
            failCallback({
              error: statusMessage,
              message: data
            });
          }
        }
      });
    });
  req.on('error', function(e) {
    if (failCallback) {
      auditLogger.report(LogCategory.NETWORK, Severity.CRITICAL, "HTTPDELETE", host, path, e);
      failCallback(e);
    }
  });
}

export function validateAndRedirectUrl(validRedirectDomainLookup: { [key: string]: boolean },
  session: Express.Session,
  res: Response,
  url?: string): void {

  if (url) {
    try {
      let origin = new URL(url).hostname;
      if (validRedirectDomainLookup[origin] || validRedirectDomainLookup["*"]) {
        auditLogger.report(LogCategory.AUTH, Severity.INFO, "RedirectingURL", session.id, url);
        res.redirect(url);
      }
    } catch (e) {
      auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "RedirectingURLInvalid", session.id, url);
      res.status(400).end();
    }
  } else {
    res.redirect(session.redirectUrl);
  }
}
