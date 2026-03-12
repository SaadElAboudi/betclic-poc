// ────────────────────────────────────────────────────────────────────
// RESPONSIBLE GAMING: compute a risk signal from session behaviour
// ────────────────────────────────────────────────────────────────────
export function computeRiskSignal(user) {
    const session = user.session || {};
    const sessionBets = session.sessionBets || 0;
    const lossStreak = session.lossStreak || 0;
    const durationMinutes = session.sessionDurationMinutes || 0;
    const avgStakeLast = session.avgStakeLastSession || 0;
    const avgStakeBaseline = session.avgStakeBaseline || avgStakeLast || 1;
    const stakeIncrease = avgStakeBaseline > 0
        ? ((avgStakeLast - avgStakeBaseline) / avgStakeBaseline) * 100
        : 0;

    let riskScore = 0;

    // Loss streak signal
    if (lossStreak >= 3) riskScore += 40;
    else if (lossStreak >= 2) riskScore += 20;
    else if (lossStreak >= 1) riskScore += 8;

    // Session bet volume
    if (sessionBets >= 6) riskScore += 30;
    else if (sessionBets >= 4) riskScore += 15;
    else if (sessionBets >= 3) riskScore += 8;

    // Sudden stake increase
    if (stakeIncrease >= 50) riskScore += 25;
    else if (stakeIncrease >= 25) riskScore += 12;

    // Long session
    if (durationMinutes >= 60) riskScore += 15;
    else if (durationMinutes >= 30) riskScore += 8;

    let level;
    if (riskScore >= 60) level = "high";
    else if (riskScore >= 30) level = "elevated";
    else level = "normal";

    // Session activity label
    let sessionActivity;
    if (sessionBets >= 5 || durationMinutes >= 45) sessionActivity = "High";
    else if (sessionBets >= 3 || durationMinutes >= 20) sessionActivity = "Medium";
    else sessionActivity = "Low";

    return {
        level,
        sessionActivity,
        sessionBets,
        lossStreak,
        sessionDurationMinutes: durationMinutes,
        stakeIncreasePct: Math.round(stakeIncrease),
        riskScore,
    };
}



export function buildScenarioFlags(user, event, markets, riskSignal = null) {
    if (!user || !event) {
        return [];
    }

    const minute = event.minute || 0;
    const homeScore = event.homeScore || 0;
    const awayScore = event.awayScore || 0;
    const totalGoals = homeScore + awayScore;
    const totalShots = (event.stats?.shots?.home || 0) + (event.stats?.shots?.away || 0);
    const totalShotsOnTarget =
        (event.stats?.shotsOnTarget?.home || 0) + (event.stats?.shotsOnTarget?.away || 0);
    const totalCorners = (event.stats?.corners?.home || 0) + (event.stats?.corners?.away || 0);

    const signal = riskSignal || computeRiskSignal(user);
    const marketCount = Object.keys(markets || {}).length;

    const flags = [
        {
            key: 'time_phase',
            label: minute >= 70 ? 'Fin de match' : minute >= 30 ? 'Milieu de match' : 'Début de match',
            severity: 'info',
        },
        {
            key: 'score_state',
            label: homeScore === awayScore ? 'Score serré' : 'Écart au score',
            severity: 'info',
        },
    ];

    if (totalShotsOnTarget >= 7 || totalShots >= 18) {
        flags.push({ key: 'high_pace', label: 'Rythme élevé', severity: 'hot' });
    }

    if (totalGoals >= 3) {
        flags.push({ key: 'goal_rich', label: 'Match riche en buts', severity: 'hot' });
    }

    if (totalCorners >= 8) {
        flags.push({ key: 'corner_pressure', label: 'Forte pression corners', severity: 'info' });
    }

    if (signal.level !== 'normal') {
        flags.push({ key: 'responsible_gaming', label: 'Mode jeu responsable', severity: 'safe' });
    }

    if (marketCount <= 3) {
        flags.push({ key: 'market_depth_low', label: 'Profondeur marché réduite', severity: 'warn' });
    } else {
        flags.push({ key: 'market_depth_ok', label: `Largeur offre: ${marketCount} marchés`, severity: 'info' });
    }

    return flags.slice(0, 6);
}

// Recommendation scoring logic based on user preferences and live match context
export function getPersonalizedRecommendations(user, event, markets, options = {}) {
    if (!user || !event || !markets) {
        return [];
    }

    const recommendationMode = options.mode || "adaptive";
    const requestedTopN = Number.isFinite(options.topN) ? options.topN : null;

    const MAX_SCORE = 140;
    const totalGoals = (event.homeScore || 0) + (event.awayScore || 0);
    const totalShots = (event.stats?.shots?.home || 0) + (event.stats?.shots?.away || 0);
    const totalShotsOnTarget =
        (event.stats?.shotsOnTarget?.home || 0) + (event.stats?.shotsOnTarget?.away || 0);
    const totalCorners = (event.stats?.corners?.home || 0) + (event.stats?.corners?.away || 0);
    const minute = event.minute || 0;

    const isGoalHeavy = totalGoals >= 2 || totalShotsOnTarget >= 6;
    const isHighPace = totalShots >= 16 || totalShotsOnTarget >= 7;

    const scoredMarkets = Object.values(markets).map((market) => {
        let score = 0;
        const reasons = [];
        const tags = new Set();

        // Rule 1: User preferred markets
        if (user.preferredMarkets?.includes(market.type)) {
            score += 28;
            reasons.push(`Ce type de pari correspond à vos habitudes (${market.name.toLowerCase()}).`);
            tags.add("Pour vous");
        }

        // Rule 2: Favorite team context
        const followsHome = user.favoriteTeams?.includes(event.homeTeam);
        const followsAway = user.favoriteTeams?.includes(event.awayTeam);
        if (followsHome || followsAway) {
            score += 18;
            const watchedTeam = followsHome ? event.homeTeam : event.awayTeam;
            reasons.push(`Vous suivez souvent ${watchedTeam}, ce type de pari est pertinent sur ce match.`);
        }

        // Rule 3: Live context by market type
        if (market.type.startsWith("over_under_") || market.type === "both_teams_score") {
            if (isGoalHeavy) {
                score += 18;
                reasons.push("Le rythme offensif est élevé sur ce match en direct.");
                tags.add("Match chaud");
            }
        }

        if (market.type === "next_goal") {
            if (isHighPace) {
                score += 20;
                reasons.push("Beaucoup d'occasions en cours, marché live très actif.");
                tags.add("Live");
            }
        }

        if (market.type === "corners" && totalCorners >= 6) {
            score += 14;
            reasons.push("Le volume de corners est déjà élevé.");
        }

        if (market.type === "cards" && minute >= 60) {
            score += 10;
            reasons.push("La fin de match augmente souvent l'intensité des duels.");
        }

        // Rule 4: Profile adaptation
        if (user.profile === "goalsadvocate") {
            if (market.category === "goals") {
                score += 14;
                tags.add("Profil buts");
            }
        }

        if (user.profile === "enthusiast") {
            if (["next_goal", "correct_score", "halftime_fulltime"].includes(market.type)) {
                score += 14;
                tags.add("Dynamique");
            }
        }

        if (user.profile === "conservative") {
            if (["match_winner", "double_chance", "both_teams_score"].includes(market.type)) {
                score += 12;
                tags.add("Safe");
            }
        }

        // Rule 5: Odds quality (balanced price zone)
        const avgOdds =
            market.options.reduce((sum, opt) => sum + opt.odds, 0) / Math.max(1, market.options.length);
        if (avgOdds >= 1.65 && avgOdds <= 2.35) {
            score += 12;
            tags.add("Value");
        }

        // Rule 6: late-game urgency
        if (minute >= 70 && ["next_goal", "match_winner", "both_teams_score"].includes(market.type)) {
            score += 10;
            reasons.push("Marché cohérent avec la phase finale du match.");
            tags.add("Fin de match");
        }

        const selectedOption = pickBestOption(market, event);

        return { ...market, score, reasons, tags: Array.from(tags), selectedOption };
    });

    // ── Responsible Gaming: compute risk signal and adapt output ──────
    const riskSignal = computeRiskSignal(user);

    // Safe market types to promote under high / elevated risk
    const SAFE_MARKET_TYPES = new Set(["match_winner", "double_chance", "both_teams_score"]);

    let sorted = scoredMarkets
        .filter((m) => m.score > 0)
        .sort((a, b) => b.score - a.score);

    let topCount = 4; // default

    if (recommendationMode === "strict") {
        sorted = sorted.filter((m) => SAFE_MARKET_TYPES.has(m.type));
        topCount = Math.min(topCount, 2);
    } else if (recommendationMode === "balanced") {
        const safe = sorted.filter((m) => SAFE_MARKET_TYPES.has(m.type));
        const rest = sorted.filter((m) => !SAFE_MARKET_TYPES.has(m.type));
        sorted = [...safe, ...rest];
        topCount = Math.min(topCount, 3);
    } else if (recommendationMode === "adaptive") {
        if (riskSignal.level === "high") {
            // Only safe, low-complexity markets — cap at 2
            sorted = sorted.filter((m) => SAFE_MARKET_TYPES.has(m.type));
            topCount = 2;
        } else if (riskSignal.level === "elevated") {
            // Soft cap at 3 + prioritise safe markets
            topCount = 3;
            const safe = sorted.filter((m) => SAFE_MARKET_TYPES.has(m.type));
            const rest = sorted.filter((m) => !SAFE_MARKET_TYPES.has(m.type));
            sorted = [...safe, ...rest];
        }
    }

    if (Number.isFinite(requestedTopN)) {
        topCount = Math.min(6, Math.max(1, Math.trunc(requestedTopN)));
    }

    const topRecommendations = sorted.slice(0, topCount);

    // Build explainability factors per recommendation
    function buildExplainabilityFactors(rec, signal) {
        const factors = [];
        if (user.preferredMarkets?.includes(rec.type)) {
            factors.push("Basé sur vos marchés favoris");
        }
        if (rec.tags.includes("Match chaud") || rec.tags.includes("Live") || rec.tags.includes("Fin de match")) {
            factors.push("Contexte live du match");
        }
        if (signal.level !== "normal") {
            factors.push("Ajustement jeu responsable");
        }
        if (factors.length === 0) {
            factors.push("Pertinent selon votre profil");
        }
        return factors;
    }

    return topRecommendations.map((rec) => {
        // Inject a responsible gaming tag & reason when risk is high/elevated
        const adjustedTags = [...rec.tags];
        const adjustedReasons = [...rec.reasons];
        if (riskSignal.level === "high") {
            if (!adjustedTags.includes("Jeu responsable")) adjustedTags.push("Jeu responsable");
            adjustedReasons.unshift("Sélection adaptée à votre session — pari simple recommandé.");
        } else if (riskSignal.level === "elevated") {
            if (!adjustedTags.includes("Jeu responsable")) adjustedTags.push("Jeu responsable");
            adjustedReasons.unshift("Pari conseillé compte tenu de votre activité récente.");
        }

        return {
            marketId: rec.marketId,
            type: rec.type,
            name: rec.name,
            options: rec.options,
            selectedOption: rec.selectedOption,
            reasons: adjustedReasons,
            tags: adjustedTags,
            score: Math.min(rec.score, MAX_SCORE),
            normalizedScore: Math.round((Math.min(rec.score, MAX_SCORE) / MAX_SCORE) * 100),
            explainability: buildExplainabilityFactors(rec, riskSignal),
        };
    });
}

function pickBestOption(market, event) {
    const options = market.options || [];
    if (options.length === 0) return null;

    const homeIsLeading = (event.homeScore || 0) > (event.awayScore || 0);
    const awayIsLeading = (event.awayScore || 0) > (event.homeScore || 0);
    const totalGoals = (event.homeScore || 0) + (event.awayScore || 0);
    const totalShots = (event.stats?.shots?.home || 0) + (event.stats?.shots?.away || 0);

    if (market.type === "match_winner") {
        if (homeIsLeading) {
            return (
                options.find((o) => (o.fullLabel || o.label || "").includes(event.homeTeam)) || options[0]
            );
        }
        if (awayIsLeading) {
            return (
                options.find((o) => (o.fullLabel || o.label || "").includes(event.awayTeam)) || options[0]
            );
        }
    }

    if (market.type.startsWith("over_under_")) {
        const overOption = options.find((o) => o.label?.toLowerCase().includes("plus"));
        const underOption = options.find((o) => o.label?.toLowerCase().includes("moins"));
        return totalGoals >= 2 || totalShots >= 16 ? overOption || options[0] : underOption || options[0];
    }

    if (market.type === "both_teams_score") {
        const yes = options.find((o) => o.label?.toLowerCase() === "oui");
        const no = options.find((o) => o.label?.toLowerCase() === "non");
        const bothScored = event.homeScore > 0 && event.awayScore > 0;
        return bothScored || totalShots >= 16 ? yes || options[0] : no || options[0];
    }

    if (market.type === "next_goal") {
        const homeShots = event.stats?.shotsOnTarget?.home || 0;
        const awayShots = event.stats?.shotsOnTarget?.away || 0;
        if (homeShots >= awayShots) {
            return options.find((o) => (o.label || "").includes(event.homeTeam)) || options[0];
        }
        return options.find((o) => (o.label || "").includes(event.awayTeam)) || options[0];
    }

    // Default: pick the option with best balance (closest to 2.00)
    return options.reduce((best, current) =>
        Math.abs(current.odds - 2) < Math.abs(best.odds - 2) ? current : best
    );
}

// Generate a natural language explanation for a recommendation
export function generateExplanation(reasons) {
    if (!reasons || reasons.length === 0) {
        return "Sélection basée sur votre profil et le contexte live.";
    }

    if (reasons.length === 1) {
        return reasons[0];
    }

    return reasons.slice(0, 2).join(" ");
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
