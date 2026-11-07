// Sakura Shōten's jingles (jingles/sakura.js), rendered on the PF-82 by jingles/render.mjs into jingles/sakura/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { JINGLES, RYUKYU } from '../jingles/sakura.js';
import { engineHash, specHash } from '../jingles/render.mjs';
import { validateSong } from '../agent.js';
import { parse } from '../songs.js';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'jingles', 'sakura');
const manifest = JSON.parse(readFileSync(path.join(DIR, 'manifest.json'), 'utf8'));

test('every jingle is a valid PF-82 song with a moment, a place and a reason', () => {
  const ids = new Set();
  for (const j of JINGLES) {
    assert.ok(!ids.has(j.id), `${j.id} is unique`); ids.add(j.id);
    assert.doesNotThrow(() => validateSong(j.song), j.id);
    for (const k of ['title', 'when', 'where', 'why']) assert.ok(typeof j[k] === 'string' && j[k].length > 8, `${j.id} says ${k}`);
    assert.ok(Array.isArray(j.seconds) && j.seconds[0] < j.seconds[1], `${j.id} has a length range`);
  }
});

test('every note keeps to the Ryukyu island scale (C E F G B)', () => {
  for (const j of JINGLES) for (const n of parse(j.song.score).notes) assert.ok(RYUKYU.includes(n.note % 12), `${j.id}: note ${n.note}`);
});

test('the shop opens at 09:00, the till closes at 20:00 and the shutter comes down at 20:30, as in the rota', () => {
  const by = Object.fromEntries(JINGLES.map((j) => [j.id, j]));
  assert.match(by['sakura-open'].when, /09:00/); assert.match(by['sakura-open'].when, /Saturday/);
  assert.match(by['sakura-till'].when, /20:00/);
  assert.match(by['sakura-closing'].when, /20:00/); assert.match(by['sakura-closing'].when, /20:30/);
  assert.equal(by['sakura-closing'].loop, true, 'the closing waltz loops');
  assert.deepEqual(JINGLES.filter((j) => j.loop).map((j) => j.id), ['sakura-closing'], 'nothing else loops');
});

test('the rendered files are current: same score, same engine, inside each jingle\'s length', async () => {
  assert.equal(manifest.engineHash, await engineHash(), 'rendered by the current DSP (run node polivoks/jingles/render.mjs)');
  assert.equal(manifest.files.length, JINGLES.length);
  for (const j of JINGLES) {
    const f = manifest.files.find((x) => x.id === j.id);
    assert.ok(f, `${j.id} rendered`);
    assert.equal(f.spec, specHash(j), `${j.id} rendered from its current score and sound`);
    assert.ok(f.seconds >= j.seconds[0] && f.seconds <= j.seconds[1], `${j.id}: ${f.seconds} s inside ${j.seconds}`);
    assert.equal(f.loop, !!j.loop);
    const wav = readFileSync(path.join(DIR, f.wav));
    assert.equal(wav.toString('ascii', 0, 4), 'RIFF'); assert.equal(wav.readUInt32LE(24), manifest.sampleRate);
    assert.ok(Math.abs((wav.length - 44) / 2 / manifest.sampleRate - f.seconds) < 0.002, `${j.id} WAV length`);
    if (f.mp3) assert.ok(existsSync(path.join(DIR, f.mp3)), `${f.mp3} exists`);
  }
});

test('the closing waltz loops without a click: its last sample runs into its first', () => {
  const f = manifest.files.find((x) => x.loop);
  const b = readFileSync(path.join(DIR, f.wav)), n = (b.length - 44) / 2;
  const s = (i) => b.readInt16LE(44 + 2 * i) / 32767;
  let step = 0;
  for (let i = 1; i < n; i++) step = Math.max(step, Math.abs(s(i) - s(i - 1)));
  assert.ok(Math.abs(s(0) - s(n - 1)) < 0.25 * step, `seam ${Math.abs(s(0) - s(n - 1)).toFixed(4)} against the largest step ${step.toFixed(4)}`);
});
