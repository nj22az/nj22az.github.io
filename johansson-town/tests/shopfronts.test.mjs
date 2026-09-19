import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';
import {WEST_SHOPS,westShopDoor,WEST_FRONT} from '../src/world/west-shops.js';

async function peninsula(){
 installDOM();globalThis.self=globalThis;
 configureTownMode(TOWN_MODES.PENINSULA);
 const {createTown}=await import('../src/world/town.js?shopfronts');
 const {createBusinesses}=await import('../src/world/businesses.js');
 const scene=new THREE.Scene(),entrances=[];
 const sites=createBusinesses();
 const world=createTown({scene,sites,townMode:'peninsula',mobile:false,shadows:false,
  register(object,label){if(/^Enter /.test(label)){const p=object.getWorldPosition(new THREE.Vector3());entrances.push({label,x:p.x,z:p.z});}},
  enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
 scene.updateMatrixWorld(true);
 return {scene,world,sites,entrances};
}

test('every door opens onto a building',async()=>{
 const {scene,entrances}=await peninsula();
 // What counts as a building: something with walls, standing on the ground.
 const walls=[];
 scene.traverse(o=>{
  if(!o.isMesh||!o.geometry?.attributes?.position)return;
  if(!(o.layers.mask&1))return;for(let p=o;p;p=p.parent)if(!p.visible)return;
  const box=new THREE.Box3().setFromObject(o),size=box.getSize(new THREE.Vector3());
  if(!Number.isFinite(size.x+size.y+size.z))return;
  if(size.y>2.4&&box.min.y<1&&Math.max(size.x,size.z)>2&&size.x<40&&size.z<40)walls.push(box);
 });
 assert.ok(walls.length>6,'Found no buildings to check the doors against');
 assert.ok(entrances.length>4,'Found no entrances');
 // Kenji & Tetsuo Repairs offered a way in at 0.4,-6.7 -- out on the boardwalk beside a
 // lamp post, because that is where the night-market alley put its door and the
 // peninsula does not build that alley. A door has to be in a wall.
 const adrift=entrances.filter(e=>!walls.some(w=>
  e.x>w.min.x-3&&e.x<w.max.x+3&&e.z>w.min.z-3&&e.z<w.max.z+3))
  .map(e=>e.label+' at '+e.x.toFixed(1)+','+e.z.toFixed(1));
 assert.deepEqual(adrift,[],'Doors standing in the open air:\n  '+adrift.join('\n  '));
});

test('the shop staff stand at their own shop',async()=>{
 configureTownMode(TOWN_MODES.PENINSULA);
 const {RESIDENTS}=await import('../src/people/residents.js?shopfronts');
 for(const [name,id] of [['Aya','frontrow'],['Reiko','frontrow'],['Kenji','form3d'],['Tetsuo','form3d']]){
  const work=RESIDENTS.find(p=>p.name===name)?.work,door=westShopDoor(id);
  assert.ok(work,name+' has nowhere to work');
  assert.ok(Math.hypot(work[0]-door[0],work[1]-door[1])<.6,name+' works at '+JSON.stringify(work)+', not at '+JSON.stringify(door));
 }
});

test('the west shops leave the pavement and the crossing alone',async()=>{
 const {routeAt}=await import('../src/world/layout.js?shopfronts');
 configureTownMode(TOWN_MODES.PENINSULA);
 for(const [id,plot] of Object.entries(WEST_SHOPS)){
  // The doorstep is standable, and so is the pavement past the shop either way.
  const door=westShopDoor(id);
  assert.ok(routeAt(door[0],door[1],.32),id+' has a doorstep you cannot stand on');
  for(const dz of [-plot.width/2-1.2,plot.width/2+1.2])
   assert.ok(routeAt(door[0],plot.z+dz,.32),id+' blocks the pavement at its '+(dz<0?'south':'north')+' end');
  // And the building is behind the frontage line, not out in the street.
  assert.ok(WEST_FRONT<=-7.6,'The shop frontage has moved onto the carriageway');
 }
 // The crossing at z 5.1 still reaches the west kerb between the two shops.
 assert.ok(routeAt(-7.4,5.1,.32),'The shop crossing no longer reaches the west pavement');
});
