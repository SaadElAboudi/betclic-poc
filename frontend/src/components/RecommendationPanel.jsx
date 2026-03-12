import { formatOdds } from '../lib/api';

const TAG_STYLE = {
    'Jeu responsable': 'bg-green-100 text-green-700 border-green-200',
};

const SCENARIO_STYLE = {
    hot: 'bg-red-900/35 text-red-100 border-red-400/40',
    safe: 'bg-green-900/35 text-green-100 border-green-400/40',
    warn: 'bg-yellow-900/30 text-yellow-100 border-yellow-400/40',
    info: 'bg-white/5 text-white/80 border-white/15',
};

function ExplainabilityBlock({ factors, isRiskAdapted }) {
    if (!factors || factors.length === 0) return null;
    return (
        <details className="mb-2 group">
            <summary className="cursor-pointer text-[10px] text-white/60 font-semibold uppercase tracking-wide list-none flex items-center gap-1 select-none">
                <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                Pourquoi cette recommandation ?
            </summary>
            <ul className="mt-1.5 space-y-0.5 pl-1">
                {factors.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-white/75">
                        <span className="text-betclic-red mt-0.5">✔</span>
                        <span>{f}</span>
                    </li>
                ))}
            </ul>
            {isRiskAdapted && (
                <p className="mt-1.5 text-[10px] text-green-700 bg-green-50 rounded px-2 py-1">
                    🛡️ Sélection adaptée à votre profil de session.
                </p>
            )}
        </details>
    );
}



function ScenarioCoverage({ scenarioFlags }) {
    if (!scenarioFlags || scenarioFlags.length === 0) return null;

    return (
        <div className="mb-4 rounded-md border border-white/10 bg-[#232A36] p-3">
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/60 font-semibold mb-2">
                Cas couverts par le moteur
            </div>
            <div className="flex flex-wrap gap-1.5">
                {scenarioFlags.map((flag) => (
                    <span
                        key={flag.key}
                        className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${SCENARIO_STYLE[flag.severity] || SCENARIO_STYLE.info}`}
                    >
                        {flag.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

export function RecommendationPanel({ recommendations, loading, onAddToBet, scenarioFlags, onFeedback }) {
    if (loading) {
        return <div className="bg-[#1A1F28] border border-white/10 rounded-md p-4 shadow-sm text-white/70">Chargement...</div>;
    }

    if (!recommendations || recommendations.length === 0) {
        return <div className="bg-[#1A1F28] border border-white/10 rounded-md p-4 shadow-sm text-white/70">Aucune recommandation disponible.</div>;
    }

    return (
        <div className="bg-[#1A1F28] border border-white/10 rounded-md p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-betclic-red rounded-md flex items-center justify-center text-white">⭐</div>
                <h2 className="text-sm font-bold text-white uppercase tracking-[0.12em]">Recommandé pour vous</h2>
            </div>

            <ScenarioCoverage scenarioFlags={scenarioFlags} />

            <div className="space-y-3">
                {recommendations.map((rec) => {
                    const isRiskAdapted = rec.tags?.includes('Jeu responsable');
                    return (
                        <div key={rec.marketId} className={`bg-[#232A36] border rounded-lg p-3 shadow-sm ${isRiskAdapted ? 'border-green-300' : 'border-white/10'}`}>
                            {rec.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {rec.tags.slice(0, 4).map((tag) => (
                                        <span
                                            key={`${rec.marketId}-${tag}`}
                                            className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${TAG_STYLE[tag] || 'bg-transparent border-white/10 text-white/70'}`}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <div className="text-white font-semibold text-sm mb-0.5">{rec.name}</div>
                                    <div className="text-white/65 text-xs">
                                        {rec.selectedOption?.fullLabel || rec.selectedOption?.label || rec.options[0]?.label}
                                    </div>
                                </div>
                                <div className="bg-betclic-yellow text-gray-900 border border-betclic-yellow px-3 py-1.5 rounded-md font-extrabold ml-3">
                                    {formatOdds(rec.selectedOption?.odds || rec.options[0]?.odds)}
                                </div>
                            </div>

                            <div className="bg-[#1A1F28] rounded-md p-2 mb-2 border border-white/10 text-white/70 text-xs leading-relaxed">
                                💡 {rec.explanation}
                            </div>

                            <ExplainabilityBlock factors={rec.explainability} isRiskAdapted={isRiskAdapted} />

                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-betclic-red" style={{ width: `${Math.min(rec.normalizedScore || 50, 100)}%` }}></div>
                                </div>
                                <span className="text-betclic-yellow text-xs font-bold">{Math.min(rec.normalizedScore || 50, 100)}%</span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => onAddToBet?.({
                                        id: rec.selectedOption?.id || `${rec.marketId}-suggestion`,
                                        marketId: rec.marketId,
                                        marketType: rec.type,
                                        market: rec.name,
                                        selection: rec.selectedOption?.fullLabel || rec.selectedOption?.label || rec.options[0]?.label,
                                        odds: rec.selectedOption?.odds || rec.options[0]?.odds,
                                    })}
                                    className="flex-1 bg-betclic-yellow hover:bg-betclic-yellowHover border border-betclic-yellow text-gray-900 font-bold py-2 rounded-md text-sm transition tracking-wide uppercase"
                                >
                                    Ajouter au pari
                                </button>
                                <button onClick={() => onFeedback?.(rec.marketId, 'up')} className="px-2 py-2 rounded-md border border-white/20 text-green-300">👍</button>
                                <button onClick={() => onFeedback?.(rec.marketId, 'down')} className="px-2 py-2 rounded-md border border-white/20 text-red-300">👎</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
