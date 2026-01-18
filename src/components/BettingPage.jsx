import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getEvent, placeBet, subscribeToBets } from '../services/db';
import { calculateOdds, calculatePayouts } from '../services/betting';
import { formatCurrency } from '../services/finance';

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

    // Local Storage for "My Bets"
    const [myBetIds, setMyBetIds] = useState([]);

    // Ref for scrolling
    const liveBetsRef = useRef(null);

    useEffect(() => {
        // 1. Load my bets from local storage on mount
        const stored = JSON.parse(localStorage.getItem(`my_bets_${partyId}`) || '[]');
        setMyBetIds(stored);

        // 2. Check for Persistent Login
        const storedName = localStorage.getItem(`pitmaster_guest_${partyId}`);
        if (storedName) {
            setGuestName(storedName);
            setIsLoggedIn(true);
        }

        loadEvent();
        const unsubscribe = subscribeToBets(partyId, (newBets) => {
            setBets(newBets);
            if (eventData && eventData.guests) {
                setOdds(calculateOdds(newBets, eventData.guests));
            }
        });
        return () => unsubscribe();
    }, [partyId]);

    const handleLogin = (name) => {
        if (!name.trim()) return;
        localStorage.setItem(`pitmaster_guest_${partyId}`, name);
        setGuestName(name);
        setIsLoggedIn(true);
        // We could also try to recover "My Bets" from the DB here if we wanted to be super smart
        // But for now, just setting the name is enough for new bets.
        // RECOVERY LOGIC:
        // If I am "Ric", find all bets by "Ric" in 'bets' state (if loaded) and add to myBetIds?
        // Let's do it in the render or effect.
    };

    // Recalculate odds when eventData loads or bets change
    useEffect(() => {
        if (eventData && eventData.guests) {
            setOdds(calculateOdds(bets, eventData.guests));
        }

        // RECOVERY: If I am logged in, ensure I see my bets even if localStorage was cleared
        if (guestName && bets.length > 0) {
            const myServerBets = bets.filter(b => b.user === guestName).map(b => b.id);
            // Union with local list
            const combined = [...new Set([...myBetIds, ...myServerBets])];

            // Only update if we found new ones
            if (combined.length > myBetIds.length) {
                setMyBetIds(combined);
                localStorage.setItem(`my_bets_${partyId}`, JSON.stringify(combined));
            }
        }
    }, [eventData, bets, guestName]);

    const loadEvent = async () => {
        try {
            const data = await getEvent(partyId);
            setEventData(data);
        } catch (e) {
            console.error(e);
        }
    };



    const handlePlaceBet = async (e) => {
        e.preventDefault();
        if (!selectedTarget) return;

        const betId = await placeBet(partyId, {
            user: guestName,
            type: selectedType,
            target: selectedTarget,
            amount: parseFloat(amount)
        });

        // Save to local list
        const newMyBets = [...myBetIds, betId];
        setMyBetIds(newMyBets);
        localStorage.setItem(`my_bets_${partyId}`, JSON.stringify(newMyBets));

        alert(`Wette platziert! Viel Glück, ${guestName}! 🍀`);
        setAmount(5); // Reset amount slightly but keep user engaged

        // Auto-scroll to live bets
        setTimeout(() => {
            liveBetsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };



    if (!eventData) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Lade Wettbüro...</div>;

    // LOGIN MODAL
    if (!isLoggedIn) {
        return (
            <div className="content-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div className="glass card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕵️‍♂️</div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Wer bist du?</h2>
                    <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Damit wir deine Wetten zuordnen können.</p>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const name = e.target.elements.name.value;
                        handleLogin(name);
                    }}>
                        <input
                            name="name"
                            className="input-field"
                            placeholder="Dein Name"
                            autoFocus
                            style={{ textAlign: 'center', fontSize: '1.2rem' }}
                        />
                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                            Los geht's! 🚀
                        </button>
                    </form>
                </div>
            </div>
        );
    }



    // Filter My Bets
    const myBetsList = bets.filter(b => myBetIds.includes(b.id));

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '6rem', maxWidth: '800px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0.5rem' }}>
                <div>
                    <h3 style={{ margin: 0 }}>Wettbüro</h3>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{eventData.title}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>
                    👤 {guestName}
                </div>
            </div>

            {/* CLOSED STATE */}
            {(!eventData.bettingStatus || eventData.bettingStatus === 'closed') && !eventData.bettingResults && (
                <div className="glass card" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⛔</div>
                    <h3>Wettbüro momentan geschlossen</h3>
                    <p style={{ opacity: 0.7 }}>Warte auf den Admin...</p>
                </div>
            )}

            {/* RESULTS STATE */}
            {eventData.bettingResults && (() => {
                // Calculate payouts on the fly for display
                // Note: accurate odds are needed. 'odds' state might deviate if not frozen.
                // Ideally backend stores payouts, but for now we recalculate.
                const allPayouts = calculatePayouts(bets, eventData.bettingResults, odds);

                // My personal winnings
                const myPayouts = allPayouts.filter(p => p.user === guestName);
                const myTotalWin = myPayouts.reduce((sum, p) => sum + p.amount, 0);
                const myTotalInvest = bets.filter(b => b.user === guestName).reduce((sum, b) => sum + b.amount, 0); // Approx
                // Better: Check bets that matched the winning condition? Or just total won? 
                // Let's just show "Won".

                return (
                    <div className="glass card" style={{ padding: '0', marginBottom: '2rem', border: '1px solid var(--accent-primary)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                            <h2 className="text-gradient" style={{ textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem', marginTop: 0 }}>Komplett Ausgewertet!</h2>
                            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                🏆 {eventData.bettingResults.winner} | 💩 {eventData.bettingResults.loser}
                            </div>
                        </div>

                        {/* MY PERSONAL RESULT */}
                        <div style={{ padding: '2rem', textAlign: 'center', background: myTotalWin > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                            {myTotalWin > 0 ? (
                                <>
                                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🥳</div>
                                    <h3 style={{ margin: 0, color: 'var(--accent-success)' }}>Glückwunsch!</h3>
                                    <p style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>Du hast <strong>{formatCurrency(myTotalWin)}</strong> gewonnen!</p>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Geh zum Admin für die Auszahlung.</div>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📉</div>
                                    <h3 style={{ margin: 0, color: 'var(--accent-danger)' }}>Knapp daneben!</h3>
                                    <p style={{ margin: '0.5rem 0' }}>Leider nichts gewonnen.</p>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Viel Glück beim nächsten Mal! 🍀</div>
                                </>
                            )}
                        </div>

                        {/* WINNERS TABLE */}
                        <div style={{ padding: '1rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', textTransform: 'uppercase', fontSize: '0.8rem', opacity: 0.6, letterSpacing: '1px' }}>Die Glückspilze (Payouts)</h4>
                            {allPayouts.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <tbody>
                                        {allPayouts.map((p, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '8px', fontWeight: 'bold' }}>{p.user}</td>
                                                <td style={{ padding: '8px' }}>
                                                    <span style={{
                                                        fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px',
                                                        background: 'rgba(255,255,255,0.05)', marginRight: '8px'
                                                    }}>
                                                        {p.type === 'winner' ? 'Sieg' : 'Verl.'}
                                                    </span>
                                                    {p.target}
                                                </td>
                                                <td style={{ padding: '8px', textAlign: 'right', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                                                    {formatCurrency(p.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ textAlign: 'center', opacity: 0.5, padding: '1rem' }}>Niemand hat gewonnen. Das Haus freut sich! 🏦</div>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* OPEN STATE - BETTING FORM */}
            {eventData.bettingStatus === 'open' && (
                <div className="glass card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', textAlign: 'center' }}>Neue Wette platzieren</h3>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
                        <button onClick={() => setSelectedType('winner')} className={selectedType === 'winner' ? 'btn-primary' : 'btn-ghost'} style={{ flex: 1, fontSize: '0.8rem' }}>🏆 Sieger</button>
                        <button onClick={() => setSelectedType('loser')} className={selectedType === 'loser' ? 'btn-primary' : 'btn-ghost'} style={{ flex: 1, fontSize: '0.8rem' }}>💩 Verlierer</button>
                    </div>

                    <form onSubmit={handlePlaceBet}>
                        <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '1rem' }}>
                            {selectedType === 'winner' ? 'Wer gewinnt das Event?' : 'Wer wird Letzter?'}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {eventData.guests?.filter(g => g.status === 'accepted').map(g => {
                                const oddVal = odds[`${selectedType}_${g.name}`] || 10.0;
                                return (
                                    <div
                                        key={g.name}
                                        onClick={() => setSelectedTarget(g.name)}
                                        style={{
                                            padding: '12px',
                                            border: selectedTarget === g.name ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)',
                                            background: selectedTarget === g.name ? 'rgba(0,255,163,0.15)' : 'rgba(255,255,255,0.05)',
                                            borderRadius: '16px', cursor: 'pointer', textAlign: 'center',
                                            transition: 'all 0.2s', transform: selectedTarget === g.name ? 'scale(1.05)' : 'scale(1)'
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '4px' }}>{g.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>x {oddVal.toFixed(2)}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="glass" style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', marginTop: 'auto' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Einsatz (€)</label>
                                    <input type="number" min="1" step="0.50" value={amount} onChange={e => setAmount(e.target.value)} className="input-field" style={{ marginBottom: 0, fontSize: '1.2rem', fontWeight: 'bold' }} />
                                </div>
                                <button type="submit" className="btn-primary" disabled={!selectedTarget} style={{ flex: 2, height: '56px', fontSize: '1.1rem' }}>
                                    Wette platzieren
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* MY BETS SECTION */}
            {myBetsList.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ paddingLeft: '0.5rem', borderLeft: '4px solid var(--accent-primary)', marginLeft: '0.5rem', marginBottom: '1.5rem' }}>Deine Wetten</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {myBetsList.map(bet => {
                            // Calculate potential win
                            let currentOdd = 1.0;
                            if (odds[`${bet.type}_${bet.target}`]) currentOdd = odds[`${bet.type}_${bet.target}`];
                            // For max_score, odds might not be fully accurate in "odds" object if not someone backed it? 
                            // Actually calculateOdds returns defaults.

                            const potentialWin = bet.amount * currentOdd;

                            return (
                                <div key={bet.id} className="glass" style={{ padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${bet.type === 'winner' ? '#fbbf24' : bet.type === 'loser' ? '#ef4444' : '#3b82f6'}` }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            {bet.target} <span style={{ opacity: 0.6, fontSize: '0.9rem', fontWeight: 'normal' }}>
                                                ({bet.type === 'winner' ? 'Sieg' : bet.type === 'loser' ? 'Verlierer' : 'Volltreffer'})
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', marginTop: '4px', opacity: 0.8 }}>
                                            Einsatz: <strong>{bet.amount.toFixed(2)}€</strong>
                                            <span style={{ margin: '0 8px' }}>→</span>
                                            Möglich: <strong style={{ color: 'var(--accent-primary)' }}>{potentialWin.toFixed(2)}€</strong>
                                            <span style={{ fontSize: '0.8rem', opacity: 0.5, marginLeft: '5px' }}>(x{currentOdd.toFixed(2)})</span>
                                        </div>
                                    </div>


                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* CURRENT ODDS OVERVIEW (INFO) */}
            <div style={{ marginTop: '3rem' }}>
                <h3 style={{ paddingLeft: '0.5rem', borderLeft: '4px solid rgba(255,255,255,0.5)', marginLeft: '0.5rem', marginBottom: '1.5rem', opacity: 0.8 }}>Aktuelle Quoten Übersicht</h3>
                <div className="glass" style={{ padding: '1rem', borderRadius: '12px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '300px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>Name</th>
                                <th style={{ padding: '8px', color: 'var(--accent-gold)' }}>Sieg</th>
                                <th style={{ padding: '8px', color: '#ef4444' }}>Verl.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventData.guests?.filter(g => g.status === 'accepted').map(g => (
                                <tr key={g.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{g.name}</td>
                                    <td style={{ padding: '8px' }}>{(odds[`winner_${g.name}`] || 1.0).toFixed(2)}</td>
                                    <td style={{ padding: '8px' }}>{(odds[`loser_${g.name}`] || 1.0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ALL LIVE BETS TABLE (Mobile Friendly) */}
            <div ref={liveBetsRef} style={{ marginTop: '3rem', paddingBottom: '2rem' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px 12px 0 0' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🔥 Live Ticker</h3>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{bets.length} Wetten</span>
                </div>

                <div className="glass" style={{ padding: '0', overflowX: 'auto', borderRadius: '0 0 12px 12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '350px' }}>
                        <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', opacity: 0.8 }}>Zeit</th>
                                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', opacity: 0.8 }}>Spieler</th>
                                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', opacity: 0.8 }}>Wette</th>
                                <th style={{ textAlign: 'right', padding: '12px', fontWeight: '600', opacity: 0.8 }}>Mögl. Gewinn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bets.slice().reverse().map((bet, i) => { // Show newest first
                                const oddKey = `${bet.type}_${bet.target}`;
                                const currentProbableOdd = odds ? (odds[oddKey] || 1.0) : 1.0;
                                const potentialWin = bet.amount * currentProbableOdd;
                                const timeStr = bet.timestamp ? new Date(bet.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';

                                return (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '12px', opacity: 0.5, fontSize: '0.75rem' }}>{timeStr}</td>
                                        <td style={{ padding: '12px', fontWeight: '500' }}>{bet.user}</td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{
                                                background: bet.type === 'winner' ? 'rgba(234, 180, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                color: bet.type === 'winner' ? '#eab308' : '#ef4444',
                                                padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '2px'
                                            }}>
                                                {bet.type === 'winner' ? 'SIEG' : 'VERL.'}
                                            </div>
                                            <div style={{ fontSize: '0.9rem' }}>{bet.target}</div>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                                            {formatCurrency(potentialWin)}
                                            <div style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 'normal' }}>
                                                Einsatz: {formatCurrency(bet.amount)}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {bets.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', opacity: 0.4 }}>
                                        Noch keine Wetten. Sei der Erste! 🚀
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
