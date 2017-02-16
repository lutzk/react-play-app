import React, { Component /* , PropTypes */ } from 'react';
import { Link } from 'react-router';

export default class Info extends Component {

  render() {

    return (
      <div>
        <h1>info&nbsp;<Link to="/home">go home</Link></h1>
      </div>);
  }
}
