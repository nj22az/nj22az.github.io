// Labbprotokoll för Station B · AC-delen (v41_03 bild 8 och övning 4). Eleven mäter på stationens källa (RIG_AC).
// Exemplet bygger på en annan källa (EX_AC, 60 Hz som ombord), så att exemplets värden inte kan skrivas av.
import { waveform, meterReadings, SHAPES } from './model.mjs';

export const RIG_AC = { urms: 12.35, f: 50 };
export const EX_AC = { urms: 11.8, f: 60 };
export const CAL_AC = { urms: 10, f: 50 }; // kalibrator för instrumentkontroll
const v2 = (v) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2).replace('.', ',').replace('-', '−');
const n2 = (v) => Number(v.toFixed(2));
const rd = (shape, rig = EX_AC) => ({ ...waveform({ ...rig, shape }), ...meterReadings({ ...rig, shape }) });
const sin = rd('sinus'), sq = rd('fyrkant'), tri = rd('triangel'), cal = rd('sinus', CAL_AC);
const U = n2(sin.trueRms);
// Fyrkant: likriktat medelvärde = û = U. Triangel: û/2 = √3/2 · U. Mätaren visar 1,111 · likriktat medelvärde.
const K = Math.PI / (2 * Math.SQRT2);
const pred = { peak: Math.SQRT2 * U, T: 1000 / EX_AC.f, sq: K * U, tri: K * U * Math.sqrt(3) / 2 };
const avv = (u, f, unit = 'V') => `${v2(n2(u) - n2(f))} ${unit}`;

export const STATION_B_AC_PROTOKOLL = {
  key: 'stationB-ac-v2',
  migrate(storage) { const old = JSON.parse(storage.getItem('sjoskolan-protokoll-stationB-ac') || 'null'); if (!old || !Array.isArray(old.rows)) return null; return {...old, rows: [old.rows[0] || {}, {}, ...old.rows.slice(1)]}; }, station: 'Station B · AC · simulerad',
  title: 'Labbprotokoll: Station B, AC',
  intro: 'Utökat försök efter mätarprinciperna. Använd fliken ”Sinus och effektivvärde” och ställ in källan med knapparna nedan. Mät med true RMS-multimeter, medelvärdesvisande multimeter och oscilloskop, och jämför med dina beräkningar. Riggen har 50 Hz. Vid 60 Hz blir perioden cirka 16,7 ms.',
  instrument: 'Rigg: isolerad funktionsgenerator med effektförstärkare, märkt 12 V 50 Hz, skyddande separation dokumenterad, tolerans ±0,5 V. Den kan ge sinus, fyrkant och triangel med samma effektivvärde. Kalibrator 10,00 V sinus för instrumentkontroll. Instrument: true RMS-multimeter, medelvärdesmätande multimeter kalibrerad för sinus och oscilloskop för û, topp till topp och periodtid. I simulatorn är instrumenten ideala. Angivna gränser är övningsgränser, inte instrumentens specifikationer. Skilj källans avvikelse, modellens visning och felet mot verkligt RMS.',
  checks: [
    { k: 'kalla', text: 'Källan är avsedd för övningen och isolerad. Skyddande separation är dokumenterad, märkningen ”12 V” räcker inte som bevis.' },
    { k: 'instr', text: 'Jag vet vilket instrument som är true RMS och vilket som är medelvärdesvisande. Båda kontrolleras mot kalibratorn.' },
    { k: 'punkter', text: 'Jag mäter bara vid riggens dokumenterade mätpunkter.' },
    { k: 'osc', text: 'Bänkoscilloskopets referens är förbunden med skyddsjord och jordar den punkt den ansluts till. Anslut den bara enligt riggens anvisning. Nätspänning mäts aldrig med jordad probe: använd differentialprob eller isolerade kanaler med rätt CAT-klass. Skyddsjorden lyfts aldrig. Ombord i ett IT-nät ger en jordad klämma på en fas ett jordfel.' },
    { k: 'omk', text: 'Omkoppling sker med frånskild källa. Jag avbryter vid skada, värme eller osäkerhet.' },
    { k: 'klar', text: 'Klartecken före energisättning. På den fysiska stationen ger instruktören det. I simulatorn ger du det själv när punkterna ovan är gjorda.' },
  ],
  rowsIntro: 'Förutsäg varje instruments visning före avläsningen. Avvikelse här betyder avläst minus förväntad visning. För fyrkant och triangel bedöms modellöverensstämmelse. RMS-felet bedöms separat i analysfrågorna.',
  rows: [
    { title: 'Instrumentkontroll mot kalibratorn', storhet: 'U (true RMS)', punkter: 'kalibratorns utgång', forv: 'kalibratorns värde', tol: '±1 %', q: 'trms', need: { shape: 'sinus', urms: CAL_AC.urms } },
    { title: 'Instrumentkontroll, sinuskalibrerad mätare', storhet: 'U (sinuskalibrerad)', punkter: 'kalibratorns utgång', forv: 'kalibratorns värde', tol: '±1 % (övningsgräns)', q: 'avg', need: { shape: 'sinus', urms: CAL_AC.urms } },
    { title: 'Effektivvärde, sinus', storhet: 'U (true RMS)', punkter: 'källans mätuttag', forv: 'märkt värde', tol: '±0,5 V (källdata)', q: 'trms', need: { shape: 'sinus', urms: RIG_AC.urms } },
    { title: 'Toppvärde, sinus', storhet: 'û (oscilloskop)', punkter: 'källans mätuttag', forv: 'räkna från uppmätt U', tol: '±3 %', q: 'peak', need: { shape: 'sinus', urms: RIG_AC.urms } },
    { title: 'Periodtid', storhet: 'T (oscilloskop)', punkter: 'källans mätuttag', forv: '1/f', tol: '±3 %', q: 'T', need: { shape: 'sinus', urms: RIG_AC.urms } },
    { title: 'Medelvärdesvisande mätare, sinus', storhet: 'U (medelvärdesvisande)', punkter: 'källans mätuttag', forv: 'jämför med mätning 3', tol: '±1 %', q: 'avg', need: { shape: 'sinus', urms: RIG_AC.urms } },
    { title: 'Medelvärdesvisande mätare, fyrkant', storhet: 'U (visat värde)', punkter: 'källans mätuttag', forv: 'förutsäg: 1,111 · likriktat medelvärde', tol: '±0,02 V mot beräknad visning', labels: {tol:'Gräns mot mätarmodellen',bed:'Stämmer visningen med modellen?'}, bedOptions: ['', 'Stämmer med mätarmodellen', 'Avviker från mätarmodellen', 'Kan inte avgöras'], q: 'avg', need: { shape: 'fyrkant', urms: RIG_AC.urms } },
    { title: 'Medelvärdesvisande mätare, triangel', storhet: 'U (visat värde)', punkter: 'källans mätuttag', forv: 'förutsäg: 1,111 · likriktat medelvärde', tol: '±0,02 V mot beräknad visning', labels: {tol:'Gräns mot mätarmodellen',bed:'Stämmer visningen med modellen?'}, bedOptions: ['', 'Stämmer med mätarmodellen', 'Avviker från mätarmodellen', 'Kan inte avgöras'], q: 'avg', need: { shape: 'triangel', urms: RIG_AC.urms } },
    { title: 'True RMS, triangel', storhet: 'U (true RMS)', punkter: 'källans mätuttag', forv: 'samma källa, samma effektivvärde', tol: '±1 %', q: 'trms', need: { shape: 'triangel', urms: RIG_AC.urms } },
  ],
  questions: [
    { k: 'topp', label: 'Varför behöver isolationen i en 440 V-installation klara mer än 440 V? Använd ditt toppvärde från mätning 4.', short: 'toppvärde och isolation', requireText: true },
    { k: 'truerms', label: 'Jämför mätning 7 och 8 med true RMS-värdet. Är den medelvärdesvisande mätaren rätt instrument här? När behövs true RMS ombord?', short: 'true RMS', requireText: true },
    { k: 'rmsfel', label: 'Beräkna felet mot true RMS i procent för fyrkant och triangel: 100 · (visning − RMS)/RMS. Vilket instrument ger RMS i idealmodellen?', short: 'fel mot RMS och instrumentval', requireText: true },
    { k: 'avvikelse', label: 'Förklara en avvikelse', short: 'förklaring av en avvikelse', requireText: true, hint: 'Välj en mätning där uppmätt skiljer sig från förväntat och förklara orsaken med dina siffror.' },
    { k: 'slutsats', label: 'Slutsats: vad visar dina mätningar, och vad visar de inte?', short: 'slutsats', requireText: true },
  ],
  example: {
    note: 'Ifyllt exempel med en annan källa än din: 11,8 V och 60 Hz, som ombord. Dina värden blir andra. Frågor utan siffror visar bara hur ett svar kan byggas upp.',
    head: { namn: 'Exempel Elevsson', datum: '2026-10-09', rigg: 'Exempelkälla 12 V 60 Hz, simulator' },
    checks: { kalla: true, instr: true, punkter: true, osc: true, omk: true, klar: true },
    rows: [
      { storhet: 'U (true RMS)', punkter: 'kalibratorns utgång', drift: 'Sinus, 50 Hz, true RMS', forv: '10,00 V', uppm: `${v2(cal.trueRms)} V`, avv: avv(cal.trueRms, 10), tol: '±1 %', bed: 'Inom tolerans', komm: `Medelvärdesvisande mätaren visade ${v2(cal.avgResp)} V. Båda stämmer för sinus.` },
      { storhet: 'U (sinuskalibrerad)', punkter: 'kalibratorns utgång', drift: 'Sinus, 50 Hz, sinuskalibrerad', forv: '10,00 V', uppm: '10,00 V', avv: '0,00 V', tol: '±1 % (övningsgräns)', bed: 'Inom tolerans', komm: 'Separat avläsning av det andra instrumentet. Båda visar samma för kalibratorns sinus.' },
      { storhet: 'U (true RMS)', punkter: 'källans mätuttag', drift: 'Sinus, 60 Hz, true RMS', forv: '12,00 V', uppm: `${v2(sin.trueRms)} V`, avv: avv(sin.trueRms, 12), tol: '±0,5 V (källdata)', bed: 'Inom tolerans', komm: 'Källan ligger under märkt värde. Det uppmätta värdet används i nästa rader.' },
      { storhet: 'û (oscilloskop)', punkter: 'källans mätuttag', drift: 'Sinus, 60 Hz, oscilloskop', forv: `${v2(pred.peak)} V`, uppm: `${v2(sin.peak)} V`, avv: avv(sin.peak, pred.peak), tol: '±3 %', bed: 'Inom tolerans', komm: `û = √2 · ${v2(U)} V.` },
      { storhet: 'T (oscilloskop)', punkter: 'källans mätuttag', drift: 'Sinus, 60 Hz, oscilloskop', forv: `${v2(pred.T)} ms`, uppm: `${v2(sin.T * 1000)} ms`, avv: avv(sin.T * 1000, pred.T, 'ms'), tol: '±3 %', bed: 'Inom tolerans', komm: 'T = 1/60 Hz.' },
      { storhet: 'U (medelvärdesvisande)', punkter: 'källans mätuttag', drift: 'Sinus, 60 Hz', forv: `${v2(U)} V`, uppm: `${v2(sin.avgResp)} V`, avv: avv(sin.avgResp, U), tol: '±1 %', bed: 'Inom tolerans', komm: 'För ren sinus visar båda mätarna samma värde.' },
      { storhet: 'U (visat värde)', punkter: 'källans mätuttag', drift: `${SHAPES.fyrkant.label}, samma effektivvärde`, forv: `${v2(pred.sq)} V`, uppm: `${v2(sq.avgResp)} V`, avv: avv(sq.avgResp, pred.sq), tol: '±0,02 V mot beräknad visning', bed: 'Stämmer med mätarmodellen', komm: `Förutsägelsen stämde: likriktat medelvärde = û = U för fyrkant, så mätaren visar 1,111 · U. Mot true RMS ${v2(sq.trueRms)} V är det ${v2((sq.avgResp / sq.trueRms - 1) * 100)} % för mycket.` },
      { storhet: 'U (visat värde)', punkter: 'källans mätuttag', drift: `${SHAPES.triangel.label}, samma effektivvärde`, forv: `${v2(pred.tri)} V`, uppm: `${v2(tri.avgResp)} V`, avv: avv(tri.avgResp, pred.tri), tol: '±0,02 V mot beräknad visning', bed: 'Stämmer med mätarmodellen', komm: `Förutsägelsen stämde: 1,111 · √3/2 · U. Mot true RMS är det ${v2((1 - tri.avgResp / tri.trueRms) * 100)} % för lite.` },
      { storhet: 'U (true RMS)', punkter: 'källans mätuttag', drift: `${SHAPES.triangel.label}, true RMS`, forv: `${v2(U)} V`, uppm: `${v2(tri.trueRms)} V`, avv: avv(tri.trueRms, U), tol: '±1 %', bed: 'Inom tolerans', komm: 'I idealmodellen visar true RMS samma effektivvärde för de tre kurvformerna. Verkliga instrument har begränsningar.' },
    ],
    answers: {
      topp: 'Så kan svaret byggas: 1) ditt uppmätta û och U, 2) förhållandet mellan dem, 3) vad det ger för 440 V, 4) vad mer än toppvärdet isolationen måste klara.',
      truerms: 'Så kan svaret byggas: 1) vad den medelvärdesvisande mätaren egentligen mäter, 2) dina två avvikelser mot true RMS i procent, 3) var ombord kurvformen inte är sinus, 4) vilket instrument och vilken funktion du väljer där.',
      rmsfel: 'Fyrkantens RMS-fel är +11,07 %. Triangelns RMS-fel är −3,81 %. Visningarna stämmer med mätarmodellen, men är olika de verkliga effektivvärdena. True RMS ger effektivvärdet inom idealmodellens antaganden.',
      avvikelse: `Källan mättes till ${v2(sin.trueRms)} V i stället för märkta 12,00 V. Avvikelsen ${avv(sin.trueRms, 12)} ligger inom källans tolerans ±0,5 V och beror på källan, inte på mätaren. Räknar jag med det uppmätta värdet stämmer toppvärdet.`,
      slutsats: 'Toppvärdet var √2 gånger effektivvärdet för sinus, och bara true RMS visade samma effektivvärde för alla tre kurvformer. Mätningarna visar inte hur en verklig omriktarspänning med övertoner och transienter ser ut, och inte instrumentens verkliga fel.',
    },
  },
};

