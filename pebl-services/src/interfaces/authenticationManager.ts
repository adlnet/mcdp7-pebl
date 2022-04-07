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

import { Request, Response } from 'express';

export interface AuthenticationManager {
  validate(token: string, req: Request, res: Response): void;
  refresh(session: Express.Session): Promise<boolean>;
  login(req: Request, session: Express.Session, res: Response): void;
  logout(req: Request, session: Express.Session, res: Response): void;
  getProfile(session: Express.Session): Promise<{ [key: string]: any } | null>;
  redirect(req: Request, session: Express.Session, res: Response): void;

  isLoggedIn(session: Express.Session): Promise<boolean>;

  // isRefreshTokenExpired(session: Express.Session): boolean;
  // isAccessTokenExpired(session: Express.Session): boolean
}
