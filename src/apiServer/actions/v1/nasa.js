import ApiClient from '../../utils/ApiClient';
import { nasaApiConfig } from '../../config';

// https://api.nasa.gov/mars-photos/api/v1/rovers/spirit/photos?sol=1000&api_key=DEMO_KEY
// https://api.nasa.gov/mars-photos/api/v1/manifests/Curiosity?api_key=DEMO_KEY
// https://api.nasa.gov/mars-photos/api/v1/manifests/Spirit?api_key=DEMO_KEY

const {
  key,
  basePath,
  manifestsPath,
  offlineRoverPath,
  offlineSolPath,
} = nasaApiConfig;

export default function nasa(req, params) {
  let path;
  const client = new ApiClient(req);
  const { sol, rover, offline } = params;

  if (rover && !offline && !sol) {
    path = `${basePath}${manifestsPath}${rover}?api_key=${key}`;
  }

  if (rover && sol && !offline) {
    path = `${basePath}/rovers/${rover}/photos?sol=${sol}&api_key=${key}`;
  }

  if (rover && offline && !sol) {
    path = `${offlineRoverPath}/${rover}`;
  }

  // if (rover && !offline) {
  //   path = `${basePath}${manifestsPath}${rover}?api_key=${key}`;
  // }

  if (rover && offline && sol) {
    path = `${offlineSolPath}/rover/${rover}/sol/${sol}`;
  }

  return client.get(path);
}
