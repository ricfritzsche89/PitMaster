import React from 'react';

export default function AdminEventDetailAwarding({ localEvent, participants, setWinnerModal, setWinnerPhoto }) {
    return (
        <div className="glass" style={{ padding: '0', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', background: 'linear-gradient(90deg, rgba(234, 179, 8, 0.1), transparent)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>🏆 Siegerehrung & Urkunden</h3>
                <select
                    style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '5px', borderRadius: '5px' }}
                    id="certificateThemeSelector"
                    defaultValue="classic"
                >
                    <option value="classic">🏛️ Klassisch</option>
                    <option value="western">🤠 Western</option>
                    <option value="bbq">🥩 BBQ Master</option>
                </select>
            </div>

            <div style={{ padding: '1rem' }}>
                {/* TOP 3 */}
                {participants.sort((a, b) => {
                    const sA = (a.round1 || []).reduce((x, y) => x + y, 0) + (a.round2 || []).reduce((x, y) => x + y, 0);
                    const sB = (b.round1 || []).reduce((x, y) => x + y, 0) + (b.round2 || []).reduce((x, y) => x + y, 0);
                    return sB - sA;
                }).slice(0, 3).map((p, i) => (
                    <div key={p.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: i === 0 ? '1px solid var(--accent-gold)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ fontSize: '2rem' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{p.name}</div>
                                <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                                    {i + 1}. Platz • {(p.round1 || []).reduce((x, y) => x + y, 0) + (p.round2 || []).reduce((x, y) => x + y, 0)} Punkte
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    const theme = document.getElementById('certificateThemeSelector').value;
                                    import('../services/certificate').then(mod => {
                                        mod.generateCertificate(localEvent, p, `${i + 1}. Platz`, 'winner', theme);
                                    });
                                }}
                                style={{ fontSize: '0.8rem', padding: '8px 16px', whiteSpace: 'nowrap' }}
                            >
                                📄 Urkunde
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    const theme = document.getElementById('certificateThemeSelector').value;
                                    setWinnerModal({ open: true, participant: p, rank: `${i + 1}. Platz`, type: 'winner', theme });
                                    setWinnerPhoto(null);
                                }}
                                style={{ fontSize: '0.8rem', padding: '8px 16px', whiteSpace: 'nowrap' }}
                            >
                                📸 Karte
                            </button>
                        </div>
                    </div>
                ))}

                {/* LOSER (LAST PLACE) */}
                {participants.length > 3 && (
                    <>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }}></div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontSize: '2rem' }}>🩹</div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                        {participants.sort((a, b) => {
                                            const sA = (a.round1 || []).reduce((x, y) => x + y, 0) + (a.round2 || []).reduce((x, y) => x + y, 0);
                                            const sB = (b.round1 || []).reduce((x, y) => x + y, 0) + (b.round2 || []).reduce((x, y) => x + y, 0);
                                            return sB - sA;
                                        })[participants.length - 1].name}
                                    </div>
                                    <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                                        Letzter Platz (Trostpreis)
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        const theme = document.getElementById('certificateThemeSelector').value;
                                        const loser = participants.sort((a, b) => {
                                            const sA = (a.round1 || []).reduce((x, y) => x + y, 0) + (a.round2 || []).reduce((x, y) => x + y, 0);
                                            const sB = (b.round1 || []).reduce((x, y) => x + y, 0) + (b.round2 || []).reduce((x, y) => x + y, 0);
                                            return sB - sA;
                                        })[participants.length - 1];
                                        import('../services/certificate').then(mod => {
                                            mod.generateCertificate(localEvent, loser, "Teilnehmer der Herzen", 'loser', theme);
                                        });
                                    }}
                                    style={{ fontSize: '0.8rem', padding: '8px 16px', whiteSpace: 'nowrap' }}
                                >
                                    📄 Trost-Urkunde
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        const theme = document.getElementById('certificateThemeSelector').value;
                                        const loser = participants.sort((a, b) => {
                                            const sA = (a.round1 || []).reduce((x, y) => x + y, 0) + (a.round2 || []).reduce((x, y) => x + y, 0);
                                            const sB = (b.round1 || []).reduce((x, y) => x + y, 0) + (b.round2 || []).reduce((x, y) => x + y, 0);
                                            return sB - sA;
                                        })[participants.length - 1];
                                        setWinnerModal({ open: true, participant: loser, rank: "Teilnehmer der Herzen", type: 'loser', theme });
                                        setWinnerPhoto(null);
                                    }}
                                    style={{ fontSize: '0.8rem', padding: '8px 16px', whiteSpace: 'nowrap' }}
                                >
                                    📸 Karte
                                </button>
                            </div>
                        </div>
                    </>
                )
                }
            </div >
        </div >
    );
}
