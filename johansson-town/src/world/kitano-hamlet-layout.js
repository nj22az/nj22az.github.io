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
 /** Plantings keep out of this rectangle (tropical-island.js). */
 clear:Object.freeze({minX:-48,maxX:-19,minZ:37,maxZ:63}),
 plots:Object.freeze([
  {id:'kitano-1',family:'ヨハンソン',romaji:'Johansson & Thuan',minX:-46,maxX:-36,minZ:51.5,maxZ:61.5,gate:'south',kind:'red-tile',wall:'coral'},
  {id:'kitano-2',family:'城間',romaji:'Jun',minX:-45,maxX:-35,minZ:38,maxZ:48,gate:'north',kind:'concrete',wall:'block'},
  {id:'kitano-3',family:'知念',romaji:'Chinen',minX:-33,maxX:-23,minZ:38,maxZ:48,gate:'north',kind:'red-tile',wall:'coral'},
 ].map(Object.freeze)),
});
/** The gate in the plot's wall, 0.7 m out on the lane, and the way in (0 faces −v, π faces +v), island frame. */
export function hamletGate(p,out=.7){
 const cx=(p.minX+p.maxX)/2;
 return p.gate==='north'?{door:[cx,p.maxZ+out],inward:0}:{door:[cx,p.minZ-out],inward:Math.PI};
}
/** The walkable floors the hamlet adds to the island (airport-ground.js): the lane and the three yards. */
export const KITANO_HAMLET_FLOORS=Object.freeze([
 {id:'kitano-lane',...KITANO_HAMLET.lane,y:KITANO_HAMLET.laneTop},
 ...KITANO_HAMLET.plots.map(p=>({id:'kitano-yard-'+p.id,minX:p.minX,maxX:p.maxX,minZ:p.minZ,maxZ:p.maxZ,y:KITANO_HAMLET.yardTop})),
].map(Object.freeze));
