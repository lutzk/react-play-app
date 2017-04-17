import { ApiClient } from '../../helpers';

export const getCouchDocs = () => (req, res, next) => {
  const client = new ApiClient(req);

  return client.get('/userCouch').then((couch) => {
    if (couch.error) {
      return next();
    }
    res.preloadedState = couch;
    return next();
  });
};
