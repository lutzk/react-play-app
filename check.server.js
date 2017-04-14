#!/usr/bin/env node

(function () {
  require('./setEnv');
  const serverFilePath = './bin/server.js';
  const fs = require('fs');
  let found = false;
  let checker = null;
  let file = null;

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
        if (!!require(serverFilePath)) {
          console.log(`found ${serverFilePath}, starting ...`);
          require(serverFilePath);
          return clearInterval(checker);
        }
      }
    }
  };

  const waitInitial = setTimeout(() => {
    console.log(`check for server bundle ${serverFilePath}`);
    checker = setInterval(check, 1111);
    clearTimeout(waitInitial);
  }, 2222);

}());
