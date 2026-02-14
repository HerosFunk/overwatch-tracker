import axios from 'axios';
import { API_URL } from './constants';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Games
export const getGames = (season) =>
  api.get('/games', { params: { season } });

export const getGame = (id) =>
  api.get(`/games/${id}`);

export const createGame = (gameData) =>
  api.post('/games', gameData);

export const updateGame = (id, gameData) =>
  api.put(`/games/${id}`, gameData);

export const deleteGame = (id) =>
  api.delete(`/games/${id}`);

// Stats
export const getOverallStats = (season) =>
  api.get('/stats/overall', { params: { season } });

export const getHeroStats = (season) =>
  api.get('/stats/heroes', { params: { season } });

export const getMapStats = (season) =>
  api.get('/stats/maps', { params: { season } });

export const getMapPoolStats = (mapPool, season) =>
  api.post('/stats/map-pool', { mapPool, season });

export const getBestWorstHeroes = (season) =>
  api.get('/stats/heroes/best-worst', { params: { season } });

export const getSRHistory = (season) =>
  api.get('/stats/sr-history', { params: { season } });

export const getRankHistory = (season) =>
  api.get('/stats/rank-history', { params: { season } });

export const getCompanionTips = (season) =>
  api.get('/stats/companion-tips', { params: { season } });

// Global Stats
export const getGlobalOverallStats = () =>
  api.get('/stats/global/overall');

export const getGlobalHeroStats = () =>
  api.get('/stats/global/heroes');

export const getGlobalMapStats = () =>
  api.get('/stats/global/maps');

// Matchup Matrix
export const getMatchupMatrix = (season, global = false) =>
  api.get('/stats/matchup-matrix', { params: global ? { global: 'true' } : { season } });

// Hero Recommendation
export const getHeroRecommendation = (map, bans, opponentTanks, season) =>
  api.post('/stats/hero-recommendation', { map, bans, opponentTanks, season });

// Map Vote Strategy
export const getMapVoteStrategy = (mapPool, bans, season) =>
  api.post('/stats/map-vote-strategy', { mapPool, bans, season });

// Hero Pool
export const getHeroPool = (season, global = false) =>
  api.get('/stats/hero-pool', { params: global ? { global: 'true' } : { season } });

// Comfort Scores
export const getComfortScores = (season, map = null) =>
  api.get('/stats/comfort-scores', { params: { season, map } });

// Briefing Card
export const getBriefingCard = (map, bans, season) =>
  api.post('/stats/briefing-card', { map, bans, season });

// Seasons
export const getSeasons = () =>
  api.get('/seasons');

export const getActiveSeason = () =>
  api.get('/seasons/active');

export const createSeason = (seasonData) =>
  api.post('/seasons', seasonData);

export const updateSeason = (id, seasonData) =>
  api.put(`/seasons/${id}`, seasonData);

export const activateSeason = (id) =>
  api.post(`/seasons/${id}/activate`);

export const deleteSeason = (id) =>
  api.delete(`/seasons/${id}`);

// Bans
export const getBanPool = () =>
  api.get('/bans/pool');

export const getAllBannableHeroes = () =>
  api.get('/bans/all');

export const getBannableHeroesBySubclass = () =>
  api.get('/bans/heroes-by-subclass');

export const updateBanPool = (banPool) =>
  api.put('/bans/pool', { banPool });

// Maps
export const getMapsByMode = () =>
  api.get('/maps/by-mode');

export const getMapsBySpecificMode = (mode) =>
  api.get(`/maps/mode/${mode}`);

export const getAllMaps = () =>
  api.get('/maps');

// Heroes
export const getHeroesBySubclass = () =>
  api.get('/heroes/by-subclass');

export const getHeroesBySpecificSubclass = (subclass) =>
  api.get(`/heroes/subclass/${subclass}`);

export const getAllTankHeroes = () =>
  api.get('/heroes');
