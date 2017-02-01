import getAssets from './serverAssets';

/**
 * Define isomorphic constants.
 */
global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DISABLE_SSR__ = false; // <----- DISABLES SERVER SIDE RENDERING FOR ERROR DEBUGGING
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

const checkPip = () => {
  if (__DEVELOPMENT__) {
    if (!require('piping')(
      {
        hook: true,
        ignore: /(\/\.|~$|\.json|\.scss|\.sass$)/i
      }
    )) {
      // return;
    }
  }
};

checkPip();

const assets = getAssets();
assets.then((a) => {
  import('./server').then((server) => {
    return server.default(a);
  });
});