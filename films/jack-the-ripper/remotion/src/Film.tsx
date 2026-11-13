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
type Step = {t: number; x: number; y: number};
type Shot = {name: string; t0: number; t1: number; fps: number; frames: number; plates: number[]; bg: boolean; fg: Record<string, Fg>; steps: Step[]};
const SHOTS = Object.fromEntries((data.shots as unknown as Shot[]).map((s) => [s.name, s]));
const BEATS: number[] = beatsJson.beats;

const CREAM = '#f3e3c3';
const BLOOD = '#b3121d';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const span = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (u: number) => u * u * (3 - 2 * u);
const pulse = (t: number, a: number, b: number, fin = 0.4, fout = 0.4) => Math.min(span(t, a, a + fin), 1 - span(t, b - fout, b));

/* ---------------------------------------------------------------- the cutting copy */
type Cut = {shot: string; from: number; to: number; src?: number; mirror?: boolean; move?: [number, number, number, number, number, number]; soft?: number; tilt?: number; origin?: string};
// move: scale from → to, then the drift of the picture in per cent of its width and height, from → to.
// soft: how far the set behind is thrown out of focus (a long lens close on Polly). tilt: the horizon, in degrees.
const CUTS: Cut[] = [
  {shot: 's00_pub', from: 0, to: 5.05, move: [1.0, 1.16, 0, -1.5, 0, 2.5]},
  {shot: 'a01_wide', from: 5.05, to: 8.3, move: [1.0, 1.22, 0, 0, 0, 1.5]},
  {shot: 'a02_feet', from: 8.3, to: 10.3, move: [1.0, 1.12, 0, 2, 0, -2], origin: '45% 80%'},
  {shot: 'a02b_cobblestone', from: 10.3, to: 12.29, move: [1.0, 1.22, 0, 0, 0, 4], origin: '50% 40%'},
  {shot: 'a03_shadow', from: 12.29, to: 18.75, move: [1.0, 1.1, 0, 1.5, 0, 0], soft: 3},
  {shot: 'a04_moon', from: 18.75, to: 24.65, move: [1.1, 1.0, 0, 0, 2, 0]},
  {shot: 'a05_alone', from: 24.65, to: 27.6, move: [1.0, 1.12, 0, 0, 0, 0], soft: 5, origin: '50% 45%'},
  {shot: 'a06_scream', from: 27.6, to: 33.67, move: [1.25, 1.0, 0, 0, 0, 0]},
  {shot: 'a07_blade', from: 33.67, to: 36.5, move: [1.0, 1.12, 0, -2, 0, 0], origin: '62% 50%'},
  {shot: 'a08_light', from: 36.5, to: 41.73, move: [1.0, 1.14, 0, 0, 0, 0], soft: 3, origin: '50% 38%'},
  {shot: 'c1a_dance', from: 41.73, to: 44.0, move: [1.0, 1.05, 0, 0, 0, 0]},
  {shot: 'c1b_demon', from: 44.0, to: 47.07, move: [1.0, 1.14, 0, 1, 0, 2], origin: '45% 35%'},
  {shot: 'c1c_smoke', from: 47.07, to: 52.34, move: [1.12, 1.18, -1, 1, 0, 0], tilt: -5},
  {shot: 'c1d_blood', from: 52.34, to: 57.85, move: [1.0, 1.1, 0, 0, 0, 0], origin: '50% 40%'},
  {shot: 'c1e_grapple', from: 57.85, to: 60.0, move: [1.0, 1.05, 0, 0, 0, 0]},
  {shot: 'c1f_noone', from: 60.0, to: 63.59, move: [1.0, 1.1, 0, 0, 0, 0], soft: 4, origin: '50% 40%'},
  {shot: 's12_skyline', from: 63.59, to: 68.3, move: [1.12, 1.0, 2, -2, 2, 0]},
  {shot: 'v2a_city', from: 68.3, to: 76.28, move: [1.0, 1.1, 0, 0, 0, 0], origin: '50% 40%'},
  {shot: 'v2b_hats', from: 76.28, to: 79.0, move: [1.06, 1.0, 1.5, -1.5, 0, 0]},
  {shot: 'v2c_name', from: 79.0, to: 84.5, move: [1.0, 1.12, 0, 0, 0, 0], soft: 5, origin: '50% 45%'},
  {shot: 'v2d_knives', from: 84.5, to: 91.2, move: [1.0, 1.1, 0, -1, 0, 0], origin: '55% 45%'},
  {shot: 'v2e_art', from: 91.2, to: 98.3, move: [1.3, 1.0, 0, 0, 0, 0]},
  {shot: 'c2a_dance', from: 98.3, to: 100.9, move: [1.0, 1.06, 1, -1, 0, 0]},
  {shot: 'c2b_demon', from: 100.9, to: 103.95, move: [1.0, 1.12, 0, 0, 0, 0], soft: 2, origin: '45% 40%'},
  {shot: 'c2c_smoke', from: 103.95, to: 109.15, move: [1.12, 1.17, 1, -1, 0, 0], tilt: 4},
  {shot: 'c1d_blood', from: 109.15, to: 114.6, src: 52.34, mirror: true, move: [1.1, 1.0, 0, 0, 0, 0], origin: '50% 40%'},
  {shot: 'c2e_finale', from: 114.6, to: 119.6, move: [1.18, 1.0, 0, 0, 0, 0], soft: 4, origin: '50% 40%'},
  {shot: 'c2f_bow', from: 119.6, to: 130.0, move: [1.0, 1.1, 0, 0, 0, 0.5]},
];
const CHORUS: [number, number][] = [[41.73, 63.59], [98.3, 119.6]];
const inChorus = (t: number) => CHORUS.some(([a, b]) => t >= a && t < b);

const pad = (n: number) => String(n).padStart(4, '0');

const HAZE = 'rgba(96,116,148,';          // the one colour of the fog, everywhere

const Picture: React.FC<{cut: Cut; t: number}> = ({cut, t}) => {
  const shot = SHOTS[cut.shot];
  const ts = t - cut.from + (cut.src ?? cut.from);                    // the shot's own second
  const f = Math.max(0, Math.min(shot.frames - 1, Math.floor((ts - shot.t0) * shot.fps + 1e-4)));
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
  const red = cut.shot === 'c1d_blood';
  return (
    <AbsoluteFill style={{transformOrigin: cut.origin ?? '50% 50%', transform: `rotate(${cut.tilt ?? 0}deg) scale(${(cut.mirror ? -1 : 1) * sc}, ${sc}) translate(${x0 + (x1 - x0) * u}%, ${y0 + (y1 - y0) * u}%)`}}>
      <AbsoluteFill style={{filter: cut.soft ? `blur(${cut.soft}px)` : undefined, transform: cut.soft ? 'scale(1.03)' : undefined}}>
        {shot.bg ? <Img src={staticFile(`film/${shot.name}/bg_0.png`)} style={{position: 'absolute', width: '100%', height: '100%'}} /> : null}
        {shot.bg && shot.plates.length > 1 && second > 0 ? (
          <Img src={staticFile(`film/${shot.name}/bg_1.png`)} style={{position: 'absolute', width: '100%', height: '100%', opacity: second}} />
        ) : null}
      </AbsoluteFill>
      {/* the haze between the set and the cast: even, a little thicker towards the ground */}
      {shot.name.startsWith('s') ? null : <AbsoluteFill style={{background: red ? 'linear-gradient(to bottom, rgba(150,40,40,0.05), rgba(150,40,40,0.2))' : `linear-gradient(to bottom, ${HAZE}0.07), ${HAZE}${inChorus(t) ? 0.3 : 0.2}))`}} />}
      {(shot.name === 'a02_feet' ? shot.steps ?? [] : []).map((st, i) => <Ripple key={i} t={ts} at={st.t} x={st.x} y={st.y} />)}
      {fg && fg.box ? (
        <Img
          src={staticFile(`film/${shot.name}/fg_${pad(f)}.png`)}
          style={{position: 'absolute', left: `${fg.box[0] * 100}%`, top: `${(1 - fg.box[3]) * 100}%`, width: `${(fg.box[1] - fg.box[0]) * 100}%`, height: `${(fg.box[3] - fg.box[2]) * 100}%`}}
        />
      ) : null}
      {fg && fg.head && fg.box && cut.shot !== 'a02_feet' ? <FaceMist x={fg.head[0]} y={fg.head[1]} red={red} /> : null}
      {cut.shot === 'a07_blade' && fg && fg.hand ? <Glint x={fg.hand[0]} y={fg.hand[1]} k={pulse(t, 34.9, 36.5, 0.2, 0.6)} t={t} /> : null}
      {cut.shot === 'v2d_knives' && fg && fg.hand ? <Slashes t={t} x={fg.hand[0]} y={fg.hand[1]} /> : null}
    </AbsoluteFill>
  );
};

// "Footsteps echo": where a boot comes down on the wet stones a ring of light runs out from it, and a second after it
const Ripple: React.FC<{t: number; at: number; x: number; y: number}> = ({t, at, x, y}) => (
  <>
    {[0, 0.16].map((d) => {
      const u = span(t, at + d, at + d + 0.75);
      if (u <= 0 || u >= 1) return null;
      const w = 40 + u * 320;
      return <div key={d} style={{position: 'absolute', left: `calc(${x * 100}% - ${w / 2}px)`, top: `calc(${y * 100}% - ${w * 0.11}px)`, width: w, height: w * 0.22, borderRadius: '50%', border: `${2.5 * (1 - u)}px solid rgba(190,215,245,${0.7 * (1 - u)})`, boxShadow: `0 0 ${10 * (1 - u)}px rgba(170,200,240,${0.5 * (1 - u)})`}} />;
    })}
  </>
);

/* ---------------------------------------------------------------- weather */
// The owner: "the fog should be uniform, now it looks painted". One even haze: no cloud, no texture, nothing drifting.
const Fog: React.FC<{level: number; red?: boolean}> = ({level, red}) => (
  <AbsoluteFill style={{background: red ? `linear-gradient(to bottom, rgba(150,40,40,${level * 0.15}), rgba(150,40,40,${level * 0.5}))` : `linear-gradient(to bottom, ${HAZE}${level * 0.28}), ${HAZE}${level * 0.5}) 62%, ${HAZE}${level}))`}} />
);

// His face is never seen: where his head is, the same fog stands thicker. A smooth bank, no brushwork.
const FaceMist: React.FC<{x: number; y: number; red?: boolean}> = ({x, y, red}) => (
  <div style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: 0, height: 0}}>
    <div style={{position: 'absolute', width: '34vh', height: '30vh', left: '-17vh', top: '-19vh', background: `radial-gradient(closest-side, ${red ? 'rgba(120,48,52,' : 'rgba(86,104,132,'}1) 30%, ${red ? 'rgba(120,48,52,' : 'rgba(86,104,132,'}0.85) 52%, ${red ? 'rgba(120,48,52,' : 'rgba(86,104,132,'}0) 100%)`}} />
  </div>
);

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
          <div key={i} style={{position: 'absolute', left: `${x * 100 + [-2, 2, 0][i]}%`, top: `${y * 100 - 4 + i * 2}%`, width: 0, height: 0, transform: `rotate(${ang}deg)`, opacity: fade}}>
            <div style={{position: 'absolute', left: -260, top: -2, width: 520, height: 3, background: 'linear-gradient(90deg, transparent, #dff1ff 30%, #ffffff 50%, #dff1ff 70%, transparent)', clipPath: `inset(0 ${(1 - u) * 100}% 0 0)`, filter: 'drop-shadow(0 0 8px #bfe3ff)'}} />
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
  const scream = t >= 27.74 ? Math.exp(-(t - 27.74) * 5) : 0;                       // the scream: the stage blinks white, then dark
  const dark = pulse(t, 27.9, 29.6, 0.2, 1.2) * 0.45;

  const curtain = t < 5.05 ? 2 : t < 9 ? span(t, 5.5, 7.6) : t > 124 ? 1 - span(t, 124.6, 126.6) : 1;
  const vanish = [SHOTS.c1e_grapple, SHOTS.c2f_bow].map((s, i) => {
    const at = i === 0 ? 59.55 : 122.9;
    const f = Math.floor((at - 0.15 - s.t0) * s.fps);
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
        {/* stage light: the glow of the footlights from below, on every picture of the stage */}
        {cut.shot.startsWith('s') ? null : <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 34% at 50% 108%, rgba(255,190,110,0.22), rgba(255,190,110,0) 70%)', mixBlendMode: 'screen'}} />}
        <Fog level={cut.shot.startsWith('s') ? 0.12 : inChorus(t) ? 0.3 : 0.2} red={cut.shot === 'c1d_blood'} />
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
