import React, { useState, useEffect } from 'react';
import {
  getSeasons,
  createSeason,
  activateSeason,
  deleteSeason
} from '../api';
import { RANKS, getRankColor } from '../constants';
import './SeasonManager.css';

function SeasonManager({ onClose, onSeasonChange }) {
  const [seasons, setSeasons] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    startingRank: '',
    startingRankPercent: ''
  });

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const response = await getSeasons();
      setSeasons(response.data);
    } catch (error) {
      console.error('Error fetching seasons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startDate) {
      alert('Nom et date de début requis');
      return;
    }

    try {
      const seasonData = {
        name: formData.name,
        startDate: new Date(formData.startDate).toISOString(),
        isActive: seasons.length === 0,
        startingRank: formData.startingRank || undefined,
        startingRankPercent: formData.startingRankPercent ? parseInt(formData.startingRankPercent) : undefined
      };

      await createSeason(seasonData);

      // Reset form
      setFormData({
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        startingRank: '',
        startingRankPercent: ''
      });
      setShowCreateForm(false);
      
      // Refresh
      await fetchSeasons();
      if (onSeasonChange) onSeasonChange();
      
      alert('Saison créée avec succès !');
    } catch (error) {
      console.error('Error creating season:', error);
      alert('Erreur lors de la création de la saison');
    }
  };

  const handleActivate = async (seasonId) => {
    if (!window.confirm('Activer cette saison ? (Les autres seront désactivées)')) {
      return;
    }

    try {
      await activateSeason(seasonId);
      await fetchSeasons();
      if (onSeasonChange) onSeasonChange();
      alert('Saison activée !');
    } catch (error) {
      console.error('Error activating season:', error);
      alert('Erreur lors de l\'activation');
    }
  };

  const handleDelete = async (seasonId, seasonName) => {
    if (!window.confirm(`Supprimer la saison "${seasonName}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await deleteSeason(seasonId);
      await fetchSeasons();
      if (onSeasonChange) onSeasonChange();
      alert('Saison supprimée');
    } catch (error) {
      console.error('Error deleting season:', error);
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="season-manager-overlay" onClick={onClose}>
      <div className="season-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Gestion des Saisons</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {/* Create Season Button */}
          {!showCreateForm && (
            <button 
              className="create-season-btn"
              onClick={() => setShowCreateForm(true)}
            >
              + Nouvelle Saison
            </button>
          )}

          {/* Create Form */}
          {showCreateForm && (
            <form className="create-form" onSubmit={handleCreate}>
              <h3>Créer une nouvelle saison</h3>
              
              <div className="form-group">
                <label>Nom de la saison *</label>
                <input
                  type="text"
                  placeholder="ex: Season 14"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date de début *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Rang de depart (optionnel)</label>
                <select
                  value={formData.startingRank}
                  onChange={(e) => setFormData({ ...formData, startingRank: e.target.value })}
                >
                  <option value="">-- Selectionner --</option>
                  {RANKS.map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
              </div>

              {formData.startingRank && (
                <div className="form-group">
                  <label>Progression initiale (%)</label>
                  <input
                    type="number"
                    placeholder="ex: 50"
                    min="0"
                    max="100"
                    value={formData.startingRankPercent}
                    onChange={(e) => setFormData({ ...formData, startingRankPercent: e.target.value })}
                  />
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  Créer
                </button>
              </div>
            </form>
          )}

          {/* Seasons List */}
          <div className="seasons-list">
            <h3>Saisons existantes</h3>
            
            {loading ? (
              <p className="loading-text">Chargement...</p>
            ) : seasons.length === 0 ? (
              <p className="empty-text">Aucune saison créée</p>
            ) : (
              <div className="seasons-grid">
                {seasons.map((season) => (
                  <div 
                    key={season._id} 
                    className={`season-card ${season.isActive ? 'active' : ''}`}
                  >
                    <div className="season-info">
                      <h4>{season.name}</h4>
                      <p className="season-date">
                        Début: {new Date(season.startDate).toLocaleDateString()}
                      </p>
                      {season.startingRank && (
                        <p className="season-sr" style={{ color: getRankColor(season.startingRank) }}>
                          Rang initial: {season.startingRank}
                          {season.startingRankPercent != null && ` (${season.startingRankPercent}%)`}
                        </p>
                      )}
                      {!season.startingRank && season.startingSR && (
                        <p className="season-sr">SR initial: {season.startingSR}</p>
                      )}
                      {season.isActive && (
                        <span className="active-badge">🟢 Active</span>
                      )}
                    </div>
                    
                    <div className="season-actions">
                      {!season.isActive && (
                        <button
                          className="activate-btn"
                          onClick={() => handleActivate(season._id)}
                        >
                          Activer
                        </button>
                      )}
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(season._id, season.name)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeasonManager;
