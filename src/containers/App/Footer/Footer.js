import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import './Footer.sass';

export default class Footer extends Component {

  static propTypes = {
    showFooter: PropTypes.bool.isRequired
  };

  render() {

    const { showFooter } = this.props;

    if (showFooter) {
      const footer = (
        <div className="footer">
          Foo&nbsp;
          <Link to="/home">home</Link>
        </div>
      );
      return (footer);
    }
    return null;
  }
}
