import express from 'express';
import mapUrlToActions from '../utils/url';
import { filterParams, asyncWrap as aw } from '../utils/utils';
import { errorHandler } from '../middleware/middleware';
import { login, signup, loadAuth, logout, nasa, userCouch } from '../actions';

const apiRouter = express.Router();// eslint-disable-line
const publicApiRouter = express.Router();// eslint-disable-line

const apiActions = { logout, nasa, userCouch };

const handler = ({ action, params } = {}) => aw(async (req, res, next) => {
  const result = await action(req, params);

  if (!result || result === undefined) {
    return res.status(500).end();
  }

  if (result.error) {
    let data;
    if (result.error.code) {
      data = result.error.code;
    } else if (result.error.response && result.error.response.text) {
      data = result.error.response.text;
    } else {
      data = 'UNKNOWN';
    }

    return res.status(result.error.status || 500).json(data).end();
  }
  if (action.name === 'logout') {
    res.clearCookie('session');
  }

  return res.json(result);
});

const apiHandler = () => (req, res, next) => {
  let pathsInUrl;
  if (req.url.indexOf('?') > -1) {
    pathsInUrl = req.url.split('?')[0].split('/').filter(path => path !== '');
  } else {
    pathsInUrl = req.url.split('/').filter(path => path !== '');
  }
  const { action } = mapUrlToActions(apiActions, pathsInUrl);
  const params = filterParams(req.query || req.params);
  if (action) {
    return handler({ action, params })(req, res, next);
  }

  return res.status(404).end('NOT FOUND');
};

const publicApiHandler = action => (req, res, next) =>
  handler({ action })(req, res, next);

// const setUpRoutes = (router, actions, actionsMap) =>
//   actionsMap.map(action =>
//     router[action[Object.keys(action)[0]].verb](`/${Object.keys(action)[0]}`, publicApiHandler(actions[Object.keys(action)[0]])));

apiRouter
  .use(apiHandler())
  .use(errorHandler());

publicApiRouter
  .post('/login', publicApiHandler(login))
  .post('/signup', publicApiHandler(signup))
  .get('/loadAuth', publicApiHandler(loadAuth))
  .use(errorHandler());

export { apiRouter, publicApiRouter };
