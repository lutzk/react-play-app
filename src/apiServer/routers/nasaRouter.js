import express from 'express';
import { nasaApiConfig } from '../config';
import { asyncWrap as wrap, getJsonData } from '../utils/utils';

const getRoverManifestOffline = () => wrap(async (req, res, next) => {
  let rover = 'Spirit';
  if (req.params && req.params.rover) {
    rover = req.params.rover.toLowerCase();
    const roverManifest = await getJsonData({ path: `./${rover}.json` });
    if (roverManifest) {
      res.status(200);
      res.send(roverManifest);
      return res.end();
    }
  }

  res.status(404);
  res.send({ error: 'NOT FOUND' });
  return res.end();
});

const roverRouter = express.Router();// eslint-disable-line
const { offlineSolRoute, offlineRoverRoute } = nasaApiConfig;

roverRouter
  .use(offlineRoverRoute, getRoverManifestOffline())
  .use(offlineSolRoute, getRoverManifestOffline());

export default roverRouter;
