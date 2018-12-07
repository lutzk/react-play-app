import React, { memo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { goToPage } from '../../redux/modules/page';
import { loadAuth, login, signup } from '../../redux/modules/user';
import { linkToHome, linkToSpirit } from '../../redux/routing/navHelpers';

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

const LoginComp: React.SFC<Props> = memo(({ login, signup, onClick }) => {
  const hanldeSubmit = e => {
    const username =
      e.currentTarget[0].name === 'username' ? e.currentTarget[0].value : '';
    const password =
      e.currentTarget[1].name === 'password' ? e.currentTarget[1].value : '';
    e.preventDefault();
    return login(username, password);
  };

  const hanldeSignup = e => {
    const name =
      e.currentTarget[0].name === 'name' ? e.currentTarget[0].value : '';
    const username =
      e.currentTarget[1].name === 'username' ? e.currentTarget[1].value : '';
    const email =
      e.currentTarget[2].name === 'email' ? e.currentTarget[2].value : '';
    const password =
      e.currentTarget[3].name === 'password' ? e.currentTarget[3].value : '';
    const confirmPassword =
      e.currentTarget[4].name === 'confirmPassword'
        ? e.currentTarget[4].value
        : '';
    e.preventDefault();
    return signup(name, username, email, password, confirmPassword);
  };

  const handleLink = e => {
    e.preventDefault();
    onClick(linkToSpirit);
  };

  const handleHomeLink = e => {
    e.preventDefault();
    onClick(linkToHome);
  };

  return (
    <div className="page login">
      <div className="login_content">
        <h1 className="login_headline">
          <span onClick={handleHomeLink}>home</span>
          &nbsp;
          <span onClick={handleLink}>Rover View</span>
        </h1>
        <form onSubmit={hanldeSubmit}>
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
        <form onSubmit={hanldeSignup}>
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
});

export default connect(
  null,
  mapDispatchToProps,
)(LoginComp);
