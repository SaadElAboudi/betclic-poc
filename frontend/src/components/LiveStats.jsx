export function LiveStats({ event }) {
    if (!event || !event.stats) return null;

    const stats = event.stats;

    return (
        <div className="bg-white border border-betclic-grayBorder rounded-md p-4 shadow-sm">
            <h3 className="text-[11px] font-bold text-gray-900 mb-3 uppercase tracking-[0.14em]">Statistiques</h3>

            <div className="space-y-3">
                {/* Possession */}
                <div>
                    <div className="flex justify-between text-xs text-betclic-grayText mb-1.5">
                        <span className="font-bold">{stats.possession.home}%</span>
                        <span className="uppercase">Possession</span>
                        <span className="font-bold">{stats.possession.away}%</span>
                    </div>
                    <div className="h-2 bg-betclic-grayLight rounded-full overflow-hidden flex">
                        <div className="bg-betclic-red" style={{ width: `${Math.min(Math.max(stats.possession.home, 0), 100)}%` }}></div>
                        <div className="bg-gray-400" style={{ width: `${Math.min(Math.max(stats.possession.away, 0), 100)}%` }}></div>
                    </div>
                </div>

                {/* Shots */}
                <div className="flex justify-between items-center py-1">
                    <span className="text-gray-900 font-bold">{stats.shots.home}</span>
                    <span className="text-betclic-grayText text-xs uppercase">Tirs</span>
                    <span className="text-gray-900 font-bold">{stats.shots.away}</span>
                </div>

                {/* Shots on Target */}
                <div className="flex justify-between items-center py-1">
                    <span className="text-gray-900 font-bold">{stats.shotsOnTarget.home}</span>
                    <span className="text-betclic-grayText text-xs uppercase">Tirs cadrés</span>
                    <span className="text-gray-900 font-bold">{stats.shotsOnTarget.away}</span>
                </div>

                {/* Corners */}
                <div className="flex justify-between items-center py-1">
                    <span className="text-gray-900 font-bold">{stats.corners.home}</span>
                    <span className="text-betclic-grayText text-xs uppercase">Corners</span>
                    <span className="text-gray-900 font-bold">{stats.corners.away}</span>
                </div>

                {/* Fouls */}
                <div className="flex justify-between items-center py-1">
                    <span className="text-gray-900 font-bold">{stats.fouls.home}</span>
                    <span className="text-betclic-grayText text-xs uppercase">Fautes</span>
                    <span className="text-gray-900 font-bold">{stats.fouls.away}</span>
                </div>
            </div>
        </div>
    );
}
