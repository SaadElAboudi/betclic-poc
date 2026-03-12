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
        <div className="fixed bottom-0 left-0 right-0 bg-[#151A21] border-t-2 border-betclic-red shadow-2xl z-50 animate-slide-up">
            <div className="max-w-7xl mx-auto p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">Mon pari ({bets.length})</span>
                        <span className="bg-betclic-yellow text-gray-900 text-xs font-bold px-2 py-0.5 rounded">Combiné</span>
                        {riskLevel !== 'normal' && (
                            <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-300 uppercase tracking-wide">Mode prudent</span>
                        )}
                        {riskLevel !== 'normal' && (
                            <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-300 uppercase tracking-wide">
                                Mode prudent
                            </span>
                        )}
                    </div>
                    <button onClick={onClear} className="text-xs text-betclic-red font-semibold hover:underline">Tout supprimer</button>
                </div>

                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                    {bets.map((bet) => (
                        <div key={bet.id} className="flex items-center justify-between bg-[#232A36] rounded p-2 text-xs border border-white/10">
                            <div className="flex-1">
                                <div className="font-semibold text-white">{bet.market}</div>
                                <div className="text-white/65">{bet.selection}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-betclic-yellow">{formatOdds(bet.odds)}</span>
                                <button onClick={() => onRemove(bet.id)} className="text-white/60 hover:text-betclic-red">✕</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="text-xs text-white/60 mb-1 block">Mise</label>
                        <input
                            type="number"
                            value={stake}
                            max={limits.maxStake}
                            onChange={(e) => setStake(e.target.value)}
                            className="w-full border border-white/15 bg-[#232A36] text-white rounded px-3 py-2 text-sm font-semibold focus:outline-none focus:border-betclic-red"
                            placeholder="0.00"
                        />
                        <div className="text-[10px] text-white/50 mt-1">Limite session: {limits.maxStake} €</div>
                    </div>
                    <div>
                        <label className="text-xs text-white/60 mb-1 block">Gain potentiel</label>
                        <div className="border border-white/15 rounded px-3 py-2 text-sm font-bold bg-[#232A36] text-white">
                            {(stakeWasCapped ? payoutWithCap : potentialWin).toFixed(2)} €
                        </div>
                    </div>
                </div>

                {(stakeWasCapped || showCaution) && (
                    <div className={`mb-3 text-xs rounded p-2 border ${stakeWasCapped ? 'bg-red-900/30 text-red-100 border-red-500/30' : 'bg-yellow-900/20 text-yellow-100 border-yellow-500/30'}`}>
                        {stakeWasCapped
                            ? `Pour ce profil de session, la mise a été plafonnée à ${limits.maxStake} €.`
                            : `Pensez à rester dans une zone de confort (${limits.cautionStake} € recommandé max pour cette session).`}
                    </div>
                )}

                {user && (
                    <div className="mb-3 text-[11px] text-white/70 bg-[#232A36] border border-white/10 rounded p-2">
                        Profil: <span className="font-semibold text-white">{user.name}</span> • Mise moyenne {user.avgStake} €
                    </div>
                )}

                <div className="flex items-center justify-between mb-3 text-sm">
                    <span className="text-white/65">Cote totale</span>
                    <span className="font-bold text-lg text-betclic-yellow">{formatOdds(totalOdds)}</span>
                </div>

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
