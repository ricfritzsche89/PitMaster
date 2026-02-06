import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const FeatureShowcase: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill className="bg-slate-900 flex flex-row">
            {/* Sidebar */}
            <div className="w-64 bg-slate-950 border-r border-white/10 flex flex-col p-6 gap-6">
                <div className="h-10 w-32 bg-emerald-500/20 rounded mb-10"></div>

                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-full bg-slate-800 rounded flex items-center px-3 gap-3">
                        <div className="w-4 h-4 rounded-full bg-slate-600"></div>
                        <div className="h-2 w-20 bg-slate-700 rounded-full"></div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="h-20 border-b border-white/10 flex items-center px-10 justify-between">
                    <div className="h-4 w-40 bg-slate-800 rounded-full"></div>
                    <div className="h-10 w-10 rounded-full bg-emerald-500"></div>
                </div>

                {/* Content Grid */}
                <div className="p-10 grid grid-cols-3 gap-6">
                    {/* Card 1: Finances */}
                    <div className="glass p-6 rounded-2xl h-64 flex flex-col justify-between"
                        style={{
                            transform: `translateY(${spring({ frame: frame - 10, fps, config: { damping: 12 } }) * -20 + 20}px)`,
                            opacity: interpolate(frame, [10, 30], [0, 1])
                        }}>
                        <h3 className="text-xl text-slate-400">FINANZEN</h3>
                        <div className="text-5xl font-mono text-emerald-400">
                            {Math.floor(interpolate(frame, [30, 80], [0, 1250]))} €
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${interpolate(frame, [30, 80], [0, 75])}%` }}></div>
                        </div>
                    </div>

                    {/* Card 2: Bets */}
                    <div className="glass p-6 rounded-2xl h-64 flex flex-col justify-between"
                        style={{
                            transform: `translateY(${spring({ frame: frame - 20, fps, config: { damping: 12 } }) * -20 + 20}px)`,
                            opacity: interpolate(frame, [20, 40], [0, 1])
                        }}>
                        <h3 className="text-xl text-slate-400">WETTEN</h3>
                        <div className="flex flex-col gap-2">
                            <div className="bg-slate-800 p-2 rounded flex justify-between animate-pulse">
                                <span>Ric gewinnt</span>
                                <span className="text-emerald-400">2.5x</span>
                            </div>
                            <div className="bg-slate-800 p-2 rounded flex justify-between">
                                <span>Niemand trifft</span>
                                <span className="text-emerald-400">5.0x</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Guests */}
                    <div className="glass p-6 rounded-2xl h-64 flex flex-col justify-between"
                        style={{
                            transform: `translateY(${spring({ frame: frame - 30, fps, config: { damping: 12 } }) * -20 + 20}px)`,
                            opacity: interpolate(frame, [30, 50], [0, 1])
                        }}>
                        <h3 className="text-xl text-slate-400">GÄSTE</h3>
                        <div className="text-5xl font-bold text-white">
                            {Math.floor(interpolate(frame, [40, 90], [0, 42]))}
                        </div>
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-emerald-500/20"></div>)}
                        </div>
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
