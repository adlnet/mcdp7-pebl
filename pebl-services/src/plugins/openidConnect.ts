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

import { AuthenticationManager } from '../interfaces/authenticationManager'

import { Request, Response } from 'express';
import { Issuer, Client, TokenSet } from "openid-client";
import { UserManager } from '../interfaces/userManager';
import { auditLogger } from '../main';
import { LogCategory, Severity } from '../utils/constants';
//import { postFormData } from '../utils/network';
let OpenIDClient = require("openid-client")

export class OpenIDConnectAuthentication implements AuthenticationManager {
  private activeClient: Client | null = null;
  private config: { [key: string]: any };
  private userManager: UserManager;
  //private apiToken: { [key: string]: any } | null = null;

  constructor(config: { [key: string]: any }, userManager: UserManager) {
    this.config = config;
    this.userManager = userManager;

    //this.setApiAccessToken();

    OpenIDClient.Issuer.discover(config.authenticationUrl)
      .then((issued: Issuer<Client>) => {
        auditLogger.report(LogCategory.AUTH, Severity.INFO, "FoundIssuerClient", config.authenticationUrl, config.authenticationClientId, config.authenticationRedirectURIs, config.authenticationResponseTypes, config.authenticationMethod)
        this.activeClient = new issued.Client({
          client_id: config.authenticationClientId,
          client_secret: config.authenticationClientSecret,
          redirect_uris: config.authenticationRedirectURIs,
          response_types: config.authenticationResponseTypes
        });
      }).catch((err: any) => {
        auditLogger.report(LogCategory.AUTH, Severity.EMERGENCY, "OpenIDDiscoveryFail", err);
        process.exit(1);
      });
  }

  validate(token: string, req: Request, res: Response): void {
    if (this.activeClient) {
      this.activeClient.introspect(token)
        .then(function(result) {
          auditLogger.report(LogCategory.AUTH, Severity.INFO, "ValidatedToken", req.ip, req.headers["origin"], result.username, result.client_id, result.exp, result.active, result.iss, result.scope);
          res.send(result).end();
        }).catch((e) => {
          auditLogger.report(LogCategory.AUTH, Severity.NOTICE, "TokenValidationFail", req.ip, req.headers["origin"], e);
          res.send(403).end();
        });
    } else {
      auditLogger.report(LogCategory.AUTH, Severity.EMERGENCY, "ValidateNoAuthClient", req.ip, req.headers["origin"], token);
      res.status(503).end();
    }
  }

  async refresh(session: Express.Session): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.activeClient) {
        if (session.activeTokens) {
          this.activeClient.refresh(session.activeTokens.refresh_token)
            .then(async (tokenSet) => {
              if (Object.keys(tokenSet).length != 0) {
                session.activeTokens = tokenSet;
                if (tokenSet.expires_at) {
                  session.accessTokenExpiration = tokenSet["expires_at"] * 1000;
                  if (tokenSet.refresh_expires_in) {
                    let refreshExpiration = (<any>tokenSet)["refresh_expires_in"] * 1000;
                    session.refreshTokenExpiration = Date.now() + refreshExpiration;
                  }
                  let profile = await this.getProfile(session);
                  if (profile) {
                    auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "RefreshedTokens", session.id, session.ip, session.identity.preferred_username);
                    await this.adjustUserPermissions(session, session.identity.preferred_username, session.activeTokens.access_token);
                    await this.userManager.setLastActivity(session.identity.preferred_username, Date.now());
                  } else {
                    auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "NoRefreshTokens", session.id, session.ip);
                  }
                  resolve(profile != null);
                } else {
                  auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "TokensDontExpire", session.id, session.ip);
                  await this.clearActiveTokens(session);
                  resolve(false);
                }
              } else {
                auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "NoTokensFound", session.id, session.ip);
                await this.clearActiveTokens(session);
                resolve(false);
              }
            }).catch(async (e) => {
              auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "RefreshTokenFail", session.id, session.ip, e);
              await this.clearActiveTokens(session);
              resolve(false);
            });
        } else {
          auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "NoRefreshTokenStored", session.id, session.ip);
          resolve(false);
        }
      } else {
        auditLogger.report(LogCategory.AUTH, Severity.EMERGENCY, "RefreshNoAuthClient", session.id, session.ip);
        resolve(false);
      }
    });
  }

  login(req: Request, session: Express.Session, res: Response): void {
    if (this.activeClient) {
      let redirectUrl = req.query.redirectUrl as string;
      if (redirectUrl) {
        try {
          let hostname = new URL(redirectUrl).hostname;
          if (this.config.validRedirectDomainLookup[hostname] || this.config.validRedirectDomainLookup["*"]) {
            session.redirectUrl = redirectUrl;
          } else {
            auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "LoginInvalidRedirect", session.id, session.ip, hostname);
            res.status(400).end();
            return;
          }
        } catch (e) {
          auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "LoginInvalidRedirect", session.id, session.ip);
          res.status(400).end();
          return;
        }
      } else {
        auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "LoginInvalidRedirect", session.id, session.ip);
        res.status(400).end();
        return;
      }

      auditLogger.report(LogCategory.AUTH, Severity.INFO, "FirstLoginLeg", session.id, session.ip);
      session.codeVerifier = OpenIDClient.generators.codeVerifier();
      let codeChallenge = OpenIDClient.generators.codeChallenge(session.codeVerifier)
      res.redirect(this.activeClient.authorizationUrl({
        scope: this.config.authenticationScope,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      }));
    } else {
      auditLogger.report(LogCategory.AUTH, Severity.EMERGENCY, "LoginNoAuthClient", session.id, session.ip);
      res.status(503).end();
    }
  }

  logout(req: Request, session: Express.Session, res: Response): void {
    if (this.activeClient) {
      if (session.activeTokens) {
        let redirectUrl = req.query.redirectUrl as string;
        if (redirectUrl) {
          try {
            let hostname = new URL(redirectUrl).hostname;
            if (!this.config.validRedirectDomainLookup[hostname] && !this.config.validRedirectDomainLookup["*"]) {
              auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "LogoutInvalidRedirect", session.id, redirectUrl);
              res.status(400).end();
              return;
            }
          } catch (e) {
            auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "LogoutInvalidRedirect", session.id, redirectUrl);
            res.status(400).end();
            return;
          }

          auditLogger.report(LogCategory.AUTH, Severity.INFO, "LoggingOutRedirect", session.id, session.identity.preferred_username, redirectUrl);
          res.redirect(this.activeClient.endSessionUrl({
            id_token_hint: session.activeTokens.id_token,
            post_logout_redirect_uri: redirectUrl
          }));
        } else {
          auditLogger.report(LogCategory.AUTH, Severity.INFO, "LoggingOut", session.id, session.identity.preferred_username);
          res.redirect(this.activeClient.endSessionUrl({
            id_token_hint: session.activeTokens.id_token,
            post_logout_redirect_uri: session.redirectUrl
          }));
        }
        this.clearActiveTokens(session);
      } else {
        auditLogger.report(LogCategory.AUTH, Severity.INFO, "LoggingOutNoTokens", session.id);
        res.redirect(session.redirectUrl);
      }
    } else {
      auditLogger.report(LogCategory.AUTH, Severity.EMERGENCY, "LogoutNoAuthClient", session.id);
      res.status(503).end();
    }
  }

  getProfile(session: Express.Session): Promise<{ [key: string]: any } | null> {
    return new Promise((resolve) => {
      if (this.activeClient) {
        if (session.activeTokens) {
          this.activeClient.userinfo(session.activeTokens.access_token)
            .then((userInfo) => {
              session.identity = userInfo;

              if (!userInfo.preferred_username) {
                if (userInfo.id)
                  userInfo.preferred_username = userInfo.id as string;
                else if (userInfo.sub)
                  userInfo.preferred_username = userInfo.sub as string;
                else {
                  auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "ProfileNoId", session.id, session.ip);
                  resolve(null);
                }
              }

              auditLogger.report(LogCategory.AUTH, Severity.INFO, "GetAuthProfile", session.id, session.ip, session.identity.preferred_username);
              resolve(userInfo);
            }).catch(async (err) => {
              auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "GetAuthProfileFail", session.id, session.ip, err);
              await this.clearActiveTokens(session);
              resolve(null);
            });
        } else {
          auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "GetAuthProfileNoTokens", session.id, session.ip);
          resolve(null);
        }
      } else {
        auditLogger.report(LogCategory.AUTH, Severity.EMERGENCY, "GetProfileNoAuthClient", session.id, session.ip);
        resolve(null);
      }
    });
  }

  private async clearActiveTokens(session: Express.Session): Promise<false> {
    return new Promise((resolve) => {
      session.destroy(() => {
        resolve(false);
      });
    });
  }

  isLoggedIn(session: Express.Session): Promise<boolean> {
    return new Promise(async (resolve) => {
      if (session.activeTokens) {
        if (this.isAccessTokenExpired(session)) {
          if (this.isRefreshTokenExpired(session)) {
            resolve(this.clearActiveTokens(session));
          } else {
            let refreshed = this.refresh(session);
            session.save(() => {
              if (refreshed) {
                resolve(true);
              } else {
                resolve(this.clearActiveTokens(session));
              }
            });
          }
        } else {
          resolve(true);
        }
      } else {
        resolve(false);
      }
    });
  }

  private isAccessTokenExpired(session: Express.Session): boolean {
    if (session.accessTokenExpiration) {
      return ((session.accessTokenExpiration - Date.now()) <= 0);
    }
    return true;
  }

  private isRefreshTokenExpired(session: Express.Session): boolean {
    if (session.refreshTokenExpiration) {
      return ((session.refreshTokenExpiration - Date.now()) <= 0);
    }
    return false;
  }

  private async adjustUserPermissions(session: Express.Session, userId: string, accessToken: string): Promise<true> {

    try {
      let roleIds = await this.userManager.getUserRoles(userId);
      let accessTokenObject = JSON.parse(Buffer.from((accessToken.split('.')[1]), 'base64').toString('utf8'));

      if (accessTokenObject.resource_access) {
        let rolesToRemove: string[] = [];
        let rolesToAdd: string[] = [];
        let ps = accessTokenObject.resource_access["PeBL-Services"];
        if (ps && ps.roles) {
          for (let incomingRole of ps.roles) {
            let found = false;
            for (let roleId of roleIds) {
              if (roleId === incomingRole) {
                found = true;
                break;
              }
            }
            if (!found) {
              rolesToAdd.push(incomingRole);
            }
          }
          for (let roleId of roleIds) {
            let found = false;
            for (let incomingRole of ps.roles) {
              if (roleId === incomingRole) {
                found = true;
                break;
              }
            }
            if (!found) {
              rolesToRemove.push(roleId);
            }
          }

          auditLogger.report(LogCategory.AUTH, Severity.INFO, "AdjustingRoles", session.id, session.ip, userId, rolesToRemove, rolesToAdd);
          for (let roleId of rolesToRemove) {
            await this.userManager.deleteUserRole(userId, roleId);
          }
          if (rolesToAdd.length > 0) {
            await this.userManager.addUserRoles(userId, rolesToAdd);
          }
        } else {
          auditLogger.report(LogCategory.AUTH, Severity.INFO, "AdjustRolesRemoveAll", session.id, session.ip, roleIds);
          for (let roleId of roleIds) {
            await this.userManager.deleteUserRole(userId, roleId);
          }
        }
      }
    } catch (e) {
      auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "AdjustUserPermissionsFail", session.id, session.ip);
    }


    return true;
  }

  redirect(req: Request, session: Express.Session, res: Response): void {
    if (this.activeClient) {
      this.activeClient.callback(
        this.config.authenticationRedirectURIs[0],
        this.activeClient.callbackParams(req),
        { code_verifier: session.codeVerifier })
        .then(async (tokenSet: TokenSet) => {
          if (Object.keys(tokenSet).length != 0) {
            session.activeTokens = tokenSet;
            if (tokenSet.expires_at) {
              session.accessTokenExpiration = tokenSet["expires_at"] * 1000;
              if (tokenSet.refresh_expires_in) {
                let refreshExpiration = (<any>tokenSet)["refresh_expires_in"] * 1000;
                session.refreshTokenExpiration = Date.now() + refreshExpiration;
              }
              let found = await this.getProfile(session);
              if (found) {
                await this.adjustUserPermissions(session, session.identity.preferred_username, session.activeTokens.access_token);
                await this.userManager.setLastActivity(session.identity.preferred_username, Date.now());
                auditLogger.report(LogCategory.AUTH, Severity.INFO, "LoggedIn", session.id, session.ip, session.identity.preferred_username);
                res.redirect(session.redirectUrl);
              } else {
                auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "NoProfileIdentity", session.id, session.ip);
                res.status(401).end();
              }
            } else {
              auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "TokensDontExpire", session.id, session.ip);
              res.status(503).end();
            }
          } else {
            auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "NoTokensFound", session.id, session.ip);
            res.status(401).end();
          }
        }).catch((err) => {
          auditLogger.report(LogCategory.AUTH, Severity.CRITICAL, "RedirectFail", session.id, session.ip, err.stack);
          res.status(401).end();
        });
    } else {
      auditLogger.report(LogCategory.AUTH, Severity.EMERGENCY, "RedirectNoAuthClient", session.id, session.ip);
      res.status(503).end();
    }
  }

  // private setApiAccessToken() {
  //   return new Promise((resolve, reject) => {
  //     postFormData(this.config.adminApiUrl, '/auth/realms/' + this.config.adminApiRealm + '/protocol/openid-connect/token', {}, {
  //       'grant_type': 'client_credentials',
  //       'client_id': this.config.adminApiClientId,
  //       'client_secret': this.config.adminApiClientSecret
  //     }, (data) => {
  //       auditLogger.report(LogCategory.AUTH, Severity.INFO, "FoundOpenIDAdminApiToken", this.config.adminApiUrl, this.config.adminApiRealm, this.config.adminApiClientId);
  //       let token = JSON.parse(data);
  //       token.expirationDate = Date.now() + (token.expires_in * 1000);
  //       this.apiToken = token;
  //       resolve();
  //     }, (error) => {
  //       auditLogger.report(LogCategory.AUTH, Severity.EMERGENCY, "OpenIDAdminApiTokenFail", error);
  //       this.apiToken = null;
  //       reject();
  //     });
  //   });
  // }

  // private getUserGroups(userId: string) {
  //   return new Promise((resolve, reject) => {
  //     this.refreshApiToken().then(() => {
  //       if (this.apiToken) {
  //         getData(this.config.adminApiUrl, '/auth/admin/realms/' + this.config.adminApiRealm + '/users/' + userId + '/groups', {
  //           Authorization: 'bearer ' + this.apiToken.access_token
  //         }, (data) => {
  //           auditLogger.report(LogCategory.AUTH, Severity.INFO, "OpenIDAdminApiGetGroupsSuccess", this.config.adminApiUrl, this.config.adminApiRealm, this.config.adminApiClientId);
  //           resolve(JSON.parse(data));
  //         }, (error) => {
  //           auditLogger.report(LogCategory.AUTH, Severity.EMERGENCY, "OpenIDAdminApiGetGroupsFail", error);
  //           reject();
  //         });
  //       } else {
  //         auditLogger.report(LogCategory.AUTH, Severity.EMERGENCY, "OpenIDAdminApiGetGroupsFail", "Admin API Token not set.");
  //         reject();
  //       }
  //     }, (error) => {
  //       reject();
  //     });
  //   });
  // }

  // private refreshApiToken() {
  //   return new Promise((resolve, reject) => {
  //     if (this.apiToken) {
  //       if (this.apiToken.expirationDate - Date.now() <= 30) {
  //         this.setApiAccessToken().then(() => {
  //           resolve();
  //         }, (error) => {
  //           reject();
  //         })
  //       } else {
  //         resolve();
  //       }
  //     }
  //     reject();
  //   });
  // }
}
