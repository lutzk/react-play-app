import fs from 'fs';
import express from 'express';

import api from './api';
import { socket } from './config';

if (!socket) {
  throw Error('No SOCKET environment variable has been specified');
}

const startServer = () => express()
  .use(api())
  .listen(socket, (err) => {
    if (err) {
      // throw Error(err);
      console.error('SERVER START:', err);
    }
    console.info(`==>   api is up on: ${socket}`);
  });

// the socket file is not allways cleaned up
// so we need to check before start
const checkSocket = starter =>
  fs.stat(socket, (err) => {
    if (!err) {
      fs.unlinkSync(socket);
      starter();
    } else {
      starter();
    }
  });

checkSocket(startServer);
process.on('unhandledRejection', (a, b) => {
  console.log('unhandledRejection');
  console.dir(a);
  console.dir(b);
});
