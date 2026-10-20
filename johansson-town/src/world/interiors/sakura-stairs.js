import * as THREE from '../../../vendor/three.module.js';
import {createHouseWalk} from '../house-walk.js';
import {buildSakuraOfficeRoom} from './sakura-office-room.js';

// Two flights in the existing western stockroom; the delivery passage stays east.
export const SAKURA_STAIR=Object.freeze({height:4.01,officeZ:-.64,
 well:{minX:-5.65,maxX:-.6,minZ:-6.78,maxZ:-4},
 hole:{minX:-5.65,maxX:-2.05,minZ:-6.14,maxZ:-4},
 bottom:[-1.25,0,-4.6],top:[-1.25,4.01,-3.5]});

/** The stairwell's north wall, on the stair's side of the restroom partition (z -4.03), in the shop's frame. */
export const STAIR_NORTH=Object.freeze({z0:-4.07,z1:-4.03});
/**
 * Which storey the player is shown (the owner, 20 October 2026: "I don't think the whole shop needs to load after we go
 * up the stairs to the top floor office"). Three, by where his feet are:
 * - 'office': above `up` on the upper flight, on the top landing and upstairs. The sales floor is put away, not drawn and
 *   not run (people/sakura-shop.js); the stockroom and the stairwell stay, because the stair's hole looks down into them.
 *   `up` is where the window views already change to the office's (game.js streetFrontageOf), and he goes back to the
 *   stair only below `down`, a step lower, so standing on the line never flickers. At both, from the player's eye or the
 *   lens behind him, the sales floor is out of sight: the only way to it is the passage (x 3.25..4.39 on the partition),
 *   and from over 3.5 m on the upper flight that line runs into the stairwell's east wall or the stockroom's ceiling.
 * - 'shop': on the sales floor (north of the partition's face, `salesFloorZ`). The upstairs rooms are put away: from
 *   there the stairwell is seen, if at all, through the passage, and the hole over it is behind the stairwell's east
 *   wall and the stockroom's ceiling (tests/sakura-storeys.test.mjs walks the lines).
 * - 'stair': in the stockroom and on the flights below `up`, where both can be seen: both are drawn.
 */
export const SAKURA_STOREY=Object.freeze({up:SAKURA_STAIR.height-.3,down:SAKURA_STAIR.height-.5,salesFloorZ:-3.95});
export function sakuraStoreyAt(p,previous='shop'){
 const S=SAKURA_STOREY;
 if(p.y>S.up||previous==='office'&&p.y>S.down)return 'office';
 return p.y<.5&&p.z>S.salesFloorZ?'shop':'stair';
}

/**
 * The turning landing (x -5.6..-4.5, z -6.7..-4.05, at half height) is 1.1 m wide between the stairwell's west wall and
 * the guard between the flights: the lens standing behind him there met a plain wall a step away and the screen was
 * plaster. On the landing the lens leaves him and stands where it frames him and the next flight: going up, at the head
 * of the upper flight looking back down it at him; going down, at the foot of the lower flight looking up it, or, while
 * he is still behind the guard between the flights at the landing's south end, from the head of the flight he came down,
 * over him to the landing's north end where the lower flight begins. Each is in line with him and its flight, so the
 * frame holds both on an upright phone too.
 * game.js takes the first whose sight of him is clear, and eases in and out of it.
 */
export const SAKURA_LANDING=Object.freeze({x:Object.freeze([-5.6,-4.5]),z:Object.freeze([-6.7,-4.05]),y:SAKURA_STAIR.height/2,
 flights:Object.freeze({lower:Object.freeze({x:[-4.5,-1.8],z:[-5.15,-4.05]}),upper:Object.freeze({x:[-4.5,-1.8],z:[-6.7,-5.6]})}),
 lens:Object.freeze({
  up:Object.freeze([Object.freeze({pos:Object.freeze([-2.3,5.0,-6.3]),flight:Object.freeze([-3.4,3.1,-6.15])})]),
  down:Object.freeze([Object.freeze({pos:Object.freeze([-1.45,2.05,-4.55]),flight:Object.freeze([-3.2,1.3,-4.6])}),Object.freeze({pos:Object.freeze([-2.3,5.0,-6.3]),flight:Object.freeze([-5.05,2.1,-4.6])})]),
 })});
const within=(v,[a,b],m=0)=>v>=a-m&&v<=b+m;
export const onSakuraLanding=p=>within(p.x,SAKURA_LANDING.x,.02)&&within(p.z,SAKURA_LANDING.z,.02)&&Math.abs(p.y-SAKURA_LANDING.y)<.3;
/** Which flight he is on, if any. */
export function sakuraFlightAt(p){
 for(const [id,f] of Object.entries(SAKURA_LANDING.flights))if(within(p.x,f.x)&&within(p.z,f.z)&&p.y>.05&&p.y<SAKURA_STAIR.height-.05)return id;
 return null;
}
/** The landing's lenses for him at p, best first: going 'up' (he came off the lower flight) or 'down'. */
export function sakuraLandingLens(p,going='up'){
 const chest=[p.x,p.y+1.2,p.z];
 return SAKURA_LANDING.lens[going==='down'?'down':'up'].map(c=>({pos:c.pos,at:chest.map((v,i)=>v+(c.flight[i]-v)*.35),chest}));
}

// Upper bounds include the stair landing behind the office's rear wall.
export const sakuraBoundsAt=(base,y)=>y>SAKURA_STAIR.height-.24?
 {bounds:{minX:-6.4,maxX:6.4,minZ:-6.78,maxZ:3.91}}:base;

export function sakuraStoreys(base){
 const H=SAKURA_STAIR.height;
 const floors=[
  {id:'shop',x:[-6.8,6.8],z:[-3.95,3.88],y:0},
  {id:'stockroom',x:[-5.7,5.7],z:[-6.78,-3.95],y:0},
  {id:'office-lower-flight',x:[-4.5,-1.8],z:[-5.15,-4.05],y:{x:[H/2,0]},thick:.1},
  {id:'office-turn',x:[-5.6,-4.5],z:[-6.7,-4.05],y:H/2,thick:.1},
  {id:'office-upper-flight',x:[-4.5,-1.8],z:[-6.7,-5.6],y:{x:[H/2,H]},thick:.1},
  {id:'office-top-landing',x:[-1.8,-.6],z:[-6.7,-4],y:H,thick:.12},
  {id:'office-main',x:[-6.4,6.4],z:[-4,3.91],y:H,thick:.12},
  {id:'office-rear-west',x:[-6.4,-5.65],z:[-6.14,-4],y:H,thick:.12},
  {id:'office-rear-east',x:[-2.05,6.4],z:[-6.14,-4],y:H,thick:.12}
 ];
 return {...base,storeys:true,walk:createHouseWalk(floors)};
}

/** Same real office, mounted over the shop, with a hole rather than a solid floor across its stairs. */
export function buildSakuraStoreys({room,reg,action}){
 const parent=room;room=new THREE.Group();room.name='Sakura internal stairwell';parent.add(room);
 const S=SAKURA_STAIR,H=S.height,colliders=[];
 const material=new THREE.MeshStandardMaterial({color:0x8d7458,roughness:.88});
 const box=(w,h,d,x,y,z,name)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.name=name;room.add(m);return m;};
 const solid=(x,z,w,d,height,minY=0)=>colliders.push({x,z,w,d,height,minY});
 // Continue the stockroom enclosure up to the office roof; no open strip above the old ceiling.
 const plaster=new THREE.MeshStandardMaterial({color:0xece1ca,roughness:.9});
 for(const [w,h,d,x,y,z] of [[.08,H+2.8,2.78,-5.7,(H+2.8)/2,-5.39],[5.1,H+2.8,.08,-3.15,(H+2.8)/2,-6.78],[.08,H+2.8,.64,-.6,(H+2.8)/2,-6.46],[5.1,.12,.64,-3.15,H+2.86,-6.46]]){
  const wall=box(w,h,d,x,y,z,'Sakura enclosed stairwell');wall.material=plaster;
  if(h>1)solid(x,z,w,d,h);
 }
 // The stairwell's north side, against the restroom partition (sakura-shell.js, z -4.03..-3.95). The partition stops at the
 // shop's ceiling (2.98) and carried no collider west of x -4.57, so from the stair the lens went through it into the
 // toilet, or over the ceiling into the void above the shop and its sky (the owner, 20 October 2026, on his iPhone:
 // "when I'm in the stairs in the storage room it clips to the toilet"). Plaster from the floor beside the turning
 // landing, and over the partition to the office floor along both flights: a wall for the lens as for the eye.
 for(const [x0,x1,y0] of [[-5.7,-4.6,0],[-4.6,-.6,2.9]]){
  const wall=box(x1-x0,H-y0,STAIR_NORTH.z1-STAIR_NORTH.z0,(x0+x1)/2,(H+y0)/2,(STAIR_NORTH.z0+STAIR_NORTH.z1)/2,'Sakura stairwell north wall');
  wall.material=plaster;solid((x0+x1)/2,(STAIR_NORTH.z0+STAIR_NORTH.z1)/2,x1-x0,STAIR_NORTH.z1-STAIR_NORTH.z0,H-y0,y0);
 }
 // Its east side under the hall floor, between the stockroom's ceiling and the office floor: from the lower flight the
 // lens looked over the stockroom ceiling into the open void there, and out of the building.
 {const z0=-6.14,z1=STAIR_NORTH.z1,wall=box(.08,H-2.9,z1-z0,-.6,(H+2.9)/2,(z0+z1)/2,'Sakura stairwell east wall');wall.material=plaster;solid(-.6,(z0+z1)/2,.08,z1-z0,H-2.9,2.9);}
 for(let i=0;i<12;i++){
  const t=(i+.5)/12,y=(i+1)*H/24;
  box(2.7/12,.1,1.1,-1.8-t*2.7,y-.05,-4.6,'Sakura lower stair tread');
  box(2.7/12,.1,1.1,-4.5+t*2.7,H/2+y-.05,-6.15,'Sakura upper stair tread');
 }
 box(1.1,.12,2.65,-5.05,H/2-.06,-5.375,'Sakura stair turn landing');
 box(1.2,.12,2.7,-1.2,H-.06,-5.35,'Sakura office top landing');
 const diffuser=new THREE.MeshBasicMaterial({color:0xfff1ce,toneMapped:false});diffuser.userData.keepPhysical=true;diffuser.userData.keepPhysicalStrict=true;
 const lamp=new THREE.Mesh(new THREE.BoxGeometry(.06,.32,.2),diffuser);lamp.position.set(-5.59,H/2+1.5,-5.35);lamp.name='Sakura stair bulkhead';room.add(lamp);
 // Enclose the under-stair space and guard the open edges at their actual height.
 for(const [x,z,w,d,top,bottom] of [[-3.15,-4.02,2.9,.06,3.05,0],[-5.64,-5.375,.06,2.75,H+1,0],[-3.15,-5.375,2.7,.06,H/2+1,H/2],[-3.85,-4,3.6,.06,H+1,H],[-2.05,-4.8,.06,1.5,H+1,H]]){
  // Solid as drawn, from its foot to its top: given the top as a height, the guard between the flights stood to 5 m for
  // the lens, a wall in the air over the turning landing that the camera met wherever it turned.
  box(w,top-bottom,d,x,(top+bottom)/2,z,'Sakura stair guard');solid(x,z,w,d,top-bottom,bottom);
 }
 for(const [x,y,z,turn] of [[-3.15,H/4+1,-4.07,1],[-3.15,H*.75+1,-6.67,-1]]){
  const rail=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,Math.hypot(2.7,H/2),8),material);
  rail.position.set(x,y,z);rail.rotation.z=turn*Math.atan2(2.7,H/2);rail.name='Sakura stair handrail';room.add(rail);
 }
 const office=new THREE.Group();office.name='Sakura upstairs main office';office.position.set(0,H,S.officeZ);room.add(office);
 buildSakuraOfficeRoom({room:office,reg,action,internal:true,
  collider:(x,z,w,d,height)=>solid(x,z+S.officeZ,w,d,height+H,H)});
 // Seats are stored in room coordinates, not the nested office's local frame.
 office.traverse(o=>{const seat=o.userData.seat;if(!seat)return;for(const key of ['position','stand'])if(seat[key]){seat[key][1]+=H;seat[key][2]+=S.officeZ;}for(const key of ['surfaceY','eyeY'])if(Number.isFinite(seat[key]))seat[key]+=H;});
 return {colliders,office};
}
