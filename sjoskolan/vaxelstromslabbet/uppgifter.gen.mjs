// GENERERAD FIL · ur sjoskolan/innehall (innehall.py bygg simulatorer). Redigera posterna i innehall/ovningar/, inte här.
// Räkna-först-uppgifter. Texten använder markeringen X_{L} (gemensamt/markering.mjs).
export const UPPGIFTER = [
 {
  "id": "period",
  "ovning": "EL-000309",
  "tab": "sinus",
  "title": "Period vid 400 Hz",
  "deck": "Periodtid",
  "theory": "period",
  "setup": {
   "dt": 0.5,
   "f": 400,
   "shape": "sinus",
   "showB": false,
   "t": 0.5,
   "urms": 115,
   "window": "auto"
  },
  "task": "Vissa fartyg har ett separat 400 Hz-nät för elektronik. Beräkna perioden T i millisekunder.",
  "ask": {
   "key": "T",
   "label": "T",
   "unit": "ms",
   "rel": 0.01
  },
  "mask": [
   "T",
   "ticks"
  ],
  "hint": "T = 1/f. Svaret i sekunder multipliceras med 1 000 för att få ms.",
  "mistakes": [
   {
    "v": 0.4,
    "msg": "Du har räknat f/1 000. Perioden är 1/f."
   }
  ]
 },
 {
  "id": "topp",
  "ovning": "EL-000310",
  "tab": "sinus",
  "title": "Toppvärde från effektivvärde",
  "deck": "Toppvärde och RMS",
  "theory": "rms",
  "setup": {
   "dt": 3,
   "f": 50,
   "shape": "sinus",
   "showB": false,
   "t": 5,
   "urms": 24,
   "window": "auto"
  },
  "task": "En sinusspänning har effektivvärdet 24 V. Beräkna toppvärdet û.",
  "ask": {
   "key": "peak",
   "label": "û",
   "unit": "V",
   "rel": 0.01
  },
  "mask": [
   "peak",
   "pp",
   "ut",
   "scale"
  ],
  "hint": "û = √2 · U. Toppvärdet ska bli större än effektivvärdet.",
  "mistakes": [
   {
    "v": 48,
    "msg": "Du har dubblat effektivvärdet (2 · 24 V). Toppvärdet är √2 · U, inte 2 · U."
   },
   {
    "v": 67.8823,
    "msg": "Det är topp till topp-värdet (2 · û). Frågan gäller toppvärdet û = √2 · U."
   }
  ]
 },
 {
  "id": "moment",
  "ovning": "EL-000311",
  "tab": "sinus",
  "title": "Momentanvärde",
  "deck": "Fördjupning: momentanvärde",
  "theory": "moment",
  "setup": {
   "dt": 3,
   "f": 50,
   "shape": "sinus",
   "showB": false,
   "t": 3,
   "urms": 10,
   "window": "auto"
  },
  "task": "U = 10 V RMS, f = 50 Hz. Beräkna u vid t = 3,0 ms. Räknaren i RAD.",
  "ask": {
   "key": "ut",
   "label": "u(3,0 ms)",
   "unit": "V",
   "rel": 0.02,
   "abs": 0.05
  },
  "mask": [
   "ut",
   "peak",
   "pp",
   "scale"
  ],
  "hint": "Beräkna först û = √2 · U. Sedan u = û · sin(2π · 50 · 0,003).",
  "mistakes": [
   {
    "v": 8.09017,
    "msg": "Du har använt effektivvärdet 10 V som amplitud. Amplituden är û = √2 · U."
   },
   {
    "v": 10,
    "msg": "Det är effektivvärdet. Momentanvärdet beror på tiden: u = û · sin(2πft)."
   },
   {
    "v": 14.1421,
    "msg": "Det är toppvärdet û. Multiplicera med sin(2πft) för tiden 3,0 ms."
   },
   {
    "v": 0.232618,
    "msg": "Räknaren står i DEG. Vinkeln 2πft är i radianer, ställ räknaren i RAD."
   }
  ]
 },
 {
  "id": "fas",
  "ovning": "EL-000312",
  "tab": "sinus",
  "title": "Fas från tidsavstånd",
  "deck": "Fördjupning: tid och fas",
  "theory": "fas",
  "setup": {
   "dt": 2.5,
   "f": 50,
   "shape": "sinus",
   "showB": true,
   "t": 5,
   "urms": 12,
   "window": "auto"
  },
  "task": "Två 50 Hz-signaler är förskjutna 2,5 ms. Beräkna fasvinkelns belopp i grader.",
  "ask": {
   "key": "phi",
   "label": "|φ|",
   "unit": "°",
   "abs": 0.6,
   "absolute": true
  },
  "mask": [
   "phi"
  ],
  "hint": "φ = 360° · Δt / T och T = 20 ms vid 50 Hz.",
  "mistakes": [
   {
    "v": 0.785398,
    "msg": "Svaret är i radianer. Frågan gäller grader: φ = 360° · Δt/T."
   }
  ]
 },
 {
  "id": "xl",
  "ovning": "EL-000313",
  "tab": "impedans",
  "title": "Spolens reaktans",
  "deck": "Spolens reaktans",
  "theory": "xl",
  "setup": {
   "C": 150,
   "L": 159,
   "R": 30,
   "U": 100,
   "f": 50,
   "kind": "RL"
  },
  "task": "L = 159 mH och f = 50 Hz. Beräkna X_{L}.",
  "ask": {
   "key": "XL",
   "label": "X_{L}",
   "unit": "Ω",
   "rel": 0.02
  },
  "mask": [
   "XL",
   "X",
   "Z",
   "I",
   "phi",
   "UR",
   "UL"
  ],
  "hint": "X_{L} = 2πfL. Omvandla först mH till H.",
  "mistakes": [
   {
    "v": 7.95,
    "msg": "Du har glömt 2π. X_{L} = 2πfL."
   }
  ]
 },
 {
  "id": "strom",
  "ovning": "EL-000314",
  "tab": "impedans",
  "title": "Ström i RL-krets",
  "deck": "Ström i RL-krets",
  "theory": "strom",
  "setup": {
   "C": 150,
   "L": 95.5,
   "R": 40,
   "U": 100,
   "f": 50,
   "kind": "RL"
  },
  "task": "U = 100 V RMS, R = 40 Ω och X_{L} ≈ 30 Ω i serie. Beräkna strömmen I.",
  "ask": {
   "key": "I",
   "label": "I",
   "unit": "A",
   "rel": 0.02
  },
  "mask": [
   "Z",
   "I",
   "UR",
   "UL",
   "phasorValues"
  ],
  "hint": "|Z| = √(R² + X_{L}²). Därefter I = U/|Z|. Addera inte R och X_{L} direkt.",
  "mistakes": [
   {
    "v": 1.42857,
    "msg": "Du har adderat R och X_{L} direkt. De ligger 90° isär: |Z| = √(R² + X_{L}²)."
   },
   {
    "v": 2.5,
    "msg": "Du har bara räknat med R. Spolens reaktans begränsar också strömmen."
   }
  ]
 },
 {
  "id": "rc",
  "ovning": "EL-000315",
  "tab": "impedans",
  "title": "Fasvinkel i RC-krets",
  "deck": "Fördjupning: RC-krets",
  "theory": "rc",
  "setup": {
   "C": 106.1,
   "L": 80,
   "R": 40,
   "U": 100,
   "f": 50,
   "kind": "RC"
  },
  "task": "R = 40 Ω och X_{C} ≈ 30 Ω i serie. Beräkna fasvinkeln φ med tecken.",
  "ask": {
   "key": "phi",
   "label": "φ",
   "unit": "°",
   "abs": 0.8
  },
  "mask": [
   "phi",
   "phasorValues",
   "character"
  ],
  "hint": "X = −X_{C} för kapacitiv reaktans. φ = arctan(X/R), räknaren i DEG.",
  "mistakes": [
   {
    "v": -0.643501,
    "msg": "Svaret är i radianer. Ställ räknaren i DEG."
   },
   {
    "v": -53.1301,
    "msg": "Du har räknat arctan(R/X). Fasvinkeln är arctan(X/R)."
   }
  ]
 },
 {
  "id": "resonans",
  "ovning": "EL-000316",
  "tab": "impedans",
  "title": "Resonansfrekvens",
  "deck": "Fördjupning: resonansfrekvens",
  "theory": "resonans",
  "setup": {
   "C": 150,
   "L": 50,
   "R": 20,
   "U": 100,
   "f": 40,
   "kind": "RLC"
  },
  "task": "L = 50 mH och C = 150 µF. Vid vilken frekvens blir X_{L} = X_{C}?",
  "ask": {
   "key": "f0",
   "label": "f_{0}",
   "unit": "Hz",
   "rel": 0.02
  },
  "mask": [
   "f0",
   "freqTicks"
  ],
  "hint": "f_{0} = 1/(2π√(LC)). Omvandla mH till H och µF till F först.",
  "mistakes": [
   {
    "v": 365.148,
    "msg": "Du har glömt 2π. Svaret är vinkelfrekvensen ω_{0} i rad/s, inte f_{0} i Hz."
   }
  ],
  "after": "Dra nu i f-reglaget och se att strömmen blir störst vid f_{0}."
 },
 {
  "id": "skenbar",
  "ovning": "EL-000317",
  "tab": "effekt",
  "title": "Skenbar effekt",
  "deck": "Skenbar effekt",
  "theory": "s",
  "setup": {
   "P": 1200,
   "Qc": 0,
   "Rcable": 0.2,
   "U": 230,
   "character": "induktiv",
   "f": 60,
   "pf": 0.75
  },
  "task": "En pump tar P = 1 200 W vid PF = 0,75. Beräkna den skenbara effekten S.",
  "ask": {
   "key": "S",
   "label": "S",
   "unit": "VA",
   "rel": 0.01
  },
  "mask": [
   "S",
   "I",
   "Q",
   "S2",
   "I2",
   "Q2",
   "QcFull",
   "triangleValues"
  ],
  "hint": "S = P/PF.",
  "mistakes": [
   {
    "v": 900,
    "msg": "Du har multiplicerat med PF. S är större än P: S = P/PF."
   }
  ]
 },
 {
  "id": "reaktiv",
  "ovning": "EL-000318",
  "tab": "effekt",
  "title": "Reaktiv effekt",
  "deck": "Exempel: reaktiv effekt från PF",
  "theory": "exempel",
  "setup": {
   "P": 1200,
   "Qc": 0,
   "Rcable": 0.2,
   "U": 230,
   "character": "induktiv",
   "f": 60,
   "pf": 0.75
  },
  "task": "Samma pump: P = 1 200 W och PF = 0,75. Beräkna den reaktiva effekten Q.",
  "ask": {
   "key": "Q",
   "label": "Q",
   "unit": "var",
   "rel": 0.01
  },
  "mask": [
   "Q",
   "Q2",
   "QcFull",
   "triangleValues"
  ],
  "hint": "Q = √(S² − P²) eller Q = P · tan φ.",
  "mistakes": [
   {
    "v": 400,
    "msg": "Du har räknat S − P. Effekterna adderas som visare: Q = √(S² − P²)."
   }
  ]
 },
 {
  "id": "matstrom",
  "ovning": "EL-000319",
  "tab": "effekt",
  "title": "Matningsström",
  "deck": "Ström och effektfaktor",
  "theory": "strom",
  "setup": {
   "P": 2300,
   "Qc": 0,
   "Rcable": 0.2,
   "U": 230,
   "character": "induktiv",
   "f": 60,
   "pf": 0.5
  },
  "task": "En last i byssan tar P = 2 300 W vid 230 V och PF = 0,50. Beräkna strömmen.",
  "ask": {
   "key": "I",
   "label": "I",
   "unit": "A",
   "rel": 0.01
  },
  "mask": [
   "I",
   "I2",
   "S",
   "S2",
   "loss",
   "loss2",
   "triangleValues"
  ],
  "hint": "I = P/(U · PF).",
  "mistakes": [
   {
    "v": 10,
    "msg": "Du har räknat P/U utan effektfaktorn. Strömmen bestäms av S: I = P/(U · PF)."
   }
  ]
 },
 {
  "id": "kompensering",
  "ovning": "EL-000320",
  "tab": "effekt",
  "title": "Full kompensation",
  "deck": "Fördjupning: kompensation",
  "theory": "kompensering",
  "setup": {
   "P": 2000,
   "Qc": 0,
   "Rcable": 0.2,
   "U": 230,
   "character": "induktiv",
   "f": 60,
   "pf": 0.8
  },
  "task": "P = 2 000 W, PF = 0,80 induktivt. Hur stor kapacitiv reaktiv effekt Q_{C} ger PF = 1? Ange beloppet.",
  "ask": {
   "key": "QcFull",
   "label": "|Q_{C}|",
   "unit": "var",
   "rel": 0.01,
   "absolute": true
  },
  "mask": [
   "QcFull",
   "Q",
   "Q2",
   "S",
   "S2",
   "triangleValues"
  ],
  "hint": "Kompensationen ska ta ut lastens induktiva Q. Q = P · tan(arccos 0,80).",
  "mistakes": [
   {
    "v": 2500,
    "msg": "Det är S, inte Q. Q = √(S² − P²)."
   }
  ],
  "after": "Dra nu Q_{C}-reglaget till ditt svar och se PF och strömmen efter kompensering."
 }
];

// Den guidade labbens uppgifter (grundprotokollet).
export const GUIDADE = [
 {
  "id": "kalibrator",
  "ovning": "EL-000337",
  "lesson": "sinus",
  "title": "Kontrollera båda mätarna",
  "source": "Kalibrator: 10,00 V RMS sinus, 50 Hz",
  "setup": {
   "dt": 3,
   "f": 50,
   "shape": "sinus",
   "showB": false,
   "t": 5,
   "urms": 10,
   "window": "auto"
  },
  "fields": [
   [
    "trms",
    "True RMS-mätare",
    "V"
   ],
   [
    "avg",
    "Sinuskalibrerad mätare",
    "V"
   ]
  ],
  "prompt": "Vilket värde ska varje mätare visa när den ideala kalibratorn ger 10,00 V sinus?",
  "method": "För ren sinus visar båda mätarna effektivvärdet. Här är det kalibratorns 10,00 V.",
  "theory": "matarna",
  "visual": "calibration",
  "explain": "Varför visar båda mätarna samma värde i denna kontroll?",
  "hint": "Ange kurvformen och vilket värde mätarna är avsedda att visa för den."
 },
 {
  "id": "grund-period",
  "ovning": "EL-000338",
  "lesson": "sinus",
  "title": "Läs av periodtiden",
  "source": "Grundkälla: 12,00 V RMS sinus, 50 Hz",
  "setup": {
   "dt": 3,
   "f": 50,
   "shape": "sinus",
   "showB": false,
   "t": 5,
   "urms": 12,
   "window": "auto"
  },
  "fields": [
   [
    "T",
    "Periodtid T",
    "ms"
   ]
  ],
  "prompt": "Hur lång tid tar en hel period vid 50 Hz? Svara i millisekunder.",
  "method": "T = 1/f i sekunder. T = 1 000/f i millisekunder. Exempel: 100 Hz ger 1 000/100 = 10 ms.",
  "theory": "period",
  "visual": "period",
  "explain": "Vilka två punkter i kurvan avgränsar en hel period?",
  "hint": "Beskriv två motsvarande punkter, till exempel två nollpassager i samma riktning."
 },
 {
  "id": "grund-topp",
  "ovning": "EL-000339",
  "lesson": "sinus",
  "title": "Jämför toppvärde och RMS",
  "source": "Grundkälla: 12,00 V RMS sinus, 50 Hz",
  "setup": {
   "dt": 3,
   "f": 50,
   "shape": "sinus",
   "showB": false,
   "t": 5,
   "urms": 12,
   "window": "auto"
  },
  "fields": [
   [
    "peak",
    "Toppvärde û",
    "V"
   ]
  ],
  "prompt": "Multimetern visar 12,00 V RMS. Vilket toppvärde förväntar du dig i kurvan?",
  "method": "För sinus: û = √2 · U. Exempel: 10,00 V RMS ger cirka 14,14 V i topp.",
  "theory": "rms",
  "visual": "peak",
  "explain": "Varför kan multimetern visa 12,00 V samtidigt som kurvan når ett högre värde?",
  "hint": "Använd begreppen effektivvärde och toppvärde. Vilket värde beskriver motsvarande värmeeffekt?"
 },
 {
  "id": "grund-xl",
  "ovning": "EL-000340",
  "lesson": "impedans",
  "title": "Beräkna spolens reaktans",
  "source": "RL: 12,00 V RMS, 50 Hz, R = 40 Ω, L = 95,5 mH",
  "setup": {
   "C": 150,
   "L": 95.5,
   "R": 40,
   "U": 12,
   "f": 50,
   "kind": "RL"
  },
  "fields": [
   [
    "XL",
    "Reaktans XL",
    "Ω"
   ]
  ],
  "prompt": "Hur stor reaktans ger spolen vid 50 Hz? Börja med att omvandla mH till H.",
  "method": "L = 95,5/1 000 = 0,0955 H. XL = 2πfL.",
  "theory": "xl",
  "visual": "rl",
  "explain": "Hur ändras spolens reaktans om frekvensen fördubblas?",
  "hint": "L hålls konstant. Läs hur f ingår i XL = 2πfL."
 },
 {
  "id": "grund-z",
  "ovning": "EL-000341",
  "lesson": "impedans",
  "title": "Beräkna impedansens belopp",
  "source": "RL: R = 40 Ω och XL ≈ 30 Ω vid 50 Hz",
  "setup": {
   "C": 150,
   "L": 95.5,
   "R": 40,
   "U": 12,
   "f": 50,
   "kind": "RL"
  },
  "fields": [
   [
    "Z",
    "Impedansens belopp |Z|",
    "Ω"
   ]
  ],
  "prompt": "Beräkna kretsens impedans när R = 40 Ω och XL ≈ 30 Ω.",
  "method": "|Z| = √(R² + XL²). Rita R och XL vinkelrätt och beräkna diagonalen.",
  "theory": "z",
  "visual": "triangle",
  "explain": "Varför använder vi inte 40 + 30 för impedansens belopp?",
  "hint": "Beskriv hur resistiv och reaktiv del ligger i diagrammet."
 },
 {
  "id": "grund-strom",
  "ovning": "EL-000342",
  "lesson": "impedans",
  "title": "Jämför strömmen med och utan spole",
  "source": "RL: 12,00 V RMS och |Z| ≈ 50 Ω. Enbart R: 40 Ω.",
  "setup": {
   "C": 150,
   "L": 95.5,
   "R": 40,
   "U": 12,
   "f": 50,
   "kind": "RL"
  },
  "fields": [
   [
    "I",
    "Ström i RL-kretsen",
    "A"
   ]
  ],
  "prompt": "Beräkna strömmen i RL-kretsen. Med endast resistorn skulle strömmen vara 0,30 A.",
  "method": "I = U/|Z|. Använd hela impedansen för RL-kretsen.",
  "theory": "strom",
  "visual": "rl",
  "explain": "Hur ändras strömmens storlek och fas när spolen läggs till?",
  "hint": "Jämför med 0,30 A. Ange vilken kurva som når sin topp först."
 },
 {
  "id": "grund-pf1",
  "ovning": "EL-000343",
  "lesson": "effekt",
  "title": "Ström vid effektfaktorn 1,00",
  "source": "Enfas: U = 230 V RMS, P = 1 150 W, PF = 1,00",
  "setup": {
   "P": 1150,
   "Qc": 0,
   "Rcable": 0,
   "U": 230,
   "character": "induktiv",
   "f": 50,
   "pf": 1
  },
  "fields": [
   [
    "I",
    "Matningsström I",
    "A"
   ]
  ],
  "prompt": "Hur stor ström krävs när effektfaktorn är 1,00?",
  "method": "I = P/(U · PF). Vid PF = 1 blir detta P/U.",
  "theory": "resistiv",
  "visual": "power",
  "explain": "Vad betyder effektfaktorn 1,00 i vår resistiva sinusmodell?",
  "hint": "Beskriv förhållandet mellan P och S samt kurvornas fas."
 },
 {
  "id": "grund-pf05",
  "ovning": "EL-000344",
  "lesson": "effekt",
  "title": "Samma aktiva effekt, lägre effektfaktor",
  "source": "Enfas: U = 230 V RMS, P = 1 150 W, PF = 0,50",
  "setup": {
   "P": 1150,
   "Qc": 0,
   "Rcable": 0,
   "U": 230,
   "character": "induktiv",
   "f": 50,
   "pf": 0.5
  },
  "fields": [
   [
    "I",
    "Matningsström I",
    "A"
   ]
  ],
  "prompt": "U och P är oförändrade. Hur stor ström krävs vid PF = 0,50?",
  "method": "I = P/(U · PF). Skriv hela nämnaren inom parentes.",
  "theory": "strom",
  "visual": "power",
  "explain": "Jämför med PF = 1,00. Vad ändrades och vad var oförändrat?",
  "hint": "Ange de två strömmarna. Skilj matningsström från lastens aktiva effekt."
 }
];
