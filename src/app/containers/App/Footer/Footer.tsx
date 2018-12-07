import React, { memo } from 'react';

// import { linkToHome } from '../../../redux/routing/navTypes.js';
import './Footer.sass';

interface Props {
  logout: any;
}

const Footer: React.SFC<Props> = memo(({ logout }) => {
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
});

export { Footer };
