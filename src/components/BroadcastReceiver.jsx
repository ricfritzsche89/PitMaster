import React, { useEffect, useState } from 'react';

export default function BroadcastReceiver({ eventData }) {
    if (!eventData?.broadcast?.active) return null;

    const { message, type } = eventData.broadcast;

    // OVERLAY MODE
    if (type === 'overlay') {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.9)',
                backdropFilter: 'blur(10px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <div style={{
                    padding: '4rem',
                    border: '2px solid var(--accent-highlight)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(6, 182, 212, 0.1)',
                    boxShadow: '0 0 50px rgba(6, 182, 212, 0.3)',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontSize: '5rem',
                        margin: 0,
                        textTransform: 'uppercase',
                        color: 'white',
                        textShadow: '0 0 30px var(--accent-highlight)'
                    }}>
                        {message}
                    </h1>
                </div>
                <style>{`
                    @keyframes popIn {
                        from { transform: scale(0.8); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    // TICKER MODE
    const speed = eventData.broadcast.speed || 5;
    const duration = Math.max(5, 45 - (speed * 4)); // 1 -> 41s, 5 -> 25s, 10 -> 5s

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            background: 'linear-gradient(90deg, var(--bg-secondary), #000, var(--bg-secondary))',
            borderTop: '2px solid var(--accent-primary)',
            color: 'white',
            padding: '1rem 0',
            zIndex: 9999,
            overflow: 'hidden',
            boxShadow: '0 -5px 20px rgba(0,0,0,0.5)'
        }}>
            <div style={{
                display: 'inline-block',
                whiteSpace: 'nowrap',
                animation: `marquee ${duration}s linear infinite`,
                fontSize: '2rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                textShadow: '0 0 10px var(--accent-primary)'
            }}>
                {message} • {message} • {message} • {message} • {message} • {message} • {message} •
            </div>
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(100vw); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
}
