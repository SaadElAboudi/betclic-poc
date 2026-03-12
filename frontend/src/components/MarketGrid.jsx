import { useState } from 'react';
import { formatOdds } from '../lib/api';

export function MarketGrid({
    markets,
    event,
    onAddToBet,
    recommendedMarketIds = [],
    favoriteMarketTypes = [],
    onToggleFavoriteMarketType,
}) {
    const [activeTab, setActiveTab] = useState('popular');

    if (!markets || Object.keys(markets).length === 0) {
        return <div className="text-white/60">Aucun marché disponible</div>;
    }

    const groupedMarkets = Object.values(markets).reduce((acc, market) => {
        const category = market.category || 'other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(market);
        return acc;
    }, {});

    const categories = [
        { id: 'popular', label: 'Populaires', icon: '⭐' },
        { id: 'goals', label: 'Buts', icon: '⚽' },
        { id: 'results', label: 'Résultats', icon: '🏆' },
        { id: 'stats', label: 'Statistiques', icon: '📊' },
        { id: 'handicap', label: 'Handicap', icon: '⚖️' },
    ];

    const currentCategoryMarkets = sortMarketsByPertinence(
        groupedMarkets[activeTab] || [],
        event,
        recommendedMarketIds,
        favoriteMarketTypes
    );

    return (
        <div className="space-y-3">
            <div className="bg-[#1A1F28] border border-white/10 rounded-lg overflow-hidden sticky top-[70px] z-10 shadow-sm">
                <div className="flex overflow-x-auto scrollbar-hide">
                    {categories.map((category) => {
                        const count = (groupedMarkets[category.id] || []).length;
                        if (count === 0) return null;

                        return (
                            <button
                                key={category.id}
                                onClick={() => setActiveTab(category.id)}
                                className={`flex-1 min-w-[100px] px-3 py-3 text-xs font-bold uppercase tracking-wide transition border-b-2 whitespace-nowrap ${activeTab === category.id
                                    ? 'border-betclic-red text-white bg-[#232A36]'
                                    : 'border-transparent text-white/65 hover:bg-[#232A36]'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-1.5">
                                    <span>{category.icon}</span>
                                    <span>{category.label}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-3">
                {currentCategoryMarkets.map((market) => {
                    const isThreeWay = market.options.length === 3 && market.type === 'match_winner';
                    const isGrid = market.options.length > 3;
                    const isRecommended = recommendedMarketIds.includes(market.marketId);
                    const isFavorite = favoriteMarketTypes.includes(market.type);

                    return (
                        <div
                            key={market.marketId}
                            className={`bg-[#1A1F28] border rounded-lg p-3 shadow-sm ${isRecommended ? 'border-betclic-red/70' : 'border-white/10'}`}
                        >
                            <div className="flex items-center justify-between gap-2 mb-2.5">
                                <div className="text-[11px] text-white/70 uppercase tracking-wider font-bold">{market.name}</div>
                                <div className="flex items-center gap-1.5">
                                    {isRecommended && (
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-betclic-red text-white font-semibold">Pour vous</span>
                                    )}
                                    <button
                                        onClick={() => onToggleFavoriteMarketType?.(market.type)}
                                        className={`text-xs px-2 py-0.5 rounded border ${isFavorite ? 'border-betclic-yellow text-betclic-yellow' : 'border-white/20 text-white/60'}`}
                                    >
                                        ★
                                    </button>
                                </div>
                            </div>

                            <div className={`grid gap-2 ${isThreeWay ? 'grid-cols-3' : isGrid ? 'grid-cols-2' : 'grid-cols-2'}`}>
                                {market.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => onAddToBet({
                                            id: option.id,
                                            marketId: market.marketId,
                                            marketType: market.type,
                                            market: market.name,
                                            selection: option.fullLabel || option.label,
                                            odds: option.odds,
                                        })}
                                        className="bg-betclic-yellow hover:bg-betclic-yellowHover border border-betclic-yellow rounded-md p-2.5 transition active:scale-95"
                                    >
                                        <div className="text-[11px] text-gray-900 font-bold uppercase tracking-wide leading-tight mb-1">
                                            {option.label}
                                        </div>
                                        <div className="text-base leading-none font-black text-gray-900">
                                            {formatOdds(option.odds)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function sortMarketsByPertinence(markets, event, recommendedMarketIds, favoriteMarketTypes = []) {
    if (!Array.isArray(markets)) return [];

    const totalGoals = (event?.homeScore || 0) + (event?.awayScore || 0);
    const totalShots = (event?.stats?.shots?.home || 0) + (event?.stats?.shots?.away || 0);
    const minute = event?.minute || 0;

    const scoreMarket = (market) => {
        let score = 0;

        if (recommendedMarketIds.includes(market.marketId)) score += 100;
        if (favoriteMarketTypes.includes(market.type)) score += 40;
        if (market.category === 'popular') score += 30;
        if (market.type === 'next_goal' && (totalShots >= 14 || minute >= 60)) score += 20;
        if (market.type.startsWith('over_under_') && totalGoals >= 2) score += 18;
        if (market.type === 'both_teams_score' && totalGoals >= 2) score += 16;
        if (market.type === 'corners' && (event?.stats?.corners?.home || 0) + (event?.stats?.corners?.away || 0) >= 6) score += 14;

        return score;
    };

    return [...markets].sort((a, b) => scoreMarket(b) - scoreMarket(a));
}
