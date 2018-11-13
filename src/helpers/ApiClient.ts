import { camelizeKeys } from 'humps';
import superagent from 'superagent';
import formatUrl from './formatUrl';
declare var __SERVER__: any;
// const setReqData = ({ request, incomingReq, headers, params, data } = {}) => {

//   if (__SERVER__ && incomingReq && incomingReq.get('cookie')) {
//     request.set('cookie', incomingReq.get('cookie'));
//   }

//   if (headers) {
//     request.set(headers);
//   }

//   if (params) {
//     request.query(params);
//   }

//   if (data) {
//     request.send(data);
//   }

//   return request;
// };

// function client(verb) {
//   return async (path, { params, data, headers } = {}) => {

//     let request = null;
//     let result = null;
//     const incomingReq = this.incomingReq || false;

//     try {
//       request = superagent[verb](formatUrl(path));
//       request = setReqData({ request, incomingReq, headers, params, data });
//       result = await request;

//     } catch (error) {
//       if (error && error.code && !error.status) {
//         result = { error: error.code };
//       } else if (error && error.response) {
//         result = { error: { status: error.status, error: error.response.body || error.response.text } };
//       } else {
//         result = 'SOLAR FLARE';
//       }

//       return result;
//     }

//     const camelizedBody = camelizeKeys(result.body || result);
//     return camelizedBody;
//   };
// }

const verbs = ['get', 'post'];

class ApiClient {
  public incomingReq: any;
  public verbs: string[] = ['get', 'post'];
  constructor(incomingReq = false) {
    this.incomingReq = incomingReq;
    this.verbs.map(verb => (this[verb] = this.client(verb)));
  }

  private client(verb) {
    return async (path: any, { params, data, headers }: any = {}) => {
      let request = null;
      let result = null;
      const incomingReq = this.incomingReq || false;

      try {
        request = superagent[verb](formatUrl(path));
        request = this.setReqData({
          request,
          incomingReq,
          headers,
          params,
          data,
        });
        result = await request;
      } catch (error) {
        if (error && error.code && !error.status) {
          result = { error: error.code };
        } else if (error && error.response) {
          result = {
            error: {
              status: error.status,
              error: error.response.body || error.response.text,
            },
          };
        } else {
          result = 'SOLAR FLARE';
        }

        return result;
      }

      const camelizedBody = camelizeKeys(result.body || result);
      return camelizedBody;
    };
  }

  private setReqData({
    request,
    incomingReq,
    headers,
    params,
    data,
  }: any = {}) {
    if (__SERVER__ && incomingReq && incomingReq.get('cookie')) {
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

    return request;
  }
}

export default ApiClient;
