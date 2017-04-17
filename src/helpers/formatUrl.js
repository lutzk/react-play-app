import { apiBase, apiPath } from '../config/appConfig';// eslint-disable-line

const lead = '/';

const prefix = path =>
  path[0] !== lead ?
    lead + path
    : path;

const formatUrl = path =>
  __SERVER__ ?
    `localhost:3010/api/v1${prefix(path)}`
    : apiBase + prefix(path);

export default formatUrl;
