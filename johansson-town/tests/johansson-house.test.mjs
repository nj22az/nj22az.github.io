import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {moduleText} from '../tools/johansson-house-import.mjs';
import {JOHANSSON_HOUSE_CAD as CAD} from '../src/world/johansson-house-cad.js';
import {HOUSE_FLOORS,HOUSE_LEVELS,HOUSE_ROOMS,HOUSE_DOORS,HOUSE_DOOR_HEADS,HOUSE_OPENINGS,HOUSE_WALLS,HOUSE_SLABS,HOUSE_STAIR,HOUSE_FINDINGS,HOUSE_SITE,roomAt} from '../src/world/johansson-house.js';

const overlap=(a0,a1,b0,b1)=>Math.min(a1,b1)-Math.max(a0,b0);

test('the house data is imported from the committed drawings (node tools/johansson-house-import.mjs)',()=>{
 assert.equal(readFileSync(new URL('../src/world/johansson-house-cad.js',import.meta.url),'utf8'),moduleText(),'src/world/johansson-house-cad.js is stale: run node tools/johansson-house-import.mjs');
 assert.equal(CAD.revision,'C - coordinated game geometry');
 assert.deepEqual(CAD.footprint,[12,10]);
});

test('every room is reached from the front door, by its doorways and the stair',()=>{
 const links=new Map(HOUSE_ROOMS.map(r=>[r.id,new Set()]));
 const join=(a,b)=>{links.get(a).add(b);links.get(b).add(a);};
 for(const d of HOUSE_DOORS){assert.ok(links.has(d.rooms[0])&&links.has(d.rooms[1]),d.id);join(...d.rooms);}
 // The flights join the stair bays of the floors they run between.
 for(const f of HOUSE_STAIR.flights)join(f.from.toLowerCase()+'-stair',f.to.toLowerCase()+'-stair');
 const front=HOUSE_OPENINGS.find(o=>o.id==='D-ENTRY');
 assert.equal(front.room,'g0-genkan');
 const seen=new Set([front.room]),queue=[front.room];
 while(queue.length)for(const n of links.get(queue.shift()))if(!seen.has(n)){seen.add(n);queue.push(n);}
 assert.deepEqual(HOUSE_ROOMS.map(r=>r.id).filter(id=>!seen.has(id)),[],'rooms with no way in');
});

test('every room keeps its name from the drawings, and the drawings’ rooms are all built',()=>{
 for(const r of CAD.rooms){
  // A drawn room is built under its own name, or (F1, F5) named in a finding that says where it went.
  const built=HOUSE_ROOMS.some(q=>q.level===r.level&&q.name===r.name);
  const moved=HOUSE_FINDINGS.some(f=>f.drawn.includes(r.name));
  assert.ok(built||moved,`${r.level} ${r.name}`);
 }
 for(const r of HOUSE_ROOMS){const [x0,y0,x1,y1]=r.bounds;assert.ok(x1-x0>=2&&y1-y0>=1.8,`${r.id} is a room`);}
});

test('doorways are at least 0.8 m wide and 2.0 m high, with a head over each',()=>{
 for(const d of HOUSE_DOORS){
  assert.ok(d.to-d.from>=.8-1e-9,`${d.id}: ${d.to-d.from} m`);
  if(d.open)continue;
  const head=HOUSE_DOOR_HEADS.find(h=>h.id===d.id+'-head');
  assert.ok(head,'head over '+d.id);
  assert.equal(Math.round((head.min[2]-HOUSE_FLOORS[d.level].floor)*1000),2000,d.id);
 }
 for(const o of HOUSE_OPENINGS.filter(o=>o.type==='door'))assert.ok(o.to-o.from>=.9&&o.head-o.sill>=2-1e-9,o.id);
});

test('no window or door in an outside wall is crossed by a partition, and each opens into one room',()=>{
 for(const o of HOUSE_OPENINGS){
  assert.ok(o.room,o.id+' opens into a room');
  const along=o.side==='south'||o.side==='north'?0:1,face=o.side==='south'?[0,.2]:o.side==='north'?[9.8,10]:o.side==='west'?[0,.2]:[11.8,12];
  const across=1-along;
  for(const w of HOUSE_WALLS.filter(w=>w.level===o.level&&w.kind==='partition')){
   // A partition meeting this face (within its thickness and a little) between the opening's jambs.
   const meets=w.min[across]<=face[1]+.06&&w.max[across]>=face[0]-.06;
   if(meets)assert.ok(overlap(o.from,o.to,w.min[along],w.max[along])<=1e-6,`${o.id} is crossed by ${w.id}`);
  }
  // The wall is cut there: no exterior wall box of the level fills the opening between its sill and head.
  for(const w of HOUSE_WALLS.filter(w=>w.level===o.level&&w.kind==='exterior')){
   const onFace=w.min[across]>=face[0]-1e-6&&w.max[across]<=face[1]+1e-6;
   if(onFace)assert.ok(overlap(o.from,o.to,w.min[along],w.max[along])<=1e-6||w.max[2]<=o.sill+1e-6||w.min[2]>=o.head-1e-6,`${o.id} is walled up by ${w.id}`);
  }
 }
});

test('the stair: 16 equal risers of 175 mm, treads of 250 mm, flights 1.1 m wide, in the bay north of the hall',()=>{
 const S=HOUSE_STAIR;
 assert.equal(S.risers,CAD.stair.risers);assert.equal(S.riser,CAD.stair.riser);assert.equal(S.tread,CAD.stair.tread);
 assert.ok(S.width>=.75);
 for(const f of S.flights){
  const tops=[f.base,...f.treads.slice(0,7).map(t=>t.z),f.landing.z,...f.treads.slice(7).map(t=>t.z),HOUSE_FLOORS[f.to].floor];
  assert.equal(tops.length,S.risers+1,f.from);
  for(let i=1;i<tops.length;i++)assert.ok(Math.abs(tops[i]-tops[i-1]-S.riser)<1e-6,`${f.from} riser ${i}: ${tops[i]-tops[i-1]}`);
  for(const t of f.treads){
   assert.ok(Math.abs(t.y[1]-t.y[0]-S.tread)<1e-6,'tread depth');
   assert.ok(t.x[0]>=S.shaft[0]-1e-6&&t.x[1]<=S.shaft[2]+1e-6&&t.y[0]>=S.shaft[1]-1e-6&&t.y[1]<=S.shaft[3]+1e-6,'tread in the bay');
  }
  // The flights start and finish at the hall's edge: the floor you step off is the hall.
  assert.equal(f.treads[0].y[0],S.shaft[1]);assert.equal(f.treads.at(-1).y[0],S.shaft[1]);
  assert.ok(f.landing.y[1]-f.landing.y[0]>=S.width,'the landing is as deep as a flight is wide');
 }
});

test('2 m of headroom over every tread and the landings, and a floor under every doorway',()=>{
 const S=HOUSE_STAIR,THICK=.2;
 // Everything overhead: the treads and landings of the flights, the slabs, the walls and door heads.
 const over=[];
 for(const f of S.flights){for(const t of f.treads)over.push({x:t.x,y:t.y,z:t.z-THICK});over.push({x:f.landing.x,y:f.landing.y,z:f.landing.z-THICK});}
 for(const s of HOUSE_SLABS)over.push({x:[s.min[0],s.max[0]],y:[s.min[1],s.max[1]],z:s.min[2]});
 over.push({x:[-1,13],y:[-1,11],z:HOUSE_SITE.roofSlab.z0});
 for(const f of S.flights)for(const t of [...f.treads,f.landing]){
  const cx=(t.x[0]+t.x[1])/2,cy=(t.y[0]+t.y[1])/2;
  for(const [px,py] of [[cx,cy],[t.x[0]+.05,cy],[t.x[1]-.05,cy]]){
   const above=over.filter(o=>o.z>t.z+.01&&px>o.x[0]&&px<o.x[1]&&py>o.y[0]&&py<o.y[1]).map(o=>o.z);
   const clear=Math.min(...above)-t.z;
   assert.ok(clear>=2,`${f.from} tread at ${t.z} (${px.toFixed(2)},${py.toFixed(2)}): ${clear.toFixed(2)} m`);
  }
 }
 // Each hall is a floor right up to the stair, on every level.
 for(const level of HOUSE_LEVELS){
  const F=HOUSE_FLOORS[level].floor,hall=HOUSE_ROOMS.find(r=>r.id===level.toLowerCase()+'-hall').bounds;
  for(const [x,y] of [[(hall[0]+hall[2])/2,(hall[1]+hall[3])/2],[hall[0]+.2,hall[3]-.1],[hall[2]-.2,hall[1]+.1]])
   assert.ok(HOUSE_SLABS.some(s=>s.level===level&&s.max[2]===F&&x>s.min[0]&&x<s.max[0]&&y>s.min[1]&&y<s.max[1]),`${level} hall floor at ${x},${y}`);
 }
 for(const d of HOUSE_DOORS){
  const F=HOUSE_FLOORS[d.level].floor,mid=(d.from+d.to)/2,[x,y]=d.along==='x'?[mid,d.at]:[d.at,mid];
  if(d.open)continue;
  assert.ok(HOUSE_SLABS.some(s=>s.level===d.level&&x>=s.min[0]&&x<=s.max[0]&&y>=s.min[1]&&y<=s.max[1]&&Math.abs(s.max[2]-F)<.2),d.id+' stands on a floor');
 }
});

test('no wall stands in a doorway or on the stair, and every wall reaches the slab over it',()=>{
 for(const d of HOUSE_DOORS.filter(d=>!d.open)){
  const F=HOUSE_FLOORS[d.level].floor;
  for(const w of HOUSE_WALLS.filter(w=>w.level===d.level)){
   const [a0,a1]=d.along==='x'?[w.min[0],w.max[0]]:[w.min[1],w.max[1]],[c0,c1]=d.along==='x'?[w.min[1],w.max[1]]:[w.min[0],w.max[0]];
   const blocks=overlap(a0,a1,d.from+.01,d.to-.01)>0&&c0<=d.at+.01&&c1>=d.at-.01&&w.min[2]<F+2;
   assert.ok(!blocks,`${w.id} in ${d.id}`);
  }
 }
 const S=HOUSE_STAIR;
 for(const f of S.flights)for(const t of [...f.treads,f.landing])for(const w of HOUSE_WALLS){
  if(overlap(t.x[0],t.x[1],w.min[0],w.max[0])<=1e-6||overlap(t.y[0],t.y[1],w.min[1],w.max[1])<=1e-6)continue;
  assert.ok(w.max[2]<=t.z+1e-6||w.min[2]>=t.z+2,`${w.id} stands on ${f.from}'s tread at ${t.z}`);
 }
 for(const w of HOUSE_WALLS.filter(w=>w.kind!=='sill'))assert.ok(Math.abs(w.max[2]-HOUSE_FLOORS[w.level].soffit)<1e-6,`${w.id} stops at ${w.max[2]}`);
});

test('every finding is written out, and the rooms that cite one cite a real one',()=>{
 const ids=HOUSE_FINDINGS.map(f=>f.id);
 for(const f of HOUSE_FINDINGS)for(const k of ['title','drawn','problem','built'])assert.ok(f[k]?.length>8,`${f.id}.${k}`);
 for(const r of HOUSE_ROOMS)for(const [,id] of r.purpose.matchAll(/finding (F\d+)/g))assert.ok(ids.includes(id),r.id+' cites '+id);
 assert.equal(roomAt('G0',6,.5).id,'g0-genkan');assert.equal(roomAt('L1',9,8).id,'l1-linen');
});

test('the house stands on plot kitano-1, facing the gate, its front step a floor of the island', async()=>{
 const {KITANO_HAMLET,KITANO_PORCH,KITANO_HAMLET_FLOORS}=await import('../src/world/kitano-hamlet-layout.js');
 const {houseLocal,HOUSE_PORCH,HOUSE_STAIR_HOUSE}=await import('../src/world/johansson-house-build.js');
 const p=KITANO_HAMLET.plots.find(q=>q.id==='kitano-1'),cx=(p.minX+p.maxX)/2,cz=(p.minZ+p.maxZ)/2;
 // A drawn point to the island: the house's frame, then the plot's (turned half round, the gate on the lane).
 const island=(x,y)=>{const [lx,,lz]=houseLocal(x,y,0);return [cx-lx,cz-(lz+p.front-5)];};
 const corners=[[0,0],[12,10],[HOUSE_STAIR_HOUSE.x[1],HOUSE_STAIR_HOUSE.y[0]],[-1,5]].map(c=>island(...c));
 for(const [u,v] of corners)assert.ok(u>p.minX+.5&&u<p.maxX-.5&&v>p.minZ+.5&&v<p.maxZ-.5,`the house within its walls at ${u},${v}`);
 const [a,b]=[island(HOUSE_PORCH.x[0],HOUSE_PORCH.y[0]),island(HOUSE_PORCH.x[1],HOUSE_PORCH.y[1])];
 assert.deepEqual([Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1])].map(n=>Math.round(n*100)/100),[KITANO_PORCH.minX,KITANO_PORCH.maxX,KITANO_PORCH.minZ,KITANO_PORCH.maxZ]);
 assert.equal(Math.round((KITANO_PORCH.y-KITANO_HAMLET.yardTop)*1000),Math.round((HOUSE_SITE.porch-HOUSE_SITE.grade)*1000));
 assert.equal(KITANO_HAMLET_FLOORS[0].id,'kitano-porch-kitano-1','the step is found before the yard under it');
 // The front door is on the gate's side of the house: the drawings' south face looks at the lane.
 const front=island(6,0),back=island(6,10);
 assert.ok(front[1]<back[1]&&Math.abs(front[0]-cx)<.2);
});
