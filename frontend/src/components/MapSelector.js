import React, { useState, useEffect } from 'react';
import { getMapsByMode } from '../api';
import './MapSelector.css';

function MapSelector({ onMapSelected, mapPool = [] }) {
  const [mapsByMode, setMapsByMode] = useState({});
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedMaps, setSelectedMaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await getMapsByMode();
        setMapsByMode(response.data);
        const firstMode = Object.keys(response.data)[0];
        setSelectedMode(firstMode);
      } catch (error) {
        console.error('Error fetching maps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();
  }, []);

  const handleMapSelect = (mapName) => {
    if (selectedMaps.includes(mapName)) {
      setSelectedMaps(selectedMaps.filter(m => m !== mapName));
    } else {
      if (selectedMaps.length < 3) {
        setSelectedMaps([...selectedMaps, mapName]);
      }
    }
  };

  const handleComplete = () => {
    if (selectedMaps.length === 3) {
      onMapSelected({
        mapPool: selectedMaps,
        mode: selectedMode
      });
    }
  };

  if (loading) {
    return <div className="map-selector-loading">Loading maps...</div>;
  }

  const currentModeMap = mapsByMode[selectedMode] || [];

  return (
    <div className="map-selector">
      <h3>Select 3 Maps</h3>
      
      <div className="mode-tabs">
        {Object.keys(mapsByMode).map(mode => (
          <button
            key={mode}
            className={`mode-tab ${selectedMode === mode ? 'active' : ''}`}
            onClick={() => setSelectedMode(mode)}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      <div className="maps-grid">
        {currentModeMap.map(mapObj => (
          <button
            key={mapObj.name}
            className={`map-card ${selectedMaps.includes(mapObj.name) ? 'selected' : ''}`}
            onClick={() => handleMapSelect(mapObj.name)}
          >
            <div className="map-icon">🗺️</div>
            <div className="map-name">{mapObj.name}</div>
            {selectedMaps.includes(mapObj.name) && (
              <div className="selection-number">
                {selectedMaps.indexOf(mapObj.name) + 1}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="selection-summary">
        <p>Selected: {selectedMaps.length}/3</p>
        {selectedMaps.length > 0 && (
          <div className="selected-list">
            {selectedMaps.map((map, idx) => (
              <span key={map} className="selected-item">
                {idx + 1}. {map}
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        className="confirm-btn"
        onClick={handleComplete}
        disabled={selectedMaps.length !== 3}
      >
        Confirm Selection
      </button>
    </div>
  );
}

export default MapSelector;
