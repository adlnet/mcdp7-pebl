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

export class Group {
  name?: string;
  description?: string;
  avatar?: string;

  constructor(name?: string, description?: string, avatar?: string) {
    this.name = name;
    this.description = description;
    this.avatar = avatar;
  }

  toString(): string {
    return JSON.stringify({
      name: this.name,
      description: this.description,
      avatar: this.avatar
    })
  }

  static convert(data: string): Group {
    let payload = JSON.parse(data);
    return new Group(payload.name,
      payload.description,
      payload.avatar);
  }
}
