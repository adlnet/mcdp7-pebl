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

// import { Message } from "./models/message";
// import { Reference } from "./models/reference";
// import { Action } from "./models/action";
// import { Session } from "./models/session";
// import { AgentObject } from "./models/xapiStatement";
// import { getData } from "./utils/network";


// import * as redis from 'redis'
// import * as fs from 'fs';


// import { RedisSessionDataCache } from './plugins/sessionCache';
// import { RedisMessageQueuePlugin } from './plugins/messageQueue';
// import { SessionDataManager } from "./interfaces/sessionDataManager";
// import { MessageQueueManager } from "./interfaces/messageQueueManager";
// import { ServiceMessage } from "./models/serviceMessage";
// import { GroupManager } from "./interfaces/groupManager";
// import { DefaultGroupManager } from "./plugins/groupManager";
// import { UserManager } from "./interfaces/userManager";
// import { RoleManager } from "./interfaces/roleManager";
// import { DefaultUserManager } from "./plugins/userManager";
// import { DefaultRoleManager } from "./plugins/roleManager";
// import { PluginManager } from "./interfaces/pluginManager";
// import { DefaultPluginManager } from "./plugins/pluginManager";
// import { ActivityManager } from "./interfaces/activityManager";
// import { DefaultActivityManager } from "./plugins/activityManager";
// import { AnnotationManager } from "./interfaces/annotationManager";
// import { DefaultAnnotationManager } from "./plugins/annotationManager";
// import { EventManager } from "./interfaces/eventManager";
// import { DefaultEventManager } from "./plugins/eventManager";
// import { AssetManager } from "./interfaces/assetManager";
// import { DefaultAssetManager } from "./plugins/assetManager";
// import { CompetencyManager } from "./interfaces/competencyManager";
// import { DefaultCompetencyManager } from "./plugins/competencyManager";
// import { MembershipManager } from "./interfaces/membershipManager";
// import { DefaultMembershipManager } from "./plugins/membershipManager";
// import { MessageManager } from "./interfaces/messageManager";
// import { ModuleEventsManager } from "./interfaces/moduleEventsManager";
// import { DefaultModuleEventsManager } from "./plugins/moduleEventsManager";
// import { NotificationManager } from "./interfaces/notificationManager";
// import { DefaultNotificationManager } from "./plugins/notificationManager";
// import { DefaultMessageManager } from "./plugins/messageManager";
// import { ThreadManager } from "./interfaces/threadManager";
// import { DefaultThreadManager } from "./plugins/threadManager";
// import { ReferenceManager } from "./interfaces/referenceManager";
// import { DefaultReferenceManager } from "./plugins/referenceManager";
// import { ActionManager } from "./interfaces/actionManager";
// import { DefaultActionManager } from "./plugins/actionManager";
// import { QuizManager } from "./interfaces/quizManager";
// import { DefaultQuizManager } from "./plugins/quizManager";
// import { SessionManager } from "./interfaces/sessionManager";
// import { DefaultSessionManager } from "./plugins/sessionManager";
// import { NavigationManager } from "./interfaces/navigationManager";
// import { DefaultNavigationManager } from "./plugins/navigationManager";
// import { LRS } from "./interfaces/lrsManager";
// import { LRSPlugin } from "./plugins/lrs";
// import { Endpoint } from "./models/endpoint";
// import { AuditLogManager } from "./interfaces/auditLogManager";
// import { SyslogAuditLogManager } from "./plugins/syslogAuditLogManager";
// import { Severity, LogCategory } from "./utils/constants";
// import { ConsoleAuditLogManager } from "./plugins/ConsoleAuditLogManager";
// import { DefaultArchiveManager } from "./plugins/archiveManager";
// import { ArchiveManager } from "./interfaces/archiveManager";

// if (process.argv.length < 3) {
//   console.error("command should include a path to the server configuration json", process.argv);
//   console.error("node <pathToScript> <pathToConfigurationJson>");
//   process.exit(3);
// }
// let config: { [key: string]: any };
// try {
//   config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
//   if (!config.migrationLrsUrl || config.migrationLrsUrl.length === 0 || !config.migrationLrsHeaders) {
//     console.error("migration config missing");
//     process.exit(2);
//   }
// } catch (e) {
//   console.error("Invalid config file", e);
//   process.exit(2);
// }

// let alm: AuditLogManager;
// if (config["usingSyslogFormat"]) {
//   alm = new SyslogAuditLogManager(config);
// } else {
//   alm = new ConsoleAuditLogManager(config);
// }

// process.on('uncaughtException', (err) => {
//   auditLogger.report(LogCategory.SYSTEM, Severity.EMERGENCY, "uncaughtException", err.stack);
//   auditLogger.flush();
//   process.exit(1);
// });

// export const auditLogger: AuditLogManager = alm;

// let validRedirectDomainLookup: { [key: string]: boolean } = {};
// for (let validDomain of config.validRedirectDomains) {
//   validRedirectDomainLookup[validDomain] = true;
// }
// config.validRedirectDomainLookup = validRedirectDomainLookup;


// const redisClient = redis.createClient({
//   password: config.redisAuth
// });

// const pluginManager: PluginManager = new DefaultPluginManager();
// const redisCache: SessionDataManager = new RedisSessionDataCache(redisClient);
// const archiveManager: ArchiveManager = new DefaultArchiveManager(redisCache, config);
// const notificationManager: NotificationManager = new DefaultNotificationManager(redisCache);
// const userManager: UserManager = new DefaultUserManager(redisCache);
// const groupManager: GroupManager = new DefaultGroupManager(redisCache, userManager);
// const roleManager: RoleManager = new DefaultRoleManager(redisCache, userManager);
// const activityManager: ActivityManager = new DefaultActivityManager(redisCache);
// const annotationManager: AnnotationManager = new DefaultAnnotationManager(redisCache);
// const eventManager: EventManager = new DefaultEventManager(redisCache);
// const assetManager: AssetManager = new DefaultAssetManager(redisCache);
// const competencyManager: CompetencyManager = new DefaultCompetencyManager(redisCache);
// const membershipManager: MembershipManager = new DefaultMembershipManager(redisCache);
// const messageManager: MessageManager = new DefaultMessageManager(redisCache);
// const moduleEventsManager: ModuleEventsManager = new DefaultModuleEventsManager(redisCache);
// const threadManager: ThreadManager = new DefaultThreadManager(redisCache, groupManager, notificationManager);
// const referenceManager: ReferenceManager = new DefaultReferenceManager(redisCache, notificationManager);
// const actionManager: ActionManager = new DefaultActionManager(redisCache);
// const quizManager: QuizManager = new DefaultQuizManager(redisCache);
// const sessionManager: SessionManager = new DefaultSessionManager(redisCache);
// const navigationManager: NavigationManager = new DefaultNavigationManager(redisCache);

// let e;
// try {
//   let url = new URL(config.lrsUrl);
//   e = new Endpoint({
//     host: url.host,
//     path: url.pathname,
//     headers: config.lrsHeaders
//   });
// } catch (e) {
//   auditLogger.report(LogCategory.SYSTEM, Severity.EMERGENCY, "Invalid LRS address", config.lrsUrl, e.stack);
//   auditLogger.flush();
//   process.exit(1);
// }
// const lrsManager: LRS = new LRSPlugin(e);

// pluginManager.register(groupManager);
// pluginManager.register(roleManager);
// pluginManager.register(userManager);
// pluginManager.register(activityManager);
// pluginManager.register(annotationManager);
// pluginManager.register(eventManager);
// pluginManager.register(assetManager);
// pluginManager.register(competencyManager);
// pluginManager.register(membershipManager);
// pluginManager.register(messageManager);
// pluginManager.register(moduleEventsManager);
// pluginManager.register(notificationManager);
// pluginManager.register(threadManager);
// pluginManager.register(referenceManager);
// pluginManager.register(actionManager);
// pluginManager.register(quizManager);
// pluginManager.register(sessionManager);
// pluginManager.register(navigationManager);

// roleManager.addRole("systemAdmin", "System Admin", Object.keys(pluginManager.getMessageTemplates()),
//   () => {
//     //     roleManager.getUsersByRole("systemAdmin",
//     //       (userIds) => {
//     //         auditLogger.debug(userIds);
//     //         let processor = (userIds: string[]) => {
//     //           let userId = userIds.pop();
//     //           if (userId) {
//     //             userManager.deleteUserRole(userId, "systemAdmin", () => {
//     //               auditLogger.debug("Removing", userId);
//     //               processor(userIds);
//     //             });
//     //           } else {
//     //             let systemAdminRoles = ["systemAdmin"];
//     //             for (let systemAdmin of config.systemAdmins) {
//     //               userManager.addUserRoles(systemAdmin, systemAdminRoles, () => { });
//     //             }
//     //           }
//     //         }
//     //         processor(userIds);
//     //       });
//   });

// const messageQueue: MessageQueueManager = new RedisMessageQueuePlugin({
//   client: redisClient,
//   options: {
//     password: config.redisAuth
//   },
//   ns: 'rsmq',
//   realtime: true
// }, pluginManager, redisCache, lrsManager, archiveManager);

// // messageQueue.initialize();

// const importLoginXapi = () => {
//   return new Promise((resolve, reject) => {
//     getData(config.migrationLrsUrl, '/api/statements/aggregate?pipeline=%5B%7B%22%24match%22%3A%20%7B%22%24or%22%3A%20%5B%7B%22statement.verb.id%22%3A%22http%3A%2F%2Fadlnet.gov%2Fexpapi%2Fverbs%2Flogged-in%22%7D%5D%7D%7D%5D',
//       config.migrationLrsHeaders,
//       function(data) {
//         try {
//           let json = JSON.parse(data);
//           for (let stmt of json) {
//             let statement = stmt.statement;
//             if (statement.object.id === "pebl://Library") {
//               statement.object.id = "https://reader.extension.peblproject.org/?";
//             }

//             let session = new Session(statement);
//             let actor = session.actor as AgentObject;
//             let account = actor.account;
//             let username = account ? account.name : undefined;

//             if (username) {
//               let payload = {
//                 identity: username,
//                 id: session.id,
//                 requestType: "saveSessions",
//                 sessions: [session]
//               }
//               let serviceMessage = new ServiceMessage(username, payload, "");
//               messageQueue.enqueueIncomingMessage(serviceMessage, function(success: boolean) { });
//             }
//           }
//           resolve(true);
//         } catch (e) {
//           reject(e);
//         }
//       },
//       function(error) {
//         reject(error);
//       })
//   })
// }

// const importInteractedXapi = () => {
//   return new Promise((resolve, reject) => {
//     getData(config.migrationLrsUrl, '/api/statements/aggregate?pipeline=%5B%7B%22%24match%22%3A%20%7B%22%24or%22%3A%20%5B%7B%22statement.verb.id%22%3A%22http%3A%2F%2Fadlnet.gov%2Fexpapi%2Fverbs%2Finteracted%22%7D%5D%7D%7D%5D',
//       config.migrationLrsHeaders,
//       function(data) {
//         try {
//           let json = JSON.parse(data);
//           for (let stmt of json) {
//             let statement = stmt.statement;
//             if (statement.object.id === "pebl://Library") {
//               statement.object.id = "https://reader.extension.peblproject.org/?";
//               statement.context.contextActivities.parent = [{
//                 "objectType": "Activity",
//                 "id": "https://reader.extension.peblproject.org/?"
//               }];
//             }

//             let action = new Action(statement);
//             let actor = action.actor as AgentObject;
//             let account = actor.account;
//             let username = account ? account.name : undefined;

//             if (username) {
//               let payload = {
//                 identity: username,
//                 id: action.id,
//                 requestType: "saveActions",
//                 actions: [action]
//               }
//               let serviceMessage = new ServiceMessage(username, payload, "");
//               messageQueue.enqueueIncomingMessage(serviceMessage, function(success: boolean) { });
//             }
//           }
//           resolve(true);
//         } catch (e) {
//           reject(e);
//         }
//       },
//       function(error) {
//         reject(error);
//       })
//   });
// }

// const importTerminatedXapi = () => {
//   return new Promise((resolve, reject) => {
//     getData(config.migrationLrsUrl, '/api/statements/aggregate?pipeline=%5B%7B%22%24match%22%3A%20%7B%22%24or%22%3A%20%5B%7B%22statement.verb.id%22%3A%22http%3A%2F%2Fadlnet.gov%2Fexpapi%2Fverbs%2Fterminated%22%7D%5D%7D%7D%5D',
//       config.migrationLrsHeaders,
//       function(data) {
//         try {
//           let json = JSON.parse(data);
//           for (let stmt of json) {
//             let statement = stmt.statement;
//             if (statement.object.id === "pebl://Library") {
//               statement.object.id = "https://reader.extension.peblproject.org/?";
//               statement.context.contextActivities.parent = [{
//                 "objectType": "Activity",
//                 "id": "https://reader.extension.peblproject.org/?"
//               }];
//             } else {
//               statement.object.id = statement.object.id.replace("pebl://", "https://reader.extension.peblproject.org/?epub=epub_content%2Fbookshelf%2F");

//               statement.context.contextActivities.parent = [{
//                 "objectType": "Activity",
//                 "id": statement.object.id
//               }];

//               if (!statement.object.definition.extensions)
//                 statement.object.definition.extensions = {};

//               statement.object.definition.extensions["https://www.peblproject.com/definitions.html#bookId"] = statement.object.id.replace("https://reader.extension.peblproject.org/?epub=epub_content%2Fbookshelf%2F", "");
//               statement.object.definition.extensions["https://www.peblproject.com/definitions.html#bookTitle"] = statement.object.id.replace("https://reader.extension.peblproject.org/?epub=epub_content%2Fbookshelf%2F", "");
//             }

//             let session = new Session(statement);
//             let actor = session.actor as AgentObject;
//             let account = actor.account;
//             let username = account ? account.name : undefined;

//             if (username) {
//               let payload = {
//                 identity: username,
//                 id: session.id,
//                 requestType: "saveSessions",
//                 sessions: [session]
//               }
//               let serviceMessage = new ServiceMessage(username, payload, "");
//               messageQueue.enqueueIncomingMessage(serviceMessage, function(success: boolean) { });
//             }
//           }
//           resolve(true);
//         } catch (e) {
//           reject(e);
//         }
//       },
//       function(error) {
//         reject(error);
//       })
//   })
// }

// const importLaunchedXapi = () => {
//   return new Promise((resolve, reject) => {
//     getData(config.migrationLrsUrl, '/api/statements/aggregate?pipeline=%5B%7B%22%24match%22%3A%20%7B%22%24or%22%3A%20%5B%7B%22statement.verb.id%22%3A%22http%3A%2F%2Fwww.peblproject.com%2Fdefinitions.html%23launched%22%7D%5D%7D%7D%5D',
//       config.migrationLrsHeaders,
//       function(data) {
//         try {
//           let json = JSON.parse(data);
//           for (let stmt of json) {
//             let statement = stmt.statement;
//             if (statement.object.id === "pebl://Library") {
//               statement.object.id = "https://reader.extension.peblproject.org/?";
//               statement.context.contextActivities.parent = [{
//                 "objectType": "Activity",
//                 "id": "https://reader.extension.peblproject.org/?"
//               }];
//             } else {
//               statement.object.id = statement.object.id.replace("pebl://", "https://reader.extension.peblproject.org/?epub=epub_content%2Fbookshelf%2F");

//               statement.context.contextActivities.parent = [{
//                 "objectType": "Activity",
//                 "id": statement.object.id
//               }];

//               if (!statement.object.definition.extensions)
//                 statement.object.definition.extensions = {};

//               statement.object.definition.extensions["https://www.peblproject.com/definitions.html#bookId"] = statement.object.id.replace("https://reader.extension.peblproject.org/?epub=epub_content%2Fbookshelf%2F", "");
//               statement.object.definition.extensions["https://www.peblproject.com/definitions.html#bookTitle"] = statement.object.id.replace("https://reader.extension.peblproject.org/?epub=epub_content%2Fbookshelf%2F", "");
//             }

//             let session = new Session(statement);
//             let actor = session.actor as AgentObject;
//             let account = actor.account;
//             let username = account ? account.name : undefined;

//             if (username) {
//               let payload = {
//                 identity: username,
//                 id: session.id,
//                 requestType: "saveSessions",
//                 sessions: [session]
//               }
//               let serviceMessage = new ServiceMessage(username, payload, "");
//               messageQueue.enqueueIncomingMessage(serviceMessage, function(success: boolean) { });
//             }
//           }
//           resolve(true);
//         } catch (e) {
//           reject(e);
//         }
//       },
//       function(error) {
//         reject(error);
//       })
//   });
// }

// //Import and translate submitted statements
// const importSubmittedXapi = () => {
//   return new Promise((resolve, reject) => {
//     getData(config.migrationLrsUrl, '/api/statements/aggregate?pipeline=%5B%7B%22%24match%22%3A%20%7B%22%24or%22%3A%20%5B%7B%22statement.verb.id%22%3A%22http%3A%2F%2Fwww.peblproject.com%2Fdefinitions.html%23submitted%22%7D%5D%7D%7D%5D',
//       config.migrationLrsHeaders,
//       function(data) {
//         try {
//           let json = JSON.parse(data);
//           for (let stmt of json) {
//             let statement = stmt.statement;
//             if (statement.object.id.includes("pebl://")) {
//               let bookId = statement.object.id.replace("pebl://", "");
//               statement.object.id = "http://www.peblproject.com/activities/email-submit";
//               statement.object.definition.type = "http://www.peblproject.com/activities/email-submit";
//               statement.object.definition.extensions["https://www.peblproject.com/definitions.html#bookId"] = bookId;
//               statement.object.definition.extensions["https://www.peblproject.com/definitions.html#bookTitle"] = bookId;

//               statement.context.contextActivities.parent = [{
//                 "objectType": "Activity",
//                 "id": "https://reader.extension.peblproject.org/?epub=epub_content%2Fbookshelf%2F" + bookId
//               }];

//               let action = new Action(statement);
//               let actor = action.actor as AgentObject;
//               let account = actor.account;
//               let username = account ? account.name : undefined;

//               if (username) {
//                 let payload = {
//                   identity: username,
//                   id: action.id,
//                   requestType: "saveActions",
//                   actions: [action]
//                 }
//                 let serviceMessage = new ServiceMessage(username, payload, "");
//                 messageQueue.enqueueIncomingMessage(serviceMessage, function(success: boolean) { });
//               }
//             }
//           }
//           resolve(true);
//         } catch (e) {
//           reject(e);
//         }
//       },
//       function(error) {
//         reject(error);
//       })
//   })
// }

// //Import and translate pulled external resources
// const importExternalResourcesXapi = () => {
//   return new Promise((resolve, reject) => {
//     getData(config.migrationLrsUrl, '/api/statements/aggregate?pipeline=%5B%7B%22%24match%22%3A%20%7B%22%24or%22%3A%20%5B%7B%22statement.verb.id%22%3A%22http%3A%2F%2Fwww.peblproject.com%2Fdefinitions.html%23pulled%22%7D%5D%7D%7D%5D',
//       config.migrationLrsHeaders,
//       function(data) {
//         try {
//           let json = JSON.parse(data);
//           for (let stmt of json) {
//             let statement = stmt.statement;
//             if (statement.object.id.includes("peblThread://user-")) {
//               let username = statement.object.id.replace("peblThread://user-", "");
//               let bookId = statement.object.definition.extensions["https://www.peblproject.com/definitions.html#book"];
//               statement.object.id = "http://www.peblproject.com/activities/external-resources";
//               statement.object.definition.type = "http://www.peblproject.com/activities/external-resources";
//               statement.object.definition.extensions["https://www.peblproject.com/definitions.html#target"] = username;
//               statement.object.definition.extensions["https://www.peblproject.com/definitions.html#bookId"] = bookId;
//               statement.object.definition.extensions["https://www.peblproject.com/definitions.html#bookTitle"] = bookId;

//               statement.context.contextActivities.parent = [{
//                 "objectType": "Activity",
//                 "id": "https://reader.extension.peblproject.org/?epub=epub_content%2Fbookshelf%2F" + bookId
//               }];

//               let reference = new Reference(statement);
//               let payload = {
//                 identity: username,
//                 id: reference.id,
//                 requestType: "saveReferences",
//                 references: [reference]
//               }
//               let serviceMessage = new ServiceMessage(username, payload, "");
//               messageQueue.enqueueIncomingMessage(serviceMessage, function(success: boolean) { });
//             }
//           }
//           resolve(true);
//         } catch (e) {
//           reject(e);
//         }
//       },
//       function(error) {
//         reject(error);
//       })
//   })
// }


// //Import and translate discussions and data-entries
// const importMessagesXapi = () => {
//   return new Promise((resolve, reject) => {
//     getData(config.migrationLrsUrl, '/api/statements/aggregate?pipeline=%5B%7B%22%24match%22%3A%7B%22%24or%22%3A%5B%7B%22statement.verb.id%22%3A%22http%3A%2F%2Fadlnet.gov%2Fexpapi%2Fverbs%2Fresponded%22%7D%5D%7D%7D%5D',
//       config.migrationLrsHeaders,
//       function(data: any) {
//         try {
//           let json = JSON.parse(data);
//           for (let stmt of json) {
//             let statement = stmt.statement;
//             if (statement.object.id.includes("peblThread://")) {
//               if (!statement.result) {
//                 statement.result = {
//                   response: statement.object.definition.description['en-US'],
//                   completion: true
//                 }

//                 delete statement.object.definition.description;
//               }

//               if (statement.object.definition.name['en-US'] === "DataEntry") {
//                 statement.object.id = statement.object.id.replace("peblThread://", "http://www.peblproject.com/activities/data-entry?id=");
//                 statement.object.definition.type = "http://www.peblproject.com/activities/data-entry";
//                 if (!statement.result.extensions) {

//                   let subResponses = JSON.parse(statement.result.response).map(function(resp: { [key: string]: any }) {
//                     return {
//                       prompt: resp.prompt,
//                       response: resp.text
//                     }
//                   });

//                   statement.result.extensions = {
//                     "https://www.peblproject.com/definitions.html#subResponses": subResponses
//                   };

//                   if (!statement.object.definition.extensions)
//                     statement.object.definition.extensions = {};
//                   statement.object.definition.extensions["https://www.peblproject.com/definitions.html#thread"] = statement.object.id.replace("http://www.peblproject.com/activities/data-entry?id=", "");
//                 }
//               } else {
//                 statement.object.id = statement.object.id.replace("peblThread://", "http://www.peblproject.com/activities/discussion?id=");
//                 statement.object.definition.type = "http://www.peblproject.com/activities/discussion";

//                 if (!statement.object.definition.extensions)
//                   statement.object.definition.extensions = {};
//                 statement.object.definition.extensions["https://www.peblproject.com/definitions.html#thread"] = statement.object.id.replace("http://www.peblproject.com/activities/discussion?id=", "");
//               }



//               let message = new Message(statement);
//               if (AgentObject.is(message.actor)) {
//                 let actor = message.actor as AgentObject;
//                 let account = actor.account;
//                 let username = account ? account.name : undefined;

//                 if (username) {
//                   let payload = {
//                     identity: username,
//                     id: message.id,
//                     requestType: "saveThreadedMessage",
//                     message: message
//                   }
//                   let serviceMessage = new ServiceMessage(username, payload, "");
//                   messageQueue.enqueueIncomingMessage(serviceMessage, function(success: boolean) { });
//                 }
//               }
//             }
//           }
//           resolve(true);
//         } catch (e) {
//           reject(e);
//         }
//       }, function(error) {
//         reject(error);
//       })
//   });
// }

// importExternalResourcesXapi()
//   .then(value => {
//     console.log("Resources migrated successfully");
//     return importMessagesXapi();
//   }, error => {
//     console.error("Error migrating resources");
//     console.error(error);
//     process.exit(1);
//   })
//   .then(value => {
//     console.log("Messages migrated successfully");
//     return importSubmittedXapi();
//   }, error => {
//     console.error("Error migrating messages");
//     console.error(error);
//     process.exit(1);
//   })
//   .then(value => {
//     console.log("Submitted statements migrated successfully");
//     return importLaunchedXapi();
//   }, error => {
//     console.error("Error migrating submitted statements");
//     console.error(error);
//     process.exit(1);
//   })
//   .then(value => {
//     console.log("Launched statements migrated successfully");
//     return importTerminatedXapi();
//   }, error => {
//     console.error("Error migrating launched statements");
//     console.error(error);
//     process.exit(1);
//   })
//   .then(value => {
//     console.log("Terminated statements migrated successfully");
//     return importInteractedXapi();
//   }, error => {
//     console.error("Error migrating terminated statements");
//     console.error(error);
//     process.exit(1);
//   })
//   .then(value => {
//     console.log("Interacted statements migrated successfully");
//     return importLoginXapi();
//   }, error => {
//     console.error("Error migrating interacted statements");
//     console.error(error);
//     process.exit(1);
//   })
//   .then(value => {
//     console.log("Logged-in statements migrated successfully");
//     process.exit();
//   }, error => {
//     console.error("error migrating Logged-in statements");
//     console.error(error);
//     process.exit(1);
//   })
