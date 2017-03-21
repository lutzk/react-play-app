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
        ignore: /(\/\.|~$|\.json$)/i,
      }
    )) {
      // return;
    }
  })();
}

// const serverPath = './server/server';
// error ...
const serverAssets = getAssets({
  empty: global.__DEVELOPMENT__,
});

const startServer = () =>
  import('./server/server').then(server =>
    server.default({ serverAssets }))
    .catch(e => console.log(e));

startServer();
