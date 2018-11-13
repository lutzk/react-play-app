import React from 'react';
import { connect } from 'react-redux';
import { linkToHome } from '../../redux/routing/navTypes';

const NotFoundComp = ({ dispatch }) => {
  const handleHomeLink = () => {
    dispatch(linkToHome);
  };
  return (
    <div className="page NotFound">
      <h1>
        404&nbsp;
        <span onClick={handleHomeLink}>go home</span>
      </h1>
    </div>
  );
};

export default connect()(NotFoundComp);
