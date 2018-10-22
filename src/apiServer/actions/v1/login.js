import ApiClient from '../../utils/ApiClient';
import { slLoginPath, slCouchPath, couchDBProxyPath } from '../../config';

export default function login(req) {
  const client = new ApiClient(req);
  return client
    .post(slLoginPath, { data: req.body })
    .then(result => {
      if (result.error) {
        req.session.user = null;
        return Promise.reject(result.error);
      }

      const userDB = result.userDBs.sl_user.replace(
        slCouchPath,
        couchDBProxyPath,
      );
      delete result.userDBs;
      const userAccount = { ...result, userDB };
      req.session.token = result.token;
      req.session.user = userAccount;

      return userAccount;
    })
    .catch(error => {
      req.session.user = null;
      return Promise.reject(error);
    });
}
