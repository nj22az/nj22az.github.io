import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {circleHitsRect} from '../physics.js';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';

async function town(){
 installDOM();globalThis.self=globalThis;
 configureTownMode(TOWN_MODES.PENINSULA);
 const {createTown}=await import('../src/world/town.js?okinawa');
 const {createBusinesses}=await import('../src/world/businesses.js');
 const labels=[],actions=[];
 const world=createTown({scene:new THREE.Scene(),sites:createBusinesses().filter(s=>['market','frontrow'].includes(s.id)),townMode:'peninsula',
  mobile:false,shadows:false,register:(o,label,fn)=>labels.push({label,fn,o}),enter(){},onAction:(...a)=>actions.push(a),getPlayerPosition:()=>new THREE.Vector3()});
 return {world,labels,actions};
}

test('the bare ground west of the yard is a quarter you can walk into, through the lanes',async()=>{
 const {world}=await town();
 const {routeAt}=await import('../src/world/layout.js');
 const {NISHI}=await import('../src/world/okinawa/layout.js');
 const {WEST_YARD}=await import('../src/world/west-yard.js');
 const open=(x,z)=>!!routeAt(x,z,.32)&&!world.colliders.some(c=>circleHitsRect(x,z,.32,c));
 // Each lane crosses the yard wall: open ground on both sides of it and in the gap.
 for(const lane of NISHI.lanes)for(const x of [WEST_YARD.minX-2,WEST_YARD.minX-.25,WEST_YARD.minX+1.5])
  assert.ok(open(x,lane.z),`Lane at z=${lane.z} is blocked at x=${x}`);
 // Between the lanes the wall still stands.
 assert.ok(!open(WEST_YARD.minX-.25,(NISHI.lanes[0].z+NISHI.lanes[1].z)/2),'The yard wall has gone');
 // The seawall walk runs the length of the quarter.
 for(let z=NISHI.quay.maxZ+2;z<NISHI.maxZ-1;z+=3)assert.ok(open(-37.6,z)||open(-37.2,z),'The seawall walk is blocked at z='+z);
 // and there is no seawall to walk through or off.
 assert.ok(!routeAt(-40.2,0,.32),'You can walk off the seawall into the sea');
});

test('Main Street has buildings on both kerbs, and the shops do things',async()=>{
 const {world,labels,actions}=await town();
 const {EAST_ROW,YARD_ROW}=await import('../src/world/okinawa/layout.js');
 const {MAIN_ROAD}=await import('../src/world/main-road.js');
 // A shop-house stands on every plot of both rows.
 for(const plot of [...EAST_ROW.plots.map(p=>({...p,x:(EAST_ROW.minX+EAST_ROW.maxX)/2})),...YARD_ROW.plots.map(p=>({...p,x:(YARD_ROW.minX+YARD_ROW.maxX)/2}))])
  assert.ok(world.colliders.some(c=>c.id==='shop-house'&&circleHitsRect(plot.x,(plot.minZ+plot.maxZ)/2,.2,c)),'No building on '+plot.id);
 // None of them stands on the pavements.
 for(const c of world.colliders.filter(c=>c.id==='shop-house'))
  assert.ok(c.x-c.w/2>=MAIN_ROAD.pavementEast-.01||c.x+c.w/2<=MAIN_ROAD.pavementWest+.01,'A shop-house is on the pavement at '+c.x);
 const zenzai=labels.find(l=>l.label==='Buy a zenzai');
 assert.ok(zenzai,'Nakamura’s sells no zenzai');
 zenzai.fn();
 assert.deepEqual(actions.at(-1).slice(0,1),['buy']);
 assert.equal(actions.at(-1)[2].item,'Zenzai');
 for(const label of ['Pray at the utaki','Inspect the auction shed','Inspect the ice plant','Fish from the seawall','Read the Higa nameplate',
  'Look at the ice-cream mural','Browse the ¥100 cart','Read the tide board','Look at the goya trellis','Watch the gateball','Read the Kamiya nameplate'])
  assert.ok(labels.some(l=>l.label===label),'Nothing to '+label);
});

test('the new streets are batched into a handful of meshes and light up at night',async()=>{
 const {world}=await town();
 const q=world.quarters;
 const merged=q.meshes.filter(m=>!/sign|nameplate|fascia|upright|flag|poster|prices/.test(m.name));
 assert.ok(merged.length<80,'The quarters are '+merged.length+' draw calls');
 let triangles=0;for(const m of q.meshes)triangles+=m.geometry.attributes.position.count/3;
 assert.ok(triangles<120000,'The quarters are '+Math.round(triangles)+' triangles');
 world.updateHours(13*60);
 const day=q.materials.glow.emissiveIntensity;
 world.updateHours(21*60);
 assert.ok(q.materials.glow.emissiveIntensity>day+.3,'The windows do not light up after dark');
});

test('Thuan has something to say about the island sweets',async()=>{
 const {giftReaction}=await import('../src/people/thuan-gifts.js');
 const {itemIcon}=await import('../src/ui/icons.js');
 for(const item of ['Zenzai','Sata andagi','Awamori miniature']){
  const reply=giftReaction(item);
  assert.ok(/[。！？…]|\n/.test(reply.text)&&!/Nobody brings the shopkeeper/.test(reply.text),'Thuan has no reply for '+item);
 }
 assert.equal(itemIcon('Zenzai'),'ice');assert.equal(itemIcon('Sata andagi'),'food');assert.equal(itemIcon('Awamori miniature'),'cup');
});

test('the neighbours can be walked up to, and the walkers keep to the ground',async()=>{
 const {world}=await town();
 const {routeAt}=await import('../src/world/layout.js');
 const {NEIGHBOURS,routePoint,neighbourAwake}=await import('../src/people/neighbours.js');
 const open=(x,z)=>!!routeAt(x,z,.32)&&!world.colliders.some(c=>circleHitsRect(x,z,.32,c));
 for(const n of NEIGHBOURS){
  assert.ok(n.lines.length>0&&n.hours.length>0,n.name+' has nothing to say or no hours');
  if(n.walk){
   const total=routePoint(n.route,0).total;
   for(let d=0;d<total;d+=.5){const p=routePoint(n.route,d);assert.ok(open(p.x,p.z),`${n.name} walks through something at ${p.x.toFixed(1)},${p.z.toFixed(1)}`);}
  }else{
   // Somewhere within talking distance where the player can stand.
   let near=false;
   for(let a=0;a<Math.PI*2&&!near;a+=Math.PI/12)for(const r of [1,1.5,2,2.5,3])if(open(n.at[0]+Math.cos(a)*r,n.at[1]+Math.sin(a)*r)){near=true;break;}
   assert.ok(near,'Nobody can get near enough to talk to '+n.name);
  }
 }
 assert.equal(new Set(NEIGHBOURS.map(n=>n.name)).size,NEIGHBOURS.length,'Two neighbours share a name');
 const higa=NEIGHBOURS.find(n=>n.name==='Grandmother Higa');
 assert.ok(neighbourAwake(higa,9*60)&&!neighbourAwake(higa,23*60),'Grandmother Higa keeps the wrong hours');
});

test('Sakura’s shutter is up while she is open and comes down at eight',async()=>{
 const {world}=await town();
 const shutter=world.quarters.shutter;
 for(let i=0;i<400;i++)shutter.update(21*60,1/30);
 assert.equal(shutter.open,0,'The shutter is up after closing');
 for(let i=0;i<400;i++)shutter.update(10*60,1/30);
 assert.equal(shutter.open,1,'The shutter is down in shop hours');
});
