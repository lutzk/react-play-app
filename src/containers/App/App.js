import React, { Component, PropTypes } from 'react';
import { asyncConnect } from 'redux-connect';
// import cn from 'classnames';
import { Footer } from './Footer';
import { Loader } from './Loader/Loader';

import './App.sass';

let mounted = false;


const mapStateToProps = state => ({
  loading: state.pageLoadBar.loading,
  loadEnd: state.pageLoadBar.loadEnded,
  loadError: state.pageLoadBar.error,
});

@asyncConnect([{
  key: 'App',
  promise: () => 'App',
}],
mapStateToProps)
export default class App extends Component {

  static propTypes = {
    children: PropTypes.any.isRequired,
    location: PropTypes.object.isRequired,
    loading: PropTypes.bool,
    loadError: PropTypes.bool,
    loadEnded: PropTypes.bool,
  };

  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  // constructor(props) {
  //   super(props);
  // }

  componentDidMount() {
    mounted = true;
  }

  componentWillUnMount() {
    mounted = false;
  }

  getContent() {
    const { location, children } = this.props;
    const key = location.pathname;
    if (children) {
      return React.cloneElement(children, { key });
    }
    return React.cloneElement(<div className="page loading" />, { key });
    // return null;
  }

  render() {

    const content = this.getContent();
    const loaderProps = {
      mount: mounted,
      loading: this.props.loading,
      loadEnd: this.props.loadEnded,
      loadError: this.props.loadError,
    };

    return (
      <div className="app">
        <Loader { ...loaderProps } />
        {content}
        <Footer showFooter />
      </div>
    );
  }
}
