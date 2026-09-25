# Multimetern ombord

Svensk undervisningsfilm som kompletterar Sjöskolans **Multimeter och mätfel**, version 7, 70 bilder.

**14 min 51,5 s · 1920 × 1080 · 30 fps · 37 scener · 12 kapitel**

[Se filmen](https://nj22az.github.io/sjoskolan/multimeterfilm/) · [Öppna simulatorn](https://nj22az.github.io/sjoskolan/multimetersimulator/) · [Manus](MANUS_SV.md) · [Koppling till PowerPoint](COVERAGE.md)

Filmen innehåller spänning, ström, resistans, kontinuitet, CAT-kategorier, instrumentval, upplösning, specificerad felgräns, tolerans, mätprotokoll, voltmeterns belastning och strömmätarens spänningsfall. De tre fördjupningsexemplen på bild 66–68 ingår. Presentationens externa filmer kopieras inte.

## För undervisning

Kapitelknapparna hoppar i filmen. Pausa vid frågorna och låt eleverna motivera sitt val innan ni fortsätter. Berättarröst, bakgrundsmusik och text kan slås av var för sig. Filmens text finns också under spelaren och i `MANUS_SV.md`. MP4-versionen har svensk text inbränd i bilden; SRT och VTT finns separat i `assets`.

Kopplingarna gäller förenklade undervisningsmodeller. Praktisk inkoppling sker vid handledd laboration. Instrumentets manual och arbetsplatsens rutiner gäller vid verkligt arbete. CAT är inte en uppgift om mätnoggrannhet. Intervallexemplen omfattar den angivna instrumentfelgränsen, inte en fullständig osäkerhetsbudget.

## Teknik

- **JavaScript + HTML Canvas:** ursprungliga maskotar, instrument, scheman och rörelser. `src/draw.mjs` är en ren ritfunktion av scen och tid.
- **Anidoodle:** anpassad filmkärna med kontroll av scener och bildrutor, Apache-2.0. Kodritning och musikrecept bygger på projektets arbetsmetod.
- **Helios 5.13.2:** styr bildrutornas tidslinje i både webbläsare och export. Webbläsaren använder berättarljudets tid som klocka, så bild och tal inte glider isär. ELv2-licensen finns i `vendor`.
- **Java 17:** `tools/MusicScore.java` syntetiserar den egna kompositionen *Mätresan*. C-dur, 120 BPM, plockade toner, bas, diskret tick/tock och avslutande tonikaklocka. Musiken sänks under talet. Inga samplade låtar används.
- **Piper:** berättarrösten genereras lokalt på svenska med `sv_SE-nst-medium`. ONNX Runtime-telemetri stängs av före initiering. Modellen är tränad av KBLab på NST-data (CC0). Rösten är syntetisk.
- **Native Canvas + FFmpeg:** MP4-export utan skärminspelning eller webbläsarautomation. Samma ritfunktion används för film och webbspelare.

## Bygg webbspelaren

Node.js 20+:

```sh
npm ci
npm run build
npm run check
npm run serve
```

Öppna `http://localhost:8000`. Slutliga ljudfiler och exakt tidslinje är incheckade. Ingen extern taltjänst behövs för uppspelning eller videoexport. Gemensam sidnavigation hämtas från huvudwebbplatsens rot vid publicering.

## Exportera MP4

Installera FFmpeg. Kör:

```sh
npm run render
```

Det skapar `build/Multimetern_ombord_SV.mp4`. Om den okomprimerade ljudmixen saknas bygger exporten den från de medföljande MP3-filerna. För en kort kontroll:

```sh
node tools/render.mjs --start 0 --end 8 --out build/preview.mp4
```

## Ändra manus och generera ny lokal röst

Redigera `src/content.mjs`. Installera Python 3.10+, `piper-tts==1.8.0` och `numpy`. Hämta röstens ONNX-fil och JSON-konfiguration från [Piper NST](https://huggingface.co/rhasspy/piper-voices/tree/main/sv/sv_SE/nst/medium). Modellen ingår inte i webbpaketet.

```sh
npm run narrate -- --model /sokvag/sv_SE-nst-medium.onnx
npm run score
npm run build
npm run check
npm run render
```

Java 17 krävs bara när musikfilen skapas på nytt. Manus överförs inte till en taltjänst. `src/timeline.json` innehåller scenlängder och undertextens verkliga syntestider. Syntesen cachelagrar ljud lokalt och de slutliga ljudfilerna gör vanlig export reproducerbar.

## Filer

| Fil | Innehåll |
|---|---|
| `src/content.mjs` | Manus, kapitel och referenser till presentationen |
| `src/draw.mjs` | Alla maskotar, figurer, symboler och animationer |
| `src/film.mjs` | Anidoodle-kontrakt och renderingsfunktion |
| `src/player.mjs` | Helios, ljudsynkronisering och spelarens kontroller |
| `tools/narrate.py` | Lokal svensk talsyntes och undertexter |
| `tools/score.mjs` | Komposition, noter och arrangemang |
| `tools/MusicScore.java` | Ljudsyntes i Java |
| `tools/render.mjs` | MP4-export |
| `tools/check.mjs` | Täckning, matematik, tidslinje, textgränser och determinism |
| `assets/score.csv` | Noter med MIDI-ton, bildruta, anslag och instrument |

Typsnittet DejaVu levereras lokalt för svenska tecken. Licenser och hänvisningar till återanvänd kod finns i `vendor`. Den egna figurvärlden och musikkompositionen använder inga stockbilder eller tredjepartslåtar.
