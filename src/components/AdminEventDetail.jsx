import React, { useState, useEffect } from 'react';
import { updateEvent, subscribeToEvent, deleteEvent } from '../services/db';
import { calculateFinancials, formatCurrency } from '../services/finance';
import { generateAiLogo } from '../services/ai';
import SimpleList from './SimpleList';

export default function AdminEventDetail({ event, onBack, onUpdate }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [localEvent, setLocalEvent] = useState(event);
    const [financials, setFinancials] = useState(calculateFinancials(event));

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

    return (
        <div>
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
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    {['overview', 'finances', 'guests', 'betting'].map(tab => {
                        let label = tab;
                        if (tab === 'overview') label = 'Übersicht';
                        if (tab === 'finances') label = 'Finanzen';
                        if (tab === 'guests') label = 'Gäste';
                        if (tab === 'betting') label = 'Wettbüro';

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    background: activeTab === tab ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                                    border: 'none', padding: '8px 16px', borderRadius: '8px', color: 'white', cursor: 'pointer'
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

                            <div style={{ flex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: financials.isOverBudget ? '#ef4444' : '#fff' }}>
                                    {formatCurrency(financials.totalExpenses)}
                                </div>
                                {financials.isOverBudget && <small style={{ color: '#ef4444' }}>⚠️ Über Budget!</small>}
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Kosten pro Kopf</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: financials.isHighCost ? '#f59e0b' : '#fff' }}>
                                    {formatCurrency(financials.costPerGuest)}
                                </div>
                                {financials.isHighCost && <small style={{ color: '#f59e0b' }}>⚠️ &gt; 25€ p.P.</small>}
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Bestätigte Gäste</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{financials.confirmedCount}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <label>Dein Aufschlag (Gewinn): <strong>{localEvent.hostMarkup ?? 0}%</strong></label>
                                <span style={{ color: '#22c55e' }}>+{formatCurrency((financials.totalExpenses || 0) * ((localEvent.hostMarkup || 0) / 100))}</span>
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
                        <form onSubmit={handleAddExpense} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                            <input name="item" required placeholder="Posten (z.B. Bier)" className="input-field" style={{ marginBottom: 0, flex: 2 }} />
                            <input name="amount" required type="number" step="0.01" placeholder="€" className="input-field" style={{ marginBottom: 0, flex: 1 }} />
                            <button type="submit" className="btn-primary">+</button>
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
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                                        <td style={{ padding: '0.5rem' }}>{g.name}</td>
                                        <td>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem',
                                                background: g.status === 'accepted' ? 'rgba(34, 197, 94, 0.2)' : g.status === 'declined' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 0, 0.2)',
                                                color: g.status === 'accepted' ? '#4ade80' : g.status === 'declined' ? '#f87171' : '#facc15'
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
                )}

            </div>
        </div>
    );
}
