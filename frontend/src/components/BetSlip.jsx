import { useMemo, useState } from 'react';
import { formatOdds } from '../lib/api';

const RESPONSIBLE_LIMITS = {
    normal: { maxStake: 200, cautionStake: 80 },
    elevated: { maxStake: 75, cautionStake: 40 },
    high: { maxStake: 30, cautionStake: 20 },
};

function getRiskLimits(level) {
    return RESPONSIBLE_LIMITS[level] || RESPONSIBLE_LIMITS.normal;
}

export function BetSlip({ bets, onRemove, onClear, user, riskSignal }) {
    const [stake, setStake] = useState('10');

    const numericStake = parseFloat(stake) || 0;
    const totalOdds = bets.reduce((acc, bet) => acc * bet.odds, 1);
    const potentialWin = numericStake * totalOdds;

    const riskLevel = riskSignal?.level || 'normal';
    const limits = useMemo(() => getRiskLimits(riskLevel), [riskLevel]);
    const safeStake = Math.max(0, Math.min(numericStake, limits.maxStake));
    const payoutWithCap = safeStake * totalOdds;
    const stakeWasCapped = numericStake > limits.maxStake;
    const showCaution = numericStake >= limits.cautionStake;

    if (bets.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-betclic-red shadow-2xl z-50 animate-slide-up">
            <div className="max-w-7xl mx-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                            Mon pari ({bets.length})
                        </span>
                        {bets.length > 0 && (
                            <span className="bg-betclic-yellow text-gray-900 text-xs font-bold px-2 py-0.5 rounded">
                                Combiné
                            </span>
                        )}
                        {riskLevel !== 'normal' && (
                            <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-300 uppercase tracking-wide">
                                Mode prudent
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClear}
                        className="text-xs text-betclic-red font-semibold hover:underline"
                    >
                        Tout supprimer
                    </button>
                </div>

                {/* Bets List */}
                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                    {bets.map((bet) => (
                        <div
                            key={bet.id}
                            className="flex items-center justify-between bg-gray-50 rounded p-2 text-xs"
                        >
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900">{bet.market}</div>
                                <div className="text-betclic-grayText">{bet.selection}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{formatOdds(bet.odds)}</span>
                                <button
                                    onClick={() => onRemove(bet.id)}
                                    className="text-betclic-grayText hover:text-betclic-red"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stake Input */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="text-xs text-betclic-grayText mb-1 block">Mise</label>
                        <input
                            type="number"
                            value={stake}
                            max={limits.maxStake}
                            onChange={(e) => setStake(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold focus:outline-none focus:border-betclic-red"
                            placeholder="0.00"
                        />
                        <div className="text-[10px] text-betclic-grayText mt-1">
                            Limite session: {limits.maxStake} €
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-betclic-grayText mb-1 block">Gain potentiel</label>
                        <div className="border border-gray-300 rounded px-3 py-2 text-sm font-bold bg-gray-50">
                            {(stakeWasCapped ? payoutWithCap : potentialWin).toFixed(2)} €
                        </div>
                    </div>
                </div>

                {(stakeWasCapped || showCaution) && (
                    <div className={`mb-3 text-xs rounded p-2 border ${stakeWasCapped ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-800 border-yellow-200'}`}>
                        {stakeWasCapped
                            ? `Pour ce profil de session, la mise a été plafonnée à ${limits.maxStake} €.`
                            : `Pensez à rester dans une zone de confort (${limits.cautionStake} € recommandé max pour cette session).`}
                    </div>
                )}

                {user && (
                    <div className="mb-3 text-[11px] text-betclic-grayText bg-gray-50 border border-betclic-grayBorder rounded p-2">
                        Profil: <span className="font-semibold text-gray-900">{user.name}</span> • Mise moyenne {user.avgStake} €
                    </div>
                )}

                {/* Total Odds */}
                <div className="flex items-center justify-between mb-3 text-sm">
                    <span className="text-betclic-grayText">Cote totale</span>
                    <span className="font-bold text-lg text-gray-900">{formatOdds(totalOdds)}</span>
                </div>

                {/* Place Bet Button */}
                <button
                    disabled={numericStake <= 0}
                    className="w-full bg-betclic-yellow hover:bg-betclic-yellowHover disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-bold py-3 rounded transition text-sm uppercase tracking-wide"
                >
                    Placer le pari
                </button>
            </div>
        </div>
    );
}
