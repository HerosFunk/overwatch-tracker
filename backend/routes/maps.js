const express = require('express');
const router = express.Router();
const { MAPS_BY_MODE } = require('../data/overwatchData');

// Get all maps organized by mode
router.get('/by-mode', (req, res) => {
  try {
    res.json(MAPS_BY_MODE);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get maps by specific mode
router.get('/mode/:mode', (req, res) => {
  try {
    const { mode } = req.params;
    const maps = MAPS_BY_MODE[mode];

    if (!maps) {
      return res.status(404).json({ error: `Invalid game mode: ${mode}` });
    }

    res.json({
      mode: mode,
      maps: maps
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all available maps (flat list)
router.get('/', (req, res) => {
  try {
    const allMaps = [];
    Object.values(MAPS_BY_MODE).forEach(modeMap => {
      modeMap.forEach(map => {
        allMaps.push(map.name);
      });
    });
    res.json(allMaps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
