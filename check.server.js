#!/usr/bin/env node

(function () {
  require('./setEnv');
  const serverFilePath = './static/server/server.dev.js';
  const fs = require('fs');
  let found = false;
  let checker = null;
  let file = null;// eslint-disable-line

  const check = () => {
    try {
      found = true;
      file = fs.statSync(serverFilePath, fs.F_OK && fs.R_OK);
    } catch (e) {
      console.log(`no file found yet ${e.code}`);
      found = false;
      file = null;
    } finally {
      if (found) {
        found = false;
        file = null;
        if (require(serverFilePath)) {// eslint-disable-line
          console.log('found, load server bundle ...');
          require('./checkPip');
          require(serverFilePath);// eslint-disable-line
          clearInterval(checker);
          return;// eslint-disable-line
        }
      }
    }
  };

  const waitInitial = setTimeout(() => {
    console.log('check for server bundle ...');
    checker = setInterval(check, 1111);
    clearTimeout(waitInitial);
  }, 2222);

}());
