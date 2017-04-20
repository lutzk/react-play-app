import { host, port, apiBase } from '../config/appConfig';

const lead = '/';

const prefix = path =>
  path[0] !== lead ?
    lead + path
    : path;

const formatUrl = path =>
  __SERVER__ ?
    `${host}:${port}${apiBase}${prefix(path)}`
    : apiBase + prefix(path);

export default formatUrl;
