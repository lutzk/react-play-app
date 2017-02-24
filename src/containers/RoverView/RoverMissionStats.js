import React from 'react';

const RoverMissionStats = (_props) => {

  /*
  *  _props:
  *    roverName: string
  *    missionStats: object
  */

  if (!_props.missionStats) return null;

  const { missionStats, roverName } = _props;
  const stats = Object.keys(missionStats).map((stat, index) => (
      <div key={index} className="roverMissionStatsCard">
        {stat}:&nbsp;{missionStats[stat]}
      </div>)
  );

  const roverMissionStats = (
    <div className="roverMissionStatsWrap">
      <h3 className="roverName">
        {roverName}
      </h3>
      <div className="roverAvatar">
        __roverAvatar__
      </div>
      <div className="roverMissionStats">
        {stats}
      </div>
    </div>);

  return roverMissionStats;
};

export default RoverMissionStats;
