import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { subscribeToParticipants, getEvent, subscribeToEvent } from '../services/db';
import BroadcastReceiver from './BroadcastReceiver';

export default function PartyShootingView() {
    const { eventId } = useParams();
    const [participants, setParticipants] = useState([]);
    const [event, setEvent] = useState(null);
    const [prevLeader, setPrevLeader] = useState(null);
    const [showBanner, setShowBanner] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const videoRef = useRef(null);

    // AUTO-SCALE LOGIC
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    // Fixed Stage Resolution (16:9 Aspect Ratio optimized for TV)
    const BASE_WIDTH = 1600;
    const BASE_HEIGHT = 900;

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;

                // Calculate ratios
                const widthRatio = clientWidth / BASE_WIDTH;
                const heightRatio = clientHeight / BASE_HEIGHT;

                // Fit to screen (contain)
                const newScale = Math.min(widthRatio, heightRatio);
                setScale(newScale);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-Camera Logic based on DB state
    useEffect(() => {
        if (event?.shooting?.activeShooterId) {
            setShowCamera(true);
        } else {
            setShowCamera(false);
        }
    }, [event?.shooting?.activeShooterId]);

    // Camera Stream Effect
    useEffect(() => {
        let stream = null;
        if (showCamera) {
            const settings = JSON.parse(localStorage.getItem('pitmaster_settings') || '{}');
            const videoConstraint = settings.cameraDeviceId
                ? { deviceId: { exact: settings.cameraDeviceId } }
                : true;

            navigator.mediaDevices.getUserMedia({ video: videoConstraint })
                .then(s => {
                    stream = s;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    }
                })
                .catch(err => {
                    console.error("Camera error:", err);
                    setShowCamera(false);
                });
        }
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [showCamera]);

    // Calculate total score
    const getScore = (p) => {
        const r1 = (p.round1 || []).reduce((a, b) => a + (b || 0), 0);
        const r2 = (p.round2 || []).reduce((a, b) => a + (b || 0), 0);
        return r1 + r2;
    };

    useEffect(() => {
        const unsubEvent = subscribeToEvent(eventId, (data) => {
            setEvent(data);
        });

        const unsubscribe = subscribeToParticipants(eventId, (data) => {
            const sorted = data.sort((a, b) => getScore(b) - getScore(a));
            if (sorted.length > 0) {
                const currentLeader = sorted[0];
                if (prevLeader && prevLeader.id !== currentLeader.id) {
                    setShowBanner(`👑 Neuer Führender: ${currentLeader.name} 👑`);
                    setTimeout(() => setShowBanner(null), 5000);
                }
                setPrevLeader(currentLeader);
            }
            setParticipants(sorted);
        });
        return () => {
            unsubscribe();
            if (unsubEvent) unsubEvent();
        };
    }, [eventId]);

    if (!event) return <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-white">Lade...</div>;

    const top3 = participants.slice(0, 3);
    const rest = participants.slice(3);

    return (
        // OUTER CONTAINER: Viewport Fullsize
        <div ref={containerRef} className="w-screen h-screen bg-slate-900 overflow-hidden flex items-center justify-center relative select-none cursor-none">

            <BroadcastReceiver eventData={event} />

            {/* BACKGROUND: Animated Neon Gradient */}
            <div className="absolute inset-0 z-0 bg-slate-950">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-slate-950 to-slate-950"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-emerald-900/20 to-transparent"></div>
            </div>

            {/* SCALED STAGE */}
            <div style={{
                width: `${BASE_WIDTH}px`,
                height: `${BASE_HEIGHT}px`,
                transform: `scale(${scale})`,
                flexShrink: 0,
                position: 'relative',
                zIndex: 10,
                display: 'grid',
                gridTemplateColumns: '65% 35%', // Layout Split
                gap: '40px',
                padding: '40px'
            }}>

                {/* LEFT COLUMN: TOP 3 PODIUM */}
                <div className="flex flex-col gap-6 justify-center">
                    {top3.map((p, index) => {
                        let borderColor = 'var(--glass-border)';
                        let bg = 'rgba(15, 23, 42, 0.6)'; // Default dark glass
                        let glowClass = '';
                        let crown = null;
                        let scaleCard = 1;
                        let rankColor = 'text-slate-500';

                        if (index === 0) {
                            borderColor = '#fbbf24'; // Gold
                            bg = 'rgba(251, 191, 36, 0.15)';
                            glowClass = 'shadow-[0_0_30px_rgba(251,191,36,0.3)] border-yellow-500/50';
                            crown = '👑';
                            scaleCard = 1.05;
                            rankColor = 'text-yellow-400';
                        } else if (index === 1) {
                            borderColor = '#94a3b8'; // Silver
                            bg = 'rgba(148, 163, 184, 0.15)';
                            glowClass = 'shadow-[0_0_20px_rgba(148,163,184,0.2)] border-slate-400/50';
                            rankColor = 'text-slate-300';
                        } else if (index === 2) {
                            borderColor = '#b45309'; // Bronze
                            bg = 'rgba(180, 83, 9, 0.15)';
                            glowClass = 'shadow-[0_0_20px_rgba(180,83,9,0.2)] border-amber-700/50';
                            rankColor = 'text-amber-700';
                        }

                        return (
                            <div key={p.id} className={`relative rounded-3xl border-2 flex items-center p-6 gap-8 backdrop-blur-md transition-all duration-500 ${glowClass}`}
                                style={{
                                    borderColor: index > 0 ? borderColor : undefined, // Inline override for simple cases
                                    background: bg,
                                    transform: `scale(${scaleCard})`,
                                    zIndex: 10 - index
                                }}>

                                {/* Rank */}
                                <div className={`text-6xl font-bold w-24 text-center ${rankColor}`} style={{ fontFamily: '"Neon Glow", sans-serif', textShadow: '0 0 10px currentColor' }}>
                                    {index + 1}.
                                </div>

                                {/* Avatar */}
                                <div className="w-32 h-32 rounded-full border-4 shadow-lg overflow-hidden flex-shrink-0" style={{ borderColor }}>
                                    {p.image ? (
                                        <img src={p.image} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-4xl">👤</div>
                                    )}
                                </div>

                                {/* Name & Rounds */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-5xl font-bold text-white truncate mb-2 leading-tight tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                        {p.name} {crown}
                                    </div>
                                    <div className="flex gap-8 text-2xl text-slate-400 font-mono">
                                        <span className="bg-black/30 px-3 py-1 rounded-lg border border-white/5">R1: <b className="text-white">{(p.round1 || []).reduce((a, b) => a + (b || 0), 0)}</b></span>
                                        <span className="bg-black/30 px-3 py-1 rounded-lg border border-white/5">R2: <b className="text-white">{(p.round2 || []).reduce((a, b) => a + (b || 0), 0)}</b></span>
                                    </div>
                                </div>

                                {/* Total Score */}
                                <div className="text-8xl font-black text-emerald-400 tracking-tighter" style={{ fontFamily: '"Neon Glow", sans-serif', textShadow: '0 0 20px rgba(52, 211, 153, 0.6)' }}>
                                    {getScore(p)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* RIGHT COLUMN: CAMERA OR LIST */}
                <div className="glass flex flex-col h-full overflow-hidden rounded-3xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative">

                    {showCamera ? (
                        <div className="absolute inset-0 z-20 bg-black flex flex-col border-4 border-red-600 animate-pulse-slow">
                            <div className="bg-red-600 text-white text-2xl font-bold px-4 py-2 flex items-center gap-3 font-mono">
                                <span className="animate-pulse">🔴</span> LIVE CAM
                            </div>
                            <video
                                ref={videoRef}
                                className="flex-1 w-full h-full object-cover"
                                muted
                            />
                        </div>
                    ) : (
                        <>
                            <div className="bg-slate-900/80 p-6 border-b border-white/10 backdrop-blur-xl">
                                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 uppercase tracking-widest text-center" style={{ fontFamily: '"Neon Glow", sans-serif' }}>
                                    Verfolgerfeld
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {rest.map((p, index) => (
                                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-700/50 transition-colors rounded-xl border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <span className="text-slate-500 font-mono w-10 text-xl text-right">{index + 4}.</span>
                                            {p.image ? (
                                                <img src={p.image} className="w-12 h-12 rounded-full object-cover border border-white/10" alt="" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl border border-white/10">👤</div>
                                            )}
                                            <span className="text-2xl font-semibold text-slate-200">{p.name}</span>
                                        </div>
                                        <span className="text-4xl font-bold text-emerald-500" style={{ fontFamily: '"Neon Glow", sans-serif' }}>{getScore(p)}</span>
                                    </div>
                                ))}
                                {rest.length === 0 && (
                                    <div className="text-center text-slate-600 mt-20 text-xl italic p-10 border-2 border-dashed border-slate-800 rounded-2xl mx-10">
                                        Warte auf weitere Schützen...
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                </div>

                {/* POPUP BANNER */}
                {showBanner && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black/90 border-4 border-emerald-500 px-20 py-12 rounded-3xl shadow-[0_0_100px_rgba(16,185,129,0.8)] text-center animate-bounce-in backdrop-blur-xl">
                        <h2 className="text-7xl font-black text-emerald-400 leading-tight whitespace-nowrap" style={{ fontFamily: '"Neon Glow", sans-serif', textShadow: '0 0 30px currentColor' }}>
                            {showBanner}
                        </h2>
                    </div>
                )}

            </div>

            {/* MANUAL TOGGLE (Hidden UI) */}
            <button
                onClick={() => setShowCamera(!showCamera)}
                className="fixed top-4 right-4 opacity-0 hover:opacity-100 transition-opacity p-4 bg-white text-black rounded-full z-50 font-bold shadow-lg"
            >
                📷 Toggle Cam
            </button>
        </div>
    );
}
