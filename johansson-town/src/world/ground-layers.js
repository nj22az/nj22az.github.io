/**
 * How high off the ground each kind of outdoor surface is drawn.
 *
 * Every open-air surface in the town is a thin slab laid on the same nominal ground,
 * and two slabs that end up in the same plane flicker against each other wherever they
 * overlap. Desktop hides most of it -- a depth buffer with plenty of bits resolves a
 * couple of millimetres at close range -- but a phone does not, and the harbour came
 * back from one as sheets of flashing texture.
 *
 * So the heights are named here rather than written out as literals beside each mesh:
 * planted ground sits lowest, the paved routes ride two centimetres over it, and
 * anything that paves its own patch of ground (a terminus apron, a pier deck) clears
 * the routes by the same margin again. Keep at least 15mm between any two surfaces
 * that overlap in plan -- tests/ground-clearance.test.mjs measures it.
 */
export const GROUND_LAYER=Object.freeze({
 /** Grass, gravel, bare earth: the ground itself. */
 grass:.02,
 gravel:.02,
 /** Pavements, crossings, lanes -- the authored walking network. */
 lane:.04,
 /** A surface built to its own footprint, laid over the lanes. */
 apron:.06,
});
