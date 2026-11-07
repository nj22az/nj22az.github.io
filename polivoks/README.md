# Johansson PF-82 · Polivoks filter synthesiser

`/polivoks/` is the **Johansson PF-82**, a Johansson Denki instrument: a playable synthesiser built around a
part-by-part model of the Polivoks filter, with the imperfections of a real build and public-domain songs to play.
The owner asked on 3 November 2026: "can you create a https://github.com/clarionut/Polivoks_filter simulator ? with
all imperfections https://github.com/morluto/rea use this and build a synthesiser simulator", then "add it to my
website, can you make it play public domain songs ?", "Use Python to draw an illustrate and create a UI thats easy to
understand for a synthesiser enthusiast", "make sure this is branded as a Johansson Product" and "give me a url so I
can try it online but I dont want a link on my website".

**Unlisted.** The page is live at `https://nj22az.github.io/polivoks/`, but nothing on the site links to it: no
homepage card, no menu entry, no sitemap entry. Adding a link is the owner's decision.

**Brand.** Johansson Denki (ヨハンソン電機) is Johansson World's maker of everything electric (`johansson-town/src/world/
interiors/tetsuo-flat.js`; "Johansson is this universe's Acme"). The PF-82 (Polivoks filter, 1982) carries the
JOHANSSON wordmark on its panel, page and art. "Polivoks" names only the circuit it simulates; the original
instrument (Formanta) and clarionut's module are credited, never presented as the maker.

| File | Purpose |
| --- | --- |
| `index.html`, `polivoks.css`, `app.js` | The page: panel, song bar, help line, signal-flow map, keyboard, MIDI, scope, spectrum, readouts, imperfections, unit sheet, anatomy, Sakura Shōten's jingles, song book |
| `songs.js` | Seven public-domain tunes in our own single-line transcriptions, the score parser and the event builder |
| `agent.js` | The agent surface shared by the page and the MCP server: patches, help texts, every parameter with its range, song validation, share links, the composer's guide |
| `view3d.js`, `3d/pf82.glb`, `3d/pf82-layout.json` | The PF-82 in 3D: the CAD model (`cad/pf-82/`) in the vendored three.js r170, loaded when it comes into view; knobs, selectors, jacks, keys, power and lamp follow and drive the real state |
| `tests/model3d.test.mjs` | 3 checks that the committed GLB and layout match each other and the page's parameters (CI cannot run the CAD kernel) |
| `mcp/server.mjs`, `mcp/README.md` | The `pf82` MCP server (no dependencies): compose, check, render WAVs, share links, and live control of a page served on 127.0.0.1 |
| `tests/agent.test.mjs` | 5 checks: songs (and the jingles) and parameters validated, share links round-trip, the server's protocol and ten tools over stdio, the live bridge |
| `art/draw.py` | Python, standard library only: draws `signal-flow.svg` and `filter-anatomy.svg` and inlines them into `index.html` between `<!-- art:… -->` markers. `--check` fails on stale output (CI) |
| `dsp/polivoks-dsp.js` | The circuit model and the synthesiser voice. One ES module for three hosts: the AudioWorklet (registers `polivoks`), the page (imports defaults, knob laws, `makeUnit`) and Node |
| `tests/dsp.test.mjs` | 17 measurements of the model against the schematic, and of the voice (`npm test`, Node 20+, no dependencies) |
| `jingles/sakura.js`, `jingles/render.mjs`, `jingles/sakura/` | Sakura Shōten's five jingles: the scores with their moment, place and reason; the offline renderer; the WAV masters, MP3 copies and manifest |
| `tests/jingles.test.mjs` | 5 checks: valid songs in the island scale, the shop's hours, the renders current and inside their lengths, the waltz's seamless loop |
| `tests/songs.test.mjs` | 18 checks: every bar adds up, notes in range, every attack released, the sequencer plays every note and leaves none held, tempo |
| `HANDOVER-2026-11-03.md` | State of the work, checks run, limits, next steps |

## Source and boundary

The reference is [clarionut/Polivoks_filter](https://github.com/clarionut/Polivoks_filter), commit
`9c155cff67525fc9faa9edcb295cfc6075f580be` (18 November 2025). It has **no licence file**, so it is used the way
AGENTS.md says to use outside work: study and measure, never copy. Only the schematic was read. No code, panel artwork
(the Panel SVGs), Gerbers or KiCad files are in this repository; the panel here is our own design and its Russian
legends are our own wording.

Provenance, recorded with REA (`rea-agents@6.7.0`, registered in `.mcp.json`):

- `inspect_artifact` on a `git archive` of that commit (`polivoks-filter-9c155cf.zip`, sha256
  `2c594707…af5eb663`): 29 entries, complete inventory, hashes verified, 0 integrity contradictions
  (evidence `ev_2d24b761…`, inventory `ev_bd63706d…`).
- Files the model rests on: `Schematics/Polivoks_filter/Polivoks filter.kicad_sch` (sha256 `dede33f6…2b6df6de`)
  and `Schematics/Schematic.pdf` (sha256 `d3f9abea…88ebda09`).
- The netlist was recomputed from the KiCad file (wires, junctions, labels, power symbols) and agrees with the
  drawing on every node of the signal path. The script is not kept here; it lived in the session scratchpad.

## The circuit, stage by stage

Reference designators are the schematic's; values are nominal.

**Control path.** U1A (TL072) is an attenuverter on CV1: out = (1 + R5/R1)·wiper − (R5/R1)·CV1 with RV2 between CV1
and ground, so its gain runs from −1 to +1 and its zero sits at R5/(R1+R5) of the travel. U1B sums currents into its
virtual earth: the FRQ pot RV1 (from +12 V) through R2 180k, CV2 through R3 100k, U1A through R6 47k and +12 V through
R7 100k. Q1 (2N3904) is U1B's feedback, with R8 3k across its base and emitter. Base current is negligible, so
V<sub>BE</sub> = I<sub>in</sub>·R8 and the collector current is exponential in the input current: one octave per
V<sub>T</sub>·ln2/R8 = 5.94 µA, which is **0.594 V on CV2** and 0.28 V on CV1 at 25 °C. Nothing compensates for
temperature: I<sub>S</sub> and V<sub>T</sub> both move, about **+1.3 octaves per 10 °C** at mid-range. The supply
matters too: R7 and RV1 draw from +12 V, so 1 % on the rail moves the cutoff about 0.3 octave.

**Iset.** Q1's collector feeds both MC1776 Iset pins (pin 8, a diode below V+) through R12 and R15 (110k). At low
current the split follows the two chips' diode mismatch; at high current it follows R12/R15:
2V<sub>T</sub>·atanh(d) + I<sub>C</sub>(R<sub>m</sub>d + R<sub>d</sub>) = V<sub>T</sub>·ln(I<sub>S2</sub>/I<sub>S3</sub>).
The 110k resistors also cap the current where the collector would meet the emitter.

**Core.** U2A and U3A run open loop as integrators. U2's inverting input sums AUDIO (RV3 wiper via R4 47k), the
resonance wiper (RV4 on BP, via R9 47k) and LP (via R10 47k) against R11 1k to ground, so its input is about 1/50 of
the sum. U3's non-inverting input takes BP through R13/R14, 1/48. Each 776 is modelled by its 741-style input pair:
dV/dt = SR·tanh(V<sub>d</sub>/V<sub>k</sub>) with SR = m·I<sub>set</sub>/C<sub>c</sub>, V<sub>k</sub> = 4V<sub>T</sub>,
C<sub>c</sub> = 30 pF, m ≈ 1, a leak of ω<sub>u</sub>/A<sub>0</sub>, and outputs that stop at about +10.7/−11.0 V.
This is a slew-limited state-variable filter: BP = U2 out, LP = U3 out, k = (resonance wiper conductance)/(LP
conductance) the damping, Q = √(b/a)/k.

**Why it self-oscillates.** At k = 0 the loop is lossless. Each 776's second pole (about 2.5 × its unity-gain
frequency) lags the loop by ω/p, which at the cutoff is negative damping of b(1/p₂ + 1/p₃) ≈ 0.017 in k units. So the
filter breaks into oscillation in the last 2 % of the RESONANCE travel (98.3 % for an ideal unit); turned fully, the integrators slew and hit
the rails, and the pitch falls well below the small-signal cutoff.

**Outputs.** C11/R16 (0.26 Hz) and C12/R17 (0.21 Hz) couple to inverting buffers: BP ×1.61 (U4B, R18/R16), LP ×1.33
(U4A, R19/R17). RV5's wiper is grounded: at one end it shorts MIX1 (BP), at the other MIX2 (LP), and in between the
two reach U4C (R26 240k) at about 0.75 each, roughly equal power; U4D inverts back. Every TL07x output clips softly
near ±10.5 V.

**Numerics.** The core runs at 4× (or 2×) the audio rate, as a trapezoidal zero-delay solve of both integrators with
the tanh linearised from the previous step and refined once, prewarped at the cutoff, rails clamped after the solve.
The control path runs at fs/4 and its integrator gains are interpolated across the oversampled steps. Kaiser half-band
FIRs decimate (192→96 kHz: 23 taps; 96→48 kHz: 95 taps, flat to 21 kHz, below −96 dB from 27 kHz) and interpolate the
line input.

**Assumptions to know about.** The 776 calibration (tail current = Iset, C<sub>c</sub> = 30 pF, V<sub>k</sub> = 4V<sub>T</sub>,
p₂ = 2.5ω<sub>u</sub>) is from the datasheet's architecture, not from a measured unit. It places FRQ alone at about
4 Hz–10 kHz. A measurement of a real module would recalibrate it.

## Imperfections

A unit is generated from its serial number (`makeUnit(seed, grade)`), so the same serial is the same instrument:

| | Ideal parts | Modern build | Vintage |
| --- | --- | --- | --- |
| Resistors | nominal | 1 % | 5 % |
| Pots (value; end resistance 0.3–0.9 %) | nominal | ±20 % | ±20 % |
| Q1 I<sub>S</sub> (σ ln 0.35), β (σ ln 0.25) | nominal | ×1 | ×1.6 |
| Each 776: bias ratio, C<sub>c</sub>, V<sub>os</sub> (σ 1.5 mV), V<sub>k</sub>, Iset diode, second pole, swing, A<sub>0</sub> | nominal | ×1 | ×1.6 |
| Regulator (σ 0.2 %), warm-up rise (+3 °C, τ 8 min) | none | yes | yes |
| 776 hiss (∝ 1/√Iset) | datasheet level | datasheet × slider | 2.5 × slider |
| VCO tuning, scale, tempco, reset time, saw bow, square asymmetry, drift | perfect | yes | ×2 |
| VCA bleed and control feedthrough | none | yes | yes |

Also on the page: room temperature, warm-up on/off and a cold start, rectifier ripple on +12 V at twice 50 or 60 Hz
(it modulates the cutoff through R7 and RV1), hiss, and pot wear: a turning wiper may lift for 0.2–3 ms, which drops
the cutoff (FRQ), lets the filter ring (RESONANCE), mutes the input (AUDIO) or un-shorts the mixer (MIX).

The circuit's own character is not an imperfection and stays in every grade: the exponential converter, the 1.68×
over-tracking of a 1 V/octave keyboard on CV2, slew limiting, rails, clipping buffers and the second-pole oscillation.

## The synthesiser around it

Our own simple design, not the Formanta Polivoks: two VCOs (32'–2', triangle, bowed saw, square, pulse; polyBLEP at
the oversampled rate), a mixer with noise into AUDIO IN, EG 1 (0–5 V) into CV1 through the module's attenuverter,
keyboard tracking and the LFO into CV2, EG 2 into a VCA (or held open), glide, mono or duo (VCO 1 lowest note, VCO 2
highest), legato. Line in sends a microphone or interface through the filter instead.

## Songs

| Song | By | Arranged for |
| --- | --- | --- |
| In the Hall of the Mountain King | Edvard Grieg, 1875 | Growl bass; the theme four times, an octave up and faster each pass |
| Prelude in C major, BWV 846 | J. S. Bach, 1722 | A plucked arpeggio; bars 1–11, then home to C |
| Minuet in G | Christian Petzold, 1725 | A pulse-and-saw lead |
| Ode to Joy | Beethoven, 1824 | Duo brass, in D as in the symphony |
| Korobeiniki | Russian folk song (Nekrasov, 1861) | The scream lead, verse and refrain twice (the folk rhythm, not a game's) |
| Für Elise | Beethoven, 1810 | Soft triangles, the opening twice |
| Greensleeves | English traditional | The filter whistling by itself: no oscillators |

The composers died long ago, so the music is in the public domain; the transcriptions are our own, not copied from
an edition or recording. Songs run inside the AudioWorklet (`songStart`, `songTick`: control-rate, within four
samples), share the voice with the keyboard, and their notes are released when a song stops or ends. Choosing a song
loads the patch it was arranged for; levels were balanced from offline renders to within about ±3.5 dB (rms 0.060–0.113).
The whistle patch is tuned so serial 1982 at 22 °C plays A4 at 440 Hz; it tracks within 16 cents above E4 and is
54 cents sharp on E4 itself, as the circuit is.

## Sakura Shōten jingles

The owner, 3 November 2026: "render the Sakura konbini jingles with the PF-82, put it needs to be fun and playful and
fitting". Five new tunes for the konbini in Minato, written in `jingles/sakura.js` with the moment, place and reason for
each, kept to the shop's real day (`johansson-town/src/commerce/sakura-rota.js`) and to the Ryukyu scale of Okinawan
island songs (C E F G B):

| Jingle | When | Length | Sound |
| --- | --- | --- | --- |
| Door melody | someone steps through the door while the shop is open | 1.7 s | triangle with a square an octave up, a ringing filter |
| Till "pi-pon" | a sale goes through, 09:00 to 20:00 | 0.5 s | square and triangle, two notes |
| Shop jingle | between songs on the shop's radio | 7.4 s | the scream lead with a kachāshī swing; the hook sings "sa-ku-ra-shō-ten" |
| Good morning | 09:00, the shutter goes up (never on Saturday) | 4.1 s | two saws a few cents apart, the filter opening slowly |
| Closing waltz | 20:00 to the shutter at 20:30, looping | 30 s | two triangles, a music box |

`node polivoks/jingles/render.mjs` plays them through the page's own engine on **the shop's unit, serial 13715**
(modern build, 22 °C, no warm-up; `SHOP_UNIT` in `agent.js`) and writes `jingles/sakura/`: 48 kHz 16-bit WAV masters
at −1 dBFS peak, MP3 listening copies (ffmpeg) and `manifest.json` (engine and score hashes, so a test notices a stale
file). The closing waltz is rendered twice through and the second pass kept, its seam cross-faded over 30 ms, so the
WAV loops without a click. Renders are deterministic.

Why that serial: of the first 30,000, its two oscillators track best, both within 2 cents from C3 to C6. On serial
1982, the page's default, they are 12 cents flat and 32 cents sharp at C5, which made the door melody sour. Measured
on the renders, every note of every jingle sits within 11 cents of pitch (most within 6), the vibrato and glide of the
shop jingle included.

Rendering them found a bug in the engine: the two oscillators started half a period apart, so two unison saws cancelled
every odd harmonic and a held note sounded an octave up until the oscillators drifted apart (for ever on an ideal unit).
They now start in step, as two timing capacitors do at power-on; `tests/dsp.test.mjs` holds it.

On the page the jingles have their own section, with the shop's recordings in players (the waltz as a looping WAV),
and a group in the song menu: "Play on the PF-82" plays the same notes on the listener's own unit. Agents get them
too: `pf82_list` lists them, `pf82_render { id }` renders one on the shop's unit unless a serial is given. They are not
yet wired into Johansson World or the Sakura game.

## In 3D, from CAD

The owner: "I dont understand what patch and all means, can you build the assets in Cad, and Three.JS so it has 3d".
`cad/pf-82/` is a CAD package in the repository's own style (after `cad/cargo-ship-berth/`): `specification.txt`,
`build.py` (build123d; `uvx --from build123d python cad/pf-82/build.py`) and `drawing.py` (the general arrangement,
`drawing.svg`). The model is the instrument a Johansson Denki PF-82 would be: a 640 × 400 case with walnut cheeks, a
600 × 219 panel sloped at 16.45°, 37 keys, and every control of the page in the page's order and numbering. It
exports STEP in millimetres (`out/`, not committed) and, for the page, `polivoks/3d/pf82.glb` in metres with a layout
of every control. `view3d.js` merges the CAD's 845 face-meshes into 164 draw calls, prints the legends onto the panel
from the layout in English or Russian, turns each knob about its own axis, and lets the person drag knobs, click
selectors, jacks and Power, play the keys, look around, and zoom (pinch, or Ctrl/⌘ and scroll). Plain scrolling still
scrolls the page.

## In plain words

The panel says SOUND where synth players say patch, every module carries an everyday subtitle (makes the tone,
blends them, shapes the tone, loudness, a slow wobble …), the help line avoids jargon, and "What do the words on the
panel mean?" under the introduction explains sound, VCO, mixer, VCF, VCA, envelope, LFO, CV, jacks, glide and
imperfections in one line each.

## For synthesiser players

The modules are numbered and named like the signal-flow map above them (1 VCO 1, 2 VCO 2, 3 Mixer, 4 VCF, 5 VCA and
ENV 2, 6 ENV 1, 7 LFO, 8 Keyboard). A block lights its module and a module its block; clicking a block goes there.
The help line says what any knob, switch or jack does when pointed at or focused.

## Measured (Node 22, this session)

| Check | Result |
| --- | --- |
| CV2 sensitivity | 0.594 V/oct; +0.594 V → +1.000 octave (±1 %) |
| FRQ alone | 4.3 Hz … 10.2 kHz (ideal unit) |
| Temperature | +10 °C → +1.30 octaves |
| Low-pass at RES 5, FRQ 8 | f₀ 1317 Hz, Q 3.28; peak +10.3 dB at f₀ (20 log Q = 10.3); −13.8 dB per octave from 2.6 to 5.2 kHz |
| Self-oscillation | RES 9.5 stays quiet (2 mV); RES 9.85 oscillates at 1230 Hz; RES 10 reaches the rails at 715 Hz (f₀ 1317 Hz) |
| Extreme drive | ±12 V square at full resonance and +5 V CV: no NaN, core within the 776 swing |
| Line input | unity gain through both interpolators (within 5 %) |
| Budget | 10 s of audio in 0.97 s at 4× (10× real time), 0.58 s at 2× |
| Sakura jingles | every note within 11 cents on the shop's unit; the waltz's loop seam 0.002 against a largest step of 0.27 |

## Run

```bash
cd polivoks && npm test
```

```bash
python3 polivoks/art/draw.py
```

```bash
node polivoks/jingles/render.mjs
```

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/polivoks/` and press Power.
