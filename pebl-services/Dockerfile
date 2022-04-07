FROM node:14.7.0

COPY . /srv

WORKDIR /srv/

RUN npm install --production \
	&& npm install -g typescript typescript-formatter \
	&& npm install @types/express --save-dev \
	&& npm run compile

RUN mv ./dockerConfig/startServices.sh ./startServices.sh && chmod 755 ./startServices.sh

COPY src/sampleServerConfig.json /srv/dist/serverConfig.json

ENTRYPOINT ["/srv/startServices.sh"]
