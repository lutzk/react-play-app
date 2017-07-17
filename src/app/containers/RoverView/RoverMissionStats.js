import React from 'react';

const RoverMissionStats = args => {

  /*
  *  args:
  *    roverName: string
  *    missionStats: object
  */

  if (!args.missionStats || !Object.keys(args.missionStats).length) return null;

  const { missionStats, roverName } = args;
  const stats = Object.keys(missionStats).map((stat, index) => (
      <p key={index} className="roverMissionStat">
        {stat}:&nbsp;{missionStats[stat]}
      </p>)
  );

  const roverMissionStats = (
    <div className="roverMissionData">

      <h3 className="roverName">
        {roverName}
      </h3>

      <div className="roverMissionStatsWrap">

        <div className="roverAvatar">
        __roverAvatar__
        </div>

        <div className="roverMissionStats">
          {stats}
        </div>

      </div>
    </div>);

  return roverMissionStats;
};

export default RoverMissionStats;
