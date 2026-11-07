#!/usr/bin/env node
/*
 * Render Sakura Shōten's jingles (jingles/sakura.js) on the Johansson PF-82: the exact engine of the page, on the
 * shop's own unit, serial 13715 (modern build, at room temperature, 22 °C, no warm-up). A shop jingle has to sound in
 * tune with itself every day, so the shop's unit is the one a technician would pick off the bench: of the first
 * 30 000 serials it tracks best, both oscillators within 2 cents from C3 to C6 (the page's serial 1982 is 34 cents
 * out at the top, its two oscillators 44 cents apart at C5). Everything else stays imperfect: its filter's own parts,
 * hiss, mains ripple, the drifting pitch and the slow thermal wander.
 *
 *   node polivoks/jingles/render.mjs
 *
 * Writes jingles/sakura/<id>.wav (48 kHz, 16-bit mono masters, peak −1 dBFS), <id>.mp3 (for listening, if ffmpeg is
 * installed) and manifest.json (what was rendered from what, so tests/jingles.test.mjs can tell a stale file).
 * The closing waltz is rendered twice through and the second pass kept, its seam cross-faded, so it loops without a
 * click or a gap; the other jingles end when their release has died away.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PolivoksSynth } from '../dsp/polivoks-dsp.js';
import { build } from '../songs.js';
import { SHOP_UNIT, patchValues, validateSong } from '../agent.js';
import { wav } from '../mcp/server.mjs';
import { JINGLES } from './sakura.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'sakura');
const FS = 48000, UNIT = SHOP_UNIT;

export const specHash = (j) => createHash('sha256').update(JSON.stringify(j.song)).digest('hex').slice(0, 16);
export const engineHash = async () => createHash('sha256').update(await readFile(path.join(HERE, '..', 'dsp', 'polivoks-dsp.js'))).digest('hex').slice(0, 16);

function play(song, passes) {
  const s = new PolivoksSynth(FS, 4, { ...patchValues(song.patch.base, song.patch.set), 'imp.grade': UNIT.grade, 'imp.seed': UNIT.seed, 'imp.warmup': 'off' });
  const twice = passes === 2 ? { ...song, parts: [...song.parts, ...song.parts] } : song;
  s.message({ t: 'song', ...build(twice) });
  const N = 128, L = new Float32Array(N), chunks = [];
  let quiet = 0;
  for (let b = 0; b < (FS * 120) / N; b++) {
    s.render(N, L, null, null, null); chunks.push(Float32Array.from(L));
    if (!s.seq) { let e = 0; for (const v of L) e += v * v; quiet = Math.sqrt(e / N) < 3e-4 ? quiet + 1 : 0; if (quiet > (FS * 0.12) / N) break; }
  }
  const x = new Float32Array(chunks.length * N);
  chunks.forEach((c, i) => x.set(c, i * N));
  return x;
}

export function renderJingle(j) {
  const song = validateSong(j.song);
  const beats = song.stats.beats;
  const period = Math.round((beats * 60 * FS) / song.bpm);
  let x;
  if (j.loop) {
    const two = play(song, 2), xf = Math.round(FS * 0.03);
    x = two.slice(period, 2 * period);
    for (let i = 0; i < xf; i++) { const w = i / xf; x[i] = x[i] * w + two[2 * period + i] * (1 - w); } // the tail of the loop runs into its start
  } else {
    x = play(song, 1);
    const fade = Math.round(FS * 0.01);
    for (let i = 0; i < fade; i++) x[x.length - 1 - i] *= i / fade;
  }
  let peak = 0, ss = 0;
  for (const v of x) { peak = Math.max(peak, Math.abs(v)); ss += v * v; }
  const g = 10 ** (-1 / 20) / Math.max(peak, 1e-9);
  for (let i = 0; i < x.length; i++) x[i] *= g;
  const db = (v) => Math.round(20 * Math.log10(Math.max(v, 1e-9)) * 10) / 10;
  return { samples: x, seconds: +(x.length / FS).toFixed(3), rmsDb: db(Math.sqrt(ss / x.length) * g), notes: song.stats.notes, loop: !!j.loop };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const engine = await engineHash();
  const files = [];
  let ffmpeg = true;
  for (const j of JINGLES) {
    const r = renderJingle(j);
    const wavFile = path.join(OUT, `${j.id}.wav`);
    await writeFile(wavFile, wav(r.samples, FS));
    let mp3 = null;
    if (ffmpeg) {
      try { execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', wavFile, '-codec:a', 'libmp3lame', '-q:a', '3', path.join(OUT, `${j.id}.mp3`)]); mp3 = `${j.id}.mp3`; }
      catch { ffmpeg = false; console.warn('ffmpeg not found: no MP3 listening copies'); }
    }
    files.push({ id: j.id, title: j.title, wav: `${j.id}.wav`, mp3, seconds: r.seconds, peakDb: -1, rmsDb: r.rmsDb, notes: r.notes, loop: r.loop, spec: specHash(j) });
    console.log(`${j.id.padEnd(16)} ${String(r.seconds).padStart(7)} s  rms ${r.rmsDb} dBFS${r.loop ? '  (loops)' : ''}`);
  }
  const manifest = { engine: 'Johansson PF-82, polivoks/dsp/polivoks-dsp.js', engineHash: engine, unit: { ...UNIT }, sampleRate: FS, peakDb: -1, files };
  await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
