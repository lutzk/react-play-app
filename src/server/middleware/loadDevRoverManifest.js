import getAssets from '../serverAssets';

export const loadDevRoverManifest = () => {// eslint-disable-line
  return (req, res, next) => {
    if (req.path !== '/roverManifest') {
      return next();
    }

    let rover = 'Spirit';
    if (req.query && req.query.rover) {
      rover = req.query.rover;
    }
    const roverManifest = getAssets(`./${rover}.json`);
    res.status(200);
    res.send(roverManifest);
    return res.end();
  };
};
