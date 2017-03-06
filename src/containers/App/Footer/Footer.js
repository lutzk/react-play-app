import React from 'react';
import { Link } from 'react-router';
import PATHS from '../../../config/pathsConfig.js';
import './Footer.sass';

const Footer = (_props) => {

  const { showFooter } = _props;

  if (!showFooter) return null;

  const footer = (
    <div className="footer">
      <p>
        Footer&nbsp;
        <Link to={`/${PATHS.HOME}`}>home</Link>
      </p>
    </div>);

  return (footer);

};

export default Footer;
