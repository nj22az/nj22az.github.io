// Labbprotokoll för Station B · trefasdelen (v41_03 bild 8 och övning 5). Eleven mäter på stationens rigg (RIG_3F).
// Exemplet bygger på en annan rigg (EX_3F), så att exemplets värden inte kan skrivas av. Siffrorna räknas fram ur modellen.
import { readouts } from './lessons.mjs';

export const RIG_3F = { UL: 12.2, R1: 98, R2: 103, R3: 101, on1: true, on2: true, on3: true, neutral: true };
const EX_3F = { UL: 13, R1: 95, R2: 104, R3: 100, on1: true, on2: true, on3: true, neutral: true };
const v2 = (v) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2).replace('.', ',').replace('-', '−');
const mA = (a) => `${(a * 1000).toFixed(1).replace('.', ',')} mA`;
const r = (patch = {}) => readouts('neutral', { ...EX_3F, ...patch });
const hel = r(), bruten = r({ neutral: false }), utanL2 = r({ neutral: false, on2: false });
const UF = EX_3F.UL / Math.sqrt(3);
const num = (t) => Number(String(t).replace(',', '.').replace('−', '-').match(/[-\d.]+/)[0]);
const d = (u, f, unit) => { const k = unit === 'mA' ? 1 : 2, x = num(u) - num(f); return `${(Math.abs(x) < 0.5 * 10 ** -k ? 0 : x).toFixed(k).replace('.', ',').replace('-', '−')} ${unit}`; };

const I1f = mA(UF / EX_3F.R1), I2f = mA(UF / EX_3F.R2), I3f = mA(UF / EX_3F.R3);
const U13 = EX_3F.UL, U1s = U13 * EX_3F.R1 / (EX_3F.R1 + EX_3F.R3), U3s = U13 * EX_3F.R3 / (EX_3F.R1 + EX_3F.R3);
const need = (patch) => ({ ...RIG_3F, ...patch });

export const STATION_B_3F_PROTOKOLL = {
  key: 'stationB-3f', station: 'Station B · trefas · simulerad',
  title: 'Labbprotokoll: Station B, trefas',
  intro: 'Använd fliken ”Neutralledaren” och ställ in stationens trefasrigg med knapparna nedan. Mät fasspänning, fasströmmar och neutralström, och undersök vad som händer när neutralledaren bryts.',
  instrument: 'Rigg: SELV-trefasrigg, huvudspänning (linjespänning) UL uppmätt till 12,2 V, 50 Hz. Tre resistiva laster i Y märkta 100 Ω ±5 % (uppmätta: 98, 103 och 101 Ω), var och en med frånkopplingslänk. Neutralledaren har en brytbar länk, och lastens stjärnpunkt har ett eget mätuttag S på lastsidan av länken. Strömmätlänkar finns i L1, L2, L3 och N. Instrument: RMS-multimeter för spänning och multimeter i mA-läge via strömmätlänken för ström. En vanlig strömtång löser inte upp några mA. I simulatorn är instrumenten ideala.',
  checks: [
    { k: 'rigg', text: 'Trefasriggen är avsedd och dokumenterad: SELV, huvudspänning, strömgräns och mätpunkter L1, L2, L3, N och S.' },
    { k: 'instr', text: 'Instrumentet är avsett för AC och kontrollerat mot en känd källa. Rätt uttag och område är valda, och mA-säkringen är hel.' },
    { k: 'punkter', text: 'Jag mäter bara vid riggens dokumenterade mätpunkter och strömmätlänkar.' },
    { k: 'nlank', text: 'Neutralledaren bryts och lasterna kopplas från bara med riggens avsedda länkar och med frånskild matning.' },
    { k: 'omk', text: 'Omkoppling, också till strömmätning, sker med frånskild matning. Jag avbryter vid skada, värme eller osäkerhet.' },
    { k: 'klar', text: 'Klartecken före energisättning. På den fysiska stationen ger instruktören det. I simulatorn ger du det själv när punkterna ovan är gjorda.' },
  ],
  rows: [
    { title: 'Fasspänning över last 1, N hel', storhet: 'U1 (L1–N)', punkter: 'L1 / N', forv: 'UL/√3', tol: '±2 %', q: 'U1', need: need({}) },
    { title: 'Fasström L1', storhet: 'I1', punkter: 'strömmätlänk L1', forv: 'U1/R1', tol: '±2 %', q: 'I1', need: need({}) },
    { title: 'Fasström L2', storhet: 'I2', punkter: 'strömmätlänk L2', forv: 'U2/R2', tol: '±2 %', q: 'I2', need: need({}) },
    { title: 'Fasström L3', storhet: 'I3', punkter: 'strömmätlänk L3', forv: 'U3/R3', tol: '±2 %', q: 'I3', need: need({}) },
    { title: 'Neutralström', storhet: 'IN', punkter: 'strömmätlänk N', forv: 'nästan symmetriskt?', tol: 'liten mot fasströmmarna', q: 'IN', need: need({}) },
    { title: 'Grenspänning över last 1, N bruten', storhet: 'U1 (L1–S)', punkter: 'L1 / S', forv: 'nästan lika laster', tol: '±2 %', q: 'U1', need: need({ neutral: false }) },
    { title: 'Grenspänning över last 1, N bruten och last 2 frånkopplad', storhet: 'U1 (L1–S)', punkter: 'L1 / S', forv: 'två laster i serie över U13', tol: '±2 %', q: 'U1', need: need({ neutral: false, on2: false }) },
    { title: 'Grenspänning över last 3, N bruten och last 2 frånkopplad', storhet: 'U3 (L3–S)', punkter: 'L3 / S', forv: 'två laster i serie över U13', tol: '±2 %', q: 'U3', need: need({ neutral: false, on2: false }) },
  ],
  questions: [
    { k: 'neutral', label: 'Varför blir neutralströmmen inte noll trots att alla laster är märkta 100 Ω? Använd dina mätvärden.', short: 'neutralström', minWords: 12 },
    { k: 'bruten', label: 'Vad hände med grenspänningarna när N bröts och last 2 var frånkopplad? Vad kan det betyda för 230 V-enfaslaster i ett 400/230 V-nät med neutralledare, i land eller ombord där N finns? Varför kan felet inte uppstå på samma sätt i ett 440 V IT-nät med tre ledare?', short: 'bruten neutral', minWords: 15 },
    { k: 'itjordfel', optional: true, label: 'Ombord: 440 V IT-nät utan N. Isolationsövervakningen larmar för jordfel på L1. Vilken spänning har L2 och L3 mot skrovet nu? Vad betyder det för ditt instrument, och vad händer om ett andra jordfel uppstår på en annan fas?' },
    { k: 'avvikelse', label: 'Förklara en avvikelse', short: 'förklaring av en avvikelse', minWords: 12, hint: 'Välj en mätning där uppmätt skiljer sig från förväntat och förklara orsaken med dina siffror.' },
    { k: 'slutsats', label: 'Slutsats: vad visar dina mätningar, och vad visar de inte?', short: 'slutsats', minWords: 12 },
  ],
  example: {
    note: 'Ifyllt exempel för en annan trefasrigg än din: UL = 13,0 V och lasterna 95, 104 och 100 Ω. Dina värden blir andra. Frågor utan siffror visar bara hur ett svar kan byggas upp.',
    head: { namn: 'Exempel Elevsson', datum: '2026-10-09', rigg: 'Exempelrigg 13,0 V, simulator' },
    checks: { rigg: true, instr: true, punkter: true, nlank: true, omk: true, klar: true },
    rows: [
      { storhet: 'U1 (L1–N)', punkter: 'L1 / N', drift: 'N hel, tre laster', forv: `${v2(UF)} V`, uppm: `${v2(hel.U1)} V`, avv: d(v2(hel.U1), v2(UF), 'V'), tol: '±2 %', bed: 'Inom tolerans', komm: `${v2(EX_3F.UL)}/√3 = ${v2(UF)} V. Med hel N får varje last fasspänningen.` },
      { storhet: 'I1', punkter: 'strömmätlänk L1', drift: 'N hel, mA-läge, omkopplat frånskilt', forv: I1f, uppm: mA(hel.I1), avv: d(mA(hel.I1), I1f, 'mA'), tol: '±2 %', bed: 'Inom tolerans', komm: `Uppmätt R1 = ${EX_3F.R1} Ω använt i beräkningen.` },
      { storhet: 'I2', punkter: 'strömmätlänk L2', drift: 'N hel', forv: I2f, uppm: mA(hel.I2), avv: d(mA(hel.I2), I2f, 'mA'), tol: '±2 %', bed: 'Inom tolerans', komm: '' },
      { storhet: 'I3', punkter: 'strömmätlänk L3', drift: 'N hel', forv: I3f, uppm: mA(hel.I3), avv: d(mA(hel.I3), I3f, 'mA'), tol: '±2 %', bed: 'Inom tolerans', komm: '' },
      { storhet: 'IN', punkter: 'strömmätlänk N', drift: 'N hel', forv: '0 mA (om symmetriskt)', uppm: mA(hel.IN), avv: d(mA(hel.IN), '0', 'mA'), tol: 'liten mot fasströmmarna', bed: 'Inom tolerans', komm: 'Lasterna är inte exakt lika, så en liten rest blir kvar i N.' },
      { storhet: 'U1 (L1–S)', punkter: 'L1 / S', drift: 'N bruten, tre laster', forv: `${v2(UF)} V`, uppm: `${v2(bruten.U1)} V`, avv: d(v2(bruten.U1), v2(UF), 'V'), tol: '±2 %', bed: Math.abs(bruten.U1 / UF - 1) > 0.02 ? 'Utanför tolerans' : 'Inom tolerans', komm: `Stjärnpunkten flyttar ${v2(bruten.shift)} V eftersom lasterna inte är lika. Avvikelsen ${v2((bruten.U1 / UF - 1) * 100)} % beror på den brutna neutralledaren, inte på mätningen.` },
      { storhet: 'U1 (L1–S)', punkter: 'L1 / S', drift: 'N bruten, last 2 frånkopplad', forv: `${v2(U1s)} V`, uppm: `${v2(utanL2.U1)} V`, avv: d(v2(utanL2.U1), v2(U1s), 'V'), tol: '±2 %', bed: 'Inom tolerans', komm: `Last 1 och 3 i serie över U13: ${v2(U13)} · ${EX_3F.R1}/${EX_3F.R1 + EX_3F.R3}. Mot fasspänningen ${v2(UF)} V är det ${v2((utanL2.U1 / UF - 1) * 100)} %.` },
      { storhet: 'U3 (L3–S)', punkter: 'L3 / S', drift: 'N bruten, last 2 frånkopplad', forv: `${v2(U3s)} V`, uppm: `${v2(utanL2.U3)} V`, avv: d(v2(utanL2.U3), v2(U3s), 'V'), tol: '±2 %', bed: 'Inom tolerans', komm: 'Lasterna delar U13 i förhållande till sina resistanser.' },
    ],
    answers: {
      neutral: 'Så kan svaret byggas: 1) dina tre lastresistanser och fasströmmar, 2) varför visarsumman då inte blir noll, 3) din uppmätta neutralström jämförd med fasströmmarna.',
      bruten: 'Så kan svaret byggas: 1) dina grenspänningar med och utan N, 2) hur två laster i serie delar huvudspänningen, 3) vad som händer med en last med liten effekt, 4) vilka nät ombord som har N och vilka som inte har det.',
      itjordfel: 'Så kan svaret byggas: 1) spänningen mellan de friska faserna och skrovet, 2) vad det kräver av instrument och sladdar, 3) vad ett andra jordfel på en annan fas blir.',
      avvikelse: `Grenspänningen över last 1 blev ${v2(utanL2.U1)} V i stället för ${v2(UF)} V när N bröts och last 2 kopplades från. Avvikelsen är inget mätfel. Utan neutralledare bestäms stjärnpunktens potential av lasterna, så spänningen delas som i en seriekrets.`,
      slutsats: 'Med hel neutralledare fick varje last fasspänningen oberoende av de andra. Utan neutralledare berodde grenspänningarna på lasternas storlek. Mätningarna visar inte vad som händer med induktiva laster, övertoner eller vid kortslutning.',
    },
  },
};
