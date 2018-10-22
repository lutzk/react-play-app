import { apiBase, appServerPath } from '../config/appConfig';

const lead = '/';

const prefix = path => (path[0] !== lead ? lead + path : path);

const formatUrl = path =>
  __SERVER__ ? `${appServerPath}${prefix(path)}` : `${apiBase}${prefix(path)}`;

export default formatUrl;
