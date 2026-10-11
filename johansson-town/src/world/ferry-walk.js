import * as THREE from '../../vendor/three.module.js';
import {FERRY_HULL,FERRY_DECKS,FERRY_RAMP,FERRY_CASINGS,GATE,GANGWAY_LENGTH,halfBreadth} from './ferry-model.js';
import {FERRY_HEIGHTS,FERRY_SHIP} from './ferry-ship.js';

/**
 * Walking aboard the Minato Maru while she lies alongside (the creator, 2026-10-11: "I want to be able to board and
 * explore the ferry, whenever it's in port"). Her decks are floors in her own frame, so they heave and roll with her
 * and stack one over another (the car deck under the passenger deck): the floor you stand on is the one nearest your
 * feet, within a step. Her houses, casings and fittings are solids in her frame. Where a floor ends you step onto the
 * shore only where the shore is there to step onto: off the gangway's foot onto the pier, off the ramp's flap onto
 * the quay or Kitano-jima's pier.
 *
 * Model frame (ferry-model.js): +z forward, +x to port, y up from her laden waterline. Each floor belongs to one moving
 * part: the ship, the ramp's leaf, its flap, or the gangway (whose own frame runs x out from her side, z along her).
 */
const HALF=FERRY_HULL.length/2,HB=FERRY_HULL.beam/2,CAR=FERRY_DECKS.car.y;
const Z=zy=>zy-HALF,Y=yk=>yk-FERRY_SHIP.draft;
const PASS=Y(FERRY_HEIGHTS.passengerDeck);
/** The highest step a foot takes without a stair: physics.js canStepBetween. */
export const FERRY_STEP=.24;
/** A person, from the soles to the top of the head (physics.js standingHitsRect). */
const TALL=1.82;
const C=FERRY_CASINGS,P=C.passage,BHS=C.bowHouses;
/** The inside face of her bulwark, off her side plating (ferry-model.js deckAndBulwarks). */
const bulwarkIn=z=>halfBreadth(z)-.07;

const floor=(id,part,x,z,y,inside=null)=>Object.freeze({id,part,x:Object.freeze(x),z:Object.freeze(z),y,inside});
/**
 * The floors you can walk on alongside: `inside(x, z, r)` (the part's frame) says where on it a person of radius `r`
 * may stand, where its edge is a bulwark or a rail rather than an open end.
 */
export const FERRY_FLOORS=Object.freeze([
 // The car deck, bulwark to bulwark from the transom to the stem, open at the gangway gate (its 1 m opening in the
 // port bulwark) and forward between the bow houses to the ramp.
 floor('car-deck','ship',[-HB,HB],[-HALF+.08,HALF],CAR,(x,z,r)=>{
  if(z<-HALF+.12+r)return false;
  const atGate=x>0&&z>=GATE.from+r&&z<=GATE.to-r;
  return Math.abs(x)<=(atGate?halfBreadth(z):bulwarkIn(z)-r);
 }),
 // The bow ramp's leaf and flap (ferry-model.js FERRY_RAMP): their tops, 0.07 and 0.05 over their pivots.
 floor('ramp','ramp',[-FERRY_RAMP.width/2,FERRY_RAMP.width/2],[0,FERRY_RAMP.leaf],.07,(x,z,r)=>Math.abs(x)<=FERRY_RAMP.clear/2-.05),
 floor('flap','flap',[-FERRY_RAMP.flapWidth/2,FERRY_RAMP.flapWidth/2],[0,FERRY_RAMP.flap],.05),
 // The gangway: 2 m of plank, 0.9 m wide between hand rails 0.43 m out.
 floor('gangway','gangway',[0,GANGWAY_LENGTH],[-.45,.45],.03,(x,z,r)=>Math.abs(z)<=.41-r),
]);

const solid=(id,x,y,z,part='ship')=>Object.freeze({id,part,x:Object.freeze(x),y:Object.freeze(y),z:Object.freeze(z)});
/** What stands on her decks, in the same frames: what a person walks round and the camera stays out of. */
export const FERRY_SOLIDS=Object.freeze([
 // The casings, the port one in two with the passage between them, its deckhead 2 m up.
 solid('casing-p-aft',[C.inner,HB],[CAR,C.top],[C.aft,P.from]),
 solid('casing-p-fore',[C.inner,HB],[CAR,C.top],[P.to,C.fore]),
 solid('passage-deckhead',[C.inner,HB],[CAR+P.height,C.top],[P.from,P.to]),
 solid('casing-s',[-HB,-C.inner],[CAR,C.top],[C.aft,C.fore]),
 // The passage's inboard door, hooked back against the casing's face.
 solid('walkway-door-leaf',[3.03,C.inner],[CAR,CAR+2],[P.from-.95,P.from-.05]),
 // The walkway's rail on the lane side (ferry-model.js), and the pillars under the passenger deck's open ends.
 solid('walkway-rail',[2.17,2.23],[CAR,CAR+1.08],[Z(10),Z(15)]),
 ...[1,-1].flatMap(s=>[Z(.3),Z(22.7)].map(z=>solid('pillar',[s*3.75-.11,s*3.75+.11].sort((a,b)=>a-b),[CAR,PASS],[z-.11,z+.11]))),
 // The aft mooring station: the capstan and two pairs of bitts.
 solid('capstan',[-.3,.3],[CAR,CAR+.6],[Z(1.2)-.3,Z(1.2)+.3]),
 ...[1,-1].map(s=>solid('bitts',[s*2.9-.13,s*2.9+.13].sort((a,b)=>a-b),[CAR,CAR+.5],[Z(1.6)-.39,Z(1.6)+.39])),
 // The bow houses either side of the ramp, and the ladders up their aft faces.
 ...[1,-1].map(s=>solid('bow-house',[s*BHS.inner,s*HB].sort((a,b)=>a-b),[CAR,BHS.top],[BHS.aft,HALF])),
 ...[1,-1].map(s=>solid('forecastle-ladder',[s*3.4-.3,s*3.4+.3].sort((a,b)=>a-b),[CAR,BHS.top+.95],[BHS.aft-.17,BHS.aft])),
 // The passenger deck over the car deck (its slab: the lens stays under it).
 solid('passenger-deck',[-HB,HB],[PASS-.25,PASS],[-HALF,FERRY_DECKS.upper.fore]),
 // The ramp's rams, from the bow houses to the leaf's edges: the outer edges of the leaf, near the hinge.
 ...[1,-1].map(s=>solid('ramp-ram',[s*1.98,s*2.4].sort((a,b)=>a-b),[0,2.6],[0,1.9],'ramp')),
 // The gangway's hand rails.
 ...[1,-1].map(s=>solid('gangway-rail',[0,GANGWAY_LENGTH],[0,1],[s*.41,s*.47].sort((a,b)=>a-b),'gangway')),
]);

/**
 * The deck walk for one ship (ferry.js createFerryRun's `run`): which floors are out (the gangway only while it is
 * run out, the ramp only while it is down), where they are in the world this frame, and the moves on them.
 */
export function createFerryWalk(run){
 const ferry=run.ferry,parts={ship:ferry,ramp:ferry.userData.ramp,flap:ferry.userData.flap,gangway:ferry.userData.gangway};
 const inverse=Object.fromEntries(Object.keys(parts).map(k=>[k,new THREE.Matrix4()]));
 const v=new THREE.Vector3();
 // Each floor's four corners in the world, this frame.
 const corners=FERRY_FLOORS.map(()=>[0,1,2,3].map(()=>new THREE.Vector3()));
 let open=[];
 /** Out, for walking: the ship visible and lying alongside; the gangway run out; the ramp down on its landing. */
 function partOpen(part){
  if(!ferry.visible||run.phase!=='waiting')return false;
  if(part==='gangway')return parts.gangway?.visible===true;
  if(part==='ramp'||part==='flap')return (run.rampDown??0)>=1;
  return true;
 }
 function update(){
  ferry.updateMatrixWorld(true);open=[];
  for(const [k,o] of Object.entries(parts))if(o)inverse[k].copy(o.matrixWorld).invert();
  FERRY_FLOORS.forEach((f,i)=>{
   if(!parts[f.part]||!partOpen(f.part))return;
   const m=parts[f.part].matrixWorld,c=corners[i];
   c[0].set(f.x[0],f.y,f.z[0]).applyMatrix4(m);c[1].set(f.x[1],f.y,f.z[0]).applyMatrix4(m);
   c[2].set(f.x[1],f.y,f.z[1]).applyMatrix4(m);c[3].set(f.x[0],f.y,f.z[1]).applyMatrix4(m);
   open.push(i);
  });
 }
 /** The height of floor `i` under the world point (x, z), or null where it is not. */
 function heightOn(i,x,z){
  const c=corners[i];
  for(const [a,b,d] of [[c[0],c[1],c[2]],[c[0],c[2],c[3]]]){
   const det=(b.z-d.z)*(a.x-d.x)+(d.x-b.x)*(a.z-d.z);if(Math.abs(det)<1e-9)continue;
   const l1=((b.z-d.z)*(x-d.x)+(d.x-b.x)*(z-d.z))/det,l2=((d.z-a.z)*(x-d.x)+(a.x-d.x)*(z-d.z))/det,l3=1-l1-l2;
   if(l1>=-1e-6&&l2>=-1e-6&&l3>=-1e-6)return l1*a.y+l2*b.y+l3*d.y;
  }
  return null;
 }
 /** The floor under (x, z) nearest to feet at `y`, within a step of them: {floor, y}, or null. */
 function floorAt(x,z,y,step=FERRY_STEP){
  let best=null;
  for(const i of open){const h=heightOn(i,x,z);if(h===null||Math.abs(h-y)>step)continue;if(!best||Math.abs(h-y)<Math.abs(best.y-y))best={floor:FERRY_FLOORS[i],y:h};}
  return best;
 }
 /**
  * The floor under feet at `y`: the highest at (x, z) no more than a step above them (in the air, during a jump, it is
  * the one he comes down on), or null.
  */
 function floorBelow(x,z,y,step=FERRY_STEP){
  let best=null;
  for(const i of open){const h=heightOn(i,x,z);if(h===null||h>y+step)continue;if(!best||h>best.y)best={floor:FERRY_FLOORS[i],y:h};}
  return best;
 }
 /** A point in a part's frame. */
 const local=(part,x,y,z)=>v.set(x,y,z).applyMatrix4(inverse[part]);
 /** Whether a person of radius `r` with their feet at world (x, y, z) runs into anything aboard; `height` 1.82 standing. */
 function blocked(x,y,z,r,height=TALL){
  for(const s of FERRY_SOLIDS){
   if(!partOpen(s.part)||!parts[s.part])continue;
   const p=local(s.part,x,y,z);
   if(s.y[0]>=p.y+height||s.y[1]<=p.y+.03)continue;
   if(p.x>s.x[0]-r&&p.x<s.x[1]+r&&p.z>s.z[0]-r&&p.z<s.z[1]+r)return true;
  }
  return false;
 }
 /**
  * A step from where he stands, `y` the height of the floor or ground under him, at world (x, z), to (nx, nz): `null` if
  * it is not onto one of her floors (the shore decides),
  * else {ok, y, floor}: ok false where a bulwark, a rail or something standing on her deck is in the way.
  */
 function move(x,y,z,nx,nz,r){
  const on=floorAt(nx,nz,y);if(!on)return null;
  const f=on.floor,p=local(f.part,nx,on.y,nz);
  if(f.inside&&!f.inside(p.x,p.z,r))return {ok:false,y:on.y,floor:f};
  if(blocked(nx,on.y,nz,r))return {ok:false,y:on.y,floor:f};
  return {ok:true,y:on.y,floor:f};
 }
 /** For the third-person lens: inside a solid aboard (a point, `r` its radius). */
 function cameraBlocked(x,z,y,r){
  for(const s of FERRY_SOLIDS){
   if(!partOpen(s.part)||!parts[s.part])continue;
   const p=local(s.part,x,y,z);
   if(p.y<s.y[0]-r||p.y>s.y[1]+r)continue;
   if(p.x>s.x[0]-r&&p.x<s.x[1]+r&&p.z>s.z[0]-r&&p.z<s.z[1]+r)return true;
  }
  return false;
 }
 /** Whether feet at world (x, y, z) are on her: over one of her floors (ferry-walk's floorBelow). */
 const aboard=(x,y,z)=>!!floorBelow(x,z,y);
 /** Her floors' world corners this frame (the tests and the look tool). */
 const outline=()=>open.map(i=>({id:FERRY_FLOORS[i].id,corners:corners[i].map(c=>c.toArray())}));
 return {update,floorAt,floorBelow,move,blocked,cameraBlocked,aboard,outline,partOpen,local:(part,x,y,z)=>local(part,x,y,z).toArray()};
}
