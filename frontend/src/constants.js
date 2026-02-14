// Tank heroes with images and subclass info
export const TANK_HEROES_DATA = {
  'D.Va': { subclass: 'initiator', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/1/19/Icon-D.Va.png', color: '#ff5599' },
  'Domina': { subclass: 'stalwart', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/7/76/Icon-Domina.png', color: '#aa44ff' },
  'Doomfist': { subclass: 'initiator', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/a/a1/Icon-Doomfist.png', color: '#8833ff' },
  'Hazard': { subclass: 'stalwart', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/5/54/Icon-Hazard.png', color: '#44aa88' },
  'Junker Queen': { subclass: 'stalwart', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/2/2b/Icon-Junker_Queen.png', color: '#ff9933' },
  'Mauga': { subclass: 'bruiser', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/3/39/Icon-Mauga.png', color: '#ff6633' },
  'Orisa': { subclass: 'bruiser', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/1/11/Icon-Orisa.png', color: '#00cc00' },
  'Ramattra': { subclass: 'stalwart', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/6/6f/Icon-Ramattra.png', color: '#aabbcc' },
  'Reinhardt': { subclass: 'stalwart', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/8/83/Icon-Reinhardt.png', color: '#ccaa00' },
  'Roadhog': { subclass: 'bruiser', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/1/16/Icon-Roadhog.png', color: '#ff5533' },
  'Sigma': { subclass: 'stalwart', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/e/e0/Icon-Sigma.png', color: '#3366ff' },
  'Winston': { subclass: 'initiator', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/f/f8/Icon-Winston.png', color: '#ffaa00' },
  'Wrecking Ball': { subclass: 'initiator', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/c/ca/Icon-Wrecking_Ball.png', color: '#00ccff' },
  'Zarya': { subclass: 'bruiser', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/7/75/Icon-Zarya.png', color: '#ff0099' }
};

export const TANK_HEROES_BY_SUBCLASS = {
  bruiser: ['Mauga', 'Orisa', 'Roadhog', 'Zarya'],
  initiator: ['D.Va', 'Doomfist', 'Winston', 'Wrecking Ball'],
  stalwart: ['Domina', 'Hazard', 'Junker Queen', 'Ramattra', 'Reinhardt', 'Sigma']
};

export const TANK_HEROES = [
  'D.Va', 'Domina', 'Doomfist', 'Hazard', 'Junker Queen', 'Mauga',
  'Orisa', 'Ramattra', 'Reinhardt', 'Roadhog', 'Sigma', 'Winston', 'Wrecking Ball', 'Zarya'
];

export const MAPS_BY_MODE = {
  control: [
    { name: 'Antarctic Peninsula', region: 'Antarctica', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/7/7c/Antarctic_Peninsula_1.png', type: 'control', stages: 3 },
    { name: 'Busan', region: 'South Korea', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/0/09/Overwatch_Busan.jpg', type: 'control', stages: 3 },
    { name: 'Ilios', region: 'Greece', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/4/45/Ilios.jpg', type: 'control', stages: 3 },
    { name: 'Lijiang Tower', region: 'China', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/9/9b/Lijiang_Tower_loading_screen.jpg', type: 'control', stages: 3 },
    { name: 'Nepal', region: 'Nepal', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/f/f3/Nepal_loading_screen.jpg', type: 'control', stages: 3 },
    { name: 'Oasis', region: 'Iraq', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/f/fc/Oasis.jpg', type: 'control', stages: 3 },
    { name: 'Samoa', region: 'Samoa', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/b/b4/Samoa.jpg', type: 'control', stages: 3 }
  ],
  escort: [
    { name: 'Circuit Royal', region: 'Monaco', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/1/10/Monte_Carlo.jpg', type: 'escort' },
    { name: 'Dorado', region: 'Mexico', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/e/ec/Dorado-streets2.jpg', type: 'escort' },
    { name: 'Havana', region: 'Cuba', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/9/93/Havana.png', type: 'escort' },
    { name: 'Junkertown', region: 'Australia', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/e/e3/Junkertown.jpg', type: 'escort' },
    { name: 'Rialto', region: 'Italy', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/f/ff/Rialto.jpg', type: 'escort' },
    { name: 'Route 66', region: 'USA', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/a/a6/Route_66.jpg', type: 'escort' },
    { name: 'Shambali Monastery', region: 'Nepal', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/8/81/ShambaliEscort.png', type: 'escort' },
    { name: 'Watchpoint: Gibraltar', region: 'Gibraltar', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/8/8b/Gibraltar.jpg', type: 'escort' }
  ],
  flashpoint: [
    { name: 'Aatlis', region: 'Morocco', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/e/e6/Aatlis_loading_screen.png', type: 'flashpoint' },
    { name: 'New Junk City', region: 'Australia', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/a/ae/New_Junk_City.jpg', type: 'flashpoint' },
    { name: 'Suravasa', region: 'India', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/6/6f/Suravasa.jpg', type: 'flashpoint' }
  ],
  hybrid: [
    { name: 'Blizzard World', region: 'USA', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/f/f8/Blizzard_World.jpg', type: 'hybrid' },
    { name: 'Eichenwalde', region: 'Germany', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/a/aa/Eichenwalde.png', type: 'hybrid' },
    { name: 'Hollywood', region: 'USA', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/2/26/Hollywood-set.jpg', type: 'hybrid' },
    { name: 'Kings Row', region: 'United Kingdom', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/1/1b/King%27s_Row_concept.jpg', type: 'hybrid' },
    { name: 'Midtown', region: 'USA', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/4/4e/N18S6DCTDPG81613669123002.png', type: 'hybrid' },
    { name: 'Numbani', region: 'Nigeria', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/1/1b/Numbani_Loading_Screen.jpg', type: 'hybrid' },
    { name: 'Paraiso', region: 'Brazil', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/9/90/Para%C3%ADso_pvp.jpg', type: 'hybrid' }
  ],
  push: [
    { name: 'Colosseo', region: 'Italy', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/1/1e/Blizzconline_rome_01.png', type: 'push' },
    { name: 'Esperanca', region: 'Portugal', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/f/f5/PortugalPush.jpg', type: 'push' },
    { name: 'New Queen Street', region: 'Canada', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/9/91/Toronto.jpg', type: 'push' },
    { name: 'Runasapi', region: 'Peru', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/0/07/Runasapi_2.jpg', type: 'push' }
  ],
  clash: [
    { name: 'Hanaoka', region: 'Japan', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/3/39/Hanaoka_2.jpg', type: 'clash' },
    { name: 'Throne of Anubis', region: 'Egypt', image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/a/ab/Throne_of_Anubis.png', type: 'clash' }
  ]
};

export const ALL_MAPS = Object.values(MAPS_BY_MODE).flat().map(m => m.name).sort();

// OW2 Ranks
export const RANKS = [
  'Bronze 5', 'Bronze 4', 'Bronze 3', 'Bronze 2', 'Bronze 1',
  'Silver 5', 'Silver 4', 'Silver 3', 'Silver 2', 'Silver 1',
  'Gold 5', 'Gold 4', 'Gold 3', 'Gold 2', 'Gold 1',
  'Platinum 5', 'Platinum 4', 'Platinum 3', 'Platinum 2', 'Platinum 1',
  'Diamond 5', 'Diamond 4', 'Diamond 3', 'Diamond 2', 'Diamond 1',
  'Master 5', 'Master 4', 'Master 3', 'Master 2', 'Master 1',
  'Grandmaster 5', 'Grandmaster 4', 'Grandmaster 3', 'Grandmaster 2', 'Grandmaster 1',
  'Champion 5', 'Champion 4', 'Champion 3', 'Champion 2', 'Champion 1'
];

export const RANK_COLORS = {
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  Platinum: '#00bcd4',
  Diamond: '#2196f3',
  Master: '#9c27b0',
  Grandmaster: '#ff9800',
  Champion: '#f44336'
};

export const QUICK_TAGS = [
  'smurf', 'thrower', 'feeder', 'good-dps', 'good-support',
  'bad-team', 'clutch', 'comeback', 'stomp', 'close-game',
  'toxic', 'coordinated'
];

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getMapImage = (mapName) => {
  for (const modeType of Object.values(MAPS_BY_MODE)) {
    const map = modeType.find(m => m.name === mapName);
    if (map) return map;
  }
  return null;
};

export const getRankColor = (rank) => {
  if (!rank) return '#888';
  const tier = rank.split(' ')[0];
  return RANK_COLORS[tier] || '#888';
};

export const getHeroesBySubclass = () => {
  const grouped = {};
  ['bruiser', 'initiator', 'stalwart'].forEach(sc => {
    grouped[sc] = TANK_HEROES_BY_SUBCLASS[sc] || [];
  });
  return grouped;
};
