/**
 * The town's ground, as one palette.
 *
 * A raycast survey of the whole island (docs/AMPLIFY-AUDIT.md, §10) found about twenty
 * ground treatments: four near-identical greys for lanes and yards, a photographed quay
 * concrete, three sands, five coral whites and two paver textures. Each looked fine on
 * its own and the island did not hang together. Every walking surface now takes its
 * colour from here; the painted textures in toy-surfaces.js carry the detail.
 *
 * Seven families, the ones an Okinawan harbour town of 1997 is actually made of:
 */
export const GROUND=Object.freeze({
 /** Main road and lanes that cars use: painted blue-grey asphalt. */
 asphalt:0xa9aeb4,
 /** Footways and shop forecourts: small interlocking pavers. */
 pavers:0xc6c3ba,
 /** Quays, piers, village lanes, yards and plinths: poured concrete. */
 concrete:0xb7b5ab,
 /** The old quarter's crushed-coral ground between the walls. */
 coral:0xe2dac8,
 /** The beach and the gateball court. */
 sand:0xe3d2a4,
 /** The sacred grove and the work yard: grey gravel. */
 gravel:0xa29e93,
 /** Lawns, park and open land: one green. */
 grass:0x5c9848,
});
