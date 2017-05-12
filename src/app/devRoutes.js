import React from 'react';
import { Route } from 'react-router';
import { PATHS } from '../config/pathsConfig';

import Home from './containers/Home/Home';
import RoverView from './containers/RoverView/RoverView';
import SolView from './containers/RoverView/Sol';
import NotFound from './containers/NotFound/NotFound';

const HomeRoute = <Route path={PATHS.HOME} component={Home} />;
const RoverViewRoute = <Route path={`${PATHS.ROVER_VIEW.ROOT}(/:rover)`} component={RoverView} />;
const SolViewRoute = <Route path={`${PATHS.ROVER_VIEW.ROOT}/:rover/${PATHS.SOL}/:sol`} component={SolView} />;
const NotFoundRoute = <Route path={PATHS.NOT_FOUND} component={NotFound} />;

export {
  HomeRoute,
  RoverViewRoute,
  SolViewRoute,
  NotFoundRoute,
};
