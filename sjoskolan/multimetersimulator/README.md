# Multimeterlabbet · Sjöskolan

Svensk multimeterträning som kompletterar `Multimeter_Sjoskolan_v7_SV.pptx`.

Live: https://nj22az.github.io/sjoskolan/multimetersimulator/

## Användning

Åtta handledda övningar: spänning, polaritet, ström i serie inklusive återställning av sladd, resistans, parallella strömvägar, kontinuitet, mätarbelastning och CAT-val. Varje övning hänvisar till bilder i PowerPointen. Fri övning ger fyra kretsar, variabel matning/last i lampkretsen, felkopplingsrespons och mA-säkring.

Välj svart eller röd mätspets och tryck på en mätpunkt, dra en spets till en punkt eller använd mätpunkternas select-listor. Funktioner och uttag kan manövreras med tangentbord. Ljud är av som standard; kontinuitet visas även i text. Framsteg och högst 200 protokollrader sparas lokalt med felhantering om lagring blockeras. CSV-export kräver inget konto.

Direktlänkar: `?ovning=voltage`, `polarity`, `current`, `resistance`, `parallel`, `continuity`, `loading`, `category` eller `fri`.

## Teknik och modell

Statisk HTML/CSS/ES-moduler, inga beroenden, byggsteg eller backend. `model.mjs` innehåller nodanalys med hopslagning av idealledningar, resistansbestämning med en 1 V-testkälla samt instrumentmodellen. `lessons.mjs` definierar handledning och godkända moment. `app.mjs` hanterar interaktion, kretsritning, Pointer Events, progress och CSV.

Modellen beräknar kretsen oberoende av valt lektions-ID. Voltmeteringång 10 MΩ eller 1 MΩ, strömshunt 0,1 Ω i A och 1 Ω i mA. Amperemeterns låga resistans finns kvar när väljaren står i V eller OFF. Kortslutningsförsök bryter modellmatningen över 2 A; mA-säkringen löser direkt över 200 mA. Skydden är pedagogiska förenklingar, inte modeller av en verklig säkrings tidskurva. Lampan är en konstant resistans. AC-läget avvisar den rena DC-komponenten; inga AC-källor, transienter, temperaturer eller ljusbågar simuleras. Resistanskretsar är frånskilda; en aktiv källa blockerar Ω/summer. Källan tas elektriskt bort när matningen bryts.

Mätvärdets `value` anges i den returnerade displayenheten. `text` är den avrundade svenska avläsningen. Fria/flytande noder hålls som `null` i nodlösningen. En passiv, helt spänningslös krets visar noll i V-läge; detta utgör aldrig en säkerhetskontroll av en verklig anläggning.

## Utveckling och verifiering

Från repositoryroten:

```sh
python3 -m http.server 8000
node --test sjoskolan/multimetersimulator/model.test.mjs
```

Öppna `/sjoskolan/multimetersimulator/` via HTTP. Numeriska tester täcker godtyckliga nodpar, omvänd polaritet, serieinkoppling och shunt, förbikopplad amperemeter, kortslutning med fel uttag, mA-säkring, parallellresistans, avbrott, spänningssatt Ω-mätning, mätarbelastning, områdesöverskridande och alla lektionsvillkor.

## Genomförd kontroll 24 september 2026

13 numeriska tester godkända. Samtliga åtta övningar genomförda i Chrome, inklusive alla 15 delmoment och felaktigt CAT-svar. Dragning, val i listor, omkopplingsspärr vid tillkopplad matning, kortslutningsstopp även i OFF, skyddsåterställning och sparade framsteg kontrollerade. CSV laddades ned och granskades: 15 moment, 8 kolumner, UTF-8 och svenska decimaler.

Responsiva brytpunkter och Pointer Events finns för pekskärm; fysisk mobil/pekplatta har inte kunnat provas i denna miljö.

## Referensprojekt och källor

- [OpenLake/bhilaee-simulator](https://github.com/OpenLake/bhilaee-simulator): webbaserad generell kretsbyggare. README anger MIT; ingen kod har kopierats.
- [pfalstad/circuitjs1](https://github.com/pfalstad/circuitjs1): generell simulator, GPL-2.0-or-later, Java/GWT. Repoägaren är **pfalstad**, inte `falstad`. Länkas som fördjupning; ingen inbäddning eller återanvändning av kod.
- [Yousef4008/Multimeter](https://github.com/Yousef4008/Multimeter): ATmega32/Proteus passar hårdvaruutveckling snarare än denna elevövning. Ingen firmware har kopierats.
- [tiagocoutinho/sinstruments](https://github.com/tiagocoutinho/sinstruments) är en server för instrumentkommunikation via TCP, UDP och seriell anslutning. Den passar protokoll- och automationsträning; den behövs inte för dessa visuella mätövningar och ingår inte i implementationen.
- [Hioki: multimeteranvändning](https://www.hioki.com/us-en/learning/usage/testers_1.html), [säker användning och CAT](https://www.hioki.com/us-en/support/warranty/safe-operation), [Fluke 114 och IEC 61010-2-033](https://www.fluke.com/en-ie/product/electrical-testing/digital-multimeters/fluke-114).

CAT är inte en indelning efter enbart fasantal eller volt-tal. Den lägst klassade delen av mätuppställningen begränsar användningen. Simulatorn ersätter inte instrumentmanual, riskbedömning, praktisk handledning eller verifiering av spänningslöshet.
