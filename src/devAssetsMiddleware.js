import superagent from 'superagent';
import { formatAssets } from './serverAssets';

const filenameInfo = require('universal-webpack/index.common').filename_info;

const devAssetsMiddleware = () => {
  return (req, res, next) => { // eslint-disable-line
    if (!global.__DEVELOPMENT__) {
      return next();
    }

    let devAssets = null;
    const assetsJsonPath = 'http://localhost:3011/webpack-assets';// use config

    superagent
      .get(assetsJsonPath)
      .then((r, err) => { // eslint-disable-line
        if (r) {
          const publicPath = r.body.publicPath || 'http://localhost:3011/dist/';
          devAssets = filenameInfo(r.body, publicPath);
          if (!devAssets) {
            return res.status(500).send('no assets found for server render');
          }
          res.locals.devAssets = formatAssets(devAssets);
          return next();
        }
        if (err) {
          console.error(err);
          return res.status(500).send(err);
        }
      })
      .catch((e) => {
        console.error(e);
        return res.status(500).send(e);
      });
  };
};

export default devAssetsMiddleware;
