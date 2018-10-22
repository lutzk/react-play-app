import superagent from 'superagent';

const verbs = ['get', 'post'];

function ApiClient(incomingReq) {
  const client = verb => async (path, { params, data, headers } = {}) => {
    let request = null;
    let result = null;

    try {
      request = superagent[verb](path);

      if (params) {
        request.query(params);
      }

      if (headers) {
        request.set(headers);
      }

      if (incomingReq && incomingReq.get('cookie')) {
        request.set('cookie', incomingReq.get('cookie'));
      }

      if (data) {
        request.send(data);
      }

      result = await request;
    } catch (error) {
      if (error && error.code) {
        result = error.code;
      } else if (error.response && error.response.text) {
        result = error.response.text;
      } else {
        result = 'SOLAR FLARE';
      }

      return { error: result };
    }

    return result.body;
  };

  verbs.map(
    (
      verb, // eslint-disable-line
    ) => (ApiClient.prototype[verb] = client(verb)),
  );
}

export default ApiClient;
