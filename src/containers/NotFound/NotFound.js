import React, { Component /* , PropTypes */ } from 'react';
import { Link } from 'react-router';

export default class NotFound extends Component {

  render() {

    return (
      <div>
        <h1>404&nbsp;<Link to="/home">go home</Link></h1>
      </div>);
  }
}
