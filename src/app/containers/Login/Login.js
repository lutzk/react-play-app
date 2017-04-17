import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { login, signup } from '../../redux/modules/user';
import PATHS from '../../../config/pathsConfig';
import './Login.sass';

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    Object.assign({}, { login, signup }),
    dispatch);

const Login = _props => { // eslint-disable-line

  const hanldeSubmit = (e) => {
    const username = e.target[0].name === 'username' ? e.target[0].value : '';
    const password = e.target[1].name === 'password' ? e.target[1].value : '';
    e.preventDefault();
    return _props.login(username, password);
  };

  const hanldeSignup = (e) => {
    // curl -X POST http://localhost:3010/auth/register -d 'name=newname&username=ausername&email=bla@bla.de&password=qqqqqqqq&confirmPassword=qqqqqqqq'
    const name = e.target[0].name === 'name' ? e.target[0].value : '';
    const username = e.target[1].name === 'username' ? e.target[1].value : '';
    const email = e.target[2].name === 'email' ? e.target[2].value : '';
    const password = e.target[3].name === 'password' ? e.target[3].value : '';
    const confirmPassword = e.target[4].name === 'confirmPassword' ? e.target[4].value : '';
    e.preventDefault();
    return _props.signup(name, username, email, password, confirmPassword);
  };

  return (
    <div className="page login">
      <div className="login_content">
        <h1 className="login_headline">
          <Link to="/bla">aaa</Link>
          &nbsp;
          <Link to={`/${PATHS.HOME}`}>home</Link>
        </h1>
        <form onSubmit={hanldeSubmit}>
          <input type="text" id="username" name="username"/>
          <input type="text" id="password" name="password"/>
          <input type="submit" value="login" />
        </form>
      </div>
      <div className="login_content">
        <h1 className="login_headline">
          signup
        </h1>
        <form onSubmit={hanldeSignup}>
        <input type="text" id="name" name="name"/>
          <input type="text" id="username" name="username"/>
          <input type="text" id="email" name="email"/>
          <input type="text" id="password" name="password"/>
          <input type="text" id="confirmPassword" name="confirmPassword"/>
          <input type="submit" value="login" />
        </form>
      </div>
    </div>
  );
};

export default connect(null, mapDispatchToProps)(Login);
