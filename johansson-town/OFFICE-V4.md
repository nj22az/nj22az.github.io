# Office street edition — v4

The original Three.js scene, rooms, camera modes, pointer lock, touch controls,
quest, fishing and arcade remain. New objects sit on the existing street and quay.

## Route

From the southern entrance: Aiko and the six-volume display on the right;
the window chair beside it; outbound kiosk and StepWise further north;
Field Notes beside the Journal Press; Vietnam and journal cards near the harbour
notice board; blue-taped CV tray at the left of the quay; Form 3D and the miniature
town outside the fishing-gear warehouse.

## Inspect

E / ACTION lifts a mesh. Drag rotates; right/Alt-drag pans; wheel or E / Shift+Q
zooms. I/J/K/L orbit from the keyboard. Arrows and Page buttons turn pages.
F opens or flips. R restores the view. Q / Escape / CLOSE puts the object back.
NEXT VOLUME selects the companion books. The four ordinary camera modes are not
changed. The render pixel ratio is temporarily reduced and restored on close.

## Content provenance

- Identity, disciplines, locations, links and availability: root `config.js` and
  `index.html`, inspected 7 September 2026. Availability is labelled a Week 37
  snapshot, with a direction to check the homepage for current information.
- Book extract: the published `the-front-row-seat/index.html` foreword and
  Chapter One preview; titles from `omnibus-config.js`.
- Journal titles/dates: the supplied featured-post list. Full article text was
  not bundled. Every card explicitly says to read the full dispatch on the journal.
- CV is a homepage-derived field-notes folio, not a formal employment chronology,
  fabricated PDF, or claim that a public CV download exists.
- Radio weather and baseball are labelled fictional in-world broadcasts.

## Persistence

`johansson-town-1988-v4` imports a valid v3 save without deleting it. Added fields:
`inspectedIds`, `notes`, `shrineIntent`, `kenjiEscort`. Existing mackerel inventory
is migrated to sea bream for the Tama quest. Duplicate discoveries are suppressed.

## Validation

`node johansson-town/tests/stability.test.mjs`

`node johansson-town/tests/office.test.mjs`

The latter constructs the combined world, local cast and object meshes with a
stub canvas, checks page limits, save migration, unique callbacks, blocked links
and inspector restoration. It is not a WebGL screenshot or mobile browser test.
Live-browser visual and touch acceptance remains to be checked.

The daily activity labels and restrained arm/head poses are present. Detailed
bespoke prop choreography (actual unlocking, shutters, dusting cloth, binoculars,
and rice-ball eating) is not implemented. The traffic-mirror cat is a brief local
mesh illusion, not a reflected render target. The book turn is a simple mesh flip,
not a deforming paper simulation.
