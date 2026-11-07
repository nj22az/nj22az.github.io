// The song book: every bar adds up, every note is playable, and the sequencer plays them all.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SONGS, parse, build, midi } from '../songs.js';
import { PolivoksSynth } from '../dsp/polivoks-dsp.js';

test('note names: C4 is middle C (60), A4 is 69, accidentals move a semitone', () => {
  assert.equal(midi('C4'), 60); assert.equal(midi('A4'), 69); assert.equal(midi('F#4'), 66); assert.equal(midi('Bb3'), 58);
  assert.throws(() => midi('H4'));
});

for (const song of SONGS) {
  test(`${song.title}: every bar adds up to the metre`, () => {
    assert.ok(song.by && song.year && song.year < 1900, 'composed long enough ago to be in the public domain');
    let first = true;
    for (const part of song.parts) {
      const { bars } = parse(part.score);
      bars.forEach((len, i) => {
        const want = first && i === 0 && song.pickup ? song.pickup : song.meter;
        assert.ok(Math.abs(len - want) < 1e-9, `${song.id} bar ${i + 1}: ${len} beats, expected ${want}`);
      });
      first = false;
    }
  });

  test(`${song.title}: notes in range, every attack released`, () => {
    const { events, length } = build(song);
    assert.ok(length > 8 && events.length >= 20);
    const open = new Map();
    let last = -1;
    for (const [beat, on, n] of events) {
      assert.ok(beat >= last, 'sorted'); last = beat;
      assert.ok(n >= 36 && n <= 96, `note ${n} playable`);
      if (on) open.set(n, (open.get(n) || 0) + 1); else open.set(n, open.get(n) - 1);
    }
    for (const c of open.values()) assert.equal(c, 0);
  });
}

test('sequencer: plays every note of a song in order and leaves nothing held', () => {
  for (const song of SONGS) {
    const s = new PolivoksSynth(48000, 2, { 'imp.grade': 'ideal', 'song.tempo': 1 });
    const played = [];
    const on = s.noteOn.bind(s);
    s.noteOn = (n) => { played.push(n); on(n); };
    const b = build(song);
    s.message({ t: 'song', ...b });
    let guard = 0;
    while (s.seq && guard++ < 1e7) s.ctl();
    const want = b.events.filter((e) => e[1] === 1).map((e) => e[2]);
    assert.deepEqual(played, want, song.id);
    assert.equal(s.notes.length, 0, `${song.id}: no stuck note`);
    assert.equal(s.telemetry().ended, song.id);
  }
});

test('sequencer: stopping a song releases its notes but not the player’s own', () => {
  const s = new PolivoksSynth(48000, 2, {});
  s.message({ t: 'on', n: 40 });
  s.message({ t: 'song', ...build(SONGS[0]) });
  for (let i = 0; i < 200; i++) s.ctl();
  assert.ok(s.notes.length >= 2);
  s.message({ t: 'songStop' });
  assert.deepEqual(s.notes, [40]);
});

test('sequencer: the tempo map and the tempo control both change the speed', () => {
  const time = (tempoKnob) => {
    const s = new PolivoksSynth(48000, 2, { 'song.tempo': tempoKnob });
    s.message({ t: 'song', ...build(SONGS[0]) });
    let n = 0; while (s.seq) { s.ctl(); n++; }
    return (n * 4) / 48000;
  };
  const normal = time(0.5), fast = time(1);
  // Mountain King: 17 bars of 4 beats from 100 to 228 bpm.
  const want = Array.from({ length: 17 }, (_, bar) => (4 * 60) / (100 + 8 * bar)).reduce((a, b) => a + b);
  assert.ok(Math.abs(normal - want) < 0.05, `${normal} s vs ${want} s`);
  assert.ok(Math.abs(fast - normal / 2) < 0.05, `×2 tempo: ${fast} s`);
});
