// Kontroll av filmernas repliker: läshastighet (högst 15 tecken/s), inga överlapp och att replikerna ryms i scenen.
import { FILMS } from './films/index.mjs';
import { duration } from './engine.mjs';
let bad = 0;
for (const f of FILMS) {
  let prev = -1;
  for (const l of f.lines) {
    const cps = l.text.length / (l.to - l.at);
    if (cps > 15) { bad++; console.log(`${f.id} ${l.at.toFixed(1)} s: ${cps.toFixed(1)} tecken/s  "${l.text}"`); }
    if (l.at < prev) { bad++; console.log(`${f.id} ${l.at.toFixed(1)} s: överlappar föregående replik`); }
    prev = l.to;
  }
  let t0 = 0; for (const sc of f.scenes) { for (const [, b] of sc.say || []) if (b > sc.dur) { bad++; console.log(`${f.id}: replik slutar efter scenen (${b} > ${sc.dur})`); } t0 += sc.dur; }
  console.log(`${f.id}: ${duration(f)} s, ${f.lines.length} repliker`);
}
process.exit(bad ? 1 : 0);
