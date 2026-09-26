# Alternating Current Aboard

20 minutes 12.5 seconds, 41 scenes, 263 caption phrases, 1920 × 1080 at 30 fps.

Sjöskolan week 40, 28 September–2 October 2026. Three English chapters accompany the three Swedish lesson decks: sinusoidal voltage, reactance and impedance, and AC power. See SCRIPT_EN.md and COVERAGE.md for the complete manuscript and source mapping.

The film explains the core theory and worked examples. It is a companion to the exercises, not a complete answer key. Three calculation questions include six seconds of thinking time; the player can be paused for longer.

## Production

- Original diagrams and mascots are drawn using JavaScript Canvas. No stock video or browser recording.
- Helios 5.13.2 drives a deterministic frame timeline through the adapted Anidoodle core. Licences are in `vendor/`.
- Local Kokoro-82M voice `bf_emma`, British English, speed 0.96. Model provenance is in `vendor/VOICE-NOTICE.md`.
- Original music “Mätresan” is scored in code and synthesised by Java 17. Music is quietened beneath speech and may be muted independently in the player.
- English captions are timed to the generated phrases. Animation reveals use those caption cues. Video includes burnt-in captions; SRT and VTT are also provided.
- Equations assume the waveform and circuit conditions stated in each scene. The distorted-current sketch illustrates harmonics and is not a numerical fit to its separate meter example.

## Notation

On-screen text follows the course notation (`../innehall/beteckningar.json`): U_{pp}, U_{RMS}, X_{L}, X_{C}, U_{R}, U_{L}, U_{C}, Q_{C}.
Indices are written `U_{pp}` in `src/content.mjs` and `src/draw.mjs` and drawn as true subscripts by `txt()` in `src/art.mjs`.
`innehall.py kontrollera` (CI) checks the film sources.

## Rebuild

Requirements: Node 22+, Java 17+, Python with `kokoro-onnx==0.4.9` and numpy, and FFmpeg.

```sh
npm ci
npm run narrate -- --model /path/kokoro-v1.0.onnx --voices /path/voices-v1.0.bin
npm run build
npm run score
npm run check
npm run render
```

When only on-screen text changes, the spoken narration is unchanged and the voice model is not needed. Reuse the existing narration instead of `npm run narrate`:

```sh
mkdir -p build && ffmpeg -y -i assets/narration-en.mp3 -ar 48000 -ac 2 build/narration.wav
npm run build && npm run score && npm run check && npm run render
cp build/Alternating_Current_Aboard_EN.mp4 assets/
```

The download uses H.264 at 1080p, CRF 27, with 96 kbit/s AAC stereo, keeping the complete lesson small enough for publication. The browser player retains its separate 128 kbit/s narration and music tracks.

Completed public audio and timeline are versioned, so ordinary playback and a video rebuild do not require speech synthesis. Rendering rebuilds a mix from the MP3 tracks if the WAV mix is absent. The default render writes `build/Alternating_Current_Aboard_EN.mp4`; copy a verified final render to `assets/Alternating_Current_Aboard_EN.mp4` for publication. `node tools/frame.mjs all` generates scene previews.

`npm run check` verifies source references, measured timings, pauses before answers, worked calculations, rendering of every scene, text bounds and deterministic seeking. The browser player uses narration as the timing reference, resynchronises music, and provides chapter seeking, captions, speed and independent mute controls.
