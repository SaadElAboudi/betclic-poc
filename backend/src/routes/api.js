import express from "express";
import {
    getAllEvents,
    getEventById,
    getMarketsByEventId,
    getMarketById,
    getAllUsers,
    getUserById,
    updateEventStats,
} from "../services/dataService.js";
import {
    getPersonalizedRecommendations,
    generateExplanation,
    getUserBettingStats,
    computeRiskSignal,
    buildScenarioFlags,
} from "../services/recommendationEngine.js";

const router = express.Router();

// Get all live events
router.get("/events", (req, res) => {
    const events = getAllEvents();
    res.json(events);
});

// Get a specific event with stats
router.get("/events/:eventId", (req, res) => {
    const event = getEventById(req.params.eventId);
    if (!event) {
        return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
});

// Get markets for a specific event
router.get("/events/:eventId/markets", (req, res) => {
    const markets = getMarketsByEventId(req.params.eventId);
    if (Object.keys(markets).length === 0) {
        return res.status(404).json({ error: "No markets found for this event" });
    }
    res.json(markets);
});

// Get a specific market
router.get("/markets/:marketId", (req, res) => {
    const market = getMarketById(req.params.marketId);
    if (!market) {
        return res.status(404).json({ error: "Market not found" });
    }
    res.json(market);
});

// Get all users
router.get("/users", (req, res) => {
    const users = getAllUsers();
    res.json(users);
});

// Get a specific user
router.get("/users/:userId", (req, res) => {
    const user = getUserById(req.params.userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
});

// Get personalized recommendations for a user for a specific event
router.get("/users/:userId/events/:eventId/recommendations", (req, res) => {
    const user = getUserById(req.params.userId);
    const event = getEventById(req.params.eventId);
    const markets = getMarketsByEventId(req.params.eventId);

    if (!user || !event) {
        return res.status(404).json({ error: "User or event not found" });
    }

    const mode = ["adaptive", "balanced", "strict"].includes(req.query.mode)
        ? req.query.mode
        : "adaptive";
    const topNRaw = Number.parseInt(req.query.topN, 10);
    const topN = Number.isFinite(topNRaw) ? topNRaw : null;

    const recommendations = getPersonalizedRecommendations(user, event, markets, { mode, topN });

    // Enrich recommendations with explanations
    const enrichedRecommendations = recommendations.map((rec) => ({
        ...rec,
        explanation: generateExplanation(rec.reasons),
    }));

    const riskSignal = computeRiskSignal(user);
    const scenarioFlags = buildScenarioFlags(user, event, markets, riskSignal);

    res.json({ recommendations: enrichedRecommendations, riskSignal, scenarioFlags, mode, topN });
});

// Get risk signal for a user
router.get("/users/:userId/risk", (req, res) => {
    const user = getUserById(req.params.userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    const signal = computeRiskSignal(user);
    res.json(signal);
});

// Get user betting statistics
router.get("/users/:userId/stats", (req, res) => {
    const user = getUserById(req.params.userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const stats = getUserBettingStats(user);
    res.json(stats);
});

// Simulate live update for an event (for demo purposes)
router.post("/events/:eventId/simulate", (req, res) => {
    const event = updateEventStats(req.params.eventId);
    if (!event) {
        return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
});

// Health check
router.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

export default router;
