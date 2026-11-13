import React from 'react';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import {Film} from './Film';
import {Intro, INTRO} from './Intro';

// The studio's card (6 s), then 129.96 s of song at 24 pictures a second: 3119 pictures, the last one black.
const Reel: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence durationInFrames={INTRO}><Intro /></Sequence>
    <Sequence from={INTRO}><Film /></Sequence>
  </AbsoluteFill>
);
export const Root: React.FC = () => (
  <Composition id="JackTheRipper" component={Reel} durationInFrames={INTRO + 3119} fps={24} width={1280} height={720} />
);
