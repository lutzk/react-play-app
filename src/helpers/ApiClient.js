import superagent from 'superagent';
import formatUrl from './formatUrl';

const methods = ['get', 'post', 'put', 'patch', 'del'];

/*
 * This silly underscore is here to avoid a mysterious "ReferenceError: ApiClient is not defined" error.
 * See Issue #14. https://github.com/erikras/react-redux-universal-hot-example/issues/14
 *
 * Remove it at your own risk.
 */
 
 // use superagent promise
 // not tested
class _ApiClient1 {
  constructor(incomingReq) {
    methods.forEach( method =>
      this[method] = (path, { params, data } = {}) => {
        // new Promise((resolve, reject) => {
        const request = superagent[method](formatUrl(path));

        // if (cookie && cookie.load('loginResult')) {
        //   request.set(config.authTokenKey, cookie.load('loginResult'));
        // }

        if (params) {
          request.query(params);
        }

        if (global.__SERVER__ && incomingReq.get('cookie')) {
          request.set('cookie', incomingReq.get('cookie'));
        }

        if (data) {
          request.send(data);
        }

        return request.then((success, error) => {
          if (error) {
            return error;
          }
          return success.body;
        }).catch(e => e);
        // request.end((err, { body } = {}) => err ? reject(body || err) : resolve(body));
      }
      // )// promisse ...
    );
  }
}
const Api2 = _ApiClient1;

export default Api2;
