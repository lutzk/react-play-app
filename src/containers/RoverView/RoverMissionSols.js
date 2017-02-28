import React from 'react';

const RoverMissionSols = (input) => {

  /*
  * input:
  *  sols: array
  *  push: func
  */

  if (!input.sols) {
    return null;
  }

  const handleClick = (e) => {
    const sol = e.target.dataset.sol;

    if (!sol) {
      return;
    }

    input.push(`/sol/${sol}`);
  };

  const sols = input.sols.map((sol, index) => (
      // eslint-disable-next-line
      <div key={index} data-sol={sol.sol} className="solCard" onClick={handleClick}>
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
