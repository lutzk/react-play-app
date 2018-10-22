import fs from 'fs';
import express from 'express';

import api from './api';
import { socket } from './config';
import { promisedStat } from './utils/utils';

if (!socket) {
  throw Error('No SOCKET environment variable has been specified');
}

const app = express().use(api());

const startServer = () =>
  app.listen(socket, err => {
    if (err) {
      console.error('SERVER START:', err);
    }
    console.info(`==>   api is up and listening on: ${socket}`);
  });

// the socket file is not allways cleaned up
const checkSocket = clb =>
  promisedStat(socket)
    .then(() => {
      fs.unlinkSync(socket);
      return clb();
    })
    .catch(() => clb());

const starter = () => checkSocket(startServer);

process.on('unhandledRejection', (a, b) => {
  console.log('unhandledRejection');
  console.dir(a);
  console.dir(b);
});

export { starter };
