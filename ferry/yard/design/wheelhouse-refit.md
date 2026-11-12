# The wheelhouse refitted: record of the work, stage by stage

Johansson Shipyard · design record · 12 November 2026 (night) · newbuilding No. 1, the Chisum · branch `claude/chisum-wheelhouse`

The owner, of the navigation bridge as first built: **"It still looks like Lego create a realistic bridge"**; then "go back
to the bridge and increase realism by about a million"; "you have no budget on the 3d model, focus on photorealism and
reality"; "Every lever everything needs to be interactive"; "I want everything to be interactive in the bridge"; "a
transparent coffe can we can animate with coffee"; "I want you to make the whole ship realistic and audit yourself after
every step".

This is the record of that refit, done overnight without the owner. It says, for each stage, what was compared with what,
what matches, what does not match yet, what was put right, and what is owed; every new look, every fitting rebuilt, every
motion added, and the checks actually run with their real counts.

## The pattern

The owner's two photographs of a real ferry's wheelhouse (`../reference/owner-photographs-2026-11-11.md`, rows F3 and F4).
The pictures themselves were not before this session: it worked from their description, which is this list. Every audit
below goes down it item by item.

| | The photographs show |
|---|---|
| T1 | The consoles in one block on the centreline, painted a strong marine blue; sloped desks with dark instrument fields; flush panels of push buttons and lamps, small displays, telephones, a handset on a curly cord, control levers; a grab rail of stainless tube along the desk's edge |
| T2 | Two pilot chairs behind the block, high-backed, black, on pedestals that run on rails let into the deck |
| T3 | Windows all round between wooden mullions (light varnished wood facing the room, the glass in black rubber) |
| T4 | Round clear-view screens in two of the front windows; wipers outside |
| T5 | A continuous handrail under the sills on brackets; sockets and a small recessed box in the lining below the sill; the lining below the sill plain white panels with a dark skirting |
| T6 | The deckhead in long narrow strips running athwartships, off-white, with instruments hung under it over the windows (repeaters, a clock), small round lights, a sprinkler head, a loudspeaker, a smoke detector |
| T7 | A blue vinyl deck, slightly glossy, with dark rubber mats where one stands |
| T8 | Abaft the block a watchkeeper's table with a ship's profile engraved in its wooden top and a cup well in its corner, and a black leather sofa |
| T9 | The light comes in low through the glass and lies in bright bands on the mullions and the desk |

She is a classic ship of the 1970s kept in service and refitted: what is characterful and already aboard stays (the wooden
wheel on its stand, brass where there is brass, the wing repeaters).

## How the pictures are taken

`ferry/tools/shots-bridge.cjs <folder> [views]` (new; on the pattern of `shots.cjs`, which stands outside the room for two
of its interior views): thirty views of the bridge from the page itself on foot, drawn on this Mac's graphics card (it
says which it got: *ANGLE Metal Renderer: Apple M1 Pro* every time). A view is an eye and what it looks at, in the bridge's
own measures, and what is worked for it. The pictures are in `/Users/nilsjohansson/Developer/chisum-screens/2026-11-12/4-wheelhouse/<stage>/`
(outside the repository). Every picture named in this record was opened and looked at.

## Stage 0. As found

`0-before/` (30 views). 574,519 triangles; `make.sh` "built: every check passed" (0 pairs of faces in one plane, 0 afloat of
5,086 pieces, 17 runs carried), on the commit this branch starts from (`02154d9`).

What the pictures show, against the pattern: a teal table 5.5 m wide from wall to wall with a cream top (T1: no); black
boxes standing on it, each a prism with a picture on its face, their keys only drawn (T1: no); two chairs of plain boxes on
a disc and a post (T2: no); the windows in dark painted frames between cream posts (T3: no); no clear-view screen (T4: no);
no handrail, one socket (T5: no); a cream slab with painted seams and four oblong lamps that give no light (T6: no); a grey
deck (T7: no); neither table nor sofa (T8: no). The light of the room is right (T9: the light bake of the same day), and
the after end of the room is dim because no lamp in it is lit.

## Stage 1. Real materials

**What was done.** The house itself was given a real bridge's materials and the old fittings were put in them; no fitting's
shape was changed yet.

*New looks* (`shipyard.LOOKS`, each with its kind of surface in `shipyard.SURFACES`; none of the old looks was repainted):

| Look | What it is | Surface |
|---|---|---|
| Marine enamel | Gloss enamel on the consoles | paint |
| Matt black | Desk tops and instrument fields | matt |
| Hammer finish | Dimpled enamel of equipment cases | hammer (new) |
| Black anodised | Instrument plates and bezels | metal |
| Laminate | Lining panels, white joinery | laminate |
| Deckhead strip | The deckhead's strips | laminate |
| Vinyl deck | Sheet vinyl, a little glossy; the skirting | vinyl |
| Rubber | Window gaskets, mats, cords, gaiters | rubber (new) |
| Stainless | Rails, screws, hinges | metal |
| Light wood | Varnished mullions, sills, casings | wood |
| Leather | Chairs and settee | leather |
| Cloth | Woven stuff: flags, lifejackets | cloth (new) |
| Dial glass | The glass over a dial or a display | (clear) |
| Blind film | A sun blind's tinted film | (clear) |
| Coffee | What is in the jug | (none) |
| Lit lamp, Lit amber, Lit white | Lamps that are lit: each is a lamp to the light traced through her | (gives light) |

*New kinds of surface* in `ferry/look.js` (`SURFACES`): `rubber` (a fine dull grain), `cloth` (a weave), `hammer` (the
dimpled paint of equipment cases). Nothing else in `look.js` was touched.

*Her colours*, chosen to be believable in daylight (no saturated toy colour): console enamel `#2c517c` (it was first
`#25558e`, which the picture from the port end showed as a cobalt too vivid for paint in shade: toned down); desk tops
`#24282b`; linings `#e8e6dd`; deckhead `#efeee8`; skirting `#2c3a4a`; deck vinyl `#4a6c96`; mats `#1e2124`; light wood
`#c49a5e`; the wheel's and the chart table's mahogany `#6b4429` (it was `#765032` and went orange once the room was lit);
leather `#1d1d1f`; stainless `#c6ccce`; hammer grey `#7a8387`.

*The house* (`wheelhouse.py`: `envelope`, `ceiling`, `floor`):
- every window's glass sits in a black rubber section; outside it a painted steel frame stands 8 mm proud of the plating;
  inside, the forward posts and mullions are faced in light varnished wood, 12 mm proud of the lining, with wooden rails
  under and over each pane and a sill board along the front; each side window has a wooden casing and a sill board;
- the linings are off-white laminate with a joint at each panel; on the after wall, which is the ship's own (`steel.py`,
  cream), the bridge's laminate is laid over the ship's lining, 10 mm thick;
- the deck's vinyl is turned up every wall as a coved skirting 0.10 m high, in a darker blue;
- the deckhead is eighteen strips 185 mm broad running athwartships with a 15 mm shadow gap, over a dark backing;
- the deck is blue sheet vinyl with two welded seams; ribbed rubber mats at the helm and at the two conning positions;
- the four deckhead lamps are lit (they are lamps to the light bake, which now lights the room's after end).

**Compared: `1-materials/helm.png`, `block-from-port.png`, `aft.png` against the pattern, and against `0-before/`.**

| | Matches | Does not match yet |
|---|---|---|
| T1 | The console is marine blue with a dark top; a stainless rail along its edge | It is still a table from wall to wall with boxes standing on it; nothing is set in |
| T2 | The chairs are black | They are still boxes; no rails |
| T3 | Light wood mullions and rails, glass in black rubber: this reads as the photograph's windows | Corners of the rubber are square |
| T4 | | No clear-view screen; the wipers are a bar on the sill |
| T5 | White panels with joints, a dark coved skirting | No handrail, no box in the lining |
| T6 | Strips athwartships, off-white | Lamps oblong; the instruments are flat discs on a blue box; no sprinkler |
| T7 | Blue vinyl with mats | |
| T8 | | Neither table nor sofa |
| T9 | Bands of sun on the mats and the deck; the wooden mullions take the light | |

**Put right in this stage.** One pair of faces in one plane, found by `zfight.py` on the first build: the flanges of the
three brass dials on the after wall ended in the plane of the new lining panels (the panels were made 10 mm thick instead
of 12). The blue and the mahogany, as said above.

**Checks actually run on this stage.** `ferry/blender/make.sh /tmp/chisum-w.npz /tmp/chisum-w.blend`: "built: every check
passed" (578,155 triangles, 3.82 MB; 0 pairs of faces in one plane; 0 afloat of 5,215 pieces; 17 runs carried; the light
bake). The six page checks against this worktree on port 8772, one at a time: **bridge 25, doors 17, stairs 50, travel 5,
zoom 14, offline 5: all pass.** Said as it happened: on the first run `bridge.cjs` passed 22 and then timed out opening
its second page (the phone), and `doors.cjs` failed its tap on the drinks machine; run again alone `bridge.cjs` passed 25
of 25; `doors.cjs` failed the same tap a second time and passed 17 of 17 the third time. Both are the failures the
handover already describes (a tap on foot that does not wait for a frame; the machine had a load average of 20 to 25 all
night from the other sessions' builds). Neither touches the bridge.

**Owed after this stage.** Everything of T1, T2, T4, T5, T6 and T8 that is a matter of shape: stage 2.
