# Sakura wall decoration CAD - Revision A

Owner instruction, 23 October 2026: make a CAD drawing for wall decoration to establish the surfaces available for implementation. This is a placement proposal, not decoration already added to the game.

Geometry basis: actual opt-in rebuild source at `bdb7c824a21b3ac7ebe2947d269056545010999f` on `codex/sakura-retain-detail`, draft PR #378. Fixed exterior 14,260 x 11,000 mm; clear interior 13,900 x 10,640 mm. Ceiling +2,800; worktops +780; office level with sales floor. No second storey. Roof-only access remains outside this decoration scope. The rear door in this candidate is proposed at X=11,500 centre, width 1,050, and still requires actual exterior registration.

## Files

- `Sakura-Wall-Decoration-CAD.dxf`: editable R2010 model space, 1 unit = 1 mm. Four principal elevations, a plan and office/rear details. Named layers: EXISTING, GLAZING, PROPOSED, KEEP_CLEAR, DIMENSIONS, TEXT. Elevations are deliberately arranged separately in model space; these offsets are drafting offsets, not room coordinates.
- `Sakura-Wall-Decoration-01.svg`: A2 landscape, principal wall elevations at 1:50; fixture constraints and finish palette.
- `Sakura-Wall-Decoration-02.svg`: A2 landscape, plan and office detail at 1:50; rear wall detail at 1:100; all 20 placements scheduled.
- JSON and CSV schedule: exact starts, dimensions, heights, intended copy, material and purpose for each decoration. JSON also supplies nominal Three.js centres and inward normals. Physical Japanese text is specified in data; CAD sheet labels are English for coordination, not final sign artwork.
- `build_wall_cad.py`: reproduce with Python, ezdxf and reportlab. Run from this directory. It writes the PDF, SVGs, DXF, schedules and validation report. Raster previews can be produced with `pdftoppm -r 85 -png Sakura-Wall-Decoration-CAD.pdf Sakura-Wall-Decoration`.

Print SVG/PDF sheets at 100%, not fit to page; verify the 5,000 mm scale bar prints at 100 mm. Use written dimensions rather than a screen measurement. The PDF and raster previews are delivered separately to the owner.

## Coordinate conventions

Origin: internal SW floor corner. X increases east; depth increases north; height is above finished floor. N/S/R/I starts are X coordinates; W/E starts are depth coordinates. N is the sales-facing partition/cooler at depth 8,240, not the rear exterior wall. R is the rear interior face at depth 10,640. I01 is the office south face at depth 6,200. Both X and depth increase left-to-right in elevations for unambiguous setting-out; these are coordinate-oriented, not perspective views.

Room conversion is `(X/1000 - 6.95, height/1000, 3.91 - depth/1000)`. Nominal artwork planes are offset 8 mm inward; shallow frames project at most 20 mm. The scene implementation must verify actual render normals, relief and noncoplanar surfaces, rather than relying on polygon offset to hide intersecting geometry.

## Design intent and checks

Retain warm cream walls/timber, original Sakura/J Coffee branding and current product detail. Category headers go above refrigeration; service information belongs behind the counter. Office calendar/rota and receiving clock have operational purposes. Flower poster reflects Sakura's existing flower trade. Opening-hours artwork must read game data, not invent a 24-hour service. Existing shelf/hanging signs are retained except where a named replacement is specified; do not add duplicate floating headers. The ATM remains a reservation, not newly installed equipment.

Graphic bounding boxes total 599,220 mm², 2.77% of the 21,600,000 mm² front glazing; this counts the full service lettering envelope conservatively. Door tracks/entry, rear delivery, office glazing, worktops, cooler handles, air openings and rack access remain protected. Schematic fixture silhouettes establish mounting constraints, not full equipment fabrication drawings.

Validation actually run: 20 unique decoration IDs; every rectangle inside its face and below ceiling; no same-face decoration overlaps; west headers above the 2,120 mm chiller canopy; no front entrance overlap; DXF reopened and audited with zero errors. Two A2 PDF pages rendered and visually inspected. No runtime changes or gameplay tests needed. This drawing does not establish animation reach, a complete asset inventory, physical-device rendering, or code compliance.

Next: bind each ID to the actual original artwork/prop; fit art without changing products; remove superseded category boards; check entrance, queue, Thuận and phone cameras; verify refrigeration, loading and office access plus surface flicker in the real game.
