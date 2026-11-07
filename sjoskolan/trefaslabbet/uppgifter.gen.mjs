// GENERERAD FIL · ur sjoskolan/innehall (innehall.py bygg simulatorer). Redigera posterna i innehall/ovningar/, inte här.
// Räkna-först-uppgifter. Texten använder markeringen X_{L} (gemensamt/markering.mjs).
export const UPPGIFTER = [
 {
  "id": "uf",
  "ovning": "EL-000301",
  "tab": "visare",
  "title": "Fasspänning vid 690 V",
  "deck": "v41_01 · bild 7 och övning 3",
  "setup": {
   "I1": 12,
   "I2": 9,
   "I3": 6,
   "UL": 690,
   "f": 60,
   "phi": 0
  },
  "task": "Ett 690 V-nät ombord är symmetriskt. Beräkna fasspänningen U_{F}, det vill säga spänningen över en generatorlindning i Y.",
  "ask": {
   "key": "UF",
   "label": "U_{F}",
   "unit": "V",
   "rel": 0.01
  },
  "mask": [
   "UF"
  ],
  "hint": "U_{F} = U_{L}/√3.",
  "solution": "U_{F} = U_{L}/√3 = 690/1,732 ≈ 398 V.",
  "mistakes": [
   {
    "v": 1195.12,
    "msg": "Du har multiplicerat med √3. Fasspänningen är mindre än linjespänningen."
   },
   {
    "v": 345,
    "msg": "Du har delat med 2. Faktorn är √3, inte 2."
   }
  ]
 },
 {
  "id": "in2",
  "ovning": "EL-000302",
  "tab": "visare",
  "title": "Två lika faslaster",
  "deck": "v41_01 · bild 24 och övning 8",
  "setup": {
   "I1": 12,
   "I2": 12,
   "I3": 0,
   "UL": 400,
   "f": 50,
   "phi": 0
  },
  "task": "I_{1} = I_{2} = 12 A med 120° emellan. I_{3} = 0. Beräkna neutralströmmens belopp.",
  "ask": {
   "key": "IN",
   "label": "|I_{N}|",
   "unit": "A",
   "rel": 0.01
  },
  "mask": [
   "IN",
   "sumValues"
  ],
  "hint": "I_{N} = √(I_{1}² + I_{2}² + 2I_{1}I_{2} cos 120°) och cos 120° = −0,5.",
  "solution": "I_{N} = √(12² + 12² + 2·12·12·(−0,5)) = √144 = 12 A. Två lika strömmar 120° isär ger en summa lika stor som var och en.",
  "mistakes": [
   {
    "v": 24,
    "msg": "Du har adderat beloppen. Strömmarna är visare med 120° mellan sig."
   },
   {
    "v": 0,
    "msg": "Neutralströmmen blir noll bara när alla tre faser är lika belastade."
   }
  ]
 },
 {
  "id": "in3",
  "ovning": "EL-000303",
  "tab": "visare",
  "title": "Osymmetrisk last",
  "deck": "v41_01 · bild 22 och övning 6–8",
  "setup": {
   "I1": 12,
   "I2": 8,
   "I3": 8,
   "UL": 400,
   "f": 50,
   "phi": 0
  },
  "task": "I_{1} = 12 A, I_{2} = I_{3} = 8 A, alla resistiva. Beräkna neutralströmmens belopp.",
  "ask": {
   "key": "IN",
   "label": "|I_{N}|",
   "unit": "A",
   "rel": 0.01
  },
  "mask": [
   "IN",
   "sumValues"
  ],
  "hint": "Den symmetriska delen (8 A i varje fas) ger noll. Det som blir kvar är överskottet i L1.",
  "solution": "8 A i alla tre faser tar ut varandra. Kvar blir 12 − 8 = 4 A i L1, alltså I_{N} = 4 A.",
  "mistakes": [
   {
    "v": 28,
    "msg": "Du har adderat beloppen. Summan måste göras med visare."
   }
  ]
 },
 {
  "id": "bruten",
  "ovning": "EL-000304",
  "tab": "neutral",
  "title": "Bruten neutralledare",
  "deck": "v41_01 · bild 22 och övning 10",
  "setup": {
   "R1": 23,
   "R2": 46,
   "R3": 92,
   "UL": 400,
   "neutral": false,
   "on1": true,
   "on2": true,
   "on3": false
  },
  "task": "Två laster, 23 Ω på L1 och 46 Ω på L2, har gemensam stjärnpunkt. L3 är obelastad och neutralledaren är bruten. Beräkna spänningen över lasten på L2.",
  "ask": {
   "key": "U2",
   "label": "U över 46 Ω",
   "unit": "V",
   "rel": 0.01
  },
  "mask": [
   "U1",
   "U2",
   "U3",
   "I1",
   "I2",
   "shift",
   "phasorValues"
  ],
  "hint": "Utan neutralledare ligger de två lasterna i serie mellan L1 och L2, alltså över 400 V. Dela spänningen i förhållande till resistanserna.",
  "solution": "Lasterna ligger i serie över U_{L} = 400 V. I = 400/(23 + 46) ≈ 5,80 A. U över 46 Ω = 5,80 · 46 ≈ 267 V, mer än U_{F} = 231 V.",
  "mistakes": [
   {
    "v": 230.94,
    "msg": "Det gäller bara med hel neutralledare. Nu ligger lasterna i serie över linjespänningen."
   },
   {
    "v": 133.333,
    "msg": "Det är spänningen över 23 Ω-lasten. Frågan gäller lasten på 46 Ω."
   }
  ]
 },
 {
  "id": "inr",
  "ovning": "EL-000305",
  "tab": "neutral",
  "title": "Neutralström med två laster",
  "deck": "v41_01 · bild 21–22",
  "setup": {
   "R1": 23,
   "R2": 46,
   "R3": 92,
   "UL": 400,
   "neutral": true,
   "on1": true,
   "on2": true,
   "on3": false
  },
  "task": "Samma två laster, nu med hel neutralledare. Beräkna neutralströmmen.",
  "ask": {
   "key": "IN",
   "label": "I_{N}",
   "unit": "A",
   "rel": 0.02
  },
  "mask": [
   "IN",
   "I1",
   "I2",
   "phasorValues"
  ],
  "hint": "Varje last får U_{F} ≈ 231 V. Räkna I_{1} och I_{2} och summera dem som visare med 120° emellan.",
  "solution": "I_{1} = 231/23 ≈ 10,0 A och I_{2} = 231/46 ≈ 5,02 A. I_{N} = √(10,0² + 5,02² + 2·10,0·5,02·(−0,5)) ≈ 8,69 A.",
  "mistakes": [
   {
    "v": 15.0613,
    "msg": "Du har adderat beloppen. Strömmarna ligger 120° isär."
   },
   {
    "v": 5.02044,
    "msg": "Nästan: men vinkeln mellan strömmarna är 120°, inte 180°."
   }
  ]
 },
 {
  "id": "ystrom",
  "ovning": "EL-000306",
  "tab": "ydelta",
  "title": "Linjeström i Y",
  "deck": "v41_02 · övning 1–2",
  "setup": {
   "UL": 690,
   "Z": 30,
   "conn": "Y",
   "pf": 1,
   "plate": "ingen"
  },
  "task": "Tre lika resistorer på 30 Ω kopplas i Y till 690 V linjespänning. Beräkna linjeströmmen.",
  "ask": {
   "key": "IL",
   "label": "I_{L}",
   "unit": "A",
   "rel": 0.01
  },
  "mask": [
   "IL",
   "Igren",
   "Ugren",
   "S",
   "P",
   "Q",
   "PkW"
  ],
  "hint": "U_{gren} = U_{L}/√3. I Y är linjeströmmen lika med grenströmmen.",
  "solution": "U_{gren} = 690/√3 ≈ 398 V. I_{L} = I_{gren} = 398/30 ≈ 13,3 A.",
  "mistakes": [
   {
    "v": 23,
    "msg": "Du har lagt hela linjespänningen över en gren. I Y får grenen U_{L}/√3."
   }
  ]
 },
 {
  "id": "dstrom",
  "ovning": "EL-000307",
  "tab": "ydelta",
  "title": "Linjeström i Δ",
  "deck": "v41_02 · bild 7 och övning 3",
  "setup": {
   "UL": 690,
   "Z": 46,
   "conn": "Δ",
   "pf": 1,
   "plate": "ingen"
  },
  "task": "Tre lika resistorer på 46 Ω kopplas i Δ till 690 V. Beräkna linjeströmmen.",
  "ask": {
   "key": "IL",
   "label": "I_{L}",
   "unit": "A",
   "rel": 0.01
  },
  "mask": [
   "IL",
   "Igren",
   "S",
   "P",
   "Q",
   "PkW"
  ],
  "hint": "I Δ ligger hela U_{L} över grenen. Linjeströmmen är √3 gånger grenströmmen.",
  "solution": "U_{gren} = U_{L} = 690 V. I_{gren} = 690/46 = 15 A. I_{L} = √3 · 15 ≈ 26,0 A.",
  "mistakes": [
   {
    "v": 15,
    "msg": "Det är grenströmmen. Linjeströmmen i Δ är √3 gånger större."
   },
   {
    "v": 45,
    "msg": "Faktorn är √3, inte 3."
   }
  ]
 },
 {
  "id": "p3",
  "ovning": "EL-000308",
  "tab": "ydelta",
  "title": "Trefaseffekt",
  "deck": "v41_02 · bild 8 och övning 4",
  "setup": {
   "UL": 440,
   "Z": 30.48,
   "conn": "Δ",
   "pf": 0.85,
   "plate": "440/760"
  },
  "task": "En symmetrisk last ombord: U_{L} = 440 V, I_{L} = 25 A och cos φ = 0,85. Beräkna aktiv effekt i kW.",
  "ask": {
   "key": "PkW",
   "label": "P",
   "unit": "kW",
   "rel": 0.02
  },
  "mask": [
   "S",
   "P",
   "Q",
   "PkW"
  ],
  "hint": "P = √3 · U_{L} · I_{L} · cos φ. Dela med 1 000 för kW.",
  "solution": "P = √3 · 440 · 25 · 0,85 ≈ 16 190 W ≈ 16,2 kW.",
  "mistakes": [
   {
    "v": 9.35,
    "msg": "Faktorn √3 saknas. Den behövs när linjevärden används."
   },
   {
    "v": 28.05,
    "msg": "Med linjespänning används √3, inte 3. Faktorn 3 gäller fasvärden."
   }
  ]
 }
];
