# Minato karaoke

Enter Minato Izakaya between 16:00 and 03:00. Use the laserdisc karaoke machine at the end of the raised dining area, or choose **Sing karaoke · solo or with friends** from the wall menu. Opening the song book is free. The first performance costs ¥100; encores and further songs are included until returning to Minato.

Choose a song, arrangement and one to four performers. Open **Edit the title and lyrics** to write four short lines. Press **Perform**: the screen counts in four beats, then highlights each word over a live 3D performance. Groups alternate the first three verses and sing the final line together. A bow and applause finish the take. **Encore** repeats it, **Back to songs** changes it, and **Return to Minato** resumes the same position and seat. Escape also exits. Auto and fixed wide cameras, a sound toggle, reduced-motion support and keyboard focus trapping are included.

The three original templates are Harbour Lights, Island Bus Stop and Summer After Midnight. Each can use Island pop (112 BPM), Harbour ballad (80 BPM) or Neon disco (124 BPM). No Nintendo music, lyrics, character models, voices, choreography or extracted game files are used. This is an original implementation of the performance idea.

## Evidence and interpretation

- [Nintendo 3DS Tomodachi Life electronic manual](https://www.nintendo.com/eu/media/downloads/games_8/emanuals/nintendo_3ds_2/tomodachi_life/ElectronicManual_Nintendo3DS_TomodachiLife_EN.pdf), section 11, “The Concert Hall”, PDF page 26: solo and group singing, editable titles and lyrics, and individual lyrics for each solo singer.
- [Nintendo's 2015 Concert Hall contest](https://www.nintendo.com/en-gb/News/2015/July/Tomodachi-Life-Friendship-Fiesta-Concert-Hall-Contest-1038388.html) demonstrates the intended create-and-watch loop: players make original songs within the game's Concert Hall and record their performances.
- [REA](https://github.com/morluto/rea) was reviewed as the requested investigation reference. Its native workflow needs a local binary and analysis backend. No Tomodachi Life binary was supplied or analysed. The design here is informed by public documentation, not a claim about Nintendo's internal audio or animation code.

The implementation interprets that loop as a fixed musical score with replaceable text, an editable cast, clocked animation and directed cameras. Alternating parts, prices, arrangements and the Minato set are Johansson World's design choices.

## Implementation

- `src/music/songs.js`: bounded save data, four count-in beats, four eight-beat phrases and a four-beat bow. One score supplies word timing, melody and singer parts.
- `src/music/audio.js`: original Web Audio bass, chords, percussion and formant voices. Vowels carry scored pitches; short consonant sounds articulate them. This is a deliberately robotic syllable voice, not a general English pronunciation engine. Long or unusually spelled words may sound approximate. The displayed lyrics always retain the written words. No microphone permission, external service or audio download is required.
- `src/music/stage.js`: shared World avatar builder and animator, stand microphones sized to each singer, original curtains, wood riser, speakers and sign. Uses the existing game renderer; no second WebGL context. Cast changes and exit dispose avatar skeletons and stage resources.
- `src/music/concert.js`: responsive song book and live performance, lazy-loaded from the physical machine. Opening does not spend money. Cancellation invalidates pending audio unlocks. Sound schedules only 180 ms ahead and skips stale notes; backgrounding, page exit, interruption, Stop and Return cancel sound. Lyrics are inserted as text, never HTML.
- `state.concert`: song, cast and completed performances, saved per player and retained through the annual loop. No live audio handles or temporary stage coordinates are saved. The session payment uses the game's receipt and ledger system.
- WebMCP: the normal state lists concert choices and visible actions. `johansson_concert` validates settings; the existing action tool presses the visible buttons.

## Verification

Run `node --test tests/concert.test.mjs tests/izakaya-play.test.mjs tests/year-loop.test.mjs tests/runtime-package.test.mjs tests/live-features.test.mjs tests/travel-webmcp.test.mjs` after `npm run build:runtime`.

Run `node tools/concert-smoke.mjs` with a Playwright Chromium installation, or set `CONCERT_BROWSER` to a browser executable. `CONCERT_QA_OUTPUT` selects the screenshot/report folder. Add `--game` to exercise the compiled World, the physical interaction and the WebMCP controls too; `--game-only` runs that route alone. The default browser test uses the real avatar meshes, WebGL renderer and Web Audio graph; it checks a complete song, a free encore, Stop, backgrounding, exit, focus, saved text and insufficient funds at desktop, phone and tablet viewport sizes.

Browser viewport checks do not establish real iPad Safari or device audio acceptance. Device listening remains a separate check.

### Acceptance recorded on 16 October 2026

The standalone Chromium 131 browser run passed its complete performance, audio output, caption, saved editing, encore, Stop, backgrounding, exit, focus and funds checks at 1280 × 800, 390 × 844 and 1024 × 768. The existing CPU full-game boot/interior smoke passed, as did the targeted source and runtime checks. Full-town browser navigation in this execution environment terminated the browser process before acceptance; that result is not counted as a visual pass. Physical iPad Safari and listening acceptance remain outstanding.
