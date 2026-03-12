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

function combinations(items, k) {
    const result = [];
    const helper = (start, path) => {
        if (path.length === k) {
            result.push(path);
            return;
        }
        for (let i = start; i < items.length; i += 1) {
            helper(i + 1, [...path, items[i]]);
        }
    };
    helper(0, []);
    return result;
}

export function BetSlip({ bets, onRemove, onClear, user, riskSignal, markets = {}, onPlaceBet }) {
    const [stake, setStake] = useState('10');
    const [betType, setBetType] = useState('combine');
    const [cashoutHistory, setCashoutHistory] = useState([]);

    const numericStake = parseFloat(stake) || 0;
    const riskLevel = riskSignal?.level || 'normal';
    const limits = useMemo(() => getRiskLimits(riskLevel), [riskLevel]);
    const safeStake = Math.max(0, Math.min(numericStake, limits.maxStake));
    const stakeWasCapped = numericStake > limits.maxStake;
    const showCaution = numericStake >= limits.cautionStake;

    const currentOddsMap = useMemo(() => {
        const map = {};
        Object.values(markets || {}).forEach((market) => {
            (market.options || []).forEach((option) => {
                map[option.id] = option.odds;
            });
        });
        return map;
    }, [markets]);

    const betsWithValidation = bets.map((bet) => {
        const liveOdds = currentOddsMap[bet.id];
        const hasLive = typeof liveOdds === 'number';
        const drift = hasLive ? liveOdds - bet.odds : 0;
        return {
            ...bet,
            liveOdds: hasLive ? liveOdds : bet.odds,
            oddsDrift: drift,
            driftType: drift > 0.001 ? 'up' : drift < -0.001 ? 'down' : 'stable',
        };
    });

    const simplePotential = betsWithValidation.reduce((acc, bet) => acc + safeStake * bet.liveOdds, 0);
    const combinedOdds = betsWithValidation.reduce((acc, bet) => acc * bet.liveOdds, 1);
    const combinePotential = safeStake * combinedOdds;

    const systemCombos = betsWithValidation.length >= 2 ? combinations(betsWithValidation, 2) : [];
    const systemPotential = systemCombos.reduce((acc, combo) => {
        const comboOdds = combo.reduce((o, b) => o * b.liveOdds, 1);
        return acc + safeStake * comboOdds;
    }, 0);

    const potentialByType = {
        simple: simplePotential,
        combine: combinePotential,
        system: systemPotential,
    };

    const selectedPotential = potentialByType[betType] || 0;
    const totalOddsDisplay = betType === 'simple'
        ? (betsWithValidation.reduce((acc, b) => acc + b.liveOdds, 0) / Math.max(1, betsWithValidation.length))
        : betType === 'system'
            ? (systemCombos.length > 0
                ? systemCombos.reduce((acc, combo) => acc + combo.reduce((o, b) => o * b.liveOdds, 1), 0) / systemCombos.length
                : 1)
            : combinedOdds;

    if (bets.length === 0) return null;

    const handleCashout = (type) => {
        const factor = type === 'total' ? 0.72 : 0.4;
        const amount = selectedPotential * factor;
        const entry = {
            id: Date.now(),
            type,
            amount,
            timestamp: new Date().toLocaleTimeString('fr-FR'),
        };
        setCashoutHistory((prev) => [entry, ...prev].slice(0, 4));
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#151A21] border-t-2 border-betclic-red shadow-2xl z-50 animate-slide-up">
            <div className="max-w-7xl mx-auto p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">Mon pari ({bets.length})</span>
                        <select
                            value={betType}
                            onChange={(e) => setBetType(e.target.value)}
                            className="bg-[#232A36] border border-white/15 rounded text-xs px-2 py-1"
                        >
                            <option value="simple">Simple</option>
                            <option value="combine">Combiné</option>
                            <option value="system" disabled={bets.length < 2}>Système (2/2)</option>
                        </select>
                        {riskLevel !== 'normal' && (
                            <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-300 uppercase tracking-wide">Mode prudent</span>
                        )}
                    </div>
                    <button onClick={onClear} className="text-xs text-betclic-red font-semibold hover:underline">Tout supprimer</button>
                </div>

                <div className="space-y-2 mb-3 max-h-36 overflow-y-auto">
                    {betsWithValidation.map((bet) => (
                        <div key={bet.id} className="flex items-center justify-between bg-[#232A36] rounded p-2 text-xs border border-white/10">
                            <div className="flex-1">
                                <div className="font-semibold text-white">{bet.market}</div>
                                <div className="text-white/65">{bet.selection}</div>
                                <div className="text-[10px] mt-1">
                                    {bet.driftType === 'up' && <span className="text-green-300">Cote en hausse: {formatOdds(bet.odds)} → {formatOdds(bet.liveOdds)}</span>}
                                    {bet.driftType === 'down' && <span className="text-red-300">Cote en baisse: {formatOdds(bet.odds)} → {formatOdds(bet.liveOdds)}</span>}
                                    {bet.driftType === 'stable' && <span className="text-white/50">Cote stable: {formatOdds(bet.liveOdds)}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-betclic-yellow">{formatOdds(bet.liveOdds)}</span>
                                <button onClick={() => onRemove(bet.id)} className="text-white/60 hover:text-betclic-red">✕</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="text-xs text-white/60 mb-1 block">Mise unitaire</label>
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
                            {selectedPotential.toFixed(2)} €
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

                <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                        disabled={numericStake <= 0}
                        onClick={() => handleCashout('partial')}
                        className="bg-[#232A36] border border-white/20 hover:border-betclic-yellow rounded py-2 text-xs font-semibold"
                    >
                        Cashout partiel
                    </button>
                    <button
                        disabled={numericStake <= 0}
                        onClick={() => handleCashout('total')}
                        className="bg-[#232A36] border border-white/20 hover:border-betclic-yellow rounded py-2 text-xs font-semibold"
                    >
                        Cashout total
                    </button>
                </div>

                {cashoutHistory.length > 0 && (
                    <div className="mb-3 bg-[#232A36] border border-white/10 rounded p-2">
                        <div className="text-[10px] text-white/60 uppercase mb-1">Historique cashout instantané</div>
                        <div className="space-y-1">
                            {cashoutHistory.map((entry) => (
                                <div key={entry.id} className="text-[11px] text-white/80 flex justify-between">
                                    <span>{entry.type === 'total' ? 'Total' : 'Partiel'} • {entry.timestamp}</span>
                                    <span className="text-betclic-yellow font-semibold">{entry.amount.toFixed(2)} €</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {user && (
                    <div className="mb-3 text-[11px] text-white/70 bg-[#232A36] border border-white/10 rounded p-2">
                        Profil: <span className="font-semibold text-white">{user.name}</span> • Mise moyenne {user.avgStake} €
                    </div>
                )}

                <div className="flex items-center justify-between mb-3 text-sm">
                    <span className="text-white/65">Cote de référence ({betType})</span>
                    <span className="font-bold text-lg text-betclic-yellow">{formatOdds(totalOddsDisplay)}</span>
                </div>

                <button
                    disabled={numericStake <= 0}
                    onClick={() => onPlaceBet?.({
                        selections: betsWithValidation,
                        stake: safeStake,
                        betType,
                        potentialWin: selectedPotential,
                    })}
                    className="w-full bg-betclic-yellow hover:bg-betclic-yellowHover disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-bold py-3 rounded transition text-sm uppercase tracking-wide"
                >
                    Placer le pari
                </button>
            </div>
        </div>
    );
}
