import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEvent, placeBet, subscribeToBets } from '../services/db';
import { calculateOdds } from '../services/betting';

export default function BettingPage() {
    const { id: partyId } = useParams();
    const [eventData, setEventData] = useState(null);
    const [guestName, setGuestName] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Betting State
    const [bets, setBets] = useState([]);
    const [odds, setOdds] = useState({});
    const [selectedType, setSelectedType] = useState('winner');
    const [selectedTarget, setSelectedTarget] = useState('');
    const [amount, setAmount] = useState(5);

    useEffect(() => {
        loadEvent();
        const unsubscribe = subscribeToBets(partyId, (newBets) => {
            setBets(newBets);
            if (eventData && eventData.guests) {
                setOdds(calculateOdds(newBets, eventData.guests));
            }
        });
        return () => unsubscribe();
    }, [partyId]);

    // Recalculate odds when eventData loads
    useEffect(() => {
        if (eventData && eventData.guests) {
            setOdds(calculateOdds(bets, eventData.guests));
        }
    }, [eventData, bets]);

    const loadEvent = async () => {
        try {
            const data = await getEvent(partyId);
            setEventData(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (guestName.trim()) setIsLoggedIn(true);
    };

    const handlePlaceBet = async (e) => {
        e.preventDefault();
        if (!selectedTarget) return;

        await placeBet(partyId, {
            user: guestName,
            type: selectedType,
            target: selectedTarget,
            amount: parseFloat(amount)
        });
        alert(`Wette platziert! Viel Glück, ${guestName}! 🍀`);
    };

    if (!eventData) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Lade Wettbüro...</div>;

    if (!isLoggedIn) {
        return (
            <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div className="glass card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎰</h1>
                    <h2 style={{ marginBottom: '1.5rem', background: 'linear-gradient(to right, #ffd700, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Wettbüro: {eventData.title}
                    </h2>
                    <form onSubmit={handleLogin}>
                        <label style={{ display: 'block', marginBottom: '1rem' }}>Dein Name:</label>
                        <input
                            className="input-field"
                            value={guestName}
                            onChange={e => setGuestName(e.target.value)}
                            placeholder="Name eingeben"
                            required
                            style={{ textAlign: 'center', fontSize: '1.2rem' }}
                        />
                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Betreten 🚀</button>
                    </form>
                </div>
            </div>
        );
    }

    // MAIN BETTING INTERFACE
    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Wettbüro</h3>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>👤 {guestName}</span>
            </div>

            {(!eventData.bettingStatus || eventData.bettingStatus === 'closed') && !eventData.bettingResults && (
                <div className="glass card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛔</div>
                    <h3>Wettbüro geschlossen</h3>
                    <p>Warte auf den Admin...</p>
                </div>
            )}

            {eventData.bettingResults && (
                <div className="glass card" style={{ textAlign: 'center', padding: '2rem', marginBottom: '2rem' }}>
                    <h2 style={{ color: '#22c55e' }}>Ergebnisse 🏁</h2>
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ fontSize: '1.5rem' }}>🥇 {eventData.bettingResults.winner}</div>
                        <div style={{ fontSize: '1.5rem' }}>💩 {eventData.bettingResults.loser}</div>
                    </div>
                </div>
            )}

            {eventData.bettingStatus === 'open' && (
                <div className="glass card">
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <button onClick={() => setSelectedType('winner')} className={selectedType === 'winner' ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '0.8rem' }}>🏆 Sieger</button>
                        <button onClick={() => setSelectedType('loser')} className={selectedType === 'loser' ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '0.8rem' }}>💩 Verlierer</button>
                        <button onClick={() => setSelectedType('max_score')} className={selectedType === 'max_score' ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '0.8rem' }}>🎯 Volltreffer</button>
                    </div>

                    <form onSubmit={handlePlaceBet}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', textAlign: 'center', opacity: 0.8 }}>
                            {selectedType === 'winner' ? 'Wer gewinnt?' : selectedType === 'loser' ? 'Wer verliert?' : 'Wer trifft perfekt?'}
                        </label>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
                            {eventData.guests?.filter(g => g.status === 'accepted').map(g => {
                                const oddVal = selectedType === 'max_score' ? 5.0 : (odds[`${selectedType}_${g.name}`] || 10.0);
                                return (
                                    <div
                                        key={g.name}
                                        onClick={() => setSelectedTarget(g.name)}
                                        style={{
                                            padding: '10px',
                                            border: selectedTarget === g.name ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)',
                                            background: selectedTarget === g.name ? 'rgba(0,255,163,0.1)' : 'rgba(0,0,0,0.2)',
                                            borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{g.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>x {oddVal.toFixed(2)}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="glass" style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem' }}>Einsatz (€)</label>
                                    <input type="number" min="1" step="1" value={amount} onChange={e => setAmount(e.target.value)} className="input-field" style={{ marginBottom: 0 }} />
                                </div>
                                <button type="submit" className="btn-primary" disabled={!selectedTarget} style={{ flex: 2, height: '48px' }}>
                                    Wette platzieren
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
