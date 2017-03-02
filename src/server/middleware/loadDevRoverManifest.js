import getAssets from '../serverAssets';

export const loadDevRoverManifest = () => {// eslint-disable-line
  return (req, res, next) => {
    if (req.path !== '/roverManifest') {
      return next();
    }

    let rover = 'Spirit';
    const sol = 55;
    let roverManifest = null;
    if (req.query && req.query.rover && !req.query.sol) {
      rover = req.query.rover;
      roverManifest = getAssets({ path: `./${rover}.json` });
    }

    if (req.query && req.query.rover && req.query.sol) {
      rover = req.query.rover;
      // sol = req.query.sol;
      roverManifest = getAssets({ path: `./${rover}_sol_${sol}.json` });
    }

    res.status(200);
    res.send(roverManifest);
    return res.end();
  };
};
