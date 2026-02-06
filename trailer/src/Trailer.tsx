import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const Trailer: React.FC = () => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 60], [0, 1]);

    return (
        <AbsoluteFill style={{ backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
            <h1 style={{ color: 'white', opacity, fontSize: 100 }}>Pitmaster</h1>
        </AbsoluteFill>
    );
};
