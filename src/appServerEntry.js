import { getJsonData } from './helpers/utils';

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DISABLE_SSR__ = false; // <----- DISABLES SERVER SIDE RENDERING FOR ERROR DEBUGGING
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

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
}

const dev = global.__DEVELOPMENT__;
const options = {
  ...(dev ?
      { empty: true }
      : { path: './webpack-assets.json' }),
};

const startServer = async () => {
  const serverAssets = await getJsonData(options);
  const server = await import('./appServer/startServer');

  server.startServer({ serverAssets });
};

startServer();
