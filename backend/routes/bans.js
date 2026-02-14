const express = require('express');
const router = express.Router();
const Season = require('../models/Season');
const { HEROES_BY_SUBCLASS } = require('../data/overwatchData');

// Get current ban pool
router.get('/pool', async (req, res) => {
  try {
    const activeSeason = await Season.findOne({ isActive: true });
    if (!activeSeason) {
      return res.status(404).json({ error: 'No active season found' });
    }

    const banPool = activeSeason.banPool || getAllBannableHeroes();

    res.json({
      season: activeSeason.name,
      banPool: banPool
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get heroes by subclass for banning
router.get('/heroes-by-subclass', (req, res) => {
  try {
    res.json(HEROES_BY_SUBCLASS);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all bannable heroes
router.get('/all', (req, res) => {
  try {
    const allHeroes = getAllBannableHeroes();
    res.json(allHeroes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ban pool for current season
router.put('/pool', async (req, res) => {
  try {
    const { banPool } = req.body;

    if (!Array.isArray(banPool) || banPool.length === 0) {
      return res.status(400).json({ error: 'Ban pool must be a non-empty array' });
    }

    const activeSeason = await Season.findOneAndUpdate(
      { isActive: true },
      { banPool: banPool },
      { new: true }
    );

    if (!activeSeason) {
      return res.status(404).json({ error: 'No active season found' });
    }

    res.json(activeSeason);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get all bannable heroes
function getAllBannableHeroes() {
  const heroes = [];
  Object.values(HEROES_BY_SUBCLASS).forEach(subclass => {
    Object.values(subclass).forEach(heroArray => {
      heroArray.forEach(hero => {
        if (hero.bannable) {
          heroes.push(hero.name);
        }
      });
    });
  });
  return heroes;
}

module.exports = router;
