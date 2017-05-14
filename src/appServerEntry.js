import { getJsonData } from './helpers/utils';
import { startServer } from './appServer/startServer';

let appServer;

const dev = __DEVELOPMENT__;

if (dev && module && module.hot) {
  module.hot.addDisposeHandler(() => appServer.close());
  module.hot.accept(e => console.error('SERVER HMR ERROR:', e));
}

const options = {
  ...(dev ?
      { empty: true }
      : { path: './webpack-assets.json' }),
};

(async () => {
  const serverAssets = await getJsonData(options);
  appServer = startServer({ serverAssets });
})();

// const start = async () => {
//   const serverAssets = await getJsonData(options);
//   appServer = startServer({ serverAssets });
// };

// start();
// export { start };
