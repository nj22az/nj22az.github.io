// Labbprotokoll för Station A · DC-delare (v41_03 bild 7). Exemplet räknas fram ur modellen,
// så att siffrorna alltid stämmer med det simulatorn visar för exempelriggen.
import { RIGS, initialState, measure, MODES } from './model.mjs';

const ex = RIGS[0];
const read = (patch) => { const m = measure({ ...initialState('station'), rig: 0, link: true, ...patch }); return `${m.text} ${m.unit}`; };
const num = (t) => Number(String(t).replace(',', '.').match(/[-\d.]+/)[0]);
const sv = (v, d = 2) => v.toFixed(d).replace('.', ',').replace('-', '−');

const R1m = read({ mode: 'ohm', red: 'A', black: 'B' }), R2m = read({ mode: 'ohm', red: 'B', black: 'N' });
const Um = read({ mode: 'dc', power: true, red: 'P', black: 'N' });
const U1m = read({ mode: 'dc', power: true, red: 'A', black: 'B' }), U2m = read({ mode: 'dc', power: true, red: 'B', black: 'N' });
const Im = read({ mode: 'current', jack: 'ma', link: false, power: true, red: 'P', black: 'A' });
const [r1, r2, u, u1, u2, i] = [R1m, R2m, Um, U1m, U2m, Im].map(num);
const u1f = u * r1 / (r1 + r2), u2f = u * r2 / (r1 + r2), iff = u / (r1 + r2); // kΩ i nämnaren ger mA

export const STATION_A_PROTOKOLL = {
  key: 'stationA', station: 'Station A · DC-delare · simulerad',
  title: 'Labbprotokoll: Station A',
  intro: 'Fyll i medan du gör övning 9 ”Station A: DC-delare” (eller mäter i fri övning). Samma protokoll som på den fysiska stationen: kontroller före start, räkna först, mät, jämför och förklara.',
  instrument: 'Rigg: SELV-källa märkt 12 V via säkerhetstransformator (skyddande separation dokumenterad), källans tolerans ±0,2 V, strömgräns 100 mA, R1 = 1 kΩ ±5 %, R2 = 2 kΩ ±5 %, länk P–A för strömmätning. Referens 5,000 V för instrumentkontroll. Multimeter: V ⎓ ±(0,5 % + 2 siffror), Ω ±(0,8 % + 2 siffror), mA ±(1,0 % + 3 siffror), ingångsresistans 10 MΩ.',
  checks: [
    { k: 'selv', text: 'Riggens dokumentation visar SELV med skyddande separation. Märkningen ”12 V” räcker inte som bevis.' },
    { k: 'rigg', text: 'Riggen är oskadad, strömgränsen är inställd och jag vet vilken rigg jag har (skriv riggnumret i huvudet).' },
    { k: 'instr', text: 'Instrument, sladdar och spetsar är hela och har tillräcklig CAT-klass. Röd sladd sitter i V Ω.' },
    { k: 'plan', text: 'Mätplanen är klar: storhet, mätpunkter, instrumentläge och förväntat värde för varje mätning.' },
    { k: 'omk', text: 'Jag kopplar om bara med bruten matning och avbryter vid skada, värme eller osäkerhet.' },
    { k: 'klar', text: 'Klartecken före energisättning. På den fysiska stationen ger instruktören det. I simulatorn ger du det själv när punkterna ovan är gjorda.' },
  ],
  rows: [
    { title: 'Instrumentkontroll före', storhet: 'U referens', punkter: 'Ref+ / Ref−', forv: '5,00 V', tol: '±(0,5 % + 2 siffror)' },
    { title: 'R1 spänningslöst', storhet: 'R1', punkter: 'A / B', forv: 'nominellt värde', tol: '±5 %' },
    { title: 'R2 spänningslöst', storhet: 'R2', punkter: 'B / N', forv: 'nominellt värde', tol: '±5 %' },
    { title: 'Källspänning', storhet: 'U källa', punkter: 'P / N', forv: 'märkt värde', tol: 'enligt riggdata' },
    { title: 'Spänning över R1', storhet: 'U1', punkter: 'A / B', forv: 'räkna med uppmätta R och U', tol: 'instrumentets noggrannhet' },
    { title: 'Spänning över R2', storhet: 'U2', punkter: 'B / N', forv: 'räkna med uppmätta R och U', tol: 'instrumentets noggrannhet' },
    { title: 'Ström', storhet: 'I', punkter: 'P / A, länken öppen', forv: 'U/(R1 + R2)', tol: 'instrumentets noggrannhet' },
    { title: 'Instrumentkontroll efter', storhet: 'U referens', punkter: 'Ref+ / Ref−', forv: '5,00 V', tol: '±(0,5 % + 2 siffror)' },
  ],
  questions: [
    { k: 'slinga', label: 'Slinglagen med dina mätvärden: Ukälla − U1 − U2 = ? Vad visar resten?', short: 'slinglagen', minWords: 5 },
    { k: 'avvikelse', label: 'Förklara en avvikelse', short: 'förklaring av en avvikelse', minWords: 15, hint: 'Välj en mätning där uppmätt skiljer sig från förväntat. Är orsaken komponentens tolerans, källans verkliga spänning, instrumentets bidrag eller ett fel i kretsen? Motivera med dina siffror.' },
    { k: 'slutsats', label: 'Slutsats: vad visar dina mätningar, och vad visar de inte?', short: 'slutsats', minWords: 15 },
    { k: 'ejkontroll', label: 'Vad har du inte kontrollerat?', short: 'vad som inte är kontrollerat', minWords: 6 },
    { k: 'verklighet', label: 'Vad kan skilja mot en fysisk rigg?', short: 'jämförelse med fysisk rigg', minWords: 8, hint: 'Till exempel kontaktresistans, temperatur, ett värde som fladdrar, instrumentets verkliga fel eller att mätspetsen glider.' },
  ],
  example: {
    note: `Ifyllt exempel för ${ex.name} (samma krets som exemplet i v41_03 bild 9). Välj ”Rigg 0” i fri övning för att göra om mätningarna. Din rigg har andra värden.`,
    head: { namn: 'Exempel Elevsson', datum: '2026-10-09', rigg: `${ex.name}, simulator` },
    checks: { selv: true, rigg: true, instr: true, plan: true, omk: true, klar: true },
    rows: [
      { storhet: 'U referens', punkter: 'röd Ref+ / svart Ref−', drift: `${MODES.dc}, V Ω-uttag`, forv: '5,00 V', uppm: read({ mode: 'dc', red: 'Ref+', black: 'Ref−' }), avv: '0,00 V', tol: '±(0,5 % + 2 siffror) = ±0,05 V', bed: 'Inom tolerans', komm: 'Instrumentet visar rätt mot känd källa.' },
      { storhet: 'R1', punkter: 'röd A / svart B', drift: 'Ω, matning bruten', forv: '1,000 kΩ', uppm: R1m, avv: `${sv(r1 - 1, 3)} kΩ`, tol: '0,950–1,050 kΩ', bed: 'Inom tolerans', komm: 'Spänningslöst, ingen parallell väg eftersom källan är frånkopplad.' },
      { storhet: 'R2', punkter: 'röd B / svart N', drift: 'Ω, matning bruten', forv: '2,000 kΩ', uppm: R2m, avv: `${sv(r2 - 2, 3)} kΩ`, tol: '1,900–2,100 kΩ', bed: 'Inom tolerans', komm: '' },
      { storhet: 'U källa', punkter: 'röd P / svart N', drift: `${MODES.dc}, matning till, länk sluten`, forv: '9,00 V (märkt)', uppm: Um, avv: `${sv(u - 9)} V`, tol: 'riggdata ±0,2 V', bed: 'Inom tolerans', komm: 'Verkligt värde används i nästa beräkning.' },
      { storhet: 'U1', punkter: 'röd A / svart B', drift: `${MODES.dc}, matning till`, forv: `${sv(u1f)} V`, uppm: U1m, avv: `${sv(u1 - Number(u1f.toFixed(2)))} V`, tol: '±(0,5 % + 2 siffror) ≈ ±0,04 V', bed: 'Inom tolerans', komm: `Förväntat = ${sv(u)} · ${sv(r1, 3)}/${sv(r1 + r2, 3)} med uppmätta värden.` },
      { storhet: 'U2', punkter: 'röd B / svart N', drift: `${MODES.dc}, matning till`, forv: `${sv(u2f)} V`, uppm: U2m, avv: `${sv(u2 - Number(u2f.toFixed(2)))} V`, tol: '±(0,5 % + 2 siffror) ≈ ±0,05 V', bed: 'Inom tolerans', komm: 'Nominellt hade det varit 6,00 V; det uppmätta ligger nära båda.' },
      { storhet: 'I', punkter: 'röd P / svart A', drift: `${MODES.current}, mA-uttag, länk öppen`, forv: `${sv(iff)} mA`, uppm: Im, avv: `${sv(i - Number(iff.toFixed(2)))} mA`, tol: '±(1,0 % + 3 siffror) ≈ ±0,06 mA', bed: 'Inom tolerans', komm: 'Omkopplat med bruten matning. Shunten 1 Ω påverkar försumbart mot 3 kΩ.' },
      { storhet: 'U referens', punkter: 'röd Ref+ / svart Ref−', drift: `${MODES.dc}, V Ω-uttag`, forv: '5,00 V', uppm: read({ mode: 'dc', red: 'Ref+', black: 'Ref−' }), avv: '0,00 V', tol: '±0,05 V', bed: 'Inom tolerans', komm: 'Instrumentet visar fortfarande rätt. Riggen återställd: länk sluten, röd sladd i V Ω.' },
    ],
    answers: {
      slinga: `${sv(u)} − ${sv(u1)} − ${sv(u2)} = ${sv(u - u1 - u2)} V. Resten är inom avläsningens upplösning, alltså stämmer slinglagen.`,
      avvikelse: `Källan mättes till ${sv(u)} V i stället för märkta 9,00 V. Avvikelsen +${sv(u - 9)} V beror på källan, inte på kretsen: räknar jag med den uppmätta källspänningen och de uppmätta resistanserna blir U1 och U2 lika med mätvärdena inom instrumentets noggrannhet.`,
      slutsats: 'Riggen fungerar som en seriekopplad spänningsdelare. Båda resistorerna ligger inom ±5 % och instrumentet visade rätt före och efter. Mätningarna visar inte hur kretsen beter sig vid högre ström eller temperatur, och de säger inget om skyddet mot högre spänning utöver dokumentationen.',
      ejkontroll: 'Strömgränsens funktion, sladdarnas skick under belastning och om värdena är stabila över tid.',
      verklighet: 'På en fysisk rigg kan kontaktresistans i klämmor och spetsar ge några tiondels ohm extra, värdet kan fladdra i sista siffran och instrumentets verkliga fel syns. Simulatorn visar exakta värden.',
    },
  },
};
