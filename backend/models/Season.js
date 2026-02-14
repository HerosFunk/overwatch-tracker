const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Season 14"
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isActive: { type: Boolean, default: false },
  startingRank: { type: String }, // e.g. "Diamond 4"
  startingRankPercent: { type: Number, min: 0, max: 100 }, // e.g. 50 (%)
  startingSR: { type: Number }, // Legacy
  gameMode: { type: String, default: 'competitive' },
  banPool: [{ type: String }] // Available heroes to ban
}, {
  timestamps: true
});

// Only one active season at a time
seasonSchema.pre('save', async function(next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

const Season = mongoose.model('Season', seasonSchema);

module.exports = Season;
