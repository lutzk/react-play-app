import express from 'express';
import { nasaApiConfig } from '../config';
import { asyncWrap as wrap, getJsonData } from '../utils/utils';

const getRoverManifestOffline = () =>
  wrap(async (req, res, next) => {
    let rover = 'Spirit';
    if (req.params && req.params.rover) {
      rover = req.params.rover.toLowerCase();
      const roverManifest = await getJsonData({
        path: `./nasaJsons/${rover}.json`,
      });
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

const getSolManifestOffline = () =>
  wrap(async (req, res, next) => {
    let sol = 55;
    let rover = 'spirit';
    if (req.params && req.params.sol && req.params.rover) {
      sol = Math.round(Math.random()) ? 55 : 1000; // req.params.sol;
      rover = req.params.rover.toLowerCase();
      const solManifest = await getJsonData({
        path: `./nasaJsons/${rover}_sol_${sol}.json`,
      });
      if (solManifest) {
        res.status(200);
        res.send(solManifest);
        return res.end();
      }
    }

    res.status(404);
    res.send({ error: 'NOT FOUND' });
    return res.end();
  });

const roverRouter = express.Router();
const { offlineSolRoute, offlineRoverRoute } = nasaApiConfig;

roverRouter
  .use(offlineSolRoute, getSolManifestOffline())
  .use(offlineRoverRoute, getRoverManifestOffline());

export default roverRouter;
