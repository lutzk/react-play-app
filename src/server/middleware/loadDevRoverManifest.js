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

    return getAssets(`./${rover}.json`).then((manifest) => {
      res.status(200);
      res.send(manifest);
      return res.end();
    });
  };
};
