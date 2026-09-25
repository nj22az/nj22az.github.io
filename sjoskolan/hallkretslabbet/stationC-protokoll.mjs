// Labbprotokoll för Station C · hållkrets med felmoduler (v41_03 bild 21 och övning 6–8).
// Exemplet räknas fram ur modellen för 12 V-riggen, så att värdena alltid stämmer med simulatorn.
import { meter, fmt } from './model.mjs';
import { run } from './lessons.mjs';

const U = 12;
const volt = (steps, red, black) => { const { r } = run([{ U, red, black }, ...steps]); const v = meter(r.V, red, black); return Number.isFinite(v) ? `${fmt(v)} V` : 'flytande'; };
const coilI = (steps) => `${fmt(run([{ U }, ...steps]).r.I * 1000)} mA`;
const HOLD = [{ s1: true }, { s1: false }];

export const STATION_C_PROTOKOLL = {
  key: 'stationC', station: 'Station C · hållkrets · simulerad',
  title: 'Labbprotokoll: Station C',
  intro: 'Fyll i medan du använder labbet. Först mäter du den hela kretsen i vila, start, hållning och stopp. Sedan sätter du i felmoduler med okänt fel och felsöker: observation, hypotes, kontroll som skiljer mellan orsakerna, resultat och slutsats.',
  instrument: 'Hållkrets enligt v41_03 bild 21: +U, S0 STOPP (NC), S1 START (NO) parallellt med K1:s NO-hjälpkontakt, K1-spole 480 Ω, retur till 0 V. Mätpunkter +U, a, b, c och 0 V. Stationsriggen har 12 V DC, labbet kan köras med 12 eller 24 V. Felmoduler: S0 fastnat öppen, START sluter inte, hjälpkontakten sluter inte, spolen avbruten, returen bruten, eller inget fel.',
  checks: [
    { k: 'selv', text: 'Styrspänningen är SELV enligt riggens dokumentation.' },
    { k: 'modul', text: 'Felmodulerna är instruktörens förberedda moduler. Jag öppnar inte riggen och ändrar inte kopplingen.' },
    { k: 'instr', text: 'Instrumentet är kontrollerat mot en känd källa. V ⎓ är valt och röd sladd sitter i V Ω.' },
    { k: 'punkter', text: 'Jag mäter bara på de märkta mätpunkterna +U, a, b, c och 0 V.' },
    { k: 'omk', text: 'Modulbyte sker med bruten styrspänning. Jag avbryter vid skada, värme eller osäkerhet.' },
    { k: 'klar', text: 'Klartecken före energisättning. På den fysiska stationen ger instruktören det. I simulatorn ger du det själv när punkterna ovan är gjorda.' },
  ],
  rowsIntro: 'Välj ”Stationsrigg 12 V utan fel”. Skriv förväntat värde, ställ in knapparna och sonderna i simulatorn och tryck ”Hämta avläsning”.',
  rows: [
    { title: 'Matning i vila', storhet: 'U(+U–0 V)', punkter: '+U / 0 V', forv: 'märkt styrspänning', tol: '±0,1 V' },
    { title: 'Efter S0 i vila', storhet: 'U(a–0 V)', punkter: 'a / 0 V', forv: 'följ strömvägen', tol: '±0,1 V' },
    { title: 'Över spolen i vila', storhet: 'U(b–c)', punkter: 'b / c', forv: 'finns det ström?', tol: '±0,1 V' },
    { title: 'Över spolen, START intryckt', storhet: 'U(b–c)', punkter: 'b / c', forv: '', tol: '±0,1 V' },
    { title: 'Över spolen efter att START släppts', storhet: 'U(b–c)', punkter: 'b / c', forv: 'håller K1?', tol: '±0,1 V' },
    { title: 'Spolström vid hållning', storhet: 'I spole', punkter: 'spolström', forv: 'U/R', tol: '±2 %', q: 'I' },
    { title: 'Spolens matningssida efter STOPP', storhet: 'U(b–0 V)', punkter: 'b / 0 V', forv: '', tol: '±0,1 V' },
  ],
  faults: 2, faultsRequired: 2,
  faultsIntro: 'Välj ”Ny felmodul (okänt fel)”. Beskriv vad du ser, föreslå en orsak och välj en mätning som ger olika resultat för olika orsaker. Skriv förväntat resultat innan du mäter. Visa felet först när raden är ifylld.',
  questions: [
    { k: 'skilj', label: 'Hur skiljer du en öppen hållkontakt från en bruten retur med mätningar? Ange mätpunkter, knappläge och förväntade värden i båda fallen.', short: 'hållkontakt mot retur', minWords: 15 },
    { k: 'obs', label: 'Ge ett exempel från din felsökning på en observation och en hypotes. Varför är de inte samma sak?', short: 'observation och hypotes', minWords: 12 },
    { k: 'sakerhet', label: 'Vilka kontroller skulle du göra spänningslöst på en verklig anläggning, och varför?', short: 'spänningslös felsökning', minWords: 10 },
    { k: 'slutsats', label: 'Slutsats: vad visar dina mätningar om kretsens funktion, och vad visar de inte?', short: 'slutsats', minWords: 12 },
  ],
  example: {
    note: 'Ifyllt exempel för stationsriggen med 12 V. Felmodulerna i exemplet är ”hjälpkontakten sluter inte” och ”returen bruten”. Dina felmoduler slumpas och kan vara andra.',
    head: { namn: 'Exempel Elevsson', datum: '2026-10-09', rigg: 'Stationsrigg 12 V, simulator' },
    checks: { selv: true, modul: true, instr: true, punkter: true, omk: true, klar: true },
    rows: [
      { storhet: 'U(+U–0 V)', punkter: 'röd +U / svart 0 V', drift: 'vila, K1 släppt', forv: '12 V', uppm: volt([], 'P', 'N'), avv: '0 V', tol: '±0,1 V', bed: 'Inom tolerans', komm: 'Matningen finns.' },
      { storhet: 'U(a–0 V)', punkter: 'röd a / svart 0 V', drift: 'vila, K1 släppt', forv: '12 V', uppm: volt([], 'a', 'N'), avv: '0 V', tol: '±0,1 V', bed: 'Inom tolerans', komm: 'S0 är sluten. Ingen ström, men full spänning mot 0 V.' },
      { storhet: 'U(b–c)', punkter: 'röd b / svart c', drift: 'vila, K1 släppt', forv: '0 V', uppm: volt([], 'b', 'c'), avv: '0 V', tol: '±0,1 V', bed: 'Inom tolerans', komm: 'Ingen ström genom spolen ger inget spänningsfall.' },
      { storhet: 'U(b–c)', punkter: 'röd b / svart c', drift: 'START intryckt, K1 dragen', forv: '12 V', uppm: volt([{ s1: true }], 'b', 'c'), avv: '0 V', tol: '±0,1 V', bed: 'Inom tolerans', komm: '' },
      { storhet: 'U(b–c)', punkter: 'röd b / svart c', drift: 'START släppt, K1 dragen', forv: '12 V', uppm: volt(HOLD, 'b', 'c'), avv: '0 V', tol: '±0,1 V', bed: 'Inom tolerans', komm: 'Hjälpkontakten håller spolens matning.' },
      { storhet: 'I spole', punkter: 'spolström', drift: 'hållning', forv: '25 mA', uppm: coilI(HOLD), avv: '0 mA', tol: '±2 %', bed: 'Inom tolerans', komm: 'I = 12 V / 480 Ω.' },
      { storhet: 'U(b–0 V)', punkter: 'röd b / svart 0 V', drift: 'STOPP har tryckts och släppts, K1 släppt', forv: '0 V', uppm: volt([...HOLD, { s0: true }, { s0: false }], 'b', 'N'), avv: '0 V', tol: '±0,1 V', bed: 'Inom tolerans', komm: 'b hänger kvar på 0 V genom spolen och returen. Kretsen startar inte själv.' },
    ],
    faults: [
      { obs: 'K1 drar när START hålls in men släpper direkt när START släpps.', hyp: 'K1:s hjälpkontakt sluter inte, alltså är hållvägen öppen. Spolen och returen fungerar eftersom K1 drar med START.', kontroll: 'Släpp START. Mät a–0 V och b–0 V.', omsann: 'a–0 V: 12 V, b–0 V: 0 V. Spänningen stannar före den parallella grenen.', resultat: `a–0 V: ${volt([{ fault: 'hall' }, { s1: true }, { s1: false }], 'a', 'N')}, b–0 V: ${volt([{ fault: 'hall' }, { s1: true }, { s1: false }], 'b', 'N')}`, slutsats: 'Stämmer med öppen hjälpkontakt. START fungerar, så felet ligger i K1:s NO-kontakt eller dess ledare. Felmodulen visade ”hjälpkontakten sluter inte”.' },
      { obs: 'K1 drar inte alls, varken med START intryckt eller efter.', hyp: 'Returen c–0 V är bruten. Alternativ orsak: spolen är avbruten.', kontroll: 'Håll START intryckt. Mät c–0 V.', omsann: 'Bruten retur: c har 12 V genom den strömlösa spolen. Avbruten spole: c har 0 V.', resultat: `c–0 V: ${volt([{ fault: 'retur' }, { s1: true }], 'c', 'N')}`, slutsats: 'c har full spänning, så spolen leder och avbrottet sitter i returen. Felmodulen visade ”returledaren är bruten”.' },
    ],
    answers: {
      skilj: 'Öppen hållkontakt: K1 drar med START intryckt men släpper sedan. Efter släpp är a–0 V 12 V och b–0 V 0 V. Bruten retur: K1 drar aldrig. Med START intryckt är b–0 V och c–0 V båda 12 V, eftersom ingen ström går och spolen inte får något spänningsfall.',
      obs: '”K1 släpper när START släpps” är en observation, alltså något jag ser. ”Hjälpkontakten sluter inte” är en hypotes om orsaken. Den måste prövas med en mätning, eftersom även en lös ledare i hållgrenen ger samma symptom.',
      sakerhet: 'Kontinuitet över hjälpkontakten och resistansen i spolen och returen. De kan mätas med bruten styrspänning, så att ingen behöver arbeta nära spänningssatta delar. Spänningsmätningar gör jag bara på märkta mätpunkter med klartecken.',
      slutsats: 'Kretsen startar med START, håller med K1:s hjälpkontakt och stannar med STOPP. Spolen tar 25 mA vid 12 V. Mätningarna visar inte kontakternas slitage, spolens tillslagsspänning eller hur kretsen beter sig vid spänningsdipp.',
    },
  },
};
