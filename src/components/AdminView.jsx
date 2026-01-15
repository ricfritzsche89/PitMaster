import React, { useState, useEffect } from 'react';
import { createEvent, getEvent } from '../services/db';
import AdminEventDetail from './AdminEventDetail';
import { calculateFinancials, formatCurrency } from '../services/finance';

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
        loadMyEvents();
    }, []);

    const loadMyEvents = async () => {
        const storedIds = JSON.parse(localStorage.getItem('my_events') || '[]');
        if (storedIds.length === 0) return;

        setLoading(true);
        const loadedEvents = [];
        for (const id of storedIds) {
            try {
                const evt = await getEvent(id);
                loadedEvents.push(evt);
            } catch (e) {
                console.error("Konnte Event nicht laden:", id, e);
            }
        }
        setEvents(loadedEvents);
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Parse numbers
            const payload = {
                ...formData,
                budgetLimit: parseFloat(formData.budgetLimit) || 0,
                maxGuests: parseInt(formData.maxGuests) || 0
            };

            const newEventId = await createEvent(payload);

            const storedIds = JSON.parse(localStorage.getItem('my_events') || '[]');
            storedIds.push(newEventId);
            localStorage.setItem('my_events', JSON.stringify(storedIds));

            setFormData({ title: '', date: '', time: '', location: '', description: '', budgetLimit: '', maxGuests: '' });
            setShowForm(false);
            await loadMyEvents();
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
        const baseUrl = window.location.href.split('?')[0];
        // Remove trailing slash if present to avoid double slashes (optional but cleaner)
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const link = `${cleanBaseUrl}?partyId=${id}`;

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

    // If an event is selected, show detail view
    if (selectedEventId) {
        const evt = events.find(e => e.id === selectedEventId);
        if (!evt) { setSelectedEventId(null); return null; }

        return (
            <AdminEventDetail
                event={evt}
                onBack={() => { setSelectedEventId(null); loadMyEvents(); }}
                onUpdate={() => loadMyEvents()}
            />
        );
    }

    return (
        <div className="container animate-fade-in">
            <div className="glass card" style={{ maxWidth: '800px', margin: '1rem auto', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ background: 'linear-gradient(to right, #22c55e, #14532d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>PitMaster Admin</h1>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Abbrechen' : '+ Neue Party'}
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleCreate} className="animate-fade-in" style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Neue Party erstellen</h3>
                        <input required placeholder="Party Name" className="input-field" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input placeholder="Was wird gefeiert? (z.B. Schützenfest)" className="input-field" value={formData.theme} onChange={e => setFormData({ ...formData, theme: e.target.value })} />
                            <input
                                type="file"
                                accept="image/*"
                                className="input-field"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        if (file.size > 500000) { // 500KB limit
                                            alert("Bild ist zu groß! Bitte maximal 500KB.");
                                            return;
                                        }
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({ ...formData, image: reader.result });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input required type="date" className="input-field" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            <input required type="time" className="input-field" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                        </div>

                        {/* New v2 Fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input type="number" placeholder="Budget Limit (€)" className="input-field" value={formData.budgetLimit} onChange={e => setFormData({ ...formData, budgetLimit: e.target.value })} />
                            <input type="number" placeholder="Max Gäste (0 = egal)" className="input-field" value={formData.maxGuests} onChange={e => setFormData({ ...formData, maxGuests: e.target.value })} />
                        </div>

                        <input required placeholder="Ort" className="input-field" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                        <textarea placeholder="Beschreibung / Infos" className="input-field" style={{ minHeight: '100px', resize: 'vertical' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />

                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Erstelle...' : 'Party erstellen'}
                        </button>
                    </form>
                )}

                <div>
                    <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Deine Events</h3>
                    {loading && <p>Lade Events...</p>}
                    {!loading && events.length === 0 && <p style={{ opacity: 0.6 }}>Noch keine Events. Erstelle eins!</p>}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {events.map(evt => (
                            <div
                                key={evt.id}
                                onClick={() => setSelectedEventId(evt.id)}
                                style={{ background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {evt.image ? (
                                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', backgroundImage: `url(${evt.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }}></div>
                                ) : (
                                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>📅</div>
                                )}

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.2rem' }}>{evt.title}</h4>
                                            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.8rem' }}>
                                                📅 {evt.date ? evt.date.split('-').reverse().join('.') : ''} | 📍 {evt.location}
                                            </p>
                                        </div>
                                        <button onClick={(e) => copyLink(evt.id, e)} className="btn-primary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                                            🔗 Link
                                        </button>
                                    </div>

                                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                            👥 {evt.guests?.filter(g => g.status === 'accepted').length} Zusagen
                                        </span>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                            💰 {evt.expenses ? formatCurrency(calculateFinancials(evt).totalExpenses) : '0€'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
