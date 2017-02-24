import React from 'react';
import { Link } from 'react-router';
import PATHS from '../../config/pathsConfig';

const NotFound = () => (
  <div>
    <h1>404&nbsp;<Link to={`/${PATHS.HOME}`}>go home</Link></h1>
  </div>);

export default NotFound;
