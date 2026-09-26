// Bildbeskrivningar till textversionerna: en rad per scen, i samma ordning som scenerna.
// Filmerna saknar ljud. Replikerna hämtas ur filmerna, här beskrivs det som bara syns i bilden.
export const BILD = {
  'dubbel-strom': [
    'Titelbild. Matrosen Sigge och måsen Måns presenterar sig.',
    'En ledning med resistansen 0,1 Ω. Pilar visar strömmen 10 A. Rutan visar P_förlust = I² · R = 10 W.',
    'Strömmen ökar från 10 A till 20 A och ledningen färgas varmare. Ett diagram med I (A) på den vågräta axeln och P (W) på den lodräta visar att kurvan böjer uppåt. Texten "4 gånger" visas.',
    'Strömmen ökar till 30 A. En tabell visar I och P: 10 A ger 10 W, 20 A ger 40 W och 30 A ger 90 W.',
    'Ombord. Kom ihåg: 1. Dubbel ström ger fyra gånger så stor förlusteffekt. 2. En lös klämma har större R och blir varm. 3. Värmekamera hittar varma klämmor under last. 4. Skanna med skydden på eller genom IR-fönster.',
  ],
  'varfor-rot-2': [
    'Titelbild.',
    'En sinuskurva u över tiden t. En streckad linje markerar toppvärdet û = 325 V. Text: 50 Hz i land, 60 Hz ombord.',
    'Kurvan u² ritas. Den ligger alltid mellan 0 och û² och är aldrig negativ. En streckad linje mitt i markerar medelvärdet û²/2.',
    'Tre rader visas i tur och ordning: U² = û²/2, U = û/√2 och U = 325 V / 1,414 ≈ 230 V. Text: U kallas effektivvärde eller RMS-värde.',
    'Kom ihåg: 1. û är toppvärdet, U är effektivvärdet. 2. U = û/√2 ≈ 0,707 · û. 3. True RMS visar rätt U även vid förvrängd kurva. 4. 440 V ombord har toppen û ≈ 622 V. 5. Isolationen påverkas av toppvärdet och transienter.',
  ],
  'varfor-rot-3': [
    'Titelbild.',
    'Tre sinuskurvor för L1, L2 och L3, förskjutna 120° i tiden.',
    'Visardiagram: tre lika långa pilar från neutralpunkten N till L1, L2 och L3, 120° isär. Varje pil är en fasspänning, U_{F} = 254 V.',
    'Mellan spetsarna på L1 och L2 dras linjespänningen U_{L} = ?. Vinkeln vid N är 120°. En linje från N till mitten av U_{L} ger en rät vinkel och 30° vid spetsen. Text: halva U_{L} = U_{F} · cos 30° = U_{F} · √3/2.',
    'Tre rader visas: U_{L} = 2 · U_{F} · √3/2, sedan U_{L} = √3 · U_{F}, och 254 V · 1,732 ≈ 440 V. Omvänt: U_{F} = U_{L}/√3.',
    'Ombord. Kom ihåg: 1. 440 V mellan faserna, 254 V i varje lindning. 2. IT-nät: oftast ingen neutralledare. 3. Första jordfelet: normalt larm, inte utlösning. 4. Jordfel på en fas: de andra får 440 V mot skrovet. 5. Ett andra jordfel blir kortslutning: leta upp felet.',
  ],
  hallkretsen: [
    'Titelbild.',
    'Styrschema med 230 V styrspänning mellan L och N: säkring F2, STOPP S0 (NC), START S1 (NO) och överlastkontakten F1 i serie med spolen K1. Hjälpkontakten K1 sitter parallellt med START. Motorn M 3~ står.',
    'START trycks. Strömvägen genom S1 till spolen markeras orange, K1 drar och hjälpkontakten sluter. Motorn går.',
    'START släpps. Strömmen går i stället genom hjälpkontakten K1. K1 är fortfarande dragen och motorn går.',
    'STOPP trycks och bryter kretsen. K1 släpper och hjälpkontakten öppnar. Motorn står kvar även när STOPP släpps.',
    'Överlastskyddets kontakt F1 öppnar. K1 släpper och motorn stannar.',
    'Styrspänningen försvinner. K1 släpper. När spänningen kommer tillbaka står motorn kvar.',
    'Kom ihåg: 1. S1 START är NO, S0 STOPP är NC. 2. Hjälpkontakten K1 sitter parallellt med START. 3. STOPP och överlastskyddet F1 ligger i serie. 4. Efter avbrott: nytt tryck på START. 5. Felsök spänningslöst: frånskilj, lås, prova, mät R.',
  ],
  'fem-steg': [
    'Titelbild.',
    'Kopplingslådan K3 matas från huvudtavlan via brytaren Q1 och även från en UPS via brytaren Q2. Spänningssatta ledningar är markerade. Först öppnas Q1, K3 är fortfarande spänningssatt. Sedan öppnas Q2.',
    'Q1 och Q2 får lås och en skylt: "Arbete pågår", Sigge, tel. 123.',
    'Spänningsprovaren kontrolleras mot en känd källa, används på K3 och kontrolleras sedan mot den kända källan igen.',
    'K3 visas jordad och kortsluten, synligt från arbetsstället.',
    'En grannkrets som fortfarande är i drift får ett skydd mellan sig och arbetsstället.',
    'Kom ihåg: 1. Frånskilj alla matningsvägar. 2. Lås och märk mot återinkoppling. 3. Prova – mät – prova. 4. Jorda och kortslut där det krävs. 5. Skydda mot närliggande spänningssatta delar.',
  ],
  'it-nat': [
    'Titelbild.',
    'Generatorn G 440 V matar L1, L2 och L3. En fläkt på L1 och en pump på L2 har sina höljen anslutna till skrovet. Ingen fas är förbunden med skrovet. Isolationsvakten mellan nätet och skrovet visar OK.',
    'En blixt markerar ett jordfel i fläkten på L1. Isolationsvakten växlar till LARM. Fläkten går vidare.',
    'Ett andra jordfel uppstår i pumpen på L2. En orange väg visar kortslutningen från L1 via skrovet till L2. Pumpens skydd löser och pumpen kopplas bort.',
    'Kom ihåg: 1. Första felet: larm, om nätet är byggt för det. 2. De friska faserna får 440 V mot skrovet. 3. Andra felet: kortslutning via skrovet. 4. Spåra felet direkt: läckströmstång, sedan sektionering. 5. Styrmaskin och viktiga förbrukare: bara enligt plan.',
  ],
};
