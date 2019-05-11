import { startServer } from './appServer/startServer';
import { getJsonData } from './helpers/utils';

let appServer;

const dev = __DEVELOPMENT__;

if (dev && module && module.hot) {
  module.hot.addDisposeHandler(() => appServer.close());
  module.hot.accept(e => console.error('SERVER HMR ERROR:', e));
}

const options = {
  ...(dev
    ? { empty: true, path: '' }
    : { path: './webpack-assets.json', empty: false }),
};

(async () => {
  const serverAssets = await getJsonData(options);
  appServer = startServer({ serverAssets });
})();
