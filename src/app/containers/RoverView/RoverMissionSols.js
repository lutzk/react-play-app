import React from 'react';
import Link from 'redux-first-router-link';
import { createSolLink } from '../../redux/reduxRouterFirst/navTypes';

const RoverMissionSols = args => {

  /*
  * args:
  *  rover: string
  *  sols: array
  */

  if (!args.sols) {
    return null;
  }

  if (!args.sols.length) {
    return <div className="listEmpty">no sols match</div>;
  }

  const { rover, sols } = args;

  const solsCards = sols.map((sol, index) => (
    <Link key={index} data-sol={sol.sol} className="solCard" to={createSolLink({ rover, sol: sol.sol })}>
      <span className={'sol_card_sol'}>sol:&nbsp;{sol.sol}</span>
      <span className={'sol_card_totalPhotos'}>totalPhotos:&nbsp;{sol.totalPhotos}</span>
      <span className={'sol_card_cameras'}>
        cams:&nbsp;
        {sol.cameras.map((cam, j) => (
          <span key={j}>{cam}&nbsp;</span>)
        )}
      </span>
    </Link>));

  return (
    <div className="roverPhotoData">
      {solsCards}
    </div>);
};

export default RoverMissionSols;
