import httpProxy from 'http-proxy';
import { apiHost, apiPort, apiBase } from '../../config/appConfig';

const proxy = httpProxy.createProxyServer({
  target: `http://${apiHost}:${apiPort}${apiBase}`,
  changeOrigin: true,
});

proxy.on('error', (error, req, res) => {
  if (error.code !== 'ECONNRESET') {
    console.error('proxy error', error);
  }
  if (!res.headersSent) {
    res.writeHead(500, { 'content-type': 'application/json' });
  }

  const json = { error: 'proxy_error', reason: error };
  res.end(JSON.stringify(json));
});

const apiProxy = () => (req, res) => proxy.web(req, res);

export default apiProxy;
