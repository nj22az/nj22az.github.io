// Labbprotokoll för Isolationslabbet (vecka 44). Eleven mäter i fasta lägen som ställs in med knapparna ovanför protokollet.
export const LAGEN = {
  friskt: { label: 'Friskt nät 440 V', set: { del: 'overvakning', R: [5e6, 5e6, 5e6], C: 1e-6, f: 50, larm: 100e3 }, text: 'friskt nät, 5 MΩ och 1 µF per fas' },
  nedsatt: { label: 'L1 nedsatt till 80 kΩ', set: { del: 'overvakning', R: [80e3, 5e6, 5e6], C: 1e-6, f: 50, larm: 100e3 }, text: 'L1 80 kΩ mot skrov, övriga 5 MΩ' },
  jordfel: { label: 'Fullständigt jordfel på L1', set: { del: 'overvakning', R: [0, 5e6, 5e6], C: 1e-6, f: 50, larm: 100e3 }, text: 'fullständigt jordfel L1, 1 µF per fas' },
  m3: { label: 'Isolationsprovning av motor M3', set: { del: 'prov', obj: 'motor-m3', Uprov: 500, frans: true }, text: 'motor M3 med kabel, frånskild, 500 V DC' },
};

export const ISO_PROTOKOLL = {
  key: 'isolation', station: 'Isolationslabbet · vecka 44 · simulerad',
  title: 'Labbprotokoll: isolation och jordfel i IT-nät',
  intro: 'Fyll i medan du använder labbet. Ställ in läget med knapparna, skriv förväntat värde och tryck ”Hämta avläsning”. Del 1 gäller isolationsövervakningen i fartygets 440 V IT-nät. Del 2 gäller isolationsprovning av motor M3.',
  instrument: 'IT-nät 440 V, 50 Hz, utan neutralledare. Isolationsövervakning (IMD) med larmgräns 100 kΩ. Nätkapacitans 1 µF per fas mot skrovet. Isolationsprovare med provspänning 250, 500 eller 1 000 V DC. Motor M3 med kabel, gräns enligt fartygets instruktion: minst 1 MΩ mot PE. I simulatorn är instrumenten ideala.',
  checks: [
    { k: 'instr', text: 'Instrumenten är avsedda för nätets spänning och mätkategori. Isolationsprovaren är kontrollerad och sladdarna är hela.' },
    { k: 'frans', text: 'Före isolationsprovning: objektet är frånskilt, låst och kontrollerat spänningslöst.' },
    { k: 'elektronik', text: 'Elektronik som kan skadas av provspänningen (omriktare, styrkort, filter) är bortkopplad enligt instruktion.' },
    { k: 'urladdning', text: 'Efter provning laddas objektet ur innan någon rör ledarna. Kabel och lindning kan hålla laddning.' },
    { k: 'klar', text: 'Klartecken före provning. Ombord ger den ansvarige det. I simulatorn ger du det själv när punkterna ovan är gjorda.' },
  ],
  rowsIntro: 'Mätning 1–5 gäller nätet (del 1), 6–8 motor M3 (del 2). Använd knapparna för rätt läge.',
  rows: [
    { title: 'Isolationsvärde, friskt nät', storhet: 'Riso (IMD)', punkter: 'IMD: nät / skrov', forv: 'tre vägar parallellt', tol: '±2 %', q: 'Riso', need: { lage: 'friskt' } },
    { title: 'L1 mot skrov, friskt nät', storhet: 'U(L1–skrov)', punkter: 'L1 / skrov', forv: 'U_{L}/√3', tol: '±2 %', q: 'U1', need: { lage: 'friskt' } },
    { title: 'Isolationsvärde, L1 nedsatt', storhet: 'Riso (IMD)', punkter: 'IMD: nät / skrov', forv: 'tre vägar parallellt', tol: '±2 %', q: 'Riso', need: { lage: 'nedsatt' } },
    { title: 'L2 mot skrov, jordfel på L1', storhet: 'U(L2–skrov)', punkter: 'L2 / skrov', forv: 'vilken potential har skrovet?', tol: '±2 %', q: 'U2', need: { lage: 'jordfel' } },
    { title: 'Ström i jordfelet', storhet: 'Ifel', punkter: 'tång runt felstället', forv: '3ωC·U_{F}', tol: '±5 %', q: 'Ifel', need: { lage: 'jordfel' } },
    { title: 'M3 L1 mot PE', storhet: 'R(L1–PE)', punkter: 'L1 / PE', forv: 'minst 1 MΩ', tol: 'minst 1 MΩ', q: 'prov', need: { lage: 'm3', par: 'L1-PE' } },
    { title: 'M3 L2 mot PE', storhet: 'R(L2–PE)', punkter: 'L2 / PE', forv: 'minst 1 MΩ', tol: 'minst 1 MΩ', q: 'prov', need: { lage: 'm3', par: 'L2-PE' } },
    { title: 'M3 L3 mot PE', storhet: 'R(L3–PE)', punkter: 'L3 / PE', forv: 'minst 1 MΩ', tol: 'minst 1 MΩ', q: 'prov', need: { lage: 'm3', par: 'L3-PE' } },
  ],
  questions: [
    { k: 'larm', label: 'Larmade övervakningen när L1 var nedsatt till 80 kΩ? Varför visar övervakningen inte 80 kΩ? Använd dina värden.', short: 'larm och parallella vägar', minWords: 12 },
    { k: 'forsta', label: 'Varför kan driften fortsätta efter första jordfelet, och varför måste felet ändå hittas snabbt? Använd din spänning mot skrov och din felström.', short: 'första och andra felet', minWords: 15 },
    { k: 'm3', label: 'Är motor M3 godkänd? Vilken fas avviker, och vad gör du härnäst?', short: 'bedömning av M3', minWords: 12 },
    { k: 'villkor', label: 'Vilka mätvillkor ska antecknas för att en senare isolationsmätning ska kunna jämföras med din?', short: 'mätvillkor', minWords: 10 },
    { k: 'slutsats', label: 'Slutsats: vad visar dina mätningar, och vad visar de inte?', short: 'slutsats', minWords: 12 },
  ],
};
