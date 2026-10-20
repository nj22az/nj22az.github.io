import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {standingHitsRect,circleHitsRect} from '../physics.js';
import {SAKURA_LAYOUT} from '../src/world/interiors/sakura-layout.js';
import {SAKURA_STAIR,STAIR_NORTH,buildSakuraStoreys,sakuraStoreys,sakuraBoundsAt} from '../src/world/interiors/sakura-stairs.js';
import {RESTROOM} from '../src/world/interiors/sakura-restroom.js';
import {suppliedRoomBoundsBlocked} from '../src/world/supplied-rooms.js';
import {createIndoorCeilings} from '../src/render/indoor-camera.js';
import {buildSakuraShell,SAKURA_SHELL} from '../src/world/interiors/sakura-shell.js';
import {fluorescent} from '../src/render/dusk.js';

test('walk from the stockroom up both flights to the office and down at normal player radius',()=>{
 const room=new THREE.Group(),stairs=buildSakuraStoreys({room,reg(){},action(){},exit(){}}),layout=sakuraStoreys(SAKURA_LAYOUT);
 const colliders=[...SAKURA_LAYOUT.colliders,...stairs.colliders],blocked=(x,y,z)=>suppliedRoomBoundsBlocked(sakuraBoundsAt(SAKURA_LAYOUT,y),x,z,.28)||colliders.some(c=>standingHitsRect(x,z,.28,y,c));
 const H=SAKURA_STAIR.height,route=[[3.8,0,-3.3],[3.8,0,-4.7],[2.95,0,-4.7],[2.95,0,-5.3],[-1.2,0,-5.3],[-1.2,0,-4.6],[-1.8,0,-4.6],[-4.5,H/2,-4.6],[-5.05,H/2,-4.6],[-5.05,H/2,-6.15],[-4.5,H/2,-6.15],[-1.8,H,-6.15],[-1.2,H,-6.15],[-1.2,H,-3.95],[-.8,H,-2.5]];
 let [x,y,z]=route[0];
 for(const target of [...route.slice(1),...route.slice(0,-1).reverse()]){
  const [tx,ty,tz]=target,n=Math.ceil(Math.hypot(tx-x,tz-z)/.025),sx=x,sz=z;
  for(let i=1;i<=n;i++){
   const nx=sx+(tx-sx)*i/n,nz=sz+(tz-sz)*i/n,step=layout.walk.move(x,y,z,nx,nz,.28,blocked);
   assert.ok(step.ok,`blocked at ${[nx,y,nz]} towards ${target}`);x=nx;z=nz;y=step.y;
  }
  assert.ok(Math.abs(y-ty)<.025,`feet at ${y}, expected ${ty}`);
 }
 assert.equal(y,0);
});

test('stair opening provides standing headroom; upper seats retain absolute positions',()=>{
 const room=new THREE.Group();room.add(buildSakuraShell());buildSakuraStoreys({room,reg(){},action(){},exit(){}});
 const ceilings=createIndoorCeilings(room),H=SAKURA_STAIR.height;
 for(const [x,y,z] of [[-3.15,H/4,-4.6],[-5.05,H/2,-5.35],[-3.15,H*.75,-6.15],[-1.2,H,-4.5]])assert.ok(ceilings.heightAt(x,z,y)>y+1.82,`headroom at ${[x,y,z]}`);
 let seat;room.traverse(o=>{if(o.userData.seat)seat=o.userData.seat;});assert.equal(seat.position[1],H);assert.ok(seat.eyeY>H+1);
});

test('office fixtures stay visible at midnight without extra point lights',()=>{
 const room=new THREE.Group();buildSakuraStoreys({room,reg(){},action(){},exit(){}});
 const fixtures=[],points=[];room.traverse(o=>{if(o.name==='Office fluorescent diffuser')fixtures.push(o);if(o.isPointLight)points.push(o);});
 assert.equal(fixtures.length,2);assert.equal(points.length,0);
 // (full in shop hours; the night light over the till after the shutter, never off: the office stays readable at midnight)
 assert.equal(fluorescent(720),1);assert.equal(fluorescent(0),.6);
 for(const minutes of [0,120,720,1380]){assert.ok(fluorescent(minutes)>=.6);for(const o of fixtures){assert.ok(o.visible);assert.equal(o.material.toneMapped,false);}}
});

test('the third-person lens on the stockroom stair stays in the stairwell: never in the toilet, never over the shop ceiling',()=>{
 // The owner, 20 October 2026, on his iPhone: "when I'm in the stairs in the storage room it clips to the toilet". The
 // restroom (sakura-restroom.js RESTROOM) stands against the stair's north side; the partition between them stopped at
 // the shop's ceiling and had no collider west of x -4.57, so the boom went through it. This is the lens's own test
 // (game.js cameraBlocked: the room's ceilings and floors, its bounds at his height, its colliders at the lens's height)
 // and its boom (placeThirdPerson: from his eye, out behind the way he looks, stopped 0.22 m short of what it meets),
 // at points every 0.3 m up both flights and the landing, looking every eighth of a turn, on a phone held upright.
 const room=new THREE.Group();room.add(buildSakuraShell());const stairs=buildSakuraStoreys({room,reg(){},action(){},exit(){}});
 const ceilings=createIndoorCeilings(room),H=SAKURA_STAIR.height,layout=sakuraStoreys(SAKURA_LAYOUT);
 const colliders=[...SAKURA_LAYOUT.colliders,...stairs.colliders];
 const blocked=(x,z,y,r,feet)=>y>ceilings.limit(x,z,feet,Math.max(.22,r))||suppliedRoomBoundsBlocked(sakuraBoundsAt(SAKURA_LAYOUT,feet),x,z,r)
  ||colliders.some(c=>(c.minY||0)<y+.12&&(!Number.isFinite(c.height)||(c.minY||0)+c.height>y-.12)&&circleHitsRect(x,z,r,c));
 const R=RESTROOM,inToilet=(x,y,z)=>x>R.minX&&x<R.maxX&&z>R.minZ&&z<R.maxZ&&y<SAKURA_SHELL.ceiling+.1;
 const points=[];const run=(a,b,n)=>{for(let i=0;i<=n;i++)points.push(a.map((v,k)=>v+(b[k]-v)*i/n));};
 run([-1.8,0,-4.6],[-4.5,H/2,-4.6],9);run([-5.05,H/2,-4.6],[-5.05,H/2,-6.15],5);run([-4.5,H/2,-6.15],[-1.8,H,-6.15],9);
 const bad=[],seen=[],caster=new THREE.Raycaster();room.updateMatrixWorld(true);
 for(const [x,,z] of points){
  const feet=layout.walk.floorAt(x,z,points.find(p=>p[0]===x&&p[2]===z)[1])?.y;
  assert.ok(Number.isFinite(feet),`a floor under ${x},${z}`);
  for(let k=0;k<8;k++){
   const yaw=k*Math.PI/4,pitch=-.1,dir=[-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)];
   const pivot=[x,Math.min(feet+1.6+.18,ceilings.limit(x,z,feet)),z],want=2.2*1.32;
   let reach=want;for(let d=.1;d<=want+.001;d+=.1)if(blocked(pivot[0]-dir[0]*d,pivot[2]-dir[2]*d,pivot[1]-dir[1]*d,.16,feet)){reach=Math.max(0,d-.22);break;}
   // The whole boom, not only where the lens stops: no point of it in the toilet or out over the shop's ceiling.
   for(let d=0;d<=reach+1e-9;d+=.05){const p=[pivot[0]-dir[0]*d,pivot[1]-dir[1]*d,pivot[2]-dir[2]*d];
    if(inToilet(...p)||p[1]<H&&p[2]>STAIR_NORTH.z1+.01)bad.push({at:[x,feet,z].map(v=>+v.toFixed(2)),yaw:+yaw.toFixed(2),lens:p.map(v=>+v.toFixed(2))});}
   // And what the lens sees, across a phone's upright frame (65° high): the stairwell's own walls, never past its north
   // side, below the office floor, into the toilet or the void over the shop's ceiling, and never out into the sky.
   const lens=new THREE.Vector3(pivot[0]-dir[0]*reach,pivot[1]-dir[1]*reach,pivot[2]-dir[2]*reach),half=65/2*Math.PI/180,side=Math.atan(Math.tan(half)*390/844);
   for(let i=0;i<=4;i++)for(let j=0;j<=4;j++){
    const p=pitch+(i/4*2-1)*half,yw=yaw+(j/4*2-1)*side,ray=new THREE.Vector3(-Math.sin(yw)*Math.cos(p),Math.sin(p),-Math.cos(yw)*Math.cos(p));
    caster.set(lens,ray);caster.far=12;const hit=caster.intersectObject(room,true)[0];
    if(!hit||hit.point.y<H-.01&&hit.point.z>STAIR_NORTH.z1+.005&&hit.point.x<-.6)seen.push({at:[x,feet,z].map(v=>+v.toFixed(2)),yaw:+yaw.toFixed(2),sees:hit?hit.point.toArray().map(v=>+v.toFixed(2)):'nothing',from:lens.toArray().map(v=>+v.toFixed(2)),toward:ray.toArray().map(v=>+v.toFixed(2))});
   }
  }
 }
 assert.deepEqual(bad.slice(0,6),[],`${bad.length} lens positions outside the stairwell`);
 assert.deepEqual(seen.slice(0,8).map(s=>JSON.stringify(s)),[],`${seen.length} views out of the stairwell`);
});

test('the stairwell is closed to the restroom side by a wall, for the eye as for the lens',()=>{
 const room=new THREE.Group(),stairs=buildSakuraStoreys({room,reg(){},action(){},exit(){}}),H=SAKURA_STAIR.height;
 const walls=[];room.traverse(o=>{if(o.name==='Sakura stairwell north wall')walls.push(new THREE.Box3().setFromObject(o));});
 assert.equal(walls.length,2);
 // Over the turning landing from the floor, and over both flights from below the shop's ceiling (2.98) to the office floor.
 assert.ok(walls.some(b=>b.min.x<=-5.69&&b.max.x>=-4.6-1e-6&&b.min.y<=1e-6&&b.max.y>=H-1e-6));
 assert.ok(walls.some(b=>b.min.x<=-4.6+1e-6&&b.max.x>=-.6-1e-6&&b.min.y<=SAKURA_SHELL.ceiling&&b.max.y>=H-1e-6));
 for(const b of walls)assert.ok(b.max.z<=-4.03+1e-6&&b.min.z>=-4.1,'on the stair side of the partition (z -4.03), its faces never in the partition’s');
 // And a collider for each, at its own heights.
 for(const b of walls)assert.ok(stairs.colliders.some(c=>Math.abs(c.x-(b.min.x+b.max.x)/2)<1e-6&&Math.abs((c.minY||0)-b.min.y)<1e-6&&Math.abs((c.minY||0)+c.height-b.max.y)<1e-6));
});
