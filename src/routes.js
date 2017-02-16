import React from 'react';
import { IndexRoute, Route } from 'react-router';
import {
    App,
    Login
  } from './containers';

import PATHS from './pathsConfig';

export default function () {

  const getHome = () => {
    return import('./containers/Home/Home').then((m) => { return m.default; });
  };

  const getInfo = () => {
    return import('./containers/Info/Info').then((m) => { return m.default; });
  };

  const getNotFound = () => {
    return import('./containers/NotFound/NotFound').then((m) => { return m.default; });
  };

  return (
    <Route path={PATHS.ROOT} component={App}>
      <IndexRoute component={Login} />
      <Route path={PATHS.LOGIN} component={Login} />
      <Route path={PATHS.HOME} getComponent={getHome} />
      <Route path={PATHS.INFO} getComponent={getInfo} />
      <Route path={PATHS.NOT_FOUND} getComponent={getNotFound} />
    </Route>
  );
}
