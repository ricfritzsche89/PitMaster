import React, { useState, useEffect } from 'react';
import { createEvent, subscribeToEvent } from '../services/db';
import AdminEventDetail from './AdminEventDetail';
import { calculateFinancials, formatCurrency } from '../services/finance';
import { generateAiLogo } from '../services/ai';

import DashboardLayout from './DashboardLayout';

export default function AdminView() {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(null); // 'LIST' or ID
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Expanded Form Data for v2 properties
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        budgetLimit: '',
        maxGuests: ''
    });

    useEffect(() => {
        const storedIds = JSON.parse(localStorage.getItem('my_events') || '[]');
        if (storedIds.length === 0) return;

        setLoading(true);
        const unsubscribers = [];

        // Subscribe to each event
        storedIds.forEach(id => {
            const unsub = subscribeToEvent(id, (updatedEvent) => {
                setEvents(prevEvents => {
                    if (!updatedEvent) {
                        // Event deleted, remove from list
                        return prevEvents.filter(e => e.id !== id);
                    }
                    // Update or Add
                    const idx = prevEvents.findIndex(e => e.id === id);
                    if (idx >= 0) {
                        const newArr = [...prevEvents];
                        newArr[idx] = updatedEvent;
                        return newArr;
                    } else {
                        return [...prevEvents, updatedEvent];
                    }
                });
                setLoading(false);
            });
            unsubscribers.push(unsub);
        });

        // Cleanup
        return () => {
            unsubscribers.forEach(u => u());
        };
    }, []);

    // Removed manual loadMyEvents function as it's replaced by the effect

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Parse numbers
            const payload = {
                ...formData,
                budgetLimit: parseFloat(formData.budgetLimit) || 0,
                maxGuests: parseInt(formData.maxGuests) || 0,
                bettingStatus: 'open'
            };

            const newEventId = await createEvent(payload);

            const storedIds = JSON.parse(localStorage.getItem('my_events') || '[]');
            storedIds.push(newEventId);
            localStorage.setItem('my_events', JSON.stringify(storedIds));

            setFormData({ title: '', date: '', time: '', location: '', description: '', budgetLimit: '', maxGuests: '' });
            setShowForm(false);

            // Trigger list update (simple way: reload, or better: update checking state)
            // For smooth UX, let's just create a quick local update or reload
            // Since we changed the architecture to listeners, adding a new listener dynamically is tricky without state.
            window.location.reload();
        } catch (e) {
            alert("Fehler beim Erstellen der Party: " + e.message);
        }
        setLoading(false);
    };

    const copyLink = (id, e) => {
        e.stopPropagation(); // Don't open detail view

        // WARNUNG für Localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            alert("ACHTUNG: Du bist auf 'localhost'. Dieser Link funktioniert NICHT auf dem Handy!\n\nBitte öffne am Laptop die Netzwerk-Adresse (z.B. http://192.168.x.x:5173), die im Terminal angezeigt wird, und kopiere den Link dann erneut.");
        }

        // Generate Link: Use current path (including sub-directory like /pitmaster/) 
        // instead of just origin to support GitHub Pages.
        const origin = window.location.origin;
        // Clean up pathname to avoid double slashes if pathname is just "/"
        const pathname = window.location.pathname === '/' ? '' : window.location.pathname;

        // Final Link Format: https://domain.com/PitMaster/#/?partyId=123
        // This format is compatible with HashRouter and our regex fallback in App.jsx
        const link = `${origin}${pathname}/#/?partyId=${id}`;

        // Fallback for non-secure contexts (HTTP)
        if (!navigator.clipboard) {
            const textArea = document.createElement("textarea");
            textArea.value = link;

            // Ensure it's not visible but part of the DOM
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                alert("Link kopiert: " + link);
            } catch (err) {
                prompt("Konnte nicht automatisch kopieren. Hier ist der Link:", link);
            }

            document.body.removeChild(textArea);
            return;
        }

        // Modern API
        navigator.clipboard.writeText(link).then(() => {
            alert("Link in die Zwischenablage kopiert!");
        }).catch(err => {
            prompt("Konnte nicht automatisch kopieren. Hier ist der Link:", link);
        });
    };

    // LOGOUT HANDLER (Optional, clears local storage or state)
    const handleLogout = () => {
        if (confirm("Admin-Modus verlassen?")) {
            // For now just reload or clear event selection
            window.location.reload();
        }
    };

    // VIEW LOGIC
    let content;
    let title = "Meine Events";

    if (selectedEventId) {
        const evt = events.find(e => e.id === selectedEventId);
        if (evt) {
            title = evt.title;
            content = (
                <AdminEventDetail
                    event={evt}
                    onBack={() => { setSelectedEventId(null); }}
                />
            );
        } else {
            setSelectedEventId(null);
        }
    }

    if (!content) {
        // EVENT LIST VIEW
        content = (
            <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Abbrechen' : '+ Neue Party'}
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleCreate} className="animate-fade-in" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ marginBottom: '1rem', marginTop: 0 }}>Neue Party erstellen</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                            <input required placeholder="Party Name" className="input-field" style={{ marginBottom: 0 }} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            <input placeholder="Admin PIN" className="input-field" style={{ marginBottom: 0 }} maxLength={4} title="4-Stelliger PIN für Admin-Login auf anderen Geräten" value={formData.adminPin || ''} onChange={e => setFormData({ ...formData, adminPin: e.target.value })} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {/* Theme Selection */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Was wird gefeiert?</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <select
                                        className="input-field"
                                        style={{ marginBottom: 0, flex: 1 }}
                                        value={['Schießwettbewerb', 'Geburtstag', 'Party'].includes(formData.theme) ? formData.theme : 'Sonstiges'}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val === 'Sonstiges') {
                                                setFormData({ ...formData, theme: '' });
                                            } else {
                                                setFormData({ ...formData, theme: val });
                                            }
                                        }}
                                    >
                                        <option value="Schießwettbewerb">Schießwettbewerb</option>
                                        <option value="Geburtstag">Geburtstag</option>
                                        <option value="Party">Party</option>
                                        <option value="Sonstiges">Sonstiges / Eigenes...</option>
                                    </select>
                                    {(!['Schießwettbewerb', 'Geburtstag', 'Party'].includes(formData.theme)) && (
                                        <input
                                            placeholder="Eigenes Thema eingeben..."
                                            className="input-field"
                                            style={{ marginBottom: 0, flex: 1 }}
                                            value={formData.theme}
                                            onChange={e => setFormData({ ...formData, theme: e.target.value })}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Inputs */}
                            <input required type="date" className="input-field" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            <input required type="time" className="input-field" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                        </div>

                        <input type="number" placeholder="Budget Limit (€)" className="input-field" value={formData.budgetLimit} onChange={e => setFormData({ ...formData, budgetLimit: e.target.value })} />
                        <input type="number" placeholder="Max Gäste (0 = egal)" className="input-field" value={formData.maxGuests} onChange={e => setFormData({ ...formData, maxGuests: e.target.value })} />
                        <input required placeholder="Ort" className="input-field" style={{ width: '100%' }} value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />

                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                            {loading ? 'Erstelle...' : 'Party erstellen'}
                        </button>
                    </form>
                )}

                <div>
                    <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Deine Events</h3>
                    {loading && <p>Lade Events...</p>}
                    {!loading && events.length === 0 && <p style={{ opacity: 0.6 }}>Noch keine Events. Erstelle eins!</p>}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {events.map(evt => (
                            <div
                                key={evt.id}
                                onClick={() => setSelectedEventId(evt.id)}
                                style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                            >
                                {evt.image ? (
                                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={evt.image} alt="Event Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    </div>
                                ) : (
                                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>📅</div>
                                )}

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.1rem', color: '#fff' }}>{evt.title}</h4>
                                            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.8rem' }}>
                                                {evt.date ? evt.date.split('-').reverse().join('.') : ''} | {evt.location}
                                            </p>
                                        </div>
                                        <button onClick={(e) => copyLink(evt.id, e)} className="btn-primary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                                            🔗 Link
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout title={title} onLogout={handleLogout}>
            {content}
        </DashboardLayout>
    );
}
