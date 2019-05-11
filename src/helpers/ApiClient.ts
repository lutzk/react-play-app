import { camelizeKeys } from 'humps';
import superagent, { SuperAgentRequest } from 'superagent';
import formatUrl from './formatUrl';
import { Request } from 'express';

interface ApiError {
  error: {
    code?: number;
    status?: number | string;
    response?: superagent.Response;
  };
}

type ApiMethod = (path: any, reqData?: any) => Promise<any>;
export interface IApiClient {
  get: ApiMethod;
  post: ApiMethod;
}
enum VERBS {
  get = 'get',
  post = 'post',
}
class ApiClient {
  public get: ApiMethod;
  public post: ApiMethod;
  private verbs = [VERBS.get, VERBS.post];
  constructor(private incomingReq?: Request) {
    this.verbs.map(verb => (this[verb] = this.client(verb)));
  }

  private client(verb: VERBS) {
    return async (path: any, { params, data, headers }: any = {}) => {
      let request: SuperAgentRequest;
      let requestResult: superagent.Response;
      let errorResult: ApiError;
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
        requestResult = await request;
      } catch (error) {
        errorResult = { error: {} };
        if (error && error.code && !error.status) {
          errorResult.error.code = error.code;
        } else if (error && error.response) {
          errorResult.error = {
            status: error.status,
            response: error.response.body || error.response.text,
          };
        } else {
          errorResult.error.status = 'SOLAR_FLARE';
        }

        return errorResult;
      }

      const camelizedBody = camelizeKeys(requestResult.body || requestResult);
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

export { ApiClient };
