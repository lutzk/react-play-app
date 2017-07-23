import superagent from 'superagent';
import { formatAssets, getAssetsFromStats } from '../serverAssets';
import { devAssetServerPath } from '../../config/appConfig';
import { asyncWrap as aw } from '../../helpers/utils';

const devAssetsMiddleware = () => aw(async (req, res, next) => {
  if (!__DEVELOPMENT__) {
    return next();
  }

  const devAssets = null;

  const response = await superagent.get(devAssetServerPath);
  if (response.status === 200 && response.body) {
    // devAssets = getAssetsFromStats(response.body);
    res.locals.clientStats = response.body;
    // res.locals.devAssets = formatAssets(devAssets);
    return next();
  }

  // console.error(err);
  return res.status(response.status).send(response.body);
});

export { devAssetsMiddleware };
