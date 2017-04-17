import React from 'react';
import { IndexRoute, Route } from 'react-router';
import {
    App,
    Login,
  } from './containers';

import PATHS from '../config/pathsConfig';
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

  const getHome = () => import(/* webpackChunkName: "home" */ './containers/Home/Home').then(m => m.default);
  const getRoverView = () => import(/* webpackChunkName: "roverView" */ './containers/RoverView/RoverView').then(m => m.default);
  const getSolView = () => import(/* webpackChunkName: "solView" */ './containers/RoverView/Sol').then(m => m.default);
  const getNotFound = () => import(/* webpackChunkName: "notFound" */ './containers/NotFound/NotFound').then(m => m.default);

  return (
    <Route path={PATHS.ROOT} component={App}>
      <IndexRoute component={Login} />
      <Route path={PATHS.LOGIN} component={Login} />
      <Route onEnter={requireLogin}>
        <Route path={PATHS.HOME} getComponent={getHome} />
        <Route path={`${PATHS.ROVER_VIEW.ROOT}(/:rover)`} getComponent={getRoverView} />
        <Route path={`${PATHS.ROVER_VIEW.ROOT}/:rover/${PATHS.SOL}/:sol`} getComponent={getSolView} />
      </Route>
      <Route path={PATHS.NOT_FOUND} getComponent={getNotFound} />
    </Route>
  );
};

export default getRoutes;
