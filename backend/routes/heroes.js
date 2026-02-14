const express = require('express');
const router = express.Router();
const { HEROES_BY_SUBCLASS } = require('../data/overwatchData');

// Get heroes organized by subclass
router.get('/by-subclass', (req, res) => {
  try {
    res.json(HEROES_BY_SUBCLASS);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get heroes by specific subclass
router.get('/subclass/:subclass', (req, res) => {
  try {
    const { subclass } = req.params;
    const heroSubclass = HEROES_BY_SUBCLASS.tank[subclass];

    if (!heroSubclass) {
      return res.status(404).json({ error: `Invalid hero subclass: ${subclass}` });
    }

    res.json({
      subclass: subclass,
      heroes: heroSubclass
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all tank heroes (flat list)
router.get('/', (req, res) => {
  try {
    const allHeroes = [];
    Object.values(HEROES_BY_SUBCLASS.tank).forEach(heroArray => {
      heroArray.forEach(hero => {
        allHeroes.push(hero.name);
      });
    });
    res.json(allHeroes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
