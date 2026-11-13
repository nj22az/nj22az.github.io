import React from 'react';
import {AbsoluteFill, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/limelight/400.css';
import {AnchorL, AnchorR, BottomArc, CopyName, CopySign, LOGO, Mark, PropL, PropR, Ring, Stamp, TitleArc} from './Logo';

/* The studio's card before the film, made as the title cards of 1930s cartoons were: a painted card under a
   projector. A dark sepia ground with a slow sunburst, a ruled frame, the owner's mark on a cream medallion, and the
   credits lettered under it on the card's centre line. The mark is the owner's own drawing, traced to vectors
   (Logo.tsx), so each part can come on by itself: the sailor drops in and lands with a squash, the two arcs of
   lettering swing round into place, the propellers and anchors pop on and the propellers turn. The projector does
   the rest: the picture weaves in the gate, the lamp flickers, dust and a scratch or two go through, and an iris
   opens and closes it. In the manner of those cards; no studio's card is copied. */
export const INTRO = 144;                      // pictures: 6 s at 24

const CREAM = '#f1e6c8';
const INK = '#17120d';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const span = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (u: number) => u * u * (3 - 2 * u);
const back = (u: number) => 1 + 2.2 * Math.pow(u - 1, 3) + 1.2 * Math.pow(u - 1, 2);       // arrives a little past, and settles
const CY = 0.44;                                // the card's centre of interest, as a part of its height
const SIZE = 500;                               // the mark's square, in pixels
const VB = 840;                                 // and in the drawing's own units

export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = f / fps;
  const iris = Math.min(interpolate(t, [0.1, 0.9], [0, 130], clamp), interpolate(t, [5.15, 5.85], [130, 0], clamp));

  // the sailor: falls, lands, squashes, springs back; afterwards he bobs as if he were walking on the spot
  const land = 1.05;
  const fall = interpolate(t, [0.55, land], [-560, 0], {...clamp, easing: (u) => u * u});
  const s = Math.max(0, t - land);
  const spring = Math.exp(-6.5 * s) * Math.cos(17 * s);
  const sx = t < land ? 1 : 1 + 0.15 * spring;
  const sy = t < land ? 1 : 1 - 0.19 * spring;
  const walk = t > land + 0.6 ? Math.sin((t - land) * Math.PI * 4) : 0;
  const base = LOGO.cy + 197;                    // the inner ring's foot: what the sailor lands on
  const markOn = t >= 0.55 ? 1 : 0;

  const medal = back(span(t, 0.25, 0.85));
  const top = ease(span(t, 1.15, 1.85)); const bottom = ease(span(t, 1.3, 2.0));
  const pop = (a: number) => { const u = span(t, a, a + 0.28); return u <= 0 ? 0 : back(u); };
  const spin = Math.max(0, t - 1.9) * 210 + 360 * ease(span(t, 1.9, 2.6));

  // the projector: weave, flicker, dust, a scratch
  const weaveX = (random(`wx${f}`) - 0.5) * 2.0 + Math.sin(t * 1.7) * 0.8;
  const weaveY = (random(`wy${f}`) - 0.5) * 1.6 + Math.sin(t * 2.3) * 0.7;
  const flicker = 0.94 + 0.08 * random(`fl${f}`);
  const scratchX = 12 + random(`sx${Math.floor(f / 7)}`) * 76;
  const scratchOn = random(`so${Math.floor(f / 7)}`) > 0.55;

  const letters = 'PRESENTS'.split('');
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill style={{clipPath: `circle(${iris}% at 50% ${CY * 100}%)`, transform: `translate(${weaveX}px, ${weaveY}px)`, filter: `brightness(${flicker}) sepia(0.28) contrast(1.06)`}}>
        {/* the painted ground and its sunburst */}
        <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 85% at 50% ${CY * 100}%, #4a3b2b 0%, #2a2118 55%, #0e0b08 100%)`}} />
        <AbsoluteFill style={{background: `repeating-conic-gradient(from ${t * 5}deg at 50% ${CY * 100}%, rgba(241,230,200,0.11) 0deg 5deg, rgba(241,230,200,0) 5deg 10deg)`, WebkitMaskImage: `radial-gradient(ellipse 70% 90% at 50% ${CY * 100}%, black 20%, transparent 78%)`, maskImage: `radial-gradient(ellipse 70% 90% at 50% ${CY * 100}%, black 20%, transparent 78%)`}} />
        {/* the ruled frame, with a stud at each corner */}
        <div style={{position: 'absolute', inset: 24, border: `2px solid ${CREAM}`, opacity: 0.85}} />
        <div style={{position: 'absolute', inset: 33, border: `1px solid ${CREAM}`, opacity: 0.6}} />
        {[[24, 24], [width - 24, 24], [24, height - 24], [width - 24, height - 24]].map(([x, y], i) => (
          <div key={i} style={{position: 'absolute', left: x - 7, top: y - 7, width: 14, height: 14, borderRadius: '50%', background: CREAM, boxShadow: '0 0 0 3px #1c1610'}} />
        ))}
        {/* the medallion */}
        <div style={{position: 'absolute', left: width / 2 - 262, top: height * CY - 262, width: 524, height: 524, borderRadius: '50%', background: CREAM, boxShadow: `0 0 0 5px ${INK}, 0 0 0 8px ${CREAM}, 0 0 0 10px ${INK}, 0 14px 50px rgba(0,0,0,0.65)`, transform: `scale(${medal})`}} />
        {/* the mark, part by part */}
        <svg viewBox={`${LOGO.cx - VB / 2} ${LOGO.cy - VB / 2} ${VB} ${VB}`} width={SIZE} height={SIZE} style={{position: 'absolute', left: width / 2 - SIZE / 2, top: height * CY - SIZE / 2, color: INK, overflow: 'visible', opacity: medal > 0.5 ? 1 : 0}}>
          <defs><Stamp /></defs>
          {/* the outer ring comes with the medallion: it is concentric with it and with the inner ring */}
          <g filter="url(#stamp)"><Ring /></g>
          <g opacity={markOn} filter="url(#stamp)" transform={`translate(0 ${fall + walk * 1.6}) translate(${LOGO.cx} ${base}) scale(${sx} ${sy}) rotate(${spring * 2.2 + walk * 0.5}) translate(${-LOGO.cx} ${-base})`}>
            <Mark ground={CREAM} />
          </g>
          <g opacity={top} filter="url(#stamp)" transform={`rotate(${(1 - top) * -38} ${LOGO.cx} ${LOGO.cy})`}><TitleArc ground={CREAM} /></g>
          <g opacity={bottom} filter="url(#stamp)" transform={`rotate(${(1 - bottom) * 38} ${LOGO.cx} ${LOGO.cy})`}><BottomArc /></g>
          {([[PropL, LOGO.propL, 2.05, 1], [PropR, LOGO.propR, 2.15, -1]] as const).map(([P, c, at, dir], i) => (
            <g key={i} filter="url(#stamp)"><g transform={`translate(${c[0]} ${c[1]}) scale(${pop(at)}) rotate(${dir * spin}) translate(${-c[0]} ${-c[1]})`}><P /></g></g>
          ))}
          {([[AnchorL, [279.5, 502.5], 2.25], [AnchorR, [884, 502.5], 2.35]] as const).map(([A, c, at], i) => (
            <g key={i} filter="url(#stamp)"><g transform={`translate(${c[0]} ${c[1]}) scale(${pop(at)}) translate(${-c[0]} ${-c[1]})`}><A /></g></g>
          ))}
        </svg>
        {/* the credits, on the card's centre line */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 586, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22}}>
          <div style={{width: 150 * ease(span(t, 2.7, 3.3)), height: 2, background: CREAM, opacity: 0.8}} />
          <div style={{fontFamily: 'Limelight', fontSize: 46, lineHeight: 1, color: CREAM, letterSpacing: 12, paddingLeft: 12, textShadow: '0 3px 0 #1c1610, 0 6px 14px rgba(0,0,0,0.6)'}}>
            {letters.map((ch, i) => {
              const u = span(t, 2.75 + i * 0.07, 2.75 + i * 0.07 + 0.22);
              return <span key={i} style={{display: 'inline-block', opacity: u > 0 ? 1 : 0, transform: `translateY(${(1 - back(u)) * 26}px) scale(${0.6 + 0.4 * back(u)})`}}>{ch}</span>;
            })}
          </div>
          <div style={{width: 150 * ease(span(t, 2.7, 3.3)), height: 2, background: CREAM, opacity: 0.8}} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 652, textAlign: 'center', fontFamily: '"IM Fell English SC"', fontSize: 17, letterSpacing: 5, color: CREAM, opacity: 0.9 * ease(span(t, 3.5, 4.1))}}>
          A JOHANSSON MUSICAL CARTOON &nbsp;◆&nbsp; MMXXVI
        </div>
        {/* the owner's own copyright line, in his lettering, where he wants it: the bottom right corner, the sign after the name */}
        <svg viewBox="730 736 264 36" width={176} height={24} style={{position: 'absolute', right: 52, bottom: 48, color: CREAM, opacity: 0.92 * ease(span(t, 3.7, 4.3))}}>
          <g transform={`translate(${LOGO.copyDx[0]} 0)`}><CopyName /></g>
          <g transform={`translate(${LOGO.copyDx[1]} 0)`}><CopySign /></g>
        </svg>
        {/* dust, a scratch, the corners falling off */}
        {Array.from({length: 7}).map((_, i) => random(`d${f}-${i}`) > 0.55 ? (
          <div key={i} style={{position: 'absolute', left: `${random(`dx${f}-${i}`) * 100}%`, top: `${random(`dy${f}-${i}`) * 100}%`, width: 2 + random(`dw${f}-${i}`) * 3, height: 2 + random(`dh${f}-${i}`) * 3, borderRadius: '50%', background: random(`dc${f}-${i}`) > 0.5 ? 'rgba(0,0,0,0.7)' : 'rgba(255,250,235,0.55)'}} />
        ) : null)}
        {scratchOn ? <div style={{position: 'absolute', top: 0, bottom: 0, left: `${scratchX}%`, width: 1.5, background: 'rgba(255,248,230,0.28)'}} /> : null}
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(0,0,0,0.72) 100%)'}} />
        <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain.png')})`, backgroundPosition: `${Math.floor(random(`gx${f}`) * 640)}px ${Math.floor(random(`gy${f}`) * 360)}px`, opacity: 0.16, mixBlendMode: 'overlay'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
