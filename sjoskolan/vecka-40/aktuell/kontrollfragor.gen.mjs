// GENERERAD FIL · ur sjoskolan/innehall (innehall.py bygg simulatorer). Redigera posterna i innehall/ovningar/, inte här.
// Prova själv-frågorna i genomgångarna. lektioner.mjs lägger in dem på rätt bild.
export const KONTROLLFRAGOR = [
 {
  "del": "effekt",
  "bild": "eget",
  "ovning": "EL-000508",
  "title": "Eget försök med andra värden: effekt och effektfaktor",
  "check": "Räkna innan facit visas.",
  "answer": "I = 30,00 A. S = 6 900 VA. P hålls oförändrad i modellen."
 },
 {
  "del": "effekt",
  "bild": "tur-effekt",
  "ovning": "EL-000867",
  "title": "Din tur: kylskåpets kompressor",
  "check": "Kylskåpets kompressor tar P = 150 W vid U = 230 V och PF = 0,60. Räkna S, I och Q.",
  "answer": "S = 150/0,60 = 250 VA. I = 250/230 ≈ 1,09 A. Q = √(250² − 150²) = 200 var."
 },
 {
  "del": "impedans",
  "bild": "xl",
  "ovning": "EL-000505",
  "title": "Reaktans och enheter",
  "check": "Hur många henry är 100 mH?",
  "answer": "100 mH = 0,100 H."
 },
 {
  "del": "impedans",
  "bild": "strom",
  "ovning": "EL-000506",
  "title": "Strömmen med spolen inkopplad",
  "check": "Varför räcker inte 12/40 när spolen är med?",
  "answer": "Spolens reaktans ingår också i impedansen."
 },
 {
  "del": "impedans",
  "bild": "eget",
  "ovning": "EL-000507",
  "title": "Eget försök med andra värden: spole, motstånd och ström",
  "check": "Räkna innan facit visas.",
  "answer": "|Z| = 150 Ω. I ≈ 1,53 A. Strömmen släpar."
 },
 {
  "del": "impedans",
  "bild": "tur-z",
  "ovning": "EL-000865",
  "title": "Din tur: ventilationsfläkten",
  "check": "En ventilationsfläkt har R = 110 Ω och X_{L} = 45 Ω och ligger på 230 V RMS. Räkna impedansen |Z| och strömmen I.",
  "answer": "|Z| = √(110² + 45²) ≈ 118,8 Ω. I = 230/118,8 ≈ 1,94 A."
 },
 {
  "del": "impedans",
  "bild": "tur-fas",
  "ovning": "EL-000866",
  "title": "Din tur: fläktens fasvinkel",
  "check": "Samma fläkt: R = 110 Ω och X_{L} = 45 Ω. Räkna fasvinkeln φ med räknaren i DEG. Leder eller släpar strömmen?",
  "answer": "φ = arctan(45/110) ≈ 22,2°. Strömmen släpar efter spänningen."
 },
 {
  "del": "sinus",
  "bild": "period",
  "ovning": "EL-000501",
  "title": "Periodtid och frekvens",
  "check": "Vid 100 Hz: blir perioden längre eller kortare?",
  "answer": "Kortare. T = 1 000/100 = 10 ms."
 },
 {
  "del": "sinus",
  "bild": "topp",
  "ovning": "EL-000502",
  "title": "Toppvärde och topp till topp",
  "check": "Om U_{pp} = 20 V, hur stort är û?",
  "answer": "û = 20/2 = 10 V."
 },
 {
  "del": "sinus",
  "bild": "medel",
  "ovning": "EL-000503",
  "title": "Medelvärde och RMS är olika",
  "check": "Betyder 0 V i medelvärde att källan inte kan ge effekt?",
  "answer": "Nej. Effekten i en resistor beror på spänningen i kvadrat."
 },
 {
  "del": "sinus",
  "bild": "eget",
  "ovning": "EL-000504",
  "title": "Eget försök med andra värden: sinus och mätvärden",
  "check": "Räkna innan facit visas.",
  "answer": "T ≈ 8,33 ms. û ≈ 67,88 V. Multimetern visar 48,00 V."
 },
 {
  "del": "sinus",
  "bild": "tur-topp",
  "ovning": "EL-000863",
  "title": "Din tur: belysningsnätet ombord",
  "check": "Belysningsnätet ombord har U = 254 V RMS och f = 60 Hz. Räkna toppvärdet û och topp till topp U_{pp}.",
  "answer": "û = √2 · 254 ≈ 359 V. U_{pp} = 2 · û ≈ 718 V."
 },
 {
  "del": "sinus",
  "bild": "tur-moment",
  "ovning": "EL-000864",
  "title": "Din tur: momentanvärde i vägguttaget",
  "check": "Vägguttaget hemma: U = 230 V RMS och f = 50 Hz. Hur stor är spänningen u efter t = 3,0 ms? Räknaren ska stå i RAD.",
  "answer": "û = √2 · 230 ≈ 325 V. Vinkeln 2π · 50 · 0,003 ≈ 0,942 rad. u ≈ 325 · sin(0,942) ≈ 263 V. Står räknaren i DEG blir svaret fel, cirka 5,3 V."
 }
];
