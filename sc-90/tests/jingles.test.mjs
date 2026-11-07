// Sakura Shōten's jingles (sakura.js) on the SC-90, rendered by render.mjs into sakura/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parse } from '../../polivoks/songs.js';
import { CHORDS, JINGLES, KEY, MOTIF } from '../sakura.js';
import { chipHash, specHash } from '../render.mjs';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'sakura');
const manifest = JSON.parse(readFileSync(path.join(DIR, 'manifest.json'), 'utf8'));
const scored = (j) => Object.entries(j.voices).filter(([, v]) => v.score);
const at = (notes, beat) => notes.find((n) => n.beat <= beat + 1e-9 && beat < n.beat + n.dur - 1e-9);

test('every jingle has a moment, a place and a reason, and every voice fills its bars', () => {
  for (const j of JINGLES) {
    for (const k of ['title', 'when', 'where', 'why']) assert.ok(typeof j[k] === 'string' && j[k].length > 8, `${j.id} says ${k}`);
    assert.equal(j.chords.length, j.bars, `${j.id}: one chord entry per bar`);
    for (const [name, v] of scored(j)) {
      const p = parse(v.score);
      assert.equal(p.bars.length, j.bars, `${j.id} ${name}: ${j.bars} bars`);
      p.bars.forEach((len, i) => assert.ok(Math.abs(len - j.meter) < 1e-9, `${j.id} ${name} bar ${i + 1}: ${len} beats, not ${j.meter}`));
    }
  }
});

test('in key, and in harmony: at every beat the melody, harmony and bass sound a note of the chord', () => {
  for (const j of JINGLES) {
    for (const [name, v] of scored(j)) {
      if (v.voice === 'noise') continue;
      const notes = parse(v.score).notes;
      for (const n of notes) assert.ok(KEY.scale.includes(n.note % 12), `${j.id} ${name}: note ${n.note} is in C major`);
      for (let beat = 0; beat < j.bars * j.meter; beat++) {
        const bar = Math.floor(beat / j.meter), parts = j.chords[bar].split(' ');
        const chord = parts[Math.floor(((beat % j.meter) / j.meter) * parts.length)];
        assert.ok(CHORDS[chord], `${j.id}: chord ${chord} is known`);
        const n = at(notes, beat);
        if (n) assert.ok(CHORDS[chord].includes(n.note % 12), `${j.id} ${name}, beat ${beat + 1}: note ${n.note} against ${chord}`);
      }
    }
  }
});

test('every tune comes home: it ends on the C chord, with C at the bottom', () => {
  for (const j of JINGLES) {
    const last = scored(j).filter(([, v]) => v.voice !== 'noise').map(([, v]) => parse(v.score).notes.at(-1).note);
    for (const m of last) assert.ok(CHORDS.C.includes(m % 12), `${j.id}: last note ${m} is in the C chord`);
    assert.equal(Math.min(...last) % 12, KEY.tonic, `${j.id}: the lowest last note is a C`);
  }
});

test('the shop’s motif, “sa-ku-ra shō-ten”, opens the door chime and the shop jingle', () => {
  const opening = (j) => parse(j.voices.melody.score).notes.slice(0, 5).map((n) => n.note);
  const motif = parse(MOTIF).notes.map((n) => n.note);
  for (const id of ['sakura-door', 'sakura-ident']) assert.deepEqual(opening(JINGLES.find((j) => j.id === id)), motif, id);
});

test('the hours are Sakura’s: open 09:00 (never Saturday), the till to 20:00, the shutter at 20:30', () => {
  const by = Object.fromEntries(JINGLES.map((j) => [j.id, j]));
  assert.match(by['sakura-open'].when, /09:00/); assert.match(by['sakura-open'].when, /Saturday/);
  assert.match(by['sakura-till'].when, /20:00/);
  assert.match(by['sakura-closing'].when, /20:00/); assert.match(by['sakura-closing'].when, /20:30/);
  assert.deepEqual(JINGLES.filter((j) => j.loop).map((j) => j.id), ['sakura-closing'], 'only the closing waltz loops');
});

test('the rendered files are current: same chip, same scores, inside each jingle’s length', async () => {
  assert.equal(manifest.chipHash, await chipHash(), 'rendered by the current chip (run node sc-90/render.mjs)');
  assert.equal(manifest.files.length, JINGLES.length);
  for (const j of JINGLES) {
    const f = manifest.files.find((x) => x.id === j.id);
    assert.ok(f, `${j.id} rendered`);
    assert.equal(f.spec, specHash(j), `${j.id} rendered from its current score and sound`);
    assert.ok(f.seconds >= j.seconds[0] && f.seconds <= j.seconds[1], `${j.id}: ${f.seconds} s inside ${j.seconds}`);
    const wav = readFileSync(path.join(DIR, f.wav));
    assert.equal(wav.toString('ascii', 0, 4), 'RIFF'); assert.equal(wav.readUInt32LE(24), manifest.sampleRate);
    assert.ok(Math.abs((wav.length - 44) / 2 / manifest.sampleRate - f.seconds) < 0.002, `${j.id} WAV length`);
    if (f.mp3) assert.ok(existsSync(path.join(DIR, f.mp3)), `${f.mp3} exists`);
    assert.ok(Math.abs(f.rmsDb + 15) <= 0.1 && f.peakDb <= -1, `${j.id}: as loud as the others (${f.rmsDb} dBFS rms, peak ${f.peakDb})`);
  }
});

test('the closing waltz loops without a click: its last sample runs into its first', () => {
  const f = manifest.files.find((x) => x.loop);
  const b = readFileSync(path.join(DIR, f.wav)), n = (b.length - 44) / 2, s = (i) => b.readInt16LE(44 + 2 * i) / 32767;
  let step = 0;
  for (let i = 1; i < n; i++) step = Math.max(step, Math.abs(s(i) - s(i - 1)));
  assert.ok(Math.abs(s(0) - s(n - 1)) < 0.25 * step, `seam ${Math.abs(s(0) - s(n - 1)).toFixed(4)} against the largest step ${step.toFixed(4)}`);
});
