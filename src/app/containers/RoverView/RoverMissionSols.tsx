import React, { memo } from 'react';

interface Props {
  createSolLink: any;
  sols: any;
  rover: string;
}

const RoverMissionSols: React.SFC<Props> = memo(
  ({ createSolLink, sols, rover }) => {
    const handleLink = e => {
      e.preventDefault();
      createSolLink({ rover, sol: e.currentTarget.dataset.sol });
    };
    if (!sols) {
      return null;
    }

    if (!sols.length) {
      return <div className="listEmpty">no sols match</div>;
    }

    const solsCards = sols.map(sol => (
      <span
        key={sol.sol}
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
          {sol.cameras.map(cam => (
            <span key={cam}>
              {cam}
              &nbsp;
            </span>
          ))}
        </span>
      </span>
    ));

    return <div className="roverPhotoData">{solsCards}</div>;
  },
);

// export default React.memo(RoverMissionSols);
export default RoverMissionSols;
