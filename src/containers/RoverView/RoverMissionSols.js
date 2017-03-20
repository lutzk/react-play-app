import React from 'react';
import { Link } from 'react-router';
import PATHS from '../../config/pathsConfig';

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

  // const handleClick = (e) => {
  //   const sol = e.currentTarget.dataset.sol;

  //   if (!sol) {
  //     return;
  //   }

  //   input.push(`/sol/${sol}`);
  // };

  const { rover, sols } = input;

  const solsCards = sols.map((sol, index) => (
      // eslint-disable-next-line
      <Link key={index} data-sol={sol.sol} className="solCard" to={`/${PATHS.ROVER_VIEW.ROOT}/${rover}/${PATHS.SOL}/${sol.sol}`}>
        {Object.keys(sol).map((key, i) => {
          if (typeof sol[key] === 'string' || typeof sol[key] === 'number') {
            return (
              <span key={i} className={`sol_card_${key}`}>{key}:&nbsp;{sol[key]}</span>);
          }
          if (typeof sol[key] === 'object' && key === 'cameras') {
            return (
              <span key={i} className={`sol_card_${key}`}>
                cams:&nbsp;
                {sol.cameras.map((cam, j) => (
                  <span key={j}>{cam}&nbsp;</span>)
                )}
              </span>);
          }
          return 1;
        })}
      </Link>
    )
 );

  return (
    <div className="roverPhotoDataData">
      {solsCards}
    </div>);
};

export default RoverMissionSols;
