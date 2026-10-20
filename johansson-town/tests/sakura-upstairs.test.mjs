import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {standingHitsRect} from '../physics.js';
import {SAKURA_LAYOUT} from '../src/world/interiors/sakura-layout.js';
import {SAKURA_STAIR,buildSakuraStoreys,sakuraStoreys,sakuraBoundsAt} from '../src/world/interiors/sakura-stairs.js';
import {SAKURA_UPSTAIRS,sakuraOfficePortals} from '../src/world/interiors/sakura-office-room.js';
import {suppliedRoomBoundsBlocked} from '../src/world/supplied-rooms.js';
import {buildThuanFlat} from '../src/world/thuan-flat.js';
import {createShopStreetView} from '../src/render/shop-street-view.js';
import {createPointWalk,ROOM_STEP} from '../src/input/point-walk.js';

// Sakura's upper floor after the owner's 19 October replan: a small office with two outlooks, a 4½-mat rest room
// behind a sliding door, the hall at the stair head and two closed stores (interiors/sakura-office-room.js).
const H=SAKURA_STAIR.height,OZ=SAKURA_STAIR.officeZ,R=.28,U=SAKURA_UPSTAIRS;
const up=(x,z)=>[x,z+OZ];// office frame → the shop room's frame
function upstairs(){
 const room=new THREE.Group(),prompts=[];
 const stairs=buildSakuraStoreys({room,reg:(o,label)=>prompts.push({o,label}),action(){},exit(){}}),layout=sakuraStoreys(SAKURA_LAYOUT);
 room.updateMatrixWorld(true);
 const colliders=[...SAKURA_LAYOUT.colliders,...stairs.colliders];
 const blocked=(x,y,z)=>suppliedRoomBoundsBlocked(sakuraBoundsAt(SAKURA_LAYOUT,y),x,z,R)||colliders.some(c=>standingHitsRect(x,z,R,y,c));
 return {room,prompts,layout,blocked};
}
/** Every 0.1 m cell of the upper floor a player of normal radius can reach from the stair head. */
function reachable({layout,blocked}){
 const step=.1,key=(i,j)=>i+','+j,seen=new Map(),start=[-1.2,-3.95],queue=[[Math.round(start[0]/step),Math.round(start[1]/step)]];
 seen.set(key(...queue[0]),true);
 while(queue.length){
  const [i,j]=queue.shift();
  for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const ni=i+di,nj=j+dj,k=key(ni,nj);if(seen.has(k))continue;
   if(ni*step<-6.4||ni*step>6.4||nj*step<-6.8||nj*step>3.95)continue;
   const s=layout.walk.move(i*step,H,j*step,ni*step,nj*step,R,blocked);
   if(!s.ok||Math.abs(s.y-H)>.03)continue;
   seen.set(k,true);queue.push([ni,nj]);
  }
 }
 return {has:(x,z)=>seen.has(key(Math.round(x/step),Math.round(z/step))),near:(x,z,r)=>[...seen.keys()].some(k=>{const [i,j]=k.split(',').map(Number);return Math.hypot(i*step-x,j*step-z)<=r;})};
}

test('the upper floor is a small office and a rest room, with the door between them, the hall and two closed stores',()=>{
 const {room}=upstairs(),names=[];room.traverse(o=>names.push(o.name));
 const area=r=>(r.maxX-r.minX)*(r.maxZ-r.minZ);
 assert.ok(area(U.office)<25,'the office is a small shop’s office, not the whole 128 m² floor');
 assert.equal(U.restRoom.mats,4.5);assert.ok(Math.abs(area({...U.restRoom,minX:U.restRoom.minX+.05,maxX:U.restRoom.maxX-.05,minZ:U.restRoom.minZ+.05,maxZ:U.restRoom.maxZ-.06})-2.7*2.74)<.05,'4½ mats, 2.7 × 2.7 m');
 assert.equal(names.filter(n=>n==='Tatami mat').length,5,'four full mats round a half mat');
 for(const n of ['Office desk top','Office safe','Filing cabinet','Wall calendar','Till ledger','Desk telephone','Kitchenette sink','Electric kettle','Office fridge','Ledger shelf'])assert.ok(names.includes(n),'office: '+n);
 for(const n of ['Folded futon','Oshiire middle shelf','Low table top','Six-drawer chest','Cassette radio','Wall clock','Fan guard','Shoji screen','Rest room ceiling boards'])assert.ok(names.includes(n),'rest room: '+n);
 assert.equal(names.filter(n=>n==='Oshiire sliding front').length,2,'the futon cupboard has its two fronts');
 assert.equal(names.filter(n=>n==='Rest room sliding door').length,2,'the sliding pair between office and rest room');
 for(const n of ['Shoe step','Shoe cabinet','Staff lockers','Fire extinguisher','Fire door leaf'])assert.ok(names.includes(n),'hall: '+n);
 for(const jp of ['事務所','休憩室','倉庫','書庫','非常口'])assert.ok(names.some(n=>n.includes(jp)),'sign '+jp);
 assert.ok(!names.some(n=>/bunk|bedroom|double bed/i.test(n)),'a staff rest room, not a bedroom');
 // New Yokosuka's measured pieces, as recorded.
 assert.deepEqual(U.items.find(i=>i.id==='chest').size,[1.1,1.11,.57]);
 assert.equal(+(U.doors.restRoom.to-U.doors.restRoom.from).toFixed(2),1.77);assert.equal(U.doors.restRoom.head,2.1);
 assert.ok(U.items.every(i=>i.why&&i.who),'every item says who it is for and why');
});

test('walk at normal player radius: stair head, office desk, through the sliding door to the futon, and nowhere into the stores',()=>{
 const floor=upstairs(),reach=reachable(floor);
 const chair=U.items.find(i=>i.id==='chair');
 for(const [label,[x,z]] of [['desk stand',up(4.45,2.2)],['kitchenette',up(3.2,1.45)],['town window',up(3.2,4.1)],['harbour window',up(5.6,3.6)],['office door, office side',up(1.1,1.1)],['through the sliding door',up(.75,3.33)],['beside the futon cupboard',up(-1.65,3.95)],['at the low table',up(-.35,3.2)],['by the fire door',up(0,-4.9)]])
  assert.ok(reach.has(x,z),label+' is reachable');
 for(const [label,[x,z]] of [['the decorations store',up(-4.2,0)],['the archive',up(3.5,-2.5)],['inside the futon cupboard',up(-2.5,3.9)],['the stair hole',up(-3.8,-4.4)]])
  assert.ok(!reach.has(x,z),label+' is not walkable');
 // The closed leaf of the pair is solid; only the open half is a doorway.
 assert.ok(!reach.has(.75,up(0,2.4)[1]),'no way through the closed leaf');
 assert.ok(reach.has(...up(chair.at[0]-.7,chair.at[2])),'the chair’s stand point');
});

test('every upstairs prompt is in English and reachable from the floor',()=>{
 const floor=upstairs(),reach=reachable(floor),up4=floor.prompts.filter(p=>p.o.getWorldPosition(new THREE.Vector3()).y>H);
 const labels=up4.map(p=>p.label);
 for(const l of ['Sit at the harbour desk','Read the till ledger','Make office tea','Look over Main Street','Look over the harbour','Lie down for a minute','Look in the decorations store','Look in the archive','Look at the shoe cabinet','Look at the fire door'])assert.ok(labels.includes(l),l);
 for(const p of up4){
  assert.match(p.label,/^[A-Za-z’' ]+$/,'English prompt: '+p.label);
  const w=p.o.getWorldPosition(new THREE.Vector3());
  assert.ok(reach.near(w.x,w.z,1.3),p.label+' has a reachable standing place within reach');
  assert.ok(w.y-H<1.6,p.label+' is within reach height');
 }
});

test('exactly two windows look out, and both draw the town in the same frame',()=>{
 const portals=sakuraOfficePortals();assert.deepEqual(portals.map(p=>p.id),['town','harbour']);
 const {town:T,harbour:S}=U.windows;
 assert.ok(T.x0>=U.office.minX&&T.x1<=U.office.maxX&&S.z0>=U.office.minZ&&S.z1<=U.office.maxZ,'both windows are the office’s');
 // The shell's mullions frame each window (thuan-flat.js: every 1.6 m along the front, 1.425 m along the side).
 for(const x of [T.x0,T.x1])assert.ok(Math.abs(((x+6.4)/1.6)-Math.round((x+6.4)/1.6))<1e-9);
 // The renderer: from the middle of the office, looking into the corner between the windows, one street pass per window.
 const store=new THREE.Group(),town=new THREE.Group(),sites=[];store.position.set(-7.45,0,-27.3);store.rotation.y=Math.PI/2;town.add(store);
 const {site}=buildThuanFlat(store,{sites,shopDoor:[-5.5,0,-27.3]});town.updateMatrixWorld(true);
 const frontage={portals:site.officePortals.map(p=>({...p,interiorOrigin:[p.interiorOrigin[0],H,p.interiorOrigin[2]+OZ]}))};
 const scene=new THREE.Scene(),room=new THREE.Group();scene.add(town,room);
 const camera=new THREE.PerspectiveCamera(70,1.6,.05,500);
 camera.position.set(3,H+1.6,2+OZ);camera.lookAt(6.4,H+1.4,4.55+OZ);camera.updateMatrixWorld(true);
 const passes=[];const renderer={autoClear:true,clippingPlanes:[],shadowMap:{enabled:true},clearDepth(){},render(s,c){if(town.visible)passes.push({planes:this.clippingPlanes.map(p=>p.normal.toArray().map(n=>+n.toFixed(3))),clear:this.autoClear,background:s.background});}};
 const view=createShopStreetView();view.render({renderer,scene,camera,town,room,frontage});
 assert.equal(passes.length,2,'both windows are drawn: the town and the harbour');
 assert.equal(passes[0].clear,true);assert.equal(passes[1].clear,false,'the second window adds to the first, it does not wipe it');
 assert.notDeepEqual(passes[0].planes[0],passes[1].planes[0],'each pass is clipped to its own window');
 // Looking only at the town window, one pass.
 passes.length=0;camera.position.set(3.2,H+1.6,2+OZ);camera.lookAt(3.2,H+1.4,10);camera.updateMatrixWorld(true);view.render({renderer,scene,camera,town,room,frontage});
 assert.equal(passes.length,1);
});

/**
 * The player's own step (game.js stepFeet and collides): each frame's move is tried along x and along z on its own, each
 * through the storeys' walk (house-walk.js move: a floor within a step, room for the body over it) and the room's solids
 * at the floor he would stand on, the room's bounds read at the height of his feet (sakuraBoundsAt, as game.js passes
 * player.position.y). Returns where he ends up.
 */
function walkAs(player,{layout,colliders},route,{speed=3,dt=1/60}={}){
 const bounded=(x,z,r,y)=>suppliedRoomBoundsBlocked(sakuraBoundsAt(SAKURA_LAYOUT,player.y),x,z,r)||colliders.some(c=>standingHitsRect(x,z,r,y,c));
 const collides=(x,z)=>{const step=layout.walk.move(player.x,player.y,player.z,x,z,R,(bx,by,bz)=>bounded(bx,bz,.05,by));return !step.ok||bounded(x,z,R,step.y);};
 for(const [tx,tz] of route){
  for(let n=0;n<4000&&Math.hypot(tx-player.x,tz-player.z)>.02;n++){
   const d=Math.hypot(tx-player.x,tz-player.z),k=Math.min(1,speed*dt/d),nx=player.x+(tx-player.x)*k,nz=player.z+(tz-player.z)*k;
   const sx=collides(nx,player.z),sz=collides(player.x,nz);
   if(sx&&sz)break;
   if(!sx)player.x=nx;if(!sz)player.z=nz;
   player.y=layout.walk.floorBelow(player.x,player.z,player.y)?.y??player.y;
  }
 }
 return player;
}

test('walk in as the player does: the shop floor, the stockroom, up both flights, the hall, the office door, the desk, the rest room',()=>{
 // The owner, 20 October 2026, on his iPhone: "I can't seem to get into the office in the Sakura".
 const floor=upstairs(),stairs={layout:floor.layout,colliders:[...SAKURA_LAYOUT.colliders,...buildSakuraStoreys({room:new THREE.Group(),reg(){},action(){},exit(){}}).colliders]};
 const player={x:SAKURA_LAYOUT.spawn[0],y:0,z:SAKURA_LAYOUT.spawn[2]};
 const legs=[
  ['to the stockroom passage',[[0,2.4],[4.2,2.4],[4.2,-3.3],[3.8,-3.3],[3.8,-4.7],[2.95,-4.7],[2.95,-5.3],[-1.2,-5.3],[-1.2,-4.6],[-1.8,-4.6]],0],
  ['up both flights to the stair head',[[-4.5,-4.6],[-5.05,-4.6],[-5.05,-6.15],[-4.5,-6.15],[-1.8,-6.15],[-1.2,-6.15],[-1.2,-3.95]],H],
  ['along the hall to the office door',[up(-.5,-2),up(-.5,1.1),up(.4,1.1)],H],
  ['through it to the desk',[up(1.4,1.1),up(2.5,1.6),up(U.items.find(i=>i.id==='chair').at[0]-.7,2.2)],H],
  ['through the sliding door to the rest room',[up(1.6,3.3),up(.2,3.3),up(-.35,3.6)],H],
 ];
 for(const [label,route,y] of legs){
  walkAs(player,stairs,route);const [ex,ez]=route.at(-1);
  assert.ok(Math.hypot(player.x-ex,player.z-ez)<.03&&Math.abs(player.y-y)<.03,`${label}: stopped at ${[player.x,player.y,player.z].map(v=>v.toFixed(2))}`);
 }
});

test('tap to walk upstairs plans its way through the office door and the rest room door, on this floor only',()=>{
 // A tap is planned on the room's grid (input/point-walk.js), as game.js plans it indoors: ROOM_STEP, the player's radius,
 // what stands at his height, and only floor within a step of his feet. On the town's 0.35 m grid there was no point in
 // the 0.25 m the office door leaves him beside its open leaf, and the tap said "There is no clear path from here".
 const floor=upstairs(),stair={layout:floor.layout,colliders:[...SAKURA_LAYOUT.colliders,...buildSakuraStoreys({room:new THREE.Group(),reg(){},action(){},exit(){}}).colliders]};
 const blockedAt=(x,z,r)=>suppliedRoomBoundsBlocked(sakuraBoundsAt(SAKURA_LAYOUT,H),x,z,r)||stair.colliders.some(c=>standingHitsRect(x,z,r,H,c))||!floor.layout.walk.floorAt(x,z,H);
 const coarse=createPointWalk({blocked:blockedAt,heightAt:()=>0,radius:R});
 const fine=createPointWalk({blocked:blockedAt,heightAt:()=>0,radius:R,step:space=>space?ROOM_STEP:.35});
 const head={x:-1.2,z:-3.95},desk={x:4.45,z:2.2+OZ},futon={x:-.35,z:3.6+OZ},room='market';
 assert.equal(coarse.walk(head,desk),false,'the town grid finds no way through the office door (the bug)');
 for(const [label,to] of [['the desk',desk],['the rest room',futon]]){
  assert.ok(fine.walk(head,to,{space:room}),'a planned way from the stair head to '+label);
  // Follow it as the game does (pointWalk.direction each frame) with the player's own step.
  const player={x:head.x,y:H,z:head.z};
  for(let i=0;i<3000&&fine.active;i++){const d=fine.direction(player,1/60,room);if(!d)break;walkAs(player,stair,[[player.x+d.x*.05,player.z+d.z*.05]]);}
  assert.ok(Math.hypot(player.x-to.x,player.z-to.z)<.35&&Math.abs(player.y-H)<.03,`arrived by ${label}: ${[player.x,player.z].map(v=>v.toFixed(2))}`);
 }
});
