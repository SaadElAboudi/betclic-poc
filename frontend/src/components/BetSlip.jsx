import { useState } from 'react';
import { formatOdds } from '../lib/api';

export function BetSlip({ bets, onRemove, onClear }) {
    const [stake, setStake] = useState('10');

    const totalOdds = bets.reduce((acc, bet) => acc * bet.odds, 1);
    const potentialWin = (parseFloat(stake) || 0) * totalOdds;

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
                            onChange={(e) => setStake(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-semibold focus:outline-none focus:border-betclic-red"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-betclic-grayText mb-1 block">Gain potentiel</label>
                        <div className="border border-gray-300 rounded px-3 py-2 text-sm font-bold bg-gray-50">
                            {potentialWin.toFixed(2)} €
                        </div>
                    </div>
                </div>

                {/* Total Odds */}
                <div className="flex items-center justify-between mb-3 text-sm">
                    <span className="text-betclic-grayText">Cote totale</span>
                    <span className="font-bold text-lg text-gray-900">{formatOdds(totalOdds)}</span>
                </div>

                {/* Place Bet Button */}
                <button className="w-full bg-betclic-yellow hover:bg-betclic-yellowHover text-gray-900 font-bold py-3 rounded transition text-sm uppercase tracking-wide">
                    Placer le pari
                </button>
            </div>
        </div>
    );
}
