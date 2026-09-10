# Main street and back-alley layout

The original harbour street is once again the active overworld. Boot loads the Japanese shop kit (with the existing harbour models as fallback), rather than the complete canal scene. Supplied assets remain in the repository.

- The eight original destinations retain their main-street addresses. Sakura uses its glass storefront exclusively, with the interaction at its actual offset doorway.
- Rectangular cross-streets connect Willow Alley and the west service lane. The eastern dining lane connects Sato Ramen, Minato Izakaya and the north street; an east service lane closes the southern loop.
- Buildings face the street or a connected approach. Existing resident house orientations and home addresses are preserved.
- Side-street paving is partitioned into a disjoint rectangle union, batched by surface. Junctions no longer stack overlapping strips and circular patches.
- Remove the second ramen kiosk in the main corridor. Move the hand pump and bicycle away from crossings, shorten the school fence to clear its lane, and keep warehouse corners out of the quay approaches.
- Add four bilingual junction signs and a numbered visitor-map directory.
- Correct the compact park curb tuple layout and separate its path from the lawn surface.

## Validation

Vite production build passes. Three new grid regression tests pass, covering lane centre clearance, home orientation and entry approaches, disjoint paving and finite park geometry. Three existing integration tests pass for world construction and doors, resident navigation and the Kenji escort, and cross-alley connectivity. Nine living-town tests pass, including late izakaya hours, guests and existing local character exports.

Full boot validation is incomplete: the local checkout could not retrieve the recent crystal-room and Yuri bedroom binary assets. The browser refused the local preview URL, so no rendered visual acceptance or iPad performance claim is made. Blender is not installed; the Python module installation was unavailable. These are JavaScript layout and geometry changes, not Blender-authored asset edits.
