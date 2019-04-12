import '../../../config/rhlc';
// tslint:disable-next-line:ordered-imports
import React, { Component, StrictMode } from 'react';
import { hot } from 'react-hot-loader/root';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { goToPage } from '../../redux/modules/page';
import { loadAuth, logout } from '../../redux/modules/user';

import { Footer } from './Footer';
import { Loader } from './Loader/Loader';
import UniversalComponent from './UniversalComponent';

import './App.sass';

const mapDispatchToProps = dispatch =>
  bindActionCreators({ ...{ loadAuth, logout, goToPage } }, dispatch);

declare interface Props {
  logout: any;
  loadAuth: any;
  goToPage: any;
}

declare interface State {
  hasError: boolean;
}

class AppComponent extends Component<Props, State> {
  public static getDerivedStateFromError(error) {
    console.log('___ERROR DERIVED CATCHED__', error);
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  public componentDidMount() {
    console.log('___MOUNT__JO__');
    // this.props.loadAuth();
  }

  public componentDidCatch(err, info) {
    console.log('___ERROR CATCHED__', err, info);
  }

  public render() {
    console.log('___RENDER___', JSON.stringify(this.props, null, 2));
    if (this.state.hasError) {
      return <div>ERROR</div>;
    }
    return (
      <StrictMode>
        <>
          <Loader />
          <UniversalComponent />
          <Footer logout={this.props.logout} />
        </>
      </StrictMode>
    );
  }
}

const connectedApp = connect(
  null,
  mapDispatchToProps,
  null,
  { forwardRef: true },
)(AppComponent);

const App = __DEVELOPMENT__ ? hot(connectedApp) : connectedApp;

export default App;
