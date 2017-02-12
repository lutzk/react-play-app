import superagent from 'superagent';
import { formatAssets } from './serverAssets';
import appConfig from './appConfig';

const filenameInfo = require('universal-webpack/index.common').filename_info;

const devAssetsMiddleware = () => {
  return (req, res, next) => {
    if (!global.__DEVELOPMENT__) {
      return next();
    }

    let devAssets = null;
    const assetsJsonPath = `http://${appConfig.host}:${appConfig.devAssetServerPort}${appConfig.ssrAssetsRoute}`;

    return superagent
      .get(assetsJsonPath)
      .then((r, err) => { // eslint-disable-line
        if (r) {
          const publicPath = r.body.publicPath || `http://${appConfig.host}:${appConfig.devAssetServerPort}dist/`;
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
