import ApiClient from '../../utils/ApiClient';
import { nasaApiConfig } from '../../config';

const { key, basePath, manifestsPath, offlineRoverPath } = nasaApiConfig;

export default function nasa(req, params) { // eslint-disable-line
  let path;
  const client = new ApiClient(req);
  const { /* sol, */ rover, offline } = params;

  if (rover && !offline) {
    path = `${basePath}${manifestsPath}${rover}?api_key=${key}`;
  }

  if (rover && offline) {
    path = `${offlineRoverPath}/${rover}`;
  }

  return client.get(path);
}
