#!/usr/bin/env node

(function () {
  require('./setEnv');
  let filePath;
  const keys = ['app', 'api'];
  const checKey = key => (key && keys.indexOf(key) > -1);
  const getFilePath = (key = 'app') => `./bin/${key}Server.js`;

  if (process.argv.length > 2 && checKey(process.argv[2])) {
    filePath = getFilePath(process.argv[2]);
  } else {
    filePath = getFilePath();
  }

  const fs = require('fs');
  let found = false;
  let checker = null;

  const check = () => {
    let file = null;

    try {
      found = true;
      file = fs.statSync(filePath, fs.F_OK && fs.R_OK);
    } catch (e) {
      console.log(`no file found yet ${e.code}`);
      found = false;
      file = null;
    } finally {
      if (found) {
        found = false;
        file = null;
        if (!!require(filePath)) {
          console.log(`found ${filePath}, starting ...`);
          require(filePath);
          return clearInterval(checker);
        }
      }
    }
  };

  const waitInitial = setTimeout(() => {
    console.log(`check for server bundle ${filePath}`);
    checker = setInterval(check, 1111);
    clearTimeout(waitInitial);
  }, 2222);

}());
