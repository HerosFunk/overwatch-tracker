// Overwatch Season 1 (2026) Data
// Heroes sorted by subclass with images and ban pool

const HEROES_BY_SUBCLASS = {
  tank: {
    heavyweight: [
      {
        name: 'Reinhardt',
        image: 'https://d15f34w2p8f5aq.cloudfront.net/overwatch/ce01d43cfc5055fc4dce0ce7a0d5f25a.png',
        role: 'tank',
        subclass: 'heavyweight',
        bannable: true
      },
      {
        name: 'Junker Queen',
        image: 'https://d15f34w2p8f5aq.cloudfront.net/overwatch/a25017f2a4b88208d83eb0da3c81bc48.png',
        role: 'tank',
        subclass: 'heavyweight',
        bannable: true
      },
      {
        name: 'Mauga',
        image: 'https://d15f34w2p8f5aq.cloudfront.net/overwatch/0c2c9d5a5ba86bb2c98e88c3e32c2a04.png',
        role: 'tank',
        subclass: 'heavyweight',
        bannable: true
      }
    ],
    mobility: [
      {
        name: 'D.Va',
        image: 'https://d15f34w2p8f5aq.cloudfront.net/overwatch/f73a3b5bb4a90dcd7a4a6a9f0a0dcc77.png',
        role: 'tank',
        subclass: 'mobility',
        bannable: true
      },
      {
        name: 'Wrecking Ball',
        image: 'https://d15f34w2p8f5aq.cloudfront.net/overwatch/30fb750c2157dc53fb6f41f8f5a27bb5.png',
        role: 'tank',
        subclass: 'mobility',
        bannable: true
      }
    ],
    ranged: [
      {
        name: 'Orisa',
        image: 'https://d15f34w2p8f5aq.cloudfront.net/overwatch/05ef7c62f4d0e48d57eeca5e05fcd98e.png',
        role: 'tank',
        subclass: 'ranged',
        bannable: true
      },
      {
        name: 'Sigma',
        image: 'https://d15f34w2p8f5aq.cloudfront.net/overwatch/f76cd1ffc80f5c0f5ac40a6959ec4d85.png',
        role: 'tank',
        subclass: 'ranged',
        bannable: true
      }
    ],
    brawler: [
      {
        name: 'Doomfist',
        image: 'https://d15f34w2p8f5aq.cloudfront.net/overwatch/2d5c22e7074e2a4ee1f71f68ef3edd7f.png',
        role: 'tank',
        subclass: 'brawler',
        bannable: true
      },
      {
        name: 'Ramattra',
        image: 'https://d15f34w2p8f5aq.cloudfront.net/overwatch/c5c6c8e5ae7b7f0bd0b5e7f8c3d3d3d3.png',
        role: 'tank',
        subclass: 'brawler',
        bannable: true
      }
    ],
    displacement: [
      {
        name: 'Roadhog',
        image: 'https://d15f34w2p8f5aq.cloudfront.net/overwatch/a4b4c5d6e7f8g9h0i1j2k3l4m5n6o7p.png',
        role: 'tank',
        subclass: 'displacement',
        bannable: true
      },
      {
        name: 'Winston',
        image: 'https://d15f34w2p8f5aq.cloudfront.net/overwatch/b5c5d6e7f8g9h0i1j2k3l4m5n6o7p8q.png',
        role: 'tank',
        subclass: 'displacement',
        bannable: true
      }
    ]
  }
};

const MAPS_BY_MODE = {
  // Control maps (best of 3 - symmetric)
  control: [
    {
      name: 'Antarctic Peninsula',
      region: 'Antarctica',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/7/7c/Antarctic_Peninsula_1.png',
      type: 'control',
      stages: 3
    },
    {
      name: 'Busan',
      region: 'South Korea',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/0/09/Overwatch_Busan.jpg',
      type: 'control',
      stages: 3
    },
    {
      name: 'Ilios',
      region: 'Greece',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/4/45/Ilios.jpg',
      type: 'control',
      stages: 3
    },
    {
      name: 'Lijiang Tower',
      region: 'China',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/9/9b/Lijiang_Tower_loading_screen.jpg',
      type: 'control',
      stages: 3
    },
    {
      name: 'Nepal',
      region: 'Nepal',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/f/f3/Nepal_loading_screen.jpg',
      type: 'control',
      stages: 3
    },
    {
      name: 'Oasis',
      region: 'Iraq',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/f/fc/Oasis.jpg',
      type: 'control',
      stages: 3
    },
    {
      name: 'Samoa',
      region: 'Samoa',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/b/b4/Samoa.jpg',
      type: 'control',
      stages: 3
    }
  ],

  // Escort maps (payload)
  escort: [
    {
      name: 'Circuit Royal',
      region: 'Monaco',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/1/10/Monte_Carlo.jpg',
      type: 'escort',
      checkpoints: 3
    },
    {
      name: 'Dorado',
      region: 'Mexico',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/e/ec/Dorado-streets2.jpg',
      type: 'escort',
      checkpoints: 3
    },
    {
      name: 'Havana',
      region: 'Cuba',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/9/93/Havana.png',
      type: 'escort',
      checkpoints: 3
    },
    {
      name: 'Junkertown',
      region: 'Australia',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/e/e3/Junkertown.jpg',
      type: 'escort',
      checkpoints: 3
    },
    {
      name: 'Rialto',
      region: 'Italy',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/f/ff/Rialto.jpg',
      type: 'escort',
      checkpoints: 3
    },
    {
      name: 'Route 66',
      region: 'USA',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/a/a6/Route_66.jpg',
      type: 'escort',
      checkpoints: 3
    },
    {
      name: 'Shambali Monastery',
      region: 'Nepal',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/8/81/ShambaliEscort.png',
      type: 'escort',
      checkpoints: 3
    },
    {
      name: 'Watchpoint: Gibraltar',
      region: 'Gibraltar',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/8/8b/Gibraltar.jpg',
      type: 'escort',
      checkpoints: 3
    }
  ],

  // Flashpoint maps (capture and control 3 points)
  flashpoint: [
    {
      name: 'Aatlis',
      region: 'Morocco',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/e/e6/Aatlis_loading_screen.png',
      type: 'flashpoint',
      points: 5
    },
    {
      name: 'New Junk City',
      region: 'Australia',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/a/ae/New_Junk_City.jpg',
      type: 'flashpoint',
      points: 5
    },
    {
      name: 'Suravasa',
      region: 'India',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/6/6f/Suravasa.jpg',
      type: 'flashpoint',
      points: 5
    }
  ],

  // Hybrid maps (capture + escort)
  hybrid: [
    {
      name: 'Blizzard World',
      region: 'USA',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/f/f8/Blizzard_World.jpg',
      type: 'hybrid',
      objectives: ['capture', 'escort']
    },
    {
      name: 'Eichenwalde',
      region: 'Germany',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/a/aa/Eichenwalde.png',
      type: 'hybrid',
      objectives: ['capture', 'escort']
    },
    {
      name: 'Hollywood',
      region: 'USA',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/2/26/Hollywood-set.jpg',
      type: 'hybrid',
      objectives: ['capture', 'escort']
    },
    {
      name: "King's Row",
      region: 'United Kingdom',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/1/1b/King%27s_Row_concept.jpg',
      type: 'hybrid',
      objectives: ['capture', 'escort']
    },
    {
      name: 'Midtown',
      region: 'USA',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/4/4e/N18S6DCTDPG81613669123002.png',
      type: 'hybrid',
      objectives: ['capture', 'escort']
    },
    {
      name: 'Numbani',
      region: 'Nigeria',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/1/1b/Numbani_Loading_Screen.jpg',
      type: 'hybrid',
      objectives: ['capture', 'escort']
    },
    {
      name: 'Paraiso',
      region: 'Brazil',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/9/90/Para%C3%ADso_pvp.jpg',
      type: 'hybrid',
      objectives: ['capture', 'escort']
    }
  ],

  // Push maps (symmetric, push robot to win)
  push: [
    {
      name: 'Colosseo',
      region: 'Italy',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/1/1e/Blizzconline_rome_01.png',
      type: 'push',
      symmetric: true
    },
    {
      name: 'Esperanca',
      region: 'Portugal',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/f/f5/PortugalPush.jpg',
      type: 'push',
      symmetric: true
    },
    {
      name: 'New Queen Street',
      region: 'Canada',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/9/91/Toronto.jpg',
      type: 'push',
      symmetric: true
    },
    {
      name: 'Runasapi',
      region: 'Peru',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/0/07/Runasapi_2.jpg',
      type: 'push',
      symmetric: true
    }
  ],

  // Clash maps (newest game mode)
  clash: [
    {
      name: 'Hanaoka',
      region: 'Japan',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/3/39/Hanaoka_2.jpg',
      type: 'clash',
      points: 5
    },
    {
      name: 'Throne of Anubis',
      region: 'Egypt',
      image: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/a/ab/Throne_of_Anubis.png',
      type: 'clash',
      points: 5
    }
  ]
};

// OW2 Rank system
const RANKS = [
  'Bronze 5', 'Bronze 4', 'Bronze 3', 'Bronze 2', 'Bronze 1',
  'Silver 5', 'Silver 4', 'Silver 3', 'Silver 2', 'Silver 1',
  'Gold 5', 'Gold 4', 'Gold 3', 'Gold 2', 'Gold 1',
  'Platinum 5', 'Platinum 4', 'Platinum 3', 'Platinum 2', 'Platinum 1',
  'Diamond 5', 'Diamond 4', 'Diamond 3', 'Diamond 2', 'Diamond 1',
  'Master 5', 'Master 4', 'Master 3', 'Master 2', 'Master 1',
  'Grandmaster 5', 'Grandmaster 4', 'Grandmaster 3', 'Grandmaster 2', 'Grandmaster 1',
  'Champion 5', 'Champion 4', 'Champion 3', 'Champion 2', 'Champion 1'
];

// Season 1 (2026) updates and changes
const SEASON_1_INFO = {
  name: 'Season 1: 2026',
  startDate: new Date('2026-02-17'),
  endDate: new Date('2026-05-17'),
  changes: [
    'Ban pools refreshed with newer hero meta considerations',
    'Maps rotated: Removed from competitive, Added new maps',
    'New seasonal cosmetics for 10+ ranked wins'
  ],
  banPool: [
    'Reinhardt', 'Doomfist', 'Junker Queen', 'Mauga', 'Orisa',
    'Ramattra', 'Roadhog', 'Sigma', 'Winston', 'Wrecking Ball', 'D.Va'
  ]
};

module.exports = {
  HEROES_BY_SUBCLASS,
  MAPS_BY_MODE,
  RANKS,
  SEASON_1_INFO
};
