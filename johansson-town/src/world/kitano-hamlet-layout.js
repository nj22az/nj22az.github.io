/**
 * Kitano hamlet (北野集落), the handful of houses by the pier on Kitano-jima (batch 7a; docs/KITANO-JIMA.md): three walled
 * plots on a sandy lane just south of the cargo court, in the island's own frame (airport-ground.js airportWorld: u along
 * the runway, v towards Minato; y above the sea). The row (Jun's house and the house to let) stands north of the lane
 * with its gates on the lane; Johansson's house stands south of it, its gate on the lane and the sea behind.
 * No imports, so the island's ground and plantings can read it as freely as the builder does.
 */
export const KITANO_HAMLET=Object.freeze({
 /** The yards' slabs and the lane, metres above the sea (the plateau is 1.1; the ground here runs 0.9–1.25). */
 yardTop:1.3,laneTop:1.22,
 lane:Object.freeze({minX:-47,maxX:-20,minZ:47.5,maxZ:51.5}),
 /** Plantings keep out of these rectangles (tropical-island.js): the lane and the plots, and kitano-1's back yard. */
 clear:Object.freeze([Object.freeze({minX:-51,maxX:-19,minZ:37,maxZ:71}),Object.freeze({minX:-51,maxX:-31,minZ:71,maxZ:75})]),
 plots:Object.freeze([
  // Johansson's house, built from the creator's Final Rev F (johansson-house.js, finding RF8): 12 × 10 m on a plot of
  // 17 × 22, its front 7.5 m in from the gate (`front`, the plot's own z, the gate at +11) for the garden stair down to
  // the court, 2.5 m either side for the lightwell and the outdoor units, 4.5 m behind for the terrace. The plot stops
  // where the ground east of it rises above the yard (1.28 m at its edge); west and north it runs down towards the beach
  // (0.26 m at its far corner), so its slab goes down to `base`.
  {id:'kitano-1',family:'ヨハンソン',romaji:'Johansson & Thuan',minX:-49.5,maxX:-32.5,minZ:51.5,maxZ:73.5,gate:'south',kind:'johansson-house',wall:'coral',front:3.5,base:.2},
  {id:'kitano-2',family:'城間',romaji:'Jun',minX:-45,maxX:-35,minZ:38,maxZ:48,gate:'north',kind:'concrete',wall:'block'},
  {id:'kitano-3',family:'知念',romaji:'Chinen',minX:-33,maxX:-23,minZ:38,maxZ:48,gate:'north',kind:'red-tile',wall:'coral'},
 ].map(Object.freeze)),
});
/** The gate in the plot's wall, 0.7 m out on the lane, and the way in (0 faces −v, π faces +v), island frame. */
export function hamletGate(p,out=.7){
 const cx=(p.minX+p.maxX)/2;
 return p.gate==='north'?{door:[cx,p.maxZ+out],inward:0}:{door:[cx,p.minZ-out],inward:Math.PI};
}
/** The walkable floors the hamlet adds to the island (airport-ground.js): the lane and the three yards (Johansson's front door is level with his: Rev F). */
export const KITANO_HAMLET_FLOORS=Object.freeze([
 {id:'kitano-lane',...KITANO_HAMLET.lane,y:KITANO_HAMLET.laneTop},
 ...KITANO_HAMLET.plots.map(p=>({id:'kitano-yard-'+p.id,minX:p.minX,maxX:p.maxX,minZ:p.minZ,maxZ:p.maxZ,y:KITANO_HAMLET.yardTop})),
].map(Object.freeze));
