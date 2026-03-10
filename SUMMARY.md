# 🎯 Betclic POC — Résumé Succinct

## Qu'est-ce que c'est ?

Un **POC (Proof of Concept)** d'une plateforme de paris sportifs qui démontre une **recommandation intelligente et pertinente** adaptée au contexte live du match et au profil de l'utilisateur.

## Ce qu'il démontre

### 1. **Recommandations contextuelles en temps réel**
- L'engine analyse **8 signaux live** : minute du match, score, tirs, corners, profil utilisateur, cotes, momentum, etc.
- **Résultat** : top 4 marchés pertinents triés par probabilité de gain + sélection auto de la meilleure option
- **Example** : À 72min avec Man City 2-1, le système recommande `Prochain but Man City` + `Plus de 2.5 buts` avec cotes optimales

### 2. **UX cohérente et fluide**
- Header rouge Betclic ✅
- 15 marchés réalistes (1X2, Over/Under, Next Goal, HT/FT, Corners, etc.)
- Tabs de catégories (Populaires, Buts, Résultats, Stats)
- **Bet slip dynamique** (ajouter/retirer/calculer gains)
- Recommandations stylisées comme les paris (jaune + noir)

### 3. **Pertinence intelligente vs bêtise**
Au lieu d'afficher **tous les marchés en vrac**, on propose les **4 meilleurs** avec :
- Tags contextuels (`Match chaud`, `Live`, `Value`, `Safe`, `Pour vous`)
- Explication française du pourquoi (`Beaucoup d'occasions, marché live actif`)
- Cote pré-sélectionnée la plus judicieuse
- Confiance en % (barre rouge)

### 4. **Profils utilisateurs**
3 personas de testeurs avec historiques différents :
- **Casual** : préfère 1X2 + BTTS (safe)
- **Goals Advocate** : chasse les buts (Over/Under, Next Goal)
- **Enthusiast** : live betting (HT/FT, score exact)

À chaque profil → recommandations adaptées

## Architecture

```
Backend (Express.js)
├── /api/users → profils + stats
├── /api/events → matchs live
├── /api/events/:id/markets → 15 marchés par match
└── /api/users/:id/events/:id/recommendations → TOP 4 intelligents

Frontend (React + Vite + Tailwind)
├── MatchPage (score 6xl + stats)
├── MarketGrid (tabs + sorting pertinent)
├── RecommendationPanel (tags + CTA jaune)
└── BetSlip (sticky bottom, combine odds)
```

## Pourquoi c'est pertinent pour Betclic ?

| Aspect | POC démontre |
|--------|-------------|
| **UX** | Betclic.fr color scheme + yellow betting buttons |
| **Engagement** | Smart recommendations → clics + conversions |
| **Rétention** | Profils = suivi des préférences → replay |
| **Speed** | Calculs <100ms, UI fluide |
| **Scale** | Backend prêt pour N users + events |

## Live Demo

1. **Accueil** → 3 profils utilisateurs
2. **Match live** → Score énorme + live stats
3. **Recommandations** → 4 paris intelligents avec explications
4. **Bet slip** → Ajouter/retirer → cotes combinées + gain potentiel
5. **Switch profil** → Recommandations changent instantanément

## Déploiement

- **GitHub** : https://github.com/SaadElAboudi/betclic-poc
- **Render** : Déploiement monorepo simple (1 service = backend + frontend)
- **Live** : https://betclic-poc.onrender.com

## TL;DR

Un POC qui prouve qu'on peut faire une **plateforme de paris moderna, pertinente et intelligente** qui :
- Comprend le contexte live
- Adapte les recommandations au profil
- Affiche une UX clean et cohérente
- Gère les combinaisons de paris fluide

Le tout prêt à brancher à une vraie API Genesys/Twilio/SMS et un système de paiement.
