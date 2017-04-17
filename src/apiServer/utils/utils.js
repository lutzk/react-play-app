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
  if (!empty) {
    return parseJsonFile(path)
      .then(assets => assets ? assets : false);// eslint-disable-line
  }

  return Promise.resolve(false);
};

const createErrorResponse = ({ status = 404, text = 'not found' } = {}) => ({
  error: {
    status,
    response: { text },
  },
});

const filterParams = (params) => {
  const filtered = {};
  Object.keys(params).map((key) => { // eslint-disable-line
    if (params[key] !== undefined && params[key] !== 'false') {
      filtered[key] = params[key];
    }
  });

  return filtered;
};

export { isCouchDBUp } from './checkConnectivity';
export {
  asyncWrap,
  getJsonData,
  filterParams,
  promisedReadFile,
  promisedJsonParse,
  createErrorResponse,
};
