import React, { memo } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { linkToHome } from '../../redux/routing/navHelpers';

interface Props {
  dispatch: Dispatch;
}

const NotFoundComp: React.SFC<Props> = memo(({ dispatch }) => {
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
});

export default connect()(NotFoundComp);
