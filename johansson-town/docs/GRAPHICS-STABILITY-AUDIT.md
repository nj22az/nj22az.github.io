# Graphics stability audit — 3 October 2026

The visual target is a readable toy town: rounded islanders, clear silhouettes and
quiet painted surfaces. Everyday detail and changing home lights should describe the
people living here without introducing flicker or making rooms disappear.

## Defects repaired

| Area | Confirmed cause | Repair |
| --- | --- | --- |
| Post-processing | A failure in ink, grade or FXAA left an offscreen target bound. The plain fallback could draw into that abandoned target instead of the screen. | The whole chain restores the previous framebuffer in `finally`. |
| Driver compatibility | WebGL2 was treated as proof that a half-float colour target was renderable. A missing colour-buffer extension can yield an incomplete framebuffer without a JavaScript exception. | Check the renderable-float extensions first; otherwise use byte targets, retaining MSAA where available. Respect a driver advertising zero samples. |
| Retina memory use | The render-target pixel cap stopped at native resolution, even if the native buffer already exceeded the budget. Large windows could allocate oversized multisampled targets. | Permit downsampling to the actual pixel ceiling and retain the outline's output-pixel width. |
| Context restoration | One listener reset recovery while a second listener reloaded the whole page after restoration, losing the current room and player placement. | One lifecycle saves and pauses, discards old targets, rebuilds the display, follows the existing town clock and resumes the live town. |
| Packed town instances | A stationary view retained an old per-instance colour palette when it was changed, removed or introduced after selection. | Track the live attribute identity and version, refresh its packed colours, and return no palette when it has been removed. |
| Sakura window view | Moving props marked `dynamicProp` were cached as static scenery. Bounds and split geometry could describe their old location. | Treat a marked mesh or ancestor as dynamic and refresh its world bounds each exterior pass. |
| Outdoor paving | Thirteen pairs of overlapping surfaces were coplanar or separated by less than the existing 15 mm clearance requirement. | Move the surfaces to distinct 20 mm ground layers; existing drawn-surface measurement keeps feet grounded. |
| Resident room shell | Thin walls and ceilings cast their interior face onto the same shadow receiver, producing fine stripes and a jagged ceiling seam. | Cast from the shell's outer front faces and preserve the chosen shadow side through cel conversion. Room shadow casting and wall reception remain enabled. |
| Mrs Sato's sliding doors | The supplied model has a 20 mm aperture between the rear paper panels and their timber rail. | Add a recessed overlapping timber backing behind both existing surfaces. |
| IVAR cabinet | Collapse simplification opened narrow slits in the exterior panel, exposing an inner face 18 mm behind it. | Preserve all 7,767 original triangles in the texture-free town variant. The file is 480 KiB and retains its palette and footprint. |

The ground failures included exact overlap at the airport's passenger walkway, terminal
floor, arrival plaza and transfer junctions. The lowland terrain sat only 6 mm above
the peninsula; the coastal road and trails were 12 mm above that terrain. Rainflower's
sidewalk was 5 mm above its roadway, and its roadway overlapped the island route.
Blue Coral's decorative floor tiles were 9 mm above their host. Concrete homes had
steel roof landings flush with their roof slab. All these pairs now clear the detector.

## Coverage that changed

The old ground check sampled only x −45…45 and z −70…45. It also discarded any triangle
spanning an audit boundary, which excluded large land triangles precisely where they
were needed. The check now clamps the sample lattice while retaining those triangles.
It measures the central town on a 0.25 m lattice and the island and airport on a 0.5 m
lattice, within x −130…380 and z −190…245, with every business included.

This detects visible upward-facing opaque surfaces less than 15 mm apart over at least
1 m² of sampled overlap. It checks ordinary and instanced meshes, world transforms,
visibility and render layers. Intended polygon-offset decals, transparent materials and
non-depth-writing surfaces are excluded. Vertical overlaps, tiny detail faces, sloping
surface conflicts and asynchronously arriving assets still require visual inspection.

## Verification

`tests/render-stability.test.mjs` exercises live palettes, moving shop-window props,
both target formats, zero-sample drivers, a large Retina buffer and failure in each post-process pass.
`tests/graphics-lifecycle.test.mjs` checks save/pause/resume, duplicate events, failed
restoration, full storage and retention of the player and open room.
Existing cel, section, window, dusk, ground, stair and island checks also pass after
these changes. No walking plan, collider dimensions or resident identities changed
in this graphics pass. The roof landing rises by 2 cm and records that height in its
existing walk-level metadata.

Device guarantees require testing the compiled game on the intended hardware. Node
renderer doubles validate state restoration and selection logic; they cannot verify
shader execution, actual GPU performance or mobile depth precision. Browser acceptance
should include Sakura's window composite, all airport pavement junctions, Rainflower
Lane, a concrete home's roof landing, terrain at a distance, resizing, night lighting
and context restoration.

The compiled game now has a [76-view visual regression suite](VISUAL-REGRESSION.md)
covering two angles in every accessible home and four outdoor locations by day and
night, on desktop and phone viewports. It checks actual GPU rendering and waits for
assets before comparing strict references. An opt-in Spector inspector captures WebGL
commands; ordinary visits do not load its dependency. Physical phone GPU acceptance
remains separate from phone-sized Chromium screenshots.
