# 🎮 Overwatch Tank Ranked Tracker

Un tracker complet pour tes games ranked en Tank sur Overwatch 2 avec un mode **Companion** en temps réel pour t'assister pendant tes parties.

## ✨ Fonctionnalités

### 📊 Dashboard
- **Stats globales** : SR actuel, winrate, streak, nombre de games
- **Graphique d'évolution SR** : Visualise ta progression au fil du temps
- **Stats par héros** : Découvre tes meilleurs/pires tanks
- **Stats par map** : Winrate par map, ATK vs DEF
- **Comparaison saisons** : Historique complet

### 🎯 Mode Companion (En-Game)
Workflow complet pour chaque partie :

1. **Sélection map pool** : Choisis les 3 maps du vote
2. **Stats instantanées** : Affiche tes stats sur chaque map
3. **Aide aux bans** : Recommandations basées sur ton historique
4. **Choix du side** : Stats ATK vs DEF sur la map choisie
5. **Sélection héros** : Suggestions avec winrate par map
6. **Pendant la game** : Timer + notes rapides
7. **Post-game** : Sauvegarde automatique avec SR change

## 🛠️ Stack Technique

**Backend:**
- Node.js + Express
- MongoDB (base de données)
- Mongoose (ODM)

**Frontend:**
- React 18
- React Router (navigation)
- Recharts (graphiques)
- Axios (API calls)

## 🚀 Installation

### Prérequis
- Node.js 16+
- MongoDB installé et lancé

### 1. Clone le repo
```bash
git clone https://github.com/HerosFunk/overwatch-tracker.git
cd overwatch-tracker
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Édite .env si nécessaire (PORT, MONGODB_URI)
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

### 4. Lancer MongoDB
```bash
# Dans un terminal séparé
mongod
```

### 5. Créer une saison active
```bash
# Utilise Postman, curl ou ton navigateur
POST http://localhost:5000/api/seasons
Content-Type: application/json

{
  "name": "Season 14",
  "startDate": "2025-01-01T00:00:00.000Z",
  "isActive": true,
  "startingSR": 3200
}
```

### 6. Lancer l'application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Serveur sur http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# App sur http://localhost:3000
```

## 📡 API Endpoints

### Games
- `GET /api/games` - Liste toutes les games
- `GET /api/games/:id` - Game spécifique
- `POST /api/games` - Créer une game
- `PUT /api/games/:id` - Modifier une game
- `DELETE /api/games/:id` - Supprimer une game

### Stats
- `GET /api/stats/overall` - Stats globales
- `GET /api/stats/heroes` - Stats par héros
- `GET /api/stats/maps` - Stats par map
- `POST /api/stats/map-pool` - Stats pour un map pool spécifique
- `GET /api/stats/heroes/best-worst` - Meilleurs/pires héros
- `GET /api/stats/sr-history` - Historique SR

### Seasons
- `GET /api/seasons` - Toutes les saisons
- `GET /api/seasons/active` - Saison active
- `POST /api/seasons` - Créer une saison
- `PUT /api/seasons/:id` - Modifier une saison
- `POST /api/seasons/:id/activate` - Activer une saison

### 🆕 Season 1 (2026) - Nouvelles Routes

**Bans Management** (19 nouveaux endpoints)
- `GET /api/bans/pool` - Ban pool actuel
- `GET /api/bans/heroes-by-subclass` - Héros organisés par sous-classe
- `PUT /api/bans/pool` - Mettre à jour le ban pool

**Placement Cards**
- `GET /api/cards/available` - Cartes disponibles
- `GET /api/cards/pool` - Pool de cartes de la saison
- `POST /api/cards/validate` - Valider la sélection de carte

**Rank Evolution Modifiers**
- `GET /api/modifiers/current` - Modifiers actuels
- `GET /api/modifiers/available` - Tous les modifiers
- `GET /api/modifiers/type/:type` - Modifiers par type (win/loss/special)

**Maps Organization**
- `GET /api/maps/by-mode` - Maps organisées par mode
- `GET /api/maps/mode/:mode` - Maps pour un mode spécifique

**Heroes Organization**
- `GET /api/heroes/by-subclass` - Héros organisés par sous-classe
- `GET /api/heroes/subclass/:subclass` - Héros pour une sous-classe

## 🎮 Utilisation

### Mode Dashboard
1. Ouvre l'app sur `http://localhost:3000`
2. Visualise toutes tes stats
3. Analyse tes performances

### Mode Companion
1. Clique sur "🎮 Companion"
2. Avant chaque game :
   - Sélectionne les 3 maps du vote
   - Consulte tes stats sur chaque map
   - Note les bans ennemis
   - Choisis ton side (ATK/DEF)
   - Sélectionne ton tank
3. Pendant la game :
   - Entre ton SR de départ
   - Ajoute des notes si besoin
4. Après la game :
   - Entre ton SR final
   - Clique Victoire/Défaite/Draw
   - La game est automatiquement sauvegardée !

## 📊 Structure de données

### Game
```javascript
{
  date: Date,
  season: "Season 14",
  result: "win|loss|draw",
  srBefore: 3200,
  srAfter: 3225,
  srChange: 25,
  map: "Kings Row",
  mapPool: ["Kings Row", "Dorado", "Eichenwalde"],
  sideStarted: "attack|defense",
  heroesPlayed: [{ hero: "Reinhardt", timePlayed: 15 }],
  bans: ["Roadhog", "Zarya"],
  notes: "Good team coordination",
  quickTags: ["clutch", "good-dps"],
  streak: 3
}
```

## 🔧 Personnalisation

### Ajouter de nouveaux héros
Édite `frontend/src/constants.js` et `backend/data/constants.js`

### Ajouter de nouvelles maps
Édite `frontend/src/constants.js` et `backend/data/constants.js`

### Modifier les couleurs
Édite les fichiers CSS :
- `App.css` - Thème global
- `Dashboard.css` - Dashboard
- `Companion.css` - Companion mode

## 📝 Notes

- **Tank uniquement** : L'app est optimisée pour tracker uniquement le rôle Tank
- **Ranked uniquement** : Pas de tracking pour QP ou Arcade
- **Gestion des saisons** : Crée une nouvelle saison à chaque reset Overwatch

## 🐛 Troubleshooting

**MongoDB ne se connecte pas:**
- Vérifie que MongoDB est bien lancé (`mongod`)
- Vérifie l'URI dans `.env`

**Frontend ne charge pas:**
- Vérifie que le backend tourne sur le bon port
- Vérifie `REACT_APP_API_URL` dans le frontend

**Pas de saison active:**
- Crée une saison via l'API (voir section Installation)

