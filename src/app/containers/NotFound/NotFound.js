import React from 'react';
import Link from 'redux-first-router-link';
import { linkToHome } from '../../redux/routing/navTypes';

const NotFound = () => (
  <div className="page NotFound">
    <h1>404&nbsp;<Link to={linkToHome}>go home</Link></h1>
  </div>);

export default NotFound;
