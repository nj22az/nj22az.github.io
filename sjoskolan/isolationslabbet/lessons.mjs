// Isolationslabbet · räkna-först-uppgifter. Värdena skiljer sig från övningarna i vecka 44 så att svaren inte kan skrivas av.
import { itNet, insulationTest } from './model.mjs';

export const DEFAULTS = {
  del: 'overvakning', UL: 440, f: 50, R: [5e6, 5e6, 5e6], C: 1e-6, larm: 100e3, Rloop: 0.08,
  obj: 'motor-m3', par: 'L1-PE', Uprov: 500, frans: true,
};

export function expected(ch) {
  const s = { ...DEFAULTS, ...ch.set };
  if (ch.ask.key === 'prov') { const t = insulationTest(s); return ch.ask.unit === 'mA' ? t.I * 1e3 : t.R / 1e6; }
  const r = itNet(s);
  const v = { Riso: r.Riso, Uhull: r.Uhull[ch.ask.phase ?? 0], Ifault: r.Ifault, second: r.second?.I }[ch.ask.key];
  return v / (ch.ask.scale ?? 1);
}

// Uppgifterna genereras ur innehållsdatabasen (innehall/ovningar). Redigera aldrig uppgifter.gen.mjs.
import { UPPGIFTER } from './uppgifter.gen.mjs';
export const CHALLENGES = UPPGIFTER;
