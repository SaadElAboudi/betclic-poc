import { useState } from 'react';
import { formatOdds } from '../lib/api';

export function MarketGrid({ markets, onAddToBet }) {
    const [activeTab, setActiveTab] = useState('popular');
    const [expandedSections, setExpandedSections] = useState(new Set(['popular']));

    if (!markets || Object.keys(markets).length === 0) {
        return <div className="text-betclic-grayText">Aucun marché disponible</div>;
    }

    // Group markets by category
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
        { id: 'handicap', label: 'Handicap', icon: '⚖️' }
    ];

    const toggleSection = (category) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedSections(newExpanded);
    };

    const renderMarket = (market) => {
        const isThreeWay = market.options.length === 3 && market.type === 'match_winner';
        const isGrid = market.options.length > 3;

        return (
            <div key={market.marketId} className="bg-white border border-betclic-grayBorder rounded-lg p-3 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-2 mb-2.5">
                    {market.icon && <span className="text-base">{market.icon}</span>}
                    <div className="text-[11px] text-betclic-grayText uppercase tracking-wider font-bold">
                        {market.name}
                    </div>
                </div>
                <div className={`grid gap-2 ${isThreeWay ? 'grid-cols-3' :
                        isGrid ? 'grid-cols-2' :
                            'grid-cols-2'
                    }`}>
                    {market.options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => onAddToBet({
                                id: option.id,
                                market: market.name,
                                selection: option.fullLabel || option.label,
                                odds: option.odds
                            })}
                            className="bg-betclic-yellow hover:bg-betclic-yellowHover border border-betclic-yellow hover:border-betclic-yellowHover rounded-md p-2.5 transition group font-bold hover:scale-105 active:scale-95"
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
    };

    const renderCategorySection = (categoryId) => {
        const categoryMarkets = groupedMarkets[categoryId] || [];
        if (categoryMarkets.length === 0) return null;

        const isExpanded = expandedSections.has(categoryId);
        const category = categories.find(c => c.id === categoryId);

        return (
            <div key={categoryId} className="border-b border-betclic-grayBorder last:border-0">
                <button
                    onClick={() => toggleSection(categoryId)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{category?.icon}</span>
                        <span className="font-bold text-sm text-gray-900 uppercase tracking-wide">
                            {category?.label || categoryId}
                        </span>
                        <span className="text-xs text-betclic-grayText">
                            ({categoryMarkets.length})
                        </span>
                    </div>
                    <span className={`text-betclic-grayText transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </button>
                {isExpanded && (
                    <div className="p-4 pt-0 space-y-3">
                        {categoryMarkets.map(renderMarket)}
                    </div>
                )}
            </div>
        );
    };

    // For tab view (desktop)
    const currentCategoryMarkets = groupedMarkets[activeTab] || [];

    return (
        <div className="space-y-3">
            {/* Tabs Navigation */}
            <div className="bg-white border border-betclic-grayBorder rounded-lg overflow-hidden sticky top-0 z-10 shadow-sm">
                <div className="flex overflow-x-auto scrollbar-hide">
                    {categories.map((category) => {
                        const count = (groupedMarkets[category.id] || []).length;
                        if (count === 0) return null;

                        return (
                            <button
                                key={category.id}
                                onClick={() => {
                                    setActiveTab(category.id);
                                    setExpandedSections(new Set([category.id]));
                                }}
                                className={`flex-1 min-w-[100px] px-3 py-3 text-xs font-bold uppercase tracking-wide transition border-b-2 whitespace-nowrap ${activeTab === category.id
                                        ? 'border-betclic-red text-betclic-red bg-red-50'
                                        : 'border-transparent text-betclic-grayText hover:bg-gray-50'
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

            {/* Markets Grid */}
            <div className="space-y-3">
                {currentCategoryMarkets.map(renderMarket)}
            </div>
        </div>
    );
}
