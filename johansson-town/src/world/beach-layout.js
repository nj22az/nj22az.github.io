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
