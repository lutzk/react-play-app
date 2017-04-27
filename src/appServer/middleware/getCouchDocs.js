import { ApiClient } from '../../helpers/ApiClient';
import { asyncWrap as aw } from '../../helpers/utils';

export const getCouchDocs = () => aw(async (req, res, next) => {

  if (!(req.get('cookie') && req.get('cookie').substring(0, 8) === 'session=')) {
    return next();
  }

  const client = new ApiClient(req);
  const couch = await client.get('/userCouch');

  if (couch.error) {
    if (parseInt(couch.error.status, 10) === 401) {
      return next();
    }

    throw Error(couch.error);
  }

  Object.keys(couch).map(key =>// eslint-disable-line
    key.prefetched = true);

  res.preloadedState = couch;
  return next();
});
