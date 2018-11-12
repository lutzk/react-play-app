import React, { Component, StrictMode } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { goToPage } from '../../redux/modules/page';
import { loadAuth, logout } from '../../redux/modules/user';

import { Footer } from './Footer';
import { Loader } from './Loader/Loader';
import UniversalComponent from './UniversalComponent';

import './App.sass';

const mapStateToProps = state => ({
  page: state.page,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators({ ...{ loadAuth, logout, goToPage } }, dispatch);

declare interface Props {
  page: string;
  logout: any;
  loadAuth: any; // PropTypes.func,
  goToPage: any; // PropTypes.func,
}

class AppComponent extends Component<Props> {
  public componentDidMount() {
    this.props.loadAuth();
  }

  public componentDidCatch(err, info) {
    console.log('___ERROR CATCHED__', err, info);
  }

  public render() {
    console.log('___RENDER__');
    return (
      <StrictMode>
        <div className="app">
          <Loader />
          <UniversalComponent />
          <Footer logout={this.props.logout} />
        </div>
      </StrictMode>
    );
  }
}

const connectedApp = connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true },
  // { forwardRef: true },
)(AppComponent);

const App = __DEVELOPMENT__ ? hot(module)(connectedApp) : connectedApp;
export { App };
