# Minato Maru fuel piping - C1 addendum

**FOR DESIGN REVIEW - CONSTRUCTION NOT APPROVED.** Issued 17 October 2026.

C1 is a fuel-only correction to the 13 October Revision B review issue. The original ZIP, extracted package, drawings, source snapshot and validation records under `../cad-revb/` are retained unchanged. C1 does not reissue the other 54 Revision B sheets or close their engineering holds.

## Scope and use

[Download the C1 package](Minato_Maru_Fuel_C1.zip) or [open the six-sheet PDF](Minato_Maru_Fuel_C1.pdf).

- `Minato_Maru_Fuel_C1.pdf` and `dxf/`: revised fuel plan/profile, proposed terminal schedules, connection dispositions and design holds. Physical views are 1:50 on A3; CAD geometry is 1:1 millimetres, with locked paper-space viewports. Print at 100% and verify the 5 m / 100 mm calibration bar.
- `models/`: swept outside-radius pipe envelopes and equipment/access reservations in OBJ/MTL and 3D DXF. These show rectilinear clearance geometry, not selected elbows or fabricated spools. CAD X is forward from transom, Y to port, Z above baseline, in millimetres.
- `fuel_line_register.csv`: every fuel graph edge, previous issue, current geometric disposition, revised length, conservative minimum equipment reservation gap and other-pipe surface gap. Source DN is retained; available flow screens explicitly assume nominal DN equals internal diameter.
- `fuel_terminals.csv`: distinct proposed inlet/outlet interfaces, ownership, direction and basis. Tank terminals reference the upper face of the common double-bottom reservation; individual tank boundaries remain undesigned.
- `pipe_route_issues.csv`: current whole-vessel unresolved connections, not a silent edit of the Revision B historical register.
- `engineering.json`, `validation.json`, `revb-reference-hashes.json`: source hashes, geometry, calculations, limits and immutable-reference checks.

## Engineering corrections

The legacy graph used the same physical point and direction for pump suction/discharge, purifier feed/clean/sludge and tank fill/suction/overflow. C1 supplies distinct proposed interfaces per connection. The bunker station is explicitly reserved at port car-deck X=12.85 m, clear of the X=13.3-14.7 m boarding passage. A common inlet/tee and two isolated branch outlets are proposed; station equipment selection and internal assembly fabrication remain open.

Fuel routes are checked after the existing accepted non-fuel routes. Those services are retained, rather than displaced to make a fuel route pass. Search also reserves every other fuel connection's terminal stub. The committed candidate polylines are rechecked against live source geometry; a failed route is reported as open and omitted from accepted 3D geometry. Game preview routes remain illustrative and are not C1 acceptance evidence.

Named-owner exemptions apply only to the bounded terminal stub. Source machinery, the central access, forward main-engine service area, generator aisles and cross aisle are clearance obstacles. Floor plates are crossed only by explicitly recorded tank terminal stubs. A proposed outboard overhead sleeve through the ER/auxiliary bulkhead is represented by a limited opening; its strength, sealing and fire integrity remain unapproved. Other source structural and service details are incomplete.

The supplied 2 m3/h transfer-pump and 0.25 m3/h purifier ratings imply nominal-DN25 velocity screens of 1.1318 and 0.1415 m/s respectively. They do not establish compatible operation. No flow has been invented for bunker, sludge, overflow or return sizing. Source DN is not actual ID, OD, wall or pressure class. Pipe radii retain the source's geometric reservation allowance; real flanges, bend sweep, supports, insulation and valve access require selected equipment and a coordinated redesign.

The source's unsupported assertion of 1.8 m gravity head has been removed. Minimum fuel level, pump datum, allowable inlet/return pressures, control/bypass arrangements, viscosity, NPSH and pressure losses remain open. Individual tank partitions, vents, soundings, return arrangements and overflow capacity are unresolved. These are design holds even when an external polyline is geometry-clear.

## Reproduction

From `johansson-town/`:

```
node tools/ferry-fuel-export.mjs
python tools/ferry-fuel-cad.py
python tools/ferry-fuel-validate.py
node --test tests/ferry-fuel-c1.test.mjs tests/ferry-engineering-arrangement.test.mjs tests/ferry-status.test.mjs
```

The authoritative proposed port definitions and clearances are in `src/world/ferry-fuel-design.js`; reviewed external polylines are in `src/world/ferry-fuel-spools.js`. The bounded weighted-A* candidate search and subsequent fully rechecked shortcut pass (`tools/ferry-fuel-simplify.mjs`) are offline (`tools/ferry-fuel-search.mjs`); it does not run at game startup and does not claim a shortest or fabrication-ready route. Every committed candidate must still pass live validation.

Approval remains **NONE**. Internal checks do not constitute flag/class acceptance, survey, professional certification or sufficient documentation to construct a passenger ferry.
