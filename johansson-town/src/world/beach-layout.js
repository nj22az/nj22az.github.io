/** Shared by the beach mesh, access ramps, navigation and grounding. */
export const BEACH=Object.freeze({
 id:'east-beach',surface:'sand',minZ:-40.2,maxZ:26.8,
 profile:Object.freeze([[33.9,-.06],[38.5,-.18],[42.5,-.29],[45,-.37],[47.8,-1.05]].map(Object.freeze)),
 accesses:Object.freeze([-10,22.5].map(z=>Object.freeze({z,half:1.6,fromX:32.7,toX:35.4}))),
 waterY:-.56,
});
export function beachHeight(x,z){
 if(z<BEACH.minZ||z>BEACH.maxZ||x<BEACH.profile[0][0]||x>BEACH.profile.at(-1)[0])return null;
 for(let i=1;i<BEACH.profile.length;i++){
  const [bx,by]=BEACH.profile[i], [ax,ay]=BEACH.profile[i-1];
  if(x<=bx)return ay+(by-ay)*(x-ax)/(bx-ax);
 }
 return null;
}
export function beachAccessHeight(x,z){
 const ramp=BEACH.accesses.find(a=>x>=a.fromX&&x<=a.toX&&Math.abs(z-a.z)<=a.half);
 return ramp?beachHeight(ramp.toX,z)*(x-ramp.fromX)/(ramp.toX-ramp.fromX):null;
}

/**
 * Where the sand is graded up to meet the town's 0 datum. The beach ends at an 18 cm step
 * against the quay and the school grounds, and two building circuits cross that step:
 * their paving was laid folded over it, sunk 4 to 10 cm into the ground on the high side.
 * Under each path and 0.6 m either side of it (`core`) the sand comes up level with the
 * ground it meets, and around that it falls back to the beach at 1:6.7 (`slope`, gentler
 * than 1:6), so a path lies on continuous ground. `apply` bounds the sand a grade may
 * raise: the beach side of the step only. Elsewhere the beach's edge is unchanged. `drawn` names the
 * mesh that shows it: the east beach's graded sand (east-lawn.js), or the neighbourhood's ground,
 * which already lies over the sand at the north end (neighbourhood-ground.js).
 */
export const BEACH_GRADES=Object.freeze([
 Object.freeze({id:'ice-plant-circuit',y:0,slope:.15,drawn:'sand',
  why:'the ice plant circuit (architecture-plan.js) runs north off the east quay onto the sand at z -40.2; its east leg is x 36.7 to 38.7',
  core:Object.freeze({minX:36.1,maxX:39.3,minZ:BEACH.minZ,maxZ:BEACH.minZ}),
  apply:Object.freeze({minX:34.1,maxX:41.3,minZ:BEACH.minZ,maxZ:-38.2})}),
 Object.freeze({id:'town-hall-bike-shed-circuit',y:0,slope:.15,drawn:'neighbourhood',
  why:'the town hall bike shed circuit runs along the school grounds\u2019 south edge (z 24.6), its south leg z 22.8 to 24.8 from x 31.5 to 39.6, half on the school and half on the sand',
  core:Object.freeze({minX:30.9,maxX:40.2,minZ:22.2,maxZ:24.6}),
  apply:Object.freeze({minX:28.9,maxX:42.2,minZ:20.2,maxZ:24.6})}),
].map(Object.freeze));
/** The graded height at (x, z), or null where no grade reaches. */
export function beachGrade(x,z){
 let best=null;
 for(const g of BEACH_GRADES){
  const a=g.apply,c=g.core;
  if(x<a.minX||x>a.maxX||z<a.minZ||z>a.maxZ)continue;
  const d=Math.hypot(Math.max(c.minX-x,0,x-c.maxX),Math.max(c.minZ-z,0,z-c.maxZ)),y=g.y-g.slope*d;
  if(best===null||y>best)best=y;
 }
 return best;
}
/** Ground height `y` at (x, z) with the sand grades laid over it: they only ever raise it. */
export function gradedHeight(x,z,y){
 const g=beachGrade(x,z);
 return y!==null&&g!==null&&g>y?g:y;
}

/** Dry edge derived from the same profile and tide used by movement. */
export const BEACH_DRY_EDGE_X=(()=>{
 const limit=BEACH.waterY+.025;
 for(let i=1;i<BEACH.profile.length;i++){
  const [ax,ay]=BEACH.profile[i-1],[bx,by]=BEACH.profile[i];
  if(by<limit)return ax+(limit-ay)*(bx-ax)/(by-ay);
 }
 return BEACH.profile.at(-1)[0];
})();

/** The quiet corner at the north end with chairs facing the sea (beach-corner.js); town-audio.js plays the shore around it. */
export const BEACH_CORNER=Object.freeze({x:38.4,z:16,radius:32});
