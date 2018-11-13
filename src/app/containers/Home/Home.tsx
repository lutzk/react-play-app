import React from 'react';
import { connect } from 'react-redux';

import { createRoverLink, linkToSpirit } from '../../redux/routing/navTypes';
import '../Home/Home.sass';

const HomeComp = ({ dispatch }) => {
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
};

export default connect()(HomeComp);
