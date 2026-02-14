const mongoose = require('mongoose');

const heroPlayedSchema = new mongoose.Schema({
  hero: { type: String, required: true },
  timePlayed: { type: Number, default: 0 } // in minutes
}, { _id: false });

// Hero switch event within a round
const heroSwitchSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  reason: { type: String, default: '' } // countered, not working, ult advantage, adapting
}, { _id: false });

// A single round entry
const roundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  phase: { type: String, enum: ['attack', 'defense', 'neutral', 'control', 'flashpoint', 'clash'] },
  startingHero: { type: String, required: true },
  endingHero: { type: String },
  heroSwitches: [heroSwitchSchema],
  result: { type: String, enum: ['win', 'loss', 'draw', null] },
  notes: { type: String, default: '' }
}, { _id: false });

// Matchup entry: my hero vs opponent hero
const matchupEntrySchema = new mongoose.Schema({
  myHero: { type: String, required: true },
  opponentHero: { type: String, required: true }
}, { _id: false });

const gameSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now, required: true },
  season: { type: String, required: true },

  // Match result
  result: { type: String, enum: ['win', 'loss', 'draw'], required: true },

  // Rank tracking (OW2 style: rank + percentage)
  rankAfter: { type: String }, // e.g. "Diamond 3"
  rankPercentAfter: { type: Number, min: 0, max: 100 }, // e.g. 72 (%)
  rankChange: { type: String }, // e.g. "up", "down", "same", "promoted", "demoted"

  // Legacy SR (kept for backward compat with old data)
  srAfter: { type: Number },
  srChange: { type: Number },

  // Map info
  map: { type: String, required: true },
  mapPool: [{ type: String }], // The 3 maps in vote
  mapMode: { type: String, enum: ['control', 'escort', 'flashpoint', 'hybrid', 'push', 'clash'] },

  // Heroes played (Tank only) - stored as flat array of hero names (legacy + summary)
  heroesPlayed: [heroPlayedSchema],

  // Heroes by side (attack/defense) - legacy + summary
  heroesPlayedBySide: {
    attack: [{ type: String }],
    defense: [{ type: String }]
  },

  // Round-by-round tracking (new)
  rounds: [roundSchema],

  // Opponent tanks
  opponentTanks: [{ type: String }],

  // Matchup pairs: my hero x opponent hero (derived from rounds + opponentTanks)
  matchups: [matchupEntrySchema],

  // Match score
  matchScore: {
    wins: { type: Number },
    losses: { type: Number }
  },

  // Enemy bans only
  enemyBans: [{ type: String }],

  // Session tracking
  sessionId: { type: String }, // auto-generated, groups games played in same session

  // Notes
  notes: { type: String, default: '' },
  quickTags: [{ type: String }], // ['feeder', 'smurf', 'good-tank', etc.]

  // Streak (calculated)
  streak: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes for performance
gameSchema.index({ season: 1, date: -1 });
gameSchema.index({ map: 1 });
gameSchema.index({ 'heroesPlayed.hero': 1 });
gameSchema.index({ mapMode: 1 });
gameSchema.index({ 'matchups.myHero': 1, 'matchups.opponentHero': 1 });
gameSchema.index({ sessionId: 1 });

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
