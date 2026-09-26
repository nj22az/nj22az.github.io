// GENERERAD FIL · ur sjoskolan/innehall/beteckningar.json (innehall.py bygg). Redigera inte här.
export const BETECKNINGAR = [
 {
  "id": "ac",
  "visa": "AC",
  "former": [
   "AC",
   "AC-läge",
   "AC-källa"
  ],
  "namn": "växelström, växelspänning",
  "utlasning": "engelska: alternating current",
  "forklaring": "Ström eller spänning som byter riktning hela tiden, till exempel 230 V i ett eluttag. På multimetern står läget ofta som V~ eller AC."
 },
 {
  "id": "dc",
  "visa": "DC",
  "former": [
   "DC",
   "DC-innehåll"
  ],
  "namn": "likström, likspänning",
  "utlasning": "engelska: direct current",
  "forklaring": "Ström eller spänning med samma riktning hela tiden, till exempel från ett batteri. På multimetern V⎓ eller DC."
 },
 {
  "id": "f",
  "visa": "f",
  "former": [
   "f"
  ],
  "formel": true,
  "namn": "frekvens",
  "forklaring": "Antal hela perioder per sekund.",
  "enhet": "Hz"
 },
 {
  "id": "hz",
  "visa": "Hz",
  "former": [
   "Hz",
   "kHz"
  ],
  "namn": "hertz",
  "forklaring": "Enheten för frekvens: 1 Hz är en period per sekund. Elnätet ombord är ofta 50 eller 60 Hz. 1 kHz = 1 000 Hz."
 },
 {
  "id": "t-period",
  "visa": "T",
  "former": [
   "T"
  ],
  "formel": true,
  "namn": "periodtid",
  "forklaring": "Tiden för en hel period. T = 1/f.",
  "enhet": "s eller ms",
  "exempel": "50 Hz ger T = 20 ms."
 },
 {
  "id": "ms",
  "visa": "ms",
  "former": [
   "ms"
  ],
  "namn": "millisekund",
  "forklaring": "En tusendels sekund: 1 ms = 0,001 s."
 },
 {
  "id": "t",
  "visa": "t",
  "former": [
   "t"
  ],
  "formel": true,
  "namn": "tidpunkt",
  "forklaring": "Tiden räknad från en stigande nollpassage.",
  "enhet": "s"
 },
 {
  "id": "u-t",
  "visa": "u(t)",
  "former": [
   "u(t)",
   "u"
  ],
  "formel": true,
  "namn": "momentanvärde",
  "forklaring": "Spänningen i ett visst ögonblick t. Liten bokstav u betyder ett värde som ändras med tiden.",
  "enhet": "V"
 },
 {
  "id": "topp",
  "visa": "û",
  "former": [
   "û"
  ],
  "namn": "toppvärde",
  "utlasning": "u med hatt",
  "forklaring": "Spänningens högsta värde räknat från noll. För sinus är û = √2 · U.",
  "enhet": "V"
 },
 {
  "id": "upp",
  "visa": "U_{pp}",
  "former": [
   "Upp",
   "U_{pp}",
   "Upp-"
  ],
  "namn": "topp till topp-värde",
  "utlasning": "pp, engelska: peak to peak",
  "forklaring": "Från den negativa toppen till den positiva: U_{pp} = 2 · û. Det du läser direkt på ett oscilloskop.",
  "enhet": "V"
 },
 {
  "id": "rms",
  "visa": "RMS",
  "former": [
   "RMS",
   "U_{RMS}",
   "URMS",
   "U_{rms}",
   "Urms"
  ],
  "namn": "effektivvärde",
  "utlasning": "engelska: root mean square, som betyder kvadratiskt medelvärde",
  "forklaring": "Det värde som ger samma värme i en resistor som en lika stor likspänning. När en spänning anges utan annat, till exempel 230 V eller 12,00 V RMS, är det effektivvärdet. Multimetern visar effektivvärdet.",
  "enhet": "V eller A"
 },
 {
  "id": "true-rms",
  "visa": "true RMS",
  "former": [
   "true RMS",
   "true RMS-mätare",
   "True RMS"
  ],
  "namn": "äkta effektivvärde",
  "forklaring": "En true RMS-mätare räknar fram det verkliga effektivvärdet för alla kurvformer. En enklare, sinuskalibrerad mätare visar rätt bara för ren sinus."
 },
 {
  "id": "medel",
  "visa": "U_{medel}",
  "former": [
   "Umedel",
   "U_{medel}"
  ],
  "namn": "medelvärde",
  "forklaring": "Genomsnittet över en hel period. För en symmetrisk sinus är det 0 V, trots att den kan ge effekt.",
  "enhet": "V"
 },
 {
  "id": "phi",
  "visa": "φ",
  "former": [
   "φ",
   "|φ|"
  ],
  "namn": "fasvinkel (fi)",
  "forklaring": "Hur mycket en kurva ligger före eller efter en annan, i grader. Mellan spänning och ström: positiv φ betyder att strömmen släpar (induktiv last).",
  "enhet": "°"
 },
 {
  "id": "dt",
  "visa": "Δt",
  "former": [
   "Δt"
  ],
  "namn": "tidsskillnad (delta t)",
  "forklaring": "Tiden mellan motsvarande punkter på två kurvor. Δ (delta) betyder skillnad.",
  "enhet": "ms"
 },
 {
  "id": "pi",
  "visa": "π",
  "former": [
   "π",
   "2π",
   "2πf",
   "2πft",
   "2πfL",
   "2πfC"
  ],
  "namn": "pi",
  "forklaring": "Talet π ≈ 3,1416. 2π radianer är ett helt varv, 360°."
 },
 {
  "id": "rad",
  "visa": "RAD",
  "former": [
   "RAD"
  ],
  "efter_tal": [
   "rad"
  ],
  "namn": "radianer (räknarens läge)",
  "forklaring": "Räknarens vinkelläge när vinkeln anges i radianer. Används i u(t) = û · sin(2πft), eftersom 2πft blir radianer."
 },
 {
  "id": "deg",
  "visa": "DEG",
  "former": [
   "DEG"
  ],
  "namn": "grader (räknarens läge)",
  "utlasning": "engelska: degrees",
  "forklaring": "Räknarens vinkelläge när vinkeln anges i grader, till exempel för fasvinkeln φ = arctan(X/R)."
 },
 {
  "id": "r",
  "visa": "R",
  "former": [
   "R"
  ],
  "formel": true,
  "namn": "resistans",
  "forklaring": "Resistorns motstånd mot ström. Beror inte på frekvensen.",
  "enhet": "Ω (ohm)"
 },
 {
  "id": "l",
  "visa": "L",
  "former": [
   "L"
  ],
  "formel": true,
  "namn": "induktans",
  "forklaring": "Spolens egenskap. Ju större L, desto mer motverkar spolen ändringar i strömmen.",
  "enhet": "H (henry)"
 },
 {
  "id": "henry",
  "visa": "H, mH",
  "former": [
   "mH"
  ],
  "efter_tal": [
   "H"
  ],
  "namn": "henry, millihenry",
  "forklaring": "Enheten för induktans. 1 mH = 0,001 H. Räkna alltid om till H innan du sätter in i X_{L} = 2πfL."
 },
 {
  "id": "c",
  "visa": "C",
  "former": [
   "C"
  ],
  "formel": true,
  "namn": "kapacitans",
  "forklaring": "Kondensatorns förmåga att lagra laddning.",
  "enhet": "F (farad)"
 },
 {
  "id": "farad",
  "visa": "F, µF",
  "former": [
   "µF"
  ],
  "efter_tal": [
   "F"
  ],
  "namn": "farad, mikrofarad",
  "forklaring": "Enheten för kapacitans. 1 µF = 0,000001 F. Räkna om till F innan du sätter in i X_{C} = 1/(2πfC)."
 },
 {
  "id": "x",
  "visa": "X",
  "former": [
   "X"
  ],
  "formel": true,
  "namn": "reaktans (netto)",
  "forklaring": "Den del av motståndet som kommer från spolar och kondensatorer. I serie: X = X_{L} − X_{C}.",
  "enhet": "Ω"
 },
 {
  "id": "xl",
  "visa": "X_{L}",
  "former": [
   "X_{L}",
   "XL",
   "Xᴸ"
  ],
  "namn": "induktiv reaktans (spolens reaktans)",
  "forklaring": "Spolens motstånd mot växelström. Växer med frekvensen: X_{L} = 2πfL. L står för spole (induktans).",
  "enhet": "Ω"
 },
 {
  "id": "xc",
  "visa": "X_{C}",
  "former": [
   "X_{C}",
   "XC",
   "Xᶜ"
  ],
  "namn": "kapacitiv reaktans (kondensatorns reaktans)",
  "forklaring": "Kondensatorns motstånd mot växelström. Minskar när frekvensen ökar: X_{C} = 1/(2πfC). C står för kondensator (kapacitans).",
  "enhet": "Ω"
 },
 {
  "id": "z",
  "visa": "|Z|",
  "former": [
   "|Z|",
   "Z"
  ],
  "namn": "impedans (belopp)",
  "forklaring": "Kretsens totala motstånd mot växelström, där R och X räknas vinkelrätt: |Z| = √(R² + X²). Strecken betyder belopp (storlek).",
  "enhet": "Ω"
 },
 {
  "id": "rl",
  "visa": "RL",
  "former": [
   "RL",
   "RL-krets",
   "RL-kretsen",
   "RL-last"
  ],
  "namn": "RL-krets",
  "forklaring": "En krets med resistor (R) och spole (L) i serie. Strömmen släpar efter spänningen."
 },
 {
  "id": "rc",
  "visa": "RC",
  "former": [
   "RC",
   "RC-krets",
   "RC-kretsen"
  ],
  "namn": "RC-krets",
  "forklaring": "En krets med resistor (R) och kondensator (C) i serie. Strömmen leder före spänningen."
 },
 {
  "id": "rlc",
  "visa": "RLC",
  "former": [
   "RLC",
   "RLC-krets"
  ],
  "namn": "RLC-krets",
  "forklaring": "Resistor, spole och kondensator i serie. Vid resonans tar spolens och kondensatorns reaktans ut varandra."
 },
 {
  "id": "ur",
  "visa": "U_{R}",
  "former": [
   "U_{R}",
   "UR",
   "Uᴿ"
  ],
  "namn": "spänningen över resistorn",
  "forklaring": "U_{R} = I · R. Ligger i fas med strömmen.",
  "enhet": "V"
 },
 {
  "id": "ul-spole",
  "visa": "U_{L}",
  "former": [
   "U_{L}",
   "UL",
   "Uᴸ"
  ],
  "namn": "spänningen över spolen (vecka 40)",
  "forklaring": "U_{L} = I · X_{L}. Ligger 90° före strömmen. U_{R} och U_{L} adderas vinkelrätt, inte direkt.",
  "enhet": "V",
  "obs": "Från vecka 41 betyder U_{L} i stället linjespänning (huvudspänning) i trefas. Se alltid vad texten säger."
 },
 {
  "id": "uc",
  "visa": "U_{C}",
  "former": [
   "U_{C}",
   "UC",
   "Uᶜ"
  ],
  "namn": "spänningen över kondensatorn",
  "forklaring": "U_{C} = I · X_{C}. Ligger 90° efter strömmen.",
  "enhet": "V"
 },
 {
  "id": "f0",
  "visa": "f_{0}",
  "former": [
   "f_{0}",
   "f₀",
   "f0"
  ],
  "namn": "resonansfrekvens",
  "forklaring": "Frekvensen där X_{L} = X_{C}. Då är |Z| = R och strömmen störst: f_{0} = 1/(2π√(L · C)).",
  "enhet": "Hz"
 },
 {
  "id": "j",
  "visa": "j",
  "former": [
   "j",
   "jX"
  ],
  "formel": true,
  "namn": "imaginär enhet (komplex form)",
  "forklaring": "I Z = R + jX markerar j att reaktansen X ligger vinkelrätt mot R. Fördjupning, inte grundkrav."
 },
 {
  "id": "p",
  "visa": "P",
  "former": [
   "P"
  ],
  "formel": true,
  "namn": "aktiv effekt",
  "forklaring": "Den effekt som verkligen blir värme eller arbete.",
  "enhet": "W (watt), kW"
 },
 {
  "id": "q",
  "visa": "Q",
  "former": [
   "Q",
   "|Q|"
  ],
  "formel": true,
  "namn": "reaktiv effekt",
  "forklaring": "Effekt som pendlar fram och tillbaka mellan källan och spolar eller kondensatorer utan att förbrukas. Ger ändå ström i ledningarna.",
  "enhet": "var, kvar"
 },
 {
  "id": "s",
  "visa": "S",
  "former": [
   "S"
  ],
  "formel": true,
  "namn": "skenbar effekt",
  "forklaring": "Spänning gånger ström: S = U · I. Det som kablar och generatorer måste dimensioneras för.",
  "enhet": "VA, kVA"
 },
 {
  "id": "va",
  "visa": "VA, kVA",
  "former": [
   "VA",
   "kVA"
  ],
  "namn": "voltampere",
  "forklaring": "Enheten för skenbar effekt S. 1 kVA = 1 000 VA."
 },
 {
  "id": "var",
  "visa": "var, kvar",
  "former": [
   "kvar"
  ],
  "efter_tal": [
   "var"
  ],
  "namn": "voltampere reaktiv",
  "forklaring": "Enheten för reaktiv effekt Q. 1 kvar = 1 000 var. Skrivs med små bokstäver."
 },
 {
  "id": "pf",
  "visa": "PF",
  "former": [
   "PF",
   "PF-värde"
  ],
  "namn": "effektfaktor",
  "utlasning": "engelska: power factor",
  "forklaring": "Hur stor del av den skenbara effekten som är aktiv: PF = P/S, ett tal mellan 0 och 1. Lägre PF ger större ström för samma aktiva effekt."
 },
 {
  "id": "cosphi",
  "visa": "cos φ",
  "former": [
   "cos φ"
  ],
  "namn": "cosinus fi",
  "forklaring": "Cosinus av fasvinkeln mellan spänning och ström. För ren sinus är cos φ = PF, därför står cos φ ofta på motorernas märkskylt."
 },
 {
  "id": "qc",
  "visa": "Q_{C}",
  "former": [
   "Q_{C}",
   "Qᶜ",
   "Qc",
   "QC"
  ],
  "namn": "kompenseringens reaktiva effekt",
  "forklaring": "Den reaktiva effekt som en kondensator lämnar och som tar ut en del av lastens induktiva Q.",
  "enhet": "var"
 },
 {
  "id": "selv",
  "visa": "SELV",
  "former": [
   "SELV",
   "SELV-rigg",
   "SELV-riggen"
  ],
  "namn": "skyddsklenspänning",
  "utlasning": "engelska: safety extra-low voltage",
  "forklaring": "Låg spänning (högst 50 V AC eller 120 V DC) som är skild från farligare kretsar med dokumenterad separation. Kursens övningsriggar är SELV."
 },
 {
  "id": "cat",
  "visa": "CAT",
  "former": [
   "CAT",
   "CAT II",
   "CAT III",
   "CAT IV"
  ],
  "namn": "mätkategori",
  "utlasning": "engelska: category",
  "forklaring": "Anger vilken mätmiljö ett instrument är provat för: CAT II uttag, CAT III fast installation, CAT IV matningens början."
 },
 {
  "id": "it-nat",
  "visa": "IT-nät",
  "former": [
   "IT",
   "IT-nät"
  ],
  "namn": "isolerat nät",
  "utlasning": "franska: isolé–terre",
  "forklaring": "Nät utan direkt förbindelse mellan systemet och jord eller skrov. Vanligt ombord. Behandlas i vecka 44."
 }
];
