import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Link from 'redux-first-router-link';

import { goToPage } from '../../redux/modules/page';
import { login, signup, loadAuth } from '../../redux/modules/user';
import { linkToHome, linkToSpirit } from '../../redux/routing/navTypes';
// import { PATHS } from '../../redux/routing/nav';

import '../../style/Login.sass';

// const active = (currentPath, path) =>
//   currentPath === path ? 'Activo' : '';

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    Object.assign({}, { loadAuth, login, signup, onClick: goToPage }),
    dispatch);

const mapState = ({ location }) => ({ path: location.pathname });

class LoginComp extends Component {

  static propTypes = {
    path: PropTypes.string,
    login: PropTypes.func,
    signup: PropTypes.func,
    onClick: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.hanldeSubmit = ::this.hanldeSubmit;
    this.hanldeSignup = ::this.hanldeSignup;
  }

  hanldeSubmit(e) {
    const username = e.target[0].name === 'username' ? e.target[0].value : '';
    const password = e.target[1].name === 'password' ? e.target[1].value : '';
    e.preventDefault();
    return this.props.login(username, password);
  }

  hanldeSignup(e) {
    const name = e.target[0].name === 'name' ? e.target[0].value : '';
    const username = e.target[1].name === 'username' ? e.target[1].value : '';
    const email = e.target[2].name === 'email' ? e.target[2].value : '';
    const password = e.target[3].name === 'password' ? e.target[3].value : '';
    const confirmPassword = e.target[4].name === 'confirmPassword' ? e.target[4].value : '';
    e.preventDefault();
    return this.props.signup(name, username, email, password, confirmPassword);
  }

  // will execute on server render
  // fetchData() {
  //   return Promise.resolve([loadAuth, signup]); // eslint-disable-line
  // }

  render() {
    return (
      <div className="page login">
        <div className="login_content">
          <h1 className="login_headline">
            <Link to="/bla">aaa</Link>
            &nbsp;
            <Link to={linkToHome}>home</Link>
            &nbsp;
            <Link to={linkToSpirit}>Rover - Spirit</Link>
            &nbsp;
            <span
              onClick={() => this.props.onClick(linkToSpirit)}>
              Rover View
            </span>
          </h1>
          <form onSubmit={this.hanldeSubmit}>
            <div className="has-float-label">
              <input type="text" id="username" name="username" placeholder="Username"/>
              <label htmlFor="username">_Username_</label>
            </div>
            <div className="has-float-label">
              <input type="text" id="password" name="password" placeholder="Password"/>
              <label htmlFor="password">Password</label>
            </div>
            <input type="submit" value="login" />
          </form>
        </div>
        <div className="login_content">
          <h1 className="login_headline">
            signup
          </h1>
          <form onSubmit={this.hanldeSignup}>
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
  }
}

// const Login = connect(mapState, mapDispatchToProps)(LoginComp);
export default connect(mapState, mapDispatchToProps)(LoginComp);
