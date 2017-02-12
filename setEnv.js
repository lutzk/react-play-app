#!/usr/bin/env node

(function () {
  let file = null;
  const envPath = require('path').resolve(__dirname, `${process.cwd()}/`);
  try {
    const fs = require('fs');
    file = fs.statSync(`${envPath}/.env`, 'utf8');
  } catch (e) {
    console.log(`no .env file found at: ${envPath}`);
    file = null;
  } finally {
    if (file) {
      require('dotenv').load();
    }
  }
}());
