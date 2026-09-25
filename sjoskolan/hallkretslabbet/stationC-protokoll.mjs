// Labbprotokoll för Station C · hållkrets med felmoduler (v41_03 bild 21 och övning 6–8).
// Eleven mäter på stationsriggen med 12 V. Exemplet använder labbets 24 V och en felmodul som övning 8 inte handlar om,
// så att exemplets värden och resonemang inte kan skrivas av. Siffrorna räknas fram ur modellen.
import { meter, fmt } from './model.mjs';
import { run } from './lessons.mjs';

const U = 24;
const volt = (steps, red, black) => { const { r } = run([{ U, red, black }, ...steps]); const v = meter(r.V, red, black); return Number.isFinite(v) ? `${fmt(v)} V` : 'flytande'; };
const coilI = (steps) => `${fmt(run([{ U }, ...steps]).r.I * 1000)} mA`;
const HOLD = [{ s1: true }, { s1: false }];
const S0 = [{ fault: 's0' }, { s1: true }];

export const STATION_C_PROTOKOLL = {
  key: 'stationC', station: 'Station C · hållkrets · simulerad',
  title: 'Labbprotokoll: Station C',
  intro: 'Fyll i medan du använder labbet. Först mäter du den hela kretsen i vila, start, hållning och stopp. Sedan sätter du i en felmodul med okänt fel och felsöker: observation, hypotes, kontroll som skiljer mellan orsakerna, förväntat resultat, resultat och slutsats.',
  instrument: 'Hållkrets enligt v41_03 bild 21: +U, S0 STOPP (NC), S1 START (NO) parallellt med K1:s NO-hjälpkontakt, K1-spole 480 Ω med släckdiod, retur till 0 V. Mätpunkter +U, a, b, c och 0 V, och en strömmätlänk mellan c och returen. Stationsriggen har 12 V DC. Felmoduler: S0 fastnat öppen, START sluter inte, hjälpkontakten sluter inte, spolen avbruten, returen bruten, eller inget fel. I simulatorn är voltmetern ideal.',
  checks: [
    { k: 'selv', text: 'Styrspänningen är SELV enligt riggens dokumentation.' },
    { k: 'diod', text: 'Spolen har släckdiod enligt dokumentationen. Utan den kan spolen ge en spänningsspik på flera hundra volt när kretsen bryts.' },
    { k: 'modul', text: 'Felmodulerna är instruktörens förberedda moduler. Jag öppnar inte riggen och ändrar inte kopplingen.' },
    { k: 'instr', text: 'Instrumentet är kontrollerat mot en känd källa. V ⎓ är valt och röd sladd sitter i V Ω.' },
    { k: 'omk', text: 'Modulbyte och omkoppling till strömmätning sker med frånskild styrspänning. Jag avbryter vid skada, värme eller osäkerhet.' },
    { k: 'klar', text: 'Klartecken före energisättning. På den fysiska stationen ger instruktören det. I simulatorn ger du det själv när punkterna ovan är gjorda.' },
  ],
  rowsIntro: 'Välj ”Stationsrigg 12 V utan fel”. Skriv förväntat värde, ställ in knapparna och sonderna i simulatorn och tryck ”Hämta avläsning”.',
  rows: [
    { title: 'Matning i vila', storhet: 'U(+U–0 V)', punkter: '+U / 0 V', forv: 'märkt styrspänning', tol: '±0,1 V', need: { red: 'P', black: 'N', state: 'vila' } },
    { title: 'Efter S0 i vila', storhet: 'U(a–0 V)', punkter: 'a / 0 V', forv: 'följ strömvägen', tol: '±0,1 V', need: { red: 'a', black: 'N', state: 'vila' } },
    { title: 'Över spolen i vila', storhet: 'U(b–c)', punkter: 'b / c', forv: 'finns det ström?', tol: '±0,1 V', need: { red: 'b', black: 'c', state: 'vila' } },
    { title: 'Över spolen, START intryckt', storhet: 'U(b–c)', punkter: 'b / c', forv: 'följ strömvägen', tol: '±0,1 V', need: { red: 'b', black: 'c', state: 'start' } },
    { title: 'Över spolen efter att START släppts', storhet: 'U(b–c)', punkter: 'b / c', forv: 'håller K1?', tol: '±0,1 V', need: { red: 'b', black: 'c', state: 'hall' } },
    { title: 'Spolström vid hållning', storhet: 'I spole', punkter: 'strömmätlänk c–retur, mA-uttag', forv: 'U/R', tol: '±2 %', q: 'I', need: { state: 'hall' } },
    { title: 'Spolens matningssida efter STOPP', storhet: 'U(b–0 V)', punkter: 'b / 0 V', forv: 'följ strömvägen', tol: '±0,1 V', need: { red: 'b', black: 'N', state: 'vila' } },
  ],
  faults: 2, faultsRequired: 1,
  faultsIntro: 'Välj ”Ny felmodul (okänt fel)”. Beskriv vad du ser, skriv vilka orsaker som är möjliga och välj en mätning som ger olika resultat för olika orsaker. Skriv förväntat resultat innan du mäter. Visa felet först när raden är ifylld. En rad krävs, den andra är frivillig.',
  questions: [
    { k: 'skilj', label: 'Hur skiljer du en öppen hållkontakt från en bruten retur med mätningar? Ange mätpunkter, knappläge och förväntade värden i båda fallen.', short: 'hållkontakt mot retur', minWords: 15 },
    { k: 'obs', label: 'Ge ett exempel från din felsökning på en observation och en hypotes. Varför är de inte samma sak?', short: 'observation och hypotes', minWords: 12 },
    { k: 'sakerhet', label: 'Vilka kontroller skulle du göra spänningslöst på en verklig anläggning ombord, och vad måste du göra innan du kan mäta spänningslöst?', short: 'spänningslös felsökning', minWords: 15 },
    { k: 'slutsats', label: 'Slutsats: vad visar dina mätningar om kretsens funktion, och vad visar de inte?', short: 'slutsats', minWords: 12 },
    { k: 'blackout', optional: true, label: 'Efter en black-out kommer spänningen tillbaka (prova ”Styrspänning till”). Varför startar inte pumpen av sig själv med den här kretsen? Vilka förbrukare ombord ska ändå starta automatiskt, varför startas de i tur och ordning, och vad gör preferential trip?' },
  ],
  example: {
    note: 'Ifyllt exempel med labbets 24 V och felmodulen ”S0 fastnat öppen”. Din rigg har 12 V och dina felmoduler slumpas. Frågor utan siffror visar bara hur ett svar kan byggas upp.',
    head: { namn: 'Exempel Elevsson', datum: '2026-10-09', rigg: 'Hållkrets 24 V, simulator' },
    checks: { selv: true, diod: true, modul: true, instr: true, omk: true, klar: true },
    rows: [
      { storhet: 'U(+U–0 V)', punkter: 'röd +U / svart 0 V', drift: 'vila, K1 släppt', forv: '24 V', uppm: volt([], 'P', 'N'), avv: '0 V', tol: '±0,1 V', bed: 'Inom tolerans', komm: 'Matningen finns.' },
      { storhet: 'U(a–0 V)', punkter: 'röd a / svart 0 V', drift: 'vila, K1 släppt', forv: '24 V', uppm: volt([], 'a', 'N'), avv: '0 V', tol: '±0,1 V', bed: 'Inom tolerans', komm: 'S0 är sluten. Ingen ström, men full spänning mot 0 V.' },
      { storhet: 'U(b–c)', punkter: 'röd b / svart c', drift: 'vila, K1 släppt', forv: '0 V', uppm: volt([], 'b', 'c'), avv: '0 V', tol: '±0,1 V', bed: 'Inom tolerans', komm: 'Ingen ström genom spolen ger inget spänningsfall.' },
      { storhet: 'U(b–c)', punkter: 'röd b / svart c', drift: 'START intryckt, K1 dragen', forv: '24 V', uppm: volt([{ s1: true }], 'b', 'c'), avv: '0 V', tol: '±0,1 V', bed: 'Inom tolerans', komm: '' },
      { storhet: 'U(b–c)', punkter: 'röd b / svart c', drift: 'START släppt, K1 dragen', forv: '24 V', uppm: volt(HOLD, 'b', 'c'), avv: '0 V', tol: '±0,1 V', bed: 'Inom tolerans', komm: 'Hjälpkontakten håller spolens matning.' },
      { storhet: 'I spole', punkter: 'strömmätlänk c–retur, mA-uttag', drift: 'hållning, omkopplat frånskilt', forv: '50 mA', uppm: coilI(HOLD), avv: '0 mA', tol: '±2 %', bed: 'Inom tolerans', komm: 'I = 24 V / 480 Ω.' },
      { storhet: 'U(b–0 V)', punkter: 'röd b / svart 0 V', drift: 'STOPP har tryckts och släppts, K1 släppt', forv: '0 V', uppm: volt([...HOLD, { s0: true }, { s0: false }], 'b', 'N'), avv: '0 V', tol: '±0,1 V', bed: 'Inom tolerans', komm: 'b hänger kvar på 0 V genom spolen och returen. Kretsen startar inte själv.' },
    ],
    faults: [
      { obs: 'K1 drar inte, varken med START intryckt eller efter.', hyp: 'Fyra möjliga orsaker: S0 öppen, START sluter inte, spolen avbruten eller returen bruten. Jag prövar först om spänningen når förbi S0.', kontroll: 'Håll START intryckt och mät a–0 V.', omsann: 'S0 öppen: a saknar förbindelse med +U och följer returen, 0 V. De tre andra orsakerna: 24 V på a.', resultat: `a–0 V: ${volt(S0, 'a', 'N')}`, slutsats: 'a har 0 V, så spänningen stannar före a. Det pekar på S0 och utesluter de tre andra orsakerna. Felmodulen visade ”S0 har fastnat öppen”.' },
      {},
    ],
    answers: {
      skilj: 'Så kan svaret byggas: 1) vad K1 gör i varje fall när START trycks och släpps, 2) en mätpunkt och ett knappläge som ger olika värden för de två felen, 3) de förväntade värdena i båda fallen.',
      obs: 'Så kan svaret byggas: 1) en sak du såg eller mätte, 2) en möjlig orsak, 3) varför orsaken måste prövas och inte bara antas.',
      sakerhet: 'Så kan svaret byggas: 1) vilka kontroller som kan göras spänningslöst, 2) vilka matningar som måste frånskiljas och låsas, inte bara styrspänningen, 3) hur spänningslösheten kontrolleras, 4) vilka regler ombord arbetet följer.',
      blackout: 'Så kan svaret byggas: 1) vad som händer med K1 och hjälpkontakten när spänningen försvinner, 2) vilka förbrukare som ändå ska starta och varför de startar i tur och ordning, 3) vad preferential trip kopplar bort och varför.',
      slutsats: 'Kretsen startade med START, höll med K1:s hjälpkontakt och stannade med STOPP. Spolen tog 50 mA vid 24 V. Mätningarna visar inte kontakternas slitage, spolens tillslagsspänning eller hur kretsen beter sig vid spänningsdipp. Simulatorn visar en öppen punkt som ”flytande”. I en verklig 230 V-styrkrets med långa kablar kan en högohmig multimeter visa spökspänning på en öppen ledare; ett LoZ-läge ger ett säkrare besked.',
    },
  },
};
