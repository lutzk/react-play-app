import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { goToPage } from '../../redux/modules/page';
import { loadAuth, login, signup } from '../../redux/modules/user';
import { linkToHome, linkToSpirit } from '../../redux/routing/navTypes';

import '../Login/Login.sass';

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    Object.assign({}, { loadAuth, login, signup, onClick: goToPage }),
    dispatch,
  );

declare interface Props {
  path: string;
  login: any;
  signup: any;
  onClick: any;
}

class LoginComp extends React.Component<Props> {
  constructor(props) {
    super(props);

    this.hanldeSubmit = this.hanldeSubmit.bind(this);
    this.hanldeSignup = this.hanldeSignup.bind(this);
    this.handleLink = this.handleLink.bind(this);
    this.handleHomeLink = this.handleHomeLink.bind(this);
  }

  public hanldeSubmit(e) {
    const username = e.target[0].name === 'username' ? e.target[0].value : '';
    const password = e.target[1].name === 'password' ? e.target[1].value : '';
    e.preventDefault();
    return this.props.login(username, password);
  }

  public hanldeSignup(e) {
    const name = e.target[0].name === 'name' ? e.target[0].value : '';
    const username = e.target[1].name === 'username' ? e.target[1].value : '';
    const email = e.target[2].name === 'email' ? e.target[2].value : '';
    const password = e.target[3].name === 'password' ? e.target[3].value : '';
    const confirmPassword =
      e.target[4].name === 'confirmPassword' ? e.target[4].value : '';
    e.preventDefault();
    return this.props.signup(name, username, email, password, confirmPassword);
  }

  public handleLink(e) {
    e.preventDefault();
    this.props.onClick(linkToSpirit);
  }

  public handleHomeLink(e) {
    e.preventDefault();
    this.props.onClick(linkToHome);
  }

  // will execute on server render
  // fetchData() {
  //   return Promise.resolve([loadAuth, signup]);
  // }

  public render() {
    return (
      <div className="page login">
        <div className="login_content">
          <h1 className="login_headline">
            <span onClick={this.handleHomeLink}>home</span>
            &nbsp;
            <span onClick={this.handleLink}>Rover View</span>
          </h1>
          <form onSubmit={this.hanldeSubmit}>
            <div className="has-float-label">
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Username"
              />
              <label htmlFor="username">_Username_</label>
            </div>
            <div className="has-float-label">
              <input
                type="text"
                id="password"
                name="password"
                placeholder="Password"
              />
              <label htmlFor="password">Password</label>
            </div>
            <input type="submit" value="login" />
          </form>
        </div>
        <div className="login_content">
          <h1 className="login_headline">signup</h1>
          <form onSubmit={this.hanldeSignup}>
            <input type="text" id="name" name="name" />
            <input type="text" id="username" name="username" />
            <input type="text" id="email" name="email" />
            <input type="text" id="password" name="password" />
            <input type="text" id="confirmPassword" name="confirmPassword" />
            <input type="submit" value="login" />
          </form>
        </div>
      </div>
    );
  }
}

export default connect(
  null,
  mapDispatchToProps,
)(LoginComp);
