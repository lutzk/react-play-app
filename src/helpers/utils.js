import fs from 'fs';
import Promise from 'bluebird';

const asyncWrap = fn => (...args) => fn(...args).catch(args[2]);

const promisedReadFile = Promise.promisify(fs.readFile);

const promisedJsonParse = json => new Promise((resolve, reject) => {
  try {
    resolve(JSON.parse(json));
  } catch (e) {
    reject(e);
  }
});

const parseJsonFile = _path => promisedReadFile(_path, 'utf8')
  .then(file => promisedJsonParse(file)
    .then(json => json))
  .catch(e => console.log('JSON PARSE ERROR::', e));

const getJsonData = (options = { path: false, empty: true }) => {
  const { path, empty } = options;
  if (!empty && path) {
    return parseJsonFile(path)
      .then(assets => assets ? assets : false);// eslint-disable-line
  }

  return Promise.resolve(false);
};

const toHex = (string) => {
  let hex = '';
  const itterations = string.length;
  for (let i = 0; i < itterations; i += i) {
    hex += `${string.charCodeAt(i).toString(16)}`;
  }
  return hex;
};

export {
  toHex,
  asyncWrap,
  getJsonData,
};
