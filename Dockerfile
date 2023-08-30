FROM node:alpine

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

COPY package.json ./

USER node

RUN yarn install

COPY --chown=node:node . .

EXPOSE 5008
EXPOSE 8082
