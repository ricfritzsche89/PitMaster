import React, { useState, useEffect } from 'react';
import { getEvent, rsvpToEvent, updateEvent } from '../services/db';

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
        </div>
    );
}
