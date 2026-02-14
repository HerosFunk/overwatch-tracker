const express = require('express');
const router = express.Router();
const statsService = require('../services/statsService');
const Season = require('../models/Season');

// Get overall stats for current or specific season
router.get('/overall', async (req, res) => {
  try {
    const { season } = req.query;
    let seasonName = season;
    
    if (!seasonName) {
      const activeSeason = await Season.findOne({ isActive: true });
      seasonName = activeSeason ? activeSeason.name : null;
    }
    
    if (!seasonName) {
      return res.status(400).json({ error: 'No season specified or active' });
    }
    
    const stats = await statsService.getOverallStats(seasonName);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get hero stats
router.get('/heroes', async (req, res) => {
  try {
    const { season } = req.query;
    let seasonName = season;
    
    if (!seasonName) {
      const activeSeason = await Season.findOne({ isActive: true });
      seasonName = activeSeason ? activeSeason.name : null;
    }
    
    if (!seasonName) {
      return res.status(400).json({ error: 'No season specified or active' });
    }
    
    const stats = await statsService.getHeroStats(seasonName);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get map stats
router.get('/maps', async (req, res) => {
  try {
    const { season } = req.query;
    let seasonName = season;
    
    if (!seasonName) {
      const activeSeason = await Season.findOne({ isActive: true });
      seasonName = activeSeason ? activeSeason.name : null;
    }
    
    if (!seasonName) {
      return res.status(400).json({ error: 'No season specified or active' });
    }
    
    const stats = await statsService.getMapStats(seasonName);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats for specific map pool (for companion mode)
router.post('/map-pool', async (req, res) => {
  try {
    const { mapPool, season } = req.body;
    
    if (!mapPool || !Array.isArray(mapPool)) {
      return res.status(400).json({ error: 'mapPool array is required' });
    }
    
    let seasonName = season;
    if (!seasonName) {
      const activeSeason = await Season.findOne({ isActive: true });
      seasonName = activeSeason ? activeSeason.name : null;
    }
    
    if (!seasonName) {
      return res.status(400).json({ error: 'No season specified or active' });
    }
    
    const stats = await statsService.getMapPoolStats(seasonName, mapPool);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get best and worst heroes
router.get('/heroes/best-worst', async (req, res) => {
  try {
    const { season } = req.query;
    let seasonName = season;
    
    if (!seasonName) {
      const activeSeason = await Season.findOne({ isActive: true });
      seasonName = activeSeason ? activeSeason.name : null;
    }
    
    if (!seasonName) {
      return res.status(400).json({ error: 'No season specified or active' });
    }
    
    const stats = await statsService.getBestWorstHeroes(seasonName);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get SR history
router.get('/sr-history', async (req, res) => {
  try {
    const { season } = req.query;
    let seasonName = season;
    
    if (!seasonName) {
      const activeSeason = await Season.findOne({ isActive: true });
      seasonName = activeSeason ? activeSeason.name : null;
    }
    
    if (!seasonName) {
      return res.status(400).json({ error: 'No season specified or active' });
    }
    
    const history = await statsService.getSRHistory(seasonName);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get companion tips (contextual stats for each companion step)
router.get('/companion-tips', async (req, res) => {
  try {
    const { season } = req.query;
    let seasonName = season;

    if (!seasonName) {
      const activeSeason = await Season.findOne({ isActive: true });
      seasonName = activeSeason ? activeSeason.name : null;
    }

    if (!seasonName) {
      return res.status(400).json({ error: 'No season specified or active' });
    }

    const tips = await statsService.getCompanionTips(seasonName);
    res.json(tips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== GLOBAL STATS (ALL SEASONS) =====

router.get('/global/overall', async (req, res) => {
  try {
    const stats = await statsService.getGlobalOverallStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/global/heroes', async (req, res) => {
  try {
    const stats = await statsService.getGlobalHeroStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/global/maps', async (req, res) => {
  try {
    const stats = await statsService.getGlobalMapStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== MATCHUP MATRIX =====

router.get('/matchup-matrix', async (req, res) => {
  try {
    const { season } = req.query;
    let seasonName = season || null;

    if (!seasonName) {
      const activeSeason = await Season.findOne({ isActive: true });
      seasonName = activeSeason ? activeSeason.name : null;
    }

    // Pass null for global, season name for season-specific
    const matrix = await statsService.getMatchupMatrix(req.query.global === 'true' ? null : seasonName);
    res.json(matrix);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== HERO RECOMMENDATION =====

router.post('/hero-recommendation', async (req, res) => {
  try {
    const { map, bans, opponentTanks, season } = req.body;

    if (!map) {
      return res.status(400).json({ error: 'map is required' });
    }

    let seasonName = season;
    if (!seasonName) {
      const activeSeason = await Season.findOne({ isActive: true });
      seasonName = activeSeason ? activeSeason.name : null;
    }

    if (!seasonName) {
      return res.status(400).json({ error: 'No season specified or active' });
    }

    const recommendations = await statsService.getHeroRecommendation(seasonName, map, bans || [], opponentTanks || []);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== MAP VOTE STRATEGY =====

router.post('/map-vote-strategy', async (req, res) => {
  try {
    const { mapPool, bans, season } = req.body;

    if (!mapPool || !Array.isArray(mapPool)) {
      return res.status(400).json({ error: 'mapPool array is required' });
    }

    let seasonName = season;
    if (!seasonName) {
      const activeSeason = await Season.findOne({ isActive: true });
      seasonName = activeSeason ? activeSeason.name : null;
    }

    if (!seasonName) {
      return res.status(400).json({ error: 'No season specified or active' });
    }

    const strategy = await statsService.getMapVoteStrategy(seasonName, mapPool, bans || []);
    res.json(strategy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== HERO POOL =====

router.get('/hero-pool', async (req, res) => {
  try {
    const { season } = req.query;
    let seasonName = season || null;

    if (!seasonName && req.query.global !== 'true') {
      const activeSeason = await Season.findOne({ isActive: true });
      seasonName = activeSeason ? activeSeason.name : null;
    }

    const pool = await statsService.getHeroPool(req.query.global === 'true' ? null : seasonName);
    res.json(pool);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== COMFORT SCORES =====

router.get('/comfort-scores', async (req, res) => {
  try {
    const { season, map } = req.query;
    let seasonName = season || null;

    if (!seasonName) {
      const activeSeason = await Season.findOne({ isActive: true });
      seasonName = activeSeason ? activeSeason.name : null;
    }

    const scores = await statsService.getComfortScores(seasonName, map || null);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== BRIEFING CARD =====

router.post('/briefing-card', async (req, res) => {
  try {
    const { map, bans, season } = req.body;

    if (!map) {
      return res.status(400).json({ error: 'map is required' });
    }

    let seasonName = season;
    if (!seasonName) {
      const activeSeason = await Season.findOne({ isActive: true });
      seasonName = activeSeason ? activeSeason.name : null;
    }

    if (!seasonName) {
      return res.status(400).json({ error: 'No season specified or active' });
    }

    const briefing = await statsService.getBriefingCard(seasonName, map, bans || []);
    res.json(briefing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== RANK HISTORY =====

router.get('/rank-history', async (req, res) => {
  try {
    const { season } = req.query;
    let seasonName = season;

    if (!seasonName) {
      const activeSeason = await Season.findOne({ isActive: true });
      seasonName = activeSeason ? activeSeason.name : null;
    }

    if (!seasonName) {
      return res.status(400).json({ error: 'No season specified or active' });
    }

    const history = await statsService.getRankHistory(seasonName);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
