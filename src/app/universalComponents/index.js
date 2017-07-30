import React from 'react';
import universal from 'react-universal-component';

const loading = () => <div className="LoadingGG"></div>;
const setOptions = chunkName => ({
  loading,
  chunkName,
  minDelay: 0,
});

const components = {
  Home: universal(import('../containers/Home/Home'), {
    resolve: () => require.resolveWeak('../containers/Home/Home'),
    ...setOptions('Home'),
  }),

  RoverView: universal(import('../containers/RoverView/RoverView'), {
    resolve: () => require.resolveWeak('../containers/RoverView/RoverView'),
    ...setOptions('RoverView'),
  }),

  // // SolView: universal(() => import(/* webpackChunkName: 'solView' */ '../containers/RoverView/Sol'), {
  // //   resolve: () => require.resolveWeak('../containers/RoverView/Sol'),
  // //   minDelay: 1, // match sliding animation duration
  // //   loading,
  // //   chunkName: 'solView',
  // // }),

  NotFound: universal(import('../containers/NotFound/NotFound'), {
    resolve: () => require.resolveWeak('../containers/NotFound/NotFound'),
    ...setOptions('NotFound'),
  }),

  Login: universal(import('../containers/Login/Login'), {
    resolve: () => require.resolveWeak('../containers/Login/Login'),
    ...setOptions('Login'),
  }),
};

const getComponent = ({ page, isLoading }) => {// eslint-disable-line
  const Component = components[page] || components.NotFound;
  return <Component isLoading={false} />;
};

export { getComponent };
