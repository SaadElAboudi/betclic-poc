// Recommendation scoring logic based on user preferences and match context
export function getPersonalizedRecommendations(user, event, markets) {
    if (!user || !event || !markets) {
        return [];
    }

    const recommendations = [];
    const MAX_SCORE = 130; // Maximum possible score from all rules

    // Score each market based on user preferences and match context
    const scoredMarkets = Object.values(markets).map((market) => {
        let score = 0;
        let reasons = [];

        if (market.eventId !== event.eventId) {
            return { ...market, score: -1, reasons: [] };
        }

        // Rule 1: User's preferred market types
        if (user.preferredMarkets.includes(market.type)) {
            score += 30;
            reasons.push(`You frequently bet on ${market.type.replace(/_/g, " ")} markets.`);
        }

        // Rule 2: User's favorite teams
        const homeTeam = event.homeTeam;
        const awayTeam = event.awayTeam;
        if (user.favoriteTeams.includes(homeTeam) || user.favoriteTeams.includes(awayTeam)) {
            score += 25;
            const team = user.favoriteTeams.includes(homeTeam) ? homeTeam : awayTeam;
            reasons.push(`You frequently bet on ${team} matches.`);
        }

        // Rule 3: Match context - high-scoring matches suggest goal markets
        if (market.type === "over_under") {
            const totalScore = event.homeScore + event.awayScore;
            if (totalScore >= 2) {
                score += 20;
                reasons.push("This match has high goal activity.");
            }
        }

        // Rule 4: Match context - high shots suggest next goal
        if (market.type === "next_goal") {
            const totalShots = event.stats.shots.home + event.stats.shots.away;
            if (totalShots >= 10) {
                score += 18;
                reasons.push("High number of shots on target detected.");
            }
        }

        // Rule 5: Match context - high corners suggest corner markets
        if (market.type === "corners") {
            const totalCorners = event.stats.corners.home + event.stats.corners.away;
            if (totalCorners >= 4) {
                score += 15;
                reasons.push("Increased corner activity in this match.");
            }
        }

        // Rule 6: Balance - if user is goal market enthusiast
        if (user.profile === "goalsadvocate") {
            if (market.type === "over_under" || market.type === "both_teams_score") {
                score += 15;
            }
        }

        // Rule 7: Balance - if user is live betting enthusiast
        if (user.profile === "enthusiast") {
            if (market.type === "next_goal" || market.type === "next_point") {
                score += 20;
            }
        }

        // Rule 8: Odds attractiveness
        const avgOdds =
            market.options.reduce((sum, opt) => sum + opt.odds, 0) / market.options.length;
        if (avgOdds >= 1.80 && avgOdds <= 2.50) {
            score += 10;
        }

        return { ...market, score, reasons };
    });

    // Filter, sort, and return top 3 recommendations
    const topRecommendations = scoredMarkets
        .filter((m) => m.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    return topRecommendations.map((rec) => ({
        marketId: rec.marketId,
        type: rec.type,
        name: rec.name,
        options: rec.options,
        reasons: rec.reasons,
        score: Math.min(rec.score, MAX_SCORE),
        normalizedScore: Math.round((Math.min(rec.score, MAX_SCORE) / MAX_SCORE) * 100),
    }));
}

// Generate a natural language explanation for a recommendation
export function generateExplanation(reasons) {
    if (!reasons || reasons.length === 0) {
        return "Based on your betting profile";
    }

    if (reasons.length === 1) {
        return reasons[0];
    }

    return reasons.slice(0, 2).join(" Also, ");
}

// Get betting statistics for a user
export function getUserBettingStats(user) {
    if (!user) {
        return { totalBets: 0, winRate: 0, favoriteSport: "N/A" };
    }

    const validWinRate = Math.max(0, Math.min(100, Math.round(user.winRate * 100)));

    return {
        totalBets: user.totalBets,
        winRate: validWinRate,
        favoriteSport: user.preferredSports[0] || "Football",
        profile: user.profile,
    };
}
