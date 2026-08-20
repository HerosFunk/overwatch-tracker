# 🎮 Overwatch Tank Ranked Tracker

Un tracker complet pour tes games ranked en Tank sur Overwatch 2 avec un mode **Companion** en temps réel pour t'assister pendant tes parties.

## ✨ Fonctionnalités

### 📊 Dashboard
- **Stats globales** : SR actuel, winrate, streak, nombre de games
- **Graphique d'évolution SR** : Visualise ta progression au fil du temps
- **Stats par héros** : Découvre tes meilleurs/pires tanks
- **Stats par map** : Winrate par map, ATK vs DEF
- **Comparaison saisons** : Historique complet

<img width="1890" height="847" alt="image" src="https://github.com/user-attachments/assets/cbe81be1-0507-4431-b35a-147a5a23cae4" />


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


