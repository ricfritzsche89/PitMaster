import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent, submitFeedback } from '../services/db';

export default function FeedbackPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        rating_food: 0,
        rating_vibes: 0,
        rating_music: 0,
        comment: ''
    });

    useEffect(() => {
        if (eventId) {
            getEvent(eventId)
                .then(setEvent)
                .catch(err => {
                    console.error(err);
                    alert("Event nicht gefunden.");
                });
        }
    }, [eventId]);

    const handleRating = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (form.rating_food === 0 && form.rating_vibes === 0 && form.rating_music === 0 && !form.comment) {
            alert("Bitte gib zumindest eine Bewertung oder einen Kommentar ab.");
            return;
        }

        setIsSubmitting(true);
        try {
            await submitFeedback(eventId, form);
            setSubmitted(true);
        } catch (error) {
            console.error(error);
            alert("Fehler beim Absenden. Bitte versuche es erneut.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="app-root animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
                <div className="glass card" style={{ textAlign: 'center', padding: '3rem 1rem', maxWidth: '400px', width: '100%' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                    <h2 style={{ marginBottom: '1rem' }}>Vielen Dank!</h2>
                    <p style={{ opacity: 0.8, lineHeight: '1.6' }}>Dein Feedback hilft uns, die nächsten Partys noch legendärer zu machen.</p>
                </div>
            </div>
        );
    }

    if (!event) return <div className="app-root" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Lade...</div>;

    return (
        <div className="app-root animate-fade-in" style={{ padding: '1rem', paddingBottom: '3rem' }}>
            <div className="glass card" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '1rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{event.title}</h2>
                <p style={{ textAlign: 'center', opacity: 0.6, fontSize: '0.9rem', marginBottom: '2rem' }}>Dein ehrliches Feedback (Anonym)</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* STARS: FOOD */}
                    <StarRating
                        label="🍔 Essen & Trinken"
                        value={form.rating_food}
                        onChange={(v) => handleRating('rating_food', v)}
                    />

                    {/* STARS: VIBES */}
                    <StarRating
                        label="✨ Stimmung"
                        value={form.rating_vibes}
                        onChange={(v) => handleRating('rating_vibes', v)}
                    />

                    {/* STARS: MUSIC */}
                    <StarRating
                        label="🎵 Musik"
                        value={form.rating_music}
                        onChange={(v) => handleRating('rating_music', v)}
                    />

                    {/* COMMENT AREA */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 'bold' }}>💡 Verbesserungsvorschläge</label>
                        <textarea
                            className="input-field"
                            rows="4"
                            placeholder="Was hat gefehlt? Was war super? Erzähl's uns..."
                            value={form.comment}
                            onChange={(e) => setForm(prev => ({ ...prev, comment: e.target.value }))}
                            style={{ width: '100%', resize: 'vertical' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting}
                        style={{ padding: '16px', fontSize: '1.1rem', marginTop: '1rem' }}
                    >
                        {isSubmitting ? 'Sende...' : 'Feedback absenden 📨'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// Sub-Component for Stars
function StarRating({ label, value, onChange }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 'bold' }}>{label}</label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '2rem',
                            cursor: 'pointer',
                            color: star <= value ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                            transition: 'transform 0.1s',
                            padding: '0 4px'
                        }}
                        onMouseDown={(e) => e.target.style.transform = 'scale(0.9)'}
                        onMouseUp={(e) => e.target.style.transform = 'scale(1.0)'}
                    >
                        ★
                    </button>
                ))}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '4px', height: '1.2em' }}>
                {value === 1 && "Naja..."}
                {value === 2 && "Ging so"}
                {value === 3 && "Ganz ok"}
                {value === 4 && "Super"}
                {value === 5 && "Legendär!"}
            </div>
        </div>
    );
}
