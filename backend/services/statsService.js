const Game = require('../models/Game');
const { RANKS } = require('../data/overwatchData');

class StatsService {
  // ===== OVERALL STATS =====
  async getOverallStats(season) {
    const games = await Game.find({ season }).sort({ date: -1 });

    const totalGames = games.length;
    const wins = games.filter(g => g.result === 'win').length;
    const losses = games.filter(g => g.result === 'loss').length;
    const draws = games.filter(g => g.result === 'draw').length;

    const latestGame = games.length > 0 ? games[0] : null;
    const firstGame = games.length > 0 ? games[games.length - 1] : null;

    // Rank info
    const currentRank = latestGame?.rankAfter || null;
    const currentRankPercent = latestGame?.rankPercentAfter ?? null;
    const startingRank = firstGame?.rankAfter || null;

    let rankProgression = null;
    if (currentRank && startingRank && RANKS) {
      const startIdx = RANKS.indexOf(startingRank);
      const currIdx = RANKS.indexOf(currentRank);
      if (startIdx >= 0 && currIdx >= 0) rankProgression = currIdx - startIdx;
    }

    // Legacy SR
    const currentSR = latestGame?.srAfter ?? null;
    const startingSR = firstGame
      ? (firstGame.srChange != null ? firstGame.srAfter - firstGame.srChange : firstGame.srAfter)
      : null;
    const srChange = currentSR && startingSR ? currentSR - startingSR : 0;

    let currentStreak = 0;
    if (games.length > 0) {
      const lastResult = games[0].result;
      for (const game of games) {
        if (game.result === lastResult && lastResult !== 'draw') currentStreak++;
        else break;
      }
      if (lastResult === 'loss') currentStreak = -currentStreak;
    }

    return {
      totalGames, wins, losses, draws,
      winrate: totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0,
      currentRank, currentRankPercent, startingRank, rankProgression,
      currentSR, startingSR, srChange,
      currentStreak
    };
  }

  // ===== HERO STATS =====
  async getHeroStats(season) {
    const games = await Game.find({ season });
    return this._computeHeroStats(games);
  }

  // ===== MAP STATS =====
  async getMapStats(season) {
    const games = await Game.find({ season });
    return this._computeMapStats(games);
  }

  async getMapPoolStats(season, mapPool) {
    const allMapStats = await this.getMapStats(season);
    return mapPool.map(map => {
      const stats = allMapStats.find(m => m.map === map);
      return stats || { map, games: 0, wins: 0, losses: 0, winrate: 0, attackWinrate: 0, defenseWinrate: 0, topHeroes: [] };
    });
  }

  // ===== BEST / WORST =====
  async getBestWorstHeroes(season) {
    const heroStats = await this.getHeroStats(season);
    const qualified = heroStats.filter(h => h.games >= 3);
    return {
      best: qualified.slice().sort((a, b) => parseFloat(b.winrate) - parseFloat(a.winrate)).slice(0, 3),
      worst: qualified.slice().sort((a, b) => parseFloat(a.winrate) - parseFloat(b.winrate)).slice(0, 3)
    };
  }

  // ===== COMPANION TIPS =====
  async getCompanionTips(season) {
    const games = await Game.find({ season }).sort({ date: -1 });

    // Ban stats
    const banCounts = {};
    const totalGamesWithBans = games.filter(g => g.enemyBans && g.enemyBans.length > 0).length;
    games.forEach(game => {
      (game.enemyBans || []).forEach(hero => {
        banCounts[hero] = (banCounts[hero] || 0) + 1;
      });
    });
    const banStats = Object.entries(banCounts)
      .map(([hero, count]) => ({ hero, count, pct: totalGamesWithBans > 0 ? ((count / totalGamesWithBans) * 100).toFixed(0) : 0 }))
      .sort((a, b) => b.count - a.count);

    // Opponent tank stats
    const opponentData = {};
    games.forEach(game => {
      (game.opponentTanks || []).forEach(hero => {
        if (!opponentData[hero]) opponentData[hero] = { games: 0, wins: 0, losses: 0 };
        opponentData[hero].games++;
        if (game.result === 'win') opponentData[hero].wins++;
        if (game.result === 'loss') opponentData[hero].losses++;
      });
    });
    const opponentStats = Object.entries(opponentData)
      .map(([hero, d]) => ({ hero, games: d.games, wins: d.wins, losses: d.losses, winrate: d.games > 0 ? ((d.wins / d.games) * 100).toFixed(1) : '0' }))
      .sort((a, b) => parseFloat(a.winrate) - parseFloat(b.winrate));

    // Hero winrate per map
    const heroMapData = {};
    games.forEach(game => {
      if (!game.map) return;
      game.heroesPlayed.forEach(({ hero }) => {
        const key = `${hero}|${game.map}`;
        if (!heroMapData[key]) heroMapData[key] = { hero, map: game.map, games: 0, wins: 0 };
        heroMapData[key].games++;
        if (game.result === 'win') heroMapData[key].wins++;
      });
    });
    const heroMapStats = Object.values(heroMapData).map(d => ({ ...d, winrate: d.games > 0 ? ((d.wins / d.games) * 100).toFixed(1) : '0' }));

    // Heroes never played
    const allTankHeroes = ['D.Va', 'Domina', 'Doomfist', 'Hazard', 'Junker Queen', 'Mauga', 'Orisa', 'Ramattra', 'Reinhardt', 'Roadhog', 'Sigma', 'Winston', 'Wrecking Ball', 'Zarya'];
    const playedHeroes = new Set();
    games.forEach(g => g.heroesPlayed.forEach(({ hero }) => playedHeroes.add(hero)));
    const neverPlayed = allTankHeroes.filter(h => !playedHeroes.has(h));

    // Hero stats
    const heroData = {};
    games.forEach(game => {
      game.heroesPlayed.forEach(({ hero }) => {
        if (!heroData[hero]) heroData[hero] = { games: 0, wins: 0, losses: 0 };
        heroData[hero].games++;
        if (game.result === 'win') heroData[hero].wins++;
        if (game.result === 'loss') heroData[hero].losses++;
      });
    });
    const heroStats = Object.entries(heroData)
      .map(([hero, d]) => ({ hero, games: d.games, wins: d.wins, losses: d.losses, winrate: d.games > 0 ? ((d.wins / d.games) * 100).toFixed(1) : '0' }))
      .sort((a, b) => b.games - a.games);

    const totalGames = games.length;
    const wins = games.filter(g => g.result === 'win').length;
    const currentRank = games.length > 0 ? games[0].rankAfter : null;
    const currentRankPercent = games.length > 0 ? games[0].rankPercentAfter : null;
    const currentSR = games.length > 0 ? games[0].srAfter : null;

    let currentStreak = 0;
    if (games.length > 0) {
      const lastResult = games[0].result;
      for (const g of games) {
        if (g.result === lastResult && lastResult !== 'draw') currentStreak++;
        else break;
      }
      if (lastResult === 'loss') currentStreak = -currentStreak;
    }

    const sessionStats = this._computeSessionStats(games);
    const tiltAlert = this._computeTiltAlert(games);

    return {
      totalGames, wins,
      winrate: totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0',
      currentRank, currentRankPercent, currentSR, currentStreak,
      banStats, opponentStats, heroMapStats, neverPlayed, heroStats,
      sessionStats, tiltAlert
    };
  }

  // ===== SESSION TRACKING =====
  _computeSessionStats(games) {
    if (games.length === 0) return null;
    const sessionGames = [games[0]];
    const thirtyMin = 30 * 60 * 1000;
    for (let i = 1; i < games.length; i++) {
      const timeDiff = new Date(games[i - 1].date).getTime() - new Date(games[i].date).getTime();
      if (timeDiff <= thirtyMin) sessionGames.push(games[i]);
      else break;
    }
    if (sessionGames.length <= 1) return null;

    const sessionWins = sessionGames.filter(g => g.result === 'win').length;
    const sessionLosses = sessionGames.filter(g => g.result === 'loss').length;

    return {
      gamesPlayed: sessionGames.length,
      wins: sessionWins, losses: sessionLosses,
      winrate: ((sessionWins / sessionGames.length) * 100).toFixed(1),
      startTime: sessionGames[sessionGames.length - 1].date,
      currentSessionStreak: this._getStreakFromGames(sessionGames)
    };
  }

  _getStreakFromGames(games) {
    if (games.length === 0) return 0;
    let streak = 0;
    const lastResult = games[0].result;
    for (const g of games) {
      if (g.result === lastResult && lastResult !== 'draw') streak++;
      else break;
    }
    if (lastResult === 'loss') streak = -streak;
    return streak;
  }

  // ===== TILT DETECTION =====
  _computeTiltAlert(games) {
    if (games.length < 3) return null;
    let consecutiveLosses = 0;
    for (const g of games) {
      if (g.result === 'loss') consecutiveLosses++;
      else break;
    }
    if (consecutiveLosses < 2) return null;

    let afterLossStreakGames = 0, afterLossStreakWins = 0, inLossStreak = 0;
    for (let i = 0; i < games.length; i++) {
      if (games[i].result === 'loss') { inLossStreak++; }
      else {
        if (inLossStreak >= consecutiveLosses) {
          afterLossStreakGames++;
          if (games[i].result === 'win') afterLossStreakWins++;
        }
        inLossStreak = 0;
      }
    }

    const wrAfterTilt = afterLossStreakGames > 0 ? ((afterLossStreakWins / afterLossStreakGames) * 100).toFixed(0) : null;

    return {
      consecutiveLosses,
      level: consecutiveLosses >= 4 ? 'critical' : consecutiveLosses >= 3 ? 'warning' : 'mild',
      message: consecutiveLosses >= 3
        ? `${consecutiveLosses} defaites consecutives. Pause recommandee.`
        : `${consecutiveLosses} defaites de suite. Attention au tilt.`,
      historicalWrAfterTilt: wrAfterTilt,
      historicalSample: afterLossStreakGames
    };
  }

  // ===== CONFORT SCORE =====
  async getComfortScores(season, map = null) {
    const allGames = await Game.find({}).sort({ date: -1 });
    const allTankHeroes = ['D.Va', 'Domina', 'Doomfist', 'Hazard', 'Junker Queen', 'Mauga', 'Orisa', 'Ramattra', 'Reinhardt', 'Roadhog', 'Sigma', 'Winston', 'Wrecking Ball', 'Zarya'];
    const heroScores = {};

    for (const hero of allTankHeroes) {
      const heroGames = (map
        ? allGames.filter(g => g.map === map && g.heroesPlayed.some(h => h.hero === hero))
        : allGames.filter(g => g.heroesPlayed.some(h => h.hero === hero))
      );

      if (heroGames.length === 0) {
        heroScores[hero] = { hero, map: map || 'all', comfortScore: 0, breakdown: {}, confidence: 'no_data', games: 0 };
        continue;
      }

      const expFactor = Math.min((heroGames.length / 20) * 30, 30);
      const wins = heroGames.filter(g => g.result === 'win').length;
      const wrFactor = (wins / heroGames.length) * 30;

      const last5 = heroGames.slice(0, 5);
      const last5Wins = last5.filter(g => g.result === 'win').length;
      const trendFactor = last5.length >= 3 ? (last5Wins / last5.length) * 25 : 12.5;

      let totalSwitches = 0, totalRounds = 0;
      heroGames.forEach(g => {
        (g.rounds || []).forEach(r => {
          if (r.startingHero === hero || r.endingHero === hero) {
            totalRounds++;
            totalSwitches += (r.heroSwitches || []).filter(s => s.from === hero).length;
          }
        });
      });
      const switchRate = totalRounds > 0 ? totalSwitches / totalRounds : 0;
      const switchFactor = Math.max(0, (1 - switchRate) * 15);

      const comfortScore = Math.min(Math.round(expFactor + wrFactor + trendFactor + switchFactor), 100);

      heroScores[hero] = {
        hero, map: map || 'all', comfortScore,
        breakdown: { experience: Math.round(expFactor), winrate: Math.round(wrFactor), recentTrend: Math.round(trendFactor), switchStability: Math.round(switchFactor) },
        games: heroGames.length,
        totalWinrate: ((wins / heroGames.length) * 100).toFixed(1),
        confidence: heroGames.length >= 10 ? 'high' : heroGames.length >= 5 ? 'medium' : 'low'
      };
    }

    return Object.values(heroScores).sort((a, b) => b.comfortScore - a.comfortScore);
  }

  // ===== RANK HISTORY =====
  async getRankHistory(season) {
    const games = await Game.find({ season }).sort({ date: 1 });
    return games.map(game => ({
      date: game.date,
      rank: game.rankAfter,
      rankPercent: game.rankPercentAfter,
      rankChange: game.rankChange,
      sr: game.srAfter,
      change: game.srChange,
      result: game.result
    }));
  }

  async getSRHistory(season) { return this.getRankHistory(season); }

  // ===== GLOBAL STATS =====
  async getGlobalOverallStats() {
    const games = await Game.find({}).sort({ date: -1 });
    if (games.length === 0) return { totalGames: 0, wins: 0, losses: 0, draws: 0, winrate: 0, currentRank: null, peakRank: null, lowestRank: null, peakSR: null, lowestSR: null, currentSR: null, seasonsPlayed: 0 };

    const wins = games.filter(g => g.result === 'win').length;
    const losses = games.filter(g => g.result === 'loss').length;
    const draws = games.filter(g => g.result === 'draw').length;

    const currentRank = games[0].rankAfter || null;
    const currentRankPercent = games[0].rankPercentAfter ?? null;

    let peakRankIdx = -1, lowestRankIdx = 999, peakRank = null, lowestRank = null;
    games.forEach(g => {
      if (g.rankAfter) {
        const idx = RANKS.indexOf(g.rankAfter);
        if (idx > peakRankIdx) { peakRankIdx = idx; peakRank = g.rankAfter; }
        if (idx < lowestRankIdx && idx >= 0) { lowestRankIdx = idx; lowestRank = g.rankAfter; }
      }
    });

    const currentSR = games[0].srAfter ?? null;
    const allSR = games.map(g => g.srAfter).filter(sr => sr != null);
    const peakSR = allSR.length > 0 ? Math.max(...allSR) : null;
    const lowestSR = allSR.length > 0 ? Math.min(...allSR) : null;
    const seasonsPlayed = [...new Set(games.map(g => g.season))].length;

    let currentStreak = 0;
    const lastResult = games[0].result;
    for (const game of games) {
      if (game.result === lastResult && lastResult !== 'draw') currentStreak++;
      else break;
    }
    if (lastResult === 'loss') currentStreak = -currentStreak;

    return {
      totalGames: games.length, wins, losses, draws,
      winrate: ((wins / games.length) * 100).toFixed(1),
      currentRank, currentRankPercent, peakRank, lowestRank,
      currentSR, peakSR, lowestSR, seasonsPlayed, currentStreak
    };
  }

  async getGlobalHeroStats() { return this._computeHeroStats(await Game.find({})); }
  async getGlobalMapStats() { return this._computeMapStats(await Game.find({})); }

  // ===== SHARED =====
  _computeHeroStats(games) {
    const heroData = {};
    games.forEach(game => {
      game.heroesPlayed.forEach(({ hero, timePlayed }) => {
        if (!heroData[hero]) heroData[hero] = { games: 0, wins: 0, losses: 0, timePlayed: 0 };
        heroData[hero].games++;
        heroData[hero].timePlayed += timePlayed || 0;
        if (game.result === 'win') heroData[hero].wins++;
        if (game.result === 'loss') heroData[hero].losses++;
      });
    });
    return Object.entries(heroData)
      .map(([hero, data]) => ({ hero, games: data.games, wins: data.wins, losses: data.losses, winrate: data.games > 0 ? ((data.wins / data.games) * 100).toFixed(1) : '0', timePlayed: data.timePlayed }))
      .sort((a, b) => b.games - a.games);
  }

  _computeMapStats(games) {
    const mapData = {};
    games.forEach(game => {
      if (!mapData[game.map]) mapData[game.map] = { games: 0, wins: 0, losses: 0, attack: { games: 0, wins: 0 }, defense: { games: 0, wins: 0 }, heroes: {} };
      const data = mapData[game.map];
      data.games++;
      if (game.result === 'win') data.wins++;
      if (game.result === 'loss') data.losses++;
      if (game.rounds && game.rounds.length > 0) {
        game.rounds.forEach(round => {
          if (round.phase === 'attack') { data.attack.games++; if (round.result === 'win') data.attack.wins++; }
          if (round.phase === 'defense') { data.defense.games++; if (round.result === 'win') data.defense.wins++; }
        });
      }
      game.heroesPlayed.forEach(({ hero }) => {
        if (!data.heroes[hero]) data.heroes[hero] = { games: 0, wins: 0 };
        data.heroes[hero].games++;
        if (game.result === 'win') data.heroes[hero].wins++;
      });
    });
    return Object.entries(mapData).map(([map, data]) => ({
      map, games: data.games, wins: data.wins, losses: data.losses,
      winrate: data.games > 0 ? ((data.wins / data.games) * 100).toFixed(1) : '0',
      attackWinrate: data.attack.games > 0 ? ((data.attack.wins / data.attack.games) * 100).toFixed(1) : '0',
      defenseWinrate: data.defense.games > 0 ? ((data.defense.wins / data.defense.games) * 100).toFixed(1) : '0',
      topHeroes: Object.entries(data.heroes).map(([hero, stats]) => ({ hero, games: stats.games, winrate: ((stats.wins / stats.games) * 100).toFixed(1) })).sort((a, b) => b.games - a.games).slice(0, 3)
    }));
  }

  // ===== MATCHUP MATRIX =====
  async getMatchupMatrix(season = null) {
    const games = await Game.find(season ? { season } : {});
    const matrix = {};
    games.forEach(game => {
      const oppHeroes = game.opponentTanks || [];
      if (oppHeroes.length === 0) return;
      if (game.matchups && game.matchups.length > 0) {
        game.matchups.forEach(({ myHero, opponentHero }) => {
          const key = `${myHero}|${opponentHero}`;
          if (!matrix[key]) matrix[key] = { myHero, opponentHero, games: 0, wins: 0, losses: 0 };
          matrix[key].games++;
          if (game.result === 'win') matrix[key].wins++;
          if (game.result === 'loss') matrix[key].losses++;
        });
      } else {
        game.heroesPlayed.map(h => h.hero).forEach(myH => {
          oppHeroes.forEach(oppH => {
            const key = `${myH}|${oppH}`;
            if (!matrix[key]) matrix[key] = { myHero: myH, opponentHero: oppH, games: 0, wins: 0, losses: 0 };
            matrix[key].games++;
            if (game.result === 'win') matrix[key].wins++;
            if (game.result === 'loss') matrix[key].losses++;
          });
        });
      }
    });
    return Object.values(matrix).map(m => ({ ...m, winrate: m.games > 0 ? ((m.wins / m.games) * 100).toFixed(1) : '0' })).sort((a, b) => b.games - a.games);
  }

  // ===== HERO RECOMMENDATION (weights: 40/30/20/10) =====
  async getHeroRecommendation(season, map, bans = [], opponentTanks = []) {
    const ALL_TANKS = ['D.Va', 'Domina', 'Doomfist', 'Hazard', 'Junker Queen', 'Mauga', 'Orisa', 'Ramattra', 'Reinhardt', 'Roadhog', 'Sigma', 'Winston', 'Wrecking Ball', 'Zarya'];
    const [seasonGames, allGames] = await Promise.all([Game.find({ season }), Game.find({})]);
    const availableHeroes = ALL_TANKS.filter(h => !bans.includes(h));
    const recommendations = [];
    const now = new Date();
    const totalPlayerGames = allGames.length;

    // Helper: blend raw WR toward 50 based on sample size (more games = trust data more)
    const blendWR = (rawWR, games, threshold = 5) => {
      if (games === 0) return 50;
      const conf = Math.min(games / threshold, 1);
      return rawWR * conf + 50 * (1 - conf);
    };

    for (const hero of availableHeroes) {
      const globalHeroGames = allGames.filter(g => g.heroesPlayed.some(h => h.hero === hero));
      const seasonMapGames = seasonGames.filter(g => g.map === map && g.heroesPlayed.some(h => h.hero === hero));
      const globalMapGames = allGames.filter(g => g.map === map && g.heroesPlayed.some(h => h.hero === hero));

      // Map WR: use any data, blend with confidence
      const allMapGames = [...new Set([...seasonMapGames, ...globalMapGames])];
      const allMapWins = allMapGames.filter(g => g.result === 'win').length;
      const combinedMapWR = blendWR(allMapGames.length > 0 ? (allMapWins / allMapGames.length) * 100 : 50, allMapGames.length);

      // Matchup WR
      let matchupWR = 50;
      if (opponentTanks.length > 0) {
        let mGames = 0, mWins = 0;
        allGames.forEach(g => {
          if (!g.heroesPlayed.some(h => h.hero === hero)) return;
          if ((g.opponentTanks || []).some(o => opponentTanks.includes(o))) { mGames++; if (g.result === 'win') mWins++; }
        });
        matchupWR = blendWR(mGames > 0 ? (mWins / mGames) * 100 : 50, mGames);
      }

      // Recent trend
      const recentGames = [...allGames].sort((a, b) => new Date(b.date) - new Date(a.date)).filter(g => g.heroesPlayed.some(h => h.hero === hero)).slice(0, 10);
      const recentWR = blendWR(recentGames.length > 0 ? (recentGames.filter(g => g.result === 'win').length / recentGames.length) * 100 : 50, recentGames.length, 3);

      // Global WR
      const globalWR = blendWR(globalHeroGames.length > 0 ? (globalHeroGames.filter(g => g.result === 'win').length / globalHeroGames.length) * 100 : 50, globalHeroGames.length);

      // Base composite
      let compositeScore = (combinedMapWR * 0.40) + (matchupWR * 0.30) + (recentWR * 0.20) + (globalWR * 0.10);

      // Never-played penalty: after 5+ total games, penalize heroes never picked
      // This encourages sticking to your champion pool
      if (globalHeroGames.length === 0 && totalPlayerGames >= 5) {
        const penaltyStrength = Math.min((totalPlayerGames - 5) / 10, 1); // ramps from 0 to 1 over 10 more games
        compositeScore -= 15 * penaltyStrength; // up to -15 points
      }

      // Confidence: recency + volatility
      const totalData = seasonMapGames.length + globalMapGames.length;
      const heroGameDates = globalHeroGames.map(g => new Date(g.date));
      const avgDaysAgo = heroGameDates.length > 0 ? heroGameDates.reduce((sum, d) => sum + (now - d) / (86400000), 0) / heroGameDates.length : 999;
      const recencyPenalty = avgDaysAgo > 60 ? 'stale' : avgDaysAgo > 30 ? 'aging' : 'fresh';

      let volatility = 'stable';
      if (globalHeroGames.length >= 5) {
        const results = globalHeroGames.map(g => g.result === 'win' ? 1 : 0);
        const mean = results.reduce((s, v) => s + v, 0) / results.length;
        const stdDev = Math.sqrt(results.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / results.length);
        volatility = stdDev > 0.45 ? 'volatile' : stdDev > 0.35 ? 'moderate' : 'stable';
      }

      let confidence;
      if (totalData >= 10 && recencyPenalty === 'fresh') confidence = 'high';
      else if (totalData >= 5) confidence = recencyPenalty === 'stale' ? 'low' : 'medium';
      else if (totalData >= 2) confidence = 'low';
      else if (globalHeroGames.length > 0) confidence = 'low';
      else confidence = 'no_data';

      let tier;
      if (compositeScore >= 65) tier = 'S';
      else if (compositeScore >= 55) tier = 'A';
      else if (compositeScore >= 45) tier = 'B';
      else tier = 'C';

      recommendations.push({
        hero, compositeScore: compositeScore.toFixed(1), tier, confidence, recency: recencyPenalty, volatility,
        breakdown: { mapWinrate: combinedMapWR.toFixed(1), matchupScore: matchupWR.toFixed(1), recentTrend: recentWR.toFixed(1), globalWinrate: globalWR.toFixed(1) },
        gamesOnMap: seasonMapGames.length + globalMapGames.length, totalGames: globalHeroGames.length
      });
    }
    return recommendations.sort((a, b) => parseFloat(b.compositeScore) - parseFloat(a.compositeScore));
  }

  // ===== MAP VOTE STRATEGY =====
  async getMapVoteStrategy(season, mapPool, bans = []) {
    const ALL_TANKS = ['D.Va', 'Domina', 'Doomfist', 'Hazard', 'Junker Queen', 'Mauga', 'Orisa', 'Ramattra', 'Reinhardt', 'Roadhog', 'Sigma', 'Winston', 'Wrecking Ball', 'Zarya'];
    const [seasonGames, allGames] = await Promise.all([Game.find({ season }), Game.find({})]);
    const availableHeroes = ALL_TANKS.filter(h => !bans.includes(h));

    return mapPool.map(map => {
      const sGames = seasonGames.filter(g => g.map === map);
      const sWins = sGames.filter(g => g.result === 'win').length;
      const gGames = allGames.filter(g => g.map === map);
      const gWins = gGames.filter(g => g.result === 'win').length;

      // Map WR: use any data available, blend toward 50 for low sample sizes
      let mapWR = 50;
      const totalMapGames = gGames.length;
      if (totalMapGames > 0) {
        const rawWR = (sGames.length > 0 && gGames.length > 0)
          ? ((sWins / sGames.length) * 0.6 + (gWins / gGames.length) * 0.4) * 100
          : (gWins / gGames.length) * 100;
        // Confidence blend: with 1 game, mix 40% raw + 60% neutral; with 5+ games, use raw fully
        const confidence = Math.min(totalMapGames / 5, 1);
        mapWR = rawWR * confidence + 50 * (1 - confidence);
      }

      const heroesOnMap = {};
      allGames.filter(g => g.map === map).forEach(g => {
        g.heroesPlayed.forEach(({ hero }) => {
          if (!availableHeroes.includes(hero)) return;
          if (!heroesOnMap[hero]) heroesOnMap[hero] = { games: 0, wins: 0 };
          heroesOnMap[hero].games++;
          if (g.result === 'win') heroesOnMap[hero].wins++;
        });
      });

      // Count viable heroes (1+ games with >= 45% WR)
      const viable = Object.entries(heroesOnMap).filter(([, d]) => d.games >= 1 && (d.wins / d.games) >= 0.45).length;
      const heroPoolScore = Math.min((viable / 3) * 100, 100);

      let bestHeroWR = 50, bestHero = null;
      Object.entries(heroesOnMap).forEach(([hero, d]) => {
        if (d.games >= 1) {
          // Blend hero WR toward 50 based on sample size
          const rawHeroWR = (d.wins / d.games) * 100;
          const heroConf = Math.min(d.games / 5, 1);
          const blendedWR = rawHeroWR * heroConf + 50 * (1 - heroConf);
          if (blendedWR > bestHeroWR) { bestHeroWR = blendedWR; bestHero = hero; }
        }
      });

      return {
        map, compositeScore: ((mapWR * 0.40) + (heroPoolScore * 0.30) + (bestHeroWR * 0.30)).toFixed(1),
        breakdown: { mapWinrate: mapWR.toFixed(1), heroPoolScore: heroPoolScore.toFixed(1), bestHeroWinrate: bestHeroWR.toFixed(1), bestHero },
        seasonGames: sGames.length, globalGames: gGames.length, totalGames: sGames.length + gGames.length
      };
    }).sort((a, b) => parseFloat(b.compositeScore) - parseFloat(a.compositeScore));
  }

  // ===== HERO POOL =====
  async getHeroPool(season = null) {
    const games = await Game.find(season ? { season } : {}).sort({ date: -1 });
    if (games.length === 0) return [];
    const totalGames = games.length;
    const heroData = {};

    games.forEach(game => {
      game.heroesPlayed.forEach(({ hero }) => {
        if (!heroData[hero]) heroData[hero] = { games: 0, wins: 0, losses: 0, recentResults: [] };
        heroData[hero].games++;
        if (game.result === 'win') heroData[hero].wins++;
        if (game.result === 'loss') heroData[hero].losses++;
        if (heroData[hero].recentResults.length < 5) heroData[hero].recentResults.push(game.result);
      });
    });

    return Object.entries(heroData).map(([hero, d]) => {
      const playRate = (d.games / totalGames) * 100;
      const confidence = playRate > 20 ? 'main' : playRate > 10 ? 'comfortable' : playRate > 3 ? 'flex' : 'pocket';
      const recentWins = d.recentResults.filter(r => r === 'win').length;
      const trend = d.recentResults.length >= 3 ? (recentWins / d.recentResults.length >= 0.6 ? 'hot' : recentWins / d.recentResults.length <= 0.3 ? 'cold' : 'stable') : 'stable';
      return { hero, games: d.games, wins: d.wins, losses: d.losses, winrate: d.games > 0 ? ((d.wins / d.games) * 100).toFixed(1) : '0', playRate: playRate.toFixed(1), confidence, trend };
    }).sort((a, b) => b.games - a.games);
  }

  // ===== BRIEFING CARD =====
  async getBriefingCard(season, map, bans = []) {
    const [seasonGames, allGames] = await Promise.all([Game.find({ season }).sort({ date: -1 }), Game.find({}).sort({ date: -1 })]);

    const mapGames = allGames.filter(g => g.map === map);
    const mapWins = mapGames.filter(g => g.result === 'win').length;
    const mapWinrate = mapGames.length > 0 ? ((mapWins / mapGames.length) * 100).toFixed(1) : null;

    let mapStreak = 0;
    if (mapGames.length > 0) {
      const lr = mapGames[0].result;
      for (const g of mapGames) { if (g.result === lr && lr !== 'draw') mapStreak++; else break; }
      if (lr === 'loss') mapStreak = -mapStreak;
    }

    const heroRecs = await this.getHeroRecommendation(season, map, bans, []);
    const comfortScores = await this.getComfortScores(season, map);

    const mapMatchups = {};
    mapGames.forEach(g => { (g.opponentTanks || []).forEach(opp => { if (!mapMatchups[opp]) mapMatchups[opp] = { games: 0, wins: 0 }; mapMatchups[opp].games++; if (g.result === 'win') mapMatchups[opp].wins++; }); });
    const dangerMatchups = Object.entries(mapMatchups).filter(([, d]) => d.games >= 2).map(([hero, d]) => ({ hero, games: d.games, winrate: ((d.wins / d.games) * 100).toFixed(1) })).sort((a, b) => parseFloat(a.winrate) - parseFloat(b.winrate)).slice(0, 3);

    // Collect notes: both game-level notes AND round-level notes
    const previousNotes = [];
    for (const g of mapGames) {
      const allNotes = [];
      // Game-level notes
      if (g.notes && g.notes.trim()) {
        allNotes.push(g.notes.trim());
      }
      // Round-level notes
      if (g.rounds && g.rounds.length > 0) {
        g.rounds.forEach(r => {
          if (r.notes && r.notes.trim()) {
            const phaseLabel = r.phase ? `[${r.phase} R${r.roundNumber}]` : `[R${r.roundNumber}]`;
            allNotes.push(`${phaseLabel} ${r.notes.trim()}`);
          }
        });
      }
      if (allNotes.length > 0) {
        previousNotes.push({
          date: g.date,
          result: g.result,
          note: allNotes.join(' | '),
          heroes: g.heroesPlayed.map(h => h.hero)
        });
      }
      if (previousNotes.length >= 5) break; // Show up to 5 previous games with notes
    }

    const sessionStats = this._computeSessionStats(seasonGames);
    const tiltAlert = this._computeTiltAlert(seasonGames);

    let currentStreak = 0;
    if (seasonGames.length > 0) {
      const lr = seasonGames[0].result;
      for (const g of seasonGames) { if (g.result === lr && lr !== 'draw') currentStreak++; else break; }
      if (lr === 'loss') currentStreak = -currentStreak;
    }

    return {
      map,
      mapStats: { games: mapGames.length, winrate: mapWinrate, mapStreak },
      heroRecommendation: { top: heroRecs[0] ? { hero: heroRecs[0].hero, tier: heroRecs[0].tier, score: heroRecs[0].compositeScore } : null, top3: heroRecs.slice(0, 3).map(r => ({ hero: r.hero, tier: r.tier, score: r.compositeScore })) },
      comfortHeroes: comfortScores.filter(c => c.comfortScore > 0).slice(0, 3).map(c => ({ hero: c.hero, score: c.comfortScore, games: c.games })),
      dangerMatchups,
      previousNotes,
      sessionStatus: { session: sessionStats, tilt: tiltAlert, currentStreak }
    };
  }
}

module.exports = new StatsService();
