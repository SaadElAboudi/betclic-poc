import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { useUser } from '../context/UserContext';
import { LiveStats } from '../components/LiveStats';
import { MarketGrid } from '../components/MarketGrid';
import { RecommendationPanel } from '../components/RecommendationPanel';
import { UserProfileSelector } from '../components/UserProfileSelector';
import { BetSlip } from '../components/BetSlip';
import RiskSignal from '../components/RiskSignal';

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

    const selectedUser = users.find((user) => user.userId === selectedUserId) || null;

    useEffect(() => {
        const loadData = async () => {
            try {
                const usersData = await apiClient.get('/users');
                setUsersState(usersData);
                setUsers(usersData);

                const eventsData = await apiClient.get('/events');
                setEvents(eventsData);
                const liveEvent = eventsData.find(e => e.status === 'live') || eventsData[0];
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
                const recsData = await apiClient.get(
                    `/users/${selectedUserId}/events/${currentEvent.eventId}/recommendations`
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
    }, [currentEvent, selectedUserId]);

    const handleAddToBet = (bet) => {
        if (betSlip.some(b => b.id === bet.id)) {
            setBetSlip(betSlip.filter(b => b.id !== bet.id));
        } else {
            setBetSlip([...betSlip, bet]);
        }
    };

    const handleRemoveBet = (betId) => setBetSlip(betSlip.filter(b => b.id !== betId));
    const handleClearBets = () => setBetSlip([]);

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

    const handleEventChange = async (eventId) => {
        const event = events.find(e => e.eventId === eventId);
        setCurrentEvent(event);
        try {
            const marketsData = await apiClient.get(`/events/${eventId}/markets`);
            setMarkets(marketsData);
        } catch (err) {
            console.error('Failed to load markets:', err);
        }
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
                        Expérience Live inspirée de Betclic.fr
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
                <UserProfileSelector users={users} onUserChange={() => { }} />

                {events.length > 1 && (
                    <div className="bg-[#1A1F28] border border-white/10 rounded-md p-4 shadow-sm">
                        <h3 className="text-[11px] font-bold text-white/90 mb-3 uppercase tracking-[0.14em]">Autres matchs</h3>
                        <div className="flex flex-wrap gap-2">
                            {events.map((event) => (
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
                                            <div className="text-xs text-white/65 uppercase tracking-wide font-semibold mb-2">{currentEvent.homeTeam}</div>
                                            <div className="text-6xl font-black text-white leading-none">{currentEvent.homeScore}</div>
                                        </div>
                                        <div className="text-center flex-shrink-0"><div className="text-3xl font-bold text-white/40">-</div></div>
                                        <div className="flex-1 text-center">
                                            <div className="text-xs text-white/65 uppercase tracking-wide font-semibold mb-2">{currentEvent.awayTeam}</div>
                                            <div className="text-6xl font-black text-white leading-none">{currentEvent.awayScore}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <LiveStats event={currentEvent} />

                        <div>
                            <h2 className="text-[11px] font-bold text-white/90 mb-4 uppercase tracking-[0.14em]">📊 Tous les paris disponibles</h2>
                            <MarketGrid
                                markets={markets}
                                event={currentEvent}
                                onAddToBet={handleAddToBet}
                                recommendedMarketIds={recommendations.map((rec) => rec.marketId)}
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
