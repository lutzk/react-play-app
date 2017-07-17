import React from 'react';
import cn from 'classnames';
import './Loader.sass';

export const Loader = (args) => { // eslint-disable-line
  if (!args.mount) {
    return null;
  }

  const globalLoadClass = cn(
    'global_load',
    {
      loading: args.loading && !args.loadEnded,
      loadEnded: args.loadEnded && !args.loading,
      loadError: args.loadError,
    });

  const bar = (
    <div className={globalLoadClass}>
      <div className="bar" />
    </div>);

  return bar;
};
