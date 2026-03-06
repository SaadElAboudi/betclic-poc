export function MatchHeader({ event }) {
    if (!event) {
        return <div className="text-betclic-grayText">Chargement...</div>;
    }

    return (
        <div className="bg-white border border-betclic-grayBorder rounded-md p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] text-betclic-grayText uppercase tracking-[0.14em] font-semibold">
                    {event.league}
                </div>
                {event.status === 'live' && (
                    <div className="flex items-center gap-2">
                        <span className="bg-betclic-red text-white px-2 py-0.5 rounded text-[11px] font-bold animate-pulse">
                            ● LIVE
                        </span>
                        <span className="text-betclic-red font-bold text-sm">{event.minute}'</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-betclic-grayLight rounded-full flex items-center justify-center text-lg">⚽</div>
                    <span className="text-gray-900 font-bold text-lg">{event.homeTeam}</span>
                </div>

                <div className="text-3xl font-bold text-gray-900 px-8 tabular-nums">
                    {event.homeScore} <span className="text-betclic-grayText">-</span> {event.awayScore}
                </div>

                <div className="flex items-center gap-3 flex-1 justify-end">
                    <span className="text-gray-900 font-bold text-lg">{event.awayTeam}</span>
                    <div className="w-10 h-10 bg-betclic-grayLight rounded-full flex items-center justify-center text-lg">⚽</div>
                </div>
            </div>
        </div>
    );
}
