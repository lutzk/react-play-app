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

const serverAssets = getJsonData({
  empty: global.__DEVELOPMENT__,
});

const startServer = () =>
  import('./appServer/startServer').then(server =>
    server.startServer({ serverAssets }))
    .catch(e => console.log('serverError:', e));

startServer();
