# Betclic POC: Personalized Live Betting Recommendations

A **realistic proof-of-concept (POC)** demonstrating a data-driven personalized betting feature for Betclic.

This POC showcases:
- ⚽ **Live match simulation** with real-time stats updates
- 💡 **Intelligent recommendation engine** based on user profiles and match context
- 🎯 **Data-driven personalization** logic with transparent explanations
- 🎨 **Betclic-inspired dark UI** with sports betting aesthetics
- 🔄 **User profile switching** to demonstrate different recommendation outputs

## What This Demonstrates

### 1. **Visual Credibility** ✅
- Dark sportsbook interface matching Betclic's design language
- Live match header with real-time score and stats
- Professional betting card layouts with odds displays
- Responsive grid layout for markets and recommendations

### 2. **Product Logic** ✅
The recommendation engine evaluates:
- **User Preferences**: Favorite teams, preferred market types, risk profile
- **Betting History**: Past bet patterns and win rates
- **Match Context**: Live stats (possession, shots, corners) influencing market relevance
- **Smart Scoring**: Multi-factor algorithm returning top 3 personalized bets

### 3. **Data-Driven Transparency** ✅
Each recommendation includes:
- Explanation of why it's recommended
- Market type and odds display
- "Add to Bet Slip" interaction
- Footer explaining how the engine works

## Project Structure

```
betclic-mvp/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── index.js           # Server entry point
│   │   ├── routes/
│   │   │   └── api.js         # API endpoints
│   │   └── services/
│   │       ├── dataService.js # Data loading
│   │       └── recommendationEngine.js # Recommendation logic
│   ├── data/
│   │   ├── events.json        # Live match data
│   │   ├── users.json         # User profiles
│   │   └── markets.json       # Betting markets & odds
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # React 19 + Tailwind UI
│   ├── src/
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   ├── index.css          # Tailwind + custom styles
│   │   ├── components/
│   │   │   ├── MatchHeader.jsx
│   │   │   ├── LiveStats.jsx
│   │   │   ├── MarketGrid.jsx
│   │   │   ├── RecommendationPanel.jsx
│   │   │   └── UserProfileSelector.jsx
│   │   ├── lib/
│   │   │   └── api.js         # API client & utilities
│   │   └── context/
│   │       └── UserContext.jsx # User state management
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env.example
│
└── README.md                   # This file
```

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 19 + Tailwind CSS | Fast iteration, modern UI, responsive |
| **Backend** | Node.js 20+ + Express | Lightweight, real-time ready, JSON-first |
| **Mock Data** | JSON files | Realistic, easy to swap for real APIs |
| **Styling** | Tailwind CSS | Dark mode support, Betclic branding |

## Installation & Setup

### Prerequisites
- Node.js 20+
- npm

### 1. Install Backend Dependencies

```bash
cd backend
npm install
cp .env.example .env
```

### 2. Install Frontend Dependencies

```bash
cd ../frontend
npm install
cp .env.example .env
```

### 3. Run Backend

```bash
cd backend
npm run dev
```

Backend starts at: **http://localhost:5000**

API available at: **http://localhost:5000/api**

### 4. Run Frontend (in another terminal)

```bash
cd frontend
npm run dev
```

Frontend starts at: **http://localhost:3000**

## API Endpoints

All endpoints are prefixed with `/api`

### Events
- `GET /events` - List all events
- `GET /events/:eventId` - Get event details with live stats
- `GET /events/:eventId/markets` - Get all markets for an event
- `POST /events/:eventId/simulate` - Simulate live stats update

### Markets
- `GET /markets/:marketId` - Get specific market

### Users
- `GET /users` - List all user profiles
- `GET /users/:userId` - Get user profile
- `GET /users/:userId/stats` - Get user betting statistics
- `GET /users/:userId/events/:eventId/recommendations` - Get personalized recommendations

## User Profiles

### 1. **Alice Chen** 🎯 - Casual Bettor
- **Preference**: Match winner bets
- **Risk**: Low
- **Avg Stake**: €10
- **Experience**: 31 total bets, 45% win rate

### 2. **Marco Rossi** ⚡ - Live Betting Enthusiast
- **Preference**: Next goal, match momentum
- **Risk**: Medium
- **Avg Stake**: €25
- **Experience**: 83 total bets, 52% win rate

### 3. **Sophie Martin** 🎪 - Goal Markets Fan
- **Preference**: Over/Under, Both Teams Score
- **Risk**: Medium
- **Avg Stake**: €15
- **Experience**: 95 total bets, 48% win rate

**Switch between profiles** in the UI to see how recommendations change.

## Recommendation Engine Logic

The engine scores markets based on 8 rules:

1. **User's Preferred Markets** (+30 points)
   - If user frequently bets on this market type

2. **Favorite Teams** (+25 points)
   - If user's favorite team is playing

3. **Match Activity** (+20 points for Over/Under)
   - High-scoring matches suggest goal markets

4. **Shots on Target** (+18 points for Next Goal)
   - High shooting activity indicates next goal opportunities

5. **Corner Activity** (+15 points)
   - High corners suggest corner markets

6. **User Profile Bonuses** (+15-20 points)
   - Goal enthusiasts get boosted for goal markets
   - Live betting enthusiasts get boosted for next goal

7. **Odds Attractiveness** (+10 points)
   - If odds are in attractive range (1.80-2.50)

8. **Reasoning** 📝
   - Each recommendation includes plain-English explanation
   - Shows why it matches user profile and match context

### Example Recommendation Output

```json
{
  "marketId": "MKT002",
  "type": "over_under",
  "name": "Over/Under 2.5 Goals",
  "options": [
    { "id": "OPT004", "label": "Over 2.5", "odds": 1.85 },
    { "id": "OPT005", "label": "Under 2.5", "odds": 2.00 }
  ],
  "reasons": [
    "You frequently bet on over/under markets.",
    "This match has high goal activity."
  ],
  "explanation": "You frequently bet on over/under markets. Also, This match has high goal activity.",
  "score": 50
}
```

## Live Simulation

The app simulates live match updates every 10 seconds:
- ⏱️ Minute counter increments
- 📊 Stats (shots, corners) update randomly
- 🔄 Recommendations automatically re-calculate

## Key Features

### ✅ Visual Authenticity
- Betclic-inspired color palette (dark background, orange accents)
- Professional sports betting UI
- Clear odds displays and market cards
- Live badge with real-time pulse animation

### ✅ User Personalization
- 3 different user personas with distinct betting patterns
- Instant recommendation changes when switching profiles
- User statistics displayed (win rate, total bets)

### ✅ Transparent Product Logic
- **"How this works"** explanation in recommendation panel
- Each bet shows why it was recommended
- Data-driven reasoning visible to user

### ✅ Real-time Responsiveness
- Live match stats update every 10 seconds
- Recommendations refresh on user/match changes
- Smooth UI transitions and hover effects

## Design Colors

| Element | Color | Code |
|---------|-------|------|
| Background | Dark Grey | `#0E0E10` |
| Cards | Medium Grey | `#1C1C1F` |
| Primary | Orange | `#FF6A00` |
| Text | Light Grey | `#E0E0E0` |
| Text Secondary | Medium Grey | `#A0A0A0` |

## Customization

### Add New User Profile
Edit `backend/data/users.json`:
```json
{
  "userId": "USR004",
  "name": "Your Name",
  "avatar": "🎲",
  "profile": "custom",
  "description": "Your Profile Type",
  "preferredSports": ["football"],
  "preferredMarkets": ["match_winner"],
  "favoriteTeams": ["Team Name"],
  "avgStake": 20,
  "riskProfile": "medium",
  "betHistory": [...],
  "winRate": 0.50,
  "totalBets": 50
}
```

### Add New Markets
Edit `backend/data/markets.json` with new market definitions.

### Tweak Recommendation Scoring
Edit `backend/src/services/recommendationEngine.js` and adjust point values in `getPersonalizedRecommendations()`.

## Deployment

### Local Demo
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Production (Docker)
```bash
docker-compose up
```

Would need `Dockerfile` + `docker-compose.yml` setup.

## What Makes This Credible for Betclic

1. **Matches Betclic's Visual Brand** - Dark UI, orange accents, sports-first layout
2. **Real Product Thinking** - Not just design, but actual recommendation logic
3. **Data Transparency** - Shows how personalization works with clear reasoning
4. **Live Interaction** - Real-time stats updates make it feel authentic
5. **User-Centric** - Profile switching demonstrates personalization value immediately
6. **Professional Polish** - Proper error handling, API structure, component design

## Next Steps

To make this production-ready:

1. **Replace Mock Data** with real Betclic data sources
2. **Add Authentication** (JWT, OAuth)
3. **Integrate Genesys/Twilio** for real event streaming
4. **Add LLM Explanation** (use Gemini API for reasoning generation)
5. **Database** (PostgreSQL for persistent user preferences)
6. **Analytics** (track recommendation effectiveness)
7. **A/B Testing** (experiment with different algorithms)

## License

Internal POC - Betclic Product Demo

---

**Created**: March 6, 2026  
**Purpose**: Data Product Concept Validation  
**Status**: ✅ Ready for Demo
