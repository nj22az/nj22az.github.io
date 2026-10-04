/**
 * The town's colliders, by where they are: a query looks only at the few near a point
 * instead of every one in the town (there are about a thousand, and the camera, walking
 * and every resident ask many times a frame).
 *
 * The list stays the source of truth: anything may push, remove or move a collider (the
 * ferry tying up, a car parking). refresh() once a frame notices any such change by a
 * cheap fingerprint and rebuilds. Adding or removing one is seen at once; moving one in the
 * middle of a frame is seen from the next frame.
 */
export function createColliderGrid(list,{cell=4}={}){
 let cells=new Map(),print=NaN,stamp=0,count=-1,last=null;
 const seen=new WeakMap(),found=[];
 const key=(i,j)=>i*131071+j;
 const fingerprint=()=>{let s=list.length;for(let i=0;i<list.length;i++){const c=list[i];s+=(c.x*7.1+c.z*3.7+(c.w||0)*1.3+(c.d||0)*1.9+(c.yaw||0))*((i%7)+1);}return s;};
 function rebuild(){
  cells=new Map();count=list.length;last=list[list.length-1];
  for(const c of list){
   if(!(Math.abs(c.x)<1e5&&Math.abs(c.z)<1e5))continue;// parked out of the way
   const half=Math.hypot(c.w||0,c.d||0)/2;
   for(let i=Math.floor((c.x-half)/cell);i<=Math.floor((c.x+half)/cell);i++)for(let j=Math.floor((c.z-half)/cell);j<=Math.floor((c.z+half)/cell);j++){
    const k=key(i,j);let a=cells.get(k);if(!a)cells.set(k,a=[]);a.push(c);
   }
  }
 }
 const api={
  refresh(){const p=fingerprint();if(p!==print){print=p;rebuild();}},
  /** The colliders that could touch a circle of radius r at x,z. */
  near(x,z,r){
   // Something added or taken away (a bicycle's collider as you mount it) counts at once.
   if(Number.isNaN(print)||list.length!==count||list[list.length-1]!==last)api.refresh();
   stamp++;found.length=0;
   for(let i=Math.floor((x-r)/cell);i<=Math.floor((x+r)/cell);i++)for(let j=Math.floor((z-r)/cell);j<=Math.floor((z+r)/cell);j++){
    const a=cells.get(key(i,j));if(!a)continue;
    for(const c of a)if(seen.get(c)!==stamp){seen.set(c,stamp);found.push(c);}
   }
   return found;
  },
  some(x,z,r,test){for(const c of api.near(x,z,r))if(test(c))return true;return false;},
 };
 return api;
}
