const MAP_MODES = {
  // Control
  'Antarctic Peninsula': 'control',
  'Busan': 'control',
  'Ilios': 'control',
  'Lijiang Tower': 'control',
  'Nepal': 'control',
  'Oasis': 'control',
  'Samoa': 'control',
  // Escort
  'Circuit Royal': 'escort',
  'Dorado': 'escort',
  'Havana': 'escort',
  'Junkertown': 'escort',
  'Rialto': 'escort',
  'Route 66': 'escort',
  'Shambali Monastery': 'escort',
  'Watchpoint: Gibraltar': 'escort',
  // Flashpoint
  'Aatlis': 'flashpoint',
  'New Junk City': 'flashpoint',
  'Suravasa': 'flashpoint',
  // Hybrid
  'Blizzard World': 'hybrid',
  'Eichenwalde': 'hybrid',
  'Hollywood': 'hybrid',
  "King's Row": 'hybrid',
  'Kings Row': 'hybrid',
  'Midtown': 'hybrid',
  'Numbani': 'hybrid',
  'Paraíso': 'hybrid',
  'Paraiso': 'hybrid',
  // Push
  'Colosseo': 'push',
  'Esperança': 'push',
  'Esperanca': 'push',
  'New Queen Street': 'push',
  'Runasapi': 'push',
  // Clash
  'Hanaoka': 'clash',
  'Throne of Anubis': 'clash'
};

function getMapMode(mapName) {
  return MAP_MODES[mapName] || null;
}

// Get round structure template for a given map mode
function getRoundTemplate(mapMode) {
  switch (mapMode) {
    case 'control':
      return { maxRounds: 3, phases: ['control', 'control', 'control'], winCondition: 2 };
    case 'escort':
      return { maxRounds: 2, phases: ['attack', 'defense'], winCondition: null };
    case 'hybrid':
      return { maxRounds: 2, phases: ['attack', 'defense'], winCondition: null };
    case 'push':
      return { maxRounds: 1, phases: ['neutral'], winCondition: null };
    case 'flashpoint':
      return { maxRounds: 5, phases: ['flashpoint', 'flashpoint', 'flashpoint', 'flashpoint', 'flashpoint'], winCondition: 3 };
    case 'clash':
      return { maxRounds: 5, phases: ['clash', 'clash', 'clash', 'clash', 'clash'], winCondition: 3 };
    default:
      return { maxRounds: 2, phases: ['attack', 'defense'], winCondition: null };
  }
}

module.exports = { getMapMode, getRoundTemplate, MAP_MODES };
