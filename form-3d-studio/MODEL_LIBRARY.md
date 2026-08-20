# Open parametric model library

Form 3D Studio ships five editable starter models that build entirely in the
browser and continue to work offline:

- a Johansson cable-ring builder with an optional full-depth loading slot;
- a slim two-piece Apple Pencil Pro pill capsule with an aligned Pencil-style flat and raised JOHANSSON (C) mark;
- a 20-degree pressure-angle involute spur gear;
- a coarse-pitch, right-hand threaded hex bolt; and
- a four-hole L-bracket with twin reinforcing gussets.

The Apple Pencil Pro template defaults to Apple's 166 mm × 8.9 mm dimensions.
It uses one long rounded Body and one short rounded Cap, like a pharmaceutical
capsule, with a quarter-turn bayonet instead of threads or a friction-only fit.
The long Body has a shallow 0.18 mm longitudinal flat, and the Cap's matching
flat aligns only in the locked position. The JOHANSSON (C) mark is fused into
that planar face instead of wrapping around the curved shell.
Both domes have 1.7 mm through-vents. The cap has two open axial entry slots,
75-degree locking tracks, a release pocket and a hard end stop. Push the cap on,
turn to the stop and release it into the pocket; opening requires a short inward
push before the reverse turn. The 0.40 mm default fit values and 4–10 mm end
protection are editable for a specific resin/printer. Print layout separates
and tilts both parts so their open interiors and dome vents can drain.

Each recipe accepts the dimensions exposed by the **Models** panel and returns
a closed triangular solid for STL and faceted STEP export. The source recipes
are in `src/open-models.mjs`; `npm run build:models` recreates the browser
bundle with the pinned JSCAD 2.13.0 dependency.

The model recipes are available under the MIT licence in
`OPEN_MODELS_LICENSE.txt`. JSCAD's own MIT notice is retained separately in
`vendor/JSCAD-LICENSE.txt`.
