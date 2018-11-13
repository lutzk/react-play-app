import fs from 'fs';
import { promisify } from 'util';

const asyncWrap = fn => (...args) => fn(...args).catch(args[2]);

const promisedReadFile = promisify(fs.readFile);

const promisedJsonParse = json =>
  new Promise((resolve, reject) => {
    try {
      resolve(JSON.parse(json));
    } catch (e) {
      reject(e);
    }
  });

const parseJsonFile = path =>
  promisedReadFile(path, 'utf8')
    .then(file => promisedJsonParse(file).then(json => json))
    .catch(e => console.log('JSON PARSE ERROR::', e));

const getJsonData = (options = { path: '', empty: true }) => {
  const { path, empty } = options;
  if (!empty && path.length) {
    return parseJsonFile(path).then(assets => (assets ? assets : false));
  }

  return Promise.resolve(false);
};

const toHex = colorString => {
  let hex = '';
  const itterations = colorString.length;
  for (let i = 0; i < itterations; i += i) {
    hex += `${colorString.charCodeAt(i).toString(16)}`;
  }
  return hex;
};

export { toHex, asyncWrap, getJsonData };
