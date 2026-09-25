// Labbprotokoll för Station B · trefasdelen (v41_03 bild 8 och övning 5). Riggen är en SELV-trefasrigg med tre resistiva laster i Y.
// Exemplet räknas fram ur modellen, så att siffrorna alltid stämmer med simulatorn.
import { readouts } from './lessons.mjs';

export const RIG_3F = { UL: 12.2, R1: 98, R2: 103, R3: 101, on1: true, on2: true, on3: true, neutral: true };
const v2 = (v) => v.toFixed(2).replace('.', ',').replace('-', '−');
const mA = (a) => `${(a * 1000).toFixed(1).replace('.', ',')} mA`;
const r = (patch = {}) => readouts('neutral', { ...RIG_3F, ...patch });
const hel = r(), bruten = r({ neutral: false }), utanL2 = r({ neutral: false, on2: false });
const UF = RIG_3F.UL / Math.sqrt(3);
const num = (t) => Number(String(t).replace(',', '.').replace('−', '-').match(/[-\d.]+/)[0]);
const d = (u, f, unit) => `${(num(u) - num(f)).toFixed(unit === 'mA' ? 1 : 2).replace('.', ',').replace('-', '−')} ${unit}`;

const I1f = mA(UF / RIG_3F.R1), I2f = mA(UF / RIG_3F.R2), I3f = mA(UF / RIG_3F.R3);
const U13 = RIG_3F.UL, U1s = U13 * RIG_3F.R1 / (RIG_3F.R1 + RIG_3F.R3), U3s = U13 * RIG_3F.R3 / (RIG_3F.R1 + RIG_3F.R3);

export const STATION_B_3F_PROTOKOLL = {
  key: 'stationB-3f', station: 'Station B · trefas · simulerad',
  title: 'Labbprotokoll: Station B, trefas',
  intro: 'Använd fliken ”Neutralledaren”. Ställ in stationens trefasrigg med knapparna nedan. Mät grenspänningar, fasströmmar och neutralström, och undersök vad som händer när neutralledaren bryts.',
  instrument: 'Rigg: SELV-trefasrigg, linjespänning uppmätt till 12,2 V, 50 Hz, tre resistiva laster i Y märkta 100 Ω ±5 % (uppmätta: 98, 103 och 101 Ω), neutralledare med brytbar länk. Instrument: RMS-multimeter för spänning, strömtång eller multimeter för ström.',
  checks: [
    { k: 'rigg', text: 'Trefasriggen är avsedd och dokumenterad: SELV, linjespänning, strömgräns och mätpunkter L1, L2, L3 och N.' },
    { k: 'instr', text: 'Instrumentet är avsett för AC och kontrollerat mot en känd källa. Rätt uttag och område är valda.' },
    { k: 'punkter', text: 'Jag mäter bara vid riggens dokumenterade mätpunkter.' },
    { k: 'nlank', text: 'Neutralledaren bryts bara med riggens avsedda länk och med frånslagen matning.' },
    { k: 'omk', text: 'Omkoppling sker med frånslagen matning. Jag avbryter vid skada, värme eller osäkerhet.' },
    { k: 'klar', text: 'Klartecken före energisättning. På den fysiska stationen ger instruktören det. I simulatorn ger du det själv när punkterna ovan är gjorda.' },
  ],
  rows: [
    { title: 'Grenspänning L1, N hel', storhet: 'U1 (L1–N)', punkter: 'L1 / N', forv: 'Uᴸ/√3', tol: '±2 %', q: 'U1' },
    { title: 'Fasström L1', storhet: 'I1', punkter: 'ledare L1', forv: 'U1/R1', tol: '±2 %', q: 'I1' },
    { title: 'Fasström L2', storhet: 'I2', punkter: 'ledare L2', forv: 'U2/R2', tol: '±2 %', q: 'I2' },
    { title: 'Fasström L3', storhet: 'I3', punkter: 'ledare L3', forv: 'U3/R3', tol: '±2 %', q: 'I3' },
    { title: 'Neutralström', storhet: 'IN', punkter: 'ledare N', forv: 'nästan symmetriskt?', tol: 'jämför med fasströmmarna', q: 'IN' },
    { title: 'Grenspänning L1, N bruten', storhet: 'U1 (L1–stjärnpunkt)', punkter: 'L1 / lastens stjärnpunkt', forv: '', tol: '±2 %', q: 'U1' },
    { title: 'Grenspänning L1, N bruten och L2-last frånkopplad', storhet: 'U1 (L1–stjärnpunkt)', punkter: 'L1 / lastens stjärnpunkt', forv: 'två laster i serie över U13', tol: '±2 %', q: 'U1' },
    { title: 'Grenspänning L3, N bruten och L2-last frånkopplad', storhet: 'U3 (L3–stjärnpunkt)', punkter: 'L3 / lastens stjärnpunkt', forv: 'två laster i serie över U13', tol: '±2 %', q: 'U3' },
  ],
  questions: [
    { k: 'neutral', label: 'Varför blir neutralströmmen inte noll trots att alla laster är märkta 100 Ω? Använd dina mätvärden.', short: 'neutralström', minWords: 12 },
    { k: 'bruten', label: 'Vad hände med grenspänningarna när N bröts och L2-lasten var frånkopplad? Vad kan det betyda för 230 V-utrustning i ett TN-nät i land?', short: 'bruten neutral', minWords: 15 },
    { k: 'avvikelse', label: 'Förklara en avvikelse', short: 'förklaring av en avvikelse', minWords: 12, hint: 'Välj en mätning där uppmätt skiljer sig från förväntat och förklara orsaken med dina siffror.' },
    { k: 'slutsats', label: 'Slutsats: vad visar dina mätningar, och vad visar de inte?', short: 'slutsats', minWords: 12 },
  ],
  example: {
    note: 'Ifyllt exempel för stationens trefasrigg. Använd det för att se hur ett fullständigt protokoll kan se ut.',
    head: { namn: 'Exempel Elevsson', datum: '2026-10-09', rigg: 'Trefasrigg 12,2 V, simulator' },
    checks: { rigg: true, instr: true, punkter: true, nlank: true, omk: true, klar: true },
    rows: [
      { storhet: 'U1 (L1–N)', punkter: 'L1 / N', drift: 'N hel, tre laster', forv: `${v2(UF)} V`, uppm: `${v2(hel.U1)} V`, avv: d(v2(hel.U1), v2(UF), 'V'), tol: '±2 %', bed: 'Inom tolerans', komm: `${v2(RIG_3F.UL)}/√3 = ${v2(UF)} V. Med hel N får varje last fasspänningen.` },
      { storhet: 'I1', punkter: 'ledare L1', drift: 'N hel', forv: I1f, uppm: mA(hel.I1), avv: d(mA(hel.I1), I1f, 'mA'), tol: '±2 %', bed: 'Inom tolerans', komm: 'Uppmätt R1 = 98 Ω använt i beräkningen.' },
      { storhet: 'I2', punkter: 'ledare L2', drift: 'N hel', forv: I2f, uppm: mA(hel.I2), avv: d(mA(hel.I2), I2f, 'mA'), tol: '±2 %', bed: 'Inom tolerans', komm: '' },
      { storhet: 'I3', punkter: 'ledare L3', drift: 'N hel', forv: I3f, uppm: mA(hel.I3), avv: d(mA(hel.I3), I3f, 'mA'), tol: '±2 %', bed: 'Inom tolerans', komm: '' },
      { storhet: 'IN', punkter: 'ledare N', drift: 'N hel', forv: '0 mA (om symmetriskt)', uppm: mA(hel.IN), avv: d(mA(hel.IN), '0', 'mA'), tol: 'liten jämfört med fasströmmarna', bed: 'Inom tolerans', komm: `Fasströmmarna skiljer ${mA(hel.I1 - hel.I2).replace(' mA', '')} mA som mest, så en liten rest blir kvar.` },
      { storhet: 'U1 (L1–stjärnpunkt)', punkter: 'L1 / lastens stjärnpunkt', drift: 'N bruten, tre laster', forv: `${v2(UF)} V`, uppm: `${v2(bruten.U1)} V`, avv: d(v2(bruten.U1), v2(UF), 'V'), tol: '±2 %', bed: 'Inom tolerans', komm: `Stjärnpunkten flyttar bara ${v2(bruten.shift)} V eftersom lasterna är nästan lika.` },
      { storhet: 'U1 (L1–stjärnpunkt)', punkter: 'L1 / lastens stjärnpunkt', drift: 'N bruten, L2-last frånkopplad', forv: `${v2(U1s)} V`, uppm: `${v2(utanL2.U1)} V`, avv: d(v2(utanL2.U1), v2(U1s), 'V'), tol: '±2 %', bed: 'Inom tolerans', komm: `R1 och R3 i serie över U13: ${v2(U13)} · 98/199. Jämfört med fasspänningen ${v2(UF)} V är det ${v2((utanL2.U1 / UF - 1) * 100)} %.` },
      { storhet: 'U3 (L3–stjärnpunkt)', punkter: 'L3 / lastens stjärnpunkt', drift: 'N bruten, L2-last frånkopplad', forv: `${v2(U3s)} V`, uppm: `${v2(utanL2.U3)} V`, avv: d(v2(utanL2.U3), v2(U3s), 'V'), tol: '±2 %', bed: 'Inom tolerans', komm: 'Lasterna delar U13 i förhållande till sina resistanser.' },
    ],
    answers: {
      neutral: `Lasterna är 98, 103 och 101 Ω, alltså inom ±5 % men inte lika. Fasströmmarna blev ${mA(hel.I1)}, ${mA(hel.I2)} och ${mA(hel.I3)}. Visarsumman blir inte exakt noll, så ${mA(hel.IN)} går i neutralledaren.`,
      bruten: `Med bruten N och L2 frånkopplad hamnar L1- och L3-lasten i serie över linjespänningen. Varje last fick ungefär halva ${v2(U13)} V, alltså cirka 6,1 V i stället för ${v2(UF)} V. Med olika stora laster blir fördelningen ojämn: en liten last kan få nära linjespänningen och brinna, medan en stor last får för låg spänning.`,
      avvikelse: `Grenspänningen över L1 blev ${v2(utanL2.U1)} V i stället för ${v2(UF)} V när N bröts och L2 kopplades från. Avvikelsen är inget mätfel. Utan neutralledare bestäms stjärnpunktens potential av lasterna, så spänningen delas som i en seriekrets.`,
      slutsats: 'Med hel neutralledare får varje last fasspänningen oberoende av de andra. Utan neutralledare beror grenspänningarna på lasternas storlek. Mätningarna visar inte vad som händer med induktiva laster, övertoner eller vid kortslutning.',
    },
  },
};
