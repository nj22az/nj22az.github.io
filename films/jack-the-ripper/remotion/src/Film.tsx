import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import data from './data.json';
import beatsJson from './beats.json';
import '@fontsource/pirata-one/400.css';
import '@fontsource/im-fell-english/400.css';
import '@fontsource/im-fell-english/400-italic.css';
import '@fontsource/im-fell-english-sc/400.css';

/* The edit. One clock: the song's seconds (t = frame / fps). Blender photographed each shot as a plate of the set
   and a 12-a-second pass of the cast; here they are laid together, moved, fogged, lettered and cut to the song. */

type Fg = {box: number[] | null; head: number[] | null; hand: number[] | null; star: {head: number[]; hips: number[]} | null};
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
type Cut = {shot: string; from: number; to: number; src?: number; mirror?: boolean; move?: [number, number, number, number, number, number]; soft?: number; softTop?: [number, number, number]; tilt?: number; origin?: string};
// move: scale from → to, then the drift of the picture in per cent of its width and height, from → to.
// soft: how far the set behind is thrown out of focus (a long lens close on Polly). tilt: the horizon, in degrees.
// softTop: only the far wall out of focus: the blur, and the band (per cent of the height) where it gives way to the sharp street.
// A move must never slide or tilt the picture off the frame (the review of the fourth cut found black bars and wedges
// at the edge in five cuts). The rule: the scale must cover the drift and the tilt at every moment of the move; a drift
// of d per cent about the centre needs 1 / (1 - 2d/100), a tilt of a degrees needs cos a + (16/9) sin a. `cover` below
// works it out for any origin, and Picture holds the scale to it as a last guard; these numbers pass by themselves.
const CUTS: Cut[] = [
  {shot: 's00_pub', from: 0, to: 5.05, move: [1.0, 1.16, 0, -1.5, 0, 2.5]},
  {shot: 'a01_wide', from: 5.05, to: 8.3, move: [1.0, 1.22, 0, 0, 0, 1.5]},
  {shot: 'a02_feet', from: 8.3, to: 10.3, move: [1.0, 1.12, 0, 2, 0, -2], origin: '45% 80%', softTop: [4, 60, 69]},
  {shot: 'a02b_cobblestone', from: 10.3, to: 12.29, move: [1.0, 1.22, 0, 0, 0, 4], origin: '50% 40%'},
  {shot: 'a03_shadow', from: 12.29, to: 18.75, move: [1.0, 1.1, 0, 1.5, 0, 0], soft: 3},
  {shot: 'a04_moon', from: 18.75, to: 24.65, move: [1.1, 1.0, 0, 0, 2, 0]},
  {shot: 'a05_alone', from: 24.65, to: 27.6, move: [1.0, 1.12, 0, 0, 0, 0], soft: 5, origin: '50% 45%'},
  {shot: 'a06_scream', from: 27.6, to: 33.67, move: [1.25, 1.0, 0, 0, 0, 0]},
  {shot: 'a07_blade', from: 33.67, to: 36.5, move: [1.0, 1.12, 0, -2, 0, 0], origin: '62% 50%'},
  {shot: 'a08_light', from: 36.5, to: 41.73, move: [1.0, 1.14, 0, 0, 0, 0], soft: 3, origin: '50% 38%'},
  {shot: 'c1a_dance', from: 41.73, to: 44.0, move: [1.0, 1.05, 0, 0, 0, 0]},
  {shot: 'c1b_demon', from: 44.0, to: 47.07, move: [1.0, 1.14, 0, 1, 0, 2], origin: '45% 35%'},
  {shot: 'c1c_smoke', from: 47.07, to: 52.34, move: [1.16, 1.22, -1, 1, 0, 0], tilt: -5},             // 5 degrees need 1.151: it began at 1.12 and showed wedges
  {shot: 'c1d_blood', from: 52.34, to: 57.85, move: [1.0, 1.1, 0, 0, 0, 0], origin: '50% 40%'},
  {shot: 'c1e_grapple', from: 57.85, to: 60.0, move: [1.0, 1.05, 0, 0, 0, 0]},
  {shot: 'c1f_noone', from: 60.0, to: 63.59, move: [1.0, 1.1, 0, 0, 0, 0], soft: 4, origin: '50% 40%'},
  {shot: 's12_skyline', from: 63.59, to: 68.3, move: [1.14, 1.05, 2, -2, 2, 0]},                      // ended at 1.0 still drifted 2 %: a bar down the right
  {shot: 'v2a_city', from: 68.3, to: 76.28, move: [1.0, 1.1, 0, 0, 0, 0], origin: '50% 40%'},
  {shot: 'v2b_hats', from: 76.28, to: 79.0, move: [1.1, 1.04, 1.5, -1.5, 0, 0]},                      // the same, 1.5 %
  {shot: 'v2c_name', from: 79.0, to: 84.5, move: [1.0, 1.12, 0, 0, 0, 0], soft: 5, origin: '50% 45%'},
  // Polly stands at the left edge of this plate: the push-in is anchored on that edge and drifts nowhere, so it never
  // carries her out of the frame (it used to slide half her face off).
  {shot: 'v2d_knives', from: 84.5, to: 91.2, move: [1.0, 1.1, 0, 0, 0, 0], origin: '0% 45%'},
  {shot: 'v2e_art', from: 91.2, to: 98.3, move: [1.3, 1.0, 0, 0, 0, 0]},
  {shot: 'c2a_dance', from: 98.3, to: 100.9, move: [1.03, 1.09, 1, -1, 0, 0]},                         // began at 1.0 already drifted 1 %: a bar down the left
  {shot: 'c2b_demon', from: 100.9, to: 103.95, move: [1.0, 1.12, 0, 0, 0, 0], soft: 2, origin: '45% 40%'},
  {shot: 'c2c_smoke', from: 103.95, to: 109.15, move: [1.13, 1.18, 1, -1, 0, 0], tilt: 4},            // 4 degrees need 1.122
  {shot: 'c1d_blood', from: 109.15, to: 114.6, src: 52.34, mirror: true, move: [1.1, 1.0, 0, 0, 0, 0], origin: '50% 40%'},
  {shot: 'c2e_finale', from: 114.6, to: 119.6, move: [1.18, 1.0, 0, 0, 0, 0], soft: 4, origin: '50% 40%'},
  {shot: 'c2f_bow', from: 119.6, to: 130.0, move: [1.0, 1.1, 0, 0, 0, 0.5]},
];
const CHORUS: [number, number][] = [[41.73, 63.59], [98.3, 119.6]];
const inChorus = (t: number) => CHORUS.some(([a, b]) => t >= a && t < b);

const pad = (n: number) => String(n).padStart(4, '0');

// The least scale at which the moved picture still covers the whole frame. The picture is drawn turned by `tilt` and
// scaled about `origin`, after being shifted x and y per cent of itself; each corner of the frame, carried back through
// that, must fall inside the picture.
const cover = (tilt: number, x: number, y: number, origin = '50% 50%', mirror = false) => {
  const [ox, oy] = origin.split(' ').map((v) => parseFloat(v) / 100);
  const O = [ox * 1280, oy * 720], T = [x * 12.8, y * 7.2];
  const a = (-tilt * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  let need = 0;
  for (const q of [[0, 0], [1280, 0], [0, 720], [1280, 720]]) {
    const dx = q[0] - O[0], dy = q[1] - O[1];
    const mx = (mirror ? -1 : 1) * (c * dx - s * dy), my = s * dx + c * dy;
    // how far the corner lies from the origin, over how much picture there is on that side of it
    const side = (far: number, room: number) => (far < 1e-9 ? 0 : room > 0 ? far / room : Infinity);
    need = Math.max(need, side(mx, 1280 - O[0] + T[0]), side(-mx, O[0] - T[0]), side(my, 720 - O[1] + T[1]), side(-my, O[1] - T[1]));
  }
  return need;                                                          // Infinity: no scale can cover it (a drift away from an origin on the edge)
};

const HAZE = 'rgba(96,116,148,';          // the one colour of the fog, everywhere

const Picture: React.FC<{cut: Cut; t: number}> = ({cut, t}) => {
  const shot = SHOTS[cut.shot];
  const ts = t - cut.from + (cut.src ?? cut.from);                    // the shot's own second
  const f = Math.max(0, Math.min(shot.frames - 1, Math.floor((ts - shot.t0) * shot.fps + 1e-4)));
  const fg = shot.fg[String(f)];
  const u = ease(span(t, cut.from, cut.to));
  const [s0, s1, x0, x1, y0, y1] = cut.move ?? [1, 1.04, 0, 0, 0, 0];
  const dx = x0 + (x1 - x0) * u, dy = y0 + (y1 - y0) * u;
  // never less than what covers the frame, whatever the table says (a hair over, so no edge pixel is half bare)
  const least = cover(cut.tilt ?? 0, dx, dy, cut.origin, cut.mirror);
  const sc = Math.max(s0 + (s1 - s0) * u, Number.isFinite(least) ? least * 1.002 : 0);
  // the plate; where the light changes within a shot there are two, and the lamp gutters between them
  let second = 0;
  if (shot.plates.length > 1) {
    const g = span(ts, 16.2, 16.9);
    second = g <= 0 ? 0 : g >= 1 ? 1 : Math.min(1, g + 0.35 * (random(`gut${Math.floor(ts * 24)}`) - 0.5));
  }
  const red = cut.shot === 'c1d_blood';
  return (
    <AbsoluteFill style={{transformOrigin: cut.origin ?? '50% 50%', transform: `rotate(${cut.tilt ?? 0}deg) scale(${(cut.mirror ? -1 : 1) * sc}, ${sc}) translate(${dx}%, ${dy}%)`}}>
      <AbsoluteFill style={{filter: cut.soft ? `blur(${cut.soft}px)` : undefined, transform: cut.soft ? 'scale(1.03)' : undefined}}>
        {shot.bg ? <Img src={staticFile(`film/${shot.name}/bg_0.png`)} style={{position: 'absolute', width: '100%', height: '100%'}} /> : null}
        {shot.bg && shot.plates.length > 1 && second > 0 ? (
          <Img src={staticFile(`film/${shot.name}/bg_1.png`)} style={{position: 'absolute', width: '100%', height: '100%', opacity: second}} />
        ) : null}
        {/* The boots are photographed from the stones with the house fronts far behind: a second, soft copy of the
            plate lies over the wall alone and gives way to the sharp one at the kerb. (The wall of this plate carries
            thin bright hairlines, slivers of the thinned house model catching the low lights, that the even haze left
            sharp; out of focus they are gone, and a wall that far behind a boot would be out of focus.) It is a hair
            larger than the picture so that its own blurred border falls outside, and grown from the kerb's height so
            that it meets the sharp copy without a step. */}
        {shot.bg && cut.softTop ? (
          <Img
            src={staticFile(`film/${shot.name}/bg_0.png`)}
            style={{position: 'absolute', width: '100%', height: '100%', filter: `blur(${cut.softTop[0]}px)`, transform: 'scale(1.02)', transformOrigin: `50% ${(cut.softTop[1] + cut.softTop[2]) / 2}%`, WebkitMaskImage: `linear-gradient(to bottom, black ${cut.softTop[1]}%, transparent ${cut.softTop[2]}%)`, maskImage: `linear-gradient(to bottom, black ${cut.softTop[1]}%, transparent ${cut.softTop[2]}%)`}}
          />
        ) : null}
        {/* The second chorus plays this shot again left to right, which would turn the church clock's face backwards:
            the dial alone is turned back about its own middle, so the numerals and hands read as a clock's do. */}
        {shot.bg && cut.mirror && DIAL[shot.name] ? <Dial shot={shot.name} dial={DIAL[shot.name]} /> : null}
      </AbsoluteFill>
      {/* the haze between the set and the cast: even, a little thicker towards the ground */}
      {/* The owner: "can the London fog be a bit more prevalent and cover some of the bleeding into buildings". It is
          thickest in a band where the street meets the house fronts, behind the cast, so that walls and figures do not
          meet on a hard line. */}
      {shot.name.startsWith('s') ? null : <AbsoluteFill style={{background: red ? 'linear-gradient(to bottom, rgba(150,40,40,0.1), rgba(150,40,40,0.34) 60%, rgba(150,40,40,0.3))' : `linear-gradient(to bottom, ${HAZE}0.2), ${HAZE}${cut.soft ? 0.34 : 0.58}) 58%, ${HAZE}${cut.soft ? 0.3 : 0.5}) 78%, ${HAZE}0.36))`}} />}
      {/* The owner: "Polly needs to pop, right, even if the fog is heavier". Behind her, in the fog, a soft light:
          her outline stands against it. */}
      {fg && fg.star && fg.box ? <StarHalo star={fg.star} red={red} /> : null}
      {/* under the cast, so that the ring lies on the stones behind the boot and never in front of the leg; a step
          that lands outside the picture, or too late to be read before the cut, has none */}
      {(shot.name === 'a02_feet' ? shot.steps ?? [] : []).filter((st) => st.x > 0 && st.x < 1 && st.t + FEET.land + 0.3 < shot.t1).map((st, i) => <Ripple key={i} t={ts} at={st.t} x={st.x} y={st.y} />)}
      {fg && fg.box ? <Cast src={staticFile(`film/${shot.name}/fg_${pad(f)}.png`)} box={fg.box} /> : null}
      {/* Jack goes in a puff of vapour. It belongs to this picture and is drawn inside it, in front of the cast and
          behind the street's fog: it moves with the picture and is cut with it, and can never lie over another shot
          (it used to be laid over the whole film, and hung on over Polly's face after the cut). */}
      {vanishOf(shot) ? <Vapour ts={ts} v={vanishOf(shot)!} /> : null}
      {/* no bank of his own over Jack's face any more (the owner, on the fourth cut: "you dont have to put a fog dot on
          his face, we should see he has a face but its obscured by the fog"): the street's fog below is what dims him.
          Where he dances alone and large, the fog lies a little thicker in a level layer right across the street at the
          height of his head (the shot's mean, so it does not follow him): his face is there, and is not quite read. */}
      {!shot.name.startsWith('s') && JACK_ALONE.includes(cut.shot) ? <FogLayer y={headLevel(shot)} red={red} /> : null}
      {/* the fog in front of the cast, with a clear pocket that goes where Polly goes */}
      {shot.name.startsWith('s') ? null : <FrontFog level={cut.soft ? 0.16 : inChorus(t) ? 0.4 : 0.32} red={red} star={fg && fg.box ? fg.star : null} />}
      {cut.shot === 'a07_blade' && fg && fg.hand ? <Glint x={fg.hand[0]} y={fg.hand[1]} k={pulse(t, 34.9, 36.5, 0.2, 0.6)} t={t} /> : null}
      {cut.shot === 'v2d_knives' && fg && fg.hand ? <Slashes t={t} x={fg.hand[0]} y={fg.hand[1]} /> : null}
    </AbsoluteFill>
  );
};

// "Footsteps echo": where a boot comes down on the wet stones a ring of light runs out over them, and a second after it.
// The ring lies ON the street. The step's point in the data is the toe BONE at the moment it passes under 6 cm, still in
// the air, and this camera sits 9 cm off the ground, so that point is drawn almost on the horizon, some 50 px above
// where the sole meets the stone (the rings used to hang there, like hoops in the fog). From the camera of a02 in
// film.py (9 cm high, 50 mm, tipped up 3.3 degrees: the horizon at 0.642 of the height) the point is dropped to the
// ground, and the ring is as flat as a circle on the ground is from that height: its height is its width times
// eye height / distance, about one twentieth. Its size is in metres of street, so the nearer foot has the wider ring.
const FEET = {horizon: 0.642, eye: 0.09, toe: 0.058, lens: (50 / 36) * (1280 / 720), land: 0.22};   // land: the sole is down this long after the toe passes 6 cm
const Ripple: React.FC<{t: number; at: number; x: number; y: number}> = ({t, at, x, y}) => {
  const drop = ((y - FEET.horizon) * FEET.eye) / (FEET.eye - FEET.toe);      // the ground under the toe, below the horizon (part of the height)
  const metre = (drop * 720) / FEET.eye;                                      // px of the picture to a metre of street, there
  const flat = drop / FEET.lens;                                              // eye height over distance
  return (
    <>
      {[0, 0.18].map((d) => {
        const u = span(t, at + FEET.land + d, at + FEET.land + d + 0.8);
        if (u <= 0 || u >= 1) return null;
        const w = 2 * (0.05 + 0.33 * (1 - (1 - u) * (1 - u))) * metre;      // runs out fast, then slows: 5 cm to 38 cm from the foot
        const h = w * flat * 1.4;                                              // a touch rounder than true, or it is only a line at this height
        // a soft band of light, no drawn line: brightest on the side towards us, gone at both rims
        return <div key={d} style={{position: 'absolute', left: `calc(${x * 100}% - ${w / 2}px)`, top: `calc(${(FEET.horizon + drop) * 100}% - ${h / 2}px)`, width: w, height: h, background: 'radial-gradient(closest-side, rgba(214,232,255,0) 40%, rgba(214,232,255,1) 74%, rgba(214,232,255,0) 100%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6), black)', maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6), black)', mixBlendMode: 'screen', opacity: Math.min(1, u * 7) * Math.pow(1 - u, 1.2) * (d ? 0.6 : 1)}} />;
      })}
    </>
  );
};

// The cast's picture is a crop of the frame, and the shade the figures throw on the street can run on past the crop:
// it then stopped dead on a straight line (under Jack as he walks off, in "A shadow slips"). Every side of the crop that
// lies inside the frame is feathered, so shade thins away instead. A feather would thin a figure standing in it as
// well (the crop is sometimes tight: skirts come within a few px of it), so the solid part of the picture, which is
// figure and never shade, is laid again over the feathered band, whole.
// The band is sized to the figures: a fourteenth of the crop's height, and never over 36 px. A band of 36 px on every
// shot took the walkers' shadows away in the opening wide shot, where they are a hundred px tall and their whole
// shadow lies within 45 px of the crop's lower edge: they stood on the stage without shade, floating (found by the
// check of the first feather). There the band is now 12 px: the cut still ends softly and the shadow stays. Crops
// of 504 px and taller (Jack walking off, the close shots) keep the 36 px they were judged with.
const FEATHER = 36, FEATHER_PART = 1 / 14;                                      // px of the picture; part of the crop's height
const Cast: React.FC<{src: string; box: number[]}> = ({src, box}) => {
  const [x0, x1, y0, y1] = box;                                                 // left, right, bottom, top, as parts of the frame
  const place: React.CSSProperties = {position: 'absolute', left: `${x0 * 100}%`, top: `${(1 - y1) * 100}%`, width: `${(x1 - x0) * 100}%`, height: `${(y1 - y0) * 100}%`};
  const full: React.CSSProperties = {position: 'absolute', width: '100%', height: '100%'};
  const tall = Math.min(FEATHER, (y1 - y0) * 720 * FEATHER_PART), wide = Math.min(tall, ((x1 - x0) * 1280) / 4);
  const l = x0 > 0.001 ? wide : 0, r = x1 < 0.999 ? wide : 0, top = y1 < 0.999 ? tall : 0, bot = y0 > 0.001 ? tall : 0;
  if (!l && !r && !top && !bot) return <Img src={src} style={place} />;
  // from nothing at the crop's edge to whole, on an S-curve, so the feather has no visible start or end
  const ramp = (dir: string, a: number, b: number) => {
    const stops = [...(a ? [0, 0.1, 0.5, 0.9].map((k, i) => `rgba(0,0,0,${k}) ${(a * i) / 4}px`) : []), `black ${a}px`, `black calc(100% - ${b}px)`, ...(b ? [0.9, 0.5, 0.1, 0].map((k, i) => `rgba(0,0,0,${k}) calc(100% - ${(b * (3 - i)) / 4}px)`) : [])];
    return `linear-gradient(${dir}, ${stops.join(', ')})`;
  };
  const across = ramp('to right', l, r), down = ramp('to bottom', top, bot);
  const inner = `${l}px ${top}px, ${l}px calc(100% - ${bot}px), calc(100% - ${r}px) calc(100% - ${bot}px), calc(100% - ${r}px) ${top}px, ${l}px ${top}px`;
  return (
    <div style={place}>
      <div style={{...full, WebkitMaskImage: across, maskImage: across}}>
        <Img src={src} style={{...full, WebkitMaskImage: down, maskImage: down}} />
      </div>
      {/* the figures alone (see the filter `cast-solid` in Film), in the feathered band alone */}
      <Img src={src} style={{...full, filter: 'url(#cast-solid)', clipPath: `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${inner})`}} />
    </div>
  );
};

// The clock's dial on the plate of c1d_blood: its middle and its radius, as parts of the plate's width and height
// (measured on bg_0.png: the white face is 96 px across, centred at 387.5, 99).
const DIAL: Record<string, {x: number; y: number; r: number}> = {c1d_blood: {x: 387.5 / 1280, y: 99 / 720, r: 50 / 1280}};
const Dial: React.FC<{shot: string; dial: {x: number; y: number; r: number}}> = ({shot, dial}) => {
  const r = dial.r * 1280;
  return (
    <div style={{position: 'absolute', left: `calc(${dial.x * 100}% - ${r}px)`, top: `calc(${dial.y * 100}% - ${r}px)`, width: 2 * r, height: 2 * r, overflow: 'hidden', transform: 'scaleX(-1)', WebkitMaskImage: 'radial-gradient(closest-side, black 93%, transparent 100%)', maskImage: 'radial-gradient(closest-side, black 93%, transparent 100%)'}}>
      <Img src={staticFile(`film/${shot}/bg_0.png`)} style={{position: 'absolute', width: 1280, height: 720, maxWidth: 'none', left: r - dial.x * 1280, top: r - dial.y * 720}} />
    </div>
  );
};

/* ---------------------------------------------------------------- weather */
// The owner: "the fog should be uniform, now it looks painted". One even haze: no cloud, no texture, nothing drifting.
const Fog: React.FC<{level: number; red?: boolean}> = ({level, red}) => (
  <AbsoluteFill style={{background: red ? `linear-gradient(to bottom, rgba(150,40,40,${level * 0.2}), rgba(150,40,40,${level * 0.55}))` : `linear-gradient(to bottom, ${HAZE}${level * 0.35}), ${HAZE}${level * 0.62}) 60%, ${HAZE}${level}))`}} />
);

const starBox = (star: {head: number[]; hips: number[]}) => {
  const h = Math.max(0.05, Math.hypot(star.hips[0] - star.head[0], star.hips[1] - star.head[1]));   // head to hips, as a part of the picture
  return {cx: (star.head[0] + star.hips[0]) / 2, cy: star.head[1] + (star.hips[1] - star.head[1]) * 0.75, h};
};

const StarHalo: React.FC<{star: {head: number[]; hips: number[]}; red?: boolean}> = ({star, red}) => {
  const {cx, cy, h} = starBox(star);
  return <AbsoluteFill style={{background: `radial-gradient(ellipse ${h * 150}% ${h * 300}% at ${cx * 100}% ${cy * 100}%, ${red ? 'rgba(255,170,150,0.3)' : 'rgba(205,225,255,0.32)'}, transparent 70%)`, mixBlendMode: 'screen'}} />;
};

const FrontFog: React.FC<{level: number; red?: boolean; star: {head: number[]; hips: number[]} | null}> = ({level, red, star}) => {
  const c = red ? 'rgba(150,40,40,' : HAZE;
  const style: React.CSSProperties = {background: `linear-gradient(to bottom, ${c}${level * 0.35}), ${c}${level * 0.62}) 60%, ${c}${level}))`};
  if (star) {
    const {cx, cy, h} = starBox(star);
    const m = `radial-gradient(ellipse ${h * 115}% ${h * 330}% at ${cx * 100}% ${cy * 100}%, transparent 0%, transparent 52%, black 100%)`;
    style.WebkitMaskImage = m; style.maskImage = m;
  }
  return <AbsoluteFill style={style} />;
};

const JACK_ALONE = ['c1a_dance', 'c1e_grapple', 'v2b_hats', 'c2a_dance'];
const LEVELS: Record<string, number> = {};
const headLevel = (shot: {name: string; fg: Record<string, {head?: number[] | null} | undefined>}) => {
  if (LEVELS[shot.name] === undefined) {
    const ys = Object.values(shot.fg).filter((v) => v && v.head).map((v) => v!.head![1]);
    LEVELS[shot.name] = ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : 0.4;
  }
  return LEVELS[shot.name];
};
const FogLayer: React.FC<{y: number; red?: boolean}> = ({y, red}) => {
  const c = red ? 'rgba(150,40,40,' : HAZE; const p = (v: number) => `${Math.max(0, Math.min(100, v * 100))}%`;
  return <AbsoluteFill style={{background: `linear-gradient(to bottom, ${c}0) ${p(y - 0.3)}, ${c}0.5) ${p(y - 0.06)}, ${c}0.5) ${p(y + 0.01)}, ${c}0) ${p(y + 0.2)})`}} />;
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

// "Blood on the streets": red petals let fall over the dance, never anything worse. `fall` names the fall: the second
// chorus has its own, not the first one's petals in the same places over the mirrored picture.
const Petals: React.FC<{t: number; t0: number; t1: number; fall: string}> = ({t, t0, t1, fall}) => (
  <AbsoluteFill style={{opacity: pulse(t, t0, t1, 0.2, 0.5)}}>
    {Array.from({length: 70}).map((_, i) => {
      const r = (k: string) => random(`petal-${fall}-${i}-${k}`);
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

// Where and when Jack goes: the first picture of a shot that no longer has him, and how he stood in the one before
// (his head, and the street under him from his last step), and how tall he stands in this shot when upright (he may
// be bowing as he goes). Read from the shot's own data, so it follows the animation.
type Vanish = {at: number; x: number; top: number; foot: number; size: number};
const VANISH: Record<string, Vanish | null> = {};
const vanishOf = (shot: Shot) => {
  if (VANISH[shot.name] === undefined) {
    VANISH[shot.name] = null;
    for (let f = 1; f < shot.frames; f++) {
      const head = shot.fg[String(f - 1)]?.head;
      if (!head || shot.fg[String(f)]?.head || !shot.fg[String(f)]) continue;
      const at = shot.t0 + f / shot.fps;
      const step = [...shot.steps].reverse().find((st) => st.t < at);
      const foot = Math.max(head[1] + 0.1, step ? step.y : head[1] + 0.3);
      const crown = Math.min(...Array.from({length: f}, (_, k) => shot.fg[String(k)]?.head?.[1] ?? 1)) - 0.04;
      VANISH[shot.name] = {at, x: head[0], top: head[1] - 0.04, foot, size: (foot - crown) * 720};
      break;
    }
  }
  return VANISH[shot.name];
};

// The vapour he leaves. Not a shape: sixteen soft puffs, each of its own size, squash and turn, born over the half
// second around his going, all down the length of him; each rises at its own pace, spreads and thins away. (The old
// smoke was nine equal discs born on one point, with a band darker than the fog: together a ball with a dark ring.)
// A puff has no rim: it is strongest in its middle and falls away like a bell. Vapour in gaslight is lighter than the
// fog behind it, never darker: the whole is laid on as light ('screen'), which cannot darken anything.
const PUFF = `radial-gradient(closest-side, ${[[0, 1], [26, 0.9], [44, 0.66], [60, 0.38], [76, 0.15], [90, 0.035], [100, 0]].map(([p, k]) => `rgba(198,210,230,${k}) ${p}%`).join(', ')})`;
const Vapour: React.FC<{ts: number; v: Vanish}> = ({ts, v}) => {
  if (ts < v.at - 0.4 || ts > v.at + 2.4) return null;
  const tall = v.size;                                                          // his height, in px of the picture
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen'}}>
      {Array.from({length: 16}).map((_, i) => {
        const r = (k: string) => random(`vapour-${i}-${k}`);
        const born = v.at - 0.3 + r('born') * 0.45, life = 1.2 + r('life') * 0.9;
        const u = (ts - born) / life;
        if (u <= 0 || u >= 1) return null;
        const g = 1 - (1 - u) * (1 - u);                                          // quick at first, then slowing
        const w = tall * (0.3 + r('size') * 0.34) * (1 + 1.7 * g), h = w * (0.68 + r('squash') * 0.5);
        const x = v.x * 1280 + (r('x') - 0.5) * tall * 0.4 + (r('drift') - 0.5) * tall * 0.55 * g;
        const y = (v.top + r('y') * (v.foot - v.top)) * 720 - (0.1 + r('rise') * 0.34) * tall * g;
        const k = Math.min(1, u / 0.1) * Math.pow(1 - u, 1.7) * (0.22 + r('thick') * 0.2);
        return <div key={i} style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${r('turn') * 180}deg)`, background: PUFF, opacity: k}} />;
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

// When each caption is on. A caption belongs to the pictures its line is sung over, and to no other: it comes on a
// breath before the voice and stays a moment after it, but neither may cross a cut, and it is gone before the next
// line comes on. (It used to fade for 0.35 s after its line whatever happened: over the hard cut into the next shot,
// the red name across Polly's close shot, and it held the next caption back until its entrance was already over.)
//   on:  0.05 s before the line; if a cut falls just there (up to 0.15 s after the voice starts), on the cut.
//   a:   the moment the entrance is counted from: the line's start, or that cut.
//   off: 0.35 s after the line; if a cut falls in the line's last 0.3 s or in that tail, on the cut; never later than
//        the next caption's `on`. The fade-out is laid BEFORE `off`, so the caption is fully gone there.
// A line may be sung across a cut in its middle ("Footsteps echo on the cobblestone" runs over three pictures): those
// pictures are all its own.
const CUT_AT = CUTS.slice(1).map((c) => c.from);
const CAPTIONS = LYRICS.map(([a, b, text, kind]) => {
  const cutIn = CUT_AT.find((c) => c > a - 0.05 && c <= a + 0.15);
  const cutOut = CUT_AT.find((c) => c >= b - 0.3 && c <= b + 0.35);
  return {a: cutIn ?? a, b, text, kind, on: cutIn ?? a - 0.05, off: cutOut ?? b + 0.35};
});
CAPTIONS.forEach((c, i) => { if (CAPTIONS[i + 1]) c.off = Math.min(c.off, CAPTIONS[i + 1].on); });

const Lyric: React.FC<{t: number}> = ({t}) => {
  // the CURRENT line: the last one that has come on (not the first that has not yet finished fading)
  let line: (typeof CAPTIONS)[number] | undefined;
  for (const c of CAPTIONS) if (t >= c.on) line = c;
  if (!line || t >= line.off) return null;
  const {a, b, text, kind, off} = line;
  const out = 1 - span(t, off - 0.3, off);
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
    // the block sits a little below the middle: the moon of the opening plate hangs at about a quarter of the height,
    // and the small line used to sit right under it, touching
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: k, paddingTop: 64}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 51%, rgba(0,0,0,0.55), transparent 62%)'}} />
      <div style={{fontFamily: '"IM Fell English SC"', color: CREAM, fontSize: 24, letterSpacing: 9, opacity: span(t, 1.0, 2.0), textShadow: '0 2px 10px #000', marginBottom: 18, position: 'relative'}}>WHITECHAPEL · 1888</div>
      <div style={{fontFamily: '"Pirata One"', color: BLOOD, fontSize: 150, lineHeight: 1.05, WebkitTextStroke: `2px ${CREAM}`, textShadow: '0 0 44px rgba(179,18,29,0.8), 0 6px 24px #000', transform: `scale(${1 + span(t, 0.7, 5) * 0.06})`, letterSpacing: 2, position: 'relative'}}>Jack the Ripper</div>
      <div style={{fontFamily: '"IM Fell English"', fontStyle: 'italic', color: CREAM, fontSize: 40, opacity: span(t, 2.0, 3.2), textShadow: '0 2px 12px #000', marginTop: 10, position: 'relative'}}>a killer is loose</div>
    </AbsoluteFill>
  );
};

// The last card comes up as the curtain settles shut (126.6) and stands at full strength for four seconds, 127.2 to
// 131.2, before the picture goes: long enough to read the small line, which is the new thing it says. (It had one
// second.) The song ends at 130.0, so the card is held a little over a second in silence; Root.tsx gives the film
// that length.
const EndCard: React.FC<{t: number}> = ({t}) => {
  const k = span(t, 126.4, 127.2);
  if (k <= 0) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: k}}>
      <div style={{fontFamily: '"Pirata One"', color: CREAM, fontSize: 96, textShadow: '0 4px 22px #000, 0 0 30px rgba(0,0,0,0.8)'}}>A killer is loose</div>
      <div style={{fontFamily: '"IM Fell English SC"', color: CREAM, fontSize: 26, letterSpacing: 7, marginTop: 14, textShadow: '0 2px 10px #000'}}>HE WAS NEVER CAUGHT</div>
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
  return (
    <AbsoluteFill style={{backgroundColor: '#05060a'}}>
      {/* `cast-solid`: keeps of a picture only what is fully there (the figures) and drops what is half there (their shade
          on the street). Used by Cast. */}
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id="cast-solid" x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
          <feComponentTransfer><feFuncA type="linear" slope="8" intercept="-7" /></feComponentTransfer>
        </filter>
      </svg>
      <AbsoluteFill style={{filter: `brightness(${1 + beat * 0.1 + flash * 0.5 + scream * 0.9 - dark}) contrast(1.06) saturate(1.12)`}}>
        <Picture cut={cut} t={t} />
        {/* stage light: the glow of the footlights from below, on every picture of the stage */}
        {cut.shot.startsWith('s') ? null : <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 34% at 50% 108%, rgba(255,190,110,0.22), rgba(255,190,110,0) 70%)', mixBlendMode: 'screen'}} />}
        {cut.shot.startsWith('s') ? <Fog level={0.2} /> : null}
        <Rain t={t} k={pulse(t, 63.59, 84.5, 0.8, 1.2)} />
        <Petals t={t} t0={52.34} t1={57.85} fall="first" />
        <Petals t={t} t0={109.15} t1={114.6} fall="second" />
        <Curtain open={curtain === 2 ? 1 : curtain} />
      </AbsoluteFill>
      {/* the grade: a vignette, and grain that changes with every picture */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, transparent 52%, rgba(0,0,0,0.62) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain.png')})`, backgroundPosition: `${Math.floor(random(`gx${frame}`) * 640)}px ${Math.floor(random(`gy${frame}`) * 360)}px`, opacity: 0.07, mixBlendMode: 'overlay'}} />
      <Title t={t} />
      <Lyric t={t} />
      <EndCard t={t} />
      <AbsoluteFill style={{backgroundColor: '#000', opacity: Math.max(1 - span(t, 0, 0.9), span(t, 131.2, 132.4))}} />
      <Audio src={staticFile('song.mp3')} />
      {/* "A scream gets swallowed by the night": the scream itself, on the word, and the night taking it */}
      <Sequence from={Math.round(27.7 * fps)}><Audio src={staticFile('scream.wav')} volume={0.9} /></Sequence>
    </AbsoluteFill>
  );
};
