import React, { useState } from 'react';
import { TANK_HEROES_DATA, TANK_HEROES_BY_SUBCLASS } from '../constants';
import './RoundTracker.css';

const SWITCH_REASONS = ['countered', 'not working', 'ult advantage', 'adapting', 'map section'];

const MODE_CONFIG = {
  control: { label: 'Control', roundLabel: 'Point', maxRounds: 3, winCondition: 2, phases: () => 'control' },
  escort: { label: 'Escort', roundLabel: 'Phase', maxRounds: 2, winCondition: null, phases: (i) => i === 0 ? 'attack' : 'defense' },
  hybrid: { label: 'Hybrid', roundLabel: 'Phase', maxRounds: 2, winCondition: null, phases: (i) => i === 0 ? 'attack' : 'defense' },
  push: { label: 'Push', roundLabel: 'Round', maxRounds: 1, winCondition: null, phases: () => 'neutral' },
  flashpoint: { label: 'Flashpoint', roundLabel: 'Point', maxRounds: 5, winCondition: 3, phases: () => 'flashpoint' },
  clash: { label: 'Clash', roundLabel: 'Point', maxRounds: 5, winCondition: 3, phases: () => 'clash' }
};

function RoundTracker({ mapMode, bans, onComplete, onBack, matchupData }) {
  const config = MODE_CONFIG[mapMode] || MODE_CONFIG.escort;
  const [rounds, setRounds] = useState([]);
  const [currentHero, setCurrentHero] = useState(null);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [switchReason, setSwitchReason] = useState('');
  const [roundNotes, setRoundNotes] = useState('');
  const [gameNotes, setGameNotes] = useState('');

  const availableHeroes = Object.values(TANK_HEROES_BY_SUBCLASS).flat().filter(h => !bans.includes(h));

  const completedRounds = rounds.filter(r => r.result);
  const score = {
    wins: completedRounds.filter(r => r.result === 'win').length,
    losses: completedRounds.filter(r => r.result === 'loss').length
  };

  // Find the active (unfinished) round index, if any
  const activeRoundIndex = rounds.findIndex(r => !r.result);
  const isRoundActive = activeRoundIndex >= 0;

  const isGameOver = () => {
    if (config.winCondition) {
      return score.wins >= config.winCondition || score.losses >= config.winCondition;
    }
    return completedRounds.length >= config.maxRounds;
  };

  const getCurrentPhase = () => {
    const roundNum = completedRounds.length;
    if (typeof config.phases === 'function') return config.phases(roundNum);
    return 'neutral';
  };

  const getPhaseLabel = (phase) => {
    switch (phase) {
      case 'attack': return 'Attack';
      case 'defense': return 'Defense';
      case 'control': return 'Point';
      case 'flashpoint': return 'Point';
      case 'clash': return 'Point';
      case 'neutral': return 'Round';
      default: return 'Round';
    }
  };

  const selectHeroForRound = (hero) => {
    setCurrentHero(hero);
    setRoundNotes('');
    const phase = getCurrentPhase();
    const newRound = {
      roundNumber: completedRounds.length + 1,
      phase,
      startingHero: hero,
      endingHero: hero,
      heroSwitches: [],
      result: null,
      notes: ''
    };
    setRounds([...rounds, newRound]);
  };

  const handleSwitch = (newHero) => {
    if (!currentHero || newHero === currentHero || activeRoundIndex < 0) return;
    const updatedRounds = [...rounds];
    const current = updatedRounds[activeRoundIndex];
    current.heroSwitches.push({ from: currentHero, to: newHero, reason: switchReason });
    current.endingHero = newHero;
    setRounds(updatedRounds);
    setCurrentHero(newHero);
    setShowSwitchModal(false);
    setSwitchReason('');
  };

  const finishRound = (result) => {
    if (activeRoundIndex < 0) return;
    const updatedRounds = [...rounds];
    updatedRounds[activeRoundIndex].result = result;
    updatedRounds[activeRoundIndex].notes = roundNotes;
    setRounds(updatedRounds);
    setCurrentHero(null);
    setRoundNotes('');
  };

  const handleComplete = () => {
    onComplete(rounds, gameNotes);
  };

  // Get matchup tip for current hero
  const getMatchupTip = () => {
    if (!matchupData || !currentHero) return null;
    const relevant = matchupData.filter(m => m.myHero === currentHero && m.games >= 2);
    if (relevant.length === 0) return null;
    const sorted = [...relevant].sort((a, b) => parseFloat(b.winrate) - parseFloat(a.winrate));
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    return { best, worst };
  };

  const matchupTip = getMatchupTip();

  // Should we show the hero selection for a new round?
  const showHeroSelect = !isRoundActive && !isGameOver();

  return (
    <div className="round-tracker">
      <div className="rt-header">
        <h3>Round Tracking - {config.label}</h3>
        <div className="rt-score">
          <span className="rt-score-wins">{score.wins}</span>
          <span className="rt-score-sep">-</span>
          <span className="rt-score-losses">{score.losses}</span>
        </div>
      </div>

      {/* Completed rounds summary */}
      {completedRounds.length > 0 && (
        <div className="rt-rounds-summary">
          {completedRounds.map((round, i) => (
            <div key={i} className={`rt-round-pill ${round.result}`}>
              <span className="rt-pill-num">{getPhaseLabel(round.phase)} {round.roundNumber}</span>
              <span className="rt-pill-hero">{round.startingHero}</span>
              {round.heroSwitches.length > 0 && (
                <span className="rt-pill-switches">
                  {round.heroSwitches.map((s, j) => (
                    <span key={j} className="rt-switch-arrow">{s.to}</span>
                  ))}
                </span>
              )}
              <span className={`rt-pill-result ${round.result}`}>
                {round.result === 'win' ? 'W' : round.result === 'loss' ? 'L' : 'D'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Hero selection for new round */}
      {showHeroSelect && (
        <div className="rt-hero-select">
          <h4>{getPhaseLabel(getCurrentPhase())} {completedRounds.length + 1} - Choose your hero</h4>
          {Object.entries(TANK_HEROES_BY_SUBCLASS).map(([subclass, heroes]) => {
            const available = heroes.filter(h => !bans.includes(h));
            if (available.length === 0) return null;
            return (
              <div key={subclass} className="rt-subclass">
                <h5 className={`subclass-title subclass-${subclass}`}>
                  {subclass.charAt(0).toUpperCase() + subclass.slice(1)}
                </h5>
                <div className="rt-hero-grid">
                  {available.map(hero => (
                    <button
                      key={hero}
                      className="rt-hero-btn"
                      onClick={() => selectHeroForRound(hero)}
                    >
                      {TANK_HEROES_DATA[hero] && (
                        <img src={TANK_HEROES_DATA[hero].image} alt={hero} className="rt-hero-img" />
                      )}
                      <span className="rt-hero-name">{hero}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active round controls */}
      {isRoundActive && (
        <div className="rt-active-round">
          <div className="rt-current-info">
            <div className="rt-phase-badge">
              {getPhaseLabel(rounds[activeRoundIndex].phase)} {rounds[activeRoundIndex].roundNumber}
            </div>
            <div className="rt-current-hero">
              {TANK_HEROES_DATA[currentHero] && (
                <img src={TANK_HEROES_DATA[currentHero].image} alt={currentHero} className="rt-current-hero-img" />
              )}
              <span>{currentHero}</span>
            </div>
          </div>

          {/* Matchup tip */}
          {matchupTip && (
            <div className="tip-banner tip-small">
              <span className="tip-icon">&#128202;</span>
              <span>
                With {currentHero}: best vs <strong>{matchupTip.best.opponentHero}</strong> ({matchupTip.best.winrate}%),
                worst vs <strong>{matchupTip.worst.opponentHero}</strong> ({matchupTip.worst.winrate}%)
              </span>
            </div>
          )}

          {/* Switch history */}
          {rounds[activeRoundIndex].heroSwitches.length > 0 && (
            <div className="rt-switch-history">
              {rounds[activeRoundIndex].heroSwitches.map((sw, i) => (
                <div key={i} className="rt-switch-entry">
                  <span>{sw.from}</span>
                  <span className="rt-switch-arrow-icon">&rarr;</span>
                  <span>{sw.to}</span>
                  {sw.reason && <span className="rt-switch-reason">({sw.reason})</span>}
                </div>
              ))}
            </div>
          )}

          <button className="rt-switch-btn" onClick={() => setShowSwitchModal(true)}>
            Switch Hero
          </button>

          <textarea
            className="rt-round-notes"
            placeholder="Round notes..."
            value={roundNotes}
            onChange={(e) => setRoundNotes(e.target.value)}
          />

          <div className="rt-round-result-btns">
            <button className="rt-result-btn win" onClick={() => finishRound('win')}>
              Round Won
            </button>
            <button className="rt-result-btn loss" onClick={() => finishRound('loss')}>
              Round Lost
            </button>
          </div>
        </div>
      )}

      {/* Switch Hero Modal */}
      {showSwitchModal && (
        <div className="rt-modal-overlay" onClick={() => setShowSwitchModal(false)}>
          <div className="rt-modal" onClick={e => e.stopPropagation()}>
            <h4>Switch to which hero?</h4>
            <div className="rt-switch-reasons">
              {SWITCH_REASONS.map(reason => (
                <button
                  key={reason}
                  className={`rt-reason-btn ${switchReason === reason ? 'selected' : ''}`}
                  onClick={() => setSwitchReason(switchReason === reason ? '' : reason)}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="rt-modal-heroes">
              {availableHeroes.filter(h => h !== currentHero).map(hero => (
                <button
                  key={hero}
                  className="rt-modal-hero-btn"
                  onClick={() => handleSwitch(hero)}
                >
                  {TANK_HEROES_DATA[hero] && (
                    <img src={TANK_HEROES_DATA[hero].image} alt={hero} className="rt-modal-hero-img" />
                  )}
                  <span>{hero}</span>
                </button>
              ))}
            </div>
            <button className="rt-modal-close" onClick={() => setShowSwitchModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Game complete */}
      {isGameOver() && !isRoundActive && (
        <div className="rt-game-over">
          <h4>All rounds complete</h4>
          <div className="rt-final-score">
            {score.wins} - {score.losses}
          </div>
          <textarea
            className="rt-round-notes"
            placeholder="Overall game notes..."
            value={gameNotes}
            onChange={(e) => setGameNotes(e.target.value)}
          />
          <button className="next-btn" onClick={handleComplete}>
            Continue to Post-Game &rarr;
          </button>
        </div>
      )}

      {/* Manual end for modes without win condition */}
      {!isGameOver() && !isRoundActive && completedRounds.length > 0 && (
        <div className="rt-manual-end">
          <textarea
            className="rt-round-notes"
            placeholder="Overall game notes..."
            value={gameNotes}
            onChange={(e) => setGameNotes(e.target.value)}
          />
          <div className="rt-manual-btns">
            <button className="next-btn" onClick={handleComplete}>
              Continue to Post-Game &rarr;
            </button>
          </div>
        </div>
      )}

      <div className="companion-actions">
        <button onClick={onBack}>&larr; Back</button>
      </div>
    </div>
  );
}

export default RoundTracker;
