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

import { PeBLPlugin } from "../models/peblPlugin";
import { SessionDataManager } from "../interfaces/sessionDataManager";
import { AssetManager } from "../interfaces/assetManager";

export class DefaultAssetManager extends PeBLPlugin implements AssetManager {
  // private sessionData: SessionDataManager;

  constructor(sessionData: SessionDataManager) {
    super();
    // this.sessionData = sessionData;
    // this.addMessageTemplate(new MessageTemplate("getAssets",
    //   this.validateGetAssets.bind(this),
    //   this.authorizeGetAssets.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.getAssets(payload.identity, dispatchCallback);
    //   }));

    // this.addMessageTemplate(new MessageTemplate("saveAssets",
    //   this.validateSaveAssets.bind(this),
    //   this.authorizeSaveAssets.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.saveAssets(payload.identity, payload.assets, dispatchCallback);
    //   }));

    // this.addMessageTemplate(new MessageTemplate("deleteAsset",
    //   this.validateDeleteAsset.bind(this),
    //   this.authorizeDeleteAsset.bind(this),
    //   (payload: { [key: string]: any }, dispatchCallback: (data: any) => void) => {
    //     this.deleteAsset(payload.identity, payload.xId, dispatchCallback);
    //   }));
  }

  // validateGetAssets(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // authorizeGetAssets(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // validateSaveAssets(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // authorizeSaveAssets(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // validateDeleteAsset(payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // authorizeDeleteAsset(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
  //   return false;
  // }

  // getAssets(identity: string, callback: ((assets: Asset[]) => void)): void {
  //   this.sessionData.getHashValues(generateUserAssetKey(identity),
  //     (result: string[]) => {
  //       callback(result.map(function(x) {
  //         return new Asset(JSON.parse(x));
  //       }));
  //     });
  // }

  // saveAssets(identity: string, assets: Asset[], callback: ((success: boolean) => void)): void {
  //   let arr = [];
  //   for (let asset of assets) {
  //     arr.push(generateAssetsKey(asset.id));
  //     arr.push(JSON.stringify(asset));
  //   }
  //   this.sessionData.setHashValues(generateUserAssetKey(identity), arr);
  //   callback(true);
  // }

  // deleteAsset(identity: string, id: string, callback: ((success: boolean) => void)): void {
  //   this.sessionData.getHashValue(generateUserAssetKey(identity), generateAssetsKey(id), (data) => {
  //     if (data) {
  //       this.sessionData.queueForLrsVoid(data);
  //     }
  //     this.sessionData.deleteHashValue(generateUserAssetKey(identity),
  //       generateAssetsKey(id), (result: boolean) => {
  //         if (!result) {
  //           auditLogger.report(LogCategory.PLUGIN, Severity.ERROR, "DelAssetFail", identity, id);
  //         }
  //         callback(result);
  //       });
  //   });
  // }
}
