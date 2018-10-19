import { getJsonData } from './helpers/utils';
import { startServer } from './appServer/startServer';

let appServer;

declare var __DEVELOPMENT__: any;
const dev = __DEVELOPMENT__;

if (dev && module && module.hot) {
  module.hot.addDisposeHandler(() => appServer.close());
  module.hot.accept(e => console.error('SERVER HMR ERROR:', e));
}

const options = {
  ...(dev ?
      { empty: true, path: '' }
      : { path: './webpack-assets.json', empty: false }),
};

(async () => {
  const serverAssets = await getJsonData(options);
  appServer = startServer({ serverAssets });
})();



// TS2345: Argument of type '{ empty: boolean; } | { path: string; }' is not assignable to parameter of type '{ path: boolean; empty: boolean; }'.

// Type '{ empty: boolean; }' is not assignable to type '{ path: boolean; empty: boolean; }'.
//     Property 'path' is missing in type '{ empty: boolean; }'.