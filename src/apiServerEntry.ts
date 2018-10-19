import { starter as startServer } from './apiServer/server';

let apiServer;
declare var __DEVELOPMENT__: any;
if (__DEVELOPMENT__ && module && module.hot) {
  module.hot.addDisposeHandler(() => apiServer.close());
  module.hot.accept(e => console.error('API SERVER HMR ERROR:', e));
}

(async () => {
  apiServer = await startServer();
})();

// const start = async () => appServer = startServer({ serverAssets });
// start();
// export { start };
