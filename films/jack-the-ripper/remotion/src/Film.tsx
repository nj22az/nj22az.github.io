import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import data from './data.json';
import beatsJson from './beats.json';
import '@fontsource/pirata-one/400.css';
import '@fontsource/im-fell-english/400.css';
import '@fontsource/im-fell-english/400-italic.css';
import '@fontsource/im-fell-english-sc/400.css';

/* The edit. One clock: the song's seconds (t = frame / fps). Blender photographed each shot as a plate of the set
   and a 12-a-second pass of the cast; here they are laid together, moved, fogged, lettered and cut to the song. */

type Fg = {box: number[] | null; head: number[] | null; hand: number[] | null};
type Shot = {name: string; t0: number; t1: number; frames: number; plates: number[]; bg: boolean; fg: Record<string, Fg>};
const SHOTS = Object.fromEntries((data.shots as unknown as Shot[]).map((s) => [s.name, s]));
const BEATS: number[] = beatsJson.beats;

const CREAM = '#f3e3c3';
const BLOOD = '#b3121d';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const span = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (u: number) => u * u * (3 - 2 * u);
const pulse = (t: number, a: number, b: number, fin = 0.4, fout = 0.4) => Math.min(span(t, a, a + fin), 1 - span(t, b - fout, b));

/* ---------------------------------------------------------------- the cutting copy */
type Cut = {shot: string; from: number; to: number; src?: number; mirror?: boolean; move?: [number, number, number, number, number, number]};
// move: scale from → to, then the drift of the picture in per cent of its width and height, from → to
const CUTS: Cut[] = [
  {shot: 's00_pub', from: 0, to: 5.05, move: [1.0, 1.16, 0, -1.5, 0, 2.5]},
  {shot: 's01_wide', from: 5.05, to: 8.3, src: 5.05, move: [1.0, 1.1, 0, 0, 0, 0]},
  {shot: 's02_boots', from: 8.3, to: 12.29, move: [1.04, 1.04, 1.5, -1.5, 0, 0]},
  {shot: 's03_shadow', from: 12.29, to: 18.75, move: [1.0, 1.07, 0, 1.5, 0, 0]},
  {shot: 's04_moon', from: 18.75, to: 24.65, move: [1.08, 1.0, 0, 0, 2, 0]},
  {shot: 's05_alone', from: 24.65, to: 27.6, move: [1.0, 1.08, 0, 0, 0, 0]},
  {shot: 's06_scream', from: 27.6, to: 33.67, move: [1.0, 1.06, 0, -1, 0, 0]},
  {shot: 's07_blade', from: 33.67, to: 41.73, move: [1.14, 1.0, 0, 0, 3, 0]},
  {shot: 's08_dance', from: 41.73, to: 47.07, move: [1.0, 1.06, 0, 0, 0, 0]},
  {shot: 's09_smoke', from: 47.07, to: 52.34, move: [1.05, 1.0, -1.5, 1.5, 0, 0]},
  {shot: 's10_blood', from: 52.34, to: 57.85, move: [1.0, 1.08, 0, 0, 0, 0]},
  {shot: 's11_grapple', from: 57.85, to: 63.59, move: [1.0, 1.05, 0, 0, 0, 0]},
  {shot: 's12_skyline', from: 63.59, to: 68.3, move: [1.12, 1.0, 2, -2, 2, 0]},
  {shot: 's13_stain', from: 68.3, to: 76.28, move: [1.0, 1.08, 0, 1, 0, 0]},
  {shot: 's14_hats', from: 76.28, to: 84.5, move: [1.06, 1.0, 1.5, -1.5, 0, 0]},
  {shot: 's15_knives', from: 84.5, to: 91.2, move: [1.0, 1.1, 0, 0, 0, 1]},
  {shot: 's16_art', from: 91.2, to: 98.3, move: [1.06, 1.0, 0, 0, 0, 0]},
  {shot: 's17_dance', from: 98.3, to: 103.95, move: [1.0, 1.06, 1, -1, 0, 0]},
  {shot: 's18_smoke', from: 103.95, to: 109.15, move: [1.07, 1.0, 0, 0, 1, 0]},
  {shot: 's10_blood', from: 109.15, to: 114.6, src: 52.34, mirror: true, move: [1.08, 1.0, 0, 0, 0, 0]},
  {shot: 's20_grapple', from: 114.6, to: 130.0, move: [1.0, 1.1, 0, 0, 0, 0.5]},
];
const CHORUS: [number, number][] = [[41.73, 63.59], [98.3, 123.3]];
const inChorus = (t: number) => CHORUS.some(([a, b]) => t >= a && t < b);

const pad = (n: number) => String(n).padStart(4, '0');

const Picture: React.FC<{cut: Cut; t: number}> = ({cut, t}) => {
  const shot = SHOTS[cut.shot];
  const ts = t - cut.from + (cut.src ?? cut.from);                    // the shot's own second
  const f = Math.max(0, Math.min(shot.frames - 1, Math.floor((ts - shot.t0) * 12 + 1e-4)));
  const fg = shot.fg[String(f)];
  const u = ease(span(t, cut.from, cut.to));
  const [s0, s1, x0, x1, y0, y1] = cut.move ?? [1, 1.04, 0, 0, 0, 0];
  const sc = s0 + (s1 - s0) * u;
  // the plate; where the light changes within a shot there are two, and the lamp gutters between them
  let second = 0;
  if (shot.plates.length > 1) {
    const g = span(ts, 16.2, 16.9);
    second = g <= 0 ? 0 : g >= 1 ? 1 : Math.min(1, g + 0.35 * (random(`gut${Math.floor(ts * 24)}`) - 0.5));
  }
  return (
    <AbsoluteFill style={{transform: `scale(${(cut.mirror ? -1 : 1) * sc}, ${sc}) translate(${x0 + (x1 - x0) * u}%, ${y0 + (y1 - y0) * u}%)`}}>
      {shot.bg ? <Img src={staticFile(`film/${shot.name}/bg_0.png`)} style={{position: 'absolute', width: '100%', height: '100%'}} /> : null}
      {shot.bg && shot.plates.length > 1 && second > 0 ? (
        <Img src={staticFile(`film/${shot.name}/bg_1.png`)} style={{position: 'absolute', width: '100%', height: '100%', opacity: second}} />
      ) : null}
      <Fog t={t} level={inChorus(t) ? 0.28 : 0.14} speed={9} file="fog-b.png" top={30} />
      {fg && fg.box ? (
        <Img
          src={staticFile(`film/${shot.name}/fgc_${pad(f)}.png`)}
          style={{position: 'absolute', left: `${fg.box[0] * 100}%`, top: `${(1 - fg.box[3]) * 100}%`, width: `${(fg.box[1] - fg.box[0]) * 100}%`, height: `${(fg.box[3] - fg.box[2]) * 100}%`}}
        />
      ) : null}
      {fg && fg.head && fg.box ? <FaceMist x={fg.head[0]} y={fg.head[1]} t={t} size={(fg.box[3] - fg.box[2]) * 0.3} /> : null}
      {cut.shot === 's07_blade' && fg && fg.hand ? <Glint x={fg.hand[0]} y={fg.hand[1]} k={pulse(t, 35.0, 37.4, 0.25, 1.2)} t={t} /> : null}
      {cut.shot === 's15_knives' && fg && fg.hand ? <Slashes t={t} x={fg.hand[0]} y={fg.hand[1]} /> : null}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- weather */
const Fog: React.FC<{t: number; level: number; speed: number; file: string; top: number; tint?: string}> = ({t, level, speed, file, top, tint}) => (
  <AbsoluteFill
    style={{
      backgroundImage: `url(${staticFile(file)})`,
      backgroundSize: '160% 120%',
      backgroundPosition: `${-t * speed}px ${Math.sin(t * 0.21) * 14}px`,
      opacity: level,
      filter: tint ?? 'sepia(1) hue-rotate(175deg) saturate(1.6) brightness(0.9)',
      WebkitMaskImage: `linear-gradient(to bottom, transparent ${top}%, black 82%)`,
      maskImage: `linear-gradient(to bottom, transparent ${top}%, black 82%)`,
      mixBlendMode: 'screen',
    }}
  />
);

// The owner: his face is never seen. Over the mist Blender hangs on him, the edit lays its own, turning slowly.
const FaceMist: React.FC<{x: number; y: number; t: number; size: number}> = ({x, y, t, size}) => {
  const s = Math.max(0.07, Math.min(0.42, size)) * 100;
  return (
    <div style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: 0, height: 0}}>
      {[0, 1, 2].map((i) => {
        const w = s * (0.95 + i * 0.4);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${w}vh`, height: `${w * 0.8}vh`, left: `${-w / 2}vh`, top: `${-w * 0.62}vh`,
              backgroundImage: `radial-gradient(closest-side, rgba(${14 + i * 10},${19 + i * 12},${31 + i * 16},${0.96 - i * 0.3}) 40%, rgba(30,42,62,0) 100%), url(${staticFile('wisp.png')})`,
              filter: 'brightness(0.42) sepia(1) hue-rotate(180deg) saturate(1.4)',
              opacity: 0.95 - i * 0.22,
              backgroundSize: '100% 100%, 180% 180%',
              backgroundPosition: `0 0, ${t * (13 + i * 9)}px ${t * (5 - i * 6)}px`,
              WebkitMaskImage: 'radial-gradient(closest-side, black 40%, transparent 100%)',
              maskImage: 'radial-gradient(closest-side, black 40%, transparent 100%)',
              transform: `rotate(${Math.sin(t * 0.7 + i * 2) * 14}deg) translate(${Math.sin(t * 1.3 + i) * 0.6}vh, ${Math.cos(t * 1.1 + i * 3) * 0.5}vh)`,
            }}
          />
        );
      })}
    </div>
  );
};

const Rain: React.FC<{t: number; k: number}> = ({t, k}) => (
  <AbsoluteFill style={{opacity: 0.5 * k, transform: 'rotate(9deg) scale(1.4)'}}>
    {[0, 1, 2].map((i) => (
      <AbsoluteFill
        key={i}
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent 0 ${23 + i * 17}px, rgba(190,210,235,${0.22 - i * 0.05}) ${23 + i * 17}px ${24 + i * 17}px)`,
          WebkitMaskImage: `repeating-linear-gradient(0deg, black 0 ${40 + i * 30}px, transparent ${40 + i * 30}px ${150 + i * 60}px)`,
          WebkitMaskPosition: `0 ${t * (1500 - i * 380)}px`,
          backgroundPosition: `${i * 9}px 0`,
        }}
      />
    ))}
  </AbsoluteFill>
);

// "Blood on the streets": red petals let fall over the dance, never anything worse
const Petals: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => (
  <AbsoluteFill style={{opacity: pulse(t, t0, t1, 0.2, 0.5)}}>
    {Array.from({length: 70}).map((_, i) => {
      const r = (k: string) => random(`petal-${i}-${k}`);
      const life = 2.6 + r('l') * 2.2;
      const u = (((t - t0) / life + r('p')) % 1 + 1) % 1;
      const depth = 0.5 + r('d');
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${r('x') * 104 - 2 + Math.sin(u * 7 + i) * 3}%`,
            top: `${u * 118 - 8}%`,
            width: 13 * depth, height: 9 * depth,
            borderRadius: '70% 20% 70% 20%',
            background: `linear-gradient(135deg, #e3202c, #7a0710)`,
            transform: `rotate(${u * 520 * (r('s') > 0.5 ? 1 : -1) + i * 40}deg) scaleX(${Math.cos(u * 11 + i)})`,
            filter: depth > 1.2 ? 'blur(1.2px)' : undefined,
            opacity: 0.9,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

// "A blade gleams silver": a star of light at his hand, nothing drawn
const Glint: React.FC<{x: number; y: number; k: number; t: number}> = ({x, y, k, t}) => (
  <div style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, opacity: k, transform: `rotate(${20 + t * 40}deg) scale(${0.4 + k * (1 + 0.15 * Math.sin(t * 30))})`}}>
    {[0, 90, 45, 135].map((a, i) => (
      <div key={a} style={{position: 'absolute', width: i < 2 ? 260 : 110, height: i < 2 ? 3 : 2, left: i < 2 ? -130 : -55, top: -1, transform: `rotate(${a}deg)`, background: 'linear-gradient(90deg, transparent, #eaf6ff 50%, transparent)'}} />
    ))}
    <div style={{position: 'absolute', width: 60, height: 60, left: -30, top: -30, borderRadius: '50%', background: 'radial-gradient(closest-side, #ffffff, rgba(200,230,255,0.5) 40%, transparent)'}} />
  </div>
);

// "Knives carve stories in the dark": silver strokes of light that follow each flourish of his arm
const Slashes: React.FC<{t: number; x: number; y: number}> = ({t, x, y}) => {
  const period = 1.5 / 0.7;
  return (
    <>
      {[0, 1, 2].map((i) => {
        const t0 = 84.9 + period * i + 0.75;
        const u = span(t, t0, t0 + 0.28);
        const fade = 1 - span(t, t0 + 0.25, t0 + 1.1);
        if (t < t0 || fade <= 0) return null;
        const ang = [-32, 28, -14][i];
        return (
          <div key={i} style={{position: 'absolute', left: `${50 + [-4, 5, 0][i]}%`, top: `${44 + i * 6}%`, width: 0, height: 0, transform: `rotate(${ang}deg)`, opacity: fade}}>
            <div style={{position: 'absolute', left: -520, top: -2, width: 1040, height: 4, background: 'linear-gradient(90deg, transparent, #dff1ff 30%, #ffffff 50%, #dff1ff 70%, transparent)', clipPath: `inset(0 ${(1 - u) * 100}% 0 0)`, filter: 'drop-shadow(0 0 8px #bfe3ff)'}} />
          </div>
        );
      })}
    </>
  );
};

const Smoke: React.FC<{t: number; at: number; x: number; y: number}> = ({t, at, x, y}) => {
  const u = span(t, at - 0.1, at + 1.6);
  if (u <= 0 || u >= 1) return null;
  return (
    <AbsoluteFill>
      {Array.from({length: 9}).map((_, i) => {
        const a = (i / 9) * Math.PI * 2 + random(`smk${i}`) * 0.8;
        const d = ease(u) * (60 + random(`smd${i}`) * 110);
        const w = 150 + u * 260;
        return (
          <div key={i} style={{position: 'absolute', left: `calc(${x * 100}% + ${Math.cos(a) * d - w / 2}px)`, top: `calc(${y * 100}% + ${Math.sin(a) * d * 0.7 - u * 60 - w / 2}px)`, width: w, height: w, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(120,140,170,0.85), rgba(60,75,100,0.4) 55%, transparent)', opacity: (1 - u) * Math.min(1, u * 8), filter: 'blur(6px)'}} />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- the house curtain, drawn here */
const Curtain: React.FC<{open: number}> = ({open}) => {
  if (open >= 1) return null;
  const half = (side: number) => (
    <div
      style={{
        position: 'absolute', top: 0, bottom: 0, width: '52%',
        [side < 0 ? 'left' : 'right']: 0,
        transform: `translateX(${side * ease(open) * 96}%) scaleX(${1 - ease(open) * 0.55})`,
        transformOrigin: side < 0 ? 'left' : 'right',
        background: `repeating-linear-gradient(90deg, #4d0308 0px, #a50f1a 26px, #d0202b 44px, #8a0a14 62px, #3d0206 88px), linear-gradient(#000, #000)`,
        boxShadow: 'inset 0 -140px 120px -40px rgba(0,0,0,0.75), inset 0 60px 80px -30px rgba(0,0,0,0.6)',
      }}
    >
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 26, background: 'repeating-linear-gradient(90deg, #d9a441 0 10px, #8a611a 10px 14px)', opacity: 0.9}} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 108%, rgba(255,190,90,0.34), transparent 55%)'}} />
    </div>
  );
  return (
    <AbsoluteFill>
      {half(-1)}
      {half(1)}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- lettering */
const LYRICS: [number, number, string, 'verse' | 'chorus' | 'name'][] = [
  [6.54, 12.1, 'Footsteps echo on the cobblestone', 'verse'],
  [12.29, 18.5, 'A shadow slips where the gaslight’s blown', 'verse'],
  [18.75, 24.4, 'Fog whispers secrets to the moon', 'verse'],
  [24.65, 27.4, 'Alone', 'verse'],
  [27.6, 33.4, 'A scream gets swallowed by the night', 'verse'],
  [33.67, 36.3, 'A blade gleams silver', 'verse'],
  [36.46, 41.3, 'Catches light', 'verse'],
  [41.73, 43.8, 'Jack the Ripper', 'name'],
  [43.88, 47.0, 'The demon of Whitechapel', 'chorus'],
  [47.07, 48.9, 'He moves like smoke', 'chorus'],
  [48.99, 52.2, 'His steps unravel', 'chorus'],
  [52.34, 54.8, 'Blood on the streets', 'chorus'],
  [54.89, 57.7, 'The devil’s chapel', 'chorus'],
  [57.85, 60.1, 'Jack the Ripper', 'name'],
  [60.16, 63.4, 'No one to grapple', 'chorus'],
  [63.59, 66.3, 'The air smells sharp', 'verse'],
  [66.38, 68.2, 'Like iron and rain', 'verse'],
  [68.3, 76.0, 'The city hides its darkest stain', 'verse'],
  [76.28, 79.0, 'Hats pulled low', 'verse'],
  [79.07, 84.3, 'No one speaks his name', 'verse'],
  [84.5, 89.6, 'Knives carve stories in the dark', 'verse'],
  [89.76, 98.0, 'Each cut a twisted work of art', 'verse'],
  [98.3, 100.9, 'Jack the Ripper', 'name'],
  [101.01, 103.9, 'The demon of Whitechapel', 'chorus'],
  [104.04, 105.9, 'He moves like smoke', 'chorus'],
  [105.96, 109.0, 'His steps unravel', 'chorus'],
  [109.15, 111.6, 'Blood on the streets', 'chorus'],
  [111.7, 114.5, 'The devil’s chapel', 'chorus'],
  [114.57, 116.6, 'Jack the Ripper', 'name'],
  [116.65, 122.5, 'No one to grapple', 'chorus'],
];

const Lyric: React.FC<{t: number}> = ({t}) => {
  const line = LYRICS.find(([a, b]) => t >= a - 0.05 && t < b + 0.35);
  if (!line) return null;
  const [a, b, text, kind] = line;
  const out = 1 - span(t, b, b + 0.35);
  const words = text.split(' ');
  const dur = Math.min(b - a, 2.6);
  if (kind === 'verse') {
    return (
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 54}}>
        <div style={{fontFamily: '"IM Fell English"', fontStyle: 'italic', fontSize: 40, color: CREAM, letterSpacing: 0.5, textShadow: '0 2px 14px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.9)', opacity: out}}>
          {words.map((w, i) => {
            const u = ease(span(t, a + (i / words.length) * dur * 0.7, a + (i / words.length) * dur * 0.7 + 0.45));
            return (
              <span key={i} style={{display: 'inline-block', marginRight: 11, opacity: u, transform: `translateY(${(1 - u) * 12}px)`, filter: `blur(${(1 - u) * 5}px)`}}>
                {w}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }
  const name = kind === 'name';
  const hit = ease(span(t, a - 0.04, a + 0.16));
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: name ? 34 : 44}}>
      <div
        style={{
          fontFamily: '"Pirata One"', fontSize: name ? 116 : 68, lineHeight: 1, color: name ? '#e3202c' : CREAM, letterSpacing: name ? 3 : 1.5,
          WebkitTextStroke: name ? `1.5px ${CREAM}` : undefined,
          textShadow: name ? '0 0 34px rgba(179,18,29,0.75), 0 4px 18px rgba(0,0,0,0.95)' : '0 3px 16px rgba(0,0,0,0.95), 0 0 26px rgba(179,18,29,0.55)',
          opacity: out * Math.min(1, hit * 1.4),
          transform: `scale(${1 + (1 - hit) * (name ? 0.5 : 0.22)}) rotate(${name ? -2 : 0}deg)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const Title: React.FC<{t: number}> = ({t}) => {
  const k = pulse(t, 0.7, 5.0, 1.1, 0.7);
  if (k <= 0) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: k}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0.55), transparent 62%)'}} />
      <div style={{fontFamily: '"IM Fell English SC"', color: CREAM, fontSize: 24, letterSpacing: 9, opacity: span(t, 1.0, 2.0), textShadow: '0 2px 10px #000', marginBottom: 18, position: 'relative'}}>WHITECHAPEL · 1888</div>
      <div style={{fontFamily: '"Pirata One"', color: BLOOD, fontSize: 150, lineHeight: 1.05, WebkitTextStroke: `2px ${CREAM}`, textShadow: '0 0 44px rgba(179,18,29,0.8), 0 6px 24px #000', transform: `scale(${1 + span(t, 0.7, 5) * 0.06})`, letterSpacing: 2, position: 'relative'}}>Jack the Ripper</div>
      <div style={{fontFamily: '"IM Fell English"', fontStyle: 'italic', color: CREAM, fontSize: 40, opacity: span(t, 2.0, 3.2), textShadow: '0 2px 12px #000', marginTop: 10, position: 'relative'}}>a killer is loose</div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const k = span(t, 127.0, 128.0);
  if (k <= 0) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: k}}>
      <div style={{fontFamily: '"Pirata One"', color: CREAM, fontSize: 96, textShadow: '0 4px 22px #000, 0 0 30px rgba(0,0,0,0.8)'}}>A killer is loose</div>
      <div style={{fontFamily: '"IM Fell English SC"', color: CREAM, fontSize: 22, letterSpacing: 7, marginTop: 14, opacity: 0.85, textShadow: '0 2px 10px #000'}}>HE WAS NEVER CAUGHT</div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- the film */
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cut = CUTS.find((c) => t >= c.from && t < c.to) ?? CUTS[CUTS.length - 1];

  // the beat: a breath of light in the choruses
  let since = 9;
  for (const b of BEATS) if (b <= t) since = t - b;
  const beat = inChorus(t) ? Math.exp(-since * 9) : 0;
  const flash = Math.max(...[41.73, 98.3, 52.34, 109.15].map((c) => (t >= c ? Math.exp(-(t - c) * 7) : 0)));
  const scream = t >= 27.6 ? Math.exp(-(t - 27.6) * 5) : 0;                       // the scream: the stage blinks white, then dark
  const dark = pulse(t, 27.9, 29.6, 0.2, 1.2) * 0.45;

  const curtain = t < 5.05 ? 2 : t < 9 ? span(t, 5.5, 7.6) : t > 124 ? 1 - span(t, 124.6, 126.6) : 1;
  const vanish = [SHOTS.s11_grapple, SHOTS.s20_grapple].map((s, i) => {
    const at = i === 0 ? 57.85 + 2.65 : 123.3;
    const f = Math.floor((at - 0.15 - s.t0) * 12);
    const h = s.fg[String(f)]?.head;
    return {at, x: h ? h[0] : 0.5, y: h ? h[1] + 0.12 : 0.5};
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#05060a'}}>
      <AbsoluteFill style={{filter: `brightness(${1 + beat * 0.1 + flash * 0.5 + scream * 0.9 - dark}) contrast(1.06) saturate(1.12)`}}>
        <Picture cut={cut} t={t} />
        {vanish.map((v) => (
          <Smoke key={v.at} t={t} at={v.at} x={v.x} y={v.y} />
        ))}
        <Fog t={t} level={inChorus(t) ? 0.4 : 0.2} speed={22} file="fog-a.png" top={inChorus(t) ? 38 : 52} />
        {inChorus(t) ? <Fog t={t + 40} level={0.22} speed={-14} file="fog-b.png" top={0} /> : null}
        <Rain t={t} k={pulse(t, 63.59, 84.5, 0.8, 1.2)} />
        <Petals t={t} t0={52.34} t1={57.85} />
        <Petals t={t} t0={109.15} t1={114.6} />
        <Curtain open={curtain === 2 ? 1 : curtain} />
      </AbsoluteFill>
      {/* the grade: a vignette, and grain that changes with every picture */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, transparent 52%, rgba(0,0,0,0.62) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain.png')})`, backgroundPosition: `${Math.floor(random(`gx${frame}`) * 640)}px ${Math.floor(random(`gy${frame}`) * 360)}px`, opacity: 0.07, mixBlendMode: 'overlay'}} />
      <Title t={t} />
      <Lyric t={t} />
      <EndCard t={t} />
      <AbsoluteFill style={{backgroundColor: '#000', opacity: Math.max(1 - span(t, 0, 0.9), span(t, 129.0, 129.9))}} />
      <Audio src={staticFile('song.mp3')} />
    </AbsoluteFill>
  );
};
