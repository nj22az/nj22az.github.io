# Multimeter Aboard

Sjöskolan's **English film companion** to *Multimeter och mätfel*, version 7, 70 slides. It replaces the Swedish film on the course website with British English narration, English diagrams and captions, while retaining all 37 scenes, the same examples, mascots, original music and Sjöskolan branding.

**13 min 37.5 s · 1920 × 1080 · 30 fps · 37 scenes · 12 chapters**

[Watch the film](https://nj22az.github.io/sjoskolan/multimeterfilm/) · [Open the simulator](https://nj22az.github.io/sjoskolan/multimetersimulator/) · [English script](SCRIPT_EN.md) · [PowerPoint coverage](COVERAGE.md)

Topics include voltage, current, resistance, continuity, CAT categories, instrument selection, resolution, specified error limits, tolerance, measurement records, voltmeter loading and ammeter burden voltage. All three extension examples on slides 66–68 are included. The PowerPoint and simulator remain in Swedish. External videos linked by the presentation are referenced, not copied.

## For teaching

Use the chapter buttons to jump through the film. Pause at the questions and ask students to justify their choice. Narration, music and captions can be switched off individually. Playback speed is adjustable. The complete script is also available as text below the player and in `SCRIPT_EN.md`.

The downloadable `assets/Multimeter_Aboard_EN.mp4` has English captions burned into the picture. Separate SRT and VTT files are in `assets`. Its chapters match the web player.

The circuits are simplified teaching models for supervised laboratory work. Follow the actual instrument manual and workplace procedures. CAT is not a measure of accuracy. The error-limit examples cover the stated instrument specification, not a complete uncertainty budget.

## Technology

- **JavaScript + HTML Canvas:** original mascots, meter, diagrams and animation in a pure scene-and-time drawing function.
- **Anidoodle:** adapted deterministic film core, Apache-2.0.
- **Helios 5.13.2:** frame timeline in both browser and export. Narration audio is the browser playback clock. Licence: ELv2.
- **Java 17:** synthesises the original composition *Mätresan*: C major, 120 BPM, plucked notes, bass, gentle percussion and a final tonic bell. Music is reduced under speech and follows the English timing.
- **Kokoro-82M:** local British English synthetic narration, `bf_emma`, at speed `0.96`. The model and voice archive hashes are documented in `vendor/VOICE-NOTICE.md`.
- **Native Canvas + FFmpeg:** MP4 rendering from the same drawing code used by the web player.

## Build the web player

Node.js 20+:

```sh
npm ci
npm run build
npm run check
npm run serve
```

Open `http://localhost:8000`. Final audio and exact narration timings are checked in. The shared site navigation is loaded from the parent website when published.

## Export an MP4

Install FFmpeg, then run:

```sh
npm run render
```

This creates `build/Multimeter_Aboard_EN.mp4`. If the uncompressed mix is absent, the renderer rebuilds it from the included English MP3 tracks. For a short preview:

```sh
node tools/render.mjs --start 0 --end 8 --out build/preview.mp4
```

## Edit the script and regenerate speech

Edit `src/content.mjs`. Install Python 3.10+, `kokoro-onnx==0.4.9` and `numpy`. Download `kokoro-v1.0.onnx` and `voices-v1.0.bin` from the [v1.1 model-file release](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1), and verify the SHA-256 hashes in `vendor/VOICE-NOTICE.md`.

```sh
npm run narrate -- --model /path/kokoro-v1.0.onnx --voices /path/voices-v1.0.bin
npm run score
npm run build
npm run check
npm run render
```

Java 17 is needed only when regenerating the music. Speech is generated locally, cached by content and model hash, and timed from actual samples. `src/timeline.json` contains the resulting chapter, scene and caption timings. The script disables inference telemetry before runtime initialisation. The FP32 model adapter preserves the floating-point speaking rate.

## Main files

| File | Purpose |
|---|---|
| `src/content.mjs` | English narration, chapters, examples and PowerPoint references |
| `src/draw.mjs` | Original mascots, English labels, circuits and motion |
| `src/player.mjs` | Helios timeline, audio synchronisation and controls |
| `tools/narrate.py` | Local British English speech and timed captions |
| `tools/score.mjs` | Original musical composition and arrangement |
| `tools/MusicScore.java` | Java audio synthesiser |
| `tools/render.mjs` | MP4 export |
| `tools/check.mjs` | Slide coverage, calculations, timing, all caption bounds and determinism |

The local DejaVu fonts preserve the Sjöskolan name and technical symbols. Licences and source notices are in `vendor`. The earlier Swedish edition is preserved in Git history at commit `86b8357ddb42cc0a7987b483390dd880513909fd`.
