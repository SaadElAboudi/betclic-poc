import { formatOdds } from '../lib/api';

export function MarketGrid({ markets }) {
    if (!markets || Object.keys(markets).length === 0) {
        return <div className="text-betclic-grayText">Aucun marché disponible</div>;
    }

    const renderMarket = (market) => {
        const isThreeWay = market.options.length === 3;

        return (
            <div key={market.marketId} className="bg-white border border-betclic-grayBorder rounded-md p-2.5 shadow-sm hover:shadow-md transition">
                <div className="text-[10px] text-betclic-grayText mb-2 uppercase tracking-[0.12em] font-semibold">
                    {market.name}
                </div>
                <div className={`grid gap-1.5 ${isThreeWay ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {market.options.map((option, idx) => (
                        <button
                            key={option.id}
                            className="bg-betclic-yellow hover:bg-betclic-yellowHover border border-betclic-yellow hover:border-betclic-yellowHover rounded p-2 transition group font-bold"
                        >
                            <div className="text-[10px] text-gray-900 font-bold uppercase tracking-wider leading-tight">
                                {isThreeWay ? (idx === 0 ? '1' : idx === 1 ? 'X' : '2') : option.label}
                            </div>
                            <div className="text-lg leading-none font-black text-gray-900 group-hover:text-gray-800 transition">
                                {formatOdds(option.odds)}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-3">
            {Object.values(markets).map(renderMarket)}
        </div>
    );
}
