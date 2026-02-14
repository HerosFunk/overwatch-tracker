import React from 'react';
import { getMapImage, TANK_HEROES_DATA, getRankColor } from '../constants';
import './GameHistory.css';

function GameDetail({ game, onBack }) {
  const mapData = getMapImage(game.map);
  const heroesBySide = game.heroesPlayedBySide || { attack: [], defense: [] };
  const allHeroes = game.heroesPlayed?.map(h => h.hero) || [];

  const hasHeroesBySide = heroesBySide.attack?.length > 0 || heroesBySide.defense?.length > 0;

  return (
    <div className="game-detail">
      <button className="detail-back-btn" onClick={onBack}>
        &#8249; Back to History
      </button>

      {/* Header with result + map */}
      <div className={`detail-header ${game.result}`}>
        {mapData && (
          <img src={mapData.image} alt={game.map} className="detail-map-bg" />
        )}
        <div className="detail-header-overlay">
          <div className={`detail-result-badge ${game.result}`}>
            {game.result === 'win' ? 'Victory' : game.result === 'loss' ? 'Defeat' : 'Draw'}
          </div>
          <h2 className="detail-map-name">{game.map}</h2>
          {mapData && <span className="detail-map-region">{mapData.region} &bull; {mapData.type}</span>}
          <span className="detail-date">
            {new Date(game.date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* Rank & Score row */}
      <div className="detail-stats-row">
        {game.rankAfter && (
          <div className="detail-stat-box">
            <span className="detail-stat-label">Rang</span>
            <span className="detail-stat-value" style={{ color: getRankColor(game.rankAfter) }}>
              {game.rankAfter}
            </span>
            {game.rankPercentAfter != null && (
              <span className="detail-stat-change">{game.rankPercentAfter}%</span>
            )}
            {game.rankChange && game.rankChange !== 'same' && (
              <span className={`detail-stat-change ${['up', 'promoted'].includes(game.rankChange) ? 'positive' : 'negative'}`}>
                {game.rankChange === 'promoted' ? 'PROMO' : game.rankChange === 'demoted' ? 'DEMOTE' : game.rankChange}
              </span>
            )}
          </div>
        )}

        {!game.rankAfter && game.srAfter != null && (
          <div className="detail-stat-box">
            <span className="detail-stat-label">SR</span>
            <span className="detail-stat-value">{game.srAfter}</span>
            {game.srChange != null && (
              <span className={`detail-stat-change ${game.srChange >= 0 ? 'positive' : 'negative'}`}>
                {game.srChange >= 0 ? '+' : ''}{game.srChange}
              </span>
            )}
          </div>
        )}

        {game.matchScore?.wins != null && game.matchScore?.losses != null && (
          <div className="detail-stat-box">
            <span className="detail-stat-label">Score</span>
            <span className="detail-stat-value">
              {game.matchScore.wins} - {game.matchScore.losses}
            </span>
          </div>
        )}

        {game.streak != null && game.streak !== 0 && (
          <div className="detail-stat-box">
            <span className="detail-stat-label">Streak</span>
            <span className={`detail-stat-value ${game.streak > 0 ? 'positive' : 'negative'}`}>
              {Math.abs(game.streak)}{game.streak > 0 ? 'W' : 'L'}
            </span>
          </div>
        )}
      </div>

      {/* Heroes played */}
      <div className="detail-section">
        <h3>Heroes Played</h3>
        {hasHeroesBySide ? (
          <div className="detail-heroes-sides">
            {heroesBySide.attack?.length > 0 && (
              <div className="detail-side">
                <h4>Attack</h4>
                <div className="detail-heroes-grid">
                  {heroesBySide.attack.map(hero => (
                    <div key={`atk-${hero}`} className="detail-hero-card">
                      {TANK_HEROES_DATA[hero] && (
                        <img src={TANK_HEROES_DATA[hero].image} alt={hero} className="detail-hero-img" />
                      )}
                      <span>{hero}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {heroesBySide.defense?.length > 0 && (
              <div className="detail-side">
                <h4>Defense</h4>
                <div className="detail-heroes-grid">
                  {heroesBySide.defense.map(hero => (
                    <div key={`def-${hero}`} className="detail-hero-card">
                      {TANK_HEROES_DATA[hero] && (
                        <img src={TANK_HEROES_DATA[hero].image} alt={hero} className="detail-hero-img" />
                      )}
                      <span>{hero}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : allHeroes.length > 0 ? (
          <div className="detail-heroes-grid">
            {allHeroes.map(hero => (
              <div key={hero} className="detail-hero-card">
                {TANK_HEROES_DATA[hero] && (
                  <img src={TANK_HEROES_DATA[hero].image} alt={hero} className="detail-hero-img" />
                )}
                <span>{hero}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="detail-empty">No heroes recorded</p>
        )}
      </div>

      {/* Rounds Timeline */}
      {game.rounds?.length > 0 && (
        <div className="detail-section">
          <h3>Rounds Timeline {game.mapMode && <span className="detail-mode-badge">{game.mapMode}</span>}</h3>
          <div className="rounds-timeline">
            {game.rounds.map((round, idx) => (
              <div key={idx} className={`timeline-round ${round.result || ''}`}>
                <div className="timeline-round-header">
                  <span className="timeline-round-num">Round {round.roundNumber}</span>
                  {round.phase && <span className="timeline-round-phase">{round.phase}</span>}
                  {round.result && (
                    <span className={`timeline-round-result ${round.result}`}>
                      {round.result === 'win' ? 'W' : round.result === 'loss' ? 'L' : 'D'}
                    </span>
                  )}
                </div>

                <div className="timeline-round-heroes">
                  <div className="timeline-hero-flow">
                    <div className="timeline-hero-chip">
                      {TANK_HEROES_DATA[round.startingHero] && (
                        <img src={TANK_HEROES_DATA[round.startingHero].image} alt={round.startingHero} className="timeline-hero-img" />
                      )}
                      <span>{round.startingHero}</span>
                    </div>

                    {round.heroSwitches?.length > 0 && round.heroSwitches.map((sw, swIdx) => (
                      <React.Fragment key={swIdx}>
                        <span className="timeline-switch-arrow">
                          <span className="switch-reason">{sw.reason || 'switch'}</span>
                          &#8594;
                        </span>
                        <div className="timeline-hero-chip switched">
                          {TANK_HEROES_DATA[sw.to] && (
                            <img src={TANK_HEROES_DATA[sw.to].image} alt={sw.to} className="timeline-hero-img" />
                          )}
                          <span>{sw.to}</span>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {round.notes && (
                  <div className="timeline-round-notes">{round.notes}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opponent Tanks */}
      {game.opponentTanks?.length > 0 && (
        <div className="detail-section">
          <h3>Enemy Tanks</h3>
          <div className="detail-heroes-grid">
            {game.opponentTanks.map(hero => (
              <div key={`opp-${hero}`} className="detail-hero-card opponent">
                {TANK_HEROES_DATA[hero] && (
                  <img src={TANK_HEROES_DATA[hero].image} alt={hero} className="detail-hero-img" />
                )}
                <span>{hero}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bans */}
      {game.enemyBans?.length > 0 && (
        <div className="detail-section">
          <h3>Enemy Bans</h3>
          <div className="detail-heroes-grid">
            {game.enemyBans.map(hero => (
              <div key={`ban-${hero}`} className="detail-hero-card banned">
                {TANK_HEROES_DATA[hero] && (
                  <img src={TANK_HEROES_DATA[hero].image} alt={hero} className="detail-hero-img" />
                )}
                <span>{hero}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tags */}
      {game.quickTags?.length > 0 && (
        <div className="detail-section">
          <h3>Tags</h3>
          <div className="detail-tags">
            {game.quickTags.map(tag => (
              <span key={tag} className="detail-tag">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {game.notes && (
        <div className="detail-section">
          <h3>Notes</h3>
          <div className="detail-notes">{game.notes}</div>
        </div>
      )}

      {/* Map Pool */}
      {game.mapPool?.length > 0 && (
        <div className="detail-section">
          <h3>Map Pool</h3>
          <div className="detail-map-pool">
            {game.mapPool.map(mapName => {
              const md = getMapImage(mapName);
              return (
                <div key={mapName} className={`detail-pool-map ${mapName === game.map ? 'chosen' : ''}`}>
                  {md && <img src={md.image} alt={mapName} className="detail-pool-img" />}
                  <span>{mapName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default GameDetail;
