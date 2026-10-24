import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {standingHitsRect} from '../physics.js';

/**
 * Sakura's inside stair is a passage into darkness, not a flight anyone walks (the owner, 20 October 2026, on his iPhone:
 * "I don't want the stairs to be traversable it's too much errors when running up the stairs, I want the stairs to lead up
 * to a black hole and we disappear into there and when it loads we come up on the upper floor"). The shop and the office
 * storey are two rooms; sakura-stairs.js draws each end and says where the passage starts, goes and arrives; game.js
 * (takeSakuraStair) walks him into the dark, fades, and opens the other room.
 */
installDOM();globalThis.self=globalThis;
const {SAKURA_STAIR_PASSAGE:P,onSakuraStairFoot,onSakuraStairHead,buildSakuraStairFoot}=await import('../src/world/interiors/sakura-stairs.js');
const {SAKURA_LAYOUT}=await import('../src/world/interiors/sakura-layout.js');
const {suppliedRoomBoundsBlocked}=await import('../src/world/supplied-rooms.js');
const {buildSakuraInterior}=await import('../src/world/interiors/sakura-interior.js');
const {buildSakuraOfficeRoom}=await import('../src/world/interiors/sakura-office-room.js');
const R=.28,GAME=readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
const inBox=([x,y,z],[x0,x1,z0,z1,y0,y1],pad=0)=>x>=x0-pad&&x<=x1+pad&&z>=z0-pad&&z<=z1+pad&&y>=y0-pad&&y<=y1+pad;

/** The shop as the game builds it (the market room), with its stair foot, its prompts and its colliders. */
async function shop(){
 const room=new THREE.Group(),prompts=[];let stair=null;
 const d=buildSakuraInterior({room,reg:(o,label,fn)=>prompts.push({o,label,fn}),action(){},exit(){},stair:dir=>{stair=dir;}});await d.ready();
 room.updateMatrixWorld(true);
 const colliders=[...d.layout.colliders];
 const blocked=(x,z)=>suppliedRoomBoundsBlocked(SAKURA_LAYOUT,x,z,R)||colliders.some(c=>standingHitsRect(x,z,R,0,c));
 return {room,prompts,colliders,blocked,taken:()=>stair};
}
/** The office storey as its own room, as game.js builds it (roomShell), unmerged so every piece keeps its name. */
function office(){
 const room=new THREE.Group(),prompts=[],colliders=[];
 const layout=buildSakuraOfficeRoom({room,reg:(o,label,fn)=>prompts.push({o,label,fn}),action(){},collider:(x,z,w,d,height=2.8,minY=0)=>colliders.push({x,z,w,d,height,minY}),downstairs(){},evacuate(){},merge:false});
 room.updateMatrixWorld(true);
 const b=layout.bounds,blocked=(x,z)=>x-R<b.minX||x+R>b.maxX||z-R<b.minZ||z+R>b.maxZ||colliders.some(c=>standingHitsRect(x,z,R,0,c));
 return {room,prompts,colliders,blocked,layout};
}
/** Every 0.05 m cell reachable at a normal player's radius from a start, on the room's one floor. */
function reach(blocked,[sx,sz],box){
 const s=.05,key=(i,j)=>i+','+j,seen=new Set([key(Math.round(sx/s),Math.round(sz/s))]),q=[[Math.round(sx/s),Math.round(sz/s)]];
 while(q.length){const [i,j]=q.pop();for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+di,nj=j+dj,k=key(ni,nj),x=ni*s,z=nj*s;
  if(seen.has(k)||x<box.minX||x>box.maxX||z<box.minZ||z>box.maxZ||blocked(x,z))continue;seen.add(k);q.push([ni,nj]);}}
 return {has:(x,z)=>seen.has(key(Math.round(x/s),Math.round(z/s))),cells:()=>[...seen].map(k=>k.split(',').map(v=>v*s))};
}
/** The first thing a ray from `from` meets in the room: what the eye, or the lens behind him, sees that way. */
const caster=new THREE.Raycaster();
function sees(room,from,yaw,pitch){
 caster.set(new THREE.Vector3(...from),new THREE.Vector3(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)));caster.far=30;
 return caster.intersectObject(room,true).find(h=>h.object.visible!==false&&h.object.isMesh)||null;
}
const dark=h=>!!h?.object.material?.userData?.darkness;

test('the passage, as data: where each end starts, where he goes into the dark, and where he comes out',()=>{
 for(const [end,on,dark] of [['foot',onSakuraStairFoot,P.foot.dark],['head',onSakuraStairHead,P.head.dark]]){
  const E=P[end],last=E.walk.at(-1);
  // He walks into the dark: at the end of the walk his body is in it.
  assert.ok(dark.some(b=>inBox([last[0]-R,Math.max(last[1],b[4]+.1),last[2]],b)),`${end}: the walk ends with him in the dark`);
  // He arrives a step off the stair at the other end, so he does not go straight back.
  const other=end==='foot'?P.head:P.foot,at=other.arrive.at,onOther=end==='foot'?onSakuraStairHead:onSakuraStairFoot;
  assert.ok(!onOther({x:at[0],y:at[1],z:at[2]}),`arriving by the ${end==='foot'?'head':'foot'}, he is not on the stair`);
  assert.ok(on({x:(E.trigger.x[0]+E.trigger.x[1])/2,y:0,z:(E.trigger.z[0]+E.trigger.z[1])/2}));
 }
 assert.ok(P.seconds>=.8&&P.seconds<=1.6&&P.fade<P.seconds,'a few steps, the picture black before the room changes');
 // Facing: at the foot, into the stockroom (east, +x); at the head, up the hall (+z). game.js: forward = (-sin yaw, -cos yaw).
 const fwd=yaw=>[-Math.sin(yaw),-Math.cos(yaw)];
 assert.ok(fwd(P.foot.arrive.yaw)[0]>.99);assert.ok(fwd(P.head.arrive.yaw)[1]>.99);
 assert.match(P.why,/20 October 2026/);
});

test('the shop: five treads up from the stockroom into a black that is solid, the stair walkable only onto its first treads',async()=>{
 const {room,prompts,blocked,colliders,taken}=await shop(),names=[];room.traverse(o=>names.push(o.name));
 assert.equal(names.filter(n=>n==='Sakura lower stair tread').length,P.foot.treads);
 assert.equal(names.filter(n=>n==='Sakura upper stair tread').length,0,'no upper flight in the shop');
 assert.ok(!names.some(n=>/landing lens|stair landing|top landing/i.test(n)),'no walked landing');
 const black=[];room.traverse(o=>{if(o.isMesh&&o.material?.userData?.darkness)black.push(o);});
 assert.equal(black.length,P.foot.dark.length);
 for(const o of black){assert.ok(o.material.isMeshBasicMaterial,'unlit: never shaded by the cel pass');assert.equal(o.material.color.getHex(),0x000000);}
 // The prompt takes the passage up.
 const go=prompts.find(p=>p.label==='Go upstairs');assert.ok(go,'a Go upstairs prompt');go.fn();assert.equal(taken(),'up');
 // From the stockroom he walks to the stair's foot and onto its first tread, never into the dark.
 const r=reach(blocked,[-.2,-5.6],{minX:-6,maxX:1,minZ:-6.9,maxZ:-4});
 assert.ok(r.has(...[P.foot.arrive.at[0],P.foot.arrive.at[2]]),'the foot, where he arrives coming down, is reachable');
 assert.ok(r.cells().some(([x,z])=>onSakuraStairFoot({x,y:0,z})),'he can step onto the stair');
 const into=(x,z,b)=>Math.hypot(x-Math.max(b[0],Math.min(x,b[1])),z-Math.max(b[2],Math.min(z,b[3])))<R-.02;
 for(const [x,z] of r.cells())assert.ok(!P.foot.dark.some(b=>b[4]<1&&into(x,z,b)),`walked into the dark at ${x.toFixed(2)},${z.toFixed(2)}`);
 assert.ok(colliders.filter(c=>c.minY>=0).length>0);
});

test('from the stockroom the stair goes into darkness: no sky, no stairwell beyond, nothing that could flicker',async()=>{
 // The eye and the lens behind him, from the stockroom floor and the foot of the stair, every way up and along the stair.
 const {room}=await shop(),bad=[];
 for(const x of [-1.6,-1.1,-.5,.2])for(const z of [-6.2,-5.5,-4.6])for(const y of [1.6,2.3]){
  for(let k=-6;k<=6;k++)for(const pitch of [-.25,0,.3,.6,.9,1.2]){
   const yaw=Math.PI/2+k*.15,h=sees(room,[x,y,z],yaw,pitch);
   if(!h){bad.push(`sky from ${x},${y},${z} yaw ${yaw.toFixed(2)} pitch ${pitch}`);continue;}
   const p=h.point,beyond=p.x<-2.94&&p.z<-4.08||p.y>3.0&&p.x<-.62&&p.z<-4.08;
   if(beyond&&!dark(h))bad.push(`${h.object.name} at ${p.toArray().map(v=>v.toFixed(2))} from ${x},${y},${z}`);
  }
 }
 assert.deepEqual(bad.slice(0,8),[],`${bad.length} views past the dark`);
});

test('the office: the stair head goes down four treads into the dark, a rail and a solid pit, and nobody walks out over it',()=>{
 const {room,prompts,blocked,layout}=office(),names=[];room.traverse(o=>names.push(o.name));
 assert.equal(names.filter(n=>n==='Sakura upper stair tread').length,P.head.treads);
 assert.ok(names.includes('Stair rail'));
 assert.deepEqual(layout.spawn,[...P.head.arrive.at]);assert.equal(layout.yaw,P.head.arrive.yaw);
 assert.ok(prompts.some(p=>p.label==='Go downstairs'));
 const r=reach(blocked,[P.head.arrive.at[0],P.head.arrive.at[2]],{minX:-6.4,maxX:6.4,minZ:-6.2,maxZ:4.5});
 assert.ok(r.has(P.head.arrive.at[0],P.head.arrive.at[2]),'he arrives on the floor, clear of everything');
 assert.ok(r.cells().some(([x,z])=>onSakuraStairHead({x,y:0,z})),'he can step onto the stair head');
 for(const [x,z] of r.cells())assert.ok(!P.head.dark.slice(0,2).some(b=>x>b[0]&&x<b[1]&&z>b[2]&&z<b[3]),`over the pit at ${x.toFixed(2)},${z.toFixed(2)}`);
 // From the hall and the stair head, below the floor are only the stair's first treads and black.
 const bad=[];
 for(const [x,z] of [[-1.2,-4.15],[-.8,-3.4],[-1.2,-2.6],[-2.3,-5.5],[0,-5.2]])for(let k=0;k<16;k++)for(const pitch of [-1.2,-.8,-.5,-.25]){
  const h=sees(room,[x,1.6,z],k*Math.PI/8,pitch);
  if(!h){bad.push(`nothing from ${x},${z}`);continue;}
  if(h.point.y<-.035&&!dark(h)&&h.object.name!=='Sakura upper stair tread')bad.push(`${h.object.name} at ${h.point.toArray().map(v=>v.toFixed(2))}`);
 }
 assert.deepEqual(bad.slice(0,8),[],`${bad.length} views into the pit that are not dark`);
});

test('game.js runs the passage and walks no flight: the fade, the other room, the arrival; the old stair code is gone',()=>{
 for(const s of ['function takeSakuraStair','function stepStairPassage','if(stairPassage.switching){playerSpeed=0;return;}','function finishStairPassage','function checkSakuraStair',"veil.classList.add('on')",'enterRoom(up?SAKURA_OFFICE_SITE','{at:[...end.at],yaw:end.yaw}','if(stairPassage)stepStairPassage(dt);else{updatePlayer(dt);checkSakuraStair();}'])
  assert.ok(GAME.includes(s),s);
 for(const s of ['placeLandingLens','stairLens','sakuraBoundsAt','STAIR_LENS_EASE','storeys:','officeEntry'])assert.ok(!GAME.includes(s),'gone: '+s);
 // In the office, the exit button is the way down, not a door to the street.
 assert.match(GAME,/#exitRoomButton'\)\.onclick=\(\)=>\{if\(current\?\.id==='sakura-office'\)\{takeSakuraStair\('down'\)/);
});
