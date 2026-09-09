import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FULL_TOWN,CITY_SECTIONS,STREET_DOORS,FULL_PATHS,doorApproach,fullContains,fullHeight} from '../src/world/full-town-state.js';
import {parkHeight} from '../src/world/park-layout.js';
import {circleHitsRect} from '../physics.js';
import {drawTownMap} from '../src/world/map.js';

const navigation=JSON.parse(await readFile(new URL('../assets/models/full-town/navigation.json',import.meta.url)));
const clearance=JSON.parse(await readFile(new URL('../assets/models/full-town/street-clearance.json',import.meta.url)));
FULL_TOWN.grid=navigation.grid;
FULL_TOWN.active=true;
FULL_TOWN.colliders=CITY_SECTIONS.flatMap(section=>navigation.colliders.filter((_,i)=>!clearance.removedColliders.includes(i)).map(c=>({...c,x:c.x+section.x,z:c.z+section.z})));
const blocked=(x,z,r=.32)=>!fullContains(x,z,r,parkHeight)||FULL_TOWN.colliders.some(c=>circleHitsRect(x,z,r,c));

function reachable(sx,sz,tx,tz){
 const step=.5,key=(x,z)=>x+','+z,start=[Math.round(sx/step)*step,Math.round(sz/step)*step];
 const q=[start],seen=new Set([key(...start)]);
 if(blocked(...start))return false;
 for(let n=0;n<20000&&q.length;n++){
  const [x,z]=q.shift();
  if(Math.hypot(x-tx,z-tz)<.7)return true;
  for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){
   const nx=x+dx,nz=z+dz,k=key(nx,nz);
   if(seen.has(k)||blocked(nx,nz))continue;
   seen.add(k);q.push([nx,nz]);
  }
 }
 return false;
}

test('Canal stays water while the bank boardwalks are walkable on the peninsula',()=>{
 assert.equal(fullContains(0,-6,.32,parkHeight),false);
 assert.equal(fullContains(44,-6,.32,parkHeight),false);
 assert.equal(blocked(2.35,6),false,'East canal quay');
 assert.equal(blocked(46.35,6),true,'No cloned east-quarter canal');
 assert.equal(blocked(-2.5,-6),false,'West south quay');
 assert.equal(blocked(0,0),false,'Bridge remains a walking street');
 assert.ok(Math.abs(fullHeight(2.35,6,parkHeight))<.05,'Quay stays at street height');
 assert.ok(FULL_PATHS.some(p=>p.id==='canal-west-n-canal-quarter'&&p.surface==='wood'));
 assert.ok(FULL_PATHS.some(p=>p.id==='coast-west'&&p.surface==='wood'));
});

test('Every original doorway has a footpath from the walking street',()=>{
 assert.equal(STREET_DOORS.length,15);
 for(const door of STREET_DOORS){
  const [x,z]=doorApproach(door);
  assert.equal(blocked(x,z),false,'Approach clear: '+door.id);
  assert.ok(reachable(-5,-1,x,z),'Walk from spawn to '+door.id);
 }
});

test('Peninsula is a compact rectangle with a south-east park cell and no back docks',()=>{
 assert.equal(FULL_PATHS.some(p=>/pier|apron|port-walk|causeway/.test(p.id)),false);
 assert.ok(FULL_PATHS.some(p=>p.id==='park-south'));
 assert.equal(blocked(14.2,-17.5),false,'Park lawn is walkable');
 assert.equal(blocked(14.2,-13),false,'Park meets the south boardwalk');
 assert.ok(reachable(-5,-1,14.2,-16.4),'Walk from spawn onto the park');
 assert.equal(blocked(-5,-22),true,'Harbour apron is gone');
 assert.equal(blocked(-5,-28),true,'Outer pier is gone');
 assert.equal(blocked(21,-23.4),true,'Old park causeway is gone');
});

test('Visitor map treats empty ground as water and draws one unique city',()=>{
 const ground=[],water=[],ctx=new Proxy({fillStyle:'',fillRect(x,y,w,h){
  if(this.fillStyle==='#a8997a')ground.push([x,y,w,h]);
  if(this.fillStyle==='#7ea3a8')water.push([x,y,w,h]);
 }},{get:(o,key)=>key in o?o[key]:(()=>{})});
 drawTownMap(ctx,680,640);
 const count=navigation.grid.heights.filter(h=>h!==null).length;
 assert.equal(ground.length,count);
 assert.ok(water.length>=1,'Harbour and canal water are the map base');
 FULL_TOWN.active=false;
});
