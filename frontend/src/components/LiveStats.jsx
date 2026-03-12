export function LiveStats({ event }) {
    if (!event || !event.stats) return null;

    const stats = event.stats;

    return (
        <div className="bg-[#1A1F28] border border-white/10 rounded-md p-4 shadow-sm">
            <h3 className="text-[11px] font-bold text-white/90 mb-3 uppercase tracking-[0.14em]">Statistiques live</h3>

            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-xs text-white/65 mb-1.5">
                        <span className="font-bold text-white">{stats.possession.home}%</span>
                        <span className="uppercase">Possession</span>
                        <span className="font-bold text-white">{stats.possession.away}%</span>
                    </div>
                    <div className="h-2 bg-[#2A313F] rounded-full overflow-hidden flex">
                        <div className="bg-betclic-red" style={{ width: `${Math.min(Math.max(stats.possession.home, 0), 100)}%` }}></div>
                        <div className="bg-white/30" style={{ width: `${Math.min(Math.max(stats.possession.away, 0), 100)}%` }}></div>
                    </div>
                </div>

                {[
                    ['Tirs', stats.shots.home, stats.shots.away],
                    ['Tirs cadrés', stats.shotsOnTarget.home, stats.shotsOnTarget.away],
                    ['Corners', stats.corners.home, stats.corners.away],
                    ['Fautes', stats.fouls.home, stats.fouls.away],
                ].map(([label, home, away]) => (
                    <div key={label} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                        <span className="text-white font-bold">{home}</span>
                        <span className="text-white/60 text-xs uppercase">{label}</span>
                        <span className="text-white font-bold">{away}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
