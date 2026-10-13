import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {build} from '../tools/apartment-drawings.mjs';
import {APARTMENTS,GRID,BAY,CORE,FLAT,FLATS,RESIDENTS,ALLOCATION,GROUND,WATER,WATER_PRESSURE,DRAINAGE,JOHKASOU_SIZE,HEATER,ELECTRICAL,ESCAPE,ESCAPE_DISTANCE,flatRect,COLUMNS,COLUMN,WALLS} from '../src/world/minato-apartments.js';
import {ISLAND_HOUSEHOLDS} from '../src/people/island-households.js';

test('the committed drawing set is drawn from the current data (node tools/apartment-drawings.mjs)',()=>{
 for(const [name,body] of Object.entries(build()))assert.equal(readFileSync(new URL('../docs/minato-apartments/'+name,import.meta.url),'utf8'),body,'docs/minato-apartments/'+name+' is stale: run node tools/apartment-drawings.mjs');
});

test('everyone in Minato has a flat, once; Kitano-jima, Fumoto and the ferry’s engineer stay where they are',()=>{
 const minato=ISLAND_HOUSEHOLDS.filter(h=>!h.toLet&&!/^kitano-|^fumoto-/.test(h.home)&&h.home!=='ferry');
 const housed=new Map(RESIDENTS.map(r=>[r.name,r.flat]));
 for(const h of minato)for(const m of h.members)assert.ok(housed.has(m.name),m.name+' ('+h.home+') has no flat');
 const names=RESIDENTS.map(r=>r.name);assert.equal(new Set(names).size,names.length,'someone has two flats');
 const known=new Set(ISLAND_HOUSEHOLDS.flatMap(h=>h.members.map(m=>m.name)));
 for(const n of names)assert.ok(known.has(n)||n==='Barfly',n+' is not an islander');
 for(const h of ISLAND_HOUSEHOLDS.filter(h=>/^kitano-|^fumoto-/.test(h.home)||h.home==='ferry'))for(const m of h.members)if(m.name!=='Thuan')assert.ok(!housed.has(m.name),m.name+' should not move');
 // Pairs connect both ways, on the same floor, next to each other round one shaft.
 for(const a of ALLOCATION.filter(a=>a.pair)){const b=ALLOCATION.find(x=>x.flat===a.pair);assert.equal(b.pair,a.flat);assert.equal(a.flat[0],b.flat[0]);assert.equal(Math.ceil(+a.flat[2]/2),Math.ceil(+b.flat[2]/2),'a pair must share a shaft wall');}
 assert.equal(FLATS.length,36);
});

const inside=(r,w,d)=>r.u0>=-1e-9&&r.u1<=w+1e-9&&r.v0>=-1e-9&&r.v1<=d+1e-9;
const overlap=(a,b)=>a.u0<b.u1-1e-9&&b.u0<a.u1-1e-9&&a.v0<b.v1-1e-9&&b.v0<a.v1-1e-9;
test('the flat’s fittings and furniture fit: inside its walls, clear of each other, the columns and the connecting door',()=>{
 const W=FLAT.width,D=FLAT.depth,cd={u0:0,u1:0.85,v0:FLAT.connectingDoor.v0,v1:FLAT.connectingDoor.v1};
 // The columns' corners stand into the flat on its non-shaft wall, at the corridor and window ends.
 const out=COLUMN/2-WALLS.party/2,colFront={u0:W-out,u1:W,v0:0,v1:COLUMN/2-WALLS.front/2},colBack={u0:W-out,u1:W,v0:D-(COLUMN/2-WALLS.back/2),v1:D};
 for(const type of ['A','B']){
  const items=[FLAT.shaft,...FLAT.fixtures,...FLAT.furniture[type]];
  for(const it of items)assert.ok(inside(it,W,D),type+': '+(it.id||it.label)+' outside the flat');
  for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++)assert.ok(!overlap(items[i],items[j]),type+': '+(items[i].id||'shaft')+' overlaps '+items[j].id);
  for(const it of items){assert.ok(!overlap(it,colFront)&&!overlap(it,colBack),type+': '+(it.id||'shaft')+' hits a column');assert.ok(!overlap(it,cd),type+': '+(it.id||'shaft')+' blocks the connecting door');}
  // A desk and a chair: it is a hotel room.
  assert.ok(FLAT.furniture[type].some(f=>f.id==='desk')&&FLAT.furniture[type].some(f=>f.id==='desk-chair'));
 }
 assert.ok(FLAT.width*FLAT.depth>=22,'smaller than a hotel room');
 // The flat's door opens in the corridor wall, clear of the shaft.
 assert.ok(FLAT.door.u0>=FLAT.shaft.u1);
});

test('the building stands inside its plot, and its rooms tile the ground floor',()=>{
 const o=APARTMENTS.origin,s=APARTMENTS.site,J=DRAINAGE.johkasou;
 for(const [x,z] of [[CORE.x0,0],[GRID.x.D,6*BAY],[J.x1,J.z0],[J.x1,J.z1]]){assert.ok(o.x+x>=s.minX&&o.x+x<=s.maxX&&o.z+z>=s.minZ&&o.z+z<=s.maxZ,`(${o.x+x}, ${o.z+z}) outside the plot`);}
 for(let i=0;i<GROUND.length;i++)for(let j=i+1;j<GROUND.length;j++){const a=GROUND[i],b=GROUND[j];assert.ok(!(a.x0<b.x1-1e-9&&b.x0<a.x1-1e-9&&a.z0<b.z1-1e-9&&b.z0<a.z1-1e-9),a.id+' overlaps '+b.id);}
 // No stack drops through the electrical rooms.
 for(const st of DRAINAGE.stacks)for(const r of GROUND.filter(g=>/transformer|lv-room/.test(g.id)))assert.ok(!(st.x>r.x0&&st.x<r.x1&&st.z>=r.z0&&st.z<=r.z1),st.id+' drops through '+r.id);
});

test('the services carry the building: water, drains, power, escape',()=>{
 assert.ok(WATER.receivingTank.effective>=WATER.daily/2,'tank under half a day');
 const T=WATER.receivingTank,room=GROUND.find(g=>g.id==='pump-room');
 assert.ok(T.x0-(room.x0+WALLS.party/2)>=0.6-1e-9&&T.z0-(room.z0+WALLS.party/2)>=0.6-1e-9&&(room.z1-WALLS.party/2)-T.z1>=0.6-1e-9,'tank without its 0.6 m inspection clearance');
 assert.ok(T.plinth+T.height+1.0<=3.6-0.2,'no metre over the tank');
 assert.ok(WATER_PRESSURE.top>=WATER_PRESSURE.minimum,'7F shower starved: '+WATER_PRESSURE.top);
 assert.ok(WATER_PRESSURE.low<=WATER_PRESSURE.maximum,'2F over-pressured: '+WATER_PRESSURE.low);
 assert.ok(WATER.booster.motor>=WATER_PRESSURE.pumpPower,'pump motor too small');
 for(const st of DRAINAGE.stacks)assert.ok(st.units<=st.limit,st.id+' over its fixture units');
 assert.ok(JOHKASOU_SIZE.chosen>=JOHKASOU_SIZE.persons);
 assert.ok(HEATER.gives>=HEATER.needs,'the night is too short to heat the cylinder');
 const [T1,T2]=ELECTRICAL.transformers;
 assert.ok(T1.kva>=ELECTRICAL.dayOnePhase&&T1.kva>=ELECTRICAL.nightOnePhase,'T1 too small');
 assert.ok(T2.kva>=ELECTRICAL.threePhase,'T2 too small');
 for(const R of ELECTRICAL.risers){assert.ok(R.breaker>=R.amps,R.id+' breaker under its current');assert.ok(R.drop<=210*.02,R.id+' drops over 2 %');}
 assert.ok(ESCAPE_DISTANCE<=ESCAPE.limit);
 // Every flat has two ways out: its door, and its balcony (partitions, and a hatch in every x05 above 2F).
 assert.ok(FLATS.filter(f=>f.hatch).length===5);
});
