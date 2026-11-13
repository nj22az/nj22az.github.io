import React from 'react';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import {Film} from './Film';
import {Intro, INTRO} from './Intro';

// The studio's card (6 s), then the film at 24 pictures a second: the song is 130 s, and the last card stands over
// the closed curtain a little past its end so that it can be read (Film.tsx, EndCard), then fades to black by 132.4 s:
// 132.5 s, 3180 pictures, the last ones black.
const Reel: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence durationInFrames={INTRO}><Intro /></Sequence>
    <Sequence from={INTRO}><Film /></Sequence>
  </AbsoluteFill>
);
export const Root: React.FC = () => (
  <Composition id="JackTheRipper" component={Reel} durationInFrames={INTRO + 3180} fps={24} width={1280} height={720} />
);
