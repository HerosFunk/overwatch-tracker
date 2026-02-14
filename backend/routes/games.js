const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const Season = require('../models/Season');
const { getMapMode } = require('../utils/mapUtils');

// Get all games (with optional season filter)
router.get('/', async (req, res) => {
  try {
    const { season } = req.query;
    const filter = season ? { season } : {};
    
    const games = await Game.find(filter).sort({ date: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single game
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new game
router.post('/', async (req, res) => {
  try {
    // Get active season
    const activeSeason = await Season.findOne({ isActive: true });
    if (!activeSeason) {
      return res.status(400).json({ error: 'No active season found' });
    }

    const rounds = req.body.rounds || [];
    const mapName = req.body.selectedMap;
    const mapMode = getMapMode(mapName);

    // Derive heroes from rounds if available, otherwise use legacy format
    let heroesPlayedBySide;
    let heroesPlayedArray;

    if (rounds.length > 0) {
      // Derive from rounds data
      const attackHeroes = new Set();
      const defenseHeroes = new Set();
      const allHeroesSet = new Set();

      rounds.forEach(round => {
        const heroes = [round.startingHero, round.endingHero, ...(round.heroSwitches || []).map(s => s.to)].filter(Boolean);
        heroes.forEach(h => allHeroesSet.add(h));

        if (round.phase === 'attack') heroes.forEach(h => attackHeroes.add(h));
        else if (round.phase === 'defense') heroes.forEach(h => defenseHeroes.add(h));
        else {
          // neutral/control/flashpoint/clash: add to both
          heroes.forEach(h => { attackHeroes.add(h); defenseHeroes.add(h); });
        }
      });

      heroesPlayedBySide = { attack: [...attackHeroes], defense: [...defenseHeroes] };
      heroesPlayedArray = [...allHeroesSet].map(hero => ({ hero }));
    } else {
      // Legacy format from frontend
      heroesPlayedBySide = req.body.heroesPlayed || { attack: [], defense: [] };
      const allHeroes = [
        ...(heroesPlayedBySide.attack || []),
        ...(heroesPlayedBySide.defense || [])
      ];
      const uniqueHeroes = [...new Set(allHeroes)];
      heroesPlayedArray = uniqueHeroes.map(hero => ({ hero }));
    }

    // Derive matchup pairs from heroes + opponent tanks
    const opponentTanks = req.body.opponentTanks || [];
    const matchups = [];
    if (opponentTanks.length > 0) {
      if (rounds.length > 0) {
        // Use per-round heroes for more accurate matchups
        const roundHeroes = new Set();
        rounds.forEach(r => {
          if (r.startingHero) roundHeroes.add(r.startingHero);
          if (r.endingHero) roundHeroes.add(r.endingHero);
          (r.heroSwitches || []).forEach(s => { if (s.to) roundHeroes.add(s.to); });
        });
        roundHeroes.forEach(myH => {
          opponentTanks.forEach(oppH => {
            matchups.push({ myHero: myH, opponentHero: oppH });
          });
        });
      } else {
        heroesPlayedArray.forEach(({ hero }) => {
          opponentTanks.forEach(oppH => {
            matchups.push({ myHero: hero, opponentHero: oppH });
          });
        });
      }
    }

    // Rank tracking
    const rankAfter = req.body.rankAfter || null;
    const rankPercentAfter = req.body.rankPercentAfter != null ? parseInt(req.body.rankPercentAfter) : null;

    // Determine rank change from previous game
    let rankChange = 'same';
    const lastGame = await Game.findOne({ season: activeSeason.name }).sort({ date: -1 });
    if (lastGame && lastGame.rankAfter && rankAfter) {
      const { RANKS } = require('../data/overwatchData');
      const prevIdx = RANKS.indexOf(lastGame.rankAfter);
      const currIdx = RANKS.indexOf(rankAfter);
      if (currIdx > prevIdx) rankChange = 'promoted';
      else if (currIdx < prevIdx) rankChange = 'demoted';
      else if (rankPercentAfter != null && lastGame.rankPercentAfter != null) {
        rankChange = rankPercentAfter > lastGame.rankPercentAfter ? 'up' : rankPercentAfter < lastGame.rankPercentAfter ? 'down' : 'same';
      }
    }

    // Legacy SR support
    let srChange = null;
    const srAfter = req.body.srAfter;
    if (srAfter != null && !isNaN(srAfter)) {
      if (lastGame && lastGame.srAfter != null) {
        srChange = srAfter - lastGame.srAfter;
      }
    }

    // Session tracking: group games played within 30 minutes of each other
    let sessionId = null;
    if (lastGame) {
      const timeSinceLastGame = Date.now() - new Date(lastGame.date).getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      if (timeSinceLastGame < thirtyMinutes && lastGame.sessionId) {
        sessionId = lastGame.sessionId;
      } else if (timeSinceLastGame < thirtyMinutes) {
        sessionId = `session-${Date.now()}`;
      } else {
        sessionId = `session-${Date.now()}`;
      }
    } else {
      sessionId = `session-${Date.now()}`;
    }

    const gameData = {
      season: activeSeason.name,
      result: req.body.result,
      rankAfter,
      rankPercentAfter,
      rankChange,
      srAfter: req.body.srAfter,
      srChange,
      map: mapName,
      mapMode,
      mapPool: req.body.mapPool || [],
      heroesPlayed: heroesPlayedArray,
      heroesPlayedBySide,
      rounds,
      matchups,
      opponentTanks,
      matchScore: req.body.matchScore || {},
      enemyBans: req.body.bans || [],
      sessionId,
      notes: req.body.notes || '',
      quickTags: req.body.quickTags || []
    };

    // Calculate streak
    const lastGames = await Game.find({ season: activeSeason.name })
      .sort({ date: -1 })
      .limit(10);
    
    let streak = 0;
    if (lastGames.length > 0) {
      const currentResult = gameData.result;
      for (const game of lastGames) {
        if (game.result === currentResult && currentResult !== 'draw') {
          streak++;
        } else {
          break;
        }
      }
      streak++; // Include current game
      if (currentResult === 'loss') streak = -streak;
    } else {
      streak = gameData.result === 'win' ? 1 : (gameData.result === 'loss' ? -1 : 0);
    }
    
    gameData.streak = streak;

    const game = new Game(gameData);
    await game.save();
    
    res.status(201).json(game);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a game
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };

    // Map frontend field names to schema field names
    if (updates.selectedMap !== undefined) {
      updates.map = updates.selectedMap;
      delete updates.selectedMap;
    }
    if (updates.bans !== undefined) {
      updates.enemyBans = updates.bans;
      delete updates.bans;
    }

    const game = await Game.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(game);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a game
router.delete('/:id', async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
