import ApiClient from '../../utils/ApiClient';
import { couchDBApiPath } from '../../config';
import { createErrorResponse } from '../../utils/utils';

export default function couch(req) { // eslint-disable-line
  req.session.touch();
  if (req.session.user && Object.keys(req.session.user).indexOf('error') > -1) {
    req.session.user = null;
    req.session.token = null;
  }
  if (req.session.user) {
    const client = new ApiClient(req);
    return client.get(couchDBApiPath);
  }

  const error = createErrorResponse();
  return Promise.reject(error);
}
