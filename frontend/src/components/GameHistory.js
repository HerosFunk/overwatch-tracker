import React, { useState, useEffect } from 'react';
import { getGames } from '../api';
import { getMapImage, TANK_HEROES_DATA, getRankColor } from '../constants';
import GameDetail from './GameDetail';
import './GameHistory.css';

function GameHistory({ activeSeason }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    if (activeSeason) {
      fetchGames();
    }
  }, [activeSeason]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await getGames(activeSeason.name);
      setGames(response.data);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="game-history loading">Loading games...</div>;
  }

  if (selectedGame) {
    return (
      <GameDetail
        game={selectedGame}
        onBack={() => setSelectedGame(null)}
      />
    );
  }

  return (
    <div className="game-history">
      <div className="history-header">
        <h2>Game History</h2>
        <span className="game-count">{games.length} games</span>
      </div>

      {games.length === 0 ? (
        <div className="no-games">
          <p>No games recorded yet this season.</p>
        </div>
      ) : (
        <div className="games-list">
          {games.map((game) => {
            const mapData = getMapImage(game.map);
            const heroes = game.heroesPlayed?.map(h => h.hero) || [];
            const srChange = game.srChange;

            return (
              <button
                key={game._id}
                className={`game-row ${game.result}`}
                onClick={() => setSelectedGame(game)}
              >
                <div className="game-result-indicator">
                  {game.result === 'win' ? 'W' : game.result === 'loss' ? 'L' : 'D'}
                </div>

                <div className="game-map-info">
                  {mapData && (
                    <img src={mapData.image} alt={game.map} className="game-row-map-img" />
                  )}
                  <div className="game-map-text">
                    <span className="game-map-name">{game.map}</span>
                    <span className="game-date">
                      {new Date(game.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className="game-heroes-preview">
                  {heroes.slice(0, 3).map(hero => (
                    TANK_HEROES_DATA[hero] ? (
                      <img
                        key={hero}
                        src={TANK_HEROES_DATA[hero].image}
                        alt={hero}
                        className="game-hero-icon"
                        title={hero}
                      />
                    ) : (
                      <span key={hero} className="game-hero-text">{hero}</span>
                    )
                  ))}
                  {heroes.length > 3 && (
                    <span className="heroes-more">+{heroes.length - 3}</span>
                  )}
                </div>

                <div className="game-sr-info">
                  {game.rankAfter ? (
                    <>
                      <span className="game-rank-value" style={{ color: getRankColor(game.rankAfter) }}>
                        {game.rankAfter}
                      </span>
                      {game.rankPercentAfter != null && (
                        <span className="game-rank-pct">{game.rankPercentAfter}%</span>
                      )}
                      {game.rankChange && game.rankChange !== 'same' && (
                        <span className={`game-sr-change ${['up', 'promoted'].includes(game.rankChange) ? 'positive' : 'negative'}`}>
                          {game.rankChange === 'promoted' ? 'UP' : game.rankChange === 'demoted' ? 'DOWN' : game.rankChange}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {game.srAfter != null && (
                        <span className="game-sr-value">{game.srAfter}</span>
                      )}
                      {srChange != null && (
                        <span className={`game-sr-change ${srChange >= 0 ? 'positive' : 'negative'}`}>
                          {srChange >= 0 ? '+' : ''}{srChange}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {game.matchScore?.wins != null && game.matchScore?.losses != null && (
                  <div className="game-score">
                    {game.matchScore.wins} - {game.matchScore.losses}
                  </div>
                )}

                <div className="game-row-arrow">&#8250;</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GameHistory;
