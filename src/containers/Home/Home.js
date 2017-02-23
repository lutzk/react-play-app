import React from 'react';
import { Link } from 'react-router';
import PATHS from '../../config/pathsConfig.js';
import './Home.sass';

const Home = () => {
  return (
    <div className="home">
      <h1>home</h1>
      <p>
        <Link to={PATHS.ROOT}>root</Link>
        &nbsp;
        <Link to={`/${PATHS.ROVER_VIEW}/Spirit`}>RoverView Spirit</Link>
      </p>
    </div>);
};

export default Home;
