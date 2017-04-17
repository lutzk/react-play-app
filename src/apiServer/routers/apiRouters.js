import express from 'express';
import mapUrlToActions from '../utils/url';
import { filterParams } from '../utils/utils';
import { login, signup, loadAuth, logout, nasa, userCouch } from '../actions';

const apiRouter = express.Router();// eslint-disable-line
const publicApiRouter = express.Router();// eslint-disable-line

const apiActions = { logout, nasa, userCouch };
const publicActions = { login, signup, loadAuth };

const publicActionsMap = [
  { login: { verb: 'post' } },
  { signup: { verb: 'post' } },
  { loadAuth: { verb: 'get' } }];

const handler = ({ action, params, req, res, next } = {}) =>
  action(req, params)
    .then((result) => {
      if (!result || result === undefined) {
        return res.status(500).end();
      }
      console.log('__RESU__');
      console.log(result);
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

      return res.json(result);
    })
    .catch(next);

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
    return handler({ action, params, req, res, next });
  }

  return res.status(404).end('NOT FOUND');
};

const publicApiHandler = action => (req, res, next) =>
  handler({ action, req, res, next });

const setUpRoutes = (router, actions, actionsMap) =>
  actionsMap.map(action =>
    router[action[Object.keys(action)[0]].verb](`/${Object.keys(action)[0]}`, publicApiHandler(actions[Object.keys(action)[0]])));

apiRouter.use(apiHandler());
setUpRoutes(publicApiRouter, publicActions, publicActionsMap);

export { apiRouter, publicApiRouter };
