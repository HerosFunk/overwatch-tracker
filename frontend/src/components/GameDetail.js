import React, { useState } from 'react';
import { getMapImage, TANK_HEROES_DATA, TANK_HEROES_BY_SUBCLASS, RANKS, QUICK_TAGS, getRankColor } from '../constants';
import { updateGame } from '../api';
import './GameHistory.css';

function GameDetail({ game, onBack, onGameUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState(null);

  const mapData = getMapImage(game.map);
  const heroesBySide = game.heroesPlayedBySide || { attack: [], defense: [] };
  const allHeroes = game.heroesPlayed?.map(h => h.hero) || [];
  const hasHeroesBySide = heroesBySide.attack?.length > 0 || heroesBySide.defense?.length > 0;

  const startEditing = () => {
    setEditData({
      result: game.result,
      rankAfter: game.rankAfter || '',
      rankPercentAfter: game.rankPercentAfter ?? '',
      matchScore: {
        wins: game.matchScore?.wins ?? '',
        losses: game.matchScore?.losses ?? ''
      },
      opponentTanks: [...(game.opponentTanks || [])],
      enemyBans: [...(game.enemyBans || [])],
      quickTags: [...(game.quickTags || [])],
      notes: game.notes || ''
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        result: editData.result,
        rankAfter: editData.rankAfter || null,
        rankPercentAfter: editData.rankPercentAfter !== '' ? parseInt(editData.rankPercentAfter) : null,
        matchScore: {
          wins: editData.matchScore.wins !== '' ? parseInt(editData.matchScore.wins) : null,
          losses: editData.matchScore.losses !== '' ? parseInt(editData.matchScore.losses) : null
        },
        opponentTanks: editData.opponentTanks,
        enemyBans: editData.enemyBans,
        quickTags: editData.quickTags,
        notes: editData.notes
      };
      const response = await updateGame(game._id, payload);
      if (onGameUpdated) {
        onGameUpdated(response.data);
      }
      setIsEditing(false);
      setEditData(null);
    } catch (error) {
      console.error('Error updating game:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const toggleOpponentTank = (hero) => {
    setEditData(prev => ({
      ...prev,
      opponentTanks: prev.opponentTanks.includes(hero)
        ? prev.opponentTanks.filter(h => h !== hero)
        : [...prev.opponentTanks, hero]
    }));
  };

  const toggleBan = (hero) => {
    setEditData(prev => {
      if (prev.enemyBans.includes(hero)) {
        return { ...prev, enemyBans: prev.enemyBans.filter(h => h !== hero) };
      }
      if (prev.enemyBans.length >= 2) return prev;
      return { ...prev, enemyBans: [...prev.enemyBans, hero] };
    });
  };

  const toggleTag = (tag) => {
    setEditData(prev => ({
      ...prev,
      quickTags: prev.quickTags.includes(tag)
        ? prev.quickTags.filter(t => t !== tag)
        : [...prev.quickTags, tag]
    }));
  };

  // Use editData when editing, game data when viewing
  const displayResult = isEditing ? editData.result : game.result;

  return (
    <div className="game-detail">
      <div className="detail-top-bar">
        <button className="detail-back-btn" onClick={onBack}>
          &#8249; Back to History
        </button>
        {!isEditing ? (
          <button className="detail-edit-btn" onClick={startEditing}>
            &#9998; Edit
          </button>
        ) : (
          <div className="detail-edit-actions">
            <button className="detail-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="detail-cancel-btn" onClick={cancelEditing} disabled={saving}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Header with result + map */}
      <div className={`detail-header ${displayResult}`}>
        {mapData && (
          <img src={mapData.image} alt={game.map} className="detail-map-bg" />
        )}
        <div className="detail-header-overlay">
          {isEditing ? (
            <div className="edit-result-buttons">
              {['win', 'loss', 'draw'].map(r => (
                <button
                  key={r}
                  className={`edit-result-btn ${r} ${editData.result === r ? 'active' : ''}`}
                  onClick={() => setEditData({ ...editData, result: r })}
                >
                  {r === 'win' ? 'Victory' : r === 'loss' ? 'Defeat' : 'Draw'}
                </button>
              ))}
            </div>
          ) : (
            <div className={`detail-result-badge ${game.result}`}>
              {game.result === 'win' ? 'Victory' : game.result === 'loss' ? 'Defeat' : 'Draw'}
            </div>
          )}
          <h2 className="detail-map-name">{game.map}</h2>
          {mapData && <span className="detail-map-region">{mapData.region} &bull; {mapData.type}</span>}
          <span className="detail-date">
            {new Date(game.date).toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* Rank & Score row */}
      <div className="detail-stats-row">
        {isEditing ? (
          <>
            <div className="detail-stat-box">
              <span className="detail-stat-label">Rang</span>
              <select
                className="edit-select"
                value={editData.rankAfter}
                onChange={(e) => setEditData({ ...editData, rankAfter: e.target.value })}
              >
                <option value="">-- Aucun --</option>
                {RANKS.map(rank => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
              <input
                className="edit-input-small"
                type="number"
                min="0"
                max="100"
                placeholder="%"
                value={editData.rankPercentAfter}
                onChange={(e) => setEditData({ ...editData, rankPercentAfter: e.target.value })}
              />
            </div>
            <div className="detail-stat-box">
              <span className="detail-stat-label">Score</span>
              <div className="edit-score-row">
                <input
                  className="edit-input-small"
                  type="number"
                  min="0"
                  max="5"
                  placeholder="You"
                  value={editData.matchScore.wins}
                  onChange={(e) => setEditData({ ...editData, matchScore: { ...editData.matchScore, wins: e.target.value } })}
                />
                <span className="edit-score-sep">-</span>
                <input
                  className="edit-input-small"
                  type="number"
                  min="0"
                  max="5"
                  placeholder="Opp"
                  value={editData.matchScore.losses}
                  onChange={(e) => setEditData({ ...editData, matchScore: { ...editData.matchScore, losses: e.target.value } })}
                />
              </div>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Heroes played (read-only always) */}
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

      {/* Rounds Timeline (read-only always) */}
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
      <div className="detail-section">
        <h3>Enemy Tanks</h3>
        {isEditing ? (
          <div className="edit-hero-grid">
            {Object.entries(TANK_HEROES_BY_SUBCLASS).map(([subclass, heroes]) => (
              <div key={subclass} className="edit-subclass-group">
                <h5 className={`subclass-title subclass-${subclass}`}>
                  {subclass.charAt(0).toUpperCase() + subclass.slice(1)}
                </h5>
                <div className="edit-hero-buttons">
                  {heroes.map(hero => (
                    <button
                      key={hero}
                      className={`edit-hero-btn ${editData.opponentTanks.includes(hero) ? 'selected' : ''}`}
                      onClick={() => toggleOpponentTank(hero)}
                    >
                      {TANK_HEROES_DATA[hero] && (
                        <img src={TANK_HEROES_DATA[hero].image} alt={hero} className="edit-hero-img" />
                      )}
                      <span>{hero}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : game.opponentTanks?.length > 0 ? (
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
        ) : (
          <p className="detail-empty">Aucun tank adverse enregistre</p>
        )}
      </div>

      {/* Bans */}
      <div className="detail-section">
        <h3>Enemy Bans</h3>
        {isEditing ? (
          <div className="edit-hero-grid">
            <p className="edit-hint">Max 2 bans</p>
            {Object.entries(TANK_HEROES_BY_SUBCLASS).map(([subclass, heroes]) => (
              <div key={subclass} className="edit-subclass-group">
                <h5 className={`subclass-title subclass-${subclass}`}>
                  {subclass.charAt(0).toUpperCase() + subclass.slice(1)}
                </h5>
                <div className="edit-hero-buttons">
                  {heroes.map(hero => (
                    <button
                      key={hero}
                      className={`edit-hero-btn banned ${editData.enemyBans.includes(hero) ? 'selected' : ''}`}
                      onClick={() => toggleBan(hero)}
                      disabled={!editData.enemyBans.includes(hero) && editData.enemyBans.length >= 2}
                    >
                      {TANK_HEROES_DATA[hero] && (
                        <img src={TANK_HEROES_DATA[hero].image} alt={hero} className="edit-hero-img" />
                      )}
                      <span>{hero}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : game.enemyBans?.length > 0 ? (
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
        ) : (
          <p className="detail-empty">Aucun ban enregistre</p>
        )}
      </div>

      {/* Quick Tags */}
      <div className="detail-section">
        <h3>Tags</h3>
        {isEditing ? (
          <div className="edit-tags-grid">
            {QUICK_TAGS.map(tag => (
              <button
                key={tag}
                className={`edit-tag-btn ${editData.quickTags.includes(tag) ? 'selected' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        ) : game.quickTags?.length > 0 ? (
          <div className="detail-tags">
            {game.quickTags.map(tag => (
              <span key={tag} className="detail-tag">{tag}</span>
            ))}
          </div>
        ) : (
          <p className="detail-empty">Aucun tag</p>
        )}
      </div>

      {/* Notes */}
      <div className="detail-section">
        <h3>Notes</h3>
        {isEditing ? (
          <textarea
            className="edit-textarea"
            value={editData.notes}
            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
            placeholder="Notes sur cette game..."
            rows={4}
          />
        ) : game.notes ? (
          <div className="detail-notes">{game.notes}</div>
        ) : (
          <p className="detail-empty">Aucune note</p>
        )}
      </div>

      {/* Map Pool (read-only) */}
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

      {/* Bottom save/cancel for edit mode */}
      {isEditing && (
        <div className="edit-bottom-actions">
          <button className="detail-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Sauvegarder'}
          </button>
          <button className="detail-cancel-btn" onClick={cancelEditing} disabled={saving}>
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}

export default GameDetail;
