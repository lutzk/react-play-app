const devAssetsMiddleware = (getDevAssets) => {
  return (req, res, next) => { // eslint-disable-line
    if (!global.__DEVELOPMENT__) {
      return next();
    }
    if (req.path === '/favicon.ico') {
      return next();
    }
    // in dev we refresh assets.json on every request
    const devAssets = getDevAssets();
    if (!devAssets) {
      return res.status(500).send('no assets found for server render, make sure ./webpack-assets.json exists and refresh');
      // return;
    }
    devAssets.then((assets) => {
      req.devAssets = assets;
      return next();
    });
    
  };
};

export default devAssetsMiddleware;
