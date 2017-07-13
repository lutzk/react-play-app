import React from 'react';
import universal from 'react-universal-component';

const loading = () => <div className="LoadingGG"></div>;
const components = {
  Home: universal(() => import(/* webpackChunkName: 'Home' */ '../containers/Home/Home'), {
    resolve: () => require.resolveWeak('../containers/Home/Home'),
    minDelay: 1, // match sliding animation duration
    loading,
    chunkName: 'Home',
  }),
  RoverView: universal(() => import(/* webpackChunkName: 'RoverView' */ '../containers/RoverView/RoverView'), {
    resolve: () => require.resolveWeak('../containers/RoverView/RoverView'),
    minDelay: 1, // match sliding animation duration
    loading,
    chunkName: 'RoverView',
  }),
  // // SolView: universal(() => import(/* webpackChunkName: 'solView' */ '../containers/RoverView/Sol'), {
  // //   resolve: () => require.resolveWeak('../containers/RoverView/Sol'),
  // //   minDelay: 1, // match sliding animation duration
  // //   loading,
  // //   chunkName: 'solView',
  // // }),
  NotFound: universal(() => import(/* webpackChunkName: 'NotFound' */ '../containers/NotFound/NotFound'), {
    resolve: () => require.resolveWeak('../containers/NotFound/NotFound'),
    minDelay: 1, // match sliding animation duration
    loading,
    chunkName: 'NotFound',
  }),
  Login: universal(() => import(/* webpackChunkName: 'Login' */'../containers/Login/Login'), {
    resolve: () => require.resolveWeak('../containers/Login/Login'),
    minDelay: 1, // match sliding animation duration
    loading,
    chunkName: 'Login',
  }),
};

const getComponent = ({ page }) => {// eslint-disable-line
  const Component = components[page] || components.NotFound;
  return <Component isLoading={false} />;
};

export { getComponent };
