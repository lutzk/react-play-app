import Promise from 'bluebird';
import ApiClient from '../../utils/ApiClient';
import { slLoginPath } from '../../config';

export default function login(req) {
  const client = new ApiClient(req);
  console.log('__slLoginPath__::', slLoginPath);
  console.log(req);
  return client
    .post(slLoginPath, { data: req.body })
    .then((result) => {
      req.session.token = result.token;
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
