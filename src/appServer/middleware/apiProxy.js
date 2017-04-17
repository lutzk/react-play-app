import http from 'http';
import { apiHost, apiSocket, apiBase } from '../../config/appConfig';

/*

  adapted / inspired from: https://github.com/nodejitsu/node-http-proxy.git
  unfortunatly its not suporting unix domain sockets
  but the undelying `http.request` does

  - added support for unix domain sockets - just to play arround

*/

function ProxyServer(options = {}, clb) {
  ProxyServer.prototype.middleware = (req, res) => {

    const createErrorHandler = proxyReq => (err) => {
      if (req.socket.destroyed && err.code === 'ECONNRESET') {
        return proxyReq.abort();
      }
      return clb(err, req, res);
    };

    const headers = { ...req.headers };
    const reqOptions = {
      headers,
      host: apiHost,
      path: options.path + req.url,
      method: req.method,
      socketPath: options.socketPath,
    };

    const proxyReq = http.request(reqOptions);
    const proxyError = createErrorHandler(proxyReq);

    req.on('aborted', () => proxyReq.abort());
    req.on('error', proxyError);

    proxyReq.on('error', proxyError);
    req.pipe(proxyReq);

    proxyReq.on('response', (proxyRes) => {
      Object.keys(proxyRes.headers).forEach((key) => {
        const header = proxyRes.headers[key];
        res.setHeader(String(key).trim(), header);
      });

      if (proxyRes.statusMessage) {
        res.writeHead(proxyRes.statusCode, proxyRes.statusMessage);
      } else {
        res.writeHead(proxyRes.statusCode);
      }
      proxyRes.pipe(res);
    });
  };
}

const proxyErrorHandler = () => (err, req, res) => {
  if (!res.headersSent) {
    res.writeHead(500, { 'content-type': 'application/json' });
  }
  const json = { error: 'proxy_error', reason: err };
  res.end(JSON.stringify(json));
};

const proxy = new ProxyServer({
  path: apiBase,
  socketPath: apiSocket,
}, proxyErrorHandler());

const apiProxy = () => (req, res) => {
  proxy.middleware(req, res);
};

export default apiProxy;
