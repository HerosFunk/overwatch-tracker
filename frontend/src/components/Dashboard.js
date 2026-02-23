import React, { useState, useEffect } from 'react';
import {
  getOverallStats,
  getHeroStats,
  getMapStats,
  getBestWorstHeroes,
  getSRHistory,
  getGlobalOverallStats,
  getGlobalHeroStats,
  getGlobalMapStats,
  getMatchupMatrix,
  getHeroPool
} from '../api';
import { getMapImage, TANK_HEROES_DATA, getRankColor, RANKS } from '../constants';
import MatchupMatrix from './MatchupMatrix';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const CONFIDENCE_LABELS = {
  main: { label: 'Main', color: '#ff9100' },
  comfortable: { label: 'Comfortable', color: '#4caf50' },
  flex: { label: 'Flex', color: '#2196f3' },
  pocket: { label: 'Pocket', color: '#888' }
};

function Dashboard({ activeSeason }) {
  const [overallStats, setOverallStats] = useState(null);
  const [heroStats, setHeroStats] = useState([]);
  const [mapStats, setMapStats] = useState([]);
  const [bestWorst, setBestWorst] = useState({ best: [], worst: [] });
  const [srHistory, setSrHistory] = useState([]);
  const [matchupData, setMatchupData] = useState([]);
  const [heroPoolData, setHeroPoolData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('season'); // 'season' | 'global'

  useEffect(() => {
    if (activeSeason) {
      fetchAllStats();
    }
  }, [activeSeason, viewMode]);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const isGlobal = viewMode === 'global';
      const seasonName = activeSeason.name;

      const [overall, heroes, maps, bw, sr, matchups, pool] = await Promise.all([
        isGlobal ? getGlobalOverallStats() : getOverallStats(seasonName),
        isGlobal ? getGlobalHeroStats() : getHeroStats(seasonName),
        isGlobal ? getGlobalMapStats() : getMapStats(seasonName),
        getBestWorstHeroes(seasonName),
        getSRHistory(seasonName),
        getMatchupMatrix(seasonName, isGlobal),
        getHeroPool(seasonName, isGlobal)
      ]);

      setOverallStats(overall.data);
      setHeroStats(heroes.data);
      setMapStats(maps.data);
      setBestWorst(bw.data);
      setSrHistory(sr.data);
      setMatchupData(matchups.data);
      setHeroPoolData(pool.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard loading">Loading stats...</div>;
  }

  if (!overallStats) {
    return (
      <div className="dashboard empty">
        <h2>No games recorded yet</h2>
        <p>Start tracking your ranked games with the Companion mode!</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Stats</h2>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'season' ? 'active' : ''}`}
            onClick={() => setViewMode('season')}
          >
            {activeSeason?.name}
          </button>
          <button
            className={`toggle-btn ${viewMode === 'global' ? 'active' : ''}`}
            onClick={() => setViewMode('global')}
          >
            All-Time
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-label">Rang actuel</div>
          {overallStats.currentRank ? (
            <>
              <div className="stat-value large" style={{ color: getRankColor(overallStats.currentRank) }}>
                {overallStats.currentRank}
              </div>
              {overallStats.currentRankPercent != null && (
                <div className="stat-detail">{overallStats.currentRankPercent}%</div>
              )}
              {viewMode === 'season' && overallStats.rankProgression != null && overallStats.rankProgression !== 0 && (
                <div className={`stat-change ${overallStats.rankProgression > 0 ? 'positive' : 'negative'}`}>
                  {overallStats.rankProgression > 0 ? '+' : ''}{overallStats.rankProgression} divisions
                </div>
              )}
              {viewMode === 'global' && overallStats.peakRank && (
                <div className="stat-change">
                  Peak: <span style={{ color: getRankColor(overallStats.peakRank) }}>{overallStats.peakRank}</span>
                </div>
              )}
            </>
          ) : overallStats.currentSR ? (
            <>
              <div className="stat-value large">{overallStats.currentSR}</div>
              {viewMode === 'season' && overallStats.srChange != null && (
                <div className={`stat-change ${overallStats.srChange >= 0 ? 'positive' : 'negative'}`}>
                  {overallStats.srChange >= 0 ? '+' : ''}{overallStats.srChange} this season
                </div>
              )}
            </>
          ) : (
            <div className="stat-value large">-</div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-label">Games Played</div>
          <div className="stat-value">{overallStats.totalGames}</div>
          <div className="stat-detail">
            {overallStats.wins}W - {overallStats.losses}L
            {overallStats.draws > 0 && ` - ${overallStats.draws}D`}
          </div>
          {viewMode === 'global' && overallStats.seasonsPlayed && (
            <div className="stat-detail">{overallStats.seasonsPlayed} seasons</div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-label">Winrate</div>
          <div className={`stat-value ${parseFloat(overallStats.winrate) >= 50 ? 'positive' : 'negative'}`}>
            {overallStats.winrate}%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Current Streak</div>
          <div className={`stat-value ${overallStats.currentStreak >= 0 ? 'positive' : 'negative'}`}>
            {Math.abs(overallStats.currentStreak)}
            <span className="streak-type">
              {overallStats.currentStreak > 0 ? ' W' : overallStats.currentStreak < 0 ? ' L' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Rank/SR Graph (season only) */}
      {srHistory.length > 0 && (() => {
        const hasRankData = srHistory.some(d => d.rank);
        // Convert rank + percent to a continuous numeric value for the chart
        // Each rank = 100 points, percent = position within that rank
        const rankToNumeric = (rank, pct) => {
          const idx = RANKS.indexOf(rank);
          if (idx < 0) return 0;
          return idx * 100 + (pct || 0);
        };
        const numericToRank = (value) => {
          const idx = Math.floor(value / 100);
          const pct = Math.round(value % 100);
          return { rank: RANKS[idx] || '?', pct };
        };

        const chartData = srHistory.map(d => ({
          ...d,
          numericRank: d.rank ? rankToNumeric(d.rank, d.rankPercent) : (d.sr || 0)
        }));

        // Compute Y-axis domain: zoom to data range with 1 rank padding above/below
        const numericValues = chartData.map(d => d.numericRank).filter(v => v > 0);
        const dataMin = Math.min(...numericValues);
        const dataMax = Math.max(...numericValues);
        // Snap to full rank boundaries (multiples of 100) with 1 rank padding
        const yMin = Math.max(0, Math.floor(dataMin / 100 - 1) * 100);
        const yMax = Math.min(RANKS.length * 100, Math.ceil(dataMax / 100 + 1) * 100);

        // Generate ticks at each rank boundary within range
        const yTicks = [];
        for (let v = yMin; v <= yMax; v += 100) {
          yTicks.push(v);
        }

        return (
          <div className="chart-container">
            <h3>{hasRankData ? 'Rank Evolution' : 'SR Evolution'}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  stroke="#888"
                />
                <YAxis
                  stroke="#888"
                  domain={hasRankData ? [yMin, yMax] : ['auto', 'auto']}
                  ticks={hasRankData ? yTicks : undefined}
                  tickFormatter={hasRankData ? (val) => {
                    const { rank } = numericToRank(val);
                    return rank;
                  } : undefined}
                  width={hasRankData ? 90 : 60}
                />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                  labelFormatter={(date) => new Date(date).toLocaleString()}
                  formatter={(value, name, props) => {
                    const entry = props.payload;
                    if (entry.rank) return [`${entry.rank} (${entry.rankPercent || 0}%)`, 'Rang'];
                    return [value, 'SR'];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="numericRank"
                  stroke="#ff9100"
                  strokeWidth={3}
                  dot={{ fill: '#ff9100', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })()}

      {/* Hero Pool */}
      {heroPoolData.length > 0 && (
        <div className="detailed-stats">
          <h3>Your Hero Pool</h3>
          <div className="hero-pool-tiers">
            {['main', 'comfortable', 'flex', 'pocket'].map(tier => {
              const tierHeroes = heroPoolData.filter(h => h.confidence === tier);
              if (tierHeroes.length === 0) return null;
              const conf = CONFIDENCE_LABELS[tier];
              return (
                <div key={tier} className="pool-tier">
                  <div className="pool-tier-header" style={{ borderColor: conf.color }}>
                    <span className="pool-tier-label" style={{ color: conf.color }}>{conf.label}</span>
                    <span className="pool-tier-count">{tierHeroes.length} heroes</span>
                  </div>
                  <div className="pool-heroes-grid">
                    {tierHeroes.map(h => (
                      <div key={h.hero} className="pool-hero-card">
                        {TANK_HEROES_DATA[h.hero] && (
                          <img src={TANK_HEROES_DATA[h.hero].image} alt={h.hero} className="pool-hero-img" />
                        )}
                        <div className="pool-hero-info">
                          <span className="pool-hero-name">{h.hero}</span>
                          <span className={`pool-hero-wr ${parseFloat(h.winrate) >= 50 ? 'positive' : 'negative'}`}>
                            {h.winrate}%
                          </span>
                          <span className="pool-hero-games">{h.games}g</span>
                          {h.trend !== 'stable' && (
                            <span className={`pool-hero-trend ${h.trend}`}>
                              {h.trend === 'hot' ? '\u2191' : '\u2193'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Best/Worst Heroes */}
      {(bestWorst.best.length > 0 || bestWorst.worst.length > 0) && (
        <div className="heroes-comparison">
          {bestWorst.best.length > 0 && (
            <div className="heroes-section">
              <h3>Best Heroes</h3>
              <div className="heroes-list">
                {bestWorst.best.map(hero => (
                  <div key={hero.hero} className="hero-card best">
                    {TANK_HEROES_DATA[hero.hero] && (
                      <img src={TANK_HEROES_DATA[hero.hero].image} alt={hero.hero} className="hero-card-img" />
                    )}
                    <div className="hero-name">{hero.hero}</div>
                    <div className="hero-stats">
                      <span className="winrate positive">{hero.winrate}%</span>
                      <span className="games">{hero.games} games</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bestWorst.worst.length > 0 && (
            <div className="heroes-section">
              <h3>Needs Work</h3>
              <div className="heroes-list">
                {bestWorst.worst.map(hero => (
                  <div key={hero.hero} className="hero-card worst">
                    {TANK_HEROES_DATA[hero.hero] && (
                      <img src={TANK_HEROES_DATA[hero.hero].image} alt={hero.hero} className="hero-card-img" />
                    )}
                    <div className="hero-name">{hero.hero}</div>
                    <div className="hero-stats">
                      <span className="winrate negative">{hero.winrate}%</span>
                      <span className="games">{hero.games} games</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Matchup Matrix */}
      <div className="detailed-stats">
        <h3>Matchup Matrix (You vs Opponent)</h3>
        <MatchupMatrix data={matchupData} />
      </div>

      {/* All Heroes Stats */}
      {heroStats.length > 0 && (
        <div className="detailed-stats">
          <h3>Hero Performance</h3>
          <div className="stats-table">
            <div className="table-header">
              <span>Hero</span>
              <span>Games</span>
              <span>Winrate</span>
              <span>Record</span>
            </div>
            {heroStats.map(hero => (
              <div key={hero.hero} className="table-row">
                <span className="hero-name-cell">{hero.hero}</span>
                <span>{hero.games}</span>
                <span className={parseFloat(hero.winrate) >= 50 ? 'positive' : 'negative'}>
                  {hero.winrate}%
                </span>
                <span className="record">{hero.wins}W - {hero.losses}L</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Stats */}
      {mapStats.length > 0 && (
        <div className="detailed-stats">
          <h3>Map Stats</h3>
          <div className="maps-grid-view">
            {mapStats.map(map => {
              const mapData = getMapImage(map.map);
              return (
                <div key={map.map} className="map-stat-card">
                  {mapData && (
                    <img src={mapData.image} alt={map.map} className="map-stat-image" />
                  )}
                  <div className="map-stat-content">
                    <div className="map-stat-name">{map.map}</div>
                    {mapData && <small className="map-stat-region">{mapData.region}</small>}
                    <div className="map-stat-body">
                      <div className="stat-row">
                        <span className="stat-label">Games</span>
                        <span className="stat-val">{map.games}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Winrate</span>
                        <span className={`stat-val ${parseFloat(map.winrate) >= 50 ? 'positive' : 'negative'}`}>
                          {map.winrate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
