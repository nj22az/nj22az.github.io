/** One ground plan for the park opposite Sakura, its businesses and public walks. */
const point=(x,z)=>Object.freeze([x,z]);
const rect=(minX,maxX,minZ,maxZ)=>Object.freeze({minX,maxX,minZ,maxZ});
export const HARBOUR_PARK_MAIN=rect(5.2,32.5,-36.2,-14.4);
export const HARBOUR_PARK_EXTENSION=rect(16.0,32.5,-14.4,-3.6);
export const HARBOUR_PARK_ENTRY=point(6,-20.8);
export const HARBOUR_ONSEN=Object.freeze({x:23.4,z:-20.6,yaw:-Math.PI/2});
export const HARBOUR_POND=Object.freeze({x:26,z:-31,rx:3,rz:2,waterY:-.08,bedY:-.35});
export const HARBOUR_CHERRY=point(12,-29.8);
export const HARBOUR_SHRINE=Object.freeze({x:10.8,z:-34.6,approach:point(10.8,-33.5)});
export const HARBOUR_PARK_SEATS=Object.freeze([
 Object.freeze({id:'harbour-park-bench',x:11,z:-29.8,yaw:Math.PI/2,stand:point(9.7,-29.8)}),
 Object.freeze({id:'garden-pond-bench',x:26,z:-35.2,yaw:Math.PI,stand:point(26,-34.2)}),
]);
export const HARBOUR_PARK_STUDY=Object.freeze([point(9.1,-27.4),point(10.6,-26.7)]);
export const HARBOUR_FLORIST=Object.freeze({id:'rainflower-florist',name:'Rainflower Florist',owner:'Mrs Kinjō',x:21,z:17,bounds:rect(19,23,15.4,18.6),approach:point(18.2,17.1),staffAt:point(21.85,17.5),open:540,close:1080});
export const NAKAMURA_DESSERTS=Object.freeze({id:'nakamura',alias:'blue-coral',name:'Nakamura · zenzai & Blue Coral',owner:'Mrs Nakamura',x:5.7,z:-10.9,approach:point(4.5,-10.0),staffAt:point(7.35,-10.55),open:600,close:1140});
const inside=(b,x,z,pad=0)=>x>=b.minX-pad&&x<=b.maxX+pad&&z>=b.minZ-pad&&z<=b.maxZ+pad;
export const inHarbourPark=(x,z,pad=0)=>inside(HARBOUR_PARK_MAIN,x,z,pad)||inside(HARBOUR_PARK_EXTENSION,x,z,pad);
export const harbourPondAt=(x,z,pad=0)=>((x-HARBOUR_POND.x)/(HARBOUR_POND.rx+pad))**2+((z-HARBOUR_POND.z)/(HARBOUR_POND.rz+pad))**2<1;
export const harbourParkHeight=(x,z)=>inHarbourPark(x,z)?(harbourPondAt(x,z)?HARBOUR_POND.bedY:0):null;
const route=(id,width,points,surface='stone')=>Object.freeze({id,width,points:Object.freeze(points.map(p=>point(...p))),surface,park:true,peninsula:true});
/** The road crossing stays at Z=-18; the clear path turns toward the visible onsen porch. */
export const HARBOUR_PARK_PATHS=Object.freeze([
 route('park-approach',3,[[2.5,-18],[6,-20.8],[12,-22.4]]),
 route('garden-onsen-approach',2.4,[[12,-22.4],[16.8,-22.2],[18,-22],[19.4,-22]]),
 route('garden-cherry-walk',1.8,[[6,-20.8],[8.9,-24.8],[9,-29.8],[9,-32.8],[17,-34.2],[22,-34.2]]),
 route('garden-pond-loop',1.8,[[22,-34.2],[30.5,-34.2],[31.4,-31],[30.5,-27.8],[22,-27.8],[21,-31],[22,-34.2]],'gravel'),
 route('garden-quay-walk',2.2,[[20.3,-38],[20.3,-35.3],[22,-34.2]]),
 route('garden-shore-walk',2,[[31.5,-36.2],[31.5,-14.8],[31.5,-10],[32.7,-10]]),
 route('garden-neighbourhood-walk',2,[[12,-22.4],[12,-15.4],[17,-15.4],[22,-15.4],[31.5,-15.4]]),
 route('garden-beach-connection',2.4,[[17,-15.4],[17,-10],[31.5,-10]]),
]);
export function parkPathAt(x,z,pad=0){
 for(const r of HARBOUR_PARK_PATHS)for(let i=1;i<r.points.length;i++){
  const a=r.points[i-1],b=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));
  if(Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)<=r.width/2+pad)return r;
 }
 return null;
}
/** Old named destinations resolve here; the former compounds no longer have scenery. */
export const HARBOUR_PARK_ALIASES=Object.freeze({park:'harbour-park','aoba-garden':'harbour-park','japanese-garden':'harbour-park','east-garden':'harbour-park','rainflower-lane':'rainflower-florist','blue-coral':'nakamura'});
