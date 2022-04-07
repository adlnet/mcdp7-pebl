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

import { PREFIX_PEBL_THREAD } from "../utils/constants";
class Verb {
  id: string;
  display: { [key: string]: string };

  constructor(raw: { [key: string]: any }) {
    this.id = raw.id;
    this.display = raw.display;
  }

  static is(x: any): boolean {
    if (!x)
      return false;
    if (typeof x.id !== "string")
      return false;

    if (typeof x.display !== 'object' || x.display === null)
      return false;

    for (let string in x.display) {
      if (typeof x.display[string] !== "string")
        return false;
    }

    return true;
  }
}

export class AgentObject {
  objectType: string;
  name?: string;
  mbox?: string;
  mbox_sha1sum?: string;
  openid?: string;
  account?: {
    homePage: string,
    name: string
  }

  constructor(raw: { [key: string]: any }) {
    this.objectType = "Agent";
    this.name = raw.name;
    this.mbox = raw.mbox;
    this.mbox_sha1sum = raw.mbox_sha1sum;
    this.openid = raw.openid;
    this.account = raw.account;
  }

  // static replaceInvalidJson(x: AgentObject): AgentObject {
  //   if (x.name)
  //     x.name = replaceInvalidJson(x.name);
  //   if (x.mbox)
  //     x.mbox = replaceInvalidJson(x.mbox);
  //   if (x.mbox_sha1sum)
  //     x.mbox_sha1sum = replaceInvalidJson(x.mbox_sha1sum);
  //   if (x.openid)
  //     x.openid = replaceInvalidJson(x.openid);
  //   if (x.account) {
  //     x.account.homePage = replaceInvalidJson(x.account.homePage);
  //     x.account.name = replaceInvalidJson(x.account.name);
  //   }
  //   return x;
  // }

  static is(x: any): boolean {
    if (!x)
      return false;

    if (typeof x.objectType !== "string" || x.objectType !== "Agent")
      return false;

    if (x.name && (typeof x.name !== "string"))
      return false;

    if (x.mbox && (typeof x.mbox !== "string"))
      return false;

    if (x.mbox_sha1sum && (typeof x.mbox_sha1sum !== "string"))
      return false;

    if (x.openid && (typeof x.openid !== "string"))
      return false;

    if (x.account) {
      if (typeof x.account !== "object")
        return false;

      if (typeof x.account.homePage !== "string")
        return false;

      if (typeof x.account.name !== "string")
        return false;
    }

    return true;
  }
}

class GroupObject {
  objectType: string;
  member: AgentObject[];
  name?: string;

  constructor(raw: { [key: string]: any }) {
    this.objectType = "Group";
    this.member = raw.member;
    this.name = raw.name;
  }

  // static replaceInvalidJson(x: GroupObject): GroupObject {
  //   for (let obj in x.member) {
  //     x.member[obj] = AgentObject.replaceInvalidJson(x.member[obj]);
  //   }

  //   if (x.name)
  //     x.name = replaceInvalidJson(x.name);

  //   return x;
  // }

  static is(x: any): boolean {
    if (!x)
      return false;

    if (typeof x.objectType !== "string" || x.objectType !== "Group")
      return false;

    if (!Array.isArray(x.member) || !x.member.every((m: any) => { return AgentObject.is(m) }))
      return false;

    if (x.name && (typeof x.name !== "string"))
      return false;

    return true;
  }
}

class StatementRefObject {
  objectType: string;
  id: string;

  constructor(raw: { [key: string]: any }) {
    this.objectType = "StatementRef";
    this.id = raw.id;
  }

  // static replaceInvalidJson(x: StatementRefObject): StatementRefObject {
  //   x.id = replaceInvalidJson(x.id);

  //   return x;
  // }

  static is(x: any): boolean {
    if (!x)
      return false;

    if (typeof x.objectType !== "string" || x.objectType !== "StatementRef")
      return false;

    if (typeof x.id !== "string")
      return false;

    return true;
  }
}

class SubStatementObject {
  objectType: string;
  "object": ActivityObject | AgentObject | GroupObject | StatementRefObject;
  actor: AgentObject | GroupObject;
  verb: Verb;
  context?: {
    registration?: string, // UUID of registration the the statement is associated with.
    instructor?: AgentObject, //Instructor that the Statement relates to, if not included as the Actor of the Statement.
    team?: GroupObject, //Team that this Statement relates to, if not included as the Actor of the Statement.
    contextActivities?: {
      parent?: ActivityObject[],
      grouping?: ActivityObject[],
      category?: ActivityObject[],
      other?: ActivityObject[]
    }
  };
  result: {
    score?: {
      scaled?: number,
      raw?: number,
      min?: number,
      max?: number
    },
    success?: boolean,
    completion?: boolean,
    response?: string,
    duration?: string,
    extensions?: { [key: string]: any }
  };
  attachments: Attachment[];

  constructor(raw: { [key: string]: any }) {
    this.objectType = "SubStatement";
    this.object = raw.object;
    this.actor = raw.actor;
    this.verb = raw.verb;
    this.result = raw.result;
    this.attachments = raw.attachments;
  }

  // static replaceInvalidJson(x: SubStatementObject): SubStatementObject {
  //   return x;
  //   //TODO
  // }

  static is(x: any): boolean {
    if (!x)
      return false;
    if (x && x.objectType && x.objectType === "SubStatement")
      return true;
    else
      return false;

    //TODO
  }
}

export class InteractionComponent {
  id: string;
  description: { [key: string]: string };

  constructor(raw: { [key: string]: any }) {
    this.id = raw.id;
    this.description = raw.description;
  }

  // static replaceInvalidJson(x: InteractionComponent): InteractionComponent {
  //   x.id = replaceInvalidJson(x.id);

  //   for (let key in x.description) {
  //     x.description[key] = replaceInvalidJson(x.description[key]);
  //   }

  //   return x;
  // }

  static is(x: any): boolean {
    if (!x)
      return false;

    if (typeof x.id !== "string")
      return false;

    if (x.description) {
      if (typeof x.description !== "object")
        return false;

      for (let key in x.description) {
        if (typeof key !== "string")
          return false;

        if (typeof x.description[key] !== "string")
          return false;
      }
    }

    return true;
  }
}

export class ActivityObject {
  objectType: string;
  id: string;
  definition?: {
    name?: { [key: string]: string },
    description?: { [key: string]: string },
    type?: string,
    moreInfo?: string,
    extensions?: { [key: string]: any },
    interactionType?: string,
    correctResponsePattern?: string[],
    choices?: InteractionComponent[],
    scale?: InteractionComponent[],
    source?: InteractionComponent[],
    target?: InteractionComponent[],
    steps?: InteractionComponent[]
  }

  constructor(raw: { [key: string]: any }) {
    this.objectType = "Activity";
    this.id = raw.id;
    this.definition = raw.definition;
  }

  // static replaceInvalidJson(x: ActivityObject): ActivityObject {
  //   x.id = replaceInvalidJson(x.id);
  //   if (x.definition) {
  //     if (x.definition.name) {
  //       for (let key in x.definition.name) {
  //         x.definition.name[key] = replaceInvalidJson(x.definition.name[key]);
  //       }
  //     }
  //     if (x.definition.description) {
  //       for (let key in x.definition.description) {
  //         x.definition.description[key] = replaceInvalidJson(x.definition.description[key]);
  //       }
  //     }
  //     if (x.definition.type)
  //       x.definition.type = replaceInvalidJson(x.definition.type);

  //     if (x.definition.moreInfo)
  //       x.definition.moreInfo = replaceInvalidJson(x.definition.moreInfo);

  //     if (x.definition.interactionType)
  //       x.definition.interactionType = replaceInvalidJson(x.definition.interactionType);

  //     if (x.definition.correctResponsePattern) {
  //       for (let pattern of x.definition.correctResponsePattern) {
  //         pattern = replaceInvalidJson(pattern);
  //       }
  //     }

  //     if (x.definition.choices) {
  //       for (let choice of x.definition.choices) {
  //         choice = InteractionComponent.replaceInvalidJson(choice);
  //       }
  //     }

  //     if (x.definition.scale) {
  //       for (let s of x.definition.scale) {
  //         s = InteractionComponent.replaceInvalidJson(s);
  //       }
  //     }

  //     if (x.definition.source) {
  //       for (let s of x.definition.source) {
  //         s = InteractionComponent.replaceInvalidJson(s);
  //       }
  //     }

  //     if (x.definition.target) {
  //       for (let t of x.definition.target) {
  //         t = InteractionComponent.replaceInvalidJson(t);
  //       }
  //     }

  //     if (x.definition.steps) {
  //       for (let step of x.definition.steps) {
  //         step = InteractionComponent.replaceInvalidJson(step);
  //       }
  //     }
  //   }

  //   return x;
  // }

  static is(x: any): boolean {
    if (!x)
      return false;

    if (typeof x.objectType !== "string" || x.objectType !== "Activity")
      return false

    if (typeof x.id !== "string")
      return false;

    if (!x.id.includes('://'))
      return false;

    if (x.definition) {
      if (typeof x.definition !== "object")
        return false;

      if (x.definition.name) {
        if (typeof x.definition.name !== "object")
          return false;

        for (let key in x.definition.name) {
          if (typeof key !== "string")
            return false;

          if (typeof x.definition.name[key] !== "string")
            return false;
        }
      }

      if (x.definition.description) {
        if (typeof x.definition.description !== "object")
          return false;

        for (let key in x.definition.description) {
          if (typeof key !== "string")
            return false;

          if (typeof x.definition.description[key] !== "string")
            return false;
        }
      }

      if (x.type && (typeof x.type !== "string"))
        return false;

      if (x.moreInfo && (typeof x.moreInfo !== "string"))
        return false;

      if (x.interactionType && (typeof x.interactionType !== "string"))
        return false;

      if (x.correctResponsePattern) {
        if (!Array.isArray(x.correctResponsePattern) || !x.correctResponsePattern.every((string: any) => { return (typeof string === "string") }))
          return false;
      }

      if (x.choices) {
        if (!Array.isArray(x.choices) || !x.choices.every((choice: any) => { return InteractionComponent.is(choice) }))
          return false;
      }

      if (x.scale) {
        if (!Array.isArray(x.scale) || !x.scale.every((s: any) => { return InteractionComponent.is(s) }))
          return false;
      }

      if (x.source) {
        if (!Array.isArray(x.source) || !x.source.every((s: any) => { return InteractionComponent.is(s) }))
          return false;
      }

      if (x.target) {
        if (!Array.isArray(x.target) || !x.target.every((t: any) => { return InteractionComponent.is(t) }))
          return false;
      }

      if (x.steps) {
        if (!Array.isArray(x.steps) || !x.steps.every((step: any) => { return InteractionComponent.is(step) }))
          return false;
      }


    }

    return true;
  }
}

class Attachment {
  usageType: string;
  display: { [key: string]: string };
  description?: { [key: string]: string };
  contentType: string;
  length: number;
  sha2: string;
  fileUrl?: string;

  constructor(raw: { [key: string]: any }) {
    this.usageType = raw.usageType;
    this.display = raw.display;
    this.description = raw.description;
    this.contentType = raw.contentType;
    this.length = raw.length;
    this.sha2 = raw.sha2;
    this.fileUrl = raw.fileUrl;
  }

  // static replaceInvalidJson(x: Attachment): Attachment {
  //   x.usageType = replaceInvalidJson(x.usageType);
  //   for (let key in x.display) {
  //     x.display[key] = replaceInvalidJson(x.display[key]);
  //   }
  //   if (x.description) {
  //     for (let key in x.description) {
  //       x.description[key] = replaceInvalidJson(x.description[key]);
  //     }
  //   }
  //   x.contentType = replaceInvalidJson(x.contentType);
  //   x.sha2 = replaceInvalidJson(x.sha2);
  //   if (x.fileUrl) {
  //     x.fileUrl = replaceInvalidJson(x.fileUrl);
  //   }

  //   return x;
  // }

  static is(x: any): boolean {
    if (!x)
      return false;

    if (typeof x.usageType !== "string")
      return false;

    if (typeof x.display !== "object" || x.display === null)
      return false;

    for (let key in x.display) {
      if (typeof x.display[key] !== "string")
        return false;
    }

    if (x.description) {
      if (typeof x.description !== "object")
        return false;

      for (let key in x.description) {
        if (typeof x.description[key] !== "string")
          return false;
      }
    }

    if (typeof x.contentType !== "string")
      return false;

    if (typeof x.length !== "number")
      return false;

    if (typeof x.sha2 !== "string")
      return false;

    if (x.fileUrl) {
      if (typeof x.fileUrl !== "string")
        return false;
    }

    return true;
  }
}

export class XApiStatement {
  identity?: string;
  id: string;
  "object": ActivityObject | AgentObject | GroupObject | StatementRefObject | SubStatementObject;
  actor: AgentObject | GroupObject;
  verb: Verb;
  context?: {
    registration?: string, // UUID of registration the the statement is associated with.
    instructor?: AgentObject, //Instructor that the Statement relates to, if not included as the Actor of the Statement.
    team?: GroupObject, //Team that this Statement relates to, if not included as the Actor of the Statement.
    contextActivities?: {
      parent?: ActivityObject[],
      grouping?: ActivityObject[],
      category?: ActivityObject[],
      other?: ActivityObject[]
    }
  };
  result?: {
    score?: {
      scaled?: number,
      raw?: number,
      min?: number,
      max?: number
    },
    success?: boolean,
    completion?: boolean,
    response?: string,
    duration?: string,
    extensions?: { [key: string]: any }
  };
  attachments?: Attachment[];
  stored: string;
  timestamp?: string;

  constructor(raw: { [key: string]: any }) {
    this.id = raw.id;
    this.actor = raw.actor;
    this.verb = raw.verb;
    this.context = raw.context;
    this.stored = raw.stored;
    this.timestamp = raw.timestamp;
    this.result = raw.result;
    this["object"] = raw.object;
    this.attachments = raw.attachments;
  }

  toXAPI(): XApiStatement {
    return new XApiStatement(this);
  }

  toVoidRecord(): Voided {
    let o = {
      "actor": this.actor,
      "verb": {
        "display": {
          "en-US": "voided"
        },
        "id": "http://adlnet.gov/expapi/verbs/voided"
      },
      "object": {
        "id": this.id,
        "objectType": "StatementRef"
      },
      "stored": new Date().toISOString(),
      "timestamp": this.timestamp,
      "id": "v-" + this.id
    };

    return new Voided(o);
  }

  getActorId(): string | string[] {
    if (AgentObject.is(this.actor)) {
      let actor = this.actor as AgentObject;
      return actor.mbox || actor.openid ||
        (actor.account && actor.account.name) || "";
    } else {
      let actor = this.actor as GroupObject;
      return actor.member.map((member) => {
        let actor = this.actor as AgentObject;
        return actor.mbox || actor.openid ||
          (actor.account && actor.account.name) || "";
      });
    }
  }

  // static replaceInvalidJson(x: XApiStatement): XApiStatement {
  //   x.id = replaceInvalidJson(x.id);
  //   if (ActivityObject.is(x.object))
  //     x.object = ActivityObject.replaceInvalidJson(<ActivityObject>x.object);
  //   else if (AgentObject.is(x.object))
  //     x.object = AgentObject.replaceInvalidJson(<AgentObject>x.object);
  //   else if (GroupObject.is(x.object))
  //     x.object = GroupObject.replaceInvalidJson(<GroupObject>x.object);
  //   else if (StatementRefObject.is(x.object))
  //     x.object = StatementRefObject.replaceInvalidJson(<StatementRefObject>x.object);
  //   else if (SubStatementObject.is(x.object))
  //     x.object = SubStatementObject.replaceInvalidJson(<SubStatementObject>x.object);

  //   if (AgentObject.is(x.actor))
  //     x.actor = AgentObject.replaceInvalidJson(<AgentObject>x.actor);
  //   else if (GroupObject.is(x.actor))
  //     x.actor = GroupObject.replaceInvalidJson(<GroupObject>x.actor);

  //   x.verb = Verb.replaceInvalidJson(x.verb);

  //   if (x.context) {
  //     if (x.context.registration)
  //       x.context.registration = replaceInvalidJson(x.context.registration);
  //     if (x.context.instructor)
  //       x.context.instructor = AgentObject.replaceInvalidJson(x.context.instructor);
  //     if (x.context.team)
  //       x.context.team = GroupObject.replaceInvalidJson(x.context.team);
  //     if (x.context.contextActivities) {
  //       if (x.context.contextActivities.parent) {
  //         for (let p of x.context.contextActivities.parent) {
  //           p = ActivityObject.replaceInvalidJson(p);
  //         }
  //       }
  //       if (x.context.contextActivities.grouping) {
  //         for (let g of x.context.contextActivities.grouping) {
  //           g = ActivityObject.replaceInvalidJson(g);
  //         }
  //       }
  //       if (x.context.contextActivities.category) {
  //         for (let c of x.context.contextActivities.category) {
  //           c = ActivityObject.replaceInvalidJson(c);
  //         }
  //       }
  //       if (x.context.contextActivities.other) {
  //         for (let o of x.context.contextActivities.other) {
  //           o = ActivityObject.replaceInvalidJson(o);
  //         }
  //       }
  //     }
  //   }

  //   if (x.result) {
  //     if (x.result.response)
  //       x.result.response = replaceInvalidJson(x.result.response);
  //     if (x.result.duration)
  //       x.result.duration = replaceInvalidJson(x.result.duration);
  //   }

  //   if (x.attachments) {
  //     for (let att of x.attachments) {
  //       att = Attachment.replaceInvalidJson(att);
  //     }
  //   }

  //   if (x.stored)
  //     x.stored = replaceInvalidJson(x.stored);

  //   if (x.timestamp)
  //     x.timestamp = replaceInvalidJson(x.timestamp);

  //   return x;
  // }

  static is(x: any): boolean {
    if (!x)
      return false;

    if (!Verb.is(x.verb))
      return false;

    if (typeof x.id !== 'string')
      return false;

    if (!ActivityObject.is(x.object) && !AgentObject.is(x.object) && !GroupObject.is(x.object) && !StatementRefObject.is(x.object) && !SubStatementObject.is(x.object))
      return false;

    if (!AgentObject.is(x.actor) && !GroupObject.is(x.actor))
      return false;

    if (x.context) {
      if (typeof x.context !== 'object')
        return false;

      if (x.context.registration) {
        if (typeof x.context.registration !== "string")
          return false;
      }

      if (x.context.instructor && !AgentObject.is(x.context.instructor))
        return false;

      if (x.context.team && !GroupObject.is(x.context.team))
        return false;

      if (x.context.contextActivities) {
        if (typeof x.context.contextActivities !== 'object')
          return false;

        if (x.context.contextActivities.parent) {
          if (!Array.isArray(x.context.contextActivities.parent))
            return false;

          if (!x.context.contextActivities.parent.every((parent: any) => { return ActivityObject.is(parent) }))
            return false;
        }

        if (x.context.contextActivities.grouping) {
          if (!Array.isArray(x.context.contextActivities.grouping))
            return false;

          if (!x.context.contextActivities.grouping.every((grouping: any) => { return ActivityObject.is(grouping) }))
            return false;
        }

        if (x.context.contextActivities.category) {
          if (!Array.isArray(x.context.contextActivities.category))
            return false;

          if (!x.context.contextActivities.category.every((category: any) => { return ActivityObject.is(category) }))
            return false;
        }

        if (x.context.contextActivities.other) {
          if (!Array.isArray(x.context.contextActivities.other))
            return false;

          if (!x.context.contextActivities.other.every((other: any) => { return ActivityObject.is(other) }))
            return false;
        }
      }
    }

    if (x.result) {
      if (typeof x.result !== 'object')
        return false;

      if (x.result.score) {
        if (typeof x.result.score !== 'object')
          return false

        if (x.result.score.scaled) {
          if (typeof x.result.score.scaled !== "number")
            return false;

          if (x < -1 || x > 1)
            return false;
        }

        if (x.result.score.raw) {
          if (typeof x.result.score.raw !== "number")
            return false;

          if (x.result.score.min && x.result.score.raw < x.result.score.min)
            return false;

          if (x.result.score.max && x.result.score.raw > x.result.score.max)
            return false;
        }

        if (x.result.score.min) {
          if (typeof x.result.score.min !== "number")
            return false;

          if (x.result.score.max && x.result.score.min > x.result.score.max)
            return false;
        }

        if (x.result.score.max) {
          if (typeof x.result.score.max !== "number")
            return false;

          if (x.result.score.min && x.result.score.max < x.result.score.min)
            return false;
        }
      }

      if (x.result.success !== undefined) {
        if (typeof x.result.success !== "boolean")
          return false;
      }

      if (x.result.completion !== undefined) {
        if (typeof x.result.completion !== "boolean")
          return false;
      }

      if (x.result.response) {
        if (typeof x.result.response !== "string")
          return false;
      }

      if (x.result.duration) {
        if (typeof x.result.duration !== "string")
          return false;
      }

      if (x.result.extensions) {
        if (typeof x.result.extensions !== "object")
          return false;

        for (let key in x.result.extensions) {
          if (typeof key !== "string")
            return false;

          if (typeof x.result.extensions[key] === "string")
            return false;
        }
      }
    }

    if (x.attachments) {
      if (!Array.isArray(x.attachments))
        return false;

      if (!x.attachments.every((attachment: any) => { return Attachment.is(attachment) }))
        return false;
    }

    if (x.stored && (typeof x.stored !== "string"))
      return false;

    if (x.timestamp && (typeof x.timestamp !== "string"))
      return false;

    return true;
  }
}

export class Voided extends XApiStatement {
  readonly thread: string;
  readonly target: string;

  constructor(raw: { [key: string]: any }) {
    super(raw);
    this.thread = (this.context && this.context.contextActivities && this.context.contextActivities.parent) ? this.context.contextActivities.parent[0].id : "";
    if (this.thread.indexOf(PREFIX_PEBL_THREAD) != -1)
      this.thread = this.thread.substring(PREFIX_PEBL_THREAD.length);

    let object = this.object as ActivityObject;
    this.target = object.id;
  }

  static is(x: XApiStatement): boolean {
    let verb = x.verb.display["en-US"];
    return (verb == "voided");
  }
}
