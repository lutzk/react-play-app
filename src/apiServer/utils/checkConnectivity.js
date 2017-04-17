import ApiClient from './ApiClient';
import { couchDBPath } from '../config';

const client = new ApiClient();
const isCouchDBUp = () => client.get(couchDBPath).then(res => !(res.error && res.error === 'ECONNREFUSED'));

export {
  isCouchDBUp, // eslint-disable-line
};
