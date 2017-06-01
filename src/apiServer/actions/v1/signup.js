import ApiClient from '../../utils/ApiClient';
import { slRegisterPath, slCouchPath, couchDBProxyPath } from '../../config';

export default function signup(req) {
  const client = new ApiClient(req);
  return client
    .post(slRegisterPath, { data: req.body })
    .then((result) => {
      if (result.error) {
        req.session.user = null;
        return Promise.reject(result.error);
      }
      const userDB = result.userDBs.sl_user.replace(slCouchPath, couchDBProxyPath);
      delete result.userDBs;
      req.session.token = result.token;// eslint-disable-line
      req.session.user = { ...result, userDB };
      const userAccount = { ...result, userDB };

      return userAccount;
    })
    .catch((error) => {
      req.session.user = null;
      return Promise.reject(error);
    })
  ;
}
