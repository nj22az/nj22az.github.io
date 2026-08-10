# Open parametric model library

Form 3D Studio ships three editable starter models that build entirely in the
browser and continue to work offline:

- a 20-degree pressure-angle involute spur gear;
- a coarse-pitch, right-hand threaded hex bolt; and
- a four-hole L-bracket with twin reinforcing gussets.

Each recipe accepts the dimensions exposed by the **Models** panel and returns
a closed triangular solid for STL and faceted STEP export. The source recipes
are in `src/open-models.mjs`; `npm run build:models` recreates the browser
bundle with the pinned JSCAD 2.13.0 dependency.

The model recipes are available under the MIT licence in
`OPEN_MODELS_LICENSE.txt`. JSCAD's own MIT notice is retained separately in
`vendor/JSCAD-LICENSE.txt`.
