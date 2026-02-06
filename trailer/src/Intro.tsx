import { AbsoluteFill, useCurrentFrame, interpolate, Img, spring, useVideoConfig } from 'remotion';
import { staticFile } from 'remotion';

export const Intro: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = interpolate(frame, [0, 20], [0, 1]);

    const scale = spring({
        frame: frame - 10,
        fps,
        config: { damping: 10, stiffness: 100 }
    });

    const textOpacity = interpolate(frame, [30, 50], [0, 1]);

    return (
        <AbsoluteFill className="bg-black flex items-center justify-center">
            {/* Animated Background Mesh */}
            <AbsoluteFill className="bg-slate-900 opacity-50 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/40 via-black to-black"></div>
            </AbsoluteFill>

            <div className="z-10 flex flex-col items-center">
                <div style={{ transform: `scale(${scale})`, opacity }}>
                    <Img src={staticFile("logo.png")} className="w-64 h-64 object-contain drop-shadow-[0_0_30px_rgba(57,255,20,0.6)]" />
                </div>

                <h1 style={{ opacity: textOpacity }} className="text-7xl mt-10 font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-sans tracking-tight">
                    PITMASTER
                </h1>
                <p style={{ opacity: interpolate(frame, [50, 70], [0, 1]) }} className="text-2xl text-slate-400 mt-4 font-light tracking-widest uppercase">
                    The Ultimate Party OS
                </p>
            </div>
        </AbsoluteFill>
    );
};
