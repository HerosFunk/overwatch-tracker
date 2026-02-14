#!/usr/bin/env node

/**
 * Migration Script - Initialize Season 1 Data
 * Run with: node seed-season1.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Season = require('./models/Season');
const { SEASON_1_INFO } = require('./data/overwatchData');

async function initializeSeason1() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/overwatch-tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Check if Season 1 already exists
    const existingSeason = await Season.findOne({ name: 'Season 1: 2026' });

    if (existingSeason) {
      console.log('⚠️  Season 1: 2026 already exists. Skipping creation.');
      await mongoose.disconnect();
      return;
    }

    // Create Season 1 with all required data
    const season1 = new Season({
      name: SEASON_1_INFO.name,
      startDate: SEASON_1_INFO.startDate,
      endDate: SEASON_1_INFO.endDate,
      isActive: true,
      startingSR: 0,
      currentModifiers: SEASON_1_INFO.currentModifiers,
      gameMode: 'competitive',
      banPool: SEASON_1_INFO.banPool,
      cardPool: ['card-1', 'card-2', 'card-3', 'card-4', 'card-5', 'card-6']
    });

    await season1.save();

    console.log('\n✨ Season 1: 2026 Created Successfully!');
    console.log('\n📊 Season Details:');
    console.log(`   Name: ${season1.name}`);
    console.log(`   Start Date: ${season1.startDate.toLocaleDateString()}`);
    console.log(`   End Date: ${season1.endDate.toLocaleDateString()}`);
    console.log(`   Active: ${season1.isActive}`);
    console.log(`   Ban Pool: ${season1.banPool.length} heroes`);
    console.log(`   Card Pool: ${season1.cardPool.length} cards`);
    console.log(`   Current Modifiers: ${season1.currentModifiers.length} active`);

    console.log('\n🎯 Current Modifiers:');
    season1.currentModifiers.forEach((mod, idx) => {
      console.log(`   ${idx + 1}. ${mod}`);
    });

    console.log('\n🎴 Available Cards:');
    season1.cardPool.forEach((card, idx) => {
      console.log(`   ${idx + 1}. ${card}`);
    });

    console.log('\n🎮 Ban Pool (First 5):');
    season1.banPool.slice(0, 5).forEach((hero, idx) => {
      console.log(`   ${idx + 1}. ${hero}`);
    });

    console.log(`\n   ... and ${season1.banPool.length - 5} more heroes\n`);

    await mongoose.disconnect();
    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
initializeSeason1();
