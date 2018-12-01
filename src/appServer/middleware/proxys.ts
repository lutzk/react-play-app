import http from 'http';
import {
  apiBase,
  apiSocket,
  couchHost,
  couchPort,
  couchProtocol,
} from '../../config/appConfig';

/*

  adapted / inspired from: https://github.com/nodejitsu/node-http-proxy.git - passes/web-incoming.js/#stream method
  unfortunatly its not suporting unix domain sockets
  but the undelying `http.request` does

  - added support for unix domain sockets - just to play arround

*/

interface ReqOptions {
  path: string;
  headers: any;
  method: string;
  host?: string;
  hostname?: string;
  port?: number;
  socketPath?: string;
}

class ProxyCreator {
  public options: any;
  public clb: any;
  constructor(options = {}, clb) {
    this.options = options;
    this.clb = clb;
  }

  public proxy() {
    return (req, res) => {
      const clb = this.clb;
      const options = this.options;
      const createErrorHandler = proxyReq => err => {
        if (req.socket.destroyed && err.code === 'ECONNRESET') {
          return proxyReq.abort();
        }
        return clb(err, req, res);
      };

      const headers = { ...req.headers };
      const reqOptions: ReqOptions = {
        headers,
        path: options.path ? options.path + req.url : req.url,
        method: req.method,
      };

      if (options.host) {
        reqOptions.host = options.host;
        reqOptions.hostname = options.hostName;
      }
      if (options.port) {
        reqOptions.port = options.port;
      }
      if (options.socketPath) {
        reqOptions.socketPath = options.socketPath;
      }

      const proxyReq = http.request(reqOptions);
      const proxyError = createErrorHandler(proxyReq);

      req.on('aborted', () => proxyReq.abort());
      req.on('error', proxyError);

      proxyReq.on('error', proxyError);
      req.pipe(proxyReq);

      proxyReq.on('response', proxyRes => {
        Object.keys(proxyRes.headers).forEach(key => {
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
}

function errorHandler(err, req, res) {
  if (!res.headersSent) {
    res.writeHead(500, { 'content-type': 'application/json' });
  }
  const json = { error: 'proxy_error', reason: err };
  res.end(JSON.stringify(json));
}

const apiProxy = new ProxyCreator(
  {
    path: apiBase,
    socketPath: apiSocket,
  },
  errorHandler,
);

const couchProxy = new ProxyCreator(
  {
    host: `${couchProtocol}${couchHost}`,
    hostName: couchHost,
    port: couchPort,
  },
  errorHandler,
);

export { apiProxy, couchProxy };
