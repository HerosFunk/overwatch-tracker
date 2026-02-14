import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Companion from './components/Companion';
import GameHistory from './components/GameHistory';
import SeasonManager from './components/SeasonManager';
import { getActiveSeason } from './api';
import './App.css';

function App() {
  const [activeSeason, setActiveSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSeasonManager, setShowSeasonManager] = useState(false);

  useEffect(() => {
    fetchActiveSeason();
  }, []);

  const fetchActiveSeason = async () => {
    try {
      const response = await getActiveSeason();
      setActiveSeason(response.data);
    } catch (error) {
      console.error('No active season found:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeasonChange = () => {
    fetchActiveSeason();
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading Overwatch Tracker...</p>
      </div>
    );
  }

  if (!activeSeason) {
    return (
      <div className="app-error">
        <h2>⚠️ No Active Season</h2>
        <p>Create your first season to start tracking your games</p>
        <button 
          className="create-first-season-btn"
          onClick={() => setShowSeasonManager(true)}
        >
          ⚙️ Create Season
        </button>
        
        {showSeasonManager && (
          <SeasonManager 
            onClose={() => setShowSeasonManager(false)}
            onSeasonChange={handleSeasonChange}
          />
        )}
      </div>
    );
  }

  return (
    <Router basename="/overwatch-tracker">
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand">
              <h1>⚔️ OW Tank Tracker</h1>
              <span className="nav-subtitle">{activeSeason.name}</span>
            </div>
            <div className="nav-links">
              <Link to="/" className="nav-link">
                📊 Dashboard
              </Link>
              <Link to="/history" className="nav-link">
                📜 History
              </Link>
              <Link to="/companion" className="nav-link companion-link">
                🎮 Companion
              </Link>
              <button 
                className="settings-btn"
                onClick={() => setShowSeasonManager(true)}
                title="Manage Seasons"
              >
                ⚙️
              </button>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={<Dashboard activeSeason={activeSeason} />} 
            />
            <Route
              path="/history"
              element={<GameHistory activeSeason={activeSeason} />}
            />
            <Route
              path="/companion"
              element={<Companion activeSeason={activeSeason} />}
            />
          </Routes>
        </main>

        <footer className="footer">
          <p>Overwatch Tank Tracker • {activeSeason.name}</p>
        </footer>

        {/* Season Manager Modal */}
        {showSeasonManager && (
          <SeasonManager 
            onClose={() => setShowSeasonManager(false)}
            onSeasonChange={handleSeasonChange}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
