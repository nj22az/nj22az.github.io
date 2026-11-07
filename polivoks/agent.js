/*
 * The PF-82's agent surface, shared by the page (app.js) and the MCP server (mcp/server.mjs):
 * the patches, every parameter with its range and meaning, song validation and share links.
 * No DOM, no dependencies: it runs in the browser and in Node alike.
 */
import { DEFAULTS, PARTS, voltsPerOctave } from './dsp/polivoks-dsp.js';
import { SONGS, parse } from './songs.js';
import { JINGLES } from './jingles/sakura.js';

const nominalVpo = voltsPerOctave(PARTS, 25);

/* Ready-made sounds: [name, the parameters they set over DEFAULTS]. */
export const PATCHES = {
  init: ['Init', {}],
  growl: ['Growl bass', { 'vco1.oct': -1, 'vco2.oct': -1, 'vco2.wave': 'square', 'vco2.detune': 0.56, 'mix.vco1': 0.9, 'mix.vco2': 0.7, 'flt.lvl': 0.88, 'flt.frq': 0.62, 'flt.res': 0.8, 'flt.cv1': 0.66, 'eg1.a': 0.02, 'eg1.d': 0.42, 'eg1.s': 0.12, 'eg1.r': 0.35, 'eg2.a': 0.02, 'eg2.d': 0.5, 'eg2.s': 0.8, 'eg2.r': 0.3, 'glob.track': 0.3 }],
  scream: ['Scream lead', { 'vco2.oct': 1, 'vco2.wave': 'pulse', 'vco2.pw': 0.25, 'mix.vco2': 0.45, 'flt.res': 0.965, 'flt.frq': 0.7, 'flt.cv1': 0.6, 'flt.lvl': 0.6, 'glob.glide': 0.35, 'glob.legato': 'on', 'lfo.pitch': 0.12, 'lfo.rate': 0.62, 'eg1.a': 0.3, 'eg1.d': 0.6, 'eg1.s': 0.4 }],
  whistle: ['Filter whistle', { 'mix.vco1': 0, 'mix.vco2': 0, 'flt.res': 1, 'flt.frq': 0.537, 'flt.cv1': 0.5, 'flt.out': 'lp', 'glob.track': nominalVpo / 1.2, 'eg2.a': 0.18, 'eg2.d': 0.6, 'eg2.s': 0.9, 'eg2.r': 0.5, 'glob.glide': 0.25, 'glob.volume': 0.36 }],
  drone: ['Drifting drone', { 'vca.mode': 'open', 'vco1.oct': -1, 'vco2.oct': -2, 'vco2.wave': 'saw', 'vco2.detune': 0.55, 'mix.vco1': 0.6, 'mix.vco2': 0.7, 'mix.noise': 0.12, 'flt.res': 0.9, 'flt.frq': 0.62, 'flt.cv1': 0.5, 'lfo.rate': 0.12, 'lfo.filter': 0.55, 'glob.volume': 0.55 }],
  duo: ['Duo brass', { 'glob.mode': 'duo', 'vco2.wave': 'saw', 'vco2.detune': 0.5, 'mix.vco2': 0.8, 'flt.frq': 0.6, 'flt.res': 0.5, 'flt.cv1': 0.67, 'eg1.a': 0.42, 'eg1.d': 0.55, 'eg1.s': 0.5, 'eg2.a': 0.3, 'eg2.s': 0.85 }],
};

/* What each control does: the page's help line and the agent guide share these words. */
const ENV = (which) => ({
  a: ['ATTACK', `How fast ${which} rises, from 1 ms to 10 s.`],
  d: ['DECAY', `How fast ${which} falls to the sustain level.`],
  s: ['SUSTAIN', `The level ${which} holds while a key is down.`],
  r: ['RELEASE', `How long ${which} takes to fade once the key is let go.`],
});
const E1 = ENV('the filter envelope (into CV 1)'), E2 = ENV('the amplifier envelope');
export const HELP = {
  'vco1.oct': ['RANGE', "The oscillator's footage: 8' is concert pitch, 16' and 32' one and two octaves down, 4' and 2' up."],
  'vco1.wave': ['WAVE', 'Triangle is soft, sawtooth bright with every harmonic, square hollow, pulse nasal: set its width.'],
  'vco1.pw': ['PULSE WIDTH', 'The duty cycle of the pulse wave, 5 % to 50 %. The LFO can sweep it (→ PW).'],
  'vco2.detune': ['DETUNE', 'VCO 2 against VCO 1, ±100 cents. A few cents give the slow beating of two analogue oscillators.'],
  'mix.vco1': ['VCO 1 LEVEL', 'How loud oscillator 1 is going into the filter. Both at full push the filter into its growl.'],
  'mix.noise': ['NOISE', 'White noise into the filter. With high resonance it whistles and hisses.'],
  'src': ['SOURCE', 'The oscillators, or LINE IN: your microphone or audio interface through the filter. Use headphones.'],
  'flt.frq': ['FREQUENCY', 'How bright the sound is: turn right to let more of the tone through (synth players call it the cutoff). It drifts a little as the unit warms up, as a real one does.'],
  'flt.res': ['RESONANCE', 'Makes the filter ring at FREQUENCY. Near the top it starts to whistle by itself; fully up it screams.'],
  'flt.cv1': ['CV 1', 'How much each note opens the filter (right) or closes it (left). The middle does nothing; small turns make big changes.'],
  'flt.lvl': ['AUDIO', 'How hard the tone hits the filter. Turn it up for the rough Polivoks growl.'],
  'flt.mix': ['MIX LP–BP', 'Blends the filter’s two outputs, full (LP) and thin (BP), for the MIX OUT jack.'],
  'flt.out': ['OUT JACKS', 'Pick what you hear: LP is full, BP thin and vocal, MIX the blend you set. Click a jack.'],
  'jack.in': ['WIRED FOR YOU', 'These sockets are already connected: envelope 1, the keyboard and the LFO, and the mixer all feed the filter.'],
  'keys3d': ['KEYS', 'Click or touch a key to play it; slide along the keys to go from note to note.'],
  'vca.mode': ['VCA', 'ENV follows the amplifier envelope; OPEN lets sound through all the time, for drones, self-oscillation and line in.'],
  'lfo.rate': ['RATE', 'The LFO speed, 0.05 to 30 Hz.'],
  'lfo.wave': ['LFO WAVE', 'Triangle, square, sawtooth, or sample-and-hold: a new random step each cycle.'],
  'lfo.pitch': ['→ PITCH', 'Vibrato depth on both oscillators.'],
  'lfo.filter': ['→ CV 2', "The LFO into the filter's CV 2: wah, wobble and trill."],
  'lfo.pw': ['→ PW', 'Sweeps the pulse width: pulse-width modulation.'],
  'glob.glide': ['GLIDE', 'Portamento: each note slides from the last one.'],
  'glob.track': ['TRACK', 'How much the filter follows the notes you play: around half-way it follows them exactly, higher and it brightens faster than the notes rise.'],
  'glob.volume': ['VOLUME', 'The output level.'],
  'glob.mode': ['VOICES', 'MONO plays the last key held. DUO gives VCO 1 the lowest and VCO 2 the highest key, as the Polivoks does.'],
  'glob.legato': ['LEGATO', 'On: overlapping notes do not restart the envelopes.'],
  'song': ['SONG', 'Public-domain tunes. Choosing one loads the sound it was arranged for; change anything while it plays.'],
  'song.tempo': ['TEMPO', 'Play the song slower or faster than written.'],
  'play': ['PLAY', 'Starts the chosen song, and the power if it is off.'],
  'patch': ['SOUND', 'Ready-made settings for every knob (synth players call a saved sound a “patch”). Pick one, then change anything.'],
  'power': ['POWER', 'Starts the sound. The unit then warms up and its cutoff drifts, as a real one does.'],
};
for (const n of [1, 2]) for (const k of ['a', 'd', 's', 'r']) HELP[`eg${n}.${k}`] = (n === 1 ? E1 : E2)[k];
HELP['vco2.oct'] = HELP['vco1.oct']; HELP['vco2.wave'] = HELP['vco1.wave']; HELP['vco2.pw'] = HELP['vco1.pw'];
HELP['mix.vco2'] = ['VCO 2 LEVEL', HELP['mix.vco1'][1].replace('oscillator 1', 'oscillator 2')];


/* The keys a patch resets; imperfections, the scope probe, line in, bend and song tempo stay as they are. */
export const PATCH_KEYS = Object.keys(DEFAULTS).filter((k) => !k.startsWith('imp.') && !k.startsWith('song.') && !['probe', 'src', 'kbd.bend'].includes(k));
export function patchValues(id, extra = {}) {
  const p = PATCHES[id] || PATCHES.init;
  return { ...Object.fromEntries(PATCH_KEYS.map((k) => [k, DEFAULTS[k]])), ...p[1], ...extra };
}

/* Every parameter an agent may set: its kind, range and meaning. Knobs are 0–1 like the panel. */
const CHOICES = {
  'vco1.wave': ['tri', 'saw', 'square', 'pulse'], 'vco2.wave': ['tri', 'saw', 'square', 'pulse'],
  'lfo.wave': ['tri', 'square', 'saw', 'sh'], 'flt.out': ['lp', 'bp', 'mix'], 'glob.mode': ['mono', 'duo'],
  'glob.legato': ['off', 'on'], 'vca.mode': ['env', 'open'], 'probe': ['out', 'lp', 'bp', 'mix', 'in'],
  'imp.grade': ['ideal', 'modern', 'vintage'], 'imp.warmup': ['on', 'off'], 'imp.mains': [50, 60],
};
const RANGES = { 'vco1.oct': [-2, 2, true], 'vco2.oct': [-2, 2, true], 'imp.seed': [1, 99999, true], 'imp.ambient': [10, 40], 'kbd.bend': [-2, 2] };
const AGENT_KEYS = Object.keys(DEFAULTS).filter((k) => k !== 'src'); // line in needs the person's own microphone permission
export const PARAMS = Object.fromEntries(AGENT_KEYS.map((k) => {
  const help = HELP[k] ? HELP[k][1] : k === 'song.tempo' ? HELP['song.tempo'][1] : '';
  if (CHOICES[k]) return [k, { kind: 'choice', options: CHOICES[k], default: DEFAULTS[k], help }];
  const [min, max, integer] = RANGES[k] || [0, 1];
  return [k, { kind: integer ? 'integer' : 'number', min, max, default: DEFAULTS[k], help }];
}));

/* Check parameter values; returns { values, errors } with values coerced to their kinds. */
export function validateParams(input = {}) {
  const values = {}, errors = [];
  if (typeof input !== 'object' || Array.isArray(input) || input === null) return { values, errors: ['Parameters must be an object of name: value.'] };
  for (const [k, raw] of Object.entries(input)) {
    const p = PARAMS[k];
    if (!p) { errors.push(`Unknown parameter "${k}". Use one of: ${Object.keys(PARAMS).join(', ')}.`); continue; }
    if (p.kind === 'choice') {
      const v = p.options.find((o) => String(o) === String(raw));
      if (v === undefined) errors.push(`${k} must be one of ${p.options.join(', ')}.`); else values[k] = v;
    } else {
      const v = Number(raw);
      if (!Number.isFinite(v) || v < p.min || v > p.max || (p.kind === 'integer' && !Number.isInteger(v))) errors.push(`${k} must be ${p.kind === 'integer' ? 'a whole number' : 'a number'} from ${p.min} to ${p.max}.`);
      else values[k] = v;
    }
  }
  return { values, errors };
}

const LIMITS = { chars: 20000, minutes: 10, notes: 4000 };

/*
 * Turn an agent's or a person's song into a song like those in songs.js, or throw with every problem found.
 * spec: { title, bpm or tempo [[beat, bpm], …], meter (beats per bar), pickup?, gate?, score or parts [{ score, shift? }],
 *         patch? (a PATCHES id), set? ({ parameter: value }) }
 */
export function validateSong(spec) {
  const errors = [];
  if (!spec || typeof spec !== 'object') throw new Error('A song is an object: { title, bpm, meter, score, patch, set }.');
  const title = String(spec.title || 'Untitled').slice(0, 80);
  const meter = Number(spec.meter ?? 4), pickup = spec.pickup === undefined ? 0 : Number(spec.pickup);
  if (!(meter > 0 && meter <= 16)) errors.push('meter is the number of beats in a bar, from 0.5 to 16 (a quarter note is one beat).');
  if (!(pickup >= 0 && pickup < meter)) errors.push('pickup, if given, is the length of the opening part-bar in beats, less than meter.');
  const gate = spec.gate === undefined ? 0.88 : Number(spec.gate);
  if (!(gate >= 0.1 && gate <= 1)) errors.push('gate is how much of each note sounds, from 0.1 (staccato) to 1 (legato).');
  let tempo = null, bpm = null;
  if (Array.isArray(spec.tempo) && spec.tempo.length) {
    tempo = spec.tempo.map((t) => [Number(t[0]), Number(t[1])]);
    if (tempo.some(([b, v]) => !(b >= 0) || !(v >= 30 && v <= 300))) errors.push('tempo is a list of [beat, bpm] pairs, bpm from 30 to 300.');
  } else {
    bpm = Number(spec.bpm ?? 120);
    if (!(bpm >= 30 && bpm <= 300)) errors.push('bpm (quarter notes per minute) must be from 30 to 300.');
  }
  const parts = Array.isArray(spec.parts) ? spec.parts : typeof spec.score === 'string' ? [{ score: spec.score }] : null;
  if (!parts || !parts.length) errors.push('Give the notes as score: "C4:1 D4 E4 F4 | G4:2 G4 |" or parts: [{ score, shift }].');
  let beats = 0, notes = 0, lo = 127, hi = 0, bars = 0;
  for (const [pi, part] of (parts || []).entries()) {
    const score = String(part?.score ?? '');
    if (score.length > LIMITS.chars) { errors.push(`Part ${pi + 1} is longer than ${LIMITS.chars} characters.`); continue; }
    const shift = Number(part?.shift ?? 0);
    if (!Number.isInteger(shift) || Math.abs(shift) > 24) errors.push(`Part ${pi + 1}: shift is whole semitones, −24 to 24.`);
    let p;
    try { p = parse(score); } catch (e) { errors.push(`Part ${pi + 1}: ${e.message}. Notes look like C4, F#3, Bb5 or R (rest), each with an optional :duration.`); continue; }
    p.bars.forEach((len, i) => {
      const want = pi === 0 && i === 0 && pickup ? pickup : meter;
      const last = i === p.bars.length - 1 && !score.trim().endsWith('|');
      if (!last && Math.abs(len - want) > 1e-6) errors.push(`Part ${pi + 1}, bar ${i + 1}: ${+len.toFixed(4)} beats, but the bar should be ${want}.`);
    });
    for (const n of p.notes) { const m = n.note + shift; lo = Math.min(lo, m); hi = Math.max(hi, m); }
    if (p.notes.some((n) => n.note + shift < 24 || n.note + shift > 108)) errors.push(`Part ${pi + 1}: notes must stay between C1 and C8.`);
    beats += p.length; notes += p.notes.length; bars += p.bars.length;
  }
  if (notes > LIMITS.notes) errors.push(`At most ${LIMITS.notes} notes.`);
  const seconds = tempo ? null : (beats * 60) / (bpm || 120);
  if (seconds !== null && seconds > LIMITS.minutes * 60) errors.push(`At most ${LIMITS.minutes} minutes.`);
  const patch = spec.patch === undefined ? 'init' : String(spec.patch);
  if (!PATCHES[patch]) errors.push(`patch must be one of ${Object.keys(PATCHES).join(', ')}.`);
  const { values: set, errors: pe } = validateParams(spec.set || {});
  errors.push(...pe);
  if (errors.length) { const e = new Error(errors.join('\n')); e.problems = errors; throw e; }
  const id = `user-${hash(JSON.stringify([title, parts, meter, bpm, tempo, patch, set]))}`;
  return {
    id, title, by: String(spec.by || 'Your song').slice(0, 80), year: new Date().getFullYear(), from: 'Your song', user: true,
    note: String(spec.note || '').slice(0, 200), meter, pickup: pickup || undefined, gate, bpm: bpm ?? undefined, tempo: tempo ?? undefined,
    parts: parts.map((p) => ({ score: String(p.score), shift: Number(p.shift || 0) || undefined })),
    patch: { base: patch, set }, stats: { bars, beats, notes, seconds, lowest: lo, highest: hi },
  };
}

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }

/* Share links: the song travels in the URL fragment, so it never reaches a server. */
export function encodeSong(spec) {
  const s = validateSong(spec);
  const json = JSON.stringify({ title: s.title, by: s.by, note: s.note || undefined, meter: s.meter, pickup: s.pickup, gate: s.gate, bpm: s.bpm, tempo: s.tempo, parts: s.parts, patch: s.patch.base, set: s.patch.set });
  const bytes = new TextEncoder().encode(json);
  let bin = ''; for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
/* The song as written, from a link's code; validateSong(decodeSpec(code)) is the playable song. */
export function decodeSpec(code) {
  const b64 = String(code).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
}
export const decodeSong = (code) => validateSong(decodeSpec(code));
export const LIVE_URL = 'https://nj22az.github.io/polivoks/';
export const shareLink = (spec, base = LIVE_URL) => `${base}#song=${encodeSong(spec)}`;

/* What an agent reads before it writes a song. */
export const GUIDE = `Johansson PF-82: a monophonic (or two-voice DUO) analogue-style synthesiser around a simulated Polivoks filter.

WRITING A SONG
A song is { title, bpm, meter, score, patch, set }.
- score: notes separated by spaces, each NOTE:DURATION. NOTE is C4 (middle C), F#3, Bb5 … or R for a rest.
  DURATION is in beats, a quarter note = 1: 1/4 is a sixteenth, 1/2 an eighth, 3/2 a dotted quarter, 2 a half, 4 a whole.
  A duration carries on to the next notes until you change it, so "C4:1/2 D4 E4 F4" is four eighths.
  "|" ends a bar; every bar must add up to meter (the checker names any bar that does not).
- meter: beats per bar (4 for 4/4, 3 for 3/4, 1.5 for 3/8). pickup: length of an opening part-bar, if any.
- bpm: quarter notes per minute, 30–300. Or tempo: [[beat, bpm], …] for changes (an accelerando is many steps).
- parts: [{ score, shift }] instead of score, played one after another; shift transposes a part in semitones.
- gate: how much of each note sounds, 0.1 (staccato) to 1 (legato). Default 0.88.
- The PF-82 plays one line (MONO, the last note wins). In DUO mode two overlapping notes play together:
  VCO 1 takes the lower, VCO 2 the higher. Good range: C2 to C6.
- patch: one of ${Object.keys(PATCHES).map((k) => `${k} (${PATCHES[k][0]})`).join(', ')}.
- set: parameters over the patch, e.g. { "flt.frq": 0.6, "flt.res": 0.85, "vco1.wave": "saw" }.

SOUND TIPS
- flt.frq (cutoff) and flt.res (resonance) are the character: res 0.8–0.95 for the Polivoks squelch, 1 to self-oscillate.
- flt.lvl drives the filter: 0.8+ growls. flt.cv1 is the filter envelope amount around 0.5 (0.6–0.7 opens it per note).
- eg1.* shape the filter envelope, eg2.* the volume (attack, decay, sustain, release; 0–1, times from 1 ms to 10 s).
- glob.glide slides between notes; with glob.legato "on" overlapping notes slide without re-attacking.
- glob.volume 0.5–0.9. Balance against the built-in songs (pf82_list).

PLAYING IT
- pf82_check_song finds mistakes, pf82_render writes a WAV with the exact engine and reports its levels,
  pf82_share_link gives a link that opens the live PF-82 with the song ready to play.
- pf82_open serves the PF-82 on this computer; once the person opens it and presses Power, pf82_set,
  pf82_play and pf82_stop work live in their browser. Browsers only start sound after a person's click.`;

/* Sakura Shōten's jingles (jingles/sakura.js), playable by id like the public-domain songs. Their recordings were made on
 * the shop's own unit, SHOP_UNIT, whose two oscillators track within 2 cents from C3 to C6 (jingles/render.mjs). */
export const SHOP_UNIT = Object.freeze({ grade: 'modern', seed: 13715 });
export const JINGLE_SONGS = JINGLES.map((j) => ({
  ...validateSong({ ...j.song, by: 'Sakura Shōten' }), id: j.id, title: j.title, user: false, from: 'Sakura Shōten', note: j.why,
  jingle: { when: j.when, where: j.where, loop: !!j.loop },
}));

export const BUILT_IN_SONGS = [...SONGS, ...JINGLE_SONGS].map((s) => ({ id: s.id, title: s.title, by: s.by, year: s.year, meter: s.meter, bpm: s.bpm, patch: s.patch.base, note: s.note, ...(s.jingle ? { jingle: s.jingle, unit: SHOP_UNIT } : {}) }));
