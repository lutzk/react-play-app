import superagent from 'superagent';
// import formatUrl from './formatUrl';
import { camelizeKeys } from 'humps';

const methods = ['get', 'post', 'put', 'patch', 'del'];

class ApiClient {
  constructor(incomingReq) {
    methods.forEach(method =>// eslint-disable-line
      this[method] = async (path, {  params, data  }  = {}) => {// eslint-disable-line
        let request = null;

        try {
          request = await superagent[method](path);
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
        } catch (error) {
          return request;
        }

        const camelizedBody = camelizeKeys(request.body);
        return camelizedBody;
      });
  }
}

export default ApiClient;
