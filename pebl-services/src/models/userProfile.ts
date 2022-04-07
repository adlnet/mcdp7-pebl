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

export class UserProfile {
  readonly identity: string;
  readonly name: string;
  readonly homePage: string;
  readonly preferredName: string;
  readonly metadata?: { [key: string]: any };
  readonly currentTeam?: string | null;
  readonly currentClass?: string | null;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly avatar?: string;
  readonly email?: string;
  readonly phoneNumber?: string;
  readonly streetAddress?: string;
  readonly city?: string;
  readonly state?: string;
  readonly zipCode?: string;
  readonly country?: string;

  constructor(raw: { [key: string]: any }) {
    this.identity = raw.identity;
    this.name = raw.name;
    this.homePage = raw.homePage;
    this.preferredName = raw.preferredName;
    if (raw.currentTeam)
      this.currentTeam = raw.currentTeam;
    if (raw.currentClass)
      this.currentClass = raw.currentClass;

    this.metadata = raw.metadata;

    if (this.homePage == null)
      this.homePage = "acct:keycloak-server";

    if (raw.firstName)
      this.firstName = raw.firstName;
    if (raw.lastName)
      this.lastName = raw.lastName;
    if (raw.avatar)
      this.avatar = raw.avatar;
    if (raw.email)
      this.email = raw.email;
    if (raw.phoneNumber)
      this.phoneNumber = raw.phoneNumber;
    if (raw.streetAddress)
      this.streetAddress = raw.streetAddress;
    if (raw.city)
      this.city = raw.city;
    if (raw.state)
      this.state = raw.state;
    if (raw.zipCode)
      this.zipCode = raw.zipCode;
    if (raw.country)
      this.country = raw.country;
  }

  toObject(): { [key: string]: any } {
    let urls: { [key: string]: any } = {};
    let obj = {
      "identity": this.identity,
      "name": this.name,
      "homePage": this.homePage,
      "preferredName": this.preferredName,
      "lrsUrls": urls,
      "metadata": {},
      "currentTeam": this.currentTeam,
      "currentClass": this.currentClass,
      "firstName": this.firstName,
      "lastName": this.lastName,
      "avatar": this.avatar,
      "email": this.email,
      "phoneNumber": this.phoneNumber,
      "streetAddress": this.streetAddress,
      "city": this.city,
      "state": this.state,
      "zipCode": this.zipCode,
      "country": this.country
    };
    if (this.metadata)
      obj.metadata = this.metadata;

    return obj;
  }
}
