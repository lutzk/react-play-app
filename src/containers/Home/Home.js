import React, { Component /* , PropTypes */ } from 'react';
import { Link } from 'react-router';
import './Home.sass';

export default class Home extends Component {

  render() {

    return (
      <div className="home">
        <h1>home</h1>
        <p>
          <Link to="/">login</Link>
          &nbsp;
          <Link to="/info">info</Link>
        </p>
      </div>);
  }
}
