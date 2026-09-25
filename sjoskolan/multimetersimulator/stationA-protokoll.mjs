// Labbprotokoll för Station A · DC-delare (v41_03 bild 7). Exemplet räknas fram ur modellen,
// så att siffrorna alltid stämmer med det simulatorn visar för exempelriggen.
import { RIGS, initialState, measure, MODES } from './model.mjs';

const ex = RIGS[0];
const read = (patch) => { const m = measure({ ...initialState('station'), rig: 0, link: true, ...patch }); return `${m.text} ${m.unit}`; };
const num = (t) => Number(String(t).replace(',', '.').replace('−', '-').match(/[-\d.]+/)[0]);
const sv = (v, d = 2) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d).replace('.', ',').replace('-', '−');
const dec = (t) => (String(t).split(/[ ]/)[0].split(',')[1] || '').length;
/** Avvikelse med samma antal decimaler som mätvärdet. */
const avv = (uppm, forv, unit) => `${sv(num(uppm) - num(forv), dec(uppm))} ${unit}`;

const DEAD = { mode: 'ohm', link: false };
const R1m = read({ ...DEAD, red: 'A', black: 'B' }), R2m = read({ ...DEAD, red: 'B', black: 'N' });
const Um = read({ mode: 'dc', power: true, red: 'P', black: 'N' });
const U1m = read({ mode: 'dc', power: true, red: 'A', black: 'B' }), U2m = read({ mode: 'dc', power: true, red: 'B', black: 'N' });
const Im = read({ mode: 'current', jack: 'ma', link: false, power: true, red: 'P', black: 'A' });
const Ref = read({ mode: 'dc', red: 'Ref+', black: 'Ref−' });
const [r1, r2, u, u1, u2, i] = [R1m, R2m, Um, U1m, U2m, Im].map(num);
const u1f = sv(u * r1 / (r1 + r2)), u2f = sv(u * r2 / (r1 + r2)), iff = sv(u / (r1 + r2)); // kΩ i nämnaren ger mA

export const STATION_A_PROTOKOLL = {
  key: 'stationA', station: 'Station A · DC-delare · simulerad',
  title: 'Labbprotokoll: Station A',
  intro: 'Välj uppgiften ”Station A: DC-delare” i simulatorn och fyll i protokollet medan du arbetar. Samma protokoll som på den fysiska stationen: kontroller före start, räkna först, mät, jämför och förklara.',
  instrument: 'Rigg: SELV-källa märkt 12 V (exempelriggen 9 V) via säkerhetstransformator, skyddande separation dokumenterad, källans tolerans ±0,2 V, strömgräns 100 mA. R1 = 1 kΩ ±5 % och R2 = 2 kΩ ±5 % i serie, länk P–A för strömmätning och frånkoppling av källan. Referens 5,000 V för instrumentkontroll. Multimeter: V ⎓ ±(0,5 % + 2 siffror), Ω ±(0,8 % + 2 siffror), mA ±(1,0 % + 3 siffror), ingångsresistans 10 MΩ. En siffra är den sista decimalen i displayen, till exempel 0,01 V.',
  checks: [
    { k: 'selv', text: 'Riggens dokumentation visar SELV med skyddande separation. Märkningen ”12 V” räcker inte som bevis.' },
    { k: 'rigg', text: 'Riggen är oskadad, strömgränsen är inställd och jag vet vilken rigg jag har (skriv riggnumret i huvudet).' },
    { k: 'instr', text: 'Instrument, sladdar och spetsar är hela, mA-säkringen är hel och röd sladd sitter i V Ω. CAT-klassen kontrolleras av vana även på en SELV-rigg.' },
    { k: 'plan', text: 'Mätplanen är klar: storhet, mätpunkter, instrumentläge och förväntat värde för varje mätning.' },
    { k: 'omk', text: 'Jag kopplar om bara med frånskild matning och avbryter vid skada, värme eller osäkerhet.' },
    { k: 'klar', text: 'Klartecken före energisättning. På den fysiska stationen ger instruktören det. I simulatorn ger du det själv när punkterna ovan är gjorda.' },
  ],
  rows: [
    { title: 'Instrumentkontroll före', storhet: 'U referens', punkter: 'Ref+ / Ref−', forv: 'referensens värde', tol: '±(0,5 % + 2 siffror)', need: { mode: 'dc', red: 'Ref+', black: 'Ref−' } },
    { title: 'R1 spänningslöst', storhet: 'R1', punkter: 'A / B, länk P–A öppen', forv: 'nominellt värde', tol: '±5 %', need: { mode: 'ohm', pair: ['A', 'B'], link: false } },
    { title: 'R2 spänningslöst', storhet: 'R2', punkter: 'B / N, länk P–A öppen', forv: 'nominellt värde', tol: '±5 %', need: { mode: 'ohm', pair: ['B', 'N'], link: false } },
    { title: 'Källspänning', storhet: 'U källa', punkter: 'P / N', forv: 'märkt värde', tol: '±0,2 V (riggdata)', need: { mode: 'dc', red: 'P', black: 'N', power: true } },
    { title: 'Spänning över R1', storhet: 'U1', punkter: 'A / B', forv: 'räkna med uppmätta R och U', tol: '±(0,5 % + 2 siffror)', need: { mode: 'dc', red: 'A', black: 'B', power: true, link: true } },
    { title: 'Spänning över R2', storhet: 'U2', punkter: 'B / N', forv: 'räkna med uppmätta R och U', tol: '±(0,5 % + 2 siffror)', need: { mode: 'dc', red: 'B', black: 'N', power: true, link: true } },
    { title: 'Ström', storhet: 'I', punkter: 'P / A, länk P–A öppen', forv: 'U/(R1 + R2)', tol: '±(1,0 % + 3 siffror)', need: { mode: 'current', red: 'P', black: 'A', power: true, link: false } },
    { title: 'Instrumentkontroll efter', storhet: 'U referens', punkter: 'Ref+ / Ref−', forv: 'referensens värde', tol: '±(0,5 % + 2 siffror)', need: { mode: 'dc', red: 'Ref+', black: 'Ref−' } },
  ],
  questions: [
    { k: 'slinga', label: 'Slinglagen med dina mätvärden: Ukälla − U1 − U2 = ? Vad visar resten?', short: 'slinglagen', minWords: 5 },
    { k: 'avvikelse', label: 'Förklara en avvikelse', short: 'förklaring av en avvikelse', minWords: 15, hint: 'Välj en mätning där uppmätt skiljer sig från förväntat. Är orsaken komponentens tolerans, källans verkliga spänning, instrumentets bidrag eller ett fel i kretsen? Motivera med dina siffror.' },
    { k: 'slutsats', label: 'Slutsats: vad visar dina mätningar, och vad visar de inte?', short: 'slutsats', minWords: 15 },
    { k: 'ejkontroll', label: 'Vad har du inte kontrollerat?', short: 'vad som inte är kontrollerat', minWords: 6 },
    { k: 'verklighet', label: 'Vad kan skilja mot en fysisk rigg?', short: 'jämförelse med fysisk rigg', minWords: 8, hint: 'Till exempel kontaktresistans, temperatur, ett värde som fladdrar eller att mätspetsen glider.' },
  ],
  example: {
    note: `Ifyllt exempel för ${ex.name} (samma krets som exemplet i v41_03 bild 9). Välj ”${ex.name}” i fri övning för att göra om mätningarna. Din rigg har andra värden. Frågor utan siffror visar bara hur ett svar kan byggas upp.`,
    head: { namn: 'Exempel Elevsson', datum: '2026-10-09', rigg: `${ex.name}, simulator` },
    checks: { selv: true, rigg: true, instr: true, plan: true, omk: true, klar: true },
    rows: [
      { storhet: 'U referens', punkter: 'röd Ref+ / svart Ref−', drift: `${MODES.dc}, V Ω-uttag`, forv: '5,00 V', uppm: Ref, avv: avv(Ref, '5,00', 'V'), tol: '±(0,5 % + 2 siffror) ≈ ±0,05 V', bed: 'Inom tolerans', komm: 'Instrumentet visar rätt mot känd källa, inom sin noggrannhet. Samma princip som prova–mät–prova före arbete.' },
      { storhet: 'R1', punkter: 'röd A / svart B', drift: 'Ω, matning frånskild, länk P–A öppen', forv: '1,000 kΩ', uppm: R1m, avv: avv(R1m, '1,000', 'kΩ'), tol: '0,950–1,050 kΩ', bed: 'Inom tolerans', komm: 'Först 0 V kontrollerat över R1. Länken öppen så att den frånslagna källan inte ligger parallellt. Mätarens osäkerhet (≈ ±0,01 kΩ) ändrar inte bedömningen.' },
      { storhet: 'R2', punkter: 'röd B / svart N', drift: 'Ω, matning frånskild, länk P–A öppen', forv: '2,000 kΩ', uppm: R2m, avv: avv(R2m, '2,000', 'kΩ'), tol: '1,900–2,100 kΩ', bed: 'Inom tolerans', komm: '' },
      { storhet: 'U källa', punkter: 'röd P / svart N', drift: `${MODES.dc}, matning till, länk sluten`, forv: '9,00 V (märkt)', uppm: Um, avv: avv(Um, '9,00', 'V'), tol: '±0,2 V (riggdata)', bed: 'Inom tolerans', komm: 'Det uppmätta värdet används i nästa beräkningar.' },
      { storhet: 'U1', punkter: 'röd A / svart B', drift: `${MODES.dc}, matning till`, forv: `${u1f} V`, uppm: U1m, avv: avv(U1m, u1f, 'V'), tol: '±(0,5 % + 2 siffror) ≈ ±0,04 V', bed: 'Inom tolerans', komm: `Förväntat = ${sv(u)} · ${sv(r1, 3)}/${sv(r1 + r2, 3)} med uppmätta värden.` },
      { storhet: 'U2', punkter: 'röd B / svart N', drift: `${MODES.dc}, matning till`, forv: `${u2f} V`, uppm: U2m, avv: avv(U2m, u2f, 'V'), tol: '±(0,5 % + 2 siffror) ≈ ±0,05 V', bed: 'Inom tolerans', komm: '' },
      { storhet: 'I', punkter: 'röd P / svart A', drift: `${MODES.current}, mA-uttag, länk öppen`, forv: `${iff} mA`, uppm: Im, avv: avv(Im, iff, 'mA'), tol: '±(1,0 % + 3 siffror) ≈ ±0,06 mA', bed: 'Inom tolerans', komm: 'Omkopplat med frånskild matning. mA-uttagets inre resistans är liten mot 3 kΩ.' },
      { storhet: 'U referens', punkter: 'röd Ref+ / svart Ref−', drift: `${MODES.dc}, V Ω-uttag`, forv: '5,00 V', uppm: Ref, avv: avv(Ref, '5,00', 'V'), tol: '±0,05 V', bed: 'Inom tolerans', komm: 'Instrumentet visar fortfarande rätt. Riggen återställd: länk sluten, röd sladd i V Ω.' },
    ],
    answers: {
      slinga: `${sv(u)} − ${sv(u1)} − ${sv(u2)} = ${sv(u - u1 - u2)} V. Resten ligger inom avläsningens upplösning, alltså stämmer slinglagen.`,
      avvikelse: `Strömmen blev ${Im} mot förväntade ${iff} mA, alltså ${avv(Im, iff, 'mA')}. Spänningarna stämde nästan exakt, så kretsen är hel. Skillnaden ligger inom mA-områdets noggrannhet ±(1,0 % + 3 siffror) och kan komma från instrumentet och från mätarens inre resistans.`,
      slutsats: 'Riggen fungerar som en seriekopplad spänningsdelare. Båda resistorerna ligger inom ±5 % och instrumentet visade rätt före och efter. Mätningarna visar inte hur kretsen beter sig vid högre ström eller temperatur, och de säger inget om skyddet mot högre spänning utöver dokumentationen.',
      ejkontroll: 'Så kan svaret byggas: nämn minst två saker som inte mättes, till exempel en funktion hos riggen eller hur stabila värdena är över tid.',
      verklighet: 'Så kan svaret byggas: nämn två saker som finns på en fysisk rigg men inte i simulatorn, och förklara hur de skulle påverka ett av dina mätvärden.',
    },
  },
};
