import React from 'react';

// import { linkToHome } from '../../../redux/routing/navTypes.js';
import './Footer.sass';

const Footer = ({ logout }) => {
  const handleLogout = () => logout();

  const footer = (
    <div className="footer">
      <p>
        Footer &nbsp;
        <span onClick={handleLogout}>logout</span>
      </p>
    </div>
  );

  return footer;
};

export { Footer };
