import React from 'react';
import { Link } from 'react-router';
import PATHS from '../../config/pathsConfig';
import './Login.sass';

const Login = () => (
  <div className="page login">
    <div className="login_content">
      <h1 className="login_headline">
        <Link to="/bla">aaa</Link>
        &nbsp;
        <Link to={`/${PATHS.HOME}`}>home</Link>
      </h1>
    </div>
  </div>
);

export default Login;
