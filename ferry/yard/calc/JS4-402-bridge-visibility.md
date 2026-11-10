# JS4-402 · Navigation bridge visibility

Johansson Shipyard, newbuilding No. 1, Chisum. Calculated by `ferry/yard/calc/bridge_calcs.py` from the model as built (`ferry/data/ferry.bin.gz`) and the builder's own measures (`ferry/blender/wheelhouse.py`). Revision 1, 11 November 2026.

**Requirement.** SOLAS chapter V, regulation 22, as adopted by resolution MSC.99(73) and amended by MSC.142(77): read for class comment sheet PA-001 revision 1, which lists the paragraphs. It binds ships of 55 m in length overall and more; she is 34.5 m and is held to it as the benchmark the yard and class agreed. The recommended heights of the glass are from IACS Recommendation 95 (revision 1), which is a recommendation.

**The conning position** is declared as standing at the wheel, on the centreline, 20.9 m from the transom (13.6 m abaft the stem). The regulation names no eye height for the view of the sea; the yard takes 1.50 m (a short helmsman, the worst case for looking over the console) and 1.80 m.

## 1. The sea surface over the bow (22.1.1)

With the bow ramp stowed upright, at her laden draught (1.9 m), level trim. Not to be hidden more than two ship lengths (69 m) or 500 m, whichever is less, forward of the bow, to 10° on either side.

| Eye over the deck | Bearing | The line of sight dips | It grazes | Sea hidden to, ahead of the bow |
|---|---|---|---|---|
| 1.50 m | 10° to starboard | 13.3° | the wheelhouse's own framing, 23.00 m from the transom (x -0.37) | 31 m |
| 1.50 m | 5° to starboard | 8.1° | Rudder angle indicator, console (STR-06) | 61 m |
| 1.50 m | ahead | 13.1° | Window wiper, centre (NLT-14) | 32 m |
| 1.50 m | 5° to port | 8.1° | Engine instrument panel (PRP-06) | 61 m |
| 1.50 m | 10° to port | 8.0° | Engine instrument panel (PRP-06) | 62 m |
| 1.50 m | **worst of every whole degree: 10° to port** | 8.0° | Engine instrument panel (PRP-06) | **62 m** |
| 1.80 m | 10° to starboard | 20.7° | the wheelhouse's own framing, 23.00 m from the transom (x -0.37) | 15 m |
| 1.80 m | 5° to starboard | 16.4° | Rudder angle indicator, console (STR-06) | 23 m |
| 1.80 m | ahead | 19.1° | the stowed bow ramp, 8.03 m above the keel | 18 m |
| 1.80 m | 5° to port | 16.4° | Engine instrument panel (PRP-06) | 23 m |
| 1.80 m | 10° to port | 16.2° | Engine instrument panel (PRP-06) | 24 m |
| 1.80 m | **worst of every whole degree: 10° to port** | 16.2° | Engine instrument panel (PRP-06) | **24 m** |

**Result: the sea is hidden to at most 62 m ahead of the bow; 69 m is allowed.** The first calculation, for revision 0 of the design, gave 176 m at 5° either side for the 1.50 m eye: the engine instrument panel and the console's rudder angle indicator stood 0.39 m over the console on stand-offs, and the control levers 0.30 m. The yard lowered the two panels onto the console (0.22 m) and shortened the levers (0.19 m, on new control heads). Nothing ahead of the wheel now stands higher than 1.22 m over the deck.

For information, not asked by the regulation of anything but the conning position: seated in a chair, eye 1.50 m over the deck.

| From | Worst bearing | It grazes | Sea hidden to, ahead of the bow |
|---|---|---|---|
| Master's chair | 9° to starboard | Conning display (NAV-10) | 59 m |
| Watch officer's chair | 10° to starboard | Radar display (NAV-01) | 63 m |

## 2. Blind sectors from the conning position (22.1.2, 22.1.3)

A bearing is counted blind when the sea 500 m off is hidden from an eye 1.50 m over the deck, taken every half degree from the model. The regulation limits what stands **outside** the wheelhouse forward of the beam: no sector over 10°, 20° in all, 5° within the view of section 1. The wheelhouse's own framing is judged by 22.1.9.2 (kept to a minimum, none immediately forward of a workstation) and is listed here for what it is.

- **Outside the wheelhouse, forward of the beam: 2 blind sectors, 8.0° in all**: 4.0° at 64.2° to starboard (Sidelight, starboard (NLT-03)); 4.0° at 64.2° to port (Sidelight, port (NLT-02)).
- The wheelhouse's own framing: 14 frames in the 225°, the widest 5.5° (a corner post or a door's edge), 53° in all: **164° of the 225° are clear glass.** The windows reach to 112° on each side (22.5° abaft the beam is 112.5°); the builder's own count, 224° of 225°, takes a frame under 6° as part of the window it stands in, and the build stops under 220°.
- Abaft the beam, to 22.5° on each side: nothing outside the wheelhouse hides the sea.

Frames within 30° of the bow, as seen from the wheel: 15.2° to starboard (5.0°), 15.2° to port (5.0°).

## 3. From each bridge wing (22.1.4, 22.1.5)

The field asked: from 45° on the opposite bow through right ahead, and round to right astern on the wing's own side: 225°. Standing at the wing control station, eye 1.50 m; what is seen through the wheelhouse's own glass counts as seen. The first calculation, with the station across the whole wing and its levers inboard, found the house's forward corner hiding 13.5° inside the arc, at 29° to 42° on the opposite bow; the yard moved each station to the outboard forward corner of its wing.

- **Port wing** (standing 3.88 m off the centreline, 22.38 m from the transom): 225° of the 225° clear. Hidden over 3° or more: nothing.
- **Starboard wing** (standing 3.88 m off the centreline, 22.38 m from the transom): 225° of the 225° clear. Hidden over 3° or more: nothing.
- The ship's side (22.1.5): each wing's outer rail is 4.16 m off the centreline and her side at the deck 4.20 m; the side and the fenders are seen by leaning over the rail.

## 4. The glass (22.1.7 to 22.1.9)

- Forward windows inclined 10° from the vertical, top outward (22.1.9.1: 10° to 25°).
- Framing (22.1.9.2): the mullions between the forward panes are 0.10 m wide and the corner posts 0.06 m (150 mm is the recommended most). None is straight ahead of a workstation: the wheel (centreline) looks through the middle of the middle pane, which is 1.06 m wide; each chair (1.05 m off the centreline) through the pane beside it, whose glass runs from 0.63 to 1.70 m.
- Lower edge of the forward glass 0.99 m over the deck (22.1.7: as low as possible; recommended 1.00 m at most).
- Upper edge of the forward glass 1.96 m over the deck, 2.24 m ahead of the conning eye (22.1.8: the horizon to stay in view for an eye at 1.80 m when she pitches; 1.60 m where the Administration allows). An eye at 1.80 m keeps the horizon until she pitches 4.0° by the bow, an eye at 1.60 m until 9.0°. **The recommended 2.00 m is not reached.** The deckhead is at 2.08 m (the underside of the compass deck) and limits the glass: the yard raised its head from 1.95 to 2.00 m (the glass itself to 1.96 m) for PA-001; reaching 2.00 m of glass needs the wheelhouse roof raised by about 0.10 m. Open with the owner.

## 5. The lights' sectors (JS4-404)

**Requirement.** COLREG Annex I, as read for PA-001 revision 1: 2(a)(i), 2(g), 2(i)(i), 3(d), section 5 and 9(b). The cut-off of a sidelight outside its sector (9(a)) was not read and is quoted from memory. Each sector below is looked along from the lantern's own lens in the model, every half degree.

- **Masthead light** (white, 225°): on the front of the mast, 12.3 m above the hull; her beam is 8.4 m, so 2(a)(i) asks at least 8.4 m. 3.74 m forward of amidships (3(d)). In its sector, from the lens: **nothing**.
- **Sidelight, port**: on the wing rail, 8.3 m above the hull, under three quarters of the masthead light's height (9.2 m; 2(g)). In its own sector: nothing. Its matt black screen (section 5) is 0.42 m long and stands 0.09 m inboard of the lens: the middle of the lens is still seen **14.5° across the bow**.
- **Sidelight, starboard**: on the wing rail, 8.3 m above the hull, under three quarters of the masthead light's height (9.2 m; 2(g)). In its own sector: nothing. Its matt black screen (section 5) is 0.42 m long and stands 0.09 m inboard of the lens: the middle of the lens is still seen **14.5° across the bow**.
  **Open (PA-001 comment 22):** the practical cut-off asked is 1° to 3° outside the sector. Either the lantern's own screening gives it (the maker's certificate), or the screens are made 0.9 m long, which the wing has no room for with the lantern on its rail: the yard proposes lanterns in boxes let into the wing bulwark under the rail.
- **Not-under-command lights, upper pair** (red, all round), 13.0 m above the hull: the port lantern alone is hidden over 26° (the mast, and whips of the antennas), the starboard one over 26°; 9(b)(i) allows 6°, so one lantern would not do. **Both are hidden together on 0° of the horizon.** They are 0.6 m apart: one light at a mile (9(b)(ii)).
- **Not-under-command lights, lower pair** (red, all round), 11.0 m above the hull: the port lantern alone is hidden over 36° (the mast, and whips of the antennas), the starboard one over 36°; 9(b)(i) allows 6°, so one lantern would not do. **Both are hidden together on 0° of the horizon.** They are 0.6 m apart: one light at a mile (9(b)(ii)).
  The two heights are 2.0 m apart and the lower is 11.0 m above the hull (2(i)(i): 2 m apart, the lowest 4 m above the hull).
- **Anchor light** (white, all round): on the crown of the mast. Hidden: nothing (9(b)(i) excepts anchor lights in any case).
- **Stern light**: at the after end of the passenger deck, which is still the other ship's drawing; its sector is to be shown when that section is rebuilt.

## Open

- The roof's height and the 2.00 m upper edge of the glass (owner).
- The same calculation at the light draught and with trim by the stern, when the stability booklet (JS1-104) gives those waterlines.
- The stern light, with the passenger deck.
