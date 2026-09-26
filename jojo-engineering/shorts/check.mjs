// Checks every short before rendering: reading speed (max 15 characters per second), no overlapping lines,
// lines inside their beat, first line straight away, at most 60 s, and upload metadata present.
// Run: node jojo-engineering/shorts/check.mjs
import { SHORTS } from './index.mjs';

let bad = 0;
const fail = (s, msg) => { bad++; console.log(`${s.id}: ${msg}`); };
for (const s of SHORTS) {
  let prev = -1;
  for (const l of s.lines) {
    const cps = l.text.replace(/_\{([^}]*)\}/g, '$1').length / (l.to - l.at);
    if (cps > 15) fail(s, `${l.at.toFixed(1)} s: ${cps.toFixed(1)} chars/s "${l.text}"`);
    if (l.at < prev) fail(s, `${l.at.toFixed(1)} s: overlaps the previous line`);
    prev = l.to;
  }
  for (const bt of s.beats) for (const [, b] of bt.say || []) if (b > bt.dur) fail(s, `a line ends after its beat (${b} > ${bt.dur})`);
  if (s.duration > 60) fail(s, `${s.duration} s is longer than 60 s`);
  if (!s.lines.length || s.lines[0].at > 0.5) fail(s, 'the first line must start straight away');
  for (const k of ['hook', 'title', 'desc', 'kicker']) if (!s[k]) fail(s, `missing ${k}`);
  if (s.title.length > 100) fail(s, 'title is longer than 100 characters');
  if (/sj[öo]skolan/i.test(JSON.stringify({ ...s, beats: s.beats.map((b) => [String(b.draw), b.say]) }))) fail(s, 'mentions Sjöskolan');
  console.log(`${s.id}: ${s.duration} s, ${s.lines.length} lines`);
}
process.exit(bad ? 1 : 0);
