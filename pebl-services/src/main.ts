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

import * as bodyParser from "body-parser";

import * as redis from 'redis'
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import * as path from 'path';

import { Request, Response } from 'express';
import * as WebSocket from 'ws';
import { OpenIDConnectAuthentication } from './plugins/openidConnect';

import { SqlDataStore } from './interfaces/sqlDataStore';
import { PgSqlDataStore } from './plugins/sqlDataStore';
import { RedisSessionDataCache } from './plugins/sessionCache';
import { RedisMessageQueuePlugin } from './plugins/messageQueue';
import { DefaultAuthorizationManager } from './plugins/authorizationManager'
import { DefaultValidationManager } from './plugins/validationManager'
import { ValidationManager } from "./interfaces/validationManager";
import { AuthorizationManager } from "./interfaces/authorizationManager";
import { SessionDataManager } from "./interfaces/sessionDataManager";
import { MessageQueueManager } from "./interfaces/messageQueueManager";
import { AuthenticationManager } from "./interfaces/authenticationManager";
import { ServiceMessage } from "./models/serviceMessage";
import { GroupManager } from "./interfaces/groupManager";
import { DefaultGroupManager } from "./plugins/groupManager";
import { UserManager } from "./interfaces/userManager";
import { RoleManager } from "./interfaces/roleManager";
import { DefaultUserManager } from "./plugins/userManager";
import { DefaultRoleManager } from "./plugins/roleManager";
import { PluginManager } from "./interfaces/pluginManager";
import { DefaultPluginManager } from "./plugins/pluginManager";
import { ActivityManager } from "./interfaces/activityManager";
import { DefaultActivityManager } from "./plugins/activityManager";
import { AnnotationManager } from "./interfaces/annotationManager";
import { DefaultAnnotationManager } from "./plugins/annotationManager";
import { EventManager } from "./interfaces/eventManager";
import { DefaultEventManager } from "./plugins/eventManager";
import { AssetManager } from "./interfaces/assetManager";
import { DefaultAssetManager } from "./plugins/assetManager";
import { CompetencyManager } from "./interfaces/competencyManager";
import { DefaultCompetencyManager } from "./plugins/competencyManager";
import { MembershipManager } from "./interfaces/membershipManager";
import { DefaultMembershipManager } from "./plugins/membershipManager";
import { MessageManager } from "./interfaces/messageManager";
import { ModuleEventsManager } from "./interfaces/moduleEventsManager";
import { DefaultModuleEventsManager } from "./plugins/moduleEventsManager";
import { NotificationManager } from "./interfaces/notificationManager";
import { DefaultNotificationManager } from "./plugins/notificationManager";
import { DefaultMessageManager } from "./plugins/messageManager";
import { ThreadManager } from "./interfaces/threadManager";
import { DefaultThreadManager } from "./plugins/threadManager";
import { ReferenceManager } from "./interfaces/referenceManager";
import { DefaultReferenceManager } from "./plugins/referenceManager";
import { ActionManager } from "./interfaces/actionManager";
import { DefaultActionManager } from "./plugins/actionManager";
import { QuizManager } from "./interfaces/quizManager";
import { DefaultQuizManager } from "./plugins/quizManager";
import { SessionManager } from "./interfaces/sessionManager";
import { DefaultSessionManager } from "./plugins/sessionManager";
import { NavigationManager } from "./interfaces/navigationManager";
import { DefaultNavigationManager } from "./plugins/navigationManager";
import { LRS } from "./interfaces/lrsManager";
import { LRSPlugin } from "./plugins/lrs";
import { Endpoint } from "./models/endpoint";
import { validateAndRedirectUrl } from "./utils/network";
import { AuditLogManager } from "./interfaces/auditLogManager";
import { SyslogAuditLogManager } from "./plugins/syslogAuditLogManager";
import { Severity, LogCategory, generateUserClearedTimestamps, generateUserClearedNotificationsKey } from "./utils/constants";
import { ConsoleAuditLogManager } from "./plugins/ConsoleAuditLogManager";
import { LinkedInAuthentication } from "./plugins/linkedInAuth";
import { DefaultArchiveManager } from "./plugins/archiveManager";
import { EpubManager } from "./interfaces/epubManager";
import { DefaultEpubManager } from "./plugins/epubManager";
import { ArchiveManager } from "./interfaces/archiveManager";
import { popThroughArray } from "./utils/utils";

let express = require('express');
var multer = require('multer');


let expressApp = express();

let shuttingDown = false;

if (process.argv.length < 3) {
  console.error("command should include a path to the server configuration json", process.argv);
  console.error("node <pathToScript> <pathToConfigurationJson>");
  process.exit(3);
}
let config: { [key: string]: any };
try {
  config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
} catch (e) {
  console.error("Invalid config file", e);
  process.exit(2);
}

var epubUpload = multer({
  storage: multer.diskStorage({
    destination: function(req: any, file: any, cb: any) {
      console.log(config.epubTempUploadPath);
      cb(null, config.epubTempUploadPath);
    },
    filename: function(req: any, file: any, cb: any) {
      console.log(file.originalname);
      cb(null, file.originalname);
    }
  })
})

var epubUploadHandler = epubUpload.single('epub');

let terminateServices: (cb?: () => void) => void;

let alm: AuditLogManager;
if (config["usingSyslogFormat"]) {
  alm = new SyslogAuditLogManager(config);
} else {
  alm = new ConsoleAuditLogManager(config);
}

let httpsServer: http.Server;

process.on('uncaughtException', (err) => {
  auditLogger.report(LogCategory.SYSTEM, Severity.EMERGENCY, "uncaughtException", err.stack);
  auditLogger.flush();
  if (terminateServices) {
    terminateServices();
  } else {
    process.exit(1);
  }
});

export const auditLogger: AuditLogManager = alm;

let validRedirectDomainLookup: { [key: string]: boolean } = {};
for (let validDomain of config.validRedirectDomains) {
  validRedirectDomainLookup[validDomain] = true;
}
config.validRedirectDomainLookup = validRedirectDomainLookup;
let privKey;
let cert;
let credentials: { [key: string]: any } = {};

let expressSession = require('express-session');
let RedisSessionStore = require('connect-redis')(expressSession);

let redisConfig = {
  port: (config.redisPort || 6379),
  host: (config.redisHost || "127.0.0.1"),
  password: config.redisAuth,
  detect_buffers: true
};

const redisClient = redis.createClient(redisConfig);

const { Pool } = require('pg')

const pgPool = config.sqlConnectionString ? new Pool({
  connectionString: config.sqlConnectionString
}) : undefined;

const pluginManager: PluginManager = new DefaultPluginManager();
const sqlManager: SqlDataStore = new PgSqlDataStore(pgPool);
const redisCache: SessionDataManager = new RedisSessionDataCache(redisClient);
const archiveManager: ArchiveManager = new DefaultArchiveManager(redisCache, sqlManager, config);
const notificationManager: NotificationManager = new DefaultNotificationManager(redisCache);
const userManager: UserManager = new DefaultUserManager(redisCache);
const groupManager: GroupManager = new DefaultGroupManager(redisCache, userManager);
const roleManager: RoleManager = new DefaultRoleManager(redisCache, userManager);
const activityManager: ActivityManager = new DefaultActivityManager(redisCache);
const annotationManager: AnnotationManager = new DefaultAnnotationManager(redisCache);
const eventManager: EventManager = new DefaultEventManager(redisCache);
const assetManager: AssetManager = new DefaultAssetManager(redisCache);
const competencyManager: CompetencyManager = new DefaultCompetencyManager(redisCache);
const membershipManager: MembershipManager = new DefaultMembershipManager(redisCache);
const messageManager: MessageManager = new DefaultMessageManager(redisCache);
const moduleEventsManager: ModuleEventsManager = new DefaultModuleEventsManager(redisCache);
const threadManager: ThreadManager = new DefaultThreadManager(redisCache, sqlManager, groupManager);
const referenceManager: ReferenceManager = new DefaultReferenceManager(redisCache, notificationManager);
const actionManager: ActionManager = new DefaultActionManager(redisCache, sqlManager);
const quizManager: QuizManager = new DefaultQuizManager(redisCache, sqlManager);
const sessionManager: SessionManager = new DefaultSessionManager(redisCache, sqlManager);
const navigationManager: NavigationManager = new DefaultNavigationManager(redisCache);
const epubManager: EpubManager = new DefaultEpubManager(config);
let e;
try {
  let url = new URL(config.lrsUrl);
  e = new Endpoint({
    host: url.host,
    path: url.pathname,
    headers: config.lrsHeaders
  });
} catch (e) {
  auditLogger.report(LogCategory.SYSTEM, Severity.EMERGENCY, "Invalid LRS address", config.lrsUrl, e.stack);
  auditLogger.flush();
  process.exit(4);
}
const lrsManager: LRS = new LRSPlugin(e);

const authorizationManager: AuthorizationManager = new DefaultAuthorizationManager(pluginManager, groupManager, userManager, roleManager);
const validationManager: ValidationManager = new DefaultValidationManager(pluginManager);

pluginManager.register(groupManager);
pluginManager.register(roleManager);
pluginManager.register(userManager);
pluginManager.register(activityManager);
pluginManager.register(annotationManager);
pluginManager.register(eventManager);
pluginManager.register(assetManager);
pluginManager.register(competencyManager);
pluginManager.register(membershipManager);
pluginManager.register(messageManager);
pluginManager.register(moduleEventsManager);
pluginManager.register(notificationManager);
pluginManager.register(threadManager);
pluginManager.register(referenceManager);
pluginManager.register(actionManager);
pluginManager.register(quizManager);
pluginManager.register(sessionManager);
pluginManager.register(navigationManager);
pluginManager.register(epubManager);

(async () => {

  await roleManager.addRole("systemAdmin", "System Admin", Object.keys(pluginManager.getMessageTemplates()));

  await roleManager.addRole("default",
    "Default",
    [
      "saveActions",
      "getAnnotations",
      "saveAnnotations",
      "deleteAnnotation",
      "saveEvents",
      "getModuleEvents",
      "saveModuleEvents",
      "deleteModuleEvent",
      "saveNavigations",
      "deleteNotification",
      "saveQuizes",
      "saveQuestions",
      "saveReferences",
      "getReferences",
      "deleteReference",
      "saveSessions",
      "saveThreadedMessage",
      "getThreadedMessages",
      "subscribeThread",
      "unsubscribeThread",
      "getSubscribedThreads"
    ]);

  const messageQueue: MessageQueueManager = new RedisMessageQueuePlugin({
    port: (config.redisPort || 6379),
    host: (config.redisHost || "127.0.0.1"),
    password: config.redisAuth,
    ns: 'rsmq',
    realtime: true
  }, pluginManager, redisCache, lrsManager, archiveManager);

  messageQueue.initialize();

  let am: AuthenticationManager;
  if (config.authenticationMethod && (config.authenticationMethod.toLowerCase() === "linkedin")) {
    am = new LinkedInAuthentication(config, userManager);
  } else {
    am = new OpenIDConnectAuthentication(config, userManager);
  }
  const authenticationManager: AuthenticationManager = am;

  if (config.useSSL) {
    privKey = fs.readFileSync(config.privateKeyPath, "utf8");
    cert = fs.readFileSync(config.certificatePath, "utf8");

    credentials = {
      serverName: config.serverName,
      key: privKey,
      cert: cert
    };

    httpsServer = https.createServer(credentials, expressApp);
  } else {
    httpsServer = http.createServer(expressApp);
  }

  expressApp = require('express-ws')(expressApp, httpsServer).app;

  var authenticateSession = async (req: Request, res: Response, next: Function) => {
    if (!config.bypassAuthoringAuth) {
      if (req.session) {
        let isLoggedIn = await authenticationManager.isLoggedIn(req.session);
        if (isLoggedIn)
          next();
        else {
          res.status(401);
          res.statusMessage = 'Not logged in';
          res.send();
        }
      } else {
        res.status(503).end();
      }
    } else {
      next();
    }
  }


  // Potentially needed for CORS
  var allowCrossDomain = (req: Request, res: Response, next: Function) => {
    let originUrl = <string>req.headers["origin"];
    try {
      if (originUrl) {
        let origin = new URL(originUrl).hostname;
        if (validRedirectDomainLookup[origin] || validRedirectDomainLookup["*"]) {
          res.header('Access-Control-Allow-Origin', originUrl);
          res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
          res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          res.header('Access-Control-Allow-Credentials', 'true');
        }
      }
    } catch (e) {
      auditLogger.report(LogCategory.NETWORK, Severity.DEBUG, "BadOriginUrl", e);
    }
    next();
  }

  expressApp.use(allowCrossDomain);

  redisClient.on("error", (error) => {
    if (error.errno == -111) {
      auditLogger.report(LogCategory.STORAGE, Severity.EMERGENCY, "RedisConnectFailed", error);
      if (terminateServices) {
        terminateServices();
      } else {
        process.exit(5);
      }
    } else {
      auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RedisError", error);
    }
  });

  expressApp.use(
    expressSession(
      {
        store: new RedisSessionStore({ client: redisClient, ttl: config.sessionTTL }),
        secret: config.sessionSecret,
        cookie: {
          secure: true,
          httpOnly: true,
          maxAge: (config.sessionTTL * 1000), //wants time in milliseconds
          sameSite: config.cookieSameSite
        },
        name: "s",
        proxy: config.usesProxy,
        saveUninitialized: false,
        resave: false
      }
    )
  );

  expressApp.use(bodyParser.urlencoded({ extended: false }));
  expressApp.use(bodyParser.json());

  expressApp.use((req: Request, res: Response, next: Function) => {
    auditLogger.report(LogCategory.NETWORK,
      Severity.INFO,
      "ClientConnection",
      req.ip,
      req.method,
      req.httpVersion,
      req.headers["origin"],
      req.url,
      req.session ? req.session.id : "noSession");

    if (req.session) {
      req.session.ip = req.ip;
    }
    next();
  });

  expressApp.disable('x-powered-by');

  expressApp.get('/', (req: Request, res: Response) => {
    auditLogger.report(LogCategory.NETWORK, Severity.DEBUG, "HelloSessionId", req.session?.id)
    res.send('Hello World!, version ' + config.version).end();
  });

  expressApp.get('/login', async (req: Request, res: Response) => {
    if (req.session) {
      let isLoggedIn = await authenticationManager.isLoggedIn(req.session);
      if (req.session) {
        auditLogger.report(LogCategory.NETWORK, Severity.DEBUG, "URLLogin", req.session.id, isLoggedIn);
        if (isLoggedIn) {
          validateAndRedirectUrl(validRedirectDomainLookup, req.session, res, req.query["redirectUrl"] as string);
        } else {
          authenticationManager.login(req, req.session, res);
        }
      } else {
        auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "URLLoginNoSession", req.ip);
        res.status(503).end();
      }
    } else {
      auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "URLLoginNoSession", req.ip);
      res.status(503).end();
    }
  });

  expressApp.get('/redirect', async (req: Request, res: Response) => {
    if (req.session) {
      let isLoggedIn = await authenticationManager.isLoggedIn(req.session);
      if (req.session) {
        auditLogger.report(LogCategory.NETWORK, Severity.DEBUG, "URLRedirect", req.session.id, isLoggedIn);
        if (isLoggedIn) {
          auditLogger.report(LogCategory.NETWORK, Severity.INFO, "URLRedirectLoggedIn", req.session.id, req.session.ip);
          res.status(200).end();
        } else {
          authenticationManager.redirect(req, req.session, res);
        }
      } else {
        auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "URLRedirectNoSession", req.ip);
        res.status(503).end();
      }

    } else {
      auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "URLRedirectNoSession", req.ip);
      res.status(503).end();
    }
  });

  expressApp.get('/logout', async (req: Request, res: Response) => {
    if (req.session) {
      let isLoggedIn = await authenticationManager.isLoggedIn(req.session);
      if (req.session) {
        auditLogger.report(LogCategory.NETWORK, Severity.DEBUG, "URLLogout", req.session.id, isLoggedIn);
        if (isLoggedIn) {
          authenticationManager.logout(req, req.session, res);
        } else {
          validateAndRedirectUrl(validRedirectDomainLookup, req.session, res, req.query["redirectUrl"] as string);
        }
      } else {
        auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "URLLogoutNoSession", req.ip);
        res.status(503).end();
      }
    } else {
      auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "URLLogoutNoSession", req.ip);
      res.status(503).end();
    }
  });

  expressApp.get('/user/profile', async (req: Request, res: Response) => {
    if (req.session) {
      let isLoggedIn = await authenticationManager.isLoggedIn(req.session);
      if (req.session) {
        auditLogger.report(LogCategory.NETWORK, Severity.DEBUG, "URLGetProfile", req.session.id, isLoggedIn);
        if (isLoggedIn) {
          let profile = await authenticationManager.getProfile(req.session);
          if (profile) {
            res.send(profile).end();
          } else {
            auditLogger.report(LogCategory.AUTH, Severity.ERROR, "URLProfileNotFound", req.session.id, req.session.ip);
            res.status(401).end();
          }
        } else {
          auditLogger.report(LogCategory.AUTH, Severity.ERROR, "URLProfileAuthFail", req.session.id, req.session.ip);
          res.status(401).end();
        }
      } else {
        auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "URLProfileNoSession", req.ip);
        res.status(503).end();
      }
    } else {
      auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "URLProfileNoSession", req.ip);
      res.status(503).end();
    }
  });

  expressApp.post('/validate', function(req: Request, res: Response) {
    authenticationManager.validate(req.body.token, req, res);
  });

  expressApp.post('/upload-epub', authenticateSession, async function(req: Request, res: Response) {
    if (req && req.session) {
      let username = req.session.identity.preferred_username;
      await authorizationManager.assemblePermissionSet(username, req.session);
      if (req.session) {
        let authorized = authorizationManager.authorize(username, req.session.permissions, {
          requestType: 'uploadEpub',
          identity: username
        });
        if (authorized) {
          epubUploadHandler(req, res, function(err: any) {
            if (err) {
              res.status(500);
              res.send(err.toString());
            }

            let uploadPath = path.join((req as any).file.destination, (req as any).file.filename);
            epubManager.uploadEpub(uploadPath).then((result) => {
              console.log(result);
              if (result.status === 201)
                res.sendStatus(201);
              else {
                res.status(result.status);
                res.send(result.message);
              }
            }).catch((e) => {
              console.log(e);
              res.status(500);
              res.send(e.toString());
            }).finally(() => {
              fs.unlink(uploadPath, () => { });
            })
          })
        } else {
          auditLogger.report(LogCategory.MESSAGE, Severity.ERROR, "MsgNotAuthorized", req.session.id, req.session.ip, username, 'uploadEpub');
          res.sendStatus(401);
        }
      } else {
        auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "ProcessMsgNoSession");
        res.sendStatus(401);
      }
    } else {
      auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "ProcessMsgNoSession");
      res.sendStatus(401);
    }
  })

  expressApp.delete('/delete-epub', authenticateSession, async function(req: Request, res: Response) {
    if (req && req.session) {
      let username = req.session.identity.preferred_username;
      await authorizationManager.assemblePermissionSet(username, req.session);
      if (req.session) {
        let authorized = authorizationManager.authorize(username, req.session.permissions, {
          requestType: 'deleteEpub',
          identity: username
        });
        if (authorized) {
          epubManager.deleteEpub(req.query.id as string).then((result) => {
            if (result.status === 200)
              res.sendStatus(200);
            else {
              res.status(result.status);
              res.send(result.message);
            }
          }).catch((e) => {
            res.status(500);
            res.send(e.toString());
          })
        } else {
          auditLogger.report(LogCategory.MESSAGE, Severity.ERROR, "MsgNotAuthorized", req.session.id, req.session.ip, username, 'deleteEpub');
          res.sendStatus(401);
        }
      } else {
        auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "ProcessMsgNoSession");
        res.sendStatus(401);
      }
    } else {
      auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "ProcessMsgNoSession");
      res.sendStatus(401);
    }
  })

  let processMessage = async (ws: WebSocket, req: Request, payload: { [key: string]: any }): Promise<void> => {
    if (req && req.session) {
      let username = req.session.identity.preferred_username;
      await authorizationManager.assemblePermissionSet(username, req.session);
      if (req.session) {
        let authorized = authorizationManager.authorize(username, req.session.permissions, payload);
        if (authorized) {
          auditLogger.report(LogCategory.MESSAGE, Severity.INFO, "MsgAuthorized", req.session.id, req.session.ip, username, payload.requestType);
        } else {
          auditLogger.report(LogCategory.MESSAGE, Severity.ERROR, "MsgNotAuthorized", req.session.id, req.session.ip, username, payload.requestType);
        }

        if (authorized) {
          let serviceMessage = new ServiceMessage(username, payload, req.session.id);
          await messageQueue.enqueueIncomingMessage(serviceMessage);
        } else if (ws.readyState == 1) {
          ws.send(JSON.stringify({
            identity: username,
            requestType: "error",
            payload: {
              description: "Unauthorized message",
              target: payload
            }
          }));
        }
      } else {
        auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "ProcessMsgNoSession");
      }
    } else {
      auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "ProcessMsgNoSession");
    }
  };

  expressApp.ws('/', async (ws: WebSocket, req: Request) => {
    let originUrl = <string>req.headers["origin"];

    let origin;
    try {
      origin = new URL(originUrl).hostname;
    } catch (e) {
      origin = "null";
    }

    if (!validRedirectDomainLookup[origin] && !validRedirectDomainLookup["*"]) {
      if (ws.readyState === 1) {
        ws.terminate();
      }
      auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "WSBadOrigin", req.session?.id, req.ip, originUrl);
      return;
    } else {
      if (messageQueue.isUpgradeInProgress() || shuttingDown) {
        if (ws.readyState === 1) {
          ws.close();
        }
        auditLogger.report(LogCategory.SYSTEM,
          Severity.INFO,
          shuttingDown ? "ShuttingDown" : "UpgradeInProgress",
          req.session?.id,
          req.ip,
          originUrl);
        return;
      }
      if (req.session) {
        let isLoggedIn = await authenticationManager.isLoggedIn(req.session);
        if (isLoggedIn && req.session) {
          let sessionId = req.session.id
          let username = req.session.identity.preferred_username;

          await messageQueue.createOutgoingQueue(sessionId, ws);
          await messageQueue.subscribeNotifications(username, sessionId, ws);

          let processMessages = async (messages: { [key: string]: any }[]) => {
            let payload = messages.pop();
            if (payload) {
              if (!validationManager.validate(payload)) {
                auditLogger.report(LogCategory.MESSAGE, Severity.ERROR, "ProcessMsgInvalid", sessionId, req.ip, payload.requestType);
                if (ws.readyState === 1) {
                  ws.send(JSON.stringify({
                    identity: username,
                    requestType: "error",
                    payload: {
                      description: "Invalid Message",
                      payload: payload
                    }
                  }));
                }
                processMessages(messages);
              } else if (req.session) {
                let isLoggedIn = await authenticationManager.isLoggedIn(req.session);
                if (isLoggedIn && payload) {
                  await processMessage(ws, req, payload);
                  processMessages(messages);
                } else {
                  auditLogger.report(LogCategory.MESSAGE, Severity.ERROR, "ProcessMsgInvalidAuth", sessionId, req.ip);
                  if (ws.readyState === 1) {
                    ws.send(JSON.stringify({
                      identity: username,
                      requestType: "loggedOut"
                    }));
                    ws.close();
                  }
                }
              }
            }
          };

          let messageHandler = async () => {
            let clearedNotificationTimestamp = await redisCache.getAllHashPairs(generateUserClearedTimestamps(username));
            let clearedNotifications = await redisCache.getSetValues(generateUserClearedNotificationsKey(username));
            if (ws.readyState === 1) {
              ws.send(JSON.stringify({
                identity: username,
                requestType: "serverReady"
              }));
              ws.send(JSON.stringify({
                identity: username,
                requestType: "setLastNotifiedDates",
                clearedTimestamps: clearedNotificationTimestamp,
                clearedNotifications: clearedNotifications
              }));

              ws.on('message', (msg) => {
                if (req.session) {
                  if (typeof msg === 'string') {
                    let payload: any;
                    try {
                      payload = JSON.parse(msg);
                    } catch (e) {
                      auditLogger.report(LogCategory.MESSAGE, Severity.ERROR, "BadMessageFormat", req.session.id, req.ip, e);
                      if (ws.readyState === 1) {
                        ws.send(JSON.stringify({
                          identity: username,
                          requestType: "error",
                          payload: {
                            description: "Bad Message",
                            target: msg
                          }
                        }));
                      }
                      return;
                    }

                    if (!validationManager.isMessageFormat(payload)) {
                      auditLogger.report(LogCategory.MESSAGE, Severity.ERROR, "InvalidMessageFormat", req.session.id, req.ip);
                      if (ws.readyState === 1) {
                        ws.send(JSON.stringify({
                          identity: username,
                          requestType: "error",
                          payload: {
                            description: "Invalid Message Format",
                            target: payload.id,
                            payload: payload
                          }
                        }));
                      }
                    }

                    let messages;
                    if (payload.requestType == "bulkPush") {
                      messages = payload.data;
                    } else {
                      messages = [payload];
                    }

                    req.session.touch();
                    processMessages(messages);
                  }
                } else {
                  auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "ProcessMsgNoSession", username, sessionId, req.ip);
                  if (ws.readyState === 1) {
                    ws.close();
                  }
                }
              });
            } else {
              auditLogger.report(LogCategory.MESSAGE, Severity.ERROR, "SocketClosedMain", username, sessionId, req.ip);
            }
          }

          archiveManager.isUserArchived(username).then(async (isArchived: boolean) => {
            if (!isArchived) {
              await messageHandler();
            } else {
              // retrieve archive data
              archiveManager.setUserArchived(username, true).then(async () => {
                await messageHandler();
              }).catch((e) => {
                auditLogger.report(LogCategory.STORAGE, Severity.CRITICAL, "RestoreArchivedDataFail", username, sessionId, e);
              })
            }
          })

          if (ws.readyState === 1) {
            ws.on('close', function() {
              messageQueue.removeOutgoingQueue(sessionId);
              messageQueue.unsubscribeNotifications(username);
            });
          }
        } else {
          auditLogger.report(LogCategory.AUTH, Severity.WARNING, "ProcessMsgInvalidAuth", req.ip);
          if (ws.readyState === 1) {
            ws.send(JSON.stringify({
              identity: "guest",
              requestType: "loggedOut"
            }));
            ws.close();
          }
        }
      } else {
        auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "WSNoSession", req.ip);
        if (ws.readyState === 1) {
          ws.terminate();
        }
      }
    }
  });

  terminateServices = (cb?: () => void) => {
    if (shuttingDown)
      return;
    shuttingDown = true;
    auditLogger.report(LogCategory.SYSTEM, Severity.INFO, "ShuttingServicesDown");
    let termSet = [];
    if (redisClient)
      termSet.push("redis");
    if (pgPool)
      termSet.push("pg");
    if (httpsServer)
      termSet.push("http");
    popThroughArray<string>(termSet,
      (method, next) => {
        if (method === "redis")
          setTimeout(() => {
            redisClient.quit(() => {
              auditLogger.report(LogCategory.SYSTEM, Severity.INFO, "ShutDownRedis");
              next();
            });
          }, 2000);
        else if (method === "pg")
          setTimeout(() => {
            pgPool.end(() => {
              auditLogger.report(LogCategory.SYSTEM, Severity.INFO, "ShutDownPostgres");
              next();
            });
          }, 2000);
        else if ((method === "http") && httpsServer.listening) {
          if (messageQueue)
            messageQueue.terminate(() => {
              auditLogger.report(LogCategory.SYSTEM, Severity.INFO, "ShutDownMsgQueue");
              httpsServer.close(() => {
                auditLogger.report(LogCategory.SYSTEM, Severity.INFO, "ShutDownHttps");
                next();
              });
            });
        } else
          next();
      },
      () => {
        auditLogger.report(LogCategory.SYSTEM, Severity.INFO, "ShutdownServices");
        if (cb) {
          cb();
        } else {
          process.exit(0);
        }
      });
  };

  process.on('SIGTERM', () => {
    terminateServices();
  });

  process.on('SIGINT', () => {
    terminateServices();
  });

  httpsServer.listen(config.port, () => {
    auditLogger.report(LogCategory.SYSTEM, Severity.INFO, 'ListeningPort', config.port, config.version);
  });

})().catch((err) => {
  auditLogger.report(LogCategory.SYSTEM, Severity.EMERGENCY, "uncaughtExceptionP", err);
  auditLogger.flush();
  if (terminateServices) {
    terminateServices();
  } else {
    process.exit(1);
  }
});
