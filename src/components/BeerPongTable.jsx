import React from 'react';
import tableBg from '../assets/beerpong-table-neon-v7.png';

/**
 * Shared Beer Pong Table Component
 * Renders a Top-Down Horizontal View (Landscape).
 * Left Side: Black Cups (Team 1)
 * Right Side: Green Cups (Team 2)
 */
export default function BeerPongTable({ gameState, onCupClick, readOnly = false }) {

    // Pyramid renderer
    // direction: 'right' (Left team pointing right) | 'left' (Right team pointing left)
    const renderPyramid = (side, cupsData, colorClass, direction) => {
        // Rows: 4, 3, 2, 1
        const rows = [4, 3, 2, 1];
        let cupIndex = 0;

        return (
            <div className={`cup-pyramid ${side}`} style={{
                display: 'flex',
                flexDirection: 'row', // Horizontal stacking of columns
                alignItems: 'center',
                gap: '2px', // Tighter scraping
                transform: direction === 'right' ? 'none' : 'rotate(180deg)'
            }}>
                {rows.map((count, rowIdx) => (
                    <div key={rowIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
                        {Array.from({ length: count }).map((_, i) => {
                            const currentIdx = cupIndex++;
                            const isGone = !cupsData.includes(currentIdx);

                            return (
                                <div
                                    key={i}
                                    onClick={() => !readOnly && onCupClick && onCupClick(side, currentIdx)}
                                    className={`beer-cup ${colorClass} ${isGone ? 'gone' : ''}`}
                                    style={{
                                        width: '50px', // Slightly smaller for horizontal fit
                                        height: '50px',
                                        borderRadius: '50%',
                                        border: '3px solid rgba(255,255,255,0.2)',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                                        cursor: readOnly || isGone ? 'default' : 'pointer',
                                        position: 'relative',
                                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        opacity: isGone ? 0.1 : 1,
                                        transform: isGone ? 'scale(0.5)' : 'scale(1)',
                                        background: colorClass === 'green'
                                            ? 'radial-gradient(circle at 30% 30%, #4ade80, #16a34a)'
                                            : 'radial-gradient(circle at 30% 30%, #333, #000)', // Darker glossy black
                                        zIndex: 10 - rowIdx // Front cups on top
                                    }}
                                >
                                    {/* Liquid shine effect */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '10%', left: '10%',
                                        width: '30%', height: '20%',
                                        background: 'rgba(255,255,255,0.3)',
                                        borderRadius: '50%',
                                        transform: 'rotate(-45deg)'
                                    }} />

                                    {!isGone && !readOnly && (
                                        <div className="cup-hover" style={{
                                            position: 'absolute', inset: 0, borderRadius: '50%',
                                            background: 'rgba(255,255,255,0)', transition: 'background 0.2s'
                                        }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="beer-pong-table" style={{
            width: '100%',
            maxWidth: '1000px',
            aspectRatio: '2.4/1',
            margin: '0 auto',
            backgroundColor: 'transparent',
            // backgroundImage moved to inner container for border control
            position: 'relative',
            overflow: 'visible', // Allow glow to bleed
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 5%'
        }}>
            {/* Overlay for localized lighting/depth */}
            {/* --- VISUAL TABLE SURFACE (Background + Neon Border) --- */}
            <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '92%', // Matches the requested "smaller" visual
                height: '92%',
                backgroundImage: `url(${tableBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '30px',
                border: '2px solid rgba(6, 182, 212, 0.5)', // Cyan Neon Border
                boxShadow: `
                    0 0 20px rgba(6, 182, 212, 0.4), 
                    inset 0 0 60px rgba(0,0,0,0.8)
                `,
                zIndex: 0
            }} />

            {/* Overlay for localized lighting/depth (Inside the table surface context ideally, but here scales to container) */}
            {/* We can skip the global overlay or keep it if it adds atmosphere. Let's keep it simple. */}

            {/* Left Team (Black Cups) - Pointing Right */}
            <div style={{ zIndex: 10 }}>
                {renderPyramid('top', gameState.topCups || [], 'black', 'right')}
            </div>

            {/* Right Team (Green Cups) - Pointing Left */}
            <div style={{ zIndex: 10 }}>
                {renderPyramid('bottom', gameState.bottomCups || [], 'green', 'left')}
            </div>

            {/* NEON TRIANGLE MARKINGS - RIGHT (Team Left's Target) */}
            <div style={{
                position: 'absolute',
                top: '50%',
                right: '5%', // Matches padding of the table container
                transform: 'translateY(-50%)',
                width: '226px', // Scaled +5% from 215px
                height: '221px', // Scaled +5% from 210px
                zIndex: 1,
                pointerEvents: 'none'
            }}>
                <svg width="100%" height="100%" viewBox="0 0 215 210" style={{ overflow: 'visible' }}>
                    {/* 
                        Triangle Coordinates:
                        Pyramid is pointing RIGHT. 
                        Base is on the Left (x=0), Tip is on the Right (x=215).
                        Top-Left Corner: (0, 0)
                        Bottom-Left Corner: (0, 210)
                        Tip: (215, 105) - Center Y
                    */}
                    <path
                        d="M210 5 L 5 105 L 210 205 Z"
                        fill="none"
                        stroke="rgba(16, 185, 129, 1)"
                        strokeWidth="4"
                        strokeLinejoin="round"
                        className="triangle-glow"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.8)) drop-shadow(0 0 15px rgba(74, 222, 128, 0.5))' }}
                    />
                    <defs>
                        <filter id="glow-right" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                </svg>
            </div>

            {/* NEON TRIANGLE MARKINGS - LEFT (Team Right's Target) */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '5%',
                transform: 'translateY(-50%)', // No scaleX(-1) needed if we draw it correctly pointing LEFT
                width: '226px', // Scaled +5%
                height: '221px', // Scaled +5%
                zIndex: 1,
                pointerEvents: 'none'
            }}>
                <svg width="100%" height="100%" viewBox="0 0 215 210" style={{ overflow: 'visible' }}>
                    {/* 
                        Triangle Coordinates:
                        Pyramid is pointing LEFT.
                        Base is on the Right (x=215), Tip is on the Left (x=0).
                        Top-Right Corner: (215, 5)
                        Bottom-Right Corner: (215, 205)
                        Tip: (5, 105)
                    */}
                    <path
                        d="M5 5 L 210 105 L 5 205 Z"
                        fill="none"
                        stroke="rgba(16, 185, 129, 1)"
                        strokeWidth="4"
                        strokeLinejoin="round"
                        className="triangle-glow"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.8)) drop-shadow(0 0 15px rgba(74, 222, 128, 0.5))' }}
                    />
                    <defs>
                        <filter id="glow-left" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                </svg>
            </div>



            <style>{`
                .beer-cup:not(.gone):hover .cup-hover {
                    background: rgba(255,255,255,0.2) !important;
                }
            `}</style>
        </div>
    );
}
