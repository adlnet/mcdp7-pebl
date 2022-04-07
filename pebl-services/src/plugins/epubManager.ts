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
import { EpubManager } from "../interfaces/epubManager";
import { PermissionSet } from "../models/permission";
import { MessageTemplate } from "../models/messageTemplate";
import * as fs from 'fs';
const axios = require('axios');

const unzipper = require('unzipper');
const xml2js = require('xml2js');
const FormData = require('form-data');
const md5File = require('md5-file');

export class DefaultEpubManager extends PeBLPlugin implements EpubManager {
  private config: { [key: string]: any };
  constructor(config: { [key: string]: any }) {
    super();
    this.config = config;
    this.addMessageTemplate(new MessageTemplate("uploadEpub",
      this.validateUploadEpub.bind(this),
      this.authorizeUploadEpub.bind(this),
      (payload: { [key: string]: any }) => {
        return this.uploadEpub(payload.epubFilePath);
      }));

    this.addMessageTemplate(new MessageTemplate("deleteEpub",
      this.validateDeleteEpub.bind(this),
      this.authorizeDeleteEpub.bind(this),
      (payload: { [key: string]: any }) => {
        return this.deleteEpub(payload.id);
      }))
  }

  validateUploadEpub(payload: { [key: string]: any }): boolean {
    return true;
  }

  authorizeUploadEpub(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    if (username !== payload.identity)
      return false;

    if (!permissions.user[payload.requestType])
      return false;

    return true;
  }

  validateDeleteEpub(payload: { [key: string]: any }): boolean {
    return true;
  }

  authorizeDeleteEpub(username: string, permissions: PermissionSet, payload: { [key: string]: any }): boolean {
    if (username !== payload.identity)
      return false;

    if (!permissions.user[payload.requestType])
      return false;

    return true;
  }

  async extractEpubMetadata(epubFilePath: string): Promise<{ [key: string]: any }> {
    let metadata = {};
    const zip = fs.createReadStream(epubFilePath).pipe(unzipper.Parse({ forceStream: true }));
    for await (const entry of zip) {
      if (entry.path == "OEBPS/content.opf") {
        try {
          const content = await entry.buffer();
          xml2js.parseStringPromise(content.toString()).then((result: any) => {
            let title = result.package.metadata[0]['dc:title'] ? result.package.metadata[0]['dc:title'][0] : undefined;
            let author = result.package.metadata[0]['dc:creator'] ? result.package.metadata[0]['dc:creator'][0] : undefined;
            let id = result.package.metadata[0]['dc:identifier'] ? result.package.metadata[0]['dc:identifier'][0]._ : undefined;
            let coverHref;
            for (let i = 0; i < result.package.manifest[0].item.length; i++) {
              if (result.package.manifest[0].item[i].$.properties && result.package.manifest[0].item[i].$.properties === 'cover-image') {
                coverHref = result.package.manifest[0].item[i].$.href;
                break;
              }
            }

            metadata = {
              title: title,
              author: author,
              id: id,
              coverHref: coverHref
            }

          })
        } catch (e) {
          entry.autodrain();
        }
      } else {
        entry.autodrain();
      }
    }
    return metadata;
  }

  async extractEpubCoverImage(epubFilePath: string, coverHref: string): Promise<Buffer | null> {
    let image = null;
    const zip = fs.createReadStream(epubFilePath).pipe(unzipper.Parse({ forceStream: true }));
    for await (const entry of zip) {
      if (entry.path == 'OEBPS/' + coverHref) {
        image = await entry.buffer();
      } else {
        entry.autodrain();
      }
    }
    return image;
  }



  async uploadEpub(epubFilePath: string): Promise<{ status: number, message: string }> {
    if (!this.config.publishingServiceUrl)
      return { status: 500, message: 'No Publishing Service URL' };

    try {
      let metadata = await this.extractEpubMetadata(epubFilePath);
      console.log(metadata);
      if (metadata.id) {
        let coverImage = metadata.coverHref ? await this.extractEpubCoverImage(epubFilePath, metadata.coverHref) : null;
        if (coverImage) {
          let formData = new FormData();
          formData.append('title', metadata.title ? metadata.title : "Untitled");
          formData.append('author', metadata.author ? metadata.author : "No Author Listed");
          formData.append('libraryState', 'published');
          formData.append('hidden', 'shown');
          formData.append('id', metadata.id);
          formData.append('md5', await md5File(epubFilePath));
          formData.append('epub', fs.createReadStream(epubFilePath), {
            contentType: 'application/epub+zip',
            filename: metadata.id + '.epub'
          })
          formData.append('cover', coverImage, {
            contentType: 'image/jpeg',
            filename: metadata.id + '_cover.jpeg'
          })

          console.log(formData);

          await axios.post(this.config.publishingServiceUrl + '/publishEpub', formData, {
            headers: {
              'Authorization': this.config.publishingServiceSecret,
              'Content-Type': 'multipart/form-data; boundary=' + formData.getBoundary()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          })

          return { status: 201, message: 'Created' };

        } else {
          return { status: 500, message: 'No cover image' };
        }
      } else {
        return { status: 500, message: 'Missing book ID' };
      }
    } catch (e) {
      console.log(e);
      return { status: 500, message: e.toString() };
    }
  }

  async deleteEpub(id: string): Promise<{ status: number, message: string }> {
    if (!this.config.publishingServiceUrl)
      return { status: 500, message: 'No Publishing Service URL' };

    try {
      await axios.delete(this.config.publishingServiceUrl + '/deleteEpub?id=' + id, {
        headers: {
          'Authorization': this.config.publishingServiceSecret
        }
      })

      return { status: 200, message: 'Ok' };
    } catch (e) {
      return { status: 500, message: e.toString() };
    }
  }
}
