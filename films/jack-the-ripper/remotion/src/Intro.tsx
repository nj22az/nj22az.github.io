import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

/* The studio's card before the film: the owner's Johansson Animation Studios mark, brought on like the head of an
   old cartoon reel: an iris opens, the mark drops in with a squash and settles, its two propellers spin, the line
   boils a little as hand-drawn ink does, and the iris closes on it. The mark itself is the owner's drawing, unaltered. */
export const INTRO = 114;                       // pictures: 4.75 s at 24

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// the propellers' places in the cropped mark (1000 x 800), and their size
const PROPS = [{x: 202, y: 410, r: 52, dir: 1}, {x: 850, y: 410, r: 52, dir: -1}];

export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const iris = Math.min(interpolate(t, [0.15, 1.0], [0, 120], clamp), interpolate(t, [4.0, 4.6], [120, 0], clamp));
  // the drop: falls from above, squashes on landing, springs back and settles
  const land = 0.75;
  const fall = interpolate(t, [0.25, land], [-70, 0], {...clamp, easing: (u) => u * u});
  const s = Math.max(0, t - land);
  const spring = Math.exp(-6.5 * s) * Math.cos(17 * s);
  const sx = t < land ? 1 : 1 + 0.16 * spring;
  const sy = t < land ? 1 : 1 - 0.2 * spring;
  const boil = Math.floor(f / 3);               // the ink changes on threes
  const spin = interpolate(t, [0.9, 4.2], [0, 1], clamp);
  const H = 560; const k = H / 800;
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #fbf3df, #ecdcb8 70%, #d9c391)', clipPath: `circle(${iris}% at 50% 50%)`}}>
        <svg width="0" height="0">
          <filter id="boil">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={boil} />
            <feDisplacementMap in="SourceGraphic" scale="3.2" />
          </filter>
        </svg>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'relative', width: 1000 * k, height: H, transform: `translateY(${fall}%) scale(${sx}, ${sy}) rotate(${spring * 2.5}deg)`, transformOrigin: '50% 100%', filter: 'url(#boil)', mixBlendMode: 'multiply'}}>
            <Img src={staticFile('logo.png')} style={{width: '100%', height: '100%'}} />
            {PROPS.map((p, i) => (
              <div key={i} style={{position: 'absolute', left: (p.x - p.r) * k, top: (p.y - p.r) * k, width: 2 * p.r * k, height: 2 * p.r * k, borderRadius: '50%', overflow: 'hidden', background: '#fff'}}>
                <div style={{width: '100%', height: '100%', transform: `rotate(${p.dir * (spin * spin * (3 - 2 * spin)) * 1080}deg)`, backgroundImage: `url(${staticFile('logo.png')})`, backgroundSize: `${1000 * k}px ${H}px`, backgroundPosition: `${-(p.x - p.r) * k}px ${-(p.y - p.r) * k}px`}} />
              </div>
            ))}
          </div>
        </AbsoluteFill>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 44, textAlign: 'center', fontFamily: '"IM Fell English SC"', letterSpacing: 8, fontSize: 22, color: '#1a1410', opacity: interpolate(t, [1.5, 2.2, 3.8, 4.2], [0, 1, 1, 0], clamp)}}>PRESENTS</div>
        {/* an old reel: the light flickers and a hair or two runs through the gate */}
        <AbsoluteFill style={{backgroundColor: '#000', opacity: 0.05 * random(`fl${f}`)}} />
        <div style={{position: 'absolute', top: 0, bottom: 0, width: 1.5, left: `${20 + random(`sc${Math.floor(f / 5)}`) * 60}%`, background: 'rgba(40,30,20,0.25)', opacity: random(`so${f}`) > 0.6 ? 1 : 0}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(60,40,10,0.45) 100%)'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
