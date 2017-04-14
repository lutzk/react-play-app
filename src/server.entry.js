import getAssets from './server/serverAssets';

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

const serverAssets = getAssets({
  empty: global.__DEVELOPMENT__,
});

// const serverPath = './server/server;
// error ...
// webpack/issues/#2401
const startServer = () =>
  import('./server/startServer').then(server =>
    server.startServer({ serverAssets }))
    .catch(e => console.log('serverError:', e));

startServer();
