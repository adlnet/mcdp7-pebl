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

export const NAMESPACE_USER_MESSAGES = "user-";
export const PREFIX_PEBL_THREAD = "peblThread://";
export const PREFIX_PEBL = "pebl://";
export const PREFIX_PEBL_EXTENSION = "https://www.peblproject.com/definitions.html#";

// export const USER_PREFIX = "user-";
// export const GROUP_PREFIX = "group-";
// export const PEBL_THREAD_USER_PREFIX = "peblThread://" + USER_PREFIX;
// export const PEBL_THREAD_GROUP_PREFIX = "peblThread://" + GROUP_PREFIX;

// const competenciesKey = 'competencies';

export const SET_ALL_ARCHIVE_USERS = "archived:users";
export const DB_VERSION = "db:version";

export const SET_ALL_SHARED_ANNOTATIONS = "sharedAnnotations:all";
export const SET_ALL_PEBL_CONFIG = "settings:PeBL";
export const SET_ALL_NOTIFICATIONS = "notifications:all";
export const SET_ALL_NOTIFICATIONS_REFS = "notifications:all:refs";
export const SET_ALL_GROUPS = "groups:all";
export const SET_ALL_ROLES = "roles:all";
export const SET_ALL_USERS = "users:all";
export const SET_ALL_USER_ROLES = "userRoles:all"
export const SET_ALL_USERS_LAST_MODIFIED_PERMISSIONS = "users:lastModified:permissions";
export const SET_ALL_USERS_LAST_ACTIVITY = "users:lastActivitySet";
export const SET_ALL_ACTIVE_JOBS = "activeJobs:all";
export const SET_ALL_JOBS = "jobs:all";

export const METADATA_NOTIFICATIONS = "notifications";

export const KEY_METADATA = 'metadata';
export const KEY_ANNOTATIONS = 'annotations';
export const KEY_SHARED_ANNOTATIONS = 'sharedAnnotations';
export const KEY_EVENTS = 'events';
export const KEY_MESSAGES = 'messages';
export const KEY_CLEARED_NOTIFICATIONS = 'clearedNotifications';
export const KEY_CLEARED_TIMESTAMPS = "clearedTimestamps";
export const KEY_ACTIVITIES = 'activities';
export const KEY_ACTIVITY_EVENTS = 'activityEvents';
export const KEY_ASSETS = 'assets';
export const KEY_MEMBERSHIP = 'memberships';
export const KEY_MODULE_EVENTS = 'moduleEvents';
export const KEY_REFERENCES = 'references';
export const KEY_ACTIONS = 'actions';
export const KEY_SESSIONS = 'sessions';
export const KEY_ROLES = 'roles';
export const KEY_GROUPS = 'groups';
export const KEY_USERS = 'users';
export const KEY_NAVIGATIONS = 'navigations';
export const KEY_QUIZES = "quizes";
export const KEY_QUESTIONS = "questions";
export const KEY_CACHED_QUERIES = 'cachedQueries';

export const LRS_SYNC_TIMEOUT = 1500;
// export const LRS_SYNC_TIMEOUT = 300000;
export const ARCHIVE_USER_TIMEOUT = 60000;
export const QUEUE_CLEANUP_TIMEOUT = 3600000;
export const UPGRADE_REDIS_TIMEOUT = 240000;
export const JOB_BUFFER_TIMEOUT = 60000;
export const INACTIVE_USER_THRESHOLD = 7200000;

export const LRS_SYNC_LIMIT = 75;

export const JOB_TYPE_UPGRADE = "serverUpgrade";

export const QUEUE_REALTIME_BROADCAST_PREFIX = "realtime:userid:";
export const QUEUE_OUTGOING_MESSAGE_PREFIX = 'rsmq:rt:';
export const QUEUE_JOBS = 'rsmq:rt:jobs';
export const QUEUE_INCOMING_MESSAGE = 'rsmq:rt:incomingMessages';
export const QUEUE_ACTIVE_JOBS = 'activeJobs';
export const QUEUE_ALL_USERS = "allUsers";

export const MESSAGE_QUEUE_JOBS = 'jobs';
export const MESSAGE_QUEUE_INCOMING_MESSAGES = 'incomingMessages';

export const TIMESTAMP_SHARED_ANNOTATIONS = 'timestamp:sharedAnnotations';

export const TIMESTAMP_CACHED_QUERIES = 'timestamp:cachedQueries';

// Store ids

export function generateUserAnnotationsKey(identity: string) {
  return 'user:' + identity + ':' + KEY_ANNOTATIONS;
}

export function generateUserSharedAnnotationsKey(identity: string) {
  return 'user:' + identity + ':' + KEY_SHARED_ANNOTATIONS;
}

export function generateGroupSharedAnnotationsKey(groupId: string) {
  return 'group:' + groupId + ':' + KEY_SHARED_ANNOTATIONS;
}

export function generateGroupSharedAnnotationsTimestamps(groupId: string) {
  return 'group:' + groupId + ':' + TIMESTAMP_SHARED_ANNOTATIONS;
}

export function generateUserEventsKey(identity: string): string {
  return 'user:' + identity + ':' + KEY_EVENTS;
}

export function generateUserMessagesKey(identity: string): string {
  return 'user:' + identity + ':' + KEY_MESSAGES;
}

export function generateUserClearedNotificationsKey(identity: string): string {
  return 'user:' + identity + ':' + KEY_CLEARED_NOTIFICATIONS;
}

export function generateUserClearedTimestamps(identity: string): string {
  return 'user:' + identity + ':' + KEY_CLEARED_TIMESTAMPS;
}

export function generateUserActivitiesKey(identity: string): string {
  return 'user:' + identity + ':' + KEY_ACTIVITIES;
}

export function generateUserActivityEventsKey(identity: string): string {
  return 'user:' + identity + ':' + KEY_ACTIVITY_EVENTS;
}

export function generateUserModuleEventsKey(identity: string): string {
  return 'user:' + identity + ':' + KEY_MODULE_EVENTS;
}

export function generateUserAssetKey(identity: string): string {
  return 'user:' + identity + ':' + KEY_ASSETS;
}

export function generateUserMembershipKey(identity: string): string {
  return 'user:' + identity + ':' + KEY_MEMBERSHIP;
}

export function generateUserReferencesKey(identity: string): string {
  return 'user:' + identity + ':' + KEY_REFERENCES;
}

export function generateUserActionsKey(identity: string): string {
  return 'user:' + identity + ':' + KEY_ACTIONS;
}

export function generateUserSessionsKey(identity: string): string {
  return 'user:' + identity + ':' + KEY_SESSIONS;
}

export function generateUserToGroupMembershipKey(identity: string): string {
  return 'user:' + identity + ':' + KEY_GROUPS;
}

export function generateUserToRolesKey(identity: string): string {
  return 'user:' + identity + ':' + KEY_ROLES;
}

export function generateRoleToUsersKey(roleId: string): string {
  return 'role:' + roleId + ':' + KEY_USERS;
}

export function generateUserNavigationsKey(identity: string): string {
  return 'user:' + identity + ':' + KEY_NAVIGATIONS;
}

export function generateUserQuizesKey(identity: string): string {
  return 'user:' + identity + ':' + KEY_QUIZES;
}

export function generateUserQuestionsKey(identity: string): string {
  return 'user:' + identity + ':' + KEY_QUESTIONS;
}

//groups
export function generateGroupToUserMembersKey(groupId: string): string {
  return 'group:' + groupId + ':user:membership';
}

export function generateGroupToGroupMembersKey(groupId: string): string {
  return 'group:' + groupId + ':group:membership';
}

export function generateGroupToGroupMembershipKey(groupId: string): string {
  return 'group:' + groupId + ':' + KEY_GROUPS;
}

// Type ids

export function generateAnnotationsKey(id: string): string {
  return 'annotation:' + id;
}

export function generateSharedAnnotationsKey(id: string): string {
  return 'sharedAnnotation:' + id;
}

export function generateEventsKey(id: string): string {
  return 'event:' + id;
}

export function generateMessagesKey(id: string): string {
  return 'message:' + id;
}

export function generateNotificationsKey(id: string): string {
  return 'notification:' + id;
}

export function generateActivitiesKey(id: string): string {
  return 'activity:' + id;
}

export function generateActivityEventsKey(id: string): string {
  return 'activityEvent:' + id;
}

export function generateModuleEventsKey(id: string): string {
  return 'moduleEvent:' + id;
}

export function generateAssetsKey(id: string): string {
  return 'asset:' + id;
}

export function generateMembershipsKey(id: string): string {
  return 'membership:' + id;
}

export function generateReferencesKey(id: string): string {
  return 'reference:' + id;
}

export function generateActionsKey(id: string): string {
  return 'action:' + id;
}

export function generateSessionsKey(id: string): string {
  return 'session:' + id;
}

export function generateNavigationsKey(id: string): string {
  return 'navigation:' + id;
}

export function generateQuizesKey(id: string): string {
  return 'quiz:' + id;
}

export function generateQuestionsKey(id: string): string {
  return 'question:' + id;
}

export function generateCachedQueryKey(query: string): string {
  return 'cachedQueries:' + query;
}

export function generateBroadcastQueueForUserId(id: string): string {
  return QUEUE_REALTIME_BROADCAST_PREFIX + id;
}

export function generateOutgoingQueueForId(id: string): string {
  return QUEUE_OUTGOING_MESSAGE_PREFIX + id;
}

export function generateTimestampForUserId(id: string): string {
  return 'timestamp:messages:user:' + id;
}

export function generateTimestampForThread(thread: string): string {
  return 'timestamp:threads:' + thread;
}

export function generateThreadKey(thread: string): string {
  return 'threads:' + thread;
}

export function generateUserThreadsKey(id: string): string {
  return 'user:' + id + ':threads';
}

export function generateUserPrivateThreadsKey(id: string): string {
  return 'user:' + id + ':privateThreads';
}

export function generateUserGroupThreadsKey(id: string, groupId: string): string {
  return 'user:' + id + ':groupThreads:' + groupId;
}

export function generateSubscribedUsersKey(thread: string): string {
  return 'users:thread:' + thread;
}

export function generateSubscribedSharedAnnotationsUsersKey(groupId: string): string {
  return 'users:sharedAnnotations:' + groupId;
}

export function generateTimestampForAnnotations(id: string): string {
  return 'timestamp:annotations:' + id;
}

export function generateTimestampForReference(id: string): string {
  return 'timestamp:references:' + id;
}

export function generateTimestampForNotification(id: string): string {
  return 'timestamp:notifications:' + id;
}

export function generateTimestampCachedQueryKey(query: string): string {
  return 'timestamp:cachedQueries:' + query;
}


export enum Severity {
  EMERGENCY = 0, // system isn't working
  ALERT = 1, // system needs attention
  CRITICAL = 2, // code path has failed
  ERROR = 3, // code path has failed, but can recover
  WARNING = 4, // unusual conditions
  NOTICE = 5, // normal but unlikely
  INFO = 6, // normal
  DEBUG = 7 // extra information
}

export const SeverityToReadable = [
  "emergency",
  "alert",
  "critical",
  "error",
  "warning",
  "notice",
  "info",
  "debug"
];

export const severityEnums: Severity[] = [
  Severity.EMERGENCY,
  Severity.ALERT,
  Severity.CRITICAL,
  Severity.ERROR,
  Severity.WARNING,
  Severity.NOTICE,
  Severity.INFO,
  Severity.DEBUG
];

export enum LogCategory {
  SYSTEM = "sys",
  AUTH = "auth",
  MESSAGE = "msg",
  FILE_SYSTEM = "fs",
  NETWORK = "net",
  STORAGE = "stor",
  PLUGIN = "plug"
}

export const logCategoriesEnums: LogCategory[] = [
  LogCategory.SYSTEM,
  LogCategory.AUTH,
  LogCategory.MESSAGE,
  LogCategory.FILE_SYSTEM,
  LogCategory.NETWORK,
  LogCategory.STORAGE,
  LogCategory.PLUGIN
];
