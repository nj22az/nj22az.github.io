// Hållkretslabbet · uppgifter. Labbet använder 24 V så att svaren inte sammanfaller med presentationernas 12 V-övningar.
import { solve, meter } from './model.mjs';

export const POINTS = { P: '+U (matning)', a: 'a: efter S0', b: 'b: spolens matningssida', c: 'c: spolens retursida', N: '0 V (retur)' };
export const FAULT_TEXT = { ingen: 'Inget fel', s0: 'S0 har fastnat öppen', hall: 'K1:s hjälpkontakt sluter inte', spole: 'K1-spolen är avbruten', retur: 'Returledaren är bruten' };
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

export const CHALLENGES = [
  { id: 'vila', title: 'Vila: efter STOPP', deck: 'v43_03 · bild 8 och 22',
    steps: [{ red: 'a', black: 'N' }],
    task: 'Kretsen är i vila: S0 sluten, S1 öppen, K1 släppt. Matningen är 24 V. Vilken spänning visar mätaren mellan a (efter S0) och 0 V?',
    ask: { key: 'U', label: 'U(a–0 V)', unit: 'V' }, mask: ['meter', 'nodes'],
    hint: 'S0 är sluten, så a har samma potential som +U. Returen håller 0 V-sidan på 0 V.',
    solution: 'a är förbunden med +24 V genom den slutna S0. U = 24 − 0 = 24 V, trots att ingen ström går.',
    mistakes: () => [{ v: 0, msg: 'Ingen ström betyder inte ingen spänning. Punkten a är förbunden med matningen.' }] },
  { id: 'start', title: 'Start: över spolen', deck: 'v43_03 · övning 7',
    steps: [{}, { s1: true }],
    task: 'S1 START hålls intryckt. S0 och returen är hela. Vilken spänning ligger över K1-spolen (b–c)?',
    ask: { key: 'U', label: 'U(spole)', unit: 'V' }, mask: ['meter', 'nodes'],
    hint: 'Med slutna, ideala kontakter ligger hela matningsspänningen över den enda resistansen.',
    solution: 'b har +24 V via S0 och S1, c har 0 V via returen. Uspole = 24 − 0 = 24 V.',
    mistakes: () => [{ v: 12, msg: '12 V gäller presentationens krets. Här är matningen 24 V.' }, { v: 0, msg: 'Nu finns en sluten väg, så spolen får spänning.' }] },
  { id: 'strom', title: 'Spolens ström', deck: 'v43_01 · bild 21',
    steps: [{}, { s1: true }, { s1: false }],
    task: 'K1 håller efter start. Spolen har resistansen 480 Ω och matningen är 24 V. Beräkna spolströmmen i mA.',
    ask: { key: 'I', label: 'Ispole', unit: 'mA' }, mask: ['meter', 'nodes', 'I'],
    hint: 'I = U/R. Hela matningen ligger över spolen när K1 håller.',
    solution: 'I = 24/480 = 0,050 A = 50 mA.',
    mistakes: () => [{ v: 0.05, msg: 'Svaret ska anges i mA. 0,05 A = 50 mA.' }, { v: 20, msg: 'Dela spänningen med resistansen: I = U/R.' }] },
  { id: 'stopp', title: 'Över den öppna STOPP', deck: 'v43_03 · övning 8',
    steps: [{}, { s1: true }, { s0: true, red: 'P', black: 'a' }],
    task: 'S1 hålls intryckt och S0 STOPP trycks. Vilken spänning visar mätaren över S0 (från +U till a)?',
    ask: { key: 'U', label: 'U(S0)', unit: 'V' }, mask: ['meter', 'nodes'],
    hint: 'Utan ström blir det inget spänningsfall i spolen. Punkten a når 0 V genom S1 och spolen.',
    solution: 'I = 0. a har samma potential som returen, 0 V. U(S0) = 24 − 0 = 24 V: hela spänningen över avbrottet.',
    mistakes: () => [{ v: 0, msg: 'En öppen kontakt i en strömlös seriekrets tar hela spänningen.' }] },
  { id: 'hall', title: 'Fel: K1 håller inte', deck: 'v43_03 · övning 10',
    steps: [{ fault: 'hall' }, { s1: true }, { s1: false, red: 'a', black: 'b' }],
    task: 'K1 drar när START hålls men släpper direkt när START släpps. Mät över S1 (a–b) efter släpp. Vad visar mätaren?',
    ask: { key: 'U', label: 'U(a–b)', unit: 'V' }, mask: ['meter', 'nodes'],
    hint: 'Om hjälpkontakten vore sluten skulle a och b ha samma potential. Nu släpper K1.',
    solution: 'K1 har släppt, så ingen kontakt förbinder a och b. a har +24 V och b har 0 V via spolen: 24 V. Vid rätt hållning hade mätaren visat 0 V. Mätningen pekar på hjälpkontakten eller dess ledningar.',
    mistakes: () => [{ v: 0, msg: '0 V skulle mätaren visa om K1 höll. Men K1 har släppt här.' }] },
  { id: 'retur', title: 'Fel: bruten retur', deck: 'v43_03 · bild 22',
    steps: [{ fault: 'retur' }, { s1: true, red: 'c', black: 'N' }],
    task: 'Returledaren är bruten. S1 hålls intryckt men K1 drar inte. Vad visar mätaren mellan c (spolens retursida) och 0 V?',
    ask: { key: 'U', label: 'U(c–0 V)', unit: 'V' }, mask: ['meter', 'nodes'],
    hint: 'Utan ström finns inget spänningsfall i spolen. Vilken potential får c då?',
    solution: 'Ingen ström går. c får samma potential som b, alltså +24 V, och mätaren visar 24 V över avbrottet i returen.',
    mistakes: () => [{ v: 0, msg: 'Punkten c är inte längre förbunden med 0 V. Den följer b genom den strömlösa spolen.' }] },
];
