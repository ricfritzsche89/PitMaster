import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { subscribeToParticipants, getEvent, subscribeToEvent } from '../services/db';
import BroadcastReceiver from './BroadcastReceiver';

export default function PartyShootingView() {
    const { eventId } = useParams();
    const [participants, setParticipants] = useState([]);
    const [event, setEvent] = useState(null);
    const [prevLeader, setPrevLeader] = useState(null);
    const [showBanner, setShowBanner] = useState(null);

    // Calculate total score
    const getScore = (p) => {
        const r1 = (p.round1 || []).reduce((a, b) => a + (b || 0), 0);
        const r2 = (p.round2 || []).reduce((a, b) => a + (b || 0), 0);
        return r1 + r2;
    };

    useEffect(() => {
        // Subscribe to event updates (including broadcast)
        const unsubEvent = subscribeToEvent(eventId, (data) => {
            setEvent(data);
        });

        // getEvent(eventId).then(setEvent).catch(console.error); // Replaced by subscription

        const unsubscribe = subscribeToParticipants(eventId, (data) => {
            // Sort by score DESC
            const sorted = data.sort((a, b) => getScore(b) - getScore(a));

            // Check for new leader
            if (sorted.length > 0) {
                const currentLeader = sorted[0];
                if (prevLeader && prevLeader.id !== currentLeader.id) {
                    setShowBanner(`👑 Neuer Führender: ${currentLeader.name} 👑`);
                    setTimeout(() => setShowBanner(null), 5000);
                }
                setPrevLeader(currentLeader);
            }

            setParticipants(sorted);
        });
        return () => {
            unsubscribe();
            if (unsubEvent) unsubEvent();
        };
    }, [eventId]);

    if (!event) return <div className="app-root" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Lade...</div>;

    const top3 = participants.slice(0, 3);
    const rest = participants.slice(3);

    return (
        <div className="app-root" style={{ height: '100vh', overflow: 'hidden', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <BroadcastReceiver eventData={event} />
            {/* BACKGROUND OVERLAY */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 163, 0.05) 0%, transparent 70%)', zIndex: -1 }}></div>

            {/* HEADER */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '3rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}><span style={{ color: 'var(--accent-primary)' }}>Live</span> Schießstand</h1>
                    <div style={{ opacity: 0.6, fontSize: '1.2rem' }}>{event.title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Teilnehmer: {participants.length}</div>
                </div>
            </header>

            {/* BANNER */}
            {showBanner && (
                <div className="glass" style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    zIndex: 100, background: 'rgba(0,0,0,0.9)', border: '2px solid var(--accent-gold)',
                    padding: '3rem', fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-gold)',
                    boxShadow: '0 0 100px rgba(251, 191, 36, 0.4)', borderRadius: '30px',
                    textAlign: 'center', minWidth: '600px',
                    animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    {showBanner}
                </div>
            )}

            {/* CONTENT GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', flex: 1, overflow: 'hidden' }}>

                {/* LEFT: PODIUM (Top 3) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', paddingLeft: '1rem' }}>
                    {top3.map((p, index) => {
                        let color = 'var(--glass-border)';
                        let scale = 1;
                        let crown = null;

                        if (index === 0) { color = '#fbbf24'; scale = 1.05; crown = '👑'; } // Gold, slightly reduced scale to fix cutoff
                        if (index === 1) { color = '#94a3b8'; scale = 1.0; } // Silver
                        if (index === 2) { color = '#b45309'; scale = 0.95; } // Bronze

                        return (
                            <div key={p.id} className="glass" style={{
                                display: 'flex', alignItems: 'center', padding: '1.5rem',
                                border: `2px solid ${color}`, transform: `scale(${scale})`, transformOrigin: 'left center', // Fix cutoff by scaling from left
                                boxShadow: index === 0 ? '0 0 30px rgba(251, 191, 36, 0.2)' : 'none',
                                position: 'relative', background: index === 0 ? 'rgba(251, 191, 36, 0.05)' : 'var(--glass-bg)',
                                marginLeft: index === 0 ? '1rem' : '0'
                            }}>
                                <div style={{
                                    fontSize: '3rem', fontWeight: 'bold', color: color, width: '60px',
                                    display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: '10px'
                                }}>
                                    {index + 1}.
                                    {p.image && <img src={p.image} alt={p.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}` }} />}
                                </div>
                                <div style={{ flex: 1, paddingLeft: '2rem' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: 1 }}>{p.name} {crown}</div>
                                    <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem', opacity: 0.7, fontSize: '1.2rem' }}>
                                        <span>Runde 1: <strong>{(p.round1 || []).reduce((a, b) => a + (b || 0), 0)}</strong></span>
                                        <span>Runde 2: <strong>{(p.round2 || []).reduce((a, b) => a + (b || 0), 0)}</strong></span>
                                    </div>
                                </div>
                                <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                                    {getScore(p)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* RIGHT: LIST (Rest) */}
                <div className="glass" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', fontSize: '1.2rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.02)' }}>
                        Verfolgerfeld
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
                        {rest.length === 0 ? (
                            <div style={{ opacity: 0.3, textAlign: 'center', marginTop: '2rem' }}>Noch keine weiteren Teilnehmer.</div>
                        ) : (
                            rest.map((p, index) => (
                                <div key={p.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '1rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    fontSize: '1.2rem'
                                }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <span style={{ opacity: 0.5, width: '30px' }}>{index + 4}.</span>
                                        {p.image && <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />}
                                        <strong>{p.name}</strong>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                                        {getScore(p)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes popIn {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
