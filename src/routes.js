import React from 'react';
import { IndexRoute, Route } from 'react-router';
import {
    App,
    Login,
  } from './containers';

import PATHS from './config/pathsConfig';

const getRoutes = () => {

 /*
 const _getComponent = () => {

    // with string concat:
    //   on navigating there:
    //     Uncaught Error: Cannot find module './containers/Home/Home'.
    // code:
    const _path = './containers/Home/Home.js';// eslint-disable-line
    return () => import('' + _path).then((m) => { return m.default; });// eslint-disable-line

    // on compilation:
    //   WARNING in ./src async ^.*$
    //   Module not found: Error: [CaseSensitivePathsPlugin] `/Users/jonny/Desktop/do/src/containers/Home/home.js` does not match the corresponding path on disk `Home.js`.
    // code:
    // const _path = `./containers/${path}`;
    // return () => import(`${_path}`).then((m) => { return m.default; });
  };
  */

  // const getHome = _getComponent();

  const getHome = () => import(/* webpackChunkName: "home" */ './containers/Home/Home').then(m => m.default);
  const getRoverView = () => import(/* webpackChunkName: "roverView" */ './containers/RoverView/RoverView').then(m => m.default);
  const getSolView = () => import(/* webpackChunkName: "solView" */ './containers/RoverView/Sol').then(m => m.default);
  const getNotFound = () => import(/* webpackChunkName: "notFound" */ './containers/NotFound/NotFound').then(m => m.default);

  return (
    <Route path={PATHS.ROOT} component={App}>
      <IndexRoute component={Login} />
      <Route path={PATHS.LOGIN} component={Login} />
      <Route path={PATHS.HOME} getComponent={getHome} />
      <Route path={`${PATHS.ROVER_VIEW.ROOT}(/:rover)`} getComponent={getRoverView} />
      <Route path={`${PATHS.ROVER_VIEW.ROOT}/:rover/${PATHS.SOL}/:sol`} getComponent={getSolView} />
      <Route path={PATHS.NOT_FOUND} getComponent={getNotFound} />
    </Route>
  );
};

export default getRoutes;
