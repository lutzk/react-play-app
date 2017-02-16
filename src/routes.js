import React from 'react';
import { IndexRoute, Route } from 'react-router';
import {
    App,
    Login
  } from './containers';

import PATHS from './pathsConfig';

export default function () {

  /*
  const _getComponent = (path) => {

    // with string concat:
    //   on navigating there:
    //     Uncaught Error: Cannot find module './containers/Home/Home'.
    // code:
    // const _path = './containers/' + path;// eslint-disable-line
    // return () => import(_path).then((m) => { return m.default; });// eslint-disable-line

    // on compilation:
    //   WARNING in ./src async ^.*$
    //   Module not found: Error: [CaseSensitivePathsPlugin] `/Users/jonny/Desktop/do/src/containers/Home/home.js` does not match the corresponding path on disk `Home.js`.
    // code:
    // const _path = `./containers/${path}`;
    // return () => import(`${_path}`).then((m) => { return m.default; });
  };
  */

  // const _getHome = _getComponent('Home/Home');

  const getHome = () => import('./containers/Home/Home').then((m) => { return m.default; });
  const getInfo = () => import('./containers/Info/Info').then((m) => { return m.default; });
  const getNotFound = () => import('./containers/NotFound/NotFound').then((m) => { return m.default; });

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
