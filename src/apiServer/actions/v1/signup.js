import Promise from 'bluebird';
import ApiClient from '../../utils/ApiClient';
import { slRegisterPath } from '../../config';

export default function signup(req) {
  const client = new ApiClient(req);
  return client
    .post(slRegisterPath, { data: req.body })
    .then((result) => {
      req.session.token = result.token;// eslint-disable-line
      req.session.user = result;
      // return just whats needed to frontend
      const userAccount = Object.assign({}, result);
      return userAccount;
    })
    .catch((error) => {
      req.session.user = null;
      return Promise.reject(error);
    })
  ;
}
