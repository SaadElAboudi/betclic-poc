import { formatOdds } from '../lib/api';

export function RecommendationPanel({ recommendations, loading, onAddToBet }) {
    if (loading) {
        return (
            <div className="bg-white border border-betclic-grayBorder rounded-md p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-betclic-red rounded-md flex items-center justify-center text-white">⭐</div>
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-[0.12em]">Recommandé pour vous</h2>
                </div>
                <div className="text-betclic-grayText text-sm">Chargement...</div>
            </div>
        );
    }

    if (!recommendations || recommendations.length === 0) {
        return (
            <div className="bg-white border border-betclic-grayBorder rounded-md p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-betclic-red rounded-md flex items-center justify-center text-white">⭐</div>
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-[0.12em]">Recommandé pour vous</h2>
                </div>
                <div className="text-betclic-grayText text-sm">Aucune recommandation disponible.</div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-betclic-grayBorder rounded-md p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-betclic-red rounded-md flex items-center justify-center text-white">⭐</div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-[0.12em]">Recommandé pour vous</h2>
            </div>

            <div className="space-y-3">
                {recommendations.map((rec) => (
                    <div
                        key={rec.marketId}
                        className="bg-white border border-betclic-grayBorder rounded-lg p-3 shadow-sm hover:shadow-md transition"
                    >
                        {rec.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                                {rec.tags.slice(0, 3).map((tag) => (
                                    <span
                                        key={`${rec.marketId}-${tag}`}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-betclic-grayBorder text-betclic-grayText font-semibold"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                                <div className="text-gray-900 font-semibold text-sm mb-0.5">{rec.name}</div>
                                <div className="text-betclic-grayText text-xs">
                                    {rec.selectedOption?.fullLabel || rec.selectedOption?.label || rec.options[0]?.label}
                                </div>
                            </div>
                            <div className="bg-betclic-yellow text-gray-900 border border-betclic-yellow px-3 py-1.5 rounded-md font-extrabold ml-3">
                                {formatOdds(rec.selectedOption?.odds || rec.options[0]?.odds)}
                            </div>
                        </div>

                        {/* Recommendation reason */}
                        <div className="bg-white rounded-md p-2 mb-2 border border-betclic-grayBorder">
                            <div className="flex items-start gap-2">
                                <span className="text-betclic-red text-xs">💡</span>
                                <div className="text-betclic-grayText text-xs leading-relaxed">{rec.explanation}</div>
                            </div>
                        </div>

                        {/* Confidence bar */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 h-1.5 bg-betclic-grayLight rounded-full overflow-hidden">
                                <div className="h-full bg-betclic-red" style={{ width: `${Math.min(rec.normalizedScore || 50, 100)}%` }}></div>
                            </div>
                            <span className="text-betclic-red text-xs font-bold">{Math.min(rec.normalizedScore || 50, 100)}%</span>
                        </div>

                        <button
                            onClick={() => onAddToBet?.({
                                id: rec.selectedOption?.id || `${rec.marketId}-suggestion`,
                                market: rec.name,
                                selection: rec.selectedOption?.fullLabel || rec.selectedOption?.label || rec.options[0]?.label,
                                odds: rec.selectedOption?.odds || rec.options[0]?.odds,
                            })}
                            className="w-full bg-betclic-yellow hover:bg-betclic-yellowHover border border-betclic-yellow hover:border-betclic-yellowHover text-gray-900 font-bold py-2 rounded-md text-sm transition tracking-wide uppercase"
                        >
                            Ajouter au pari
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
