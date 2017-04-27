import PouchDB from 'pouchdb';
import express from 'express';
import SuperLogin from 'superlogin';
import bodyParser from 'body-parser';

import { nasaRouter, apiRouter, publicApiRouter } from './routers';
import { setAuth, checkAuth, errorHandler, getCouchDocs, redisSession, checkRedisSession } from './middleware';

import {
  slMount,
  slConfig,
  couchMount,
  nasaApiMount,
  apiRootMount,
  usersCouchPath,
} from './config';

const userscouch = new PouchDB(usersCouchPath);
const superlogin = new SuperLogin(slConfig, false, userscouch);

const api = () =>
  express()
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(redisSession)
    .use(checkRedisSession())
    .use(setAuth())
    .use(slMount, superlogin.router)
    .use(apiRootMount, publicApiRouter)
    .use(checkAuth())
    .use(nasaApiMount, nasaRouter)
    .use(couchMount, getCouchDocs())
    .use(apiRootMount, apiRouter)
    .use(errorHandler());

export default api;
