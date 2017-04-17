import express from 'express';
import fs from 'fs';
import api from './api';
// import { socket } from './config';

// if (!apiPort) {
//   throw Error('No PORT environment variable has been specified');
// }
const socket = '/tmp/api.sock';
const startServer = () => express()
  .use((req, res, next) => {
    console.log('HOLLLA____ req.url:', req.url);
    next();
  })
  .use(api())
  .listen(socket, (err) => {
    if (err) {
      throw Error(err);
    }
    // console.info(`==>   api is up on: ${apiPath}`);
    console.info(`==>   api is up on: ${socket}`);
  });

const checkSocket = (clb) => {
  fs.stat(socket, (err) => {
    if (!err) {
      fs.unlinkSync(socket);
      clb();
    } else {
      clb();
    }
  });
};

checkSocket(startServer);
// startServer();
