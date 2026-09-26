// Answer fields are separate from instrument state: a reading cannot pass a prediction.
export function numericAnswer(value) {
  const text=String(value??'').trim().replace(',', '.');
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text) ? Number(text) : NaN;
}
export function acceptsAnswer(step, answer={}) {
  if(step.kind==='number') return Math.abs(numericAnswer(answer.value)-step.answer)<=step.tolerance;
  if(step.choices) return answer.choice===step.correct && (!step.comment || String(answer.comment||'').trim().split(/\s+/).filter(Boolean).length>=3 && String(answer.comment||'').trim().length>=12);
  return false;
}
// Övningarna genereras ur innehållsdatabasen (uppgifter.gen.mjs); kontrollfunktionerna registreras i funktioner.mjs.
import { UPPGIFTER } from './uppgifter.gen.mjs';
import { FUNKTIONER } from './funktioner.mjs';
export const LESSONS = UPPGIFTER.map((l) => ({ ...l, steps: l.steps.map((s) => (s.test ? { ...s, test: FUNKTIONER[s.test] } : s)) }));
export const STATION_A = LESSONS.find((l) => l.id === 'stationA');
