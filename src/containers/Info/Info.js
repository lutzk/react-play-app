import React, { Component /* , PropTypes */ } from 'react';
import { Link } from 'react-router';

export default class Info extends Component {

  render() {

    return (
      <div>
        <h1>info<Link to="/home">home</Link></h1>
      </div>);
  }
}
