# Fujita landing and Johansson JT-25

The unused east return of the L-pier is removed from rendering and navigation. Fujita's remaining straight landing has transverse timber boards, pile straps, bearers, edge beams and a slender water-side rail. Its top stays at the existing walking height and meets the western quay edge without overlapping its paving. The shed, resident routine and Shiosai gangway remain in place.

The workshop forklift is now an original Johansson JT-25 diesel truck, conceived as a compact 1994 counterbalance machine. Ochre cast bodywork, larger front drive tyres, smaller rear steering wheels, an open protective frame, controls, radiator slots, exhaust and work lamps give it a recognisable industrial silhouette. A duplex mast, hydraulic cylinder, chains and load backrest lift with the existing fork test animation. The whole fork envelope is covered by collision; coloured parts are merged into a small set of finishes.

## Visual review

| View | Before | After |
| --- | --- | --- |
| Fujita quay | [Before](before-quay.png) | [After](after-quay.png) |
| Truck | [Before](before-truck.png) | [After](after-truck.png) |
| Boardwalk | [Before](before-boardwalk.png) | [After](after-boardwalk.png) |

[Truck detail](after-truck-detail.png) · [Portrait](after-phone.png)

The captures use the real runtime in Chrome at 1280 × 800 and 390 × 844. Run `node tools/harbour-design-audit.mjs after` against the audit server on port 8767 to reproduce them. Both browser reports contain no exceptions.

## Validation

- Production build and generated runtime: passed. Existing bundling size warnings remain.
- All 30 focused tests passed. Tests cover the pier's removed walking surface, deck grounding, truck collision throughout its lift, Fujita's daily routine and houseboat access, dock access, and outdoor surface clearance.
