import React, { memo } from 'react';

interface Props {
  missionStats: any;
  roverName: string;
}

const RoverMissionStats: React.SFC<Props> = memo(
  ({ missionStats, roverName }) => {
    if (!missionStats || !Object.keys(missionStats).length) {
      return null;
    }

    const stats = Object.keys(missionStats).map((stat, index) => (
      <p key={index} className="roverMissionStat">
        {stat}
        :&nbsp;
        {missionStats[stat]}
      </p>
    ));

    const roverMissionStats = (
      <div className="roverMissionData">
        <h3 className="roverName">{roverName}</h3>

        <div className="roverMissionStatsWrap">
          <div className="roverAvatar">__roverAvatar__</div>

          <div className="roverMissionStats">{stats}</div>
        </div>
      </div>
    );

    return roverMissionStats;
  },
);

export default RoverMissionStats;
