# Betclic POC - Guide de Démonstration

## 🎯 Vue d'ensemble

Ce POC démontre une **fonctionnalité de recommandations personnalisées** pour les paris en direct, inspirée du design et de l'expérience Betclic.

## 🎨 Design System

### Couleurs Betclic
- **Jaune primaire**: `#FFD900` - Couleur signature Betclic
- **Fond sombre**: `#121214` - Arrière-plan principal
- **Cartes**: `#242428` - Éléments de contenu
- **Bordures**: `#3A3A3E` - Séparateurs subtils

### Éléments clés du design
✅ Interface sombre moderne
✅ Accent jaune/or (matching Betclic)
✅ Cartes compactes avec bordures subtiles  
✅ Mise en page 1-X-2 pour les cotes
✅ Labels français authentiques

## 📱 Fonctionnalités Démontrées

### 1. Match en Direct
- Score en temps réel
- Indicateur LIVE animé
- Minute du match
- Logos d'équipes stylisés

### 2. Statistiques du Match
- Possession (barre de progression)
- Tirs / Tirs cadrés
- Corners / Fautes
- Affichage compact et lisible

### 3. Paris Disponibles
- Format 1-X-2 (victoire domicile / nul / victoire extérieur)
- Over/Under, Prochain but, Corners
- Cotes réalistes et cliquables
- Effet hover avec accent jaune

### 4. **Recommandations Personnalisées** ⭐
- Panel dédié avec icône étoile
- 3 recommandations par profil utilisateur
- **Raison de la recommandation** (explainability)
- Barre de confiance (pourcentage)
- Bouton d'ajout au pari

### 5. Sélecteur de Profil Utilisateur
3 personas démonstrés:
- **Parieur Casual**: Faible risque, match winner
- **Fan de Live**: Réactivité aux événements en direct
- **Expert Goals**: Spécialiste Over/Under

## 🔧 Architecture Technique

### Frontend
- **React 19** + Vite
- **Tailwind CSS** (design system customisé)
- Composants modulaires et réutilisables
- Hot Module Replacement (HMR)

### Backend
- **Node.js** + Express
- Données mockées (JSON)
- API RESTful
- Moteur de recommandation simulé

### Endpoints API
```
GET  /api/events                                  # Liste des événements
GET  /api/events/:eventId/markets                 # Marchés d'un événement
GET  /api/users                                   # Profils utilisateurs
GET  /api/users/:userId/events/:eventId/recommendations  # Recommandations
POST /api/events/:eventId/simulate                # Simulation live
```

## 🎬 Scénario de Démonstration

### Étape 1: Affichage Initial
- Match Liverpool vs Manchester City en cours (72')
- Score: 2-1
- Statistiques en temps réel

### Étape 2: Changement de Profil
1. Cliquer sur "Parieur Casual"
   → Recommandations: paris simples, faible risque
   
2. Cliquer sur "Expert Goals"  
   → Recommandations: Over/Under, marchés de buts
   
3. Cliquer sur "Fan de Live"
   → Recommandations: prochain but, événements immédiats

### Étape 3: Explorer les Recommandations
- Lire les **raisons** des recommandations
- Observer la **barre de confiance**
- Voir comment les cotes varient

## 💡 Logique de Personnalisation (Mockée)

Le moteur de recommandation simule:

1. **Analyse du profil utilisateur**
   - Historique de paris
   - Équipes favorites
   - Marchés préférés
   - Profil de risque

2. **Contexte du match**
   - Score actuel
   - Minute du jeu
   - Statistiques (tirs, corners)
   - Momentum

3. **Score de pertinence**
   - Combinaison profil × contexte
   - Top 3 recommandations
   - Explications transparentes

## 🚀 Démarrage Rapide

```bash
# Backend (Terminal 1)
cd backend
npm start
# → http://localhost:5000

# Frontend (Terminal 2)
cd frontend
npm run dev
# → http://localhost:3001
```

## 🎯 Points Forts du POC

### Pour Betclic
✅ Design fidèle à la charte graphique
✅ UX familière pour les utilisateurs Betclic
✅ Démontre la valeur de la personnalisation

### Pour les Product Owners
✅ Architecture modulaire et extensible
✅ API claire et documentée
✅ Données mockées faciles à remplacer

### Pour les Data Scientists
✅ Moteur de recommandation personnalisable
✅ Explainability built-in
✅ Métriques de confiance

## 📊 Métriques à Présenter

- **Temps de chargement**: <100ms (mocked data)
- **Recommandations**: 3 par utilisateur
- **Taux de confiance**: 75-95%
- **Profils utilisateurs**: 3 personas distincts

## 🔮 Extensions Possibles

1. **Intégration temps réel**
   - WebSocket pour odds live
   - Mise à jour automatique des stats

2. **ML/IA avancé**
   - Modèle de scoring réel
   - Apprentissage sur historique

3. **A/B Testing**
   - Plusieurs stratégies de recommandation
   - Mesure du taux de conversion

4. **Multi-sports**
   - Tennis, basketball
   - Adaptation des marchés

## 📝 Notes pour la Présentation

**Message clé**: "Ce POC démontre comment la personnalisation basée sur les données peut améliorer l'engagement et la satisfaction des utilisateurs de paris sportifs."

**Différenciateur**: Contrairement à une simple liste de paris, le système **comprend le contexte** et **adapte les suggestions** à chaque profil.

**Scalabilité**: L'architecture est prête pour intégration avec:
- Genesys Cloud / Twilio (CRM)
- Plateformes de paris réelles
- Systèmes de machine learning

---

## 🏆 Objectif Final

Prouver que **data + product thinking = meilleure expérience utilisateur** dans le monde des paris sportifs.
