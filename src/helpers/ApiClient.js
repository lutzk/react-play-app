import superagent from 'superagent';
import { camelizeKeys } from 'humps';
import cookie from 'react-cookie';
import formatUrl from './formatUrl';
import { authTokenKey } from '../config/appConfig';

const verbs = ['get', 'post'];


function ApiClient(incomingReq) {

  const client = verb => async (path, { params, data, headers } = {}) => {
    let request = null;
    let result = null;

    try {

      request = superagent[verb](formatUrl(path));

      if (cookie && cookie.load('session')) {
        request.set(authTokenKey, cookie.load('session'));
      }

      if (__SERVER__ && incomingReq.get('cookie')) {
        request.set('cookie', incomingReq.get('cookie'));
      }

      if (headers) {
        request.set(headers);
      }

      if (params) {
        request.query(params);
      }

      if (data) {
        request.send(data);
      }

      result = await request;

    } catch (error) {

      if (error && error.code && !error.status) {
        result = { error: error.code };
      } else if (error && error.response) {
        result = { error: { status: error.status, error: error.response.body || error.response.text } };
      } else {
        result = 'SOLAR FLARE';
      }

      return result;
    }

    const camelizedBody = camelizeKeys(result.body || result);
    return camelizedBody;
  };

  verbs.map(verb =>
    ApiClient.prototype[verb] = client(verb));
}

export default ApiClient;
