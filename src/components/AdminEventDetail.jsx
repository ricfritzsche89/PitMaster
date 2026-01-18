import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { updateEvent, subscribeToEvent, deleteEvent, subscribeToBets, deleteBet, subscribeToFeedback, subscribeToParticipants, addParticipant, updateParticipant, deleteParticipant } from '../services/db';
import { calculateOdds, calculatePayouts } from '../services/betting';
import { calculateFinancials, formatCurrency } from '../services/finance';
import { generateAiLogo } from '../services/ai';
import SimpleList from './SimpleList';
import QRCode from "react-qr-code";

export default function AdminEventDetail({ event, onBack, onUpdate }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [localEvent, setLocalEvent] = useState(event);
    const [financials, setFinancials] = useState(calculateFinancials(event));
    const [showQR, setShowQR] = useState(false);
    const [bets, setBets] = useState([]);
    const [currentOdds, setCurrentOdds] = useState({});
    const [feedback, setFeedback] = useState([]);
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        const unsubscribe = subscribeToParticipants(event.id, (data) => {
            setParticipants(data);
        });
        return () => unsubscribe();
    }, [event.id]);

    useEffect(() => {
        const unsubscribe = subscribeToFeedback(event.id, (data) => {
            setFeedback(data);
        });
        return () => unsubscribe();
    }, [event.id]);

    // Payout Preview State
    const [showPayoutPreview, setShowPayoutPreview] = useState(false);
    const [previewResults, setPreviewResults] = useState(null);
    const [previewPayouts, setPreviewPayouts] = useState([]);

    useEffect(() => {
        const unsubscribe = subscribeToBets(event.id, (newBets) => {
            setBets(newBets);
            if (event.guests) {
                setCurrentOdds(calculateOdds(newBets, event.guests));
            }
        });
        return () => unsubscribe();
    }, [event.id, event.guests]);

    useEffect(() => {
        setLocalEvent(event);
        setFinancials(calculateFinancials(event));
    }, [event]);

    // Handler for adding an expense
    const handleAddExpense = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newExpense = {
            id: Date.now().toString(),
            item: formData.get('item'),
            amount: parseFloat(formData.get('amount'))
        };

        const updatedExpenses = [...(localEvent.expenses || []), newExpense];
        const updatedData = { ...localEvent, expenses: updatedExpenses };

        // Optimistic update
        setLocalEvent(updatedData);
        setFinancials(calculateFinancials(updatedData));
        e.target.reset();

        await updateEvent(localEvent.id, { expenses: updatedExpenses });
        if (onUpdate) onUpdate();
    };

    if (!localEvent) return <div className="content-container">Lade Event...</div>;

    return (
        <div className="content-container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button onClick={onBack} className="btn-ghost">
                    ← Zurück
                </button>
                <button
                    onClick={async () => {
                        if (window.confirm("⚠️ Event wirklich unwiderruflich löschen?")) {
                            await deleteEvent(localEvent.id);
                            if (onUpdate) onUpdate(); // Refresh list
                            onBack(); // Go back
                        }
                    }}
                    style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    🗑️ Event löschen
                </button>
            </div>

            <div className="glass card">
                <h2 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    {localEvent.title} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>({activeTab.toUpperCase()})</span>
                </h2>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {['overview', 'finances', 'guests', 'betting', 'feedback', 'shooting', 'broadcast'].map(tab => {
                        let label = tab;
                        if (tab === 'overview') label = 'Übersicht';
                        if (tab === 'finances') label = 'Finanzen';
                        if (tab === 'guests') label = 'Gäste';
                        if (tab === 'betting') label = 'Wettbüro';
                        if (tab === 'feedback') label = 'Feedback';
                        if (tab === 'shooting') label = 'Schießstand';
                        if (tab === 'broadcast') label = '📣 TV-Broadcast';

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    background: activeTab === tab ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                                    border: 'none', padding: '8px 16px', borderRadius: '8px', color: 'white', cursor: 'pointer', flex: '1 0 auto'
                                }}
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>

                {/* OVERVIEW TAB (ÜBERSICHT) */}
                {activeTab === 'overview' && (
                    <div>
                        {/* Image & Basic Info */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                {localEvent.image ? (
                                    <div style={{ height: '150px', borderRadius: '12px', marginBottom: '0.5rem', backgroundImage: `url(${localEvent.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                                ) : (
                                    <div style={{ height: '150px', borderRadius: '12px', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Kein Bild</div>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <label className="btn-primary" style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', padding: '6px', cursor: 'pointer' }}>
                                        📷 Upload
                                        <input type="file" hidden accept="image/*" onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                if (file.size > 500000) { alert("Max 500KB!"); return; }
                                                const reader = new FileReader();
                                                reader.onloadend = async () => {
                                                    const updated = { ...localEvent, image: reader.result };
                                                    setLocalEvent(updated);
                                                    await updateEvent(localEvent.id, { image: reader.result });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }} />
                                    </label>
                                    <button
                                        className="btn-primary"
                                        style={{ flex: 1, fontSize: '0.8rem', padding: '6px', background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
                                        onClick={async (e) => {
                                            const btn = e.target;
                                            const originalText = btn.innerText;
                                            btn.innerText = "⏳...";
                                            btn.disabled = true;
                                            try {
                                                const aiImage = await generateAiLogo(localEvent.title);
                                                const updated = { ...localEvent, image: aiImage };
                                                setLocalEvent(updated);
                                                await updateEvent(localEvent.id, { image: aiImage });
                                            } catch (err) {
                                                alert("KI Fehler. Nochmal probieren.");
                                            }
                                            btn.innerText = originalText;
                                            btn.disabled = false;
                                        }}
                                    >
                                        ✨ KI Logo
                                    </button>
                                </div>
                            </div>

                            <div style={{ flex: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                <div className="glass" style={{ padding: '0.8rem', fontSize: '0.9rem' }}>
                                    <strong>📅 Datum:</strong><br />{localEvent.date ? localEvent.date.split('-').reverse().join('.') : ''} @ {localEvent.time}
                                </div>
                                <div className="glass" style={{ padding: '0.8rem', fontSize: '0.9rem' }}>
                                    <strong>📍 Ort:</strong><br />{localEvent.location}
                                </div>
                                <div className="glass" style={{ padding: '0.8rem', fontSize: '0.9rem' }}>
                                    <strong>🔖 Thema:</strong><br />{localEvent.theme || '-'}
                                </div>
                                <div className="glass" style={{ padding: '0.8rem', fontSize: '0.9rem' }}>
                                    <strong>📝 Infos:</strong><br />{localEvent.description}
                                </div>
                                <div className="glass" style={{ padding: '0.8rem', fontSize: '0.9rem', gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <strong>🔑 Admin PIN:</strong>
                                        <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', letterSpacing: '2px', color: 'var(--accent-primary)' }}>
                                            {localEvent.adminPin || <span style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '0.9rem' }}>Nicht gesetzt</span>}
                                        </div>
                                    </div>
                                    <button
                                        className="btn-primary"
                                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                                        onClick={async () => {
                                            const newPin = prompt("Neuen Admin-PIN eingeben (für Admin-Login auf anderen Geräten):", localEvent.adminPin || "");
                                            if (newPin !== null) {
                                                await updateEvent(localEvent.id, { adminPin: newPin });
                                                setLocalEvent({ ...localEvent, adminPin: newPin });
                                            }
                                        }}
                                    >
                                        ✏️ Ändern
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* PLANNING SECTION */}
                        <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>Planung & Orga</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                            {/* Todo List */}
                            <SimpleList
                                title="✅ To-Do Liste"
                                items={localEvent.todoList || []}
                                onItemAdd={async (text) => {
                                    const newList = [...(localEvent.todoList || []), { text, done: false }];
                                    setLocalEvent({ ...localEvent, todoList: newList });
                                    await updateEvent(localEvent.id, { todoList: newList });
                                }}
                                onItemToggle={async (idx) => {
                                    const newList = [...localEvent.todoList];
                                    newList[idx].done = !newList[idx].done;
                                    setLocalEvent({ ...localEvent, todoList: newList });
                                    await updateEvent(localEvent.id, { todoList: newList });
                                }}
                                onItemDelete={async (idx) => {
                                    const newList = localEvent.todoList.filter((_, i) => i !== idx);
                                    setLocalEvent({ ...localEvent, todoList: newList });
                                    await updateEvent(localEvent.id, { todoList: newList });
                                }}
                            />

                            {/* Shopping List */}
                            <SimpleList
                                title="🛒 Einkaufsliste"
                                items={localEvent.shoppingList || []}
                                placeholder="Was einkaufen?"
                                onItemAdd={async (text) => {
                                    const newList = [...(localEvent.shoppingList || []), { text, done: false }];
                                    setLocalEvent({ ...localEvent, shoppingList: newList });
                                    await updateEvent(localEvent.id, { shoppingList: newList });
                                }}
                                onItemToggle={async (idx) => {
                                    const newList = [...localEvent.shoppingList];
                                    newList[idx].done = !newList[idx].done;
                                    setLocalEvent({ ...localEvent, shoppingList: newList });
                                    await updateEvent(localEvent.id, { shoppingList: newList });
                                }}
                                onItemDelete={async (idx) => {
                                    const newList = localEvent.shoppingList.filter((_, i) => i !== idx);
                                    setLocalEvent({ ...localEvent, shoppingList: newList });
                                    await updateEvent(localEvent.id, { shoppingList: newList });
                                }}
                            />
                        </div>

                        {/* Bring List */}
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                            <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>🎁 Mitbring-Liste (Wer bringt was?)</h3>

                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1rem' }}>
                                {(localEvent.bringList || []).map((item, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' }}>
                                        <span>
                                            <strong style={{ color: 'var(--accent-primary)' }}>{item.guest}</strong> bringt <u>{item.item}</u>
                                            {item.note && <span style={{ opacity: 0.7, fontSize: '0.8rem' }}> ({item.note})</span>}
                                        </span>
                                        <button onClick={async () => {
                                            const newList = localEvent.bringList.filter((_, idx) => idx !== i);
                                            setLocalEvent({ ...localEvent, bringList: newList });
                                            await updateEvent(localEvent.id, { bringList: newList });
                                        }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>❌</button>
                                    </li>
                                ))}
                                {(localEvent.bringList || []).length === 0 && <li style={{ opacity: 0.5 }}>Noch keine Einträge.</li>}
                            </ul>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.target);
                                const guest = fd.get('guest');
                                const item = fd.get('item');
                                const note = fd.get('note');
                                if (!guest || !item) return;

                                const newItem = { guest, item, note };
                                const newList = [...(localEvent.bringList || []), newItem];
                                setLocalEvent({ ...localEvent, bringList: newList });
                                await updateEvent(localEvent.id, { bringList: newList });
                                e.target.reset();
                            }} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <select name="guest" required className="input-field" style={{ marginBottom: 0, width: 'auto', minWidth: '120px' }}>
                                    <option value="">Gast wählen...</option>
                                    <option value="Admin">Admin (Ich)</option>
                                    {localEvent.guests?.map((g, i) => <option key={i} value={g.name}>{g.name}</option>)}
                                </select>
                                <input name="item" required placeholder="Was? (z.B. Salat)" className="input-field" style={{ marginBottom: 0, flex: 1 }} />
                                <input name="note" placeholder="Notiz" className="input-field" style={{ marginBottom: 0, flex: 1 }} />
                                <button type="submit" className="btn-primary">+</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* FINANCES TAB */}
                {activeTab === 'finances' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Gesamtkosten</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: financials.isOverBudget ? 'var(--accent-danger)' : '#fff' }}>
                                    {formatCurrency(financials.totalExpenses)}
                                </div>
                                {financials.isOverBudget && <small style={{ color: 'var(--accent-danger)' }}>⚠️ Über Budget!</small>}
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Kosten pro Kopf</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: financials.isHighCost ? 'var(--accent-gold)' : '#fff' }}>
                                    {formatCurrency(financials.costPerGuest)}
                                </div>
                                {financials.isHighCost && <small style={{ color: 'var(--accent-gold)' }}>⚠️ &gt; 25€ p.P.</small>}
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Bestätigte Gäste</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{financials.confirmedCount}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <label>Dein Aufschlag (Gewinn): <strong>{localEvent.hostMarkup ?? 0}%</strong></label>
                                <span style={{ color: 'var(--accent-success)' }}>+{formatCurrency((financials.totalExpenses || 0) * ((localEvent.hostMarkup || 0) / 100))}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                step="1"
                                value={localEvent.hostMarkup ?? 0}
                                onChange={async (e) => {
                                    const val = parseInt(e.target.value);
                                    const updatedData = { ...localEvent, hostMarkup: val };
                                    setLocalEvent(updatedData);
                                    setFinancials(calculateFinancials(updatedData));
                                    await updateEvent(localEvent.id, { hostMarkup: val });
                                }}
                                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                            />
                            <small style={{ opacity: 0.7 }}>
                                Erhöht den Preis pro Kopf. Der Überschuss gehört dir.
                            </small>
                        </div>



                        <h3>Ausgaben hinzufügen</h3>
                        <form onSubmit={handleAddExpense} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                            <input name="item" required placeholder="Posten (z.B. Bier)" className="input-field" style={{ marginBottom: 0, flex: '2 1 200px' }} />
                            <input name="amount" required type="number" step="0.01" placeholder="€" className="input-field" style={{ marginBottom: 0, flex: '1 1 100px' }} />
                            <button type="submit" className="btn-primary" style={{ flex: '0 0 auto' }}>+</button>
                        </form>

                        <h3>Ausgabenliste</h3>
                        {(!localEvent.expenses || localEvent.expenses.length === 0) && <p style={{ opacity: 0.5 }}>Keine Ausgaben eingetragen.</p>}
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {localEvent.expenses && localEvent.expenses.map((exp, i) => (
                                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                    <span>{exp.item}</span>
                                    <span>{formatCurrency(exp.amount)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* GUESTS TAB */}
                {activeTab === 'guests' && (
                    <div>
                        <h3>Gästeliste ({localEvent.guests?.length || 0})</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                        <th style={{ padding: '0.5rem' }}>Name</th>
                                        <th>Status</th>
                                        <th>Bezahlt?</th>
                                        <th>Aktion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {localEvent.guests && localEvent.guests.map((g, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '0.5rem' }}>
                                                {g.name}
                                                {g.participatesInCompetition && (
                                                    <span title="Nimmt am Schießwettbewerb teil" style={{ marginLeft: '8px', cursor: 'help' }}>🎯</span>
                                                )}
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem',
                                                    background: g.status === 'accepted' ? 'rgba(34, 197, 94, 0.2)' : g.status === 'declined' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                                                    color: g.status === 'accepted' ? 'var(--accent-success)' : g.status === 'declined' ? 'var(--accent-danger)' : 'var(--accent-gold)'
                                                }}>
                                                    {g.status === 'accepted' ? 'Zusage' : g.status === 'declined' ? 'Absage' : 'Vielleicht'}
                                                </span>
                                            </td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={g.hasPaid || false}
                                                    onChange={async () => {
                                                        const updatedGuests = [...localEvent.guests];
                                                        updatedGuests[i] = { ...updatedGuests[i], hasPaid: !updatedGuests[i].hasPaid };
                                                        const updatedData = { ...localEvent, guests: updatedGuests };

                                                        setLocalEvent(updatedData);
                                                        setFinancials(calculateFinancials(updatedData));
                                                        await updateEvent(localEvent.id, { guests: updatedGuests });
                                                    }}
                                                    style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    onClick={async () => {
                                                        if (!window.confirm(`${g.name} wirklich entfernen?`)) return;

                                                        const updatedGuests = localEvent.guests.filter((_, idx) => idx !== i);
                                                        const updatedData = { ...localEvent, guests: updatedGuests };

                                                        setLocalEvent(updatedData);
                                                        setFinancials(calculateFinancials(updatedData));
                                                        await updateEvent(localEvent.id, { guests: updatedGuests });
                                                    }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                                    title="Gast entfernen"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* BETTING TAB (WETTBÜRO) - ADMIN */}
                {activeTab === 'betting' && (
                    <div>
                        {/* 1. COMPACT TOOLBAR (Status + Actions) */}
                        <div className="glass" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.4)', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🎰 Wettbüro</h3>
                                <span style={{
                                    padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid currentColor',
                                    color: localEvent.bettingStatus === 'open' ? 'var(--accent-success)' : localEvent.bettingStatus === 'finished' ? 'var(--accent-secondary)' : 'var(--accent-danger)'
                                }}>
                                    {localEvent.bettingStatus === 'open' ? '🟢 GEÖFFNET' : localEvent.bettingStatus === 'finished' ? '🏁 BEENDET' : '🔴 GESCHLOSSEN'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="btn-ghost"
                                    onClick={() => setShowQR(true)}
                                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                                >
                                    📱 QR Code
                                </button>

                                {localEvent.bettingStatus !== 'open' && localEvent.bettingStatus !== 'finished' && (
                                    <button
                                        className="btn-primary"
                                        onClick={async () => {
                                            await updateEvent(localEvent.id, { bettingStatus: 'open' });
                                            setLocalEvent({ ...localEvent, bettingStatus: 'open' });
                                        }}
                                        style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                                    >
                                        🔔 Öffnen
                                    </button>
                                )}
                                {localEvent.bettingStatus === 'open' && (
                                    <button
                                        className="btn-primary"
                                        style={{ background: 'linear-gradient(135deg, #ef4444, #991b1b)', padding: '8px 16px', fontSize: '0.8rem' }}
                                        onClick={async () => {
                                            await updateEvent(localEvent.id, { bettingStatus: 'closed' });
                                            setLocalEvent({ ...localEvent, bettingStatus: 'closed' });
                                        }}
                                    >
                                        ⛔ Schließen
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* QR CODE MODAL OVERLAY */}
                        {showQR && createPortal(
                            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <h2 style={{ color: 'white', marginBottom: '2rem' }}>Wettbüro Zugang</h2>
                                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px' }}>
                                    <QRCode
                                        size={300}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        value={`https://ricfritzsche89.github.io/PitMaster/#/betting/${localEvent.id}`}
                                    />
                                </div>
                                <p style={{ color: 'white', marginTop: '1rem', fontSize: '1.2rem' }}>Scanne mich!</p>
                                <button
                                    onClick={() => setShowQR(false)}
                                    className="btn-ghost"
                                    style={{ marginTop: '2rem', fontSize: '1.2rem', padding: '12px 32px' }}
                                >
                                    Schließen
                                </button>
                            </div>,
                            document.body
                        )}

                        {/* 2. MAIN CONTENT GRID (Table is primary) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            {/* 1. TOP: ENHANCED BET LIST TABLE (Full Width) */}
                            <div className="glass" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Live Wetteinsätze</h3>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{bets.length} Wetten aktiv</span>
                                </div>

                                <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '600px' }}>
                                        <thead style={{ background: 'rgba(0,0,0,0.8)', position: 'sticky', top: 0, zIndex: 5 }}>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', opacity: 0.8 }}>Zeit</th>
                                                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', opacity: 0.8 }}>Spieler</th>
                                                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', opacity: 0.8 }}>Wette</th>
                                                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: '600', opacity: 0.8 }}>Einsatz</th>
                                                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: '600', opacity: 0.8 }}>Mögl. Gewinn</th>
                                                <th style={{ width: '60px', padding: '12px 4px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bets.map((bet, i) => {
                                                const oddKey = `${bet.type}_${bet.target}`;
                                                const currentProbableOdd = currentOdds ? (currentOdds[oddKey] || 1.0) : 1.0;
                                                const potentialWin = bet.amount * currentProbableOdd;

                                                // Format Time
                                                const timeStr = bet.timestamp ? new Date(bet.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';

                                                return (
                                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '12px 16px', opacity: 0.5, fontSize: '0.8rem' }}>{timeStr}</td>
                                                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>{bet.user}</td>
                                                        <td style={{ padding: '12px 16px' }}>
                                                            <span style={{
                                                                background: bet.type === 'winner' ? 'rgba(234, 180, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                                color: bet.type === 'winner' ? 'var(--accent-gold)' : 'var(--accent-danger)',
                                                                padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', marginRight: '8px', fontWeight: 'bold'
                                                            }}>
                                                                {bet.type === 'winner' ? 'SIEG' : 'VERLIERER'}
                                                            </span>
                                                            {bet.target}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>{formatCurrency(bet.amount)}</td>
                                                        <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                                                            {formatCurrency(potentialWin)}
                                                            <span style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', fontWeight: 'normal' }}>
                                                                (@ {currentProbableOdd.toFixed(2)})
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px 4px', textAlign: 'center' }}>
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm(`Wette von ${bet.user} wirklich löschen?`)) {
                                                                        await deleteBet(localEvent.id, bet.id);
                                                                    }
                                                                }}
                                                                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', minWidth: '32px' }}
                                                                title="Wette löschen"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {bets.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', opacity: 0.4 }}>
                                                        Noch keine Wetten eingegangen.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                                <td colSpan="2" style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Gesamt:</td>
                                                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                                                    {formatCurrency(bets.reduce((sum, b) => sum + b.amount, 0))}
                                                </td>
                                                <td colSpan="3"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* 2. BOTTOM: RESULTS FORM (Compact Toolbar) */}
                            <div className="glass" style={{ padding: '1rem', position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>🏁 Ergebniseingabe</h3>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>(für Auszahlung)</span>
                                </div>

                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const fd = new FormData(e.target);
                                    const results = {
                                        winner: fd.get('winner'),
                                        loser: fd.get('loser')
                                    };

                                    // Calculate Preview
                                    const formattingOdds = currentOdds;
                                    const estimatedPayouts = calculatePayouts(bets, results, formattingOdds);

                                    setPreviewResults(results);
                                    setPreviewPayouts(estimatedPayouts);
                                    setShowPayoutPreview(true);
                                }}
                                    style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'end' }}
                                >
                                    <div style={{ flex: '1 1 200px' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.2rem', opacity: 0.7 }}>🏆 Sieger</label>
                                        <select name="winner" className="input-field" style={{ padding: '8px', fontSize: '0.9rem', width: '100%' }} required>
                                            <option value="">Wählen...</option>
                                            {localEvent.guests?.filter(g => g.status === 'accepted').map(g => (
                                                <option key={g.name} value={g.name}>{g.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ flex: '1 1 200px' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.2rem', opacity: 0.7 }}>💩 Verlierer</label>
                                        <select name="loser" className="input-field" style={{ padding: '8px', fontSize: '0.9rem', width: '100%' }} required>
                                            <option value="">Wählen...</option>
                                            {localEvent.guests?.filter(g => g.status === 'accepted').map(g => (
                                                <option key={g.name} value={g.name}>{g.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button type="submit" className="btn-primary" style={{ padding: '8px 16px', height: '38px', whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                                        💾 Auswerten
                                    </button>
                                </form>

                                {/* PREVIEW MODAL (Absolute Overlay within this card) */}
                                {showPayoutPreview && (
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#09090b', borderRadius: '12px', padding: '1rem', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid var(--accent-primary)', paddingBottom: '0.5rem' }}>💰 Payout Vorschau</h4>

                                        <div style={{ flex: 1, overflowY: 'auto', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                            {previewPayouts.length === 0 ? (
                                                <p style={{ opacity: 0.7 }}>Keine Gewinner. Das Haus gewinnt alles! 🏦</p>
                                            ) : (
                                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                                    {previewPayouts.map((p, i) => (
                                                        <li key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                                                            <span><strong>{p.user}</strong> ({p.type === 'winner' ? 'Sieg' : 'Verl.'})</span>
                                                            <span style={{ color: 'var(--accent-primary)' }}>+{formatCurrency(p.amount)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            <div style={{ marginTop: '1rem', fontWeight: 'bold', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                                Gesamt: {formatCurrency(previewPayouts.reduce((s, p) => s + p.amount, 0))}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-ghost" onClick={() => setShowPayoutPreview(false)} style={{ flex: 1, fontSize: '0.8rem' }}>Zurück</button>
                                            <button className="btn-primary" onClick={async () => {
                                                await updateEvent(localEvent.id, { bettingResults: previewResults, bettingStatus: 'finished' });
                                                setLocalEvent({ ...localEvent, bettingResults: previewResults, bettingStatus: 'finished' });
                                                setShowPayoutPreview(false);
                                                alert("Ergebnisse gespeichert und veröffentlicht!");
                                            }} style={{ flex: 1, fontSize: '0.8rem' }}>Bestätigen</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* FEEDBACK TAB */}
                {activeTab === 'feedback' && (
                    <div className="animate-fade-in">
                        {/* HEADER & LINK */}
                        <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
                            <h3 style={{ marginTop: 0 }}>Gäste Feedback 💬</h3>
                            <p style={{ opacity: 0.7, marginBottom: '2rem' }}>
                                Teile diesen Link mit deinen Gästen, um anonymes Feedback zu erhalten.
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                                <code style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px', fontFamily: 'monospace' }}>
                                    {window.location.host}/#/feedback/{localEvent.id}
                                </code>
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}#/feedback/${localEvent.id}`;
                                        navigator.clipboard.writeText(url);
                                        alert("Link kopiert! 📋");
                                    }}
                                >
                                    📋 Link kopieren
                                </button>
                            </div>
                        </div>

                        {/* STATS */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍔</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{feedback.length ? (feedback.reduce((a, b) => a + b.rating_food, 0) / feedback.length).toFixed(1) : '-'}</div>
                                <div style={{ opacity: 0.6, fontSize: '0.8rem' }}>Ø Essen</div>
                            </div>
                            <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{feedback.length ? (feedback.reduce((a, b) => a + b.rating_vibes, 0) / feedback.length).toFixed(1) : '-'}</div>
                                <div style={{ opacity: 0.6, fontSize: '0.8rem' }}>Ø Stimmung</div>
                            </div>
                            <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎵</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{feedback.length ? (feedback.reduce((a, b) => a + b.rating_music, 0) / feedback.length).toFixed(1) : '-'}</div>
                                <div style={{ opacity: 0.6, fontSize: '0.8rem' }}>Ø Musik</div>
                            </div>
                            <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{feedback.length}</div>
                                <div style={{ opacity: 0.6, fontSize: '0.8rem' }}>Feedbacks</div>
                            </div>
                        </div>

                        {/* LIST */}
                        <div className="glass" style={{ padding: '0' }}>
                            <h3 style={{ padding: '1.5rem', margin: 0, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Kommentare</h3>
                            {feedback.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>Noch kein Feedback vorhanden.</div>
                            ) : (
                                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                    {feedback.sort((a, b) => b.timestamp - a.timestamp).map(f => (
                                        <div key={f.id} style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', opacity: 0.6, fontSize: '0.8rem' }}>
                                                <span>{new Date(f.timestamp).toLocaleString()}</span>
                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <span>🍔 {f.rating_food}</span>
                                                    <span>✨ {f.rating_vibes}</span>
                                                    <span>🎵 {f.rating_music}</span>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '1rem', lineHeight: '1.5', fontStyle: f.comment ? 'normal' : 'italic', opacity: f.comment ? 1 : 0.4 }}>
                                                {f.comment || "Kein Text-Kommentar."}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* SHOOTING TAB */}
                {activeTab === 'shooting' && (
                    <div className="animate-fade-in">
                        {/* HEADER & LINK */}
                        <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
                            <h3 style={{ marginTop: 0 }}>🔫 Live Schießstand (Party Mode)</h3>
                            <p style={{ opacity: 0.7, marginBottom: '2rem' }}>
                            </p>
                        </div>

                        {/* AWARDING SECTION */}
                        <div className="glass" style={{ padding: '0', marginBottom: '2rem' }}>
                            <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', background: 'linear-gradient(90deg, rgba(234, 179, 8, 0.1), transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: i === 0 ? '1px solid var(--accent-gold)' : 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ fontSize: '2rem' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{p.name}</div>
                                                <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                                                    {i + 1}. Platz • {(p.round1 || []).reduce((x, y) => x + y, 0) + (p.round2 || []).reduce((x, y) => x + y, 0)} Punkte
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="btn-primary"
                                            onClick={() => {
                                                const theme = document.getElementById('certificateThemeSelector').value;
                                                import('../services/certificate').then(mod => {
                                                    mod.generateCertificate(localEvent, p, `${i + 1}. Platz`, 'winner', theme);
                                                });
                                            }}
                                            style={{ fontSize: '0.8rem', padding: '8px 16px' }}
                                        >
                                            📄 Urkunde
                                        </button>
                                    </div>
                                ))}

                                {/* LOSER (LAST PLACE) */}
                                {participants.length > 3 && (
                                    <>
                                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }}></div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
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
                                                style={{ fontSize: '0.8rem', padding: '8px 16px', background: '#78350f' }}
                                            >
                                                📄 Trost-Urkunde
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Existing content continues... */}


                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                            <code style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px', fontFamily: 'monospace' }}>
                                {window.location.host}/#/party/{localEvent.id}/shooting
                            </code>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}#/party/${localEvent.id}/shooting`;
                                    window.open(url, '_blank');
                                }}
                            >
                                📺 TV-View öffnen
                            </button>
                        </div>


                        {/* ADD PARTICIPANT */}
                        <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
                            <h3 style={{ marginTop: 0 }}>Teilnehmer hinzufügen</h3>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const name = e.target.name.value;
                                const file = e.target.file.files[0];

                                if (name) {
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            const base64String = reader.result;
                                            addParticipant(localEvent.id, name, base64String);
                                            e.target.reset();
                                        };
                                        reader.readAsDataURL(file);
                                    } else {
                                        addParticipant(localEvent.id, name);
                                        e.target.reset();
                                    }
                                }
                            }} style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input name="name" className="input-field" placeholder="Name des Schützen" style={{ marginBottom: 0, flex: 1 }} />
                                    <input type="file" name="file" className="input-field" style={{ marginBottom: 0, flex: 1, padding: '10px' }} accept="image/*" />
                                </div>
                                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Hinzufügen</button>
                            </form>
                        </div>

                        {/* PARTICIPANT LIST & SCORES */}
                        <div className="glass" style={{ padding: '0' }}>
                            <h3 style={{ padding: '1.5rem', margin: 0, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Ergebnisse erfassen</h3>

                            {participants.sort((a, b) => a.timestamp - b.timestamp).map(p => (
                                <div key={p.id} style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{p.name}</div>
                                        <button
                                            onClick={() => { if (window.confirm('Löschen?')) deleteParticipant(localEvent.id, p.id); }}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.5 }}
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        {/* ROUND 1 */}
                                        <div>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>Runde 1</div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {(p.round1 || [null, null, null, null, null]).map((score, i) => (
                                                    <input
                                                        key={`r1-${i}`}
                                                        className="input-field"
                                                        style={{ width: '40px', padding: '5px', textAlign: 'center', marginBottom: 0 }}
                                                        value={score ?? ''}
                                                        placeholder="-"
                                                        type="number"
                                                        onChange={(e) => {
                                                            const val = e.target.value === '' ? null : parseInt(e.target.value);
                                                            const newR1 = [...(p.round1 || [null, null, null, null, null])];
                                                            newR1[i] = val;
                                                            updateParticipant(localEvent.id, p.id, { round1: newR1 });
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* ROUND 2 */}
                                        <div>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>Runde 2</div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {(p.round2 || [null, null, null, null, null]).map((score, i) => (
                                                    <input
                                                        key={`r2-${i}`}
                                                        className="input-field"
                                                        style={{ width: '40px', padding: '5px', textAlign: 'center', marginBottom: 0 }}
                                                        value={score ?? ''}
                                                        placeholder="-"
                                                        type="number"
                                                        onChange={(e) => {
                                                            const val = e.target.value === '' ? null : parseInt(e.target.value);
                                                            const newR2 = [...(p.round2 || [null, null, null, null, null])];
                                                            newR2[i] = val;
                                                            updateParticipant(localEvent.id, p.id, { round2: newR2 });
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {participants.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>Noch keine Teilnehmer.</div>}
                        </div>
                    </div>
                )}

                {/* BROADCAST TAB */}
                {activeTab === 'broadcast' && (
                    <div className="animate-fade-in">
                        <div className="glass" style={{ padding: '2rem' }}>
                            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                <h3 style={{ marginTop: 0 }}>📢 TV-Nachricht senden</h3>
                                <p style={{ opacity: 0.7 }}>
                                    Schicke Nachrichten direkt auf den Fernseher.
                                </p>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.target);
                                const message = fd.get('message');
                                const type = fd.get('type');
                                const speed = parseInt(fd.get('speed') || 5);

                                // Send to DB
                                await updateEvent(localEvent.id, {
                                    broadcast: {
                                        active: true,
                                        message,
                                        type,
                                        speed,
                                        timestamp: Date.now()
                                    }
                                });
                                setLocalEvent({ ...localEvent, broadcast: { active: true, message, type, speed, timestamp: Date.now() } });
                                alert("Nachricht gesendet!");
                            }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Deine Nachricht:</label>
                                    <textarea
                                        name="message"
                                        required
                                        className="input-field"
                                        placeholder="z.B. Das Buffet ist eröffnet! 🍖"
                                        style={{ width: '100%', minHeight: '100px', fontSize: '1.2rem', textAlign: 'center' }}
                                        defaultValue={localEvent.broadcast?.message || ''}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                    <label style={{
                                        cursor: 'pointer',
                                        padding: '1rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        textAlign: 'center'
                                    }}>
                                        <input type="radio" name="type" value="ticker" defaultChecked={localEvent.broadcast?.type !== 'overlay'} style={{ marginRight: '0.5rem' }} />
                                        <strong>Lauftext (Ticker)</strong>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>Dezent am unteren Rand</div>
                                    </label>

                                    <label style={{
                                        cursor: 'pointer',
                                        padding: '1rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        textAlign: 'center'
                                    }}>
                                        <input type="radio" name="type" value="overlay" defaultChecked={localEvent.broadcast?.type === 'overlay'} style={{ marginRight: '0.5rem' }} />
                                        <strong>Vollbild (Alarm)</strong>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>Unterbricht alles!</div>
                                    </label>
                                </div>

                                {/* SPEED SLIDER (Ticker Only) */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        Laufgeschwindigkeit: <strong>{localEvent.broadcast?.speed || 5}</strong>
                                    </label>
                                    <input
                                        type="range"
                                        name="speed"
                                        min="1"
                                        max="10"
                                        defaultValue={localEvent.broadcast?.speed || 5}
                                        style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.7 }}>
                                        <span>Langsam</span>
                                        <span>Schnell</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        className="btn-ghost"
                                        style={{ flex: 1, color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)' }}
                                        onClick={async () => {
                                            await updateEvent(localEvent.id, { broadcast: { active: false } });
                                            setLocalEvent({ ...localEvent, broadcast: { active: false } });
                                        }}
                                    >
                                        🛑 Beenden / Löschen
                                    </button>
                                    <button type="submit" className="btn-primary" style={{ flex: 2, fontSize: '1.1rem' }}>
                                        📡 Senden
                                    </button>
                                </div>
                            </form>

                            {/* ACTIVE INDICATOR */}
                            {localEvent.broadcast?.active && (
                                <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--accent-success)', borderRadius: '12px', textAlign: 'center' }}>
                                    <strong style={{ color: 'var(--accent-success)' }}>● LIVE:</strong> "{localEvent.broadcast.message}" ({localEvent.broadcast.type === 'overlay' ? 'Vollbild' : 'Ticker'})
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
