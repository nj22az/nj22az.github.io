/*
 * Public-domain tunes for the Polivoks simulator: our own single-line transcriptions of
 * compositions whose authors died long ago (or of traditional songs). Nothing here is copied
 * from a published arrangement or a recording.
 *
 * Score: whitespace-separated tokens NOTE:DURATION (in beats, a quarter = 1). The duration
 * carries over until it changes. R is a rest. "|" closes a bar, so tests/songs.test.mjs can
 * prove that every bar adds up to the metre. C4 is middle C.
 */

const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export function midi(name) {
  const m = /^([A-G])([#b]?)(\d)$/.exec(name);
  if (!m) throw new Error(`Not a note: ${name}`);
  return 12 * (Number(m[3]) + 1) + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}

function beats(text) {
  const [a, b] = text.split('/');
  const v = Number(a) / (b === undefined ? 1 : Number(b));
  if (!(v > 0) || !Number.isFinite(v)) throw new Error(`Not a duration: ${text}`);
  return v;
}

/* Parse one score into notes { beat, dur, note } and bar lengths. */
export function parse(score) {
  const notes = [], bars = [];
  let dur = 1, beat = 0, barStart = 0;
  for (const tok of score.trim().split(/\s+/)) {
    if (tok === '|') { bars.push(beat - barStart); barStart = beat; continue; }
    const [name, d] = tok.split(':');
    if (d !== undefined) dur = beats(d);
    if (name !== 'R') notes.push({ beat, dur, note: midi(name) });
    beat += dur;
  }
  if (beat > barStart + 1e-9) bars.push(beat - barStart);
  return { notes, length: beat, bars };
}

/* Join a song's parts in time and turn them into events [beat, 1 on / 0 off, note]. */
export function build(song) {
  const ev = [];
  let at = 0;
  for (const part of song.parts) {
    const p = parse(part.score);
    for (const n of p.notes) {
      const note = n.note + (part.shift || 0), off = at + n.beat + n.dur * (song.gate || 0.88);
      ev.push([at + n.beat, 1, note], [off, 0, note]);
    }
    at += p.length;
  }
  ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]); // at the same beat, release before the next attack
  return { id: song.id, events: ev, length: at, tempo: song.tempo || [[0, song.bpm]] };
}

const arp = (a, b, c, d, e) => `${a}:1/4 ${b} ${c} ${d} ${e} ${c} ${d} ${e} ${a} ${b} ${c} ${d} ${e} ${c} ${d} ${e} |`;

const MOUNTAIN = 'B3:1/2 C#4 D4 E4 F#4 D4 F#4:1 | F4:1/2 C#4 F4:1 E4:1/2 C4 E4:1 | B3:1/2 C#4 D4 E4 F#4 D4 F#4 B4 | A4:1/2 F#4 D4 F#4 A4:2 |';
const MINUET_A = 'D5:1 G4:1/2 A4 B4 C5 | D5:1 G4 G4 | E5:1 C5:1/2 D5 E5 F#5 | G5:1 G4 G4 | C5:1 D5:1/2 C5 B4 A4 | B4:1 C5:1/2 B4 A4 G4 |';
const ODE_A = 'F#4:1 F#4 G4 A4 | A4 G4 F#4 E4 | D4 D4 E4 F#4 |';
const KORO_A = 'E5:1 B4:1/2 C5 D5:1 C5:1/2 B4 | A4:1 A4:1/2 C5 E5:1 D5:1/2 C5 | B4:3/2 C5:1/2 D5:1 E5 | C5:1 A4 A4:2 |';
const KORO_B = 'D5:3/2 F5:1/2 A5:1 G5:1/2 F5 | E5:3/2 C5:1/2 E5:1 D5:1/2 C5 | B4:1 B4:1/2 C5 D5:1 E5 | C5:1 A4 A4:2 |';
const ELISE = 'E5:1/4 D#5 E5 B4 D5 C5 | A4:1/2 R:1/4 C4 E4 A4 | B4:1/2 R:1/4 E4 G#4 B4 | C5:1/2 R:1/4 E4 E5 D#5 | E5:1/4 D#5 E5 B4 D5 C5 | A4:1/2 R:1/4 C4 E4 A4 | B4:1/2 R:1/4 E4 C5 B4 |';
const GREEN_LINE = 'C5:2 D5:1 | E5:3/2 F5:1/2 E5:1 | D5:2 B4:1 | G4:3/2 A4:1/2 B4:1 |';
const GREEN_CHORUS = 'G5:3 | G5:3/2 F#5:1/2 E5:1 | D5:2 B4:1 | G4:3/2 A4:1/2 B4:1 |';

export const SONGS = [
  {
    id: 'mountain-king', title: 'In the Hall of the Mountain King', by: 'Edvard Grieg', year: 1875, from: 'Peer Gynt',
    note: 'The theme four times, an octave up and faster each pass.', meter: 4, gate: 0.62,
    tempo: Array.from({ length: 17 }, (_, bar) => [bar * 4, 100 + 8 * bar]),
    parts: [{ score: MOUNTAIN }, { score: MOUNTAIN }, { score: MOUNTAIN, shift: 12 }, { score: MOUNTAIN, shift: 12 }, { score: 'B3:1 R:1 B2:2 |' }],
    patch: { base: 'growl', set: { 'eg2.d': 0.42, 'eg2.s': 0.3, 'eg2.r': 0.22, 'glob.track': 0.35 } },
  },
  {
    id: 'prelude-c', title: 'Prelude in C major, BWV 846', by: 'Johann Sebastian Bach', year: 1722, from: 'The Well-Tempered Clavier',
    note: 'The opening eleven bars as one arpeggio line, then home to C.', meter: 4, bpm: 66, gate: 0.92,
    parts: [{
      score: [arp('C4', 'E4', 'G4', 'C5', 'E5'), arp('C4', 'D4', 'A4', 'D5', 'F5'), arp('B3', 'D4', 'G4', 'D5', 'F5'), arp('C4', 'E4', 'G4', 'C5', 'E5'),
        arp('C4', 'E4', 'A4', 'E5', 'A5'), arp('C4', 'D4', 'F#4', 'A4', 'D5'), arp('B3', 'D4', 'G4', 'D5', 'G5'), arp('B3', 'C4', 'E4', 'G4', 'C5'),
        arp('A3', 'C4', 'E4', 'G4', 'C5'), arp('D3', 'A3', 'D4', 'F#4', 'C5'), arp('G3', 'B3', 'D4', 'G4', 'B4'), 'C4:1/4 E4 G4 C5 E5:3 |'].join(' '),
    }],
    patch: { base: 'init', set: { 'vco2.wave': 'square', 'vco2.oct': 1, 'mix.vco2': 0.3, 'flt.frq': 0.6, 'flt.res': 0.72, 'flt.cv1': 0.66, 'eg1.a': 0, 'eg1.d': 0.36, 'eg1.s': 0.05, 'eg1.r': 0.3, 'eg2.a': 0.02, 'eg2.d': 0.5, 'eg2.s': 0.35, 'eg2.r': 0.42, 'glob.volume': 0.9 } },
  },
  {
    id: 'minuet-g', title: 'Minuet in G', by: 'Christian Petzold', year: 1725, from: 'Notebook for Anna Magdalena Bach',
    note: 'Both halves of the first section.', meter: 3, bpm: 126, gate: 0.85,
    parts: [{ score: `${MINUET_A} F#4:1 G4:1/2 A4 B4 G4 | A4:3 | ${MINUET_A} A4:1 B4:1/2 A4 G4 F#4 | G4:3 |` }],
    patch: { base: 'init', set: { 'vco1.wave': 'pulse', 'vco1.pw': 0.25, 'vco2.wave': 'saw', 'vco2.detune': 0.54, 'flt.frq': 0.68, 'flt.res': 0.55, 'flt.cv1': 0.6, 'eg1.d': 0.4, 'eg1.s': 0.3, 'eg2.a': 0.04, 'eg2.d': 0.45, 'eg2.s': 0.65, 'eg2.r': 0.3 } },
  },
  {
    id: 'ode-to-joy', title: 'Ode to Joy', by: 'Ludwig van Beethoven', year: 1824, from: 'Symphony No. 9',
    note: 'The tune of the finale, in its own key of D.', meter: 4, bpm: 112, gate: 0.88,
    parts: [{ score: `${ODE_A} F#4:3/2 E4:1/2 E4:2 | ${ODE_A} E4:3/2 D4:1/2 D4:2 | E4:1 E4 F#4 D4 | E4:1 F#4:1/2 G4 F#4:1 D4 | E4:1 F#4:1/2 G4 F#4:1 E4 | D4:1 E4 A3:2 | ${ODE_A} E4:3/2 D4:1/2 D4:2 |` }],
    patch: { base: 'duo', set: { 'glob.mode': 'mono' } },
  },
  {
    id: 'korobeiniki', title: 'Korobeiniki (The Peddlers)', by: 'Russian folk song, words by Nikolay Nekrasov', year: 1861, from: 'Traditional',
    note: 'Verse and refrain, twice, as the folk song goes.', meter: 4, bpm: 140, gate: 0.82,
    parts: [{ score: `${KORO_A} ${KORO_B} ${KORO_A} ${KORO_B}` }],
    patch: { base: 'scream', set: { 'glob.legato': 'off', 'flt.res': 0.93 } },
  },
  {
    id: 'fur-elise', title: 'Für Elise', by: 'Ludwig van Beethoven', year: 1810, from: 'Bagatelle in A minor, WoO 59',
    note: 'The famous opening, played twice.', meter: 1.5, pickup: 0.5, bpm: 88, gate: 0.9,
    parts: [{ score: `E5:1/4 D#5 | ${ELISE} A4:1/2 R:1/2 E5:1/4 D#5 | ${ELISE} A4:3/2 |` }],
    patch: { base: 'init', set: { 'vco1.wave': 'tri', 'vco2.wave': 'tri', 'vco2.oct': 1, 'mix.vco2': 0.35, 'flt.frq': 0.66, 'flt.res': 0.4, 'flt.cv1': 0.57, 'eg1.a': 0.02, 'eg1.d': 0.5, 'eg1.s': 0.4, 'eg2.a': 0.03, 'eg2.d': 0.6, 'eg2.s': 0.5, 'eg2.r': 0.55, 'glob.volume': 0.95 } },
  },
  {
    id: 'greensleeves', title: 'Greensleeves', by: 'English traditional', year: 1580, from: 'Traditional',
    note: 'Played by the filter itself: no oscillators, only resonance. Every unit whistles in its own key; tune it with FREQUENCY.', meter: 3, pickup: 1, bpm: 100, gate: 0.94,
    parts: [{
      score: `A4:1 | ${GREEN_LINE} C5:2 A4:1 | A4:3/2 G#4:1/2 A4:1 | B4:2 G#4:1 | E4:2 A4:1 | ${GREEN_LINE} C5:3/2 B4:1/2 A4:1 | G#4:3/2 F#4:1/2 G#4:1 | A4:3 | `
        + `${GREEN_CHORUS} C5:2 A4:1 | A4:3/2 G#4:1/2 A4:1 | B4:2 G#4:1 | E4:3 | ${GREEN_CHORUS} C5:3/2 B4:1/2 A4:1 | G#4:3/2 F#4:1/2 G#4:1 | A4:3 |`,
    }],
    patch: { base: 'whistle', set: {} }, // the whistle patch is tuned so serial 1982 at 22 °C plays A4 at 440 Hz
  },
];
