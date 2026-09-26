// GENERERAD FIL · ur sjoskolan/innehall (innehall.py bygg simulatorer). Redigera posterna i innehall/ovningar/, inte här.
// Stegvisa övningar. test är id i funktioner.mjs; lessons.mjs kopplar ihop dem.
export const UPPGIFTER = [
 {
  "id": "voltage",
  "ovning": "EL-000345",
  "title": "Spänning",
  "circuit": "lamp",
  "slides": "10–16",
  "goal": "Mät spänningen över hyttlampan.",
  "steps": [
   {
    "task": "Välj V ⎓ och uttaget V Ω. Anslut svart till P2 och röd till P1. Slå på 12 V och läs av.",
    "hint": "En voltmeter kopplas parallellt med lasten. Svart spets är referensen. Förväntat värde är 12,00 V.",
    "test": "multimetersimulator.voltage.1",
    "why": "Rätt: mätaren ligger parallellt med lampan. Dess höga ingångsresistans gör att nästan ingen extra ström tas från kretsen."
   }
  ]
 },
 {
  "id": "polarity",
  "ovning": "EL-000346",
  "title": "Polaritet",
  "circuit": "lamp",
  "slides": "15–16",
  "goal": "Ta reda på vad ett minustecken betyder.",
  "steps": [
   {
    "task": "Mät över lampan med svart på P1 och röd på P2. Använd V ⎓ och slå på 12 V.",
    "hint": "Displayen visar potentialen vid röd spets minus potentialen vid svart. Om spetsarna byter plats byter värdet tecken.",
    "test": "multimetersimulator.polarity.1",
    "why": "−12,00 V betyder omvänd polaritet. Spänningens belopp är fortfarande 12 V."
   }
  ]
 },
 {
  "id": "current",
  "ovning": "EL-000347",
  "title": "Ström i serie",
  "circuit": "lamp",
  "slides": "17–23, 66",
  "goal": "Låt lampans ström gå genom multimetern.",
  "steps": [
   {
    "task": "Med matningen bruten: öppna länken K1–K2. Välj A ⎓ och A-uttaget. Anslut röd till K1 och svart till K2. Slå på och läs av.",
    "hint": "Kretsen måste öppnas. Mätaren ersätter länken, så samma ström går genom mätare och lampa. Cirka 0,100 A förväntas.",
    "test": "multimetersimulator.current.1",
    "why": "Rätt: mätaren sitter i serie. I = 12 / (120 + 0,1) ≈ 0,100 A. Shunten ger ett litet extra spänningsfall."
   },
   {
    "task": "Avsluta mätningen: bryt matningen, lossa båda mätspetsarna och flytta röd sladd tillbaka till V Ω.",
    "hint": "Ett kvarlämnat A-uttag kan orsaka kortslutning vid nästa spänningsmätning.",
    "test": "multimetersimulator.current.2",
    "why": "Rätt avslut: matningen är bruten, spetsarna lossade och röd sladd tillbaka i V Ω."
   }
  ]
 },
 {
  "id": "resistance",
  "ovning": "EL-000348",
  "title": "Resistans",
  "circuit": "resistor",
  "slides": "24–26",
  "goal": "Mät en frikopplad resistors resistans.",
  "setup": {
   "parallel": false
  },
  "steps": [
   {
    "task": "Välj Ω och V Ω-uttaget. Anslut spetsarna till A och B på den frikopplade resistorn R1.",
    "hint": "En ohmmeter skickar en liten testström. Komponenten ska vara spänningslös och utan andra parallella strömvägar.",
    "test": "multimetersimulator.resistance.1",
    "why": "1,000 kΩ = 1 000 Ω. Mätaren använder sin egen testström; någon extern matning behövs inte."
   }
  ]
 },
 {
  "id": "parallel",
  "ovning": "EL-000349",
  "title": "Parallella vägar",
  "circuit": "resistor",
  "slides": "30–32",
  "goal": "Förklara varför en 1 kΩ-resistor kan ge 500 Ω.",
  "steps": [
   {
    "task": "Mät mellan A och B i Ω-läge med båda 1 kΩ-resistorerna inkopplade.",
    "hint": "Mätaren ser båda strömvägarna: 1/R = 1/1000 + 1/1000.",
    "test": "multimetersimulator.parallel.1",
    "why": "500 Ω är korrekt för två 1 kΩ-resistorer parallellt. Det betyder inte att R1 är trasig."
   },
   {
    "task": "Frikoppla R2 med knappen vid kretsen. Mät sedan R1 igen.",
    "hint": "När den parallella vägen försvinner ska värdet stiga till 1,000 kΩ.",
    "test": "multimetersimulator.parallel.2",
    "why": "Nu mäter du bara R1: 1,000 kΩ. Frikoppla en komponent vid behov för att undvika parallella strömvägar."
   }
  ]
 },
 {
  "id": "continuity",
  "ovning": "EL-000350",
  "title": "Kontinuitet",
  "circuit": "fuse",
  "slides": "27–29",
  "goal": "Skilj en hel säkring från ett avbrott.",
  "steps": [
   {
    "task": "Välj Summer och V Ω-uttaget. Anslut spetsarna till A och B på den urtagna, hela säkringen.",
    "hint": "En hel säkring har mycket låg resistans. Summern ger en synlig signal; ljud kan slås på under displayen.",
    "test": "multimetersimulator.continuity.1",
    "why": "0,2 Ω och kontaktsignal visar en sammanhängande ledande väg. En summer är inte en provare för spänningslöshet."
   },
   {
    "task": "Välj ”Simulera avbrott” och kontrollera säkringen igen.",
    "hint": "OL betyder här öppen krets, inte noll ohm.",
    "test": "multimetersimulator.continuity.2",
    "why": "OL och ingen ton visar avbrott. Säkringen är bortkopplad från spänningskällor under hela övningen."
   }
  ]
 },
 {
  "id": "loading",
  "ovning": "EL-000351",
  "title": "Mätaren påverkar",
  "circuit": "divider",
  "slides": "55–63",
  "goal": "Upptäck varför en voltmeter kan sänka spänningen den mäter. Förutsäg → mät → förklara.",
  "revision": 2,
  "setup": {
   "power": true
  },
  "steps": [
   {
    "key": "unloaded",
    "kind": "number",
    "label": "Förutsäg utan mätare",
    "task": "R1 och R2 är båda 1 MΩ (en miljon ohm). De delar på källans 10 V. Hur stor är spänningen mellan M och G innan mätaren ansluts?",
    "answer": 5,
    "tolerance": 0.01,
    "unit": "V",
    "hint": "R1 och R2 är lika stora. Varje resistor får hälften av källans 10 V.",
    "why": "5,00 V. Det är det beräknade värdet utan ansluten mätare. Nu ska vi se om mätaren förändrar kretsen."
   },
   {
    "key": "predict10",
    "kind": "choice",
    "label": "Förutsäg med 10 MΩ",
    "task": "Mätarens ingång är en extra strömväg mellan M och G. Vad tror du händer med spänningen när en mätare med 10 MΩ ansluts?",
    "choices": [
     "Den blir lite lägre än 5 V",
     "Den blir högre än 5 V",
     "Den blir exakt 5 V"
    ],
    "correct": 0,
    "hint": "Mätaren hamnar parallellt med R2. Den sammanlagda resistansen i den nedre delen blir lite mindre.",
    "why": "Spänningen blir lite lägre. Även en voltmeter tar en liten ström. Mät nu och jämför med dina 5,00 V."
   },
   {
    "key": "measure10",
    "kind": "measurement",
    "label": "Mät med 10 MΩ",
    "task": "Mät mellan M och G. Följ kopplingshjälpen och kontrollera sedan avläsningen.",
    "input": 10000000,
    "hint": "Välj V ⎓ och V Ω. Sätt svart på G och röd på M. Välj 10 MΩ och slå på 10 V. Omvända spetsar går också bra: jämför beloppet.",
    "test": "multimetersimulator.loading.3",
    "why": "Cirka 4,76 V, alltså lite under 5,00 V. Den streckade grenen är mätarens ingångsresistans, parallellt med R2."
   },
   {
    "key": "predict1",
    "kind": "choice",
    "label": "Förutsäg med 1 MΩ",
    "task": "Nästa mätare har lägre ingångsresistans: 1 MΩ. Vad händer med spänningens belopp om spetsarna sitter kvar?",
    "choices": [
     "Det blir lägre än med 10 MΩ",
     "Det blir högre än med 10 MΩ",
     "Det ändras inte"
    ],
    "correct": 0,
    "hint": "Lägre ingångsresistans ger mer ström i mätarens gren. R2 och mätaren är nu två lika stora resistanser parallellt.",
    "why": "Beloppet blir ännu lägre. En lägre ingångsresistans påverkar den här kretsen mer."
   },
   {
    "key": "measure1",
    "kind": "measurement",
    "label": "Mät med 1 MΩ",
    "task": "Låt spetsarna sitta kvar på M och G. Ändra simulerad ingångsresistans till 1 MΩ. Läs av och jämför.",
    "input": 1000000,
    "hint": "Ändra endast väljaren ”Simulerad ingångsresistans” under schemat. Behåll V ⎓, V Ω och matningen till.",
    "test": "multimetersimulator.loading.5",
    "why": "Cirka 3,33 V. R2 och mätaren ger tillsammans 500 kΩ. Spänningen sjunker därför mer. Det är belastning från mätaren, inte en trasig resistor."
   },
   {
    "key": "kirchhoff",
    "kind": "number",
    "label": "Kontrollera summan",
    "task": "Behåll mätaren över R2. Källan ger 10,00 V och den nedre delen har 3,33 V. Beräkna spänningsfallet över R1: 10,00 − 3,33 = ?",
    "answer": 6.666666666666667,
    "tolerance": 0.02,
    "unit": "V",
    "hint": "Spänningsfallen i samma krets summeras till källspänningen. Flytta inte mätaren: då belastas en annan del av kretsen.",
    "why": "6,67 V över R1 + 3,33 V över R2 = 10,00 V. Källans spänning är oförändrad. Värdet över R1 är beräknat för den här kopplingen, inte uppmätt med en flyttad mätare."
   },
   {
    "key": "explain",
    "kind": "choice",
    "label": "Förklara med egna ord",
    "task": "Varför är 3,33 V inte ett tecken på att spänningsdelaren är trasig? Välj förklaring och skriv sedan en egen mening i protokollet.",
    "choices": [
     "Mätaren är en extra gren parallellt med R2 och ändrar spänningsdelningen",
     "Mätaren sänker alltid källans spänning till 3,33 V",
     "Minustecknet gör att spänningens belopp blir mindre"
    ],
    "correct": 0,
    "comment": true,
    "hint": "Beskriv var mätaren kopplas och hur den extra strömvägen påverkar delaren. Använd gärna orden parallellt, resistans och spänning.",
    "why": "Mätaren är en gren i kretsen. Lägre ingångsresistans ger större påverkan här. Båda mätvärdena och din egen förklaring finns i protokollet. Läraren kan följa upp din formulering."
   }
  ]
 },
 {
  "id": "category",
  "ovning": "EL-000352",
  "title": "Välj CAT-klass",
  "circuit": "category",
  "slides": "33–39",
  "goal": "Bedöm mätplats, spänning och hela mätutrustningen.",
  "steps": [
   {
    "task": "Du ska mäta i en fördelningscentral (CAT III). Högsta relevanta spänning är 400 V. Vilket alternativ uppfyller båda kraven?",
    "choices": [
     "CAT II 1 000 V",
     "CAT III 600 V",
     "CAT III 300 V"
    ],
    "correct": 1,
    "hint": "Ett högt volt-tal ersätter inte rätt kategori.",
    "why": "CAT III 600 V uppfyller både kategori och spänning. CAT II 1 000 V har ett högre volt-tal, men fel kategori för denna mätplats."
   },
   {
    "task": "Nästa mätplats är vid en lågspänningsanläggnings servisintag (CAT IV), 230 V mot jord. Vilken märkning är tillräcklig?",
    "choices": [
     "CAT III 1 000 V",
     "CAT II 1 000 V",
     "CAT IV 600 V"
    ],
    "correct": 2,
    "hint": "Välj kategori för var du mäter, och kontrollera sedan spänningsmärkningen.",
    "why": "CAT IV 600 V passar den angivna CAT IV-miljön och spänningen. CAT III 1 000 V räcker inte här."
   },
   {
    "task": "Mätaren är CAT III 1 000 V. Sladdar och spetsar är bara CAT III 300 V. Får kombinationen användas vid 400 V mot jord i CAT III?",
    "choices": [
     "Ja, mätarens märkning avgör",
     "Nej, sladdarnas gräns är för låg"
    ],
    "correct": 1,
    "hint": "Den svagaste delen begränsar hela mätuppställningen.",
    "why": "Nej. Mätare, sladdar, spetsar och tillbehör måste alla passa mätplatsen och spänningen. Kontrollera även tillåtna spänningar mellan uttag."
   },
   {
    "task": "Kan en CAT II-mätare ha högre märkspänning än en CAT IV-mätare?",
    "choices": [
     "Ja, kategori och spänningsmärkning är två skilda krav",
     "Nej, högre CAT måste alltid ha högre volt-tal",
     "Ja, därför kan CAT II ersätta CAT IV"
    ],
    "correct": 0,
    "hint": "Till exempel CAT II 1 000 V och CAT IV 600 V. Läs alltid hela märkningen.",
    "why": "Ja. CAT II 1 000 V och CAT IV 600 V kan båda finnas. En högre CAT måste inte ha lägre märkspänning; konstruktion och provning avgör vilka kombinationer instrumentet är godkänt för."
   }
  ]
 },
 {
  "id": "stationA",
  "ovning": "EL-000353",
  "title": "Station A: DC-delare",
  "circuit": "station",
  "slides": "54",
  "goal": "Samma station som på den fysiska träffen (v41_03 bild 7): kontrollera instrumentet, mät R1 och R2 spänningslöst, mät spänningar och ström och jämför med dina beräkningar i labbprotokollet under simulatorn.",
  "steps": [
   {
    "task": "Instrumentkontroll: välj V ⎓ och V Ω. Mät på referensen: röd till Ref+ och svart till Ref−. Referensen är 5,000 V.",
    "hint": "Referensen är en känd källa, skild från riggen. Visar mätaren fel här kan du inte lita på resten av mätningarna. Samma princip som prova–mät–prova.",
    "test": "multimetersimulator.stationA.1",
    "why": "Mätaren visar 5,000 V inom sin noggrannhet ±(0,5 % + 2 siffror). Skriv det i protokollet. Gör samma kontroll efter sista mätningen."
   },
   {
    "task": "Förbered resistansmätningen: bryt matningen och öppna länken P–A. Kontrollera sedan i V ⎓ att det är 0 V över R1 (röd A, svart B).",
    "hint": "En frånslagen nätdel är fortfarande ansluten till kretsen. Med öppen länk är källan frånkopplad från R1 och R2. Kontrollera spänningslösheten innan du väljer Ω.",
    "test": "multimetersimulator.stationA.2",
    "why": "0 V över R1 och källan frånkopplad. Nu kan resistansen mätas utan att källan påverkar värdet."
   },
   {
    "task": "Mät R1: välj Ω och anslut spetsarna till A och B.",
    "hint": "Länken P–A ska vara öppen. Prova gärna i fri övning med sluten länk: då ser mätaren även den frånslagna källan och visar för lågt.",
    "test": "multimetersimulator.stationA.3",
    "why": "Det här är riggens verkliga R1. Jämför med 1 kΩ ±5 % och tänk på mätarens egen osäkerhet ±(0,8 % + 2 siffror)."
   },
   {
    "task": "Mät R2 mellan B och N på samma sätt.",
    "hint": "Toleransen ±5 % ger gränserna 1,900–2,100 kΩ. Ligger värdet nära en gräns kan mätarens osäkerhet avgöra.",
    "test": "multimetersimulator.stationA.4",
    "why": "Det här är riggens verkliga R2. Bedöm den i protokollet: inom, utanför eller kan inte avgöras."
   },
   {
    "task": "Slut länken P–A, välj V ⎓ och slå på matningen. Mät källspänningen: röd på P och svart på N.",
    "hint": "Källan är märkt med ett nominellt värde. Den verkliga spänningen kan avvika lite.",
    "test": "multimetersimulator.stationA.5",
    "why": "Källans verkliga spänning. Använd den i stället för det märkta värdet när du räknar förväntade spänningsfall."
   },
   {
    "task": "Mät spänningen över R1: röd på A och svart på B.",
    "hint": "Voltmetern kopplas parallellt över R1. Räkna först: U1 = Ukälla · R1/(R1 + R2).",
    "test": "multimetersimulator.stationA.6",
    "why": "Jämför med ditt förväntade värde. Räknar du med de uppmätta värdena blir avvikelsen liten."
   },
   {
    "task": "Mät spänningen över R2: röd på B och svart på N.",
    "hint": "Kontrollera sedan slinglagen: Ukälla − U1 − U2 ska bli nära noll.",
    "test": "multimetersimulator.stationA.7",
    "why": "Summan U1 + U2 ska vara lika med källspänningen, inom avläsningens upplösning."
   },
   {
    "task": "Mät strömmen. Bryt matningen. Öppna länken P–A, välj A ⎓ och flytta röd sladd till mA. Röd till P och svart till A. Slå på.",
    "hint": "Ampermetern ersätter länken så att strömmen går genom mätaren. Koppla om bara med bruten matning.",
    "test": "multimetersimulator.stationA.8",
    "why": "Strömmen genom seriekretsen. Jämför med Ukälla/(R1 + R2). mA-uttagets inre resistans påverkar nästan inte här."
   },
   {
    "task": "Avsluta: bryt matningen, flytta röd sladd till V Ω och slut länken P–A. Kontrollera sedan instrumentet mot referensen igen.",
    "hint": "Samma avslut som på den fysiska stationen. Nästa grupp ska inte få en rigg med öppen länk eller sladd i strömuttaget.",
    "test": "multimetersimulator.stationA.9",
    "why": "Riggen är återställd och instrumentet visar fortfarande rätt. Fyll i analysen i labbprotokollet under simulatorn."
   }
  ]
 }
];
