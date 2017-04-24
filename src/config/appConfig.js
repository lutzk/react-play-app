const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3010;
const couchProtocol = 'http://';
// const protocol = process.env.SSL ? 'http://' : 'https://';
// const apiHost = process.env.API_HOST || 'localhost';
// const apiPort = process.env.API_PORT || 3040;
const apiBase = process.env.API_BASE || '/api/v1';
const couchBase = '/couch';
const couchHost = '127.0.0.1';
const couchPort = 5984;
// const apiPath = `http://${apiHost}:${apiPort}${apiBase}`;
const apiSocket = '/tmp/api.sock';
const authTokenKey = 'x-authentication';
const ssrAssetsRoute = process.env.SSR_ASSETS_ROUTE;
const devAssetServerPort = process.env.DEV_ASSETS_SERVER_PORT || 3011;
const devAssetServerPath = `http://${host}:${devAssetServerPort}${ssrAssetsRoute}`;

export {
  host,
  port,
  apiBase,
  couchBase,
  couchHost,
  couchPort,
  couchProtocol,
  apiSocket,
  authTokenKey,
  ssrAssetsRoute,
  devAssetServerPort,
  devAssetServerPath,
};
