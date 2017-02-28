import superagent from 'superagent';
// import formatUrl from './formatUrl';

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
  constructor(/* incomingReq */) {
    methods.forEach(method =>// eslint-disable-line
      this[method] = (path /* , {  params, data  }  = {} */) =>// eslint-disable-line
        superagent[method](path)
        // return superagent[method](path)
        // if (cookie && cookie.load('loginResult')) {
        //   request.set(config.authTokenKey, cookie.load('loginResult'));
        // }
        // if (params) {
        //   request.query(params);
        // }
        // if (global.__SERVER__ && incomingReq.get('cookie')) {
        //   request.set('cookie', incomingReq.get('cookie'));
        // }
        // if (data) {
        //   request.send(data);
        // }
        .on('error', e => console.log('error: ', e, JSON.stringify(e, 0, 2)))
        .then((success, error) => {
          if (error) {
            console.error(JSON.stringify(error, 0, 2))
            return error;
          }

          return success.body;
        })
        .catch(e => e)
    );
  }
}

const Api2 = _ApiClient1;

export default Api2;
