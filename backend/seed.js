const mongoose = require('mongoose');
const Game = require('./models/Game');
const Season = require('./models/Season');
require('dotenv').config();

const SAMPLE_GAMES = [
  {
    date: new Date('2025-02-10T18:00:00'),
    result: 'win',
    srBefore: 3200,
    srAfter: 3225,
    srChange: 25,
    map: 'Kings Row',
    mapPool: ['Kings Row', 'Dorado', 'Eichenwalde'],
    sideStarted: 'attack',
    heroesPlayed: [{ hero: 'Reinhardt', timePlayed: 15 }],
    bans: ['Roadhog', 'Zarya'],
    notes: 'Great team coordination',
    streak: 1
  },
  {
    date: new Date('2025-02-10T19:00:00'),
    result: 'win',
    srBefore: 3225,
    srAfter: 3247,
    srChange: 22,
    map: 'Dorado',
    mapPool: ['Dorado', 'Havana', 'Route 66'],
    sideStarted: 'defense',
    heroesPlayed: [{ hero: 'Sigma', timePlayed: 18 }],
    bans: ['Reinhardt', 'Winston'],
    notes: 'Clutch overtime hold',
    quickTags: ['clutch'],
    streak: 2
  },
  {
    date: new Date('2025-02-10T20:00:00'),
    result: 'loss',
    srBefore: 3247,
    srAfter: 3222,
    srChange: -25,
    map: 'Eichenwalde',
    mapPool: ['Eichenwalde', 'Hollywood', 'Midtown'],
    sideStarted: 'attack',
    heroesPlayed: [{ hero: 'Winston', timePlayed: 12 }],
    bans: ['D.Va', 'Ramattra'],
    notes: 'Team tilted after first round',
    quickTags: ['bad-team'],
    streak: -1
  },
  {
    date: new Date('2025-02-11T17:00:00'),
    result: 'win',
    srBefore: 3222,
    srAfter: 3245,
    srChange: 23,
    map: 'Lijiang Tower',
    mapPool: ['Lijiang Tower', 'Nepal', 'Oasis'],
    sideStarted: 'attack',
    heroesPlayed: [{ hero: 'D.Va', timePlayed: 20 }],
    bans: ['Sigma', 'Zarya'],
    notes: 'Dominated all rounds',
    quickTags: ['stomp', 'good-support'],
    streak: 1
  },
  {
    date: new Date('2025-02-11T18:00:00'),
    result: 'win',
    srBefore: 3245,
    srAfter: 3268,
    srChange: 23,
    map: 'Circuit Royal',
    mapPool: ['Circuit Royal', 'Dorado', 'Havana'],
    sideStarted: 'defense',
    heroesPlayed: [{ hero: 'Orisa', timePlayed: 16 }],
    bans: ['Reinhardt', 'Roadhog'],
    notes: 'Perfect defense',
    quickTags: ['coordinated'],
    streak: 2
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/overwatch-tracker');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Game.deleteMany({});
    await Season.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create active season
    const season = await Season.create({
      name: 'Season 14',
      startDate: new Date('2025-02-01'),
      isActive: true,
      startingSR: 3200
    });
    console.log(`✅ Created season: ${season.name}`);

    // Add season to games and create them
    const gamesWithSeason = SAMPLE_GAMES.map(game => ({
      ...game,
      season: season.name
    }));

    await Game.insertMany(gamesWithSeason);
    console.log(`✅ Created ${SAMPLE_GAMES.length} sample games`);

    console.log('');
    console.log('🎮 Database seeded successfully!');
    console.log('📊 You can now start the app and see sample data');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
