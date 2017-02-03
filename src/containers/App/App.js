import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';
import { Footer } from './Footer';

import './App.sass';

@connect(
  state => ({
    app: state.app
  }),
  {})
export default class App extends Component {

  static propTypes = {
    children: PropTypes.any.isRequired,
    location: PropTypes.object.isRequired
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  getContent() {
    const { location, children } = this.props;
    const key = location.pathname;
    if (children) {
      return React.cloneElement(children, { key });
    }
    return null;
  }

  render() {

    const Content = this.getContent();
    const containerClass = cn('main_conatiner', 'container-fluid');

    return (
      <div className="root">
        <div className={containerClass}>
          {Content}
        </div>
        <Footer showFooter />
      </div>
    );
  }
}
