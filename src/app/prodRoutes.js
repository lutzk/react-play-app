import React from 'react';
import { Route } from 'react-router';
import { PATHS } from '../config/pathsConfig';

const getHome = () => import(/* webpackChunkName: "home" */ './containers/Home/Home').then(m => m.default);
const getRoverView = () => import(/* webpackChunkName: "roverView" */ './containers/RoverView/RoverView').then(m => m.default);
const getSolView = () => import(/* webpackChunkName: "solView" */ './containers/RoverView/Sol').then(m => m.default);
const getNotFound = () => import(/* webpackChunkName: "notFound" */ './containers/NotFound/NotFound').then(m => m.default);

const HomeRoute = <Route path={PATHS.HOME} getComponent={getHome} />;
const RoverViewRoute = <Route path={`${PATHS.ROVER_VIEW.ROOT}(/:rover)`} getComponent={getRoverView} />;
const SolViewRoute = <Route path={`${PATHS.ROVER_VIEW.ROOT}/:rover/${PATHS.SOL}/:sol`} getComponent={getSolView} />;
const NotFoundRoute = <Route path={PATHS.NOT_FOUND} getComponent={getNotFound} />;

export {
  HomeRoute,
  RoverViewRoute,
  SolViewRoute,
  NotFoundRoute,
};
