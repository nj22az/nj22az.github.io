# Byggkällor för AC, revision 25 september 2026

Undervisningsinnehållet finns i `../../vecka-40/aktuell/lektioner.mjs`. De engelska replikerna ligger i `film-manus.mjs`. De tre kortfilmerna spelas från ljudets tidsposition; svensk text och figurer följer samma sex avsnitt. Varje film är 120 sekunder. Ljud kan stängas av och rörelse följer `prefers-reduced-motion`.

## Presentationer

`build-decks.mjs` importerar de arkiverade originalen. Omslag, 4:3-format, Calibri och Sjöskolans sidfot bevaras. Text, kurvdiagram och geometriska trianglar är redigerbara. Byggningen kräver `@oai/artifact-tool` och den installerade Presentations-skillens verifieringsverktyg. Ange `PRESENTATION_SKILL_ROOT` samt miljöns `CODEX_PRIMARY_RUNTIME_PYTHON`, `RUNTIME_NODE`, `RUNTIME_NODE_MODULES`, `RUNTIME_BIN_DIR` och `RUNTIME_PYTHON`.

```sh
node sjoskolan/verktyg/ac/build-decks.mjs /absolute/path/to/fresh-build-directory
```

Finaliseraren skriver aldrig över en tidigare slutfil eller verifieringsrapport. Använd en ny byggkatalog, granska de renderade bilderna och kopiera därefter de verifierade PowerPoint-filerna från `output-final` till veckans katalog.

## Berättarröst

Kokoro-82M, brittisk engelska, röst `bf_emma`, hastighet 0,96. Syntetisk röst, ingen musik. Modell och röstpaket från https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1. Byggskriptet kontrollerar SHA-256 mot de använda utgåvorna. Filerna distribueras inte med kursen. Modellens licens: Apache-2.0; se originalprojektets licenser för verktyg och röster.

Kräver Python med `kokoro-onnx==0.4.9`, `onnxruntime`, `numpy`, systemets espeak-ng, Node och FFmpeg.

```sh
python sjoskolan/verktyg/ac/narrate-short.py --model /path/kokoro-v1.0.onnx --voices /path/voices-v1.0.bin --work /path/audio-build
```

Skriptet skriver MP3 och `film-audio/timeline.json` till veckans katalog. Tidsinformationen härleds från genererat ljud och följer pauserna mellan scenerna.
