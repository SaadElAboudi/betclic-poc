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
    const [users, setUsersState] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recLoading, setRecLoading] = useState(false);
    const [betSlip, setBetSlip] = useState([]);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load users
                const usersData = await apiClient.get('/users');
                setUsersState(usersData);
                setUsers(usersData);

                // Load all events
                const eventsData = await apiClient.get('/events');
                setEvents(eventsData);
                const liveEvent = eventsData.find(e => e.status === 'live') || eventsData[0];
                setCurrentEvent(liveEvent);

                // Load markets for this event
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

    // Load recommendations when event or user changes
    useEffect(() => {
        if (!currentEvent || !selectedUserId) return;

        const loadRecommendations = async () => {
            setRecLoading(true);
            try {
                const recsData = await apiClient.get(
                    `/users/${selectedUserId}/events/${currentEvent.eventId}/recommendations`
                );
                // API now returns { recommendations, riskSignal }
                const recs = recsData.recommendations || recsData;
                setRecommendations(Array.isArray(recs) ? recs : []);
                setRiskSignal(recsData.riskSignal || null);
            } catch (err) {
                console.error('Failed to load recommendations:', err);
                setRecommendations([]);
            } finally {
                setRecLoading(false);
            }
        };

        loadRecommendations();
    }, [currentEvent, selectedUserId]);

    // Bet slip handlers
    const handleAddToBet = (bet) => {
        // Check if bet already exists
        if (betSlip.some(b => b.id === bet.id)) {
            // Remove it if already added
            setBetSlip(betSlip.filter(b => b.id !== bet.id));
        } else {
            // Add new bet
            setBetSlip([...betSlip, bet]);
        }
    };

    const handleRemoveBet = (betId) => {
        setBetSlip(betSlip.filter(b => b.id !== betId));
    };

    const handleClearBets = () => {
        setBetSlip([]);
    };

    // Simulate live updates every 10 seconds
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
            <div className="min-h-screen bg-betclic-grayLight flex items-center justify-center">
                <div className="text-gray-900 text-xl font-bold">Chargement Betclic POC...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-betclic-grayLight">
            {/* Header */}
            <header className="bg-betclic-red py-3.5 px-4 sticky top-0 z-50 shadow-sm border-b border-black/10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Betclic
                            </h1>
                            <span className="text-white/90 text-[11px] uppercase tracking-[0.16em] font-semibold">PARIS EN DIRECT</span>
                        </div>
                        <div className="text-white/95 text-[11px] uppercase tracking-[0.14em] font-semibold hidden sm:block">
                            Recommandations personnalisées basées sur votre profil
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* User Profile Selector */}
                <UserProfileSelector users={users} onUserChange={() => { }} />

                {/* Match Navigation */}
                {events.length > 1 && (
                    <div className="bg-white border border-betclic-grayBorder rounded-md p-4 shadow-sm mb-4">
                        <h3 className="text-[11px] font-bold text-gray-900 mb-3 uppercase tracking-[0.14em]">Autres matchs</h3>
                        <div className="flex flex-wrap gap-2">
                            {events.map((event) => (
                                <button
                                    key={event.eventId}
                                    onClick={() => handleEventChange(event.eventId)}
                                    className={`px-4 py-2 rounded-md text-sm font-semibold transition ${currentEvent?.eventId === event.eventId
                                        ? 'bg-betclic-red text-white'
                                        : 'bg-betclic-grayLight text-gray-900 border border-betclic-grayBorder hover:border-betclic-red'
                                        }`}
                                >
                                    {event.homeTeam} vs {event.awayTeam}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Grid: Markets + Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Left Column - Match Info + All Markets */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Large Match Header */}
                        <div className="bg-white border border-betclic-grayBorder rounded-md p-5 shadow-sm">
                            {currentEvent && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-[11px] text-betclic-grayText uppercase tracking-[0.14em] font-semibold">
                                            {currentEvent.league}
                                        </div>
                                        {currentEvent.status === 'live' && (
                                            <div className="flex items-center gap-2">
                                                <span className="bg-betclic-red text-white px-2.5 py-1 rounded text-[10px] font-bold animate-pulse">
                                                    ● EN DIRECT
                                                </span>
                                                <span className="text-betclic-red font-bold text-sm">{currentEvent.minute}'</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-around gap-4">
                                        <div className="flex-1 text-center">
                                            <div className="text-xs text-betclic-grayText uppercase tracking-wide font-semibold mb-2">{currentEvent.homeTeam}</div>
                                            <div className="text-6xl font-black text-gray-900 leading-none">
                                                {currentEvent.homeScore}
                                            </div>
                                        </div>

                                        <div className="text-center flex-shrink-0">
                                            <div className="text-3xl font-bold text-betclic-grayText">-</div>
                                        </div>

                                        <div className="flex-1 text-center">
                                            <div className="text-xs text-betclic-grayText uppercase tracking-wide font-semibold mb-2">{currentEvent.awayTeam}</div>
                                            <div className="text-6xl font-black text-gray-900 leading-none">
                                                {currentEvent.awayScore}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Statistics */}
                        <LiveStats event={currentEvent} />

                        {/* All Markets */}
                        <div>
                            <h2 className="text-[11px] font-bold text-gray-900 mb-4 uppercase tracking-[0.14em]">
                                📊 Tous les paris disponibles
                            </h2>
                            <MarketGrid
                                markets={markets}
                                event={currentEvent}
                                onAddToBet={handleAddToBet}
                                recommendedMarketIds={recommendations.map((rec) => rec.marketId)}
                            />
                        </div>
                    </div>

                    {/* Right Column - Recommendations Sidebar */}
                    <div className="lg:col-span-1">
                        <RiskSignal riskSignal={riskSignal} />
                        <RecommendationPanel
                            recommendations={recommendations}
                            loading={recLoading}
                            onAddToBet={handleAddToBet}
                            riskSignal={riskSignal}
                        />
                    </div>
                </div>
            </main>

            {/* Bet Slip */}
            <BetSlip bets={betSlip} onRemove={handleRemoveBet} onClear={handleClearBets} />

            {/* Footer */}
            <footer className="border-t border-betclic-grayBorder mt-8 py-6 px-4 text-center text-xs text-betclic-grayText bg-[#FAFAFB]">
                <p className="mb-2">Betclic POC • Recommandations personnalisées basées sur les données</p>
                <p className="text-betclic-grayText/70">Cet outil est à titre informatif uniquement. Les jeux d'argent comportent des risques.</p>
            </footer>
        </div>
    );
}
