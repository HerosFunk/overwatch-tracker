import React from 'react';
import { TANK_HEROES_DATA } from '../constants';
import './MatchupMatrix.css';

function MatchupMatrix({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="matchup-matrix empty">
        <p>Not enough data for matchup matrix yet. Play more games!</p>
      </div>
    );
  }

  // Get unique heroes from data (minimum 2 games)
  const qualified = data.filter(m => m.games >= 2);
  const myHeroes = [...new Set(qualified.map(m => m.myHero))];
  const oppHeroes = [...new Set(qualified.map(m => m.opponentHero))];

  if (myHeroes.length === 0 || oppHeroes.length === 0) {
    return (
      <div className="matchup-matrix empty">
        <p>Not enough matchup data yet (need 2+ games per matchup).</p>
      </div>
    );
  }

  const getMatchup = (my, opp) => {
    return qualified.find(m => m.myHero === my && m.opponentHero === opp);
  };

  const getWinrateColor = (wr) => {
    const val = parseFloat(wr);
    if (val >= 65) return '#2e7d32';
    if (val >= 55) return '#4caf50';
    if (val >= 45) return '#666';
    if (val >= 35) return '#e65100';
    return '#c62828';
  };

  return (
    <div className="matchup-matrix">
      <div className="matrix-scroll">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="matrix-corner">You vs</th>
              {oppHeroes.map(hero => (
                <th key={hero} className="matrix-col-header">
                  {TANK_HEROES_DATA[hero] ? (
                    <img src={TANK_HEROES_DATA[hero].image} alt={hero} className="matrix-hero-icon" title={hero} />
                  ) : (
                    <span className="matrix-hero-text">{hero}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myHeroes.map(myHero => (
              <tr key={myHero}>
                <td className="matrix-row-header">
                  {TANK_HEROES_DATA[myHero] ? (
                    <div className="matrix-row-hero">
                      <img src={TANK_HEROES_DATA[myHero].image} alt={myHero} className="matrix-hero-icon" />
                      <span>{myHero}</span>
                    </div>
                  ) : (
                    <span>{myHero}</span>
                  )}
                </td>
                {oppHeroes.map(oppHero => {
                  const matchup = getMatchup(myHero, oppHero);
                  return (
                    <td key={oppHero} className="matrix-cell">
                      {matchup ? (
                        <div
                          className="matrix-cell-value"
                          style={{ background: getWinrateColor(matchup.winrate) }}
                          title={`${myHero} vs ${oppHero}: ${matchup.wins}W-${matchup.losses}L (${matchup.games}g)`}
                        >
                          <span className="matrix-wr">{matchup.winrate}%</span>
                          <span className="matrix-games">{matchup.games}g</span>
                        </div>
                      ) : (
                        <div className="matrix-cell-empty">-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MatchupMatrix;
