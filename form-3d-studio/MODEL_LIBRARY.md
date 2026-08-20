# Open parametric model library

Form 3D Studio ships five editable starter models that build entirely in the
browser and continue to work offline:

- a Johansson cable-ring builder with an optional full-depth loading slot;
- a slim Apple Pencil Pro split-shell case with a raised JOHANSSON wordmark;
- a 20-degree pressure-angle involute spur gear;
- a coarse-pitch, right-hand threaded hex bolt; and
- a four-hole L-bracket with twin reinforcing gussets.

The Apple Pencil Pro template defaults to Apple's 166 mm × 8.9 mm dimensions.
It uses two longitudinal half-shells and two shallow quarter-turn bayonet caps
instead of threads, a long blind tube or a print-in-place hinge. Each cap has
two through-wall axial entry slots, 75-degree locking tracks, release pockets,
hard end stops and a 1.7 mm pressure vent. The user pushes the cap fully on,
turns to the stop and releases it outward into the pocket; opening requires a
short inward push before the reverse turn. The complete interior and slots are
open for washing and post-curing before assembly; the default 0.40 mm fit values are
editable for a specific resin/printer. The print-layout switch lays both shells
cavity-up and both caps open-side-up; the assembled view shows the caps rotated
into their locked positions.

Each recipe accepts the dimensions exposed by the **Models** panel and returns
a closed triangular solid for STL and faceted STEP export. The source recipes
are in `src/open-models.mjs`; `npm run build:models` recreates the browser
bundle with the pinned JSCAD 2.13.0 dependency.

The model recipes are available under the MIT licence in
`OPEN_MODELS_LICENSE.txt`. JSCAD's own MIT notice is retained separately in
`vendor/JSCAD-LICENSE.txt`.
