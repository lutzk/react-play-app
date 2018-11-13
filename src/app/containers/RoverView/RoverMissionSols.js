import React from 'react';
import { createSolLink } from '../../redux/routing/navTypes';

const RoverMissionSols = ({ dispatch, sols, rover }) => {
  const handleLink = e => {
    e.preventDefault();
    dispatch(createSolLink({ rover, sol: e.target.dataset.sol }));
  };
  if (!sols) {
    return null;
  }

  if (!sols.length) {
    return <div className="listEmpty">no sols match</div>;
  }

  const solsCards = sols.map((sol, index) => (
    <span
      key={index}
      data-sol={sol.sol}
      className="solCard"
      onClick={handleLink}
    >
      <span className={'sol_card_sol'}>
        sol:&nbsp;
        {sol.sol}
      </span>
      <span className={'sol_card_totalPhotos'}>
        totalPhotos:&nbsp;
        {sol.totalPhotos}
      </span>
      <span className={'sol_card_cameras'}>
        cams:&nbsp;
        {sol.cameras.map((cam, j) => (
          <span key={j}>
            {cam}
            &nbsp;
          </span>
        ))}
      </span>
    </span>
  ));

  return <div className="roverPhotoData">{solsCards}</div>;
};

export default RoverMissionSols;
