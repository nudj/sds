FROM node:8-alpine
ARG NPM_TOKEN
WORKDIR /usr/src
COPY . /usr/src
RUN yarn
