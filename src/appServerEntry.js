import { getJsonData } from './helpers/utils';
import { startServer } from './appServer/startServer';

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DISABLE_SSR__ = false; // <----- DISABLES SERVER SIDE RENDERING FOR ERROR DEBUGGING
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';
let appServer;

if (global.__DEVELOPMENT__) {
  (() => {
    if (!require('piping')(
      {
        hook: true,
        ignore: /(\/\.|~$|\.json$|\.\/node_modules\/$)/i,
      }
    )) {
      // return;
    }
  })();
const dev = __DEVELOPMENT__;

if (dev && module && module.hot) {
  module.hot.addDisposeHandler(() => appServer.close());
  module.hot.accept(e => console.error('SERVER HMR ERROR:', e));
}

const dev = global.__DEVELOPMENT__;
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
