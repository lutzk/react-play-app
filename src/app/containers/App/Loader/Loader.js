import React from 'react';
import cn from 'classnames';
import './Loader.sass';

export const Loader = (_props) => { // eslint-disable-line
  if (!_props.mount) {
    return null;
  }

  const globalLoadClass = cn(
    'global_load',
    {
      loading: _props.loading && !_props.loadEnded,
      loadEnded: _props.loadEnded && !_props.loading,
      loadError: _props.loadError,
    });

  const bar = (
    <div className={globalLoadClass}>
      <div className="bar" />
    </div>);

  return bar;
};
