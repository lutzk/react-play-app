import ApiClient from '../../utils/ApiClient';
import { nasaApiConfig } from '../../config';

// https://api.nasa.gov/mars-photos/api/v1/rovers/spirit/photos?sol=1000&api_key=DEMO_KEY
// https://api.nasa.gov/mars-photos/api/v1/manifests/Curiosity?api_key=DEMO_KEY
// https://api.nasa.gov/mars-photos/api/v1/manifests/Spirit?api_key=DEMO_KEY

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
