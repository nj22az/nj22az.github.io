# Sakura posters, exterior, roof and water services - Rev B

Owner requested full playful advertisements, roof CAD with the water tank, tank piping and exterior CAD; then one absurd advertisement with a pretty adult woman promoting something Sakura sells. This package supplies finished poster assets and audited coordination CAD. It does not construct or alter the game runtime.

Basis: `codex/sakura-retain-detail`, draft PR #378, source head `baf26f20b07671eba51428bd70cd7d333ffcccea`. Fixed shell14260 x11000 mm; internal13900 x10640; ceiling2800, wall top3860, slab150, roof4010. One storey, no upstairs room or internal stair. Candidate rear delivery opening remains X10975-12025. This is measured from candidate source, not a newly surveyed town exterior.

## Deliverables

- `Sakura-Posters-Exterior-Roof-CAD.pdf`: nine compact review pages: three campaigns; Tissue Diva; measured poster elevations; CAD counter axonometric; roof plan; stair section; tank piping; front/rear elevations; west/east elevations. The axonometric is a CAD coordination view, not an actual-game screenshot.
- `Sakura-Exterior-Roof-Posters.dxf`: R2010, 1 unit=1mm; editable model-space roof plan, four exterior elevations, poster references, tank/pipe section, unfolded stair, and exact pipe polylines. `PIPES_3D` is initially off to keep the 2D sheets readable; enable it for actual x/depth/height routes. Linked artwork uses the four `assets/CAD-Pxx.jpg` files. Keep `assets/` beside the DXF.
- `design.json`: fixed dimensions, four poster placements, tank, equal-rise U-stair, routes, valves, sleeves and three internal supply branches. True physical coordinates are separate from drafting offsets.
- `assets/*.webp`: four full-resolution production artwork candidates; existing product packaging stays intact. `assets/CAD-Pxx.jpg` are format-converted CAD image references, not alternative artwork.
- `prompts.json`: exact prompts for the built-in image-generation tool. No third-party artwork/assets copied.
- `retained-wall-placements.json`: unchanged20-placement source snapshot used for overlap checks.
- `audit.json`: performed geometric checks, corrected findings and unresolved dependencies.
- `build-cad.py`: reproduce using Python with reportlab, Pillow and ezdxf: `python build-cad.py`. Written dimensions govern; the PDF has several fitted coordination scales.

## Poster placements and purpose

P01 Kogane chips, P02 Hamabe rice crackers and P03 Oden Dance are playful original illustrated ads. P01/P02 sit above the lowered dispenser, below the tobacco header; P03 sits above the hygiene notice. P04 Tissue Diva is a fictional adult model advertising the existing tissues category: “For onions. For heartbreak. For everything.” It is on the front west wall above the magazines, before the chiller. All are A2portrait420 x594 mm. No invented discounts, new catalogue items, medical claims or altered product packaging. All20 retained notices stay clear.

## Audit and corrections before construction

The prototype stair's rise sequence did not reach its landing/roof datums consistently. The revised stair has22 equal rises of182.273 mm, two flights of11, each with10goings x260, 1000clear flights/landings and1100 guards. It moves to the west rear to avoid the delivery opening. The top landing includes an180mm return over the rear wall to the roof gate. Gate swing, supports and open mesh guards are drawn. The rear-yard projection is4600 mm and is not site-verified.

Tank diameter1200, body1200 on a1600 x1600 support zone. The stand rises350 to4360, body top5560, vent5760. Raising the prototype's200mm stand gives the low outlet/scour line clearance over the300mm flashed roof-sleeve curb at4310. Stand legs and stair support posts are shown, with a separate inspection platform/steps. Structural sizing/anchors and the load path are unresolved; the external cylinder geometry is not a rated capacity.

The1000-wide route was moved inside the roof edge and away from the inspection steps, tank support, WC vent and equipment reserve. No above-roof horizontal pipe crosses that walking route. Fill and supply use separate sleeves; overflow and scour descend to visible rear air gaps. Domestic water, WC vent and roof rainwater are separate systems. DN labels are visual coordination assumptions, not verified hydraulic sizing.

## Checks performed and remaining work

Generation/audit passed: four posters within wall/ceiling limits; zero same-face overlap with one another or the20 retained notices;22 rises total4010; tank and curb datums agree;1000 service route clear of the modeled obstructions; stair clear of delivery; overflow/scour heights nonascending; pipe plans orthogonal; DXF reopen audit zero errors. All nine PDF pages rendered and visually reviewed; label, view-bound and support depiction issues corrected. Original PNG artwork is retained separately by the image-generation workflow; these files preserve full-size production encodings.

Open dependencies: actual town/exterior registration and4600mm yard fit; real ground escape route; tank anchors, roof loading and wind restraint; exact outfall/backflow/hydraulic details; statutory egress/guards. Those block runtime roof construction under the repository's CAD-first rule. They do not prevent this requested CAD/artwork review. No gameplay/build/full guard was run for this drawing-only change. The prior full guard memory failure, physical-iPad/FPS acceptance and earlier actor/exterior/storage/save work remain open. No merge or deployment.

DXF drafting origins: roof plan(0,0); south(0,-10000); north(17000,-10000); west(0,-19000); east(17000,-19000); west poster wall(0,-27000); east poster wall(17000,-27000); tank section height offset-36000; unfolded stair height offset-44000. Native pipe3D points use actual x/depth/height with no drafting offset.
