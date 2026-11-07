# Maskinrummet med Erik · plan för alla simulatorlabbar

Kursens laborationer görs om, en i taget, som stationer i ett och samma 3D-maskinrum. Varje station har samma uppgifter,
steg och protokoll som veckans labb (en distansversion får aldrig vara en annan labb), men eleven ser utrustningen som
den sitter ombord och har en lärare bredvid sig.

## Personerna

- **Erik** är maskinrummets elektriker: en gammal svensk sjöman, fyrtio år i maskinrum, som har slagit sig ner på ön.
  Han är där för att visa *vad* som ska göras och *hur*: han går till rätt apparat, kopplar, slår till och pekar ut var
  avläsningen står. Han säger aldrig svaret, och han räknar aldrig med elevens tal (regel 1, 2 och 22). Hans repliker
  står i stationens manusfil, inte i övningsposterna.
- **Johansson** är elevens figur, som i Station A. Han står vid bänken och gör det eleven väljer.
- Arbete på 230 V och 440 V gör bara Erik, efter frånskiljning eller genom att läsa tavlans egna instrument. Eleven
  arbetar själv bara på skyddsklenspänning, 9–24 V (regel 4). Det står på skärmen när det gäller.

## Gemensamt för alla stationer

| Del | Fil | Vad |
|---|---|---|
| Rummet | `rum.mjs` | Golv, skott, generator, huvudtavla, pump och motor, gångbana. Samma rum i alla stationer. |
| Erik | `character/erik.js` | Eriks recept (vitt skägg, skepparmössa, marinblå jacka) för den kopierade avatarkoden. |
| Visa-motorn | `erik-visar.mjs` | Erik som demonstratör: gå till en plats, nå en punkt med båda händerna (IK på det riktiga skelettet), hålla verktyg, sladdar till instrumentet, pratbubbla. Bara presentation, räknar aldrig ett värde. |
| Arbetsgång | per station | **Förutsäg → Erik visar → Läs av och jämför → Förklara**, kursens tolerans 2 %, första förutsägelsen sparas (regel 25). |
| Innehåll | `*/uppgifter.gen.mjs` | Ögonblicksbild av databasens poster, med källhash i `snapshot.json`. Ändras i `innehall/`, aldrig här. |
| Värden | `*/model.mjs` | Kopia av veckolabbets modell med källhash. Personliga värden ur D (`gemensamt/elevtal.mjs`). |
| Sparande | egna nycklar | `sjoskolan-maskinrum-…`; veckolabbens nycklar och resultatkoder läses och skrivs inte. |
| Reservläge | 2D | Allt går att göra utan WebGL. |

Kontroller för varje station: modelltest (samma tal som veckolabbet för samma D), webbläsartest i fyra bredder, inga
svar i Eriks repliker (jämförs mot alla svar i databasen), `innehall.py kontrollera` och veckolåset oförändrat.

## Stationerna

| # | Station | Veckans labb och poster | 3D-tillgångar vi redan har | Erik visar | Eleven gör |
|---|---|---|---|---|---|
| 0 | **Frånskilj, lås, prova** | v38/v40 måndag, v42_03 | Motorrutinens frånskiljare, hänglås, skylt, tvåpolig provare och provningsenhet (`motor-90l/workshop`); `figurer3d/sakerhet.mjs` | Hela kedjan vid tavlan: brytare, lås, skylt, prova provaren | Väljer de sex mätningarna och test–test–test i rätt ordning |
| A | **Multimeter** | v39, Station A (finns) | Bänken och mätspetsarna (finns) | Inför varje steg: mätfunktion, uttag och var spetsarna ska sitta | Som i dag; Erik läggs till bredvid Johansson |
| **B** | **Växelström** | v40, guidad labb, EL-000337–344 | Växelströmslabbets instrument som förebild | Kopplar mätarna, oscilloskopet och komponentplattan på SELV-bänken; mäter lastbanken med effektanalysatorn vid kaj | Förutsäger, läser av, förklarar. **Byggs först (denna etapp).** |
| C | **Generator och trefas** | v41 del 1–2, Trefaslabbet | `figurer3d/modeller.mjs` (generator, stjärnkoppling, plint, transformator), `generatorn/` | Läser U_{L} och U_{F} på huvudtavlans voltmeter med fasomkopplaren; visar Y och Δ i plinten | Förutsäger U_{L} = √3 · U_{F}, I_{L} i Y och Δ, effekt |
| D | **Motorn och plinten** | v41 del 3, Motorlabbet | `motor-90l/` (IEC 90L, alla 30 delar), Motorlabbets bänk och nodanalys | Eriks motorrutin: frånskilj, prova, Y/Δ, resistans, isolation, lager | Kopplar bleck, mäter 2R och (2/3)R, felsökningen med ett fel per elev |
| E | **Startare och hållkrets** | v43_03, Hållkretslabbet | Motorlabbets startare | Visar kontaktor, överlastrelä och hållkontakt; prövar START/STOPP | Mäter spänningslöst i hållvägen, hittar felet (regel: mät aldrig över en kontakt med en sluten parallellt) |
| F | **Skydd och beröringsspänning** | v42 | `figurer3d/sakerhet.mjs` (pumpmotor på gummidämpare, bruten PE, punkterna A och B) | Visar varför PE behövs och hur jordfelsbrytaren löser | Förutsäger beröringsspänning och felström |
| G | **Isolation och IT-nät** | v44, Isolationslabbet | Huvudtavlans isolationsövervakning; motorn ur station D | Läser isolationsvakten, söker jordfelet gren för gren, isolationsprovar motorn | Förutsäger skrovets potential och R_{iso}, avgör vilken gren som felar |
| X | **Felsökning från tavla till pump** | slutuppgift | Hela rummet | Ger felanmälan och står bredvid | Läns­pumpen startar inte: eleven väljer mätningar från tavlan till motorn och skriver felsökningsloggen |

## Ordning och etapper

1. **Station B** med Erik, **klar**, rummet som modul (`rum.mjs`) och Visa-motorn. Station A oförändrad (dess test ska gå igenom).
2. **Erik i Station A**: en knapp ”Erik visar” per steg. **Klar** (`stationA-manus.mjs`).
3. **Station D** (motorn finns redan i full detalj) och **station 0** (Eriks frånskiljning finns redan som rutin).
4. **Station C och E**, sedan **F och G**.
5. **Felsökningen X**, och därefter märks sektionen som komplett, när varje station har klarat räkne- och
   interaktionsgranskningen som elektriker och sjöingenjör (regel 41).

## Verklighetskrav

- Varje apparat är rätt i detalj: uttag, märkning, säkringar, mätområden och CAT-klass som i inköpslistan eller ombord.
  En förenkling som är ofarlig i 2D kan bli fel i 3D (regel 41).
- 3D bara där det fysiska är poängen; kurvor, visare och formler är 2D (regel 38).
- 400 V eller 50 Hz sägs vara land eller landström vid kaj; till sjöss gäller 440 V och 60 Hz.
- Simulerade värden märks som simulerade. Ideala komponenter anges där modellen förutsätter dem.
- Kursens notation överallt (U_{L}, X_{L}, P_{in} …), nedsänkta index, `oversattning.js` på varje sida.
