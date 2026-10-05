/**
 * The two little houses in the yard behind Front-Row Books & Workshop, where the
 * shop's four staff live: Nhung and Reiko in one, Chin and Tetsuo in the other. They sit
 * between the bookshop's back wall (x -15.2) and the yard wall (x -24.6), either side
 * of the path that runs in from the lane gap at z 1.5; the passage beside Minato
 * (z below -3) stays clear. Doors face each other across the path.
 *
 * `door` is where you stand to go in; `inward` is the heading of somebody walking in
 * (0 walks towards -z, PI towards +z), which is what a site's entryFacing means.
 *
 * They are 5.6 m wide, the most the yard takes with the laundry beside them, so the 1K
 * staff house inside (interiors/yard-home.js) is the size of the house you see.
 */
export const YARD_RESIDENT_NAMES=Object.freeze(['Nhung','Reiko','Chin','Tetsuo']);
export const YARD_HOMES=Object.freeze({
 'resident-home-aya':Object.freeze({x:-19.6,z:-1.2,w:5.6,d:3.2,height:2.8,door:Object.freeze([-18.9,1.05]),doorFace:.4,inward:0,
  number:'1',address:'1 Front-Row Yard',walls:0xd9ece2,trim:0x5f8f6a,roof:'tile'}),
 'resident-home-kenji':Object.freeze({x:-19.6,z:4.6,w:5.6,d:3.6,height:2.7,door:Object.freeze([-18.9,2.15]),doorFace:2.8,inward:Math.PI,
  number:'2',address:'2 Front-Row Yard',walls:0xf1e6cf,trim:0x2a8fcc,roof:'flat'}),
});
