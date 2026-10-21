# One ground for Minato: the standard

The owner, 21 October 2026, on his phone: "the roads seems to have reversed to chaos again… Can you make a plan to
finally fix the roads to a unified system? Pavement? Walk paths, grass and sandy beach?" The plan was approved
("Go ahead"). This page is the plan of record. It covers the rulebook, the edges, the audit and what it finds today, and
the order of the work.

- **The rulebook** is `src/world/ground-standard.js`. It is the only place a ground colour, height or edge is written.
  The old `render/ground-palette.js` `GROUND`, `world/ground-layers.js` `GROUND_LAYER` and
  `world/road-standards.js` `ROAD_STANDARD.kerb` now just re-export it.
- **The audit** is `tools/ground-audit.mjs`. It builds the town and samples a 25 cm grid over it. At each point it takes
  the ground a person stands on and checks it against the rulebook.
- **The ratchet** is `tests/ground-standard.test.mjs`. Today's findings are listed in
  `tests/fixtures/ground-baseline.json`. The test fails on a new finding or one that grew. It also fails when a finding
  is fixed but still listed, so the list can only shrink.

## Why the ground was chaos (the survey, 21 October)

- About twenty modules each drew their own ground slab. Between them they used about thirty colours (the palette had
  seven), about fifteen top heights (the layers named three) and four kinds of kerb.
- Nothing said what happens where two surfaces meet.
- `streetClass()` regexes gave every building a 2 m concrete or brick ring (`building-circuit-*`), even in sand or lawn.
- The phase-4 removals left paths that end in grass.
- `walk-surface.js` raycasts whatever is drawn, so a slab at the wrong height never failed.
- The z-fighting and ground-clearance tests skip polygon-offset surfaces. No test checked edges or connections.

## The rulebook

Heights are the top of the finished surface above the district's datum. The datum is the town plan's 0 (`layout.js`
`planHeight`). The open island ground outside the town lies 40 cm lower. Colours are the material colour in sRGB.
**Today** is the tone the town draws a class in until its step moves it; step 1 changes nothing that is drawn.

| Class | Belongs in | Top | Standard colour | Today | Finish |
|---|---|---|---|---|---|
| Asphalt road (`road`) | Main Street, Kitano Road, the quay driveway, car parks | 4 cm (the carriageway is the datum's finished surface) | `#5f6266` dark grey | `#a9aeb4` blue-grey | dense asphalt, patched where dug up |
| Back lane (`lane`) | Kitahama, Nishi, between houses; no footway | 4 cm | `#676a6c` | concrete `#b7b5ab` | thin asphalt over concrete, patched |
| Brick pavers (`pavers`) | Main Street's footways and shop fronts only | 19 cm (one kerb above the road) | `#b0907a` reddish beige | `#c6c3ba` at 4 cm | interlocking blocks, reddish and beige |
| Concrete (`concrete`) | aprons, forecourts, yards, other footways | 19 cm beside a road; flush (4 cm) where no road is beside it | `#c4c0b4` pale grey-beige | `#b7b5ab` | poured in 2 m bays, broom finish |
| Quay concrete (`quay`) | the quays and piers | its own level, 4 cm ±8 | `#b3b0a6` | several greys | heavy concrete; coping at the water |
| Park path (`park-path`) | Harbour Park, the school, the east lawn | 4 cm, flush with the grass edging | `#cbb994` | `#cfc2a0`, `#d2c39d` | rolled crushed stone |
| Grass (`grass`) | lawns and verges | 2 cm, just below the paths; follows the land where it slopes | `#5c9848` | same | mown lawn |
| Coral sand (`coral-sand`) | Nishi-machi's yards; Kitahama's unpaved lots | 2 cm, like grass | `#ddd6c4` | `#e2dac8` | crushed coral, raked |
| Beach sand (`beach-sand`) | the coast | graded down to the sea, −1.3 to +0.06 m | `#eee3c6` coral-white | `#e3d2a4` | beach sand |
| Gravel yard (`gravel`) | work yards, the boat yard, the sacred grove | 2 cm | `#a29e93` | same | grey crushed limestone |
| Garden earth (`earth`) | Kitahama's and Nishi's plots, beds and cane rows | 4.5 cm (25 mm proud of the lawn) | `#9a5f40` | same | red Okinawan earth |
| Timber deck (`deck`) | boardwalks and timber piers | the quay's level | `#8a7559` | several browns | treated timber boards |

Each class records in the data where it belongs and why. The audit reports a class drawn outside those districts as
*out of place*.

### The edge elements

| Edge | Size | Colour |
|---|---|---|
| Concrete kerb | 15 cm high, 18 cm wide (dropped flush at crossings) | `#cac6bb` |
| White edge line | 15 cm wide, 30 cm in from the lane's edge | `#f2efe6` |
| U-gutter with concrete lids | 30 cm wide, lids flush with the lane | `#8d918f` (Kitahama's lid tints are accepted) |
| Stone edging | 10 cm wide, top flush with the path | `#9e9a8f` |
| Coral-stone edging | 15 cm wide | `#d8cfba` |
| Quay coping | 30 cm, painted safety yellow where boats come alongside | `#e0b93a` |

### The edge rules: what stands between two classes

| Meeting | Edge |
|---|---|
| road / pavers, road / concrete, road / grass, road / park path, road / coral sand, road / gravel, lane / pavers | **kerb**, 15 cm |
| lane / concrete, lane / grass, lane / coral sand, lane / gravel, lane / earth | **white edge line and U-gutter** |
| park path / grass, concrete / grass, pavers / grass, grass / gravel, concrete / gravel, earth / concrete, earth / gravel | **stone edging** |
| coral sand / grass, coral sand / concrete, coral sand / park path, coral sand / earth | **coral-stone edging** |
| grass / beach, park path / beach, coral sand / beach, concrete / beach, quay / beach | **graded**, never a step |
| road / lane, road / quay, road / deck, lane / park path, lane / quay, pavers / concrete, pavers / park path, concrete / quay, concrete / park path, concrete / deck, quay / deck, quay / gravel, earth / grass | **flush** (a joint and nothing else) |
| any pair not listed | stone edging: two surfaces never simply touch |

## The audit

`node tools/ground-audit.mjs` prints the counts by district and by kind, the ten worst places and the largest findings.
`--json` prints everything. `--diff` shows what the ratchet would say. `--write-baseline` records a fix, and should be
run only after one.

1. **Collecting surfaces.** It builds the town as the geometry tests do. It collects every upward-facing surface with a
   top below 20 cm over a square metre, polygon-offset slabs included. Road paint and other decals are recorded as
   markings on top. It leaves out water, boats, a building's own plinth, porch, step or shop front, and anything
   under a roof.
2. **Classifying them.** The audit takes a drawing's word for its class where the drawing gives one. A coordinated
   street patch knows its street class, and some meshes are named for what they are, such as "Main Street footway" or
   "Kitano Road carriageway". Everything else is classed by colour, using the nearest of the rulebook's standard and
   current tones; height and district break ties. A colour far from all of them is classed *unknown*.
3. **What it reports.** Each finding has a stable key:
   - *colour*: off the standard, in m².
   - *height*: off the class's top, in m².
   - *place*: a class outside its districts, in m².
   - *seam*: two classes meeting without the edge their rule needs, in metres. A kerb counts if there is a kerb strip
     or a 10–20 cm step. A line and gutter counts if there is paint or gutter lids. Edging counts if there is an edging
     strip. Graded counts if the step is under 5 cm.
   - *dead end*: a route in `layout.js` `ROUTES` or the park's paths that ends in grass, sand or nothing. A route that
     ends at another route, at firm paving, at the water or within 2 m of a building does not count.

## What it finds today (21 October 2026, before step 2)

| District | Findings | Off colour m² | Wrong height m² | Out of place m² | Seams with no edge, m | Dead ends |
|---|---|---|---|---|---|---|
| Main Street | 48 | 775 | 360 | 15 | 97 | 0 |
| Harbour | 36 | 424 | 354 | 48 | 46 | 0 |
| Kitahama | 75 | 2243 | 174 | 0 | 683 | 0 |
| Nishi-machi | 31 | 782 | 13 | 0 | 413 | 0 |
| West yard | 41 | 326 | 38 | 10 | 219 | 0 |
| Harbour Park | 38 | 397 | 30 | 11 | 299 | 1 |
| East lawn | 45 | 264 | 60 | 6 | 191 | 0 |
| School | 22 | 219 | 169 | 16 | 27 | 0 |
| Beach | 26 | 717 | 92 | 4 | 132 | 0 |
| **All Minato** | **362** | **6146** | **1290** | **110** | **2106** | **1** |

By kind: 113 colour findings, 70 height, 16 out of place, 162 seams and 1 dead end.

Most of the colour area is three palette families: asphalt drawn blue-grey, Kitahama and Nishi lanes drawn in concrete,
and pavers in grey. Each is one change in the rulebook's `drawn` once its district is rebuilt. The seams and heights are
the real chaos:

- Main Street's footway is flush with the road (4 cm against 19 cm).
- Concrete building circuits run into lawns with no edging.
- Nishi's coral yards meet the lanes with no gutter.
- In three places the bare island ground, 40 cm under the plan, shows through:
  - Kitano Road's junction with Main Street, around x 2.5, z 0.75 (a 44 cm step);
  - the harbour's east corner, x 21.75, z −38.25;
  - the harbour's west corner, x −39.25, z −44.25.

### The worst ten places (6 m squares)

Scores add up what is wrong on the ground in each square. A metre of seam with no edge counts 4. A square metre at the
wrong height or out of place counts 1. A dead end counts 20.

| # | Centre (x, z) | District | Score | What |
|---|---|---|---|---|
| 1 | 39, 33 | school / Kitahama | 116 | building circuit against lane and lawn with no gutter or edging; the school yard against bare island ground |
| 2 | 27, −33 | Harbour Park | 111 | gravel walks and the onsen's circuit against the lawn with no edging; park furnishings at the wrong height |
| 3 | 39, 27 | school / beach | 105 | circuit, school yard and beach sand meeting the lawn and bare island ground with no edge |
| 4 | −33, 21 | Nishi-machi | 101 | coral yards against lanes and concrete with no gutter or coral edging |
| 5 | 39, 39 | school / Kitahama | 98 | the same corner as 1, further north |
| 6 | 27, −27 | Harbour Park | 95 | Umi-no-yu's yard and circuit against the lawn with no edging |
| 7 | 33, −33 | east lawn / beach | 92 | park walks against the east lawn; beach sand against bare ground and a circuit |
| 8 | −33, 15 | Nishi-machi | 88 | coral yards against lanes, with no gutter |
| 9 | −9, 9 | west yard / Main Street | 88 | circuits and footway against the yard lawn; the freight pullout against the footway with no kerb |
| 10 | −27, 15 | Nishi-machi | 87 | coral yards against lanes and the west yard lawn |

For step 2, the worst places in Main Street and the harbour are:

- **Main Street**:
  - x 3, z −27: the parking lay-by and the footway, with no kerb;
  - x 3, z 3: the Kitano Road junction (bare ground, no kerb);
  - x 3, z −33: the quay driveway against the footway;
  - x 3, z −15: the south shop crossing, which ends in the park's lawn;
  - x −3, z 27: the bus plaza;
  - x 3, z 15: the service turnout.
- **The harbour**:
  - x 33, z −39 and x 39, z −45: the east quay's apron is 6 cm high, not at its own level, and meets the beach and bare
    ground;
  - x −39, z −45: the Nishi quay's apron;
  - x −21, z −39: the docklands against the west yard.

## The order of the work

Each step is merged only after the owner has seen photos of it.

1. **The rulebook, the audit and the ratchet tests** (this step), the rule in `AGENTS.md`, and the parked cars rebuilt on
   `road-vehicles.js` (a separate job).
2. **Main Street and the harbour**, drawn by one generator from the rulebook:
   - the asphalt goes dark grey;
   - the footways become pavers at kerb height behind a 15 cm kerb, dropped at the crossings;
   - the quay is laid at its own level with its coping;
   - the holes at the Kitano Road junction and the harbour corners are closed.
3. **Kitahama, Nishi, the neighbourhood and the school**:
   - the back lanes become asphalt, with an edge line and U-gutter at every plot;
   - the coral yards get coral edging;
   - the building circuits are replaced by aprons that meet their ground by rule.
4. **The beach, the coast, the park and the lawns**:
   - park paths get their stone edging;
   - the beach is graded wherever a path comes onto it;
   - the whole island gets a photo walk;
   - the baseline reaches zero, and the ratchet becomes a plain test.
