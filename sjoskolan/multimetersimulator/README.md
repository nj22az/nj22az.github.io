# Multimeterlabbet · Sjöskolan

Svensk multimeterträning som kompletterar `Multimeter_Sjoskolan_v7_SV.pptx`.

Live: https://nj22az.github.io/sjoskolan/multimetersimulator/

## Användning

Åtta handledda övningar: spänning, polaritet, ström i serie inklusive återställning av sladd, resistans, parallella strömvägar, kontinuitet, mätarbelastning och CAT-val. Varje övning hänvisar till bilder i PowerPointen. Fri övning ger fyra kretsar, variabel matning/last i lampkretsen, felkopplingsrespons och mA-säkring.

Välj svart eller röd mätspets och tryck på en mätpunkt, dra en spets till en punkt eller använd mätpunkternas select-listor. Mätfunktionen väljs med vridomkopplaren: dra ratten med mus eller finger, eller tryck på en av de sex symbolerna. Med ratten fokuserad byter piltangenter läge; Home väljer OFF och End väljer A ⎓. Ratten har fasta ändlägen. Uttagen kan också manövreras med tangentbord. Ljud är av som standard; kontinuitet visas även i text. Framsteg och högst 200 protokollrader sparas lokalt med felhantering om lagring blockeras. CSV-export kräver inget konto.

Direktlänkar: `?ovning=voltage`, `polarity`, `current`, `resistance`, `parallel`, `continuity`, `loading`, `category` eller `fri`.

## Övning 7 · förutsäg, mät, förklara

Sju korta steg: beräkna 5,00 V utan mätare → förutsäg effekten av 10 MΩ → mät cirka 4,76 V → förutsäg effekten av 1 MΩ → mät cirka 3,33 V → beräkna återstående spänningsfall → välj rätt förklaring och skriv en egen mening.

Kopplingshjälpen visar vad som återstår. Mätarens ingång ritas som en streckad resistor över det anslutna nodparet i V-läge. Omvända spetsar godkänns med förklaring av minustecknet. Begreppet prövas med en valfråga; fritexten sparas för lärarens uppföljning och bedöms inte automatiskt. Formler och jämförelsen med hyttlampan finns som valbar fördjupning. Motståndsväljaren är uttryckligen märkt som en undervisningsmodell.

Kirchhoffs lag gäller samma koppling: med 1 MΩ-mätaren kvar över R2 blir UR1 = 10 − 3,33 ≈ 6,67 V. Att flytta en ensam mätare till R1 förändrar belastningen; den visar då 3,33 V över R1. Dessa två sekventiella avläsningar får därför inte summeras som om de gällde samma krets.

Framsteg för äldre versioner av övning 7 återställs så att de nya begreppsfrågorna måste genomföras. Övriga framsteg och gamla protokollrader behålls. Protokollet kan både visas på sidan och exporteras. Fritext visas som text och skyddas mot formeltolkning i CSV.

## Teknik och modell

Statisk HTML/CSS/ES-moduler, inga körningsberoenden, byggsteg eller backend. DOM-testerna använder jsdom som utvecklingsberoende. `model.mjs` innehåller nodanalys med hopslagning av idealledningar, resistansbestämning med en 1 V-testkälla samt instrumentmodellen. `lessons.mjs` definierar handledning och godkända moment. `app.mjs` hanterar interaktion, kretsritning, Pointer Events och progress. `protocol.mjs` exporterar protokoll med avläsningar, ingångsresistans, svar och elevens egen förklaring. `meter.css` formar det gula skyddshöljet, instrumentpanelen och den funktionella vridomkopplaren. Väljaren styr samma mätmodell som övningarna; utseendet representerar inte någon specifik tillverkarmodell.

Modellen beräknar kretsen oberoende av valt lektions-ID. Voltmeteringång 10 MΩ eller 1 MΩ, strömshunt 0,1 Ω i A och 1 Ω i mA. Amperemeterns låga resistans finns kvar när väljaren står i V eller OFF. Kortslutningsförsök bryter modellmatningen över 2 A; mA-säkringen löser direkt över 200 mA. Skydden är pedagogiska förenklingar, inte modeller av en verklig säkrings tidskurva. Lampan är en konstant resistans. AC-läget avvisar den rena DC-komponenten; inga AC-källor, transienter, temperaturer eller ljusbågar simuleras. Resistanskretsar är frånskilda; en aktiv källa blockerar Ω/summer. Källan tas elektriskt bort när matningen bryts.

Mätvärdets `value` anges i den returnerade displayenheten. `text` är den avrundade svenska avläsningen. Fria/flytande noder hålls som `null` i nodlösningen. En passiv, helt spänningslös krets visar noll i V-läge; detta utgör aldrig en säkerhetskontroll av en verklig anläggning.

## Utveckling och verifiering

Från repositoryroten:

```sh
python3 -m http.server 8000
node --test sjoskolan/multimetersimulator/model.test.mjs
```

För hela testsviten (Node-version som stöds av jsdom, exempelvis Node 24.15 eller senare i 24-serien):

```sh
cd sjoskolan/multimetersimulator
npm ci
npm test
```

Öppna `/sjoskolan/multimetersimulator/` via HTTP. Numeriska tester täcker godtyckliga nodpar, omvänd polaritet, serieinkoppling och shunt, förbikopplad amperemeter, kortslutning med fel uttag, mA-säkring, parallellresistans, avbrott, spänningssatt Ω-mätning, mätarbelastning, områdesöverskridande och alla lektionsvillkor.

## Genomförd kontroll 24 september 2026

13 numeriska tester godkända. Samtliga åtta övningar genomförda i Chrome, inklusive alla 15 delmoment och felaktigt CAT-svar. Dragning, val i listor, omkopplingsspärr vid tillkopplad matning, kortslutningsstopp även i OFF, skyddsåterställning och sparade framsteg kontrollerade. CSV laddades ned och granskades: 15 moment, 8 kolumner, UTF-8 och svenska decimaler.

Responsiva brytpunkter och Pointer Events finns för pekskärm; fysisk mobil/pekplatta har inte kunnat provas i denna miljö.

## Kontroll av uppdateringen 25 september 2026

18 modell- och valideringstester samt 2 DOM-integrationstester godkända. Hela flödet i övning 7 kontrollerat med felaktiga svar, svensk decimal, omvänd polaritet, båda ingångsresistanserna, Kirchhoff, obligatorisk förklaring, gamla protokoll, versionsbyte, CSV, fri övning och blockerad lokal lagring. De befintliga mätlektionernas elektriska villkor ingår också.

Visuell kontroll i webbläsare av denna uppdatering återstår: granskningsmiljön kunde inte öppna den lokala förhandsvisningen. DOM-tester ersätter inte kontroll av layout eller fysisk pekskärm.

## Referensprojekt och källor

- [OpenLake/bhilaee-simulator](https://github.com/OpenLake/bhilaee-simulator): webbaserad generell kretsbyggare. README anger MIT; ingen kod har kopierats.
- [pfalstad/circuitjs1](https://github.com/pfalstad/circuitjs1): generell simulator, GPL-2.0-or-later, Java/GWT. Repoägaren är **pfalstad**, inte `falstad`. Länkas som fördjupning; ingen inbäddning eller återanvändning av kod.
- [Yousef4008/Multimeter](https://github.com/Yousef4008/Multimeter): ATmega32/Proteus passar hårdvaruutveckling snarare än denna elevövning. Ingen firmware har kopierats.
- [tiagocoutinho/sinstruments](https://github.com/tiagocoutinho/sinstruments) är en server för instrumentkommunikation via TCP, UDP och seriell anslutning. Den passar protokoll- och automationsträning; den behövs inte för dessa visuella mätövningar och ingår inte i implementationen.
- [Hioki: multimeteranvändning](https://www.hioki.com/us-en/learning/usage/testers_1.html), [säker användning och CAT](https://www.hioki.com/us-en/support/warranty/safe-operation), [Fluke 114 och IEC 61010-2-033](https://www.fluke.com/en-ie/product/electrical-testing/digital-multimeters/fluke-114).

CAT är inte en indelning efter enbart fasantal eller volt-tal. Den lägst klassade delen av mätuppställningen begränsar användningen. Simulatorn ersätter inte instrumentmanual, riskbedömning, praktisk handledning eller verifiering av spänningslöshet.
