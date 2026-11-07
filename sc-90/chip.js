/*
 * Johansson SC-90: a four-voice sound chip of about 1990, made by Johansson Denki for the shop chimes, toys and
 * game sets of Johansson World. Our own design in the manner of the era's game and toy chips, not an emulation of
 * any of them: two pulse voices (duty 12.5, 25 or 50 %), a 4-bit stepped triangle for the bass, and a noise voice
 * that also plays the drums. Every pitch comes from a 4 MHz master clock divided by 16 and a whole-number period,
 * so high notes are a few cents off true, as on a real chip.
 *
 * The edges are band-limited (polyBLEP), so the voices are bright without the harsh aliasing of a naive digital
 * square: the chip sounds clean, like the good speaker of its day. One ES module, no DOM: Node and the browser.
 *
 * Songs use the PF-82's score notation (polivoks/songs.js: "C5:1/2 E5 G5 | C6:2 |"), one score per voice.
 */
import { parse } from '../polivoks/songs.js';

export const FS = 48000;
export const CLOCK = 4_000_000;
export const VOICES = Object.freeze(['pulse1', 'pulse2', 'triangle', 'noise']);
export const DUTIES = Object.freeze([0.125, 0.25, 0.5]);
/* The triangle's 32-step sequence: 4-bit levels 15 down to 0 and back up. */
export const TRI_STEPS = Object.freeze(Array.from({ length: 32 }, (_, i) => (i < 16 ? 15 - i : i - 16)));
/* The noise voice's drums, by General MIDI note: kick, snare, closed and open hi-hat. */
export const DRUMS = Object.freeze({ 36: 'kick', 38: 'snare', 42: 'hat', 46: 'open hat' });

export const idealHz = (midi) => 440 * 2 ** ((midi - 69) / 12);
/* The frequency the chip really plays for a wanted frequency: the nearest whole-number period of CLOCK / 16. */
export const chipHz = (f) => CLOCK / (16 * Math.max(8, Math.round(CLOCK / (16 * f))));

/* polyBLEP: the correction for a jump of +2 at phase 0, for a phase t (cycles, either side) and increment dt. */
function blep(t, dt) {
  if (t >= 0 && t < dt) { const x = t / dt; return x + x - x * x - 1; }
  if (t < 0 && t > -dt) { const x = t / dt; return x * x + x + x + 1; }
  return 0;
}
const wrap = (t) => t - Math.round(t); // −0.5 … 0.5

export function pulse(ph, dt, duty) {
  let v = ph < duty ? 1 : -1;
  v += blep(wrap(ph), dt) - blep(wrap(ph - duty), dt);
  return v - (2 * duty - 1); // no DC, whatever the duty
}
const triLevel = (i) => TRI_STEPS[((i % 32) + 32) % 32] / 7.5 - 1;
export function triangle(ph, dt) {
  const k = Math.floor(ph * 32);
  let v = triLevel(k);
  for (let b = Math.round(ph * 32) - 1; b <= Math.round(ph * 32) + 1; b++) {
    const jump = triLevel(b) - triLevel(b - 1);
    if (jump) v += (jump / 2) * blep(ph - b / 32, dt);
  }
  return v;
}

/* The 15-bit noise register: feedback from bits 0 and 1, a full 32 767-step sequence. */
export class Lfsr {
  constructor() { this.s = 1; }
  step() { const b = (this.s ^ (this.s >> 1)) & 1; this.s = (this.s >> 1) | (b << 14); return this.s & 1 ? 1 : -1; }
}

/* An envelope: attack a, decay d towards sustain s, release r (seconds; d and r are the time to fall ~95 %). The attack
 * is an S-curve and the release eases in over its first 10 ms, so a note never starts or stops with a tick. */
const ease = (u) => Math.sin((Math.PI / 2) * Math.min(1, Math.max(0, u))) ** 2;
export function envAt(t, off, e) {
  const held = (u) => (u < e.a ? ease(u / e.a) : e.s + (1 - e.s) * Math.exp(-(u - e.a) / Math.max(e.d / 3, 1e-4)));
  if (t < off) return held(t);
  const u = t - off, tau = Math.max(e.r, 0.03) / 3, soft = 0.01;
  // the held level, carried on for the first 10 ms and blended into the exponential fall
  return held(off) * (u < soft ? (1 - ease(u / soft)) + ease(u / soft) * Math.exp(-u / tau) : Math.exp(-u / tau));
}

/* Swing: the off-beat eighth moves from half the beat to `s` of it (0.5 is straight). */
export const swingBeat = (b, s = 0.5) => { const i = Math.floor(b + 1e-9), f = b - i; return i + (f <= 0.5 ? f * 2 * s : s + (f - 0.5) * 2 * (1 - s)); };

const FADE = Math.round(FS * 0.006); // a new note on a voice takes over in 6 ms on an S-curve, so nothing clicks
const cutGain = (i, until) => (i < until ? 1 : 1 - ease((i - until) / FADE));
const DEFAULT_ENV = { a: 0.004, d: 0.3, s: 0.6, r: 0.08 };

/* The notes a voice plays, in seconds: { on, off, midi }. */
export function voiceNotes(song, name, passes = 1) {
  const v = song.voices[name];
  const src = v.echo ? song.voices[v.echo.of] : v;
  const p = parse(src.score), beats = song.bars * song.meter, spb = 60 / song.bpm, gate = src.gate ?? 0.9;
  const out = [];
  for (let k = 0; k < passes; k++) for (const n of p.notes) {
    const on = swingBeat(n.beat + k * beats, song.swing) * spb, off = swingBeat(n.beat + k * beats + n.dur * gate, song.swing) * spb;
    const d = v.echo ? v.echo.delay : 0;
    out.push({ on: on + d, off: off + d, midi: n.note });
  }
  return out;
}

function playTone(buf, v, n, until) {
  const e = { ...DEFAULT_ENV, ...(v.env || {}) }, g = 10 ** ((v.gain ?? 0) / 20);
  const i0 = Math.round(n.on * FS), last = Math.min(buf.length, Math.ceil((n.off + 3 * e.r) * FS) + 1, until + FADE);
  const base = idealHz(n.midi + (v.shift || 0)), vib = v.vibrato, duty = v.duty ?? 0.5;
  let ph = v.wave === 'triangle' ? 0.25 : 0; // the triangle starts where it crosses zero
  for (let i = Math.max(0, i0); i < last; i++) {
    const t = (i - i0) / FS;
    let f = base;
    if (vib && t > vib.delay) f *= 2 ** ((vib.depth / 12) * Math.min(1, (t - vib.delay) / 0.15) * Math.sin(2 * Math.PI * vib.rate * (t - vib.delay)));
    const dt = chipHz(f) / FS;
    const x = v.wave === 'triangle' ? triangle(ph, dt) : pulse(ph, dt, duty);
    buf[i] += g * envAt(t, n.off - n.on, e) * cutGain(i, until) * x;
    ph += dt; ph -= Math.floor(ph);
  }
}

function playDrum(buf, v, n, until, lfsr) {
  const kind = DRUMS[n.midi];
  if (!kind) throw new Error(`No drum at note ${n.midi}: use ${Object.keys(DRUMS).join(', ')}.`);
  const g = 10 ** ((v.gain ?? 0) / 20), i0 = Math.round(n.on * FS);
  const tail = { kick: 0.35, snare: 0.3, hat: 0.08, 'open hat': 0.6 }[kind];
  const last = Math.min(buf.length, i0 + Math.round(tail * FS), until + FADE);
  let ph = 0, hold = 0, acc = 0, prev = 0, hp = 0;
  for (let i = Math.max(0, i0); i < last; i++) {
    const t = (i - i0) / FS, atk = ease(t / 0.0015), fade = cutGain(i, until);
    let x;
    if (kind === 'kick') { // the triangle swept down fast, with a little click of noise
      const f = 48 + 110 * Math.exp(-t / 0.025), dt = f / FS;
      x = triangle(ph, dt) * Math.exp(-t / 0.1) + 0.25 * lfsr.step() * Math.exp(-t / 0.003);
      ph += dt; ph -= Math.floor(ph);
    } else if (kind === 'snare') { // noise held at 12 kHz for the crunch, over a short 190 Hz body
      acc += 12000 / FS; if (acc >= 1) { acc -= 1; hold = lfsr.step(); }
      const dt = 190 / FS;
      x = 0.8 * hold * Math.exp(-t / 0.07) + 0.5 * triangle(ph, dt) * Math.exp(-t / 0.035);
      ph += dt; ph -= Math.floor(ph);
    } else { // hi-hats: noise every sample, high-passed
      const w = lfsr.step(); hp = w - prev; prev = w;
      x = 0.5 * hp * Math.exp(-t / (kind === 'hat' ? 0.018 : 0.15));
    }
    buf[i] += g * atk * fade * x;
  }
}

/* Render a song: { bpm, meter, bars, swing, voices: { name: { voice, score, … } } } → Float32Array at FS. */
export function render(song, { passes = 1, tail = 1.5 } = {}) {
  const seconds = (passes * song.bars * song.meter * 60) / song.bpm;
  const buf = new Float32Array(Math.ceil((seconds + tail) * FS));
  const lfsr = new Lfsr();
  for (const name of Object.keys(song.voices)) {
    const v = song.voices[name];
    if (!VOICES.includes(v.voice)) throw new Error(`${name}: voice must be one of ${VOICES.join(', ')}.`);
    const notes = voiceNotes(song, name, passes).sort((a, b) => a.on - b.on);
    const wave = v.voice === 'triangle' ? 'triangle' : 'pulse';
    notes.forEach((n, k) => {
      const until = k + 1 < notes.length ? Math.round(notes[k + 1].on * FS) : buf.length; // one note at a time per voice
      if (v.voice === 'noise') playDrum(buf, v, n, until, lfsr); else playTone(buf, { ...v, wave }, n, until);
    });
  }
  return buf;
}

/* The chip's output stage: a 25 Hz DC block and a soft roll-off above 10 kHz (two poles), the speaker of its day. */
export function output(x, { periodic = false } = {}) {
  const hp = Math.exp((-2 * Math.PI * 25) / FS), lp = 1 - Math.exp((-2 * Math.PI * 10000) / FS);
  const y = new Float32Array(x.length);
  let a = 0, xp = 0, b = 0, c = 0;
  for (let pass = periodic ? 2 : 1; pass > 0; pass--) { // a loop runs through twice so its filters start in their steady state
    for (let i = 0; i < x.length; i++) { a = hp * (a + x[i] - xp); xp = x[i]; b += lp * (a - b); c += lp * (b - c); y[i] = c; }
  }
  return y;
}

/* A finished piece, as the shop plays it: a loop rendered twice through with the second pass kept (so it repeats
 * exactly, the tail of its last notes already in its first bar), anything else trimmed after its last note has died
 * away. Every piece is levelled to the same loudness, −15 dBFS rms, never peaking above −1 dBFS, so the shop's
 * sounds sit together. Returns { samples, seconds, rmsDb, peakDb, loop }. */
export function renderPiece(song) {
  const period = Math.round((song.bars * song.meter * 60 * FS) / song.bpm);
  let x;
  if (song.loop) x = output(render(song, { passes: 2 }).slice(period, 2 * period), { periodic: true });
  else {
    x = output(render(song));
    let peak = 0; for (const v of x) peak = Math.max(peak, Math.abs(v));
    let end = x.length; while (end > period && Math.abs(x[end - 1]) < peak * 3e-4) end--; // drop the silent tail
    x = x.slice(0, Math.min(x.length, end + Math.round(FS * 0.02)));
    const fade = Math.round(FS * 0.01);
    for (let i = 0; i < fade; i++) x[x.length - 1 - i] *= i / fade;
  }
  let peak = 0, ss = 0;
  for (const v of x) { peak = Math.max(peak, Math.abs(v)); ss += v * v; }
  const rms = Math.sqrt(ss / x.length), g = Math.min(10 ** (-15 / 20) / Math.max(rms, 1e-9), 10 ** (-1 / 20) / Math.max(peak, 1e-9));
  for (let i = 0; i < x.length; i++) x[i] *= g;
  const db = (v) => Math.round(20 * Math.log10(Math.max(v, 1e-9)) * 10) / 10;
  return { samples: x, seconds: +(x.length / FS).toFixed(3), rmsDb: db(rms * g), peakDb: db(peak * g), loop: !!song.loop };
}
