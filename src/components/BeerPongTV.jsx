import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import BeerPongTable from './BeerPongTable';

export default function BeerPongTV() {
    const GAME_ID = 'beerpong_standalone';
    const [gameState, setGameState] = useState({ topCups: [], bottomCups: [] });

    // Scale Logic
    const [scale, setScale] = useState(1);

    // Base Dimensions
    const BASE_W = 1000;
    const BASE_H = 420;

    useEffect(() => {
        const gameRef = doc(db, 'events', GAME_ID);
        const unsubscribe = onSnapshot(gameRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.beerPong) {
                    setGameState(data.beerPong);
                }
            } else {
                setGameState({
                    topCups: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                    bottomCups: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                });
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;

            // Limit scale to leave room for scoreboard
            // 95% width is fine
            // 70% height max (leaving 30% for bottom area)
            const scaleW = (w * 0.95) / BASE_W;
            const scaleH = (h * 0.70) / BASE_H;

            setScale(Math.min(scaleW, scaleH));
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="w-screen h-screen bg-slate-950 overflow-hidden relative font-sans text-white">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none opacity-50 bg-radial-gradient from-slate-800/20 to-transparent"></div>

            {/* TABLE WRAPPER - ABSOLUTE CENTER TOP (40%) */}
            <div style={{
                position: 'absolute',
                top: '40%', // Shifted up form 50%
                left: '50%',
                width: `${BASE_W}px`,
                height: `${BASE_H}px`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                transformOrigin: 'center center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <BeerPongTable
                    gameState={gameState}
                    readOnly={true}
                />
            </div>

            {/* SCOREBOARD - ABSOLUTE BOTTOM - GRID ALIGNMENT */}
            <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-full max-w-[1400px] grid grid-cols-[1fr_auto_1fr] items-center gap-12 z-20 px-8">

                {/* Team Left (Schwarz) */}
                <div className="flex flex-col items-center gap-4 group cursor-default justify-self-end">
                    <span className="text-2xl uppercase tracking-[0.4em] text-slate-400 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center transition-all duration-300 group-hover:text-white group-hover:tracking-[0.5em]">
                        Team Schwarz
                    </span>
                    <div className="
                        relative px-16 py-6 
                        bg-gradient-to-br from-gray-900/90 to-black/95 
                        backdrop-blur-2xl rounded-3xl 
                        border-[3px] border-slate-600 
                        shadow-[0_0_40px_rgba(0,0,0,0.6)] 
                        transform transition-all duration-500 ease-out 
                        group-hover:scale-110 group-hover:border-white group-hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]
                    ">
                        {/* Inner Bevel */}
                        <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none"></div>

                        <span className="text-7xl md:text-9xl font-mono font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">
                            {gameState.topCups?.length || 0}
                        </span>
                    </div>
                </div>

                {/* VS Divider - Stylish */}
                <div className="flex flex-col items-center justify-center opacity-60 px-4">
                    <div className="h-16 w-[2px] bg-gradient-to-b from-transparent via-slate-500 to-transparent mb-4"></div>
                    <span className="text-6xl md:text-8xl font-black italic text-slate-600 tracking-tighter transform -skew-x-12">VS</span>
                    <div className="h-16 w-[2px] bg-gradient-to-t from-transparent via-slate-500 to-transparent mt-4"></div>
                </div>

                {/* Team Right (Grün) */}
                <div className="flex flex-col items-center gap-4 group cursor-default justify-self-start">
                    <span className="text-2xl uppercase tracking-[0.4em] text-emerald-600 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center transition-all duration-300 group-hover:text-emerald-400 group-hover:tracking-[0.5em]">
                        Team Grün
                    </span>
                    <div className="
                        relative px-16 py-6 
                        bg-gradient-to-br from-green-950/90 to-black/95 
                        backdrop-blur-2xl rounded-3xl 
                        border-[3px] border-emerald-600 
                        shadow-[0_0_40px_rgba(16,185,129,0.25)] 
                        transform transition-all duration-500 ease-out 
                        group-hover:scale-110 group-hover:border-emerald-400 group-hover:shadow-[0_0_80px_rgba(52,211,153,0.5)]
                    ">
                        {/* Inner Bevel */}
                        <div className="absolute inset-0 rounded-3xl border border-emerald-400/20 pointer-events-none"></div>

                        <span className="text-7xl md:text-9xl font-mono font-black text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">
                            {gameState.bottomCups?.length || 0}
                        </span>
                    </div>
                </div>

            </div>

        </div>
    );
}
