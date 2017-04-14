import superagent from 'superagent';
import { formatAssets, getAssetsFromStats } from '../serverAssets';
import { devAssetServerPath } from '../../config/appConfig';

const devAssetsMiddleware = () => (req, res, next) => {
  if (!global.__DEVELOPMENT__) {
    return next();
  }

  let devAssets = null;

  return superagent
    .get(devAssetServerPath)
    .then((r, err) => { // eslint-disable-line
      if (r) {

        devAssets = getAssetsFromStats(r.body);

        if (!devAssets) {
          return res.status(500).send('no assets found for server render');
        }

        res.locals.devAssets = formatAssets(devAssets);// eslint-disable-line
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

export default devAssetsMiddleware;
