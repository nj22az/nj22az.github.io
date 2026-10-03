import {airportLocal,AIRPORT_HEIGHT} from './airport-ground.js';
import {SEA_LEVEL} from './ocean.js';

/**
 * The road to Kitano-jima, without the building: Kitano Road and Kitano Bridge.
 *
 * The road leaves Main Street at a T-junction opposite the shop crossing, runs east down
 * the old lane between the shop-houses and across the east lawn at grade. Past the walled
 * garden it rises on a low embankment, crosses the beach on a causeway and goes out over
 * the strait on a girder bridge to the airport district's north-west corner, about 55 m
 * of open water. The crest is a navigation span east of the breakwaters.
 *
 * A two-lane carriageway (2 × 2.5 m) with a 1.75 m footway on the harbour (south) side.
 * Japan drives on the left: travelling east the left is south, so the eastbound lane is
 * the south one and the footway is beside it.
 *
 * Everything here is plain numbers: layout.js asks it where people can stand and how high,
 * road-network.js lays its lanes on it and kitano-link.js builds it.
 */
export const KITANO_ROAD=Object.freeze({
 id:'kitano-road',title:'Kitano Road',
 /** Corners of the centreline (the carriageway's middle), each rounded by its radius. */
 corners:Object.freeze([[-.5,3.3,0],[24,3.3,40],[100,-10.75,0]].map(Object.freeze)),
 lane:2.5,
 /** Offsets across the road, positive to the left of eastbound travel (south). */
 section:Object.freeze({north:-2.6,carriageway:2.5,footway:4.25,parapet:.25,kerb:.12}),
 /** Where the rise begins and ends, and the crest. Gradients stay at or under 8 %. */
 profile:Object.freeze({riseFrom:22,crest:3,crestFrom:60.5,crestTo:66,grade:.078,blend:4}),
 /** Town 30 km/h, bridge 40 km/h: scaled to the game's compressed distances (m/s). */
 speed:Object.freeze({town:4.6,bridge:6.2}),
 /** Deck depth under the running surface, for the navigation clearance. */
 deckDepth:.85,
});

/**
 * The running surface is laid this far over whatever it crosses (the lawn, the quarter's
 * paving, the district's slab), clear of each of their own layers.
 */
export const KITANO_SURFACE_LIFT=.08;

/** Where the bridge stands on its piers: from the foot of the beach to the district edge. */
export const KITANO_BRIDGE=Object.freeze({id:'kitano-bridge',title:'Kitano Bridge',fromX:47.6,spans:7});

// ---- The centreline: straight runs joined by circular arcs. ----
function buildPrimitives(){
 const P=KITANO_ROAD.corners,prims=[];let cur=[P[0][0],P[0][1]];
 for(let i=1;i<P.length;i++){
  const [x,z,R]=P[i];
  if(i===P.length-1){prims.push(line(cur,[x,z]));break;}
  const [nx,nz]=P[i+1],d1=unit(x-cur[0],z-cur[1]),d2=unit(nx-x,nz-z);
  const cross=d1[0]*d2[1]-d1[1]*d2[0],theta=Math.acos(Math.max(-1,Math.min(1,d1[0]*d2[0]+d1[1]*d2[1])));
  const T=R*Math.tan(theta/2),a=[x-d1[0]*T,z-d1[1]*T],b=[x+d2[0]*T,z+d2[1]*T];
  prims.push(line(cur,a));
  // Turning toward d2: the centre lies on that side of d1.
  const side=cross<0?-1:1,c=[a[0]-d1[1]*R*side,a[1]+d1[0]*R*side];
  prims.push({kind:'arc',c,R,a0:Math.atan2(a[1]-c[1],a[0]-c[0]),sweep:theta*side,length:R*theta});
  cur=b;
 }
 let s=0;for(const p of prims){p.s0=s;s+=p.length;}
 return prims;
}
function unit(x,z){const l=Math.hypot(x,z);return [x/l,z/l];}
function line(a,b){const l=Math.hypot(b[0]-a[0],b[1]-a[1]);return {kind:'line',a,b,length:l,d:[(b[0]-a[0])/l,(b[1]-a[1])/l]};}
const PRIMS=buildPrimitives();
export const KITANO_ROAD_LENGTH=PRIMS.at(-1).s0+PRIMS.at(-1).length;

/** The centreline at distance s: position and unit heading [x,z,hx,hz]. */
export function roadPoint(s){
 s=Math.max(0,Math.min(KITANO_ROAD_LENGTH,s));
 const p=PRIMS.find(q=>s<=q.s0+q.length+1e-9)||PRIMS.at(-1),t=s-p.s0;
 if(p.kind==='line')return [p.a[0]+p.d[0]*t,p.a[1]+p.d[1]*t,p.d[0],p.d[1]];
 const sign=Math.sign(p.sweep),ang=p.a0+t/p.R*sign;
 return [p.c[0]+Math.cos(ang)*p.R,p.c[1]+Math.sin(ang)*p.R,-Math.sin(ang)*sign,Math.cos(ang)*sign];
}
/** The left of a heading, the way Japan keeps to it: (hz, -hx). */
export const leftOf=(hx,hz)=>[hz,-hx];

/** Nearest centreline station to x,z: {s, o} with o measured to the left of eastbound. */
export function roadStation(x,z){
 let best=null;
 for(const p of PRIMS){
  let s,px,pz;
  if(p.kind==='line'){
   const t=Math.max(0,Math.min(p.length,(x-p.a[0])*p.d[0]+(z-p.a[1])*p.d[1]));s=p.s0+t;px=p.a[0]+p.d[0]*t;pz=p.a[1]+p.d[1]*t;
  }else{
   const sign=Math.sign(p.sweep);let ang=Math.atan2(z-p.c[1],x-p.c[0]),rel=(ang-p.a0)*sign;
   rel=((rel%(2*Math.PI))+2*Math.PI)%(2*Math.PI);if(rel>Math.PI)rel-=2*Math.PI;
   const t=Math.max(0,Math.min(p.length,rel*p.R));s=p.s0+t;[px,pz]=roadPoint(s);
  }
  const d=Math.hypot(x-px,z-pz);
  if(!best||d<best.d)best={s,d,px,pz};
 }
 const [,,hx,hz]=roadPoint(best.s),[lx,lz]=leftOf(hx,hz);
 return {s:best.s,o:(x-best.px)*lx+(z-best.pz)*lz};
}

// ---- The long section: level through town, a steady rise, a crest, down to the airport. ----
const PROFILE_STEP=.25;
const PROFILE=(()=>{
 const P=KITANO_ROAD.profile,end=KITANO_ROAD_LENGTH;
 const descend=(P.crest-AIRPORT_HEIGHT)/P.grade;
 const knots=[[0,0],[P.riseFrom,0],[P.riseFrom+P.crest/P.grade,P.crest],[P.crestTo,P.crest],[P.crestTo+descend,AIRPORT_HEIGHT],[end+50,AIRPORT_HEIGHT]];
 const raw=s=>{for(let i=1;i<knots.length;i++)if(s<=knots[i][0]){const [a,ya]=knots[i-1],[b,yb]=knots[i];return ya+(yb-ya)*(s-a)/(b-a);}return AIRPORT_HEIGHT;};
 // Averaging the broken line over a window gives parabolic vertical curves at each change.
 const h=P.blend,n=Math.ceil(end/PROFILE_STEP)+1,table=new Float32Array(n);
 for(let i=0;i<n;i++){const s=i*PROFILE_STEP;let sum=0;for(let k=0;k<=16;k++)sum+=raw(Math.max(0,s-h+k*h/8));table[i]=sum/17;}
 return {table,knots,landAt:P.crestTo+descend};
})();
/** Running-surface height at station s. */
export function roadHeight(s){
 const f=Math.max(0,Math.min(PROFILE.table.length-1.001,s/PROFILE_STEP)),i=Math.floor(f),t=f-i;
 return PROFILE.table[i]*(1-t)+PROFILE.table[i+1]*t;
}
/** Where the road comes down to the district's own level and simply joins it. */
export const KITANO_ROAD_LANDS=PROFILE.landAt;

/** Station where the road leaves the town's ground for the sea, and where it meets the airport's foundation. */
export const KITANO_SHORE=Object.freeze((()=>{
 let beachFoot=null,district=null;
 for(let s=0;s<=KITANO_ROAD_LENGTH;s+=.1){
  const [x,z]=roadPoint(s);
  if(beachFoot===null&&x>=KITANO_BRIDGE.fromX)beachFoot=s;
  if(district===null&&airportLocal(x,z)[0]>=-54)district=s;
 }
 return {beachFoot,district};
})());

/** The deck's running surface height above the sea at the navigation span. */
export const NAVIGATION_CLEARANCE=+(KITANO_ROAD.profile.crest-KITANO_ROAD.deckDepth-SEA_LEVEL).toFixed(2);

/**
 * Where people can stand on Kitano Road and its bridge, and at what height.
 * The footway is a kerb's height above the carriageway.
 */
export function kitanoRoadAt(x,z,r=0){
 // A cheap box first: the whole road lies in x -1..101, z -12..7.
 if(x<-1||x>KITANO_ROAD_LANDS+2||z<-13||z>7)return null;
 const {s,o}=roadStation(x,z),S=KITANO_ROAD.section;
 if(s<=.01||s>=KITANO_ROAD_LANDS)return null;
 if(o<S.north+r||o>S.footway-r)return null;
 const [px,pz]=roadPoint(s);
 // On the district, past its edge, the road is the airport's ground once it is level.
 const footway=o>S.carriageway;
 const y=roadHeight(s)+(footway?S.kerb:0);
 const bridge=px>=KITANO_BRIDGE.fromX&&s<(KITANO_SHORE.district??Infinity);
 return {id:bridge?KITANO_BRIDGE.id:KITANO_ROAD.id,surface:footway?'stone':'asphalt',y,s,o,x:px,z:pz};
}

/** The opening the road takes through the east seawall (x 33.55), as a beach access is listed. */
export const KITANO_SEAWALL_GAP=Object.freeze((()=>{
 const X=33.55,S=KITANO_ROAD.section;let s=0;
 for(let t=0;t<=KITANO_ROAD_LENGTH;t+=.05)if(roadPoint(t)[0]>=X){s=t;break;}
 const [,z,hx,hz]=roadPoint(s),[,lz]=leftOf(hx,hz),slack=.35/Math.abs(hx);
 const a=z+(S.north-S.parapet)*lz,b=z+(S.footway+S.parapet)*lz,z0=Math.min(a,b)-slack,z1=Math.max(a,b)+slack;
 return {z:(z0+z1)/2,half:(z1-z0)/2};
})());
