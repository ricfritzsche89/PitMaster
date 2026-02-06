import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscribeToEvent, subscribeToParticipants, updateParticipant, updateEvent } from '../services/db';

export default function ShootingRemote() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [selectedParticipantId, setSelectedParticipantId] = useState('');
    const [activeRound, setActiveRound] = useState(1);
    const [scores, setScores] = useState([null, null, null, null, null]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const unsubEvent = subscribeToEvent(eventId, setEvent);
        const unsubParts = subscribeToParticipants(eventId, (data) => {
            setParticipants(data.sort((a, b) => a.name.localeCompare(b.name)));
        });
        return () => {
            unsubEvent();
            unsubParts();
        };
    }, [eventId]);

    // Handle Active Shooter State in DB (Controls Camera on TV)
    useEffect(() => {
        if (!eventId) return;

        // When selection changes, update the DB
        updateEvent(eventId, {
            "shooting.activeShooterId": selectedParticipantId || null
        }).catch(err => console.error("Failed to update active shooter", err));

        // Cleanup on unmount (only if this component was the one setting it)
        return () => {
            // Optional: We might not want to clear on unmount if we just navigate away briefly,
            // but for now, let's keep it simple. If we leave remote, we probably stop shooting.
            // However, to be safe against race conditions, we can skip cleanup or do it carefully.
            // Let's rely on explicit deselection for now or a timeout in the view.
        };
    }, [selectedParticipantId, eventId]);

    // Load existing scores when participant/round changes
    useEffect(() => {
        if (selectedParticipantId) {
            const p = participants.find(p => p.id === selectedParticipantId);
            if (p) {
                const existingScores = activeRound === 1 ? p.round1 : p.round2;
                setScores(existingScores || [null, null, null, null, null]);
            }
        } else {
            setScores([null, null, null, null, null]);
        }
    }, [selectedParticipantId, activeRound, participants]);

    const handleScoreChange = (index, value) => {
        const newScores = [...scores];
        newScores[index] = value === '' ? null : parseInt(value);
        setScores(newScores);
    };

    const handleSave = async () => {
        if (!selectedParticipantId) return;
        setSaving(true);
        try {
            const update = activeRound === 1 ? { round1: scores } : { round2: scores };
            await updateParticipant(eventId, selectedParticipantId, update);

            // Clear selection to turn off camera
            setSelectedParticipantId('');

            alert(`✅ Runde ${activeRound} gespeichert!`);
        } catch (err) {
            alert("Fehler: " + err.message);
        }
        setSaving(false);
    };

    if (!event) return <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Lade Event...</div>;

    const currentTotal = scores.reduce((a, b) => a + (b || 0), 0);

    // -- STYLES --
    const containerStyle = {
        minHeight: '100vh',
        background: '#020617', // Slate 950
        color: 'white',
        padding: '1rem',
        paddingBottom: '5rem',
        fontFamily: 'Outfit, sans-serif'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '1rem'
    };

    const roundButtonStyle = (isActive) => ({
        padding: '1rem',
        borderRadius: '12px',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        border: isActive ? '2px solid #34d399' : '1px solid rgba(255,255,255,0.2)',
        background: isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.5)',
        color: isActive ? '#34d399' : '#94a3b8',
        cursor: 'pointer',
        transition: 'all 0.2s',
        flex: 1,
        textAlign: 'center',
        boxShadow: isActive ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none'
    });

    const scoreInputStyle = {
        width: '100%',
        aspectRatio: '1',
        background: '#1e293b',
        border: '2px solid #475569',
        borderRadius: '12px',
        fontSize: '2rem',
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        outline: 'none',
        transition: 'all 0.2s'
    };

    const saveButtonStyle = {
        width: '100%',
        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        color: 'white',
        border: 'none',
        padding: '1.5rem',
        borderRadius: '16px',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        cursor: saving ? 'not-allowed' : 'pointer',
        boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
        marginTop: '2rem',
        opacity: saving ? 0.7 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem'
    };

    return (
        <div style={containerStyle}>
            {/* HEADER */}
            <div style={headerStyle}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '1px' }}>🎯 Remote</h1>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{event.title}</div>
                </div>
                <div style={{ background: '#1e293b', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #334155', fontWeight: 'bold' }}>
                    R{activeRound}
                </div>
            </div>

            {/* PARTICIPANT SELECTOR */}
            <div style={{ marginBottom: '2rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Schütze auswählen</label>
                    {selectedParticipantId && (
                        <div className="animate-pulse" style={{ color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                            <span>🔴</span> LIVE AM TV
                        </div>
                    )}
                </div>
                <select
                    style={{
                        width: '100%',
                        background: '#1e293b',
                        border: '2px solid #334155',
                        borderRadius: '12px',
                        padding: '1rem',
                        fontSize: '1.2rem',
                        color: 'white',
                        outline: 'none',
                        appearance: 'none',
                        backgroundImage: 'none' // We'll add a custom arrow or just let standard UI render if simplest
                    }}
                    value={selectedParticipantId}
                    onChange={(e) => setSelectedParticipantId(e.target.value)}
                >
                    <option value="">-- Bitte wählen --</option>
                    {participants.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name} ({(p.round1?.reduce((a, b) => a + (b || 0), 0) || 0) + (p.round2?.reduce((a, b) => a + (b || 0), 0) || 0)})
                        </option>
                    ))}
                </select>
                {/* Custom arrow overlay */}
                <div style={{ position: 'absolute', right: '1rem', bottom: '1.2rem', pointerEvents: 'none', color: '#94a3b8' }}>▼</div>
            </div>

            {selectedParticipantId && (
                <div className="animate-fade-in">
                    {/* ROUND TOGGLE */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <button onClick={() => setActiveRound(1)} style={roundButtonStyle(activeRound === 1)}>
                            Runde 1
                        </button>
                        <button onClick={() => setActiveRound(2)} style={roundButtonStyle(activeRound === 2)}>
                            Runde 2
                        </button>
                    </div>

                    {/* SCORE INPUTS */}
                    <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                            <label style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Ergebnisse (5 Schuss)</label>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#34d399', textShadow: '0 0 10px rgba(52,211,153,0.3)' }}>
                                Summe: {currentTotal}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                            {scores.map((score, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>#{i + 1}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="12"
                                        value={score ?? ''}
                                        placeholder="-"
                                        onChange={(e) => handleScoreChange(i, e.target.value)}
                                        style={scoreInputStyle}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#34d399';
                                            e.target.style.boxShadow = '0 0 15px rgba(52, 211, 153, 0.3)';
                                            e.target.style.background = '#0f172a';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#475569';
                                            e.target.style.boxShadow = 'none';
                                            e.target.style.background = '#1e293b';
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <button style={saveButtonStyle} onClick={handleSave} disabled={saving}>
                        <span style={{ fontSize: '1.8rem' }}>💾</span>
                        {saving ? 'SPEICHERT...' : 'SPEICHERN'}
                    </button>

                    <button
                        onClick={() => { if (window.confirm("Zurück zur Übersicht?")) navigate('/'); }}
                        style={{ background: 'none', border: 'none', width: '100%', padding: '1rem', marginTop: '1rem', color: '#64748b', cursor: 'pointer' }}
                    >
                        Zurück zum Menu
                    </button>
                </div>
            )}
        </div>
    );
}
