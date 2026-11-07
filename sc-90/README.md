# Johansson SC-90 · sound chip

A four-voice sound chip from Johansson Denki (ヨハンソン電機), about 1990, for the shop chimes, toys and game sets of
Johansson World. Its first job: the jingles of Sakura Shōten, the konbini in Minato.

**Why it exists.** The owner, 3 November 2026, on the first Sakura jingles (played on the Johansson PF-82, in the
Ryukyu scale): "no its a bit too difficult, to listen too .. .it needs to be more like Koji Kondo, pleasing for the
ears", then "maybe for sakura we can use something similar to MUSE ? or retro Sound systems?", then "yes but keep the
polivoks incase some one needs in the future just add more functionality". So the SC-90 is **added**: the PF-82 and
its first jingle versions stay exactly as they were (`polivoks/`, `/polivoks/#jingles-title`).

"MUSE" was read as the retro digital music machines (the 1972 Triadex Muse played bleepy melodies through its own
speaker) and "retro sound systems" as the sound chips of late-1980s consoles and toys. The SC-90 is in that family.
"Like Koji Kondo" is taken as the **manner** of the game music of that time, not its notes: a major key, a hook you can
hum, harmony in thirds and sixths, a bouncing bass, clear endings. Every melody is new; none quotes a game, a composer
or a shop chain.

**Unlisted.** Live at `https://nj22az.github.io/sc-90/` with `noindex`; no link from the site's homepage, menu or
sitemap (as the owner asked for the PF-82). The PF-82 page links to it and it links back.

| File | Purpose |
| --- | --- |
| `chip.js` | The chip, one ES module for Node and the browser: voices, envelopes, swing, echo, drums, output stage, `renderPiece` |
| `sakura.js` | The five jingles: scores per voice, chords per bar, sounds, and the moment, place and reason of each |
| `render.mjs` | `node sc-90/render.mjs` writes `sakura/<id>.wav` masters, `.mp3` copies (ffmpeg) and `manifest.json` |
| `index.html`, `page.js`, `sc-90.css` | The unlisted page: each jingle's recording, and the chip playing it live in the browser with its voices switchable |
| `tests/chip.test.mjs` | 6 checks: pitch from the 4 MHz clock, pulse duty and pitch, no aliasing, the 4-bit triangle, the 32 767-step noise, envelopes without steps |
| `tests/jingles.test.mjs` | 7 checks: bars add up, every note in C major and in the chord at every beat, endings on C, the shared motif, the shop's hours, renders current and level, the waltz loop |

## The chip

| Voice | What it is | Used for |
| --- | --- | --- |
| Pulse 1 | square wave, "on" for 12.5, 25 or 50 % of each cycle; delayed vibrato | the melody |
| Pulse 2 | the same | harmony, an echo of the melody, or chords |
| Triangle | 32 steps of 4 bits up and down | the bass |
| Noise | 15-bit shift register (32 767 steps), shaped into kick (the triangle swept down), snare and hi-hats | the drums |

- Every pitch is `4 MHz / 16 / n` for a whole number `n`: within 3 cents of equal temperament from C2 to C6, a few
  cents out at the very top, as on a real chip.
- Edges are band-limited (polyBLEP, on the pulses and on every triangle step): aliases stay more than 40 dB under the
  note even at C7. The chip is bright, never fizzy.
- Envelopes start on an S-curve and ease into their release; a voice hands over to its next note in 6 ms. One note at a
  time per voice, as on the real thing.
- Output: a 25 Hz DC block and two gentle poles at 10 kHz, the small speaker of its day. Mono, 48 kHz.
- Scores use the PF-82's notation (`polivoks/songs.js`): `C5:1/2 E5 G5 | C6:2 |`, one per voice. Drums are General
  MIDI notes: C2 kick, D2 snare, F#2 closed and A#2 open hi-hat.

## Sakura Shōten's jingles

All in C, the shop's key. They share one motif, the shop's name sung on the Japanese major pentatonic (yonanuki, the
scale of Japanese children's songs): "sa-ku-ra shō-ten" = E G A G C. Hours from
`johansson-town/src/commerce/sakura-rota.js`.

| Jingle | When | Length | Voices |
| --- | --- | --- | --- |
| Door chime | someone walks through the door while the shop is open | 2.0 s | melody, harmony a third below, bass |
| Till "pi-pon" | a sale goes through, 09:00–20:00 | 1.0 s | two bell notes and a second voice |
| Shop jingle | between songs on the shop's radio | 7.6 s | melody, echo, walking bass, light shuffle drums |
| Good morning | 09:00, the shutter goes up (never on Saturday) | 5.0 s | melody, harmony in sixths, walking bass |
| Closing waltz | 20:00 to the shutter at 20:30, looping | 30 s | music-box melody, oom-pa-pa chords, bass |

Every jingle is levelled to −15 dBFS rms with peaks under −1 dBFS, so they sit together in the shop. The waltz is
rendered twice through and the second pass kept: it loops exactly. Not yet wired into Johansson World or the Sakura
game; that waits for the owner's word.

## Run

```bash
cd sc-90 && npm test
```

```bash
node sc-90/render.mjs
```

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/sc-90/`.
