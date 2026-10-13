import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {standingHitsRect} from '../physics.js';
import {buildJohanssonHouse,roomPoint,storeyAt,HOUSE_STOREY_FLOOR,houseFloors} from '../src/world/interiors/johansson-house-interior.js';
import {HOUSE_ROOMS,HOUSE_FLOORS} from '../src/world/johansson-house.js';

/** The house built as the game builds it, with its prompts and colliders collected. */
function build(){
 installDOM();
 const room=new THREE.Group(),anchors=[],cols=[];
 const layout=buildJohanssonHouse({room,reg:(o,label)=>anchors.push({o,label}),action(){},collider:(x,z,w,d,height=2.8,minY=0)=>cols.push({x,z,w,d,height,minY})});
 room.updateMatrixWorld(true);
 return {room,layout,anchors,cols};
}
const R=.28,STEP=.1;

/**
 * Everywhere he can walk from the front door, as game.js walks a room with storeys: each step is onto a floor within
 * a step of his feet (house-walk.js), inside the room's bounds and clear of every collider at that height.
 */
function reach({layout,cols}){
 const B=layout.bounds,walk=layout.walk;
 const blocked=(x,y,z)=>x<B.minX+R||x>B.maxX-R||z<B.minZ+R||z>B.maxZ-R||cols.some(c=>standingHitsRect(x,z,R,y,c));
 const key=(i,j,y)=>i+','+j+','+Math.round(y*20);
 const [sx,sy,sz]=layout.spawn,start={i:Math.round(sx/STEP),j:Math.round(sz/STEP),y:walk.floorAt(sx,sz,sy).y};
 assert.ok(!blocked(sx,start.y,sz),'the genkan is blocked where he comes in');
 const seen=new Map([[key(start.i,start.j,start.y),start]]),queue=[start];
 while(queue.length){
  const p=queue.pop();
  for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const i=p.i+di,j=p.j+dj,m=walk.move(p.i*STEP,p.y,p.j*STEP,i*STEP,j*STEP,R,(x,y,z)=>blocked(x,y,z));
   if(!m.ok)continue;const k=key(i,j,m.y);if(seen.has(k))continue;
   const q={i,j,y:m.y};seen.set(k,q);queue.push(q);
  }
 }
 return [...seen.values()];
}

test('every room on every floor is reached from the front door, up and down the stair', ()=>{
 const h=build(),points=reach(h);
 for(const r of HOUSE_ROOMS){
  const F=HOUSE_FLOORS[r.level].floor-HOUSE_FLOORS.G0.floor,[x0,y0,x1,y1]=r.bounds;
  const [ax,,az]=roomPoint(x0,y1,0),[bx,,bz]=roomPoint(x1,y0,0);
  const inside=points.filter(p=>p.i*STEP>ax&&p.i*STEP<bx&&p.j*STEP>az&&p.j*STEP<bz&&Math.abs(p.y-F)<(r.id.endsWith('-stair')?1.5:.2));
  assert.ok(inside.length>(r.id.endsWith('-stair')?5:20),`${r.id} (${r.name}) is not reached from the door: ${inside.length} places`);
 }
 // He gets to the top floor and the bottom one by the stair, nowhere else.
 assert.ok(points.some(p=>Math.abs(p.y-HOUSE_STOREY_FLOOR.L1)<.01)&&points.some(p=>Math.abs(p.y-HOUSE_STOREY_FLOOR.B1)<.01));
 assert.ok(!points.some(p=>p.y<HOUSE_STOREY_FLOOR.B1-.01||p.y>HOUSE_STOREY_FLOOR.L1+.01),'feet below the basement or over the upper floor');
});

test('every prompt in the house can be walked up to on its own floor', ()=>{
 const h=build(),points=reach(h),p=new THREE.Vector3();
 assert.ok(h.anchors.length>=35,'prompts: '+h.anchors.length);
 for(const a of h.anchors){
  a.o.getWorldPosition(p);
  assert.ok(a.o.userData.sameLevel,a.label+' is offered on its own floor only');
  const floor=HOUSE_STOREY_FLOOR[storeyAt(p.y-.6)];
  const near=points.some(q=>Math.abs(q.y-floor)<.3&&Math.hypot(q.i*STEP-p.x,q.j*STEP-p.z)<1.6);
  assert.ok(near,`${a.label} at ${p.toArray().map(v=>v.toFixed(2))} cannot be walked up to`);
 }
 for(const label of ['Check the post','Watch the television','Lie down on the futon','Sit at the low table','Look at the bookshelf','Look at the teaching board','Look at Thuan’s sewing machine','Run a bath','Use the toilet','Take a sauna'])
  assert.ok(h.anchors.some(a=>a.label===label),'no prompt: '+label);
});

test('the mayor’s home keeps what the game and Studio look for by name', ()=>{
 const {room,layout}=build(),names=new Set();room.traverse(o=>{if(o.name)names.add(o.name);});
 for(const n of ['Mayor’s home','Futon','Quilt','Futon Thuan','Zabuton','Television screen','Letter box back','Envelope in the letter box','Toilet','Bath (ofuro)','Wardrobe mirror'])assert.ok(names.has(n),'no '+n);
 let beds=0;room.traverse(o=>{if(o.userData.bed)beds++;});assert.equal(beds,2);
 assert.equal(typeof layout.refreshPost,'function');
 const seats=[];room.traverse(o=>{if(o.userData.seat)seats.push(o.userData.seat);});
 assert.equal(seats.length,4);
 // Each cushion's seat looks at the table and he stands up behind it.
 for(const s of seats){const [x,,z]=s.position,[sx,,sz]=s.stand,fx=-Math.sin(s.yaw),fz=-Math.cos(s.yaw);assert.ok(fx*(x-sx)+fz*(z-sz)>.7,'stands up behind the cushion');}
});

test('the storeys more than one over his feet are put away, and the well shows the floor over it', ()=>{
 const {layout}=build(),g=layout.storeyGroups;
 layout.follow({x:0,y:0,z:3});assert.deepEqual([g.B1.visible,g.G0.visible,g.L1.visible],[true,true,true]);
 layout.follow({x:0,y:2.8,z:3});assert.deepEqual([g.B1.visible,g.G0.visible,g.L1.visible],[true,true,true]);
 layout.follow({x:-2,y:-2.8,z:3});assert.deepEqual([g.B1.visible,g.G0.visible,g.L1.visible],[true,true,false]);
 // The point lights shown at once stay inside the town's budget of eight (render/light-budget.js).
 for(const y of [-2.8,0,2.8]){layout.follow({x:0,y,z:0});let n=0;for(const l of Object.values(g))if(l.visible)l.traverse(o=>{if(o.isPointLight)n++;});assert.ok(n<=8,`${n} lights on at ${y}`);}
 // Every floor of the walk lies on a storey's floor, a landing or a flight.
 for(const f of houseFloors())assert.ok(Array.isArray(f.y)||Object.values(HOUSE_STOREY_FLOOR).some(y=>Math.abs(f.y-y)<.16)||/landing/.test(f.id),f.id+' at '+f.y);
});
