import React from 'react';
import { IndexRoute, Route } from 'react-router';
import {
    App,
    Login
  } from './containers';

import ROUTES from './routes_config';

export default function () {

  // const _getComp = (path) => {
  //   // `${}` breakes build completely - webpack bug?
  //   return import(`${path}`).then((m) => { return m.default; });
  // };
  const getHome = () => {
    return import('./containers/Home/Home').then((m) => { return m.default; });
  };

  const getNo = () => {
    return import('./containers/NotFound/NotFound').then((l) => { return l.default; });
  };

  return (
    <Route path={ROUTES.ROOT} component={App}>
      <IndexRoute component={Login} />
      <Route path={ROUTES.LOGIN} component={Login} />
      <Route path={ROUTES.HOME} getComponent={getHome} />
      <Route path={ROUTES.CATCH_ALL} getComponent={getNo} />
    </Route>
  );
}
