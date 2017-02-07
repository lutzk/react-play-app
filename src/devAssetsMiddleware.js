import superagent from 'superagent';
import { formatAssets } from './serverAssets';

const filenameInfo = require('universal-webpack/index.common').filename_info;

const devAssetsMiddleware = () => {
  return (req, res, next) => { // eslint-disable-line
    if (!global.__DEVELOPMENT__) {
      return next();
    }

    let devAssets = null;
    const assetsJsonPath = 'localhost:3011/webpack-asset.json';
    const getAssets = (path) => {
      return new Promise((resolve, reject) => {
        const request = superagent.get(path);
        request.end((err, { body } = {}) => err ? reject(body || err) : resolve(body));
      });
    };

    getAssets(assetsJsonPath)
      .then((assets) => {
        devAssets = filenameInfo(assets, 'http://localhost:3011/dist/');
        if (!devAssets) {
          return res.status(500).send('no assets found for server render, make sure ./webpack-assets.json exists and refresh');
        }
        req.devAssets = formatAssets(devAssets);
        return next();
      });
  };
};

export default devAssetsMiddleware;
