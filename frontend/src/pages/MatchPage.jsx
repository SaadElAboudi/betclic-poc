import { useMemo, useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { useUser } from '../context/UserContext';
import { LiveStats } from '../components/LiveStats';
import { MarketGrid } from '../components/MarketGrid';
import { RecommendationPanel } from '../components/RecommendationPanel';
import { UserProfileSelector } from '../components/UserProfileSelector';
import { BetSlip } from '../components/BetSlip';
import RiskSignal from '../components/RiskSignal';

const NAV_ITEMS = [
    { id: 'home', label: 'Accueil' },
    { id: 'live', label: 'Live' },
    { id: 'sports', label: 'Sports' },
    { id: 'competitions', label: 'Compétitions' },
    { id: 'bets', label: 'Paris sportifs' },
];

const DEFAULT_FILTERS = { sport: 'all', league: 'all', team: '' };

function getInitialState(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

export function MatchPage() {
    const { selectedUserId, setUsers } = useUser();
    const [currentEvent, setCurrentEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [markets, setMarkets] = useState({});
    const [recommendations, setRecommendations] = useState([]);
    const [riskSignal, setRiskSignal] = useState(null);
    const [scenarioFlags, setScenarioFlags] = useState([]);
    const [users, setUsersState] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recLoading, setRecLoading] = useState(false);
    const [betSlip, setBetSlip] = useState([]);
    const [recommendationMode, setRecommendationMode] = useState('adaptive');
    const [recommendationVolume, setRecommendationVolume] = useState(4);
    const [nav, setNav] = useState('home');

    const [filters, setFilters] = useState(() => getInitialState('betclic_filters', DEFAULT_FILTERS));
    const [favoriteTeams, setFavoriteTeams] = useState(() => getInitialState('betclic_favorite_teams', []));
    const [favoriteMarketTypes, setFavoriteMarketTypes] = useState(() => getInitialState('betclic_favorite_market_types', []));

    const selectedUser = users.find((user) => user.userId === selectedUserId) || null;

    useEffect(() => { localStorage.setItem('betclic_filters', JSON.stringify(filters)); }, [filters]);
    useEffect(() => { localStorage.setItem('betclic_favorite_teams', JSON.stringify(favoriteTeams)); }, [favoriteTeams]);
    useEffect(() => { localStorage.setItem('betclic_favorite_market_types', JSON.stringify(favoriteMarketTypes)); }, [favoriteMarketTypes]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const usersData = await apiClient.get('/users');
                setUsersState(usersData);
                setUsers(usersData);

                const eventsData = await apiClient.get('/events');
                setEvents(eventsData);
                const liveEvent = eventsData.find((e) => e.status === 'live') || eventsData[0];
                setCurrentEvent(liveEvent);

                const marketsData = await apiClient.get(`/events/${liveEvent.eventId}/markets`);
                setMarkets(marketsData);
            } catch (err) {
                console.error('Failed to load data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [setUsers]);

    useEffect(() => {
        if (!currentEvent || !selectedUserId) return;

        const loadRecommendations = async () => {
            setRecLoading(true);
            try {
                const query = new URLSearchParams({
                    mode: recommendationMode,
                    topN: String(recommendationVolume),
                });
                const recsData = await apiClient.get(
                    `/users/${selectedUserId}/events/${currentEvent.eventId}/recommendations?${query.toString()}`
                );
                const recs = recsData.recommendations || recsData;
                setRecommendations(Array.isArray(recs) ? recs : []);
                setRiskSignal(recsData.riskSignal || null);
                setScenarioFlags(Array.isArray(recsData.scenarioFlags) ? recsData.scenarioFlags : []);
            } catch (err) {
                console.error('Failed to load recommendations:', err);
                setRecommendations([]);
                setScenarioFlags([]);
            } finally {
                setRecLoading(false);
            }
        };

        loadRecommendations();
    }, [currentEvent, selectedUserId, recommendationMode, recommendationVolume]);

    useEffect(() => {
        if (!currentEvent || currentEvent.status !== 'live') return;

        const interval = setInterval(async () => {
            try {
                const updated = await apiClient.post(`/events/${currentEvent.eventId}/simulate`, {});
                setCurrentEvent(updated);
            } catch (err) {
                console.error('Failed to update stats:', err);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [currentEvent]);

    const filteredEvents = useMemo(() => events.filter((event) => {
        if (filters.sport !== 'all' && event.sport !== filters.sport) return false;
        if (filters.league !== 'all' && event.league !== filters.league) return false;
        if (filters.team && !`${event.homeTeam} ${event.awayTeam}`.toLowerCase().includes(filters.team.toLowerCase())) return false;
        return true;
    }), [events, filters]);

    const leagues = useMemo(() => [...new Set(events.map((e) => e.league))], [events]);
    const sports = useMemo(() => [...new Set(events.map((e) => e.sport))], [events]);

    const handleAddToBet = (bet) => {
        if (betSlip.some((b) => b.id === bet.id)) {
            setBetSlip(betSlip.filter((b) => b.id !== bet.id));
        } else {
            setBetSlip([...betSlip, bet]);
        }
    };

    const handleRemoveBet = (betId) => setBetSlip(betSlip.filter((b) => b.id !== betId));
    const handleClearBets = () => setBetSlip([]);

    const handleEventChange = async (eventId) => {
        const event = events.find((e) => e.eventId === eventId);
        if (!event) return;
        setCurrentEvent(event);
        try {
            const marketsData = await apiClient.get(`/events/${eventId}/markets`);
            setMarkets(marketsData);
        } catch (err) {
            console.error('Failed to load markets:', err);
        }
    };

    const toggleFavoriteTeam = (team) => {
        setFavoriteTeams((prev) => prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]);
    };

    const toggleFavoriteMarketType = (type) => {
        setFavoriteMarketTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#13161C] flex items-center justify-center">
                <div className="text-white text-xl font-bold">Chargement Betclic POC...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#13161C] text-white pb-28">
            <header className="bg-betclic-red py-3.5 px-4 sticky top-0 z-50 shadow-lg border-b border-black/30">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-white tracking-tight">Betclic</h1>
                        <span className="text-white/90 text-[11px] uppercase tracking-[0.16em] font-semibold">PARIS EN DIRECT</span>
                    </div>
                    <div className="text-white/95 text-[11px] uppercase tracking-[0.14em] font-semibold hidden sm:block">
                        Prototype produit & expérience utilisateur avancée
                    </div>
                </div>
            </header>

            <div className="bg-[#171B23] border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto py-2 scrollbar-hide">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setNav(item.id)}
                            className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${nav === item.id ? 'bg-betclic-red text-white' : 'bg-[#232A36] text-white/70'}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
                <UserProfileSelector users={users} onUserChange={() => { }} />

                <div className="bg-[#1A1F28] border border-white/10 rounded-md p-4 shadow-sm">
                    <h3 className="text-[11px] font-bold text-white/90 mb-3 uppercase tracking-[0.14em]">Filtres persistants (compétition / équipe / rencontre)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <select value={filters.sport} onChange={(e) => setFilters((f) => ({ ...f, sport: e.target.value }))} className="bg-[#232A36] border border-white/15 rounded px-3 py-2 text-sm">
                            <option value="all">Tous sports</option>
                            {sports.map((sport) => <option key={sport} value={sport}>{sport}</option>)}
                        </select>
                        <select value={filters.league} onChange={(e) => setFilters((f) => ({ ...f, league: e.target.value }))} className="bg-[#232A36] border border-white/15 rounded px-3 py-2 text-sm">
                            <option value="all">Toutes compétitions</option>
                            {leagues.map((league) => <option key={league} value={league}>{league}</option>)}
                        </select>
                        <input value={filters.team} onChange={(e) => setFilters((f) => ({ ...f, team: e.target.value }))} placeholder="Rechercher équipe" className="bg-[#232A36] border border-white/15 rounded px-3 py-2 text-sm" />
                        <button onClick={() => setFilters(DEFAULT_FILTERS)} className="bg-[#232A36] border border-white/15 rounded px-3 py-2 text-sm">Réinitialiser</button>
                    </div>
                </div>

                <div className="bg-[#1A1F28] border border-white/10 rounded-md p-4 shadow-sm">
                    <h3 className="text-[11px] font-bold text-white/90 mb-3 uppercase tracking-[0.14em]">Bonus / promotions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-[#232A36] border border-white/10 rounded p-3">🎁 Freebet 10€ dès 50€ de dépôt</div>
                        <div className="bg-[#232A36] border border-white/10 rounded p-3">⚡ Boost de cote +15% sur 1 combiné / jour</div>
                        <div className="bg-[#232A36] border border-white/10 rounded p-3">🏆 Mission: 3 paris live cette semaine = bonus</div>
                    </div>
                </div>

                <div className="bg-[#1A1F28] border border-white/10 rounded-md p-4 shadow-sm">
                    <h3 className="text-[11px] font-bold text-white/90 mb-3 uppercase tracking-[0.14em]">Configuration recommandations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] text-white/60 mb-1 block">Mode</label>
                            <select
                                value={recommendationMode}
                                onChange={(e) => setRecommendationMode(e.target.value)}
                                className="w-full bg-[#232A36] border border-white/15 rounded px-3 py-2 text-sm text-white"
                            >
                                <option value="adaptive">Adaptive (selon risque)</option>
                                <option value="balanced">Balanced (safe prioritaire)</option>
                                <option value="strict">Strict (marchés simples)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] text-white/60 mb-1 block">Volume de suggestions</label>
                            <select
                                value={recommendationVolume}
                                onChange={(e) => setRecommendationVolume(Number(e.target.value))}
                                className="w-full bg-[#232A36] border border-white/15 rounded px-3 py-2 text-sm text-white"
                            >
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                                <option value={6}>6</option>
                            </select>
                        </div>
                    </div>
                </div>

                {filteredEvents.length > 0 && (
                    <div className="bg-[#1A1F28] border border-white/10 rounded-md p-4 shadow-sm">
                        <h3 className="text-[11px] font-bold text-white/90 mb-3 uppercase tracking-[0.14em]">Rencontres filtrées</h3>
                        <div className="flex flex-wrap gap-2">
                            {filteredEvents.map((event) => (
                                <button
                                    key={event.eventId}
                                    onClick={() => handleEventChange(event.eventId)}
                                    className={`px-4 py-2 rounded-md text-sm font-semibold transition border ${currentEvent?.eventId === event.eventId
                                        ? 'bg-betclic-red text-white border-betclic-red'
                                        : 'bg-[#232A36] text-white border-white/10 hover:border-betclic-red'
                                        }`}
                                >
                                    {event.homeTeam} vs {event.awayTeam}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-[#1A1F28] border border-white/10 rounded-md p-5 shadow-sm">
                            {currentEvent && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-[11px] text-white/60 uppercase tracking-[0.14em] font-semibold">{currentEvent.league}</div>
                                        {currentEvent.status === 'live' && (
                                            <div className="flex items-center gap-2">
                                                <span className="bg-betclic-red text-white px-2.5 py-1 rounded text-[10px] font-bold animate-pulse">● EN DIRECT</span>
                                                <span className="text-betclic-yellow font-bold text-sm">{currentEvent.minute}'</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-around gap-4">
                                        <div className="flex-1 text-center">
                                            <div className="text-xs text-white/65 uppercase tracking-wide font-semibold mb-2">
                                                {currentEvent.homeTeam}
                                                <button onClick={() => toggleFavoriteTeam(currentEvent.homeTeam)} className="ml-2 text-betclic-yellow">{favoriteTeams.includes(currentEvent.homeTeam) ? '★' : '☆'}</button>
                                            </div>
                                            <div className="text-6xl font-black text-white leading-none">{currentEvent.homeScore}</div>
                                        </div>
                                        <div className="text-center flex-shrink-0"><div className="text-3xl font-bold text-white/40">-</div></div>
                                        <div className="flex-1 text-center">
                                            <div className="text-xs text-white/65 uppercase tracking-wide font-semibold mb-2">
                                                {currentEvent.awayTeam}
                                                <button onClick={() => toggleFavoriteTeam(currentEvent.awayTeam)} className="ml-2 text-betclic-yellow">{favoriteTeams.includes(currentEvent.awayTeam) ? '★' : '☆'}</button>
                                            </div>
                                            <div className="text-6xl font-black text-white leading-none">{currentEvent.awayScore}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-[#1A1F28] border border-white/10 rounded-md p-4 shadow-sm">
                            <h3 className="text-[11px] font-bold text-white/90 mb-3 uppercase tracking-[0.14em]">Fiche match enrichie</h3>
                            <div className="grid md:grid-cols-3 gap-3 text-xs">
                                <div className="bg-[#232A36] border border-white/10 rounded p-3">
                                    <div className="text-white/60 uppercase mb-1">Timeline</div>
                                    <ul className="space-y-1 text-white/80">
                                        <li>{currentEvent?.minute}' Pression offensive</li>
                                        <li>{Math.max(1, (currentEvent?.minute || 45) - 14)}' But potentiel (xG élevé)</li>
                                        <li>{Math.max(1, (currentEvent?.minute || 45) - 29)}' Carton / faute clé</li>
                                    </ul>
                                </div>
                                <div className="bg-[#232A36] border border-white/10 rounded p-3">
                                    <div className="text-white/60 uppercase mb-1">Compositions (mock)</div>
                                    <div className="text-white/80">4-3-3 vs 4-2-3-1 • Joueurs clés surveillés</div>
                                </div>
                                <div className="bg-[#232A36] border border-white/10 rounded p-3">
                                    <div className="text-white/60 uppercase mb-1">H2H (mock)</div>
                                    <div className="text-white/80">5 derniers matchs: 2V - 2N - 1D</div>
                                </div>
                            </div>
                        </div>

                        <LiveStats event={currentEvent} />

                        <div>
                            <h2 className="text-[11px] font-bold text-white/90 mb-4 uppercase tracking-[0.14em]">📊 Tous les paris disponibles</h2>
                            <MarketGrid
                                markets={markets}
                                event={currentEvent}
                                onAddToBet={handleAddToBet}
                                recommendedMarketIds={recommendations.map((rec) => rec.marketId)}
                                favoriteMarketTypes={favoriteMarketTypes}
                                onToggleFavoriteMarketType={toggleFavoriteMarketType}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <RiskSignal riskSignal={riskSignal} />
                        <RecommendationPanel
                            recommendations={recommendations}
                            loading={recLoading}
                            onAddToBet={handleAddToBet}
                            riskSignal={riskSignal}
                            scenarioFlags={scenarioFlags}
                        />
                    </div>
                </div>
            </main>

            <BetSlip
                bets={betSlip}
                user={selectedUser}
                riskSignal={riskSignal}
                markets={markets}
                onRemove={handleRemoveBet}
                onClear={handleClearBets}
            />

            <footer className="border-t border-white/10 mt-8 py-6 px-4 text-center text-xs text-white/60 bg-[#171B23]">
                <p className="mb-2">Betclic POC • Recommandations personnalisées basées sur les données</p>
                <p className="text-white/40">Cet outil est à titre informatif uniquement. Les jeux d'argent comportent des risques.</p>
            </footer>
        </div>
    );
}
