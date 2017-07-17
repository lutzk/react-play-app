import React from 'react';
import Link from 'redux-first-router-link';
import { ROVER_VIEW } from '../../redux/reduxRouterFirst/nav';
import './Home.sass';

const linkToSpirit = { type: ROVER_VIEW, payload: { rover: 'Spirit' } };
const Home = () => (
  <div className="page home">
    <h1>home</h1>
    <p>
      <Link to={linkToSpirit}>RoverView (rover = "Spirit")</Link>
    </p>
  </div>);

export default Home;
