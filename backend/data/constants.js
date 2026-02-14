// Overwatch 2 Tank Heroes
export const TANK_HEROES = [
  'D.Va',
  'Doomfist',
  'Junker Queen',
  'Mauga',
  'Orisa',
  'Ramattra',
  'Reinhardt',
  'Roadhog',
  'Sigma',
  'Winston',
  'Wrecking Ball',
  'Zarya'
];

// Overwatch 2 Competitive Maps
export const MAPS = {
  control: [
    'Antarctic Peninsula',
    'Busan',
    'Ilios',
    'Lijiang Tower',
    'Nepal',
    'Oasis',
    'Samoa'
  ],
  escort: [
    'Circuit Royal',
    'Dorado',
    'Havana',
    'Junkertown',
    'Rialto',
    'Route 66',
    'Shambali Monastery',
    'Watchpoint: Gibraltar'
  ],
  hybrid: [
    'Blizzard World',
    'Eichenwalde',
    'Hollywood',
    'Kings Row',
    'Midtown',
    'Numbani',
    'Paraíso'
  ],
  push: [
    'Colosseo',
    'Esperança',
    'New Queen Street'
  ],
  flashpoint: [
    'New Junk City',
    'Suravasa'
  ]
};

// All maps flattened
export const ALL_MAPS = Object.values(MAPS).flat().sort();

// Quick tags for notes
export const QUICK_TAGS = [
  'smurf',
  'thrower',
  'feeder',
  'good-dps',
  'good-support',
  'bad-team',
  'clutch',
  'comeback',
  'stomp',
  'close-game',
  'toxic',
  'coordinated'
];