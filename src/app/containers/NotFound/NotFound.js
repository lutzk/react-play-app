import React from 'react';
import Link from 'redux-first-router-link';
import { HOME } from '../../redux/reduxRouterFirst/nav';

const NotFound = () => (
  <div className="page NotFound">
    <h1>404&nbsp;<Link to={{ type: HOME }}>go home</Link></h1>
  </div>);

export default NotFound;
