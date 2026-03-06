import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../../data");

let eventsData = null;
let usersData = null;
let marketsData = null;

// Load mock data from JSON files
function loadMockData() {
    if (!eventsData) {
        eventsData = JSON.parse(
            fs.readFileSync(path.join(dataDir, "events.json"), "utf-8")
        );
    }
    if (!usersData) {
        usersData = JSON.parse(
            fs.readFileSync(path.join(dataDir, "users.json"), "utf-8")
        );
    }
    if (!marketsData) {
        marketsData = JSON.parse(
            fs.readFileSync(path.join(dataDir, "markets.json"), "utf-8")
        );
    }
}

// Get all live events
export function getAllEvents() {
    loadMockData();
    return eventsData.events || [];
}

// Get a specific event by ID
export function getEventById(eventId) {
    loadMockData();
    return eventsData.events.find((e) => e.eventId === eventId);
}

// Get all users
export function getAllUsers() {
    loadMockData();
    return usersData.users || [];
}

// Get a specific user by ID
export function getUserById(userId) {
    loadMockData();
    return usersData.users.find((u) => u.userId === userId);
}

// Get all markets
export function getAllMarkets() {
    loadMockData();
    return marketsData.markets || {};
}

// Get markets for a specific event
export function getMarketsByEventId(eventId) {
    loadMockData();
    const event = eventsData.events.find((e) => e.eventId === eventId);
    if (!event) return {};

    const eventMarkets = {};
    event.marketIds.forEach((marketId) => {
        if (marketsData.markets[marketId]) {
            eventMarkets[marketId] = marketsData.markets[marketId];
        }
    });

    return eventMarkets;
}

// Get a specific market by ID
export function getMarketById(marketId) {
    loadMockData();
    return marketsData.markets[marketId];
}

// Simulate updating event stats (for live simulation)
export function updateEventStats(eventId) {
    loadMockData();
    const event = eventsData.events.find((e) => e.eventId === eventId);
    if (event && event.status === "live") {
        // Simulate minute progression
        if (event.minute < 90) {
            event.minute += Math.floor(Math.random() * 2) + 1;
        }

        // Simulate stats changes
        if (Math.random() > 0.7) {
            event.stats.shots.home += Math.floor(Math.random() * 2);
            event.stats.shotsOnTarget.home += Math.floor(Math.random() * 1);
        }
        if (Math.random() > 0.7) {
            event.stats.shots.away += Math.floor(Math.random() * 2);
            event.stats.shotsOnTarget.away += Math.floor(Math.random() * 1);
        }
        if (Math.random() > 0.75) {
            event.stats.corners.home += 1;
        }
        if (Math.random() > 0.75) {
            event.stats.corners.away += 1;
        }
    }
    return event;
}
