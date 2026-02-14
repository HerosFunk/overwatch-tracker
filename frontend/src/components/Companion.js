import React, { useState, useEffect } from 'react';
import { TANK_HEROES_DATA, TANK_HEROES_BY_SUBCLASS, MAPS_BY_MODE, QUICK_TAGS, RANKS, getRankColor } from '../constants';
import { createGame, getMapPoolStats, getCompanionTips, getMapVoteStrategy, getHeroRecommendation, getMatchupMatrix, getBriefingCard } from '../api';
import RoundTracker from './RoundTracker';
import './Companion.css';

const STEPS = {
  MAP_SELECTION: 'map_selection',
  MAP_STATS: 'map_stats',
  CHOSEN_MAP: 'chosen_map',
  BANS: 'bans',
  BRIEFING: 'briefing',
  HERO_SELECTION: 'hero_selection',
  ROUND_TRACKING: 'round_tracking',
  POST_GAME: 'post_game'
};

const STEPS_ORDER = [
  'map_selection',
  'map_stats',
  'chosen_map',
  'bans',
  'briefing',
  'hero_selection',
  'round_tracking',
  'post_game'
];

// Derive mapMode from map name using frontend constants
function getMapMode(mapName) {
  for (const [mode, maps] of Object.entries(MAPS_BY_MODE)) {
    if (maps.some(m => m.name === mapName)) return mode;
  }
  return 'escort';
}

function Companion({ activeSeason }) {
  const [step, setStep] = useState(STEPS.MAP_SELECTION);
  const [expandedModes, setExpandedModes] = useState({
    control: true,
    escort: true,
    flashpoint: false,
    hybrid: false,
    push: false,
    clash: false
  });
  const [gameData, setGameData] = useState({
    mapPool: [],
    selectedMap: null,
    mapMode: null,
    bans: [],
    heroesPlayed: { attack: [], defense: [] },
    rounds: [],
    opponentTanks: [],
    matchScore: { wins: '', losses: '' },
    rankAfter: '',
    rankPercentAfter: '',
    result: null,
    notes: '',
    quickTags: []
  });
  const [mapStats, setMapStats] = useState([]);
  const [mapVoteData, setMapVoteData] = useState(null);
  const [heroRecs, setHeroRecs] = useState(null);
  const [matchupData, setMatchupData] = useState(null);
  const [briefingData, setBriefingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState(null);

  // Load companion tips once on mount
  useEffect(() => {
    if (activeSeason) {
      fetchTips();
      fetchMatchupData();
    }
  }, [activeSeason]);

  // Fetch stats when map pool is selected
  useEffect(() => {
    if (gameData.mapPool.length === 3 && step === STEPS.MAP_STATS) {
      fetchMapPoolStats();
      fetchMapVoteStrategy();
    }
  }, [gameData.mapPool, step]);

  // Fetch hero recommendations when entering hero selection
  useEffect(() => {
    if (step === STEPS.HERO_SELECTION && gameData.selectedMap) {
      fetchHeroRecommendations();
    }
  }, [step, gameData.selectedMap, gameData.bans]);

  // Fetch briefing card when entering briefing step
  useEffect(() => {
    if (step === STEPS.BRIEFING && gameData.selectedMap) {
      fetchBriefingCard();
    }
  }, [step, gameData.selectedMap, gameData.bans]);

  const fetchTips = async () => {
    try {
      const response = await getCompanionTips(activeSeason?.name);
      setTips(response.data);
    } catch (error) {
      console.error('Error fetching companion tips:', error);
    }
  };

  const fetchMatchupData = async () => {
    try {
      const response = await getMatchupMatrix(activeSeason?.name);
      setMatchupData(response.data);
    } catch (error) {
      console.error('Error fetching matchup data:', error);
    }
  };

  const fetchMapPoolStats = async () => {
    try {
      setLoading(true);
      const response = await getMapPoolStats(gameData.mapPool, activeSeason?.name);
      setMapStats(response.data);
    } catch (error) {
      console.error('Error fetching map stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMapVoteStrategy = async () => {
    try {
      const response = await getMapVoteStrategy(gameData.mapPool, gameData.bans, activeSeason?.name);
      setMapVoteData(response.data);
    } catch (error) {
      console.error('Error fetching map vote strategy:', error);
    }
  };

  const fetchHeroRecommendations = async () => {
    try {
      const response = await getHeroRecommendation(
        gameData.selectedMap, gameData.bans, gameData.opponentTanks, activeSeason?.name
      );
      setHeroRecs(response.data);
    } catch (error) {
      console.error('Error fetching hero recommendations:', error);
    }
  };

  const fetchBriefingCard = async () => {
    try {
      setLoading(true);
      const response = await getBriefingCard(gameData.selectedMap, gameData.bans, activeSeason?.name);
      setBriefingData(response.data);
    } catch (error) {
      console.error('Error fetching briefing card:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapPoolSelect = (map) => {
    if (gameData.mapPool.includes(map)) {
      setGameData({ ...gameData, mapPool: gameData.mapPool.filter(m => m !== map) });
    } else if (gameData.mapPool.length < 3) {
      setGameData({ ...gameData, mapPool: [...gameData.mapPool, map] });
    }
  };

  const handleMapChoice = (map) => {
    const mapMode = getMapMode(map);
    setGameData({ ...gameData, selectedMap: map, mapMode });
    setStep(STEPS.BANS);
  };

  const toggleModeSection = (mode) => {
    setExpandedModes({ ...expandedModes, [mode]: !expandedModes[mode] });
  };

  const handleBanToggle = (hero) => {
    if (gameData.bans.includes(hero)) {
      setGameData({ ...gameData, bans: gameData.bans.filter(h => h !== hero) });
    } else if (gameData.bans.length < 2) {
      setGameData({ ...gameData, bans: [...gameData.bans, hero] });
    }
  };

  const handleStartRoundTracking = () => {
    setStep(STEPS.ROUND_TRACKING);
  };

  const handleRoundTrackingComplete = (rounds, gameNotes) => {
    // Derive heroesPlayed from rounds for backward compat
    const attackHeroes = new Set();
    const defenseHeroes = new Set();
    rounds.forEach(round => {
      const heroes = [round.startingHero, round.endingHero, ...(round.heroSwitches || []).map(s => s.to)].filter(Boolean);
      if (round.phase === 'attack') heroes.forEach(h => attackHeroes.add(h));
      else if (round.phase === 'defense') heroes.forEach(h => defenseHeroes.add(h));
      else heroes.forEach(h => { attackHeroes.add(h); defenseHeroes.add(h); });
    });

    setGameData(prev => ({
      ...prev,
      rounds,
      heroesPlayed: { attack: [...attackHeroes], defense: [...defenseHeroes] },
      notes: gameNotes || prev.notes
    }));
    setStep(STEPS.POST_GAME);
  };

  const handleOpponentTankToggle = (hero) => {
    if (gameData.opponentTanks.includes(hero)) {
      setGameData({ ...gameData, opponentTanks: gameData.opponentTanks.filter(h => h !== hero) });
    } else {
      setGameData({ ...gameData, opponentTanks: [...gameData.opponentTanks, hero] });
    }
  };

  const handleQuickTagToggle = (tag) => {
    if (gameData.quickTags.includes(tag)) {
      setGameData({ ...gameData, quickTags: gameData.quickTags.filter(t => t !== tag) });
    } else {
      setGameData({ ...gameData, quickTags: [...gameData.quickTags, tag] });
    }
  };

  const handleEndGame = async (result) => {
    const finalData = {
      ...gameData,
      result,
      rankAfter: gameData.rankAfter || null,
      rankPercentAfter: gameData.rankPercentAfter ? parseInt(gameData.rankPercentAfter) : null
    };

    try {
      await createGame(finalData);
      alert('Game saved successfully!');
      resetCompanion();
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Error saving game');
    }
  };

  const resetCompanion = () => {
    setStep(STEPS.MAP_SELECTION);
    setGameData({
      mapPool: [], selectedMap: null, mapMode: null, bans: [],
      heroesPlayed: { attack: [], defense: [] }, rounds: [],
      opponentTanks: [],
      matchScore: { wins: '', losses: '' },
      rankAfter: '', rankPercentAfter: '',
      result: null, notes: '', quickTags: []
    });
    setMapStats([]);
    setMapVoteData(null);
    setHeroRecs(null);
    setBriefingData(null);
    fetchTips();
    fetchMatchupData();
  };

  const getMapImage = (mapName) => {
    for (const modeType of Object.values(MAPS_BY_MODE)) {
      const map = modeType.find(m => m.name === mapName);
      if (map) return map;
    }
    return null;
  };

  const getStepNumber = () => STEPS_ORDER.indexOf(step) + 1;

  const getHeroStatsForMap = (mapName) => {
    if (!tips?.heroMapStats) return [];
    return tips.heroMapStats
      .filter(h => h.map === mapName)
      .sort((a, b) => parseFloat(b.winrate) - parseFloat(a.winrate));
  };

  const getHeroWinrate = (heroName) => {
    if (!tips?.heroStats) return null;
    return tips.heroStats.find(h => h.hero === heroName);
  };

  // Get recommendation data for a hero
  const getHeroRec = (heroName) => {
    if (!heroRecs) return null;
    return heroRecs.find(r => r.hero === heroName);
  };

  // Get tier color
  const getTierColor = (tier) => {
    switch (tier) {
      case 'S': return '#ff9100';
      case 'A': return '#4caf50';
      case 'B': return '#2196f3';
      case 'C': return '#888';
      default: return '#666';
    }
  };

  return (
    <div className="companion">
      <div className="companion-header">
        <h2>Game Companion</h2>
        <div className="step-indicator">
          Step {getStepNumber()} / {STEPS_ORDER.length}
        </div>
      </div>

      {/* Session status bar */}
      {tips && tips.totalGames > 0 && (
        <div className="session-bar">
          <span>{tips.totalGames} games</span>
          <span className={parseFloat(tips.winrate) >= 50 ? 'positive' : 'negative'}>
            {tips.winrate}% WR
          </span>
          {tips.currentRank && (
            <span className="rank-badge" style={{ color: getRankColor(tips.currentRank) }}>
              {tips.currentRank}
              {tips.currentRankPercent != null && ` (${tips.currentRankPercent}%)`}
            </span>
          )}
          {tips.currentStreak !== 0 && (
            <span className={tips.currentStreak > 0 ? 'positive' : 'negative'}>
              {Math.abs(tips.currentStreak)}{tips.currentStreak > 0 ? 'W' : 'L'} streak
            </span>
          )}
          {tips.sessionStats && (
            <span className="session-info">
              Session: {tips.sessionStats.gamesPlayed}g ({tips.sessionStats.winrate}% WR)
            </span>
          )}
        </div>
      )}

      {/* Tilt Alert */}
      {tips?.tiltAlert && (
        <div className={`tilt-alert tilt-${tips.tiltAlert.level}`}>
          <span className="tilt-icon">
            {tips.tiltAlert.level === 'critical' ? '\u26D4' : '\u26A0'}
          </span>
          <span>{tips.tiltAlert.message}</span>
          {tips.tiltAlert.historicalWrAfterTilt && (
            <span className="tilt-stat">
              WR historique apres {tips.tiltAlert.consecutiveLosses} losses: {tips.tiltAlert.historicalWrAfterTilt}%
              ({tips.tiltAlert.historicalSample} games)
            </span>
          )}
        </div>
      )}

      {/* STEP 1: Map Pool Selection */}
      {step === STEPS.MAP_SELECTION && (
        <div className="step-content">
          <h3>Select the 3 maps in the vote</h3>
          <p className="step-subtitle">Selected: {gameData.mapPool.length}/3</p>
          {Object.entries(MAPS_BY_MODE).map(([mode, maps]) => (
            <div key={mode} className="map-mode-section">
              <button
                className="mode-toggle"
                onClick={() => toggleModeSection(mode)}
              >
                <span className={`mode-title mode-${mode}`}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1).replace(/([A-Z])/g, ' $1')} ({maps.length})
                </span>
                <span className={`expand-icon ${expandedModes[mode] ? 'expanded' : ''}`}>
                  &#9660;
                </span>
              </button>
              {expandedModes[mode] && (
                <div className="map-grid">
                  {maps.map(map => (
                    <button
                      key={map.name}
                      className={`map-btn ${gameData.mapPool.includes(map.name) ? 'selected' : ''}`}
                      onClick={() => handleMapPoolSelect(map.name)}
                      disabled={!gameData.mapPool.includes(map.name) && gameData.mapPool.length >= 3}
                    >
                      <img src={map.image} alt={map.name} className="map-image" />
                      <div className="map-info">
                        <strong>{map.name}</strong>
                        <small>{map.region}</small>
                      </div>
                      {gameData.mapPool.includes(map.name) && <span className="badge">&#10003;</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {gameData.mapPool.length === 3 && (
            <button className="next-btn" onClick={() => setStep(STEPS.MAP_STATS)}>
              View Stats &rarr;
            </button>
          )}
        </div>
      )}

      {/* STEP 2: Map Stats + Vote Strategy */}
      {step === STEPS.MAP_STATS && (
        <div className="step-content">
          <h3>Map Vote Strategy</h3>

          {/* Map vote recommendation banner */}
          {mapVoteData && mapVoteData.length > 0 && (
            <div className="tip-banner tip-success">
              <span className="tip-icon">&#9733;</span>
              <span>
                Vote for <strong>{mapVoteData[0].map}</strong> (score: {mapVoteData[0].compositeScore})
                {mapVoteData[0].breakdown.bestHero && (
                  <> - best pick: <strong>{mapVoteData[0].breakdown.bestHero}</strong> ({mapVoteData[0].breakdown.bestHeroWinrate}%)</>
                )}
              </span>
            </div>
          )}

          {loading ? (
            <p>Loading stats...</p>
          ) : (
            <div className="map-stats-grid">
              {(mapVoteData || mapStats).map((item, idx) => {
                const stat = mapStats.find(s => s.map === (item.map || item));
                const strategy = mapVoteData?.find(s => s.map === (item.map || stat?.map));
                const mapName = strategy?.map || stat?.map || item.map;
                const heroesOnMap = getHeroStatsForMap(mapName);
                const isRecommended = mapVoteData && mapVoteData[0]?.map === mapName;

                return (
                  <div key={mapName} className={`map-stat-card ${isRecommended ? 'recommended' : ''}`}>
                    <div className="map-stat-header">
                      <h4>{mapName}</h4>
                      {isRecommended && <span className="recommended-badge">VOTE</span>}
                    </div>

                    {/* Composite score */}
                    {strategy && (
                      <div className="composite-score">
                        <span className="composite-label">Score</span>
                        <span className="composite-value">{strategy.compositeScore}</span>
                      </div>
                    )}

                    {stat && (
                      <>
                        <div className="stat-row">
                          <span>Winrate:</span>
                          <strong className={parseFloat(stat.winrate) >= 50 ? 'positive' : 'negative'}>
                            {stat.winrate}%
                          </strong>
                        </div>
                        <div className="stat-row">
                          <span>Games:</span>
                          <strong>{stat.games}</strong>
                        </div>
                      </>
                    )}

                    {/* Strategy breakdown */}
                    {strategy && (
                      <div className="tip-box">
                        <span className="tip-label">Analysis</span>
                        <span className="tip-hero-line">Map WR: <strong>{strategy.breakdown.mapWinrate}%</strong></span>
                        <span className="tip-hero-line">Hero Pool: <strong>{strategy.breakdown.heroPoolScore}</strong></span>
                        {strategy.breakdown.bestHero && (
                          <span className="tip-hero-line">Best: <strong>{strategy.breakdown.bestHero}</strong> ({strategy.breakdown.bestHeroWinrate}%)</span>
                        )}
                      </div>
                    )}

                    {heroesOnMap.length > 0 && !strategy && (
                      <div className="tip-box">
                        <span className="tip-label">Top picks</span>
                        {heroesOnMap.slice(0, 2).map(h => (
                          <span key={h.hero} className="tip-hero-line">
                            {h.hero}: <strong className={parseFloat(h.winrate) >= 50 ? 'positive' : 'negative'}>{h.winrate}%</strong> ({h.games}g)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button className="next-btn" onClick={() => setStep(STEPS.CHOSEN_MAP)}>
            Choose Map &rarr;
          </button>
        </div>
      )}

      {/* STEP 3: Chosen Map Selection */}
      {step === STEPS.CHOSEN_MAP && (
        <div className="step-content">
          <h3>Which map was chosen in the vote?</h3>
          <p className="step-subtitle">Select from your 3 maps</p>
          <div className="chosen-map-grid">
            {gameData.mapPool.map(mapName => {
              const mapData = getMapImage(mapName);
              const stat = mapStats.find(s => s.map === mapName);
              const strategy = mapVoteData?.find(s => s.map === mapName);
              const isRecommended = mapVoteData && mapVoteData[0]?.map === mapName;

              return (
                <button
                  key={mapName}
                  className={`chosen-map-btn ${gameData.selectedMap === mapName ? 'selected' : ''}`}
                  onClick={() => handleMapChoice(mapName)}
                >
                  {mapData && <img src={mapData.image} alt={mapName} className="chosen-map-image" />}
                  <div className="map-chosen-header">
                    {mapName}
                    {isRecommended && <span style={{ marginLeft: 8, color: '#4caf50', fontSize: 12 }}>BEST</span>}
                  </div>
                  {mapData && <small className="map-region">{mapData.region}</small>}
                  <div className="map-chosen-stats">
                    {strategy && (
                      <div className="stat-item">
                        <span className="stat-label">Score</span>
                        <span className="stat-value" style={{ color: '#ff9100' }}>{strategy.compositeScore}</span>
                      </div>
                    )}
                    {stat && (
                      <>
                        <div className="stat-item">
                          <span className="stat-label">Winrate</span>
                          <span className={`stat-value ${parseFloat(stat.winrate) >= 50 ? 'positive' : 'negative'}`}>
                            {stat.winrate}%
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Games</span>
                          <span className="stat-value">{stat.games}</span>
                        </div>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="companion-actions">
            <button onClick={() => setStep(STEPS.MAP_STATS)}>&larr; Back</button>
            {gameData.selectedMap && (
              <button className="next-btn" onClick={() => setStep(STEPS.BANS)}>
                Continue to Bans &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: Bans */}
      {step === STEPS.BANS && (
        <div className="step-content">
          <h3>Enemy Bans (select up to 2)</h3>
          <p className="step-subtitle">Which heroes were banned by the enemy?</p>

          {tips?.banStats?.length > 0 && (
            <div className="tip-banner">
              <span className="tip-icon">&#128202;</span>
              <span>Most banned against you:
                {tips.banStats.slice(0, 3).map((b, i) => (
                  <strong key={b.hero}>{i > 0 ? ', ' : ' '}{b.hero} ({b.pct}%)</strong>
                ))}
              </span>
            </div>
          )}

          {tips?.opponentStats?.length > 0 && (
            <div className="tip-banner tip-danger">
              <span className="tip-icon">&#9888;</span>
              <span>You struggle most vs:
                {tips.opponentStats.slice(0, 2).map((o, i) => (
                  <strong key={o.hero}>
                    {i > 0 ? ', ' : ' '}{o.hero} ({o.winrate}% WR, {o.games}g)
                  </strong>
                ))}
              </span>
            </div>
          )}

          {Object.entries(TANK_HEROES_BY_SUBCLASS).map(([subclass, heroes]) => (
            <div key={subclass} className="hero-subclass-section">
              <h5 className={`subclass-title subclass-${subclass}`}>
                {subclass.charAt(0).toUpperCase() + subclass.slice(1)}
              </h5>
              <div className="hero-grid">
                {heroes.map(hero => {
                  const banStat = tips?.banStats?.find(b => b.hero === hero);
                  return (
                    <button
                      key={hero}
                      className={`hero-btn ${gameData.bans.includes(hero) ? 'selected' : ''}`}
                      onClick={() => handleBanToggle(hero)}
                      disabled={!gameData.bans.includes(hero) && gameData.bans.length >= 2}
                    >
                      {TANK_HEROES_DATA[hero] && (
                        <img src={TANK_HEROES_DATA[hero].image} alt={hero} className="hero-image" />
                      )}
                      <span className="hero-name">
                        {hero}
                        {banStat && <small className="hero-ban-pct">{banStat.pct}% ban</small>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="companion-actions">
            <button onClick={() => setStep(STEPS.CHOSEN_MAP)}>&larr; Back</button>
            <button className="next-btn" onClick={() => setStep(STEPS.BRIEFING)}>
              View Briefing &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Pre-Game Briefing Card */}
      {step === STEPS.BRIEFING && (
        <div className="step-content">
          <h3>Pre-Game Briefing</h3>
          {loading ? (
            <p>Loading briefing...</p>
          ) : briefingData ? (
            <div className="briefing-card">
              {/* Map stats */}
              <div className="briefing-section">
                <h4>{briefingData.map}</h4>
                <div className="briefing-stats-row">
                  {briefingData.mapStats.winrate != null && (
                    <div className="briefing-stat">
                      <span className="briefing-stat-label">Map WR</span>
                      <span className={`briefing-stat-value ${parseFloat(briefingData.mapStats.winrate) >= 50 ? 'positive' : 'negative'}`}>
                        {briefingData.mapStats.winrate}%
                      </span>
                      <span className="briefing-stat-sub">{briefingData.mapStats.games} games</span>
                    </div>
                  )}
                  {briefingData.mapStats.mapStreak !== 0 && (
                    <div className="briefing-stat">
                      <span className="briefing-stat-label">Map Streak</span>
                      <span className={`briefing-stat-value ${briefingData.mapStats.mapStreak > 0 ? 'positive' : 'negative'}`}>
                        {Math.abs(briefingData.mapStats.mapStreak)}{briefingData.mapStats.mapStreak > 0 ? 'W' : 'L'}
                      </span>
                    </div>
                  )}
                  {briefingData.sessionStatus.currentStreak !== 0 && (
                    <div className="briefing-stat">
                      <span className="briefing-stat-label">Session Streak</span>
                      <span className={`briefing-stat-value ${briefingData.sessionStatus.currentStreak > 0 ? 'positive' : 'negative'}`}>
                        {Math.abs(briefingData.sessionStatus.currentStreak)}{briefingData.sessionStatus.currentStreak > 0 ? 'W' : 'L'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hero recommendation */}
              {briefingData.heroRecommendation.top && (
                <div className="briefing-section">
                  <h4>Hero recommande</h4>
                  <div className="briefing-hero-rec">
                    <span className="briefing-tier" style={{ background: getTierColor(briefingData.heroRecommendation.top.tier) }}>
                      {briefingData.heroRecommendation.top.tier}
                    </span>
                    <strong>{briefingData.heroRecommendation.top.hero}</strong>
                    <span className="briefing-score">(score: {briefingData.heroRecommendation.top.score})</span>
                  </div>
                  {briefingData.heroRecommendation.top3.length > 1 && (
                    <div className="briefing-top3">
                      {briefingData.heroRecommendation.top3.slice(1).map(r => (
                        <span key={r.hero} className="briefing-alt-hero">
                          <span className="briefing-tier-small" style={{ background: getTierColor(r.tier) }}>{r.tier}</span>
                          {r.hero}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Comfort heroes */}
              {briefingData.comfortHeroes?.length > 0 && (
                <div className="briefing-section">
                  <h4>Confort sur cette map</h4>
                  <div className="briefing-comfort">
                    {briefingData.comfortHeroes.map(c => (
                      <span key={c.hero} className="briefing-comfort-item">
                        {c.hero}: <strong>{c.score}/100</strong> ({c.games}g)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Danger matchups */}
              {briefingData.dangerMatchups?.length > 0 && (
                <div className="briefing-section">
                  <h4>Matchups difficiles (cette map)</h4>
                  {briefingData.dangerMatchups.map(m => (
                    <div key={m.hero} className="briefing-danger">
                      <span className="negative">vs {m.hero}: {m.winrate}% WR ({m.games}g)</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tilt alert in briefing */}
              {briefingData.sessionStatus.tilt && (
                <div className={`tip-banner tip-danger`}>
                  <span className="tip-icon">{'\u26A0'}</span>
                  <span>{briefingData.sessionStatus.tilt.message}</span>
                </div>
              )}

              {/* Previous notes on this map */}
              {briefingData.previousNotes?.length > 0 && (
                <div className="briefing-section">
                  <h4>Notes precedentes (cette map)</h4>
                  {briefingData.previousNotes.map((n, i) => (
                    <div key={i} className="briefing-note">
                      <span className={`briefing-note-result ${n.result}`}>
                        {n.result === 'win' ? 'V' : n.result === 'loss' ? 'D' : 'N'}
                      </span>
                      <span className="briefing-note-heroes">{n.heroes.join(', ')}</span>
                      <span className="briefing-note-text">{n.note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p>Pas assez de donnees pour le briefing</p>
          )}

          <div className="companion-actions">
            <button onClick={() => setStep(STEPS.BANS)}>&larr; Back</button>
            <button className="next-btn" onClick={() => setStep(STEPS.HERO_SELECTION)}>
              Hero Selection &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Hero Selection with Tier List */}
      {step === STEPS.HERO_SELECTION && (
        <div className="step-content">
          <h3>Hero Recommendation</h3>
          <p className="map-name">Map: <strong>{gameData.selectedMap}</strong> ({gameData.mapMode})</p>

          {/* Personal Tier List */}
          {heroRecs && heroRecs.length > 0 && (
            <div className="tier-list-section">
              <h4 className="tier-list-title">Your Personal Tier List</h4>
              {['S', 'A', 'B', 'C'].map(tier => {
                const tierHeroes = heroRecs.filter(r => r.tier === tier);
                if (tierHeroes.length === 0) return null;
                return (
                  <div key={tier} className="tier-row">
                    <div className="tier-label" style={{ background: getTierColor(tier) }}>{tier}</div>
                    <div className="tier-heroes">
                      {tierHeroes.map(rec => (
                        <div key={rec.hero} className="tier-hero-card">
                          {TANK_HEROES_DATA[rec.hero] && (
                            <img src={TANK_HEROES_DATA[rec.hero].image} alt={rec.hero} className="tier-hero-img" />
                          )}
                          <div className="tier-hero-info">
                            <span className="tier-hero-name">{rec.hero}</span>
                            <span className="tier-hero-score">{rec.compositeScore}</span>
                            <span className="tier-hero-conf">{rec.confidence !== 'no_data' ? `${rec.gamesOnMap}g` : 'new'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tips?.neverPlayed?.length > 0 && (
            <div className="tip-banner tip-info">
              <span className="tip-icon">&#128161;</span>
              <span>Never played this season: {tips.neverPlayed.join(', ')}</span>
            </div>
          )}

          <p className="step-subtitle">Hero picks will be tracked round-by-round in the next step</p>

          <div className="companion-actions">
            <button onClick={() => setStep(STEPS.BRIEFING)}>&larr; Back</button>
            <button className="next-btn" onClick={handleStartRoundTracking}>
              Start Round Tracking &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Round Tracking */}
      {step === STEPS.ROUND_TRACKING && (
        <RoundTracker
          mapMode={gameData.mapMode}
          bans={gameData.bans}
          onComplete={handleRoundTrackingComplete}
          onBack={() => setStep(STEPS.HERO_SELECTION)}
          matchupData={matchupData}
        />
      )}

      {/* STEP 7: Post Game */}
      {step === STEPS.POST_GAME && (
        <div className="step-content post-game">
          <h3>Game Result</h3>

          {/* Rounds summary */}
          {gameData.rounds.length > 0 && (
            <div className="post-game-rounds-summary">
              <h4>Rounds Played</h4>
              <div className="rounds-mini-summary">
                {gameData.rounds.map((r, i) => (
                  <span key={i} className={`round-mini ${r.result}`}>
                    R{r.roundNumber}: {r.startingHero}
                    {r.endingHero !== r.startingHero && ` -> ${r.endingHero}`}
                    {' '}{r.result === 'win' ? 'W' : r.result === 'loss' ? 'L' : 'D'}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rank-inputs">
            <label>
              Rang apres:
              <select
                value={gameData.rankAfter}
                onChange={(e) => setGameData({ ...gameData, rankAfter: e.target.value })}
              >
                <option value="">-- Selectionner --</option>
                {RANKS.map(rank => (
                  <option key={rank} value={rank} style={{ color: getRankColor(rank) }}>{rank}</option>
                ))}
              </select>
            </label>
            <label>
              Progression (%):
              <input
                type="number"
                value={gameData.rankPercentAfter}
                onChange={(e) => setGameData({ ...gameData, rankPercentAfter: e.target.value })}
                placeholder="e.g., 72"
                min="0"
                max="100"
              />
            </label>
            {gameData.rankAfter && (
              <div className="rank-display" style={{ color: getRankColor(gameData.rankAfter) }}>
                {gameData.rankAfter} {gameData.rankPercentAfter ? `(${gameData.rankPercentAfter}%)` : ''}
              </div>
            )}
          </div>

          {/* Match Score */}
          <div className="match-score-section">
            <h4>Match Score</h4>
            <div className="score-inputs">
              <label>
                Your team:
                <input
                  type="number"
                  value={gameData.matchScore.wins}
                  onChange={(e) => setGameData({
                    ...gameData,
                    matchScore: { ...gameData.matchScore, wins: e.target.value }
                  })}
                  placeholder="e.g., 5"
                  min="0"
                  max="5"
                />
              </label>
              <label>
                Opponent:
                <input
                  type="number"
                  value={gameData.matchScore.losses}
                  onChange={(e) => setGameData({
                    ...gameData,
                    matchScore: { ...gameData.matchScore, losses: e.target.value }
                  })}
                  placeholder="e.g., 2"
                  min="0"
                  max="5"
                />
              </label>
            </div>
            {gameData.matchScore.wins && gameData.matchScore.losses && (
              <div className="score-display">
                {gameData.matchScore.wins} - {gameData.matchScore.losses}
              </div>
            )}
          </div>

          {/* Enemy Tank Heroes */}
          <div className="opponent-section">
            <h4>Enemy Tank Heroes</h4>
            {tips?.opponentStats?.length > 0 && (
              <div className="tip-banner tip-small">
                <span className="tip-icon">&#128202;</span>
                <span>
                  Hardest matchup: <strong>{tips.opponentStats[0]?.hero}</strong> ({tips.opponentStats[0]?.winrate}% WR)
                  {tips.opponentStats[1] && (
                    <>, <strong>{tips.opponentStats[1]?.hero}</strong> ({tips.opponentStats[1]?.winrate}% WR)</>
                  )}
                </span>
              </div>
            )}
            {Object.entries(TANK_HEROES_BY_SUBCLASS).map(([subclass, heroes]) => (
              <div key={subclass} className="hero-subclass-section">
                <h5 className={`subclass-title subclass-${subclass}`}>
                  {subclass.charAt(0).toUpperCase() + subclass.slice(1)}
                </h5>
                <div className="hero-grid">
                  {heroes.map(hero => {
                    const opp = tips?.opponentStats?.find(o => o.hero === hero);
                    return (
                      <button
                        key={`opponent-${hero}`}
                        className={`hero-btn ${gameData.opponentTanks.includes(hero) ? 'selected' : ''}`}
                        onClick={() => handleOpponentTankToggle(hero)}
                      >
                        {TANK_HEROES_DATA[hero] && (
                          <img src={TANK_HEROES_DATA[hero].image} alt={hero} className="hero-image" />
                        )}
                        <span className="hero-name">
                          {hero}
                          {opp && opp.games >= 2 && (
                            <small className={`hero-wr ${parseFloat(opp.winrate) >= 50 ? 'positive' : 'negative'}`}>
                              {opp.winrate}% vs
                            </small>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tags */}
          <div className="modifiers-section">
            <h4>Quick Tags</h4>
            <div className="modifiers-grid">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  className={`modifier-btn ${gameData.quickTags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => handleQuickTagToggle(tag)}
                >
                  <span className="modifier-name">{tag}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="result-buttons">
            <button className="result-btn win" onClick={() => handleEndGame('win')}>
              Victory
            </button>
            <button className="result-btn loss" onClick={() => handleEndGame('loss')}>
              Defeat
            </button>
            <button className="result-btn draw" onClick={() => handleEndGame('draw')}>
              Draw
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Companion;
