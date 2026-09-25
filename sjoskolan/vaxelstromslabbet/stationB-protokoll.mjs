// Labbprotokoll för Station B · AC-delen (v41_03 bild 8 och övning 4). Riggen är en isolerad AC-källa märkt 12 V 50 Hz.
// Exemplet räknas fram ur modellen, så att siffrorna alltid stämmer med simulatorn.
import { waveform, meterReadings, SHAPES } from './model.mjs';

export const RIG_AC = { urms: 12.35, f: 50 };
const v2 = (v) => v.toFixed(2).replace('.', ',').replace('-', '−');
const rd = (shape) => ({ ...waveform({ ...RIG_AC, shape }), ...meterReadings({ ...RIG_AC, shape }) });
const sin = rd('sinus'), sq = rd('fyrkant'), tri = rd('triangel');
const U = Number(v2(sin.trueRms).replace(',', '.'));
// Fyrkant: likriktat medelvärde = û = U. Triangel: û/2 = √3/2 · U.
const pred = { peak: Math.SQRT2 * U, T: 1000 / RIG_AC.f, sq: Math.PI / (2 * Math.SQRT2) * U, tri: Math.PI / (2 * Math.SQRT2) * U * Math.sqrt(3) / 2 };
const avv = (u, f, unit = 'V') => `${v2(Number(v2(u).replace(',', '.').replace('−', '-')) - Number(v2(f).replace(',', '.').replace('−', '-')))} ${unit}`;

export const STATION_B_AC_PROTOKOLL = {
  key: 'stationB-ac', station: 'Station B · AC · simulerad',
  title: 'Labbprotokoll: Station B, AC',
  intro: 'Använd fliken ”Sinus och effektivvärde”. Ställ in stationens AC-källa med knappen nedan. Mät med true RMS-multimeter, medelvärdesvisande multimeter och oscilloskop, och jämför med dina beräkningar.',
  instrument: `Rigg: isolerad AC-källa märkt 12 V 50 Hz (skyddande separation dokumenterad), källans tolerans ±0,5 V. Instrument: true RMS-multimeter, medelvärdesvisande multimeter kalibrerad för sinus och oscilloskop för û, topp till topp och periodtid. I simulatorn visas alla tre samtidigt.`,
  checks: [
    { k: 'kalla', text: 'AC-källan är avsedd för övningen och isolerad. Skyddande separation är dokumenterad, märkningen ”12 V” räcker inte som bevis.' },
    { k: 'instr', text: 'Jag vet vilket instrument som är true RMS och vilket som är medelvärdesvisande. Båda är kontrollerade mot en känd källa.' },
    { k: 'punkter', text: 'Jag mäter bara vid riggens dokumenterade mätpunkter.' },
    { k: 'osc', text: 'Oscilloskopets referens ansluts bara enligt riggens anvisning. Referensen är ofta jordad och får inte kopplas till en punkt med annan potential.' },
    { k: 'omk', text: 'Omkoppling sker med frånslagen källa. Jag avbryter vid skada, värme eller osäkerhet.' },
    { k: 'klar', text: 'Klartecken före energisättning. På den fysiska stationen ger instruktören det. I simulatorn ger du det själv när punkterna ovan är gjorda.' },
  ],
  rows: [
    { title: 'Effektivvärde, sinus', storhet: 'U (true RMS)', punkter: 'källans mätuttag', forv: 'märkt värde', tol: '±0,5 V (källdata)', q: 'trms' },
    { title: 'Toppvärde, sinus', storhet: 'û (oscilloskop)', punkter: 'källans mätuttag', forv: 'räkna från uppmätt U', tol: '±2 %', q: 'peak' },
    { title: 'Periodtid', storhet: 'T (oscilloskop)', punkter: 'källans mätuttag', forv: '1/f', tol: '±1 %', q: 'T' },
    { title: 'Medelvärdesvisande mätare, sinus', storhet: 'U (medelvärdesvisande)', punkter: 'källans mätuttag', forv: 'jämför med mätning 1', tol: '±1 %', q: 'avg' },
    { title: 'Medelvärdesvisande mätare, fyrkant', storhet: 'U (medelvärdesvisande)', punkter: 'källans mätuttag', forv: 'verkligt effektivvärde', tol: '±1 %', q: 'avg' },
    { title: 'Medelvärdesvisande mätare, triangel', storhet: 'U (medelvärdesvisande)', punkter: 'källans mätuttag', forv: 'verkligt effektivvärde', tol: '±1 %', q: 'avg' },
    { title: 'True RMS, triangel', storhet: 'U (true RMS)', punkter: 'källans mätuttag', forv: '', tol: '±1 %', q: 'trms' },
  ],
  questions: [
    { k: 'topp', label: 'Varför behöver isolationen i en 440 V-installation klara mer än 440 V? Använd ditt mätresultat från mätning 2.', short: 'toppvärde och isolation', minWords: 12 },
    { k: 'truerms', label: 'Förklara skillnaden mellan mätarna i mätning 5 och 6. När behövs en true RMS-mätare ombord?', short: 'true RMS', minWords: 15 },
    { k: 'avvikelse', label: 'Förklara en avvikelse', short: 'förklaring av en avvikelse', minWords: 12, hint: 'Välj en mätning där uppmätt skiljer sig från förväntat och förklara orsaken med dina siffror.' },
    { k: 'slutsats', label: 'Slutsats: vad visar dina mätningar, och vad visar de inte?', short: 'slutsats', minWords: 12 },
  ],
  example: {
    note: 'Ifyllt exempel med stationens AC-källa. Använd det för att se hur ett fullständigt protokoll kan se ut. Dina formuleringar ska vara dina egna.',
    head: { namn: 'Exempel Elevsson', datum: '2026-10-09', rigg: 'AC-källa 12 V 50 Hz, simulator' },
    checks: { kalla: true, instr: true, punkter: true, osc: true, omk: true, klar: true },
    rows: [
      { storhet: 'U (true RMS)', punkter: 'källans mätuttag', drift: 'Sinus, 50 Hz, true RMS', forv: '12,00 V', uppm: `${v2(sin.trueRms)} V`, avv: avv(sin.trueRms, 12), tol: '±0,5 V (källdata)', bed: 'Inom tolerans', komm: 'Källan ligger lite över märkt värde. Det uppmätta värdet används i nästa rad.' },
      { storhet: 'û (oscilloskop)', punkter: 'källans mätuttag', drift: 'Sinus, 50 Hz, oscilloskop', forv: `${v2(pred.peak)} V`, uppm: `${v2(sin.peak)} V`, avv: avv(sin.peak, pred.peak), tol: '±2 %', bed: 'Inom tolerans', komm: `û = √2 · ${v2(U)} V.` },
      { storhet: 'T (oscilloskop)', punkter: 'källans mätuttag', drift: 'Sinus, 50 Hz, oscilloskop', forv: '20,00 ms', uppm: `${v2(sin.T * 1000)} ms`, avv: avv(sin.T * 1000, 20, 'ms'), tol: '±1 %', bed: 'Inom tolerans', komm: 'T = 1/50 Hz.' },
      { storhet: 'U (medelvärdesvisande)', punkter: 'källans mätuttag', drift: 'Sinus, 50 Hz', forv: `${v2(U)} V`, uppm: `${v2(sin.avgResp)} V`, avv: avv(sin.avgResp, U), tol: '±1 %', bed: 'Inom tolerans', komm: 'För ren sinus visar båda mätarna samma värde.' },
      { storhet: 'U (medelvärdesvisande)', punkter: 'källans mätuttag', drift: `${SHAPES.fyrkant.label}, samma effektivvärde`, forv: `${v2(U)} V`, uppm: `${v2(sq.avgResp)} V`, avv: avv(sq.avgResp, U), tol: '±1 %', bed: 'Utanför tolerans', komm: `Förutsagt visat värde: 1,111 · ${v2(U)} V = ${v2(pred.sq)} V, eftersom likriktat medelvärde = û = U för fyrkant. Mätaren visar ${v2((sq.avgResp / sq.trueRms - 1) * 100)} % för mycket.` },
      { storhet: 'U (medelvärdesvisande)', punkter: 'källans mätuttag', drift: `${SHAPES.triangel.label}, samma effektivvärde`, forv: `${v2(U)} V`, uppm: `${v2(tri.avgResp)} V`, avv: avv(tri.avgResp, U), tol: '±1 %', bed: 'Utanför tolerans', komm: `Förutsagt visat värde: 1,111 · √3/2 · ${v2(U)} V = ${v2(pred.tri)} V. Mätaren visar ${v2((1 - tri.avgResp / tri.trueRms) * 100)} % för lite.` },
      { storhet: 'U (true RMS)', punkter: 'källans mätuttag', drift: `${SHAPES.triangel.label}, true RMS`, forv: `${v2(U)} V`, uppm: `${v2(tri.trueRms)} V`, avv: avv(tri.trueRms, U), tol: '±1 %', bed: 'Inom tolerans', komm: 'True RMS visar rätt effektivvärde oavsett kurvform.' },
    ],
    answers: {
      topp: `Mätning 2 gav û = ${v2(sin.peak)} V för ${v2(U)} V effektivvärde. Spänningen når √2 gånger effektivvärdet i varje period. För 440 V blir toppen cirka 622 V, och transienter kommer ovanpå. Isolationen måste klara toppen, inte bara effektivvärdet.`,
      truerms: 'En medelvärdesvisande mätare mäter det likriktade medelvärdet och multiplicerar med 1,111, som bara stämmer för sinus. För fyrkant visade den 11 % för mycket och för triangel cirka 4 % för lite. Efter frekvensomriktare är kurvformen inte sinus, därför behövs true RMS ombord.',
      avvikelse: `Källan mättes till ${v2(sin.trueRms)} V i stället för 12,00 V. Avvikelsen +${v2(sin.trueRms - 12)} V ligger inom källans tolerans ±0,5 V och beror på källan, inte på mätaren. Räknar jag med det uppmätta värdet stämmer toppvärdet exakt.`,
      slutsats: 'Toppvärdet är √2 gånger effektivvärdet för sinus, och bara true RMS visar rätt för andra kurvformer. Mätningarna visar inte hur en verklig omriktarspänning med övertoner och transienter ser ut, och inte instrumentens verkliga fel.',
    },
  },
};
