import React, { Component /* , PropTypes */ } from 'react';
import { Link } from 'react-router';

export default class Home extends Component {

  render() {

    return (
      <div>
        <h1>home&nbsp;<Link to="/">login</Link>&nbsp;<Link to="/info">info</Link></h1>
      </div>);
  }
}
