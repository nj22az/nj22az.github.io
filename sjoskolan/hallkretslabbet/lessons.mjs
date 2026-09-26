// Hållkretslabbet · uppgifter. Labbet använder 24 V så att svaren inte sammanfaller med presentationernas 12 V-övningar.
import { solve, meter } from './model.mjs';

export const POINTS = { P: '+U (matning)', a: 'a: efter S0', b: 'b: spolens matningssida', c: 'c: spolens retursida', N: '0 V (retur)' };
export const FAULT_TEXT = { ingen: 'Inget fel', s0: 'S0 har fastnat öppen', start: 'S1 START sluter inte', hall: 'K1:s hjälpkontakt sluter inte', spole: 'K1-spolen är avbruten', retur: 'Returledaren är bruten' };
export const DEFAULTS = { U: 24, R: 480, supply: true, s0: false, s1: false, fault: 'ingen', red: 'b', black: 'c', k1: false };

/** Ett uppgiftsläge byggs som en följd av knapptryck, så att hållningen blir rätt. */
export function run(steps) {
  let s = { ...DEFAULTS, ...steps[0] }; let r = solve(s, false);
  for (const st of steps.slice(1)) { s = { ...s, ...st }; r = solve(s, r.k1); }
  return { s: { ...s, k1: r.k1 }, r };
}
export function expected(c) {
  const { s, r } = run(c.steps);
  return c.ask.key === 'I' ? r.I * 1000 : meter(r.V, s.red, s.black);
}

// Uppgifterna genereras ur innehållsdatabasen (innehall/ovningar). Redigera aldrig uppgifter.gen.mjs.
import { UPPGIFTER } from './uppgifter.gen.mjs';
export const CHALLENGES = UPPGIFTER;
