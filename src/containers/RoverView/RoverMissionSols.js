import React from 'react';
import { Link } from 'react-router';

const RoverMissionSols = (input) => {
  if (!input.sols) {
    return null;
  }

  // const handleClick = (e) => {
  //   console.log(`clicked: ${e}`);
  //   // input.push({
  //   //   pathname: '/sol/3'
  //   // });
  // };

  const sols = input.sols.map((sol, index) => (
      // eslint-disable-next-line
      <div key={index} className="solCard">
        <Link to={'sol/3'}>sol 3</Link>
        {Object.keys(sol).map((key, i) => {
          if (typeof sol[key] === 'string' || typeof sol[key] === 'number') {
            return (
              <div key={i} className={`sol_card_${key}`}>{key}:&nbsp;{sol[key]}</div>);
          }
          if (typeof sol[key] === 'object' && key === 'cameras') {
            return (
              <div key={i} className={`sol_card_${key}`}>
                cams:&nbsp;
                {sol.cameras.map((cam, j) => (
                  <span key={j}>{cam}&nbsp;</span>)
                )}
              </div>);
          }
          return 1;
        })}
      </div>
    )
 );

  return (
    <div className="roverPhotoDataData">
      {sols}
    </div>);
};

export default RoverMissionSols;
