import React, { Component /* , PropTypes */ } from 'react';
import { Link } from 'react-router';
import './home.sass';

export default class Home extends Component {

  render() {

    return (
      <div className="home">
        <h1>home&nbsp;<Link to="/">login</Link>&nbsp;<Link to="/info">info</Link></h1>
      </div>);
  }
}
