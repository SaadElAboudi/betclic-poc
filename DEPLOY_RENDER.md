# 🚀 Déploiement sur Render

## Option 1 : Déploiement Simple (RECOMMANDÉ)

### 1. Créer un nouveau Web Service

1. Va sur [Render Dashboard](https://dashboard.render.com/)
2. Clique sur **"New +"** → **"Web Service"**
3. Connecte ton repo GitHub : `SaadElAboudi/betclic-poc`

### 2. Configuration du Service

Remplis les champs suivants :

**Name:** `betclic-poc`

**Root Directory:** (laisse vide)

**Environment:** `Node`

**Branch:** `main`

**Build Command:**
```bash
npm run install:all && npm run build
```

**Start Command:**
```bash
npm start
```

**Plan:** Free

### 3. Variables d'environnement

Clique sur **"Advanced"** et ajoute :

- `NODE_ENV` = `production`

### 4. Deploy

Clique sur **"Create Web Service"**

Render va :
- Installer les dépendances du backend et frontend
- Builder le frontend (Vite)
- Démarrer le backend qui sert le frontend compilé

**C'est tout !** Ton app sera accessible à l'URL fournie par Render.

---

## ⚙️ Comment ça marche

1. Le backend Express sert les fichiers statiques du frontend depuis `/frontend/dist`
2. Toutes les routes `/api/*` sont gérées par l'API
3. Toutes les autres routes servent `index.html` (pour le routing React)
4. Le frontend fait des appels à `/api` (même domaine, pas de CORS)

---

## 🔧 Tester en local

```bash
# Build frontend
cd frontend
npm run build

# Start backend (sert le frontend)
cd ../backend
npm start
```

Ouvre http://localhost:5000 → ton app fonctionne comme sur Render !

---

## 🐛 Dépannage

### Build fail
- Vérifie que Node >= 20 dans les Settings
- Vérifie la Build Command

### App ne charge pas
- Vérifie la Start Command
- Regarde les logs dans Render Dashboard

### API errors
- Les appels API se font sur `/api` (pas de CORS)
- Vérifie que le backend démarre bien
