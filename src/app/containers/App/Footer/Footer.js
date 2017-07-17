import React from 'react';
import Link from 'redux-first-router-link';

import { HOME } from '../../../redux/reduxRouterFirst/nav.js';
import './Footer.sass';

const Footer = args => {

  const { showFooter, logout } = args;

  if (!showFooter) return null;

  const handleLogout = () => logout();

  const footer = (
    <div className="footer">
      <p>
        Footer
        &nbsp;
        <Link to={{ type: HOME }}>home</Link>
        &nbsp;
        <span onClick={handleLogout}>logout</span>
      </p>
    </div>);

  return (footer);

};

export { Footer };
