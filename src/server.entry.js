import getAssets, { formatAssets } from './serverAssets';

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DISABLE_SSR__ = false; // <----- DISABLES SERVER SIDE RENDERING FOR ERROR DEBUGGING
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

const assetsPromise = getAssets();
assetsPromise.then((assets) => {
  import('./server').then((server) => {
    return server.default(formatAssets(assets));
  });
});
