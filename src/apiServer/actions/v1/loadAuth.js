import ApiClient from '../../utils/ApiClient';
import { slRefreshPath } from '../../config';

export default function loadAuth(req) {
  req.session.touch();
  if (req.session.user && Object.keys(req.session.user).indexOf('error') > -1) {
    req.session.user = null;
    req.session.token = null;
  }
  if (req.session.user) {
    const client = new ApiClient(req);
    const headers = {
      Authorization: `Bearer ${req.session.user.token}:${
        req.session.user.password
      }`,
    };
    client
      .post(slRefreshPath, { headers })
      .then(r => {
        req.session.token = r.token;
        // return Promise.resolve(req.session.user);
      })
      .catch(e => console.error('authRefreshError', e));
    return Promise.resolve(req.session.user);
  }

  return Promise.resolve({});
}
