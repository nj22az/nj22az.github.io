#!/usr/bin/env node
/*
 * Render Sakura Shōten's jingles (sakura.js) on the Johansson SC-90 (chip.js).
 *
 *   node sc-90/render.mjs
 *
 * Writes sakura/<id>.wav (48 kHz, 16-bit mono masters, all at −15 dBFS rms, peaks under −1 dBFS), <id>.mp3 (listening copies, if ffmpeg is
 * installed) and manifest.json (what was rendered from what, so tests/jingles.test.mjs can tell a stale file).
 * The closing waltz loops exactly (renderPiece in chip.js: rendered twice through, the second pass kept).
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FS, renderPiece } from './chip.js';
import { JINGLES } from './sakura.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'sakura');

export const specHash = (j) => createHash('sha256').update(JSON.stringify(j)).digest('hex').slice(0, 16);
export const chipHash = async () => createHash('sha256').update(await readFile(path.join(HERE, 'chip.js'))).digest('hex').slice(0, 16);

export const renderJingle = renderPiece;

export function wav(samples, fs = FS) {
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + samples.length * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(fs, 24); b.writeUInt32LE(fs * 2, 28);
  b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + 2 * i);
  return b;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const files = [];
  let ffmpeg = true;
  for (const j of JINGLES) {
    const r = renderJingle(j), wavFile = path.join(OUT, `${j.id}.wav`);
    await writeFile(wavFile, wav(r.samples));
    let mp3 = null;
    if (ffmpeg) {
      try { execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', wavFile, '-codec:a', 'libmp3lame', '-q:a', '2', path.join(OUT, `${j.id}.mp3`)]); mp3 = `${j.id}.mp3`; }
      catch { ffmpeg = false; console.warn('ffmpeg not found: no MP3 listening copies'); }
    }
    files.push({ id: j.id, title: j.title, wav: `${j.id}.wav`, mp3, seconds: r.seconds, peakDb: r.peakDb, rmsDb: r.rmsDb, loop: r.loop, spec: specHash(j) });
    console.log(`${j.id.padEnd(16)} ${String(r.seconds).padStart(7)} s  rms ${r.rmsDb} dBFS  peak ${r.peakDb} dBFS${r.loop ? '  (loops)' : ''}`);
  }
  const manifest = { chip: 'Johansson SC-90, sc-90/chip.js', chipHash: await chipHash(), sampleRate: FS, level: { rmsDb: -15, maxPeakDb: -1 }, files };
  await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
