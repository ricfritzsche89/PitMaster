import React, { useEffect, useState } from 'react';
import { getHallOfFameEntries } from '../services/db';

export default function HallOfFame() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getHallOfFameEntries(50).then(data => {
            setEntries(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>Lade Ruhmeshalle...</div>;

    return (
        <div className="animate-fade-in" style={{ padding: '1rem' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {entries.map(entry => (
                    <div key={entry.id} className="glass" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
                        <img
                            src={entry.imageData}
                            alt={entry.participantName}
                            style={{ width: '100%', display: 'block', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                        />
                        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent-gold)' }}>
                                    {entry.participantName}
                                </div>
                                <div style={{ fontSize: '0.9rem', padding: '2px 8px', borderRadius: '4px', background: entry.type === 'winner' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.1)', color: entry.type === 'winner' ? 'var(--accent-gold)' : 'inherit' }}>
                                    {entry.rank}
                                </div>
                            </div>
                            <div style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                {entry.eventName}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', opacity: 0.5, fontSize: '0.8rem' }}>
                                <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                                <span>{entry.theme} Theme</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {entries.length === 0 && (
                <div style={{ textAlign: 'center', opacity: 0.5, padding: '4rem', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                    <h3>Die Hall of Fame ist noch leer.</h3>
                    <p>Führe ein Event durch und ehre die Gewinner!</p>
                </div>
            )}
        </div>
    );
}
