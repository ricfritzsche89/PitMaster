import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

// Mock Data
const PLAYERS = [
    { id: 1, name: 'Ric', score: 1450, rank: 1, image: null },
    { id: 2, name: 'Alice', score: 1320, rank: 2, image: null },
    { id: 3, name: 'Bob', score: 980, rank: 3, image: null },
    { id: 4, name: 'Charlie', score: 850, rank: 4, image: null },
];

export const TVView: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Animate Score counting up
    const scoreMultiplier = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: 'clamp' });

    // Entrance animation for cards
    const cardEntrance = (delay: number) => spring({
        frame: frame - delay,
        fps,
        config: { damping: 15 }
    });

    return (
        <AbsoluteFill className="bg-slate-900 overflow-hidden flex items-center justify-center relative">

            {/* Background */}
            <div className="absolute inset-0 z-0 bg-slate-950">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-slate-950 to-slate-950"></div>
            </div>

            <div className="relative z-10 grid grid-cols-[65%_35%] gap-10 p-10 w-full max-w-7xl h-full items-center">

                {/* PODIUM */}
                <div className="flex flex-col gap-6 justify-center">
                    {PLAYERS.slice(0, 3).map((p, index) => {
                        const entrance = cardEntrance(index * 10);
                        let borderColor = '#94a3b8';
                        let glow = '';

                        if (index === 0) {
                            borderColor = '#fbbf24';
                            glow = 'shadow-[0_0_40px_rgba(251,191,36,0.3)] border-yellow-500/50';
                        }
                        if (index === 2) borderColor = '#b45309';

                        return (
                            <div key={p.id}
                                style={{ transform: `translateX(${interpolate(entrance, [0, 1], [-200, 0])}px) scale(${entrance})`, opacity: entrance }}
                                className={`relative rounded-3xl border-2 flex items-center p-6 gap-8 backdrop-blur-md bg-slate-800/60 ${glow}`}
                            >
                                <div className="text-6xl font-bold w-24 text-center text-white" style={{ fontFamily: '"Neon Glow", sans-serif' }}>
                                    {index + 1}.
                                </div>
                                <div className="text-5xl font-bold text-white flex-1">
                                    {p.name} {index === 0 && '👑'}
                                </div>
                                <div className="text-7xl font-black text-emerald-400 font-mono">
                                    {Math.floor(p.score * scoreMultiplier)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* SIDE LIST */}
                <div className="glass flex flex-col h-[600px] rounded-3xl border border-emerald-500/30 p-6">
                    <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6 text-center">
                        VERFOLGER
                    </h3>
                    <div className="space-y-4">
                        {PLAYERS.slice(3).map((p, i) => (
                            <div key={p.id} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-white/10">
                                <span className="text-2xl text-slate-400">4. {p.name}</span>
                                <span className="text-3xl text-emerald-500 font-bold">{Math.floor(p.score * scoreMultiplier)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-white/10 opacity-50">
                            <span className="text-2xl text-slate-400">5. ???</span>
                            <span className="text-3xl text-emerald-500 font-bold">---</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* POPUP EVENT */}
            <div style={{
                opacity: interpolate(frame, [90, 100], [0, 1]),
                transform: `scale(${spring({ frame: frame - 90, fps, config: { stiffness: 200, damping: 10 } })})`
            }} className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div className="bg-black/90 border-4 border-emerald-500 px-20 py-12 rounded-3xl shadow-[0_0_100px_rgba(16,185,129,0.8)] backdrop-blur-xl">
                    <h2 className="text-8xl font-black text-emerald-400 whitespace-nowrap" style={{ fontFamily: '"Neon Glow"' }}>
                        VOLTREFFER!
                    </h2>
                </div>
            </div>

        </AbsoluteFill>
    );
};
