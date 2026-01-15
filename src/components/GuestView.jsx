import React, { useState, useEffect } from 'react';
import { getEvent, rsvpToEvent, updateEvent, subscribeToBets, placeBet } from '../services/db';
import { calculateOdds, calculatePayouts } from '../services/betting';

export default function GuestView({ partyId }) {
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [guestName, setGuestName] = useState('');
    const [hasResponded, setHasResponded] = useState(false);

    useEffect(() => {
        loadEvent();
    }, [partyId]);

    const loadEvent = async () => {
        try {
            setLoading(true);
            const data = await getEvent(partyId);
            setEventData(data);
        } catch (e) {
            setError("Event nicht gefunden oder abgelaufen.");
        }
        setLoading(false);
    };

    const handleRSVP = async (status) => {
        if (!guestName.trim()) {
            alert("Bitte gib deinen Namen ein!");
            return;
        }

        try {
            await rsvpToEvent(partyId, {
                name: guestName,
                status: status,
                timestamp: Date.now()
            });
            setHasResponded(true);
            loadEvent(); // Reload to show updated list
        } catch (e) {
            alert("Fehler beim Senden der Antwort");
        }
    };

    // Date formatter
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}.${m}.${y}`;
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Lade Party Infos...</div>;
    if (error) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem', color: '#ef4444' }}>{error}</div>;

    return (
        <div className="container animate-fade-in">
            <div className="glass card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', overflow: 'hidden' }}>

                {eventData.image ? (
                    <div style={{ margin: '-2rem -2rem 2rem -2rem', height: '250px', backgroundImage: `url(${eventData.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    </div>
                ) : (
                    <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', marginTop: '1rem' }}>🎉</span>
                )}

                {eventData.theme && (
                    <span style={{
                        background: 'var(--accent-primary)', color: '#000', fontWeight: 'bold',
                        padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem',
                        textTransform: 'uppercase', letterSpacing: '1px'
                    }}>
                        {eventData.theme}
                    </span>
                )}

                <h1 style={{ background: 'linear-gradient(to right, #22c55e, #14532d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem', marginTop: eventData.theme ? '0.5rem' : '0' }}>{eventData.title}</h1>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', margin: '2rem 0', textAlign: 'left' }}>
                    <p style={{ margin: '0.5rem 0' }}>📅 <strong>Wann:</strong> {formatDate(eventData.date)} um {eventData.time}</p>
                    <p style={{ margin: '0.5rem 0' }}>📍 <strong>Wo:</strong> {eventData.location}</p>
                    {eventData.maxGuests > 0 && <p style={{ margin: '0.5rem 0' }}>👥 <strong>Max Gäste:</strong> {eventData.maxGuests}</p>}
                    <p style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>📝 <strong>Infos:</strong><br />{eventData.description}</p>
                </div>

                {!hasResponded ? (
                    <div className="animate-fade-in">
                        <h3 style={{ marginBottom: '1rem' }}>Bist du dabei?</h3>
                        <input
                            placeholder="Dein Name"
                            className="input-field"
                            style={{ maxWidth: '300px', textAlign: 'center' }}
                            value={guestName}
                            onChange={e => setGuestName(e.target.value)}
                        />

                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
                                <button onClick={() => handleRSVP('accepted')} className="btn-primary" style={{ flex: 1, maxWidth: '140px' }}>
                                    Bin dabei! 🚀
                                </button>
                                <button onClick={() => handleRSVP('declined')} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--glass-border)', flex: 1, maxWidth: '140px' }}>
                                    Kann nicht
                                </button>
                            </div>
                            <button onClick={() => handleRSVP('maybe')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Vielleicht... 🤔
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in" style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--accent-primary)' }}>
                        <h3>Antwort gesendet!</h3>
                        <p>Danke für die Rückmeldung, {guestName}.</p>

                        {/* BRING LIST SECTION FOR GUESTS */}
                        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', textAlign: 'left' }}>
                            <h4 style={{ marginBottom: '1rem' }}>🎁 Wer bringt was mit?</h4>

                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1rem' }}>
                                {(eventData.bringList || []).map((item, i) => (
                                    <li key={i} style={{ marginBottom: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', fontSize: '0.9rem' }}>
                                        <strong style={{ color: 'var(--accent-primary)' }}>{item.guest}</strong>: {item.item}
                                        {item.note && <span style={{ opacity: 0.7 }}> ({item.note})</span>}
                                    </li>
                                ))}
                                {(!eventData.bringList || eventData.bringList.length === 0) && <li style={{ opacity: 0.5, fontSize: '0.9rem' }}>Noch bringt niemand etwas mit.</li>}
                            </ul>

                            <h5 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Ich bringe was mit:</h5>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.target);
                                const item = fd.get('item');
                                const note = fd.get('note');
                                if (!item) return;

                                try {
                                    // Fetch latest to minimize conflicts
                                    const latest = await getEvent(partyId);
                                    const newItem = { guest: guestName, item, note };
                                    const updatedList = [...(latest.bringList || []), newItem];

                                    await updateEvent(partyId, { bringList: updatedList });
                                    setEventData({ ...latest, bringList: updatedList }); // Optimistic local update
                                    e.target.reset();
                                    alert("Gespeichert! Danke " + guestName + "!");
                                } catch (err) {
                                    console.error(err);
                                    alert("Fehler beim Speichern. Versuch's nochmal.");
                                }
                            }} style={{ display: 'flex', gap: '0.5rem' }}
                            >
                                <input name="item" required placeholder="Was? (z.B. Brot)" className="input-field" style={{ marginBottom: 0, flex: 2 }} />
                                <input name="note" placeholder="Notiz" className="input-field" style={{ marginBottom: 0, flex: 1 }} />
                                <button type="submit" className="btn-primary" style={{ padding: '0 1rem' }}>+</button>
                            </form>

                        </div>

                        {guestName && <button onClick={() => setHasResponded(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', marginTop: '2rem' }}>Antwort ändern</button>}
                    </div>
                )}

                <div style={{ marginTop: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                    <h4>Wer kommt? ({eventData.guests?.filter(g => g.status === 'accepted').length || 0})</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                        {eventData.guests && eventData.guests.map((g, i) => (
                            <span key={i} style={{
                                background: 'rgba(255,255,255,0.1)',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                opacity: g.status === 'declined' ? 0.5 : 1,
                                textDecoration: g.status === 'declined' ? 'line-through' : 'none'
                            }}>
                                {g.name} {g.status === 'maybe' ? '(Vielleicht)' : ''}
                            </span>
                        ))}
                        {(!eventData.guests || eventData.guests.length === 0) && <span style={{ opacity: 0.5 }}>Sei der Erste!</span>}
                    </div>
                </div>

            </div>

            {/* WETTBÜRO SECTION */}
            <div className="glass card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', overflow: 'hidden', padding: '1.5rem' }}>
                <h2 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>🎰 Wettbüro</h2>

                {(!eventData.bettingStatus || eventData.bettingStatus === 'closed') && !eventData.bettingResults && (
                    <div style={{ padding: '2rem', opacity: 0.7 }}>
                        <h3>Das Wettbüro hat geschlossen.</h3>
                        <p>Warte auf den Admin...</p>
                    </div>
                )}

                {eventData.bettingStatus === 'open' && (
                    <BettingInterface eventId={partyId} guests={eventData.guests?.filter(g => g.status === 'accepted') || []} currentUser={guestName} />
                )}

                {eventData.bettingStatus === 'finished' && eventData.bettingResults && (
                    <BettingResults eventId={partyId} results={eventData.bettingResults} />
                )}
            </div>
        </div>
    );
}

// Sub-component for Placing Bets
function BettingInterface({ eventId, guests, currentUser }) {
    const [bets, setBets] = useState([]);
    const [odds, setOdds] = useState({});
    const [selectedType, setSelectedType] = useState('winner');
    const [selectedTarget, setSelectedTarget] = useState('');
    const [amount, setAmount] = useState(5);

    useEffect(() => {
        const unsubscribe = subscribeToBets(eventId, (newBets) => {
            setBets(newBets);
            setOdds(calculateOdds(newBets, guests));
        });
        return () => unsubscribe();
    }, [eventId, guests]);

    const handlePlaceBet = async (e) => {
        e.preventDefault();
        if (!currentUser) { alert("Bitte erst oben deinen Namen eingeben!"); return; }
        if (!selectedTarget) return;

        await placeBet(eventId, {
            user: currentUser,
            type: selectedType,
            target: selectedTarget,
            amount: parseFloat(amount)
        });
        alert(`Wette platziert! Viel Glück, ${currentUser}! 🍀`);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <button onClick={() => setSelectedType('winner')} className={selectedType === 'winner' ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '0.8rem' }}>🏆 Sieger</button>
                <button onClick={() => setSelectedType('loser')} className={selectedType === 'loser' ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '0.8rem' }}>💩 Verlierer</button>
                <button onClick={() => setSelectedType('max_score')} className={selectedType === 'max_score' ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '0.8rem' }}>🎯 30er</button>
            </div>

            <form onSubmit={handlePlaceBet} style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    {selectedType === 'winner' ? 'Wer gewinnt das Ding?' : selectedType === 'loser' ? 'Wer verkackt es?' : 'Wer schießt eine glatte 30?'}
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {guests.map(g => {
                        const key = selectedType === 'max_score' ? 'maxScore' : `${selectedType}_${g.name}`;
                        // Max Score odds fixed at 5.0 for now in logic, or derived. logic says 5.0 fixed for UI simplicity or calced?
                        // calculateOdds returns { winner_Ric: 2.0, maxScore_Ric: ??? }
                        // Review calc logic: maxScore pool is lumped. 
                        // Let's just show "Quote: 5.0" for max score or dynamic if implemented properly.
                        // Impl simplified: max_score is pool based.
                        const oddVal = selectedType === 'max_score' ? 5.0 : (odds[`${selectedType}_${g.name}`] || 10.0);

                        return (
                            <div
                                key={g.name}
                                onClick={() => setSelectedTarget(g.name)}
                                style={{
                                    padding: '10px',
                                    border: selectedTarget === g.name ? '1px solid var(--accent-primary)' : '1px solid transparent',
                                    background: selectedTarget === g.name ? 'rgba(0,255,163,0.1)' : 'rgba(0,0,0,0.2)',
                                    borderRadius: '8px', cursor: 'pointer', textAlign: 'center'
                                }}
                            >
                                <div style={{ fontWeight: 'bold' }}>{g.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>x {oddVal.toFixed(2)}</div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem' }}>Einsatz (€)</label>
                        <input type="number" min="1" step="1" value={amount} onChange={e => setAmount(e.target.value)} className="input-field" style={{ marginBottom: 0 }} />
                    </div>
                    <button type="submit" className="btn-primary" disabled={!selectedTarget} style={{ flex: 2, height: '48px' }}>
                        Wette platzieren
                    </button>
                </div>
            </form>
        </div>
    );
}

// Sub-component for Results
function BettingResults({ eventId, results }) {
    const [myPayouts, setMyPayouts] = useState([]);

    useEffect(() => {
        // Here we could fetch all bets again and calc payouts locally to show "My Winnings"
        // For now just show the Official Results
    }, []);

    return (
        <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '0' }}>🏁</h1>
            <h3 style={{ color: '#22c55e', marginTop: '0.5rem' }}>Ergebnisse</h3>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <div style={{ flex: 1, padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '2rem' }}>🥇</div>
                    <strong>{results.winner}</strong>
                </div>
                <div style={{ flex: 1, padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '2rem' }}>💩</div>
                    <strong>{results.loser}</strong>
                </div>
            </div>

            {results.maxScoreHitters && results.maxScoreHitters.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '12px' }}>
                    <strong>🎯 30er Club:</strong> {results.maxScoreHitters.join(', ')}
                </div>
            )}

