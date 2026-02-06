import React, { useEffect, useState } from 'react';

export default function BroadcastReceiver({ eventData }) {
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [timeNow, setTimeNow] = useState(Date.now());

    // Update time every second to check for overlay expiration
    useEffect(() => {
        const interval = setInterval(() => setTimeNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Check Overlay State
    useEffect(() => {
        if (eventData?.broadcast?.overlay?.active) {
            const { timestamp, duration, permanent } = eventData.broadcast.overlay;
            // Visible if permanent OR (now - timestamp) < duration * 1000
            if (permanent || (Date.now() - timestamp < duration * 1000)) {
                setOverlayVisible(true);
            } else {
                setOverlayVisible(false);
            }
        } else {
            setOverlayVisible(false);
        }
    }, [eventData?.broadcast?.overlay, timeNow]);


    return (
        <>
            {/* --- OVERLAY COMPONENT --- */}
            {overlayVisible && eventData?.broadcast?.overlay && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    // Optimized: static background color instead of backdrop-filter
                    background: 'rgba(0,0,0,0.9)',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <div className="glass" style={{
                        padding: '4rem',
                        border: '4px solid var(--accent-danger)',
                        borderRadius: '24px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        boxShadow: '0 0 50px rgba(220, 38, 38, 0.5)',
                        textAlign: 'center',
                        maxWidth: '90vw',
                        willChange: 'transform, opacity',
                        animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}>
                        <h1 className="text-gradient" style={{
                            fontSize: '5rem',
                            margin: 0,
                            textTransform: 'uppercase',
                            color: 'white',
                            textShadow: '0 0 20px var(--accent-danger)',
                            lineHeight: 1.2
                        }}>
                            {eventData.broadcast.overlay.message}
                        </h1>
                    </div>
                </div>
            )}

            {/* --- TICKER COMPONENT --- */}
            {eventData?.broadcast?.ticker?.active && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    background: 'rgba(2, 6, 23, 0.95)',
                    borderTop: '2px solid var(--accent-primary)',
                    color: 'white',
                    padding: '1.5rem 0',
                    zIndex: 9998, // Below overlay
                    overflow: 'hidden',
                    boxShadow: '0 -5px 20px rgba(0,0,0,0.5)'
                }}>
                    <div style={{
                        display: 'inline-block',
                        whiteSpace: 'nowrap',
                        animation: `marquee ${Math.max(5, 45 - ((eventData.broadcast.ticker.speed || 5) * 4))}s linear infinite`,
                        fontSize: '2rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        color: 'var(--accent-primary)',
                        textShadow: '0 0 10px rgba(29, 185, 84, 0.3)',
                        letterSpacing: '2px',
                        willChange: 'transform' // Performance hint
                    }}>
                        {/* Repeat message for smooth loop */}
                        {[...Array(6)].map((_, i) => (
                            <span key={i}>
                                {eventData.broadcast.ticker.message} &nbsp; • &nbsp;
                            </span>
                        ))}
                    </div>
                    <style>{`
                        @keyframes marquee {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); } 
                        }
                        @keyframes popIn {
                            from { transform: scale(0.5); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                    `}</style>
                </div>
            )}
        </>
    );
}
