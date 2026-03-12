import React from 'react';

const LEVEL_CONFIG = {
    normal: {
        dot: 'bg-green-500',
        badge: 'bg-green-100 text-green-700',
        border: 'border-green-300/70',
        label: 'Normal',
        emoji: '🟢',
        tip: null,
    },
    elevated: {
        dot: 'bg-yellow-500',
        badge: 'bg-yellow-100 text-yellow-800',
        border: 'border-yellow-300/70',
        label: 'Élevé',
        emoji: '🟡',
        tip: 'Vous jouez depuis un moment. Prenez une pause si nécessaire.',
    },
    high: {
        dot: 'bg-red-500',
        badge: 'bg-red-100 text-betclic-red',
        border: 'border-red-300/70',
        label: 'Élevé ⚠️',
        emoji: '🔴',
        tip: 'Session intensive détectée. Nos recommandations ont été adaptées pour vous.',
    },
};

const ACTIVITY_CONFIG = {
    Low: { color: 'text-green-400', label: 'Faible' },
    Medium: { color: 'text-yellow-400', label: 'Modérée' },
    High: { color: 'text-red-400', label: 'Élevée' },
};

export default function RiskSignal({ riskSignal }) {
    if (!riskSignal) return null;

    const { level, sessionActivity, sessionBets, lossStreak, sessionDurationMinutes, stakeIncreasePct } = riskSignal;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.normal;
    const activityCfg = ACTIVITY_CONFIG[sessionActivity] || ACTIVITY_CONFIG.Low;

    return (
        <div className={`w-full rounded-xl border ${config.border} bg-[#1A1F28] shadow-sm overflow-hidden mb-4`}>
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#232A36] border-b border-white/10">
                <span className="flex items-center gap-2 text-xs font-semibold text-white/65 uppercase tracking-wide">
                    <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
                    Signal de session
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.badge}`}>{config.emoji} {config.label}</span>
            </div>

            <div className="grid grid-cols-4 divide-x divide-white/10 text-center py-3">
                <Stat label="Activité" value={activityCfg.label} valueClass={activityCfg.color + ' font-semibold'} />
                <Stat label="Paris joués" value={sessionBets} />
                <Stat label="Série perdante" value={lossStreak === 0 ? '—' : `×${lossStreak}`} valueClass={lossStreak >= 3 ? 'text-red-400 font-bold' : lossStreak >= 2 ? 'text-yellow-300 font-semibold' : 'text-white'} />
                <Stat label="Session" value={`${sessionDurationMinutes} min`} valueClass={sessionDurationMinutes >= 45 ? 'text-yellow-300 font-semibold' : 'text-white'} />
            </div>

            {stakeIncreasePct > 20 && (
                <div className="px-4 pb-2 text-xs text-yellow-200 bg-yellow-700/20 flex items-center gap-1.5">
                    <span>📈</span>
                    <span>Mise moyenne en hausse de <span className="font-bold">+{stakeIncreasePct}%</span> vs votre référence habituelle.</span>
                </div>
            )}

            {config.tip && (
                <div className={`px-4 py-2.5 text-xs ${level === 'high' ? 'bg-red-900/30 text-red-100' : 'bg-yellow-900/20 text-yellow-100'} flex items-start gap-2`}>
                    <span className="mt-0.5 shrink-0">{level === 'high' ? '⛔' : 'ℹ️'}</span>
                    <span>{config.tip}</span>
                </div>
            )}
        </div>
    );
}

function Stat({ label, value, valueClass = 'text-white font-semibold' }) {
    return (
        <div className="flex flex-col items-center gap-0.5 px-1">
            <span className={`text-sm ${valueClass}`}>{value}</span>
            <span className="text-[10px] text-white/45 leading-tight text-center">{label}</span>
        </div>
    );
}
