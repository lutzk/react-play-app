import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import './Login.sass';

export default class Login extends Component {

  static propTypes = {
    app: PropTypes.object
  };

  render() {

    return (
      <div className="login">
        <div className="login_content">
          <h1 className="login_headline">
            <Link to="/bla">aaa</Link>
            &nbsp;
            <Link to="/home">home</Link>
          </h1>
        </div>
      </div>
    );
  }
}
