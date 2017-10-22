import React from 'react';
import Link from 'redux-first-router-link';
import { linkToSpirit } from '../../redux/routing/navTypes';
import '../Home/Home.sass';

const Home = () => (
  <div className="page home">
    <h1>home</h1>
    <p>
      <Link to={linkToSpirit}>RoverView (rover = "Spirit")</Link>
    </p>
  </div>);

export default Home;
