import React, { memo } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import {
  linkToHome,
  linkToLogin,
  linkToSpirit,
  createRoverLink,
} from '../../redux/routing/navHelpers';
import '../Home/Home.sass';

interface Props {
  dispatch: Dispatch;
}

const HomeComp: React.SFC<Props> = memo(({ dispatch }) => {
  const handleSpiritLink = () => {
    dispatch(linkToSpirit);
  };
  const handleCuriosityLink = () => {
    dispatch(createRoverLink({ rover: 'curiosity' }));
  };
  const handleOpportunityLink = () => {
    dispatch(createRoverLink({ rover: 'opportunity' }));
  };
  return (
    <div className="page home">
      <h1>home</h1>
      <p>
        <span onClick={() => dispatch(linkToLogin)}>Login</span>
      </p>
      <p>
        <span onClick={() => dispatch(linkToHome)}>Home</span>
      </p>
      <p>
        <span onClick={handleSpiritLink}>RoverView (rover = "Spirit")</span>
      </p>
      <p>
        <span onClick={handleCuriosityLink}>
          RoverView (rover = "Curiosity")
        </span>
      </p>
      <p>
        <span onClick={handleOpportunityLink}>
          RoverView (rover = "Opportunity")
        </span>
      </p>
    </div>
  );
});

export default connect()(HomeComp);
