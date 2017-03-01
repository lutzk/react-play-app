import superagent from 'superagent';
// import formatUrl from './formatUrl';

const methods = ['get', 'post', 'put', 'patch', 'del'];

class ApiClient {
  constructor(incomingReq) {
    methods.forEach(method =>// eslint-disable-line
      this[method] = (path, {  params, data  }  = {}) => {// eslint-disable-line
        const request = superagent[method](path);
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
            return success || error;
          }

          return success.body;
        });
      });
  }
}

export default ApiClient;
