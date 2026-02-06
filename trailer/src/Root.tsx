import { Composition } from 'remotion';
import { Series } from 'remotion';
import { Intro } from './Intro';
import { FeatureShowcase } from './FeatureShowcase';
import { TVView } from './TVView';
import './style.css';

const MainSequence: React.FC = () => {
    return (
        <Series>
            <Series.Sequence durationInFrames={150}>
                <Intro />
            </Series.Sequence>
            <Series.Sequence durationInFrames={180}>
                <FeatureShowcase />
            </Series.Sequence>
            <Series.Sequence durationInFrames={300}>
                <TVView />
            </Series.Sequence>
        </Series>
    );
};

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Trailer"
                component={MainSequence}
                durationInFrames={630} // 150 + 180 + 300 = 630 frames (~21 sec)
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{}}
            />
        </>
    );
};
