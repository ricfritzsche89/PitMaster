import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import BeerPongTable from './BeerPongTable';

export default function BeerPongAdmin() {
    // Fixed ID for the standalone game
    const GAME_ID = 'beerpong_standalone';

    const [gameState, setGameState] = useState({ topCups: [], bottomCups: [] });
    // topCups maps to LEFT (Black), bottomCups to RIGHT (Green)

    // Initial Load & Sync
    useEffect(() => {
        const gameRef = doc(db, 'events', GAME_ID);

        const unsubscribe = onSnapshot(gameRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.beerPong) {
                    setGameState(data.beerPong);
                }
            } else {
                // Initialize if not exists
                const initial = {
                    topCups: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                    bottomCups: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                };
                setDoc(gameRef, {
                    title: 'Bierpong Match',
                    beerPong: initial
                });
                setGameState(initial);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleCupClick = async (side, index) => {
        // Toggle logic
        const currentSideCups = gameState[side === 'top' ? 'topCups' : 'bottomCups'] || [];
        const exists = currentSideCups.includes(index);

        let newSideCups;
        if (exists) {
            newSideCups = currentSideCups.filter(i => i !== index);
        } else {
            newSideCups = [...currentSideCups, index].sort((a, b) => a - b);
        }

        const newState = {
            ...gameState,
            [side === 'top' ? 'topCups' : 'bottomCups']: newSideCups
        };

        // Optimistic
        setGameState(newState);

        // Save
        const gameRef = doc(db, 'events', GAME_ID);
        await updateDoc(gameRef, { beerPong: newState });
    };

    const resetGame = async () => {
        if (!confirm("⚠️ Neues Spiel starten? Alle Becher werden zurückgesetzt.")) return;
        const newState = {
            topCups: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            bottomCups: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        };
        setGameState(newState);
        const gameRef = doc(db, 'events', GAME_ID);
        await updateDoc(gameRef, { beerPong: newState });
    };

    return (
        <div className="beer-pong-admin h-full flex flex-col animate-fade-in text-white">
            <header className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/50">
                <div>
                    <h2 className="text-xl font-bold">🍺 Bierpong Manager</h2>
                    <span className="text-xs uppercase text-slate-400">Standalone Mode</span>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            const url = `${window.location.origin}${window.location.pathname}#/party/beerpong`;
                            window.open(url, '_blank');
                        }}
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        📺 TV Screen
                    </button>
                    <button
                        onClick={resetGame}
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        ↺ Reset
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
                <div className="mb-8 text-center opacity-70 text-sm max-w-md">
                    Links: <strong>Team Schwarz</strong> | Rechts: <strong>Team Grün</strong>
                    <br />
                    Klicke auf Becher, um sie zu entfernen.
                </div>

                <BeerPongTable
                    gameState={gameState}
                    onCupClick={handleCupClick}
                />
            </div>
        </div>
    );
}
