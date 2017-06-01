import React from 'react';
import { Link } from 'react-router';
import { PATHS } from '../../../config/pathsConfig';

const RoverMissionSols = (input) => {

  /*
  * input:
  *  rover: string
  *  sols: array
  */

  if (!input.sols) {
    return null;
  }

  if (!input.sols.length) {
    return <div className="listEmpty">no sols match</div>;
  }

  const { rover, sols } = input;

  const solsCards = sols.map((sol, index) => (
    <Link key={index} data-sol={sol.sol} className="solCard" to={`/${PATHS.ROVER_VIEW.ROOT}/${rover}/${PATHS.SOL}/${sol.sol}`}>
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
    <div className="roverPhotoDataData">
      {solsCards}
    </div>);
};

export default RoverMissionSols;
