# The production directive of 12 November 2026: one complete environment at a time

Johansson Shipyard · reference · 12 November 2026 · kept so that a session that begins without this day's conversation can
take it up

**What this is.** A brief the owner had from another assistant (Codex) after it read the repository, and passed to this
yard with the words: **"a message from Codex that we might be able to use as directions"**. It is direction, not an order
of work: the owner's own orders are in `HANDOVER.md` and take precedence (the same day the owner said "so proceed with
building the bridge", and the bridge came first: `../design/wheelhouse-refit.md`, stage 6). It is condensed here by the
session that received it; the headings and the requirements are its own, the wording is shortened. Nothing in it is
this yard's finding.

## Its judgement of the ship as it found her

A strong dimensional foundation (124.8 x 19.6 m, 133 spaces, revision D) and unusually strong checks; **uneven interior
detail, many sections bare**. Recommendation: treat each major interior as a self-contained environment with the
completeness of a carefully built two-storey game level (it names a well-known multiplayer map's house as the reference
for density, vertical circulation, sightlines and room-to-room coherence, **not to be copied**), adapted to authentic
marine engineering. Extend JSY-STD-404; do not replace it. "This is more valuable than distributing a thousand generic
props throughout the vessel."

## The first environment it names: the machinery complex

One continuous two-level environment, no scene changes between adjacent rooms: the tank top (1.6 m) and the machinery
platform (4.0 m above the keel), with the stairs, access and connecting spaces of the general arrangement as it stands:

- main engine room and propulsion machinery; machinery platform and inspection galleries;
- engine control room; main switchboard room; workshop, tools and spares store;
- access stairs, platforms, connecting passages; pumps, piping, cable systems, ventilation trunks.

Existing heights are to be checked for safe, comfortable walking **before** any geometry is altered. The arrangement is
not changed silently to make a better level: where engineering and play conflict, propose and record the trade-off.
(The yard's own basis for this section already exists: `../design/machinery-design-basis.md`.)

## Its requirements, by heading

| | Heading | What it asks |
|---|---|---|
| 2 | Read and audit first | `HANDOVER.md`, `CLAUDE.md`, `AGENTS.md`, `ferry/README.md`, `PLAN.md`, `yard/design/revision-D.md`, `ga.py`, `lines.py`, `spec.py`, the document register, JSY-STD-401 to 404 (405 since), `ferry/blender/`, `ferry/systems/`, `app.js`, `look.js`, the lighting data, `tools/shots.cjs`, every check. Say what is finished, what is a placeholder, what is not modelled. Preserve other work; do not overwrite uncommitted changes |
| 4 | Modelling standard | Three levels for every major item. **Macro**: room proportions, frames, beams, bulkheads, access, arrangement. **Meso**: real assemblies, cabinets, flanges, supports, handrails, door mechanisms, pipe routes, control stations. **Micro**: bolts, washers, weld beads, hinge pins, glands, nameplates, imperfections, grease, material transitions. Correct scale; bevels and weighted normals; real assemblies, not approximations (a pump has motor, coupling, guard, casing, suction, discharge, holding-down bolts, valves; a switchboard has real cabinet construction, handles, instruments, ventilation, cable entries and meaningful insides). Nothing floating, intersecting, disconnected, empty-but-shut, or embedded in a bulkhead. Blender for precision and baking; generated assets only after checks of size, topology, material and licence |
| 5 | Art direction | Built 1974, modernised: period industrial architecture, authentic machinery colours, newer electronics in older arrangements, wear where hands go, subtle leaks, oxidation and dirt where they belong, correct safety marks and tags, fluorescent and task lighting, credible cable routes. PBR surfaces convincing at arm's length. **Not**: uniform grunge, scattered props, heavy bloom, blue light, science fiction. The story comes from how a ship is worked and kept |
| 6 | Walking and working | Pointer lock, WASD, sprint, crouch, smooth acceleration; reliable collision with walls, decks and equipment; consistent stairs; no jitter; true eye height and field of view; a restrained contextual interface; doors, switches, levers and panels that work; an inspection camera; a spectator camera for stills; touch controls for a tablet. Capsule controller or as robust. Keep the existing walk and inspection systems where practical. No combat, no copied assets |
| 7 | Engineering that works | A state-driven machinery system on the existing register: engine start and stop, control room instruments, pumps and motors running, valves with state, cabinet doors and breakers, lighting circuits and the change to emergency light, fans and dampers, alarms, sound tied to state. Real dependencies: a feeder opened does not go on supplying its load. **No claim of certified calculation without the evidence** |
| 8 | Rendering and cost | PBR, good normal, roughness and occlusion maps, baked indirect light, dynamic light for what runs, contact shadows, true exposure and tone mapping, reflections only where useful, visibility by room, instancing, level of detail, compressed textures, streaming of adjacent rooms. No triangle budget on the master model; the runtime is optimised. **Targets to be measured, not assumed**: 60 frames a second at 1080p on an agreed desktop, 30 on an agreed tablet, no hitching, nothing missing. Report hardware, frame times, draw calls, memory, loading |
| 9 | Six reviewers | Independent reviews by a naval architect, a marine chief engineer, an environment artist, a rendering engineer, a gameplay engineer and a quality director, each with written findings (severity, place, evidence, correction), challenging the work. Where parallel agents are not to be had, separate labelled passes. **Never invent a review** |
| 10 | Pictures at milestones | From the running page, never a generated still, each naming its commit and its camera. **0** as found, with a defect register; **1** blockout (isometric, plan, section, on foot); **2** structure and machinery, with close-ups; **3** materials and light, same cameras before and after, in normal, low and emergency light; **4** interaction; **5** final: twelve pictures or more, a recorded walk, performance, a defect report |
| 11 | The gate | The Blender build and its checks; the page's checks; more for collision and interaction; repeatable cameras; a look for material faults, clipping, z-fighting; from a person's eye height; against the milestone before; the independent review; high-severity defects put right; commit to a development branch. **Not to `main` without the owner's word** |
| 12 | Deliverables | The complex, explorable; a reusable asset library; editable Blender sources; an optimised runtime; working equipment; system and component documents; automated tests; before and after pictures; the recorded walk; the critiques; the performance report; updated handovers. Built so that the vehicle decks, accommodation, saloons, wheelhouse and outer decks follow |
| 13 | The test | "I should be able to stand beside a diesel engine, inspect the machinery and its mounting, walk up to the control room, open a switchboard, and recognise the engineering arrangement." One exceptional, coherent complex before the rest of her. Begin with the audit and real pictures; do not stop at a plan |

Its four review points before it would go further: main machinery (mechanical accuracy, foundations, structure); engine
control room (working instruments, period consistency); upper machinery platform (vertical circulation, clearance,
visibility on foot); the workshop (close-up detail, a credible working place).

## Where the yard stands against it, 12 November 2026

- **Done in its spirit, on the bridge**: one room taken further as a whole (the bay, the block free, its back opening on
  real terminals, the gallery and its doors), audited from the running page with fixed cameras before and after, a
  defect found by a picture and turned into a rule and a check (`../standards/JSY-STD-405-windows.md`).
- **Not begun**: the machinery complex itself; its milestone 0 (pictures and a defect register of the engine room, the
  platform, the control room and the workshop as they are); the six reviewers; a recorded walk; a performance report
  beyond the frame times in `HANDOVER.md`; sprint, crouch and an inspection camera; night and emergency light; sound.
- **Already the yard's own, and more exact than the directive asks**: the gate (`blender/make.sh`, five checks with
  `windows.py`), the nine page checks, the register and its proof of supply, the rule that nothing is published without
  the owner's word.
