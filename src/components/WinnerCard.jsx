import React, { forwardRef } from 'react';
import './WinnerCard.css';

const WinnerCard = forwardRef(({ participant, event, rank, theme = 'classic', photoUrl }, ref) => {

    // Default fallback image if no photo provided
    const displayImage = photoUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23333'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dy='.3em'%3E?%3C/text%3E%3C/svg%3E";

    const totalScore = (participant.round1 || []).reduce((a, b) => a + b, 0) + (participant.round2 || []).reduce((a, b) => a + b, 0);

    return (
        <div ref={ref} className={`winner-card theme-${theme}`}>
            {/* Header Section based on theme could vary, but keeping simple structure for now */}

            <div className="winner-card-image-container">
                <img src={displayImage} alt="Winner" className="winner-card-photo" />
                {theme === 'western' && <div style={{ position: 'absolute', top: '10px', left: '0', width: '100%', textAlign: 'center', fontSize: '3rem', fontFamily: 'serif', fontWeight: 'bold', color: '#3e2723', textShadow: '0 0 5px white' }}>WANTED</div>}
            </div>

            <div className="winner-card-content">
                <div className="winner-card-rank">{rank}</div>
                <h2 className="winner-card-title">{participant.name}</h2>

                <div style={{ marginTop: 'auto', width: '100%', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Event</div>
                        <div style={{ fontWeight: 'bold' }}>{event.title}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Score</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalScore}</div>
                    </div>
                </div>
            </div>

            {theme === 'bbq' && <div className="fire-dec"></div>}
        </div>
    );
});

export default WinnerCard;
