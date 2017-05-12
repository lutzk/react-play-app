import React from 'react';
import { IndexRoute, Route } from 'react-router';
import {
    App,
    Login,
  } from './containers';

import { PATHS } from '../config/pathsConfig';
import { loadAuth, isLoaded, killUser } from './redux/modules/user';// eslint-disable-line

const getRoutes = (store) => {

  const requireLogin = (nextState, replace, cb) => {
    function checkAuth() {
      const { user: { user } } = store.getState();
      if (!user) {
        const target = nextState.location.pathname.substring(0, 6) !== PATHS.LOGIN ? `/${PATHS.LOGIN}` : `/${PATHS.LOGIN}`;
        replace({
          pathname: target,
          state: { nextPathname: nextState.location.pathname },
        });
      }
      cb();
    }

    if (!isLoaded(store.getState())) {
      store.dispatch(loadAuth()).then(() => checkAuth());
    } else {
      checkAuth();
    }
  };

  const routesPath = __DEVELOPMENT__ ? 'dev' : 'prod';
  const HomeRoute = require(`./${routesPath}Routes`).HomeRoute;// eslint-disable-line
  const RoverViewRoute = require(`./${routesPath}Routes`).RoverViewRoute;// eslint-disable-line
  const SolViewRoute = require(`./${routesPath}Routes`).SolViewRoute;// eslint-disable-line
  const NotFoundRoute = require(`./${routesPath}Routes`).NotFoundRoute;// eslint-disable-line

  return (
    <Route path={PATHS.ROOT} component={App}>
      <IndexRoute component={Login} />
      <Route path={PATHS.LOGIN} component={Login} />
      <Route onEnter={requireLogin}>
        { HomeRoute }
        { RoverViewRoute }
        { SolViewRoute }
      </Route>
      { NotFoundRoute }
    </Route>
  );
};

export { getRoutes };
