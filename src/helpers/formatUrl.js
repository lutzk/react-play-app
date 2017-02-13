import appConfig from '../appConfig';

const formatUrl = (path) => {
  const adjustedPath = path[0] !== '/' ? `/${path}` : path;
  if (global.__SERVER__) {
    // Prepend host and port of the API server to the path.
    return `http://${appConfig.apiHost}${appConfig.apiPort}${appConfig.apiBasePath}${adjustedPath}`;
  }
  // Prepend `/api` to relative URL, to proxy to API server.
  return `${appConfig.apiBasePath}${adjustedPath}`;
};

export default formatUrl;
