import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {buildOnsenInterior} from '../src/world/interiors/onsen.js';
import {ONSEN_CIRCUITS,ONSEN_SPARE_WAYS,ONSEN_FIX,ONSEN_WIRING,ONSEN_RACEWAY,ONSEN_SCENARIOS,stageScenario,assess,advance,settle,
 circuitOf,isFitted,isOn,isWorking,trip,boardWiring} from '../src/world/interiors/onsen-electrics.js';
import {circleHitsRect} from '../physics.js';

const build=()=>{const room=new THREE.Group(),hits=[],actions=[];const layout=buildOnsenInterior({room,reg:(o,label,fn)=>hits.push({o,label,fn}),action:(...a)=>actions.push(a),exit(){}});room.updateMatrixWorld(true);return {room,hits,actions,layout};};
const BUSY=['dryer-1','dryer-2','dryer-3','massage-chair'];
const meshes=room=>{const list=[];room.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh)list.push(o);});return list;};
const visibleInWorld=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
const ticks=(layout,seconds,step=1/30)=>{for(let t=0;t<seconds;t+=step)layout.tick(step,20*60);};

test('as built, the board has two spare ways (予備) at the end of the lower row, blank behind covers',()=>{
 stageScenario('rest');const {room,hits,actions,layout}=build();
 assert.deepEqual(ONSEN_SPARE_WAYS.map(w=>w.way),[7,8]);
 assert.equal(assess().circuits.length,6,'six circuits wired');
 for(const w of ONSEN_SPARE_WAYS){
  assert.equal(isFitted(w.id),false);assert.throws(()=>trip(w.id),/spare/);
  const cover=room.getObjectByName(w.cover);assert.ok(cover&&visibleInWorld(cover),w.cover+' shows');
  assert.equal(visibleInWorld(room.getObjectByName('New breaker '+w.id)),false,'no breaker in way '+w.way+' yet');
 }
 // The covers sit in the lower row, beside the pump's breaker, level with it.
 const at=name=>new THREE.Box3().setFromObject(room.getObjectByName(name)).getCenter(new THREE.Vector3());
 const pump=at('Breaker pump'),fridge=at('Breaker fridge');
 for(const w of ONSEN_SPARE_WAYS){const c=at(w.cover);assert.ok(Math.abs(c.y-pump.y)<.002,'lower row');}
 // Facing the board (it faces +x, so you look -x and your left is +z), the ways count from your left: fridge, pump, then the spares.
 const along=v=>-v.z;assert.ok(along(fridge)<along(pump)&&along(pump)<along(at(ONSEN_SPARE_WAYS[0].cover))&&along(at(ONSEN_SPARE_WAYS[0].cover))<along(at(ONSEN_SPARE_WAYS[1].cover)));
 for(const t of meshes(room).filter(m=>/^Tape label/.test(m.name)))assert.equal(visibleInWorld(t),false,'no tape before the fix');
 hits.find(h=>h.label==='Look at the breaker board').fn();assert.match(actions.at(-1)[2],/two spare ways \(予備\)/);
 layout.dispose();
});

test('the fix: two new 20 A breakers, each mirror on its own circuit, and everything on at once holds',()=>{
 // The rewired board loses and duplicates nothing.
 const ids=c=>c.flatMap(x=>x.loads.map(l=>l.id)).sort();
 assert.deepEqual(ids(ONSEN_WIRING.rewired),ids(ONSEN_WIRING['as-built']));
 for(const c of ONSEN_WIRING.rewired)assert.ok(c.loads.reduce((s,l)=>s+l.watts,0)/c.volts<=c.amps,c.id+' within its rating with everything on');
 let a=stageScenario('fixed');
 assert.equal(boardWiring().wiring,'rewired');assert.equal(boardWiring().taped,true);
 assert.equal(a.circuits.length,8);
 const mirrors=['dryer-1','dryer-2','dryer-3'].map(circuitOf);assert.equal(new Set(mirrors).size,3,'each mirror on a circuit of its own: '+mirrors);
 assert.equal(circuitOf('massage-chair'),'changing-sockets','the chair keeps its 1994 spur off the left mirror');
 for(const c of a.circuits){assert.ok(c.live,c.id+' live');assert.ok(c.amps<=c.rating,`${c.id}: ${c.amps} A on ${c.rating}`);}
 assert.equal(a.circuits.find(c=>c.id==='changing-sockets').amps,14);
 for(const f of ONSEN_FIX.circuits)assert.equal(a.circuits.find(c=>c.id===f.id).amps,12);
 assert.equal(Math.round(a.main.amps),47);assert.ok(!a.main.over);
 assert.deepEqual(settle(),[]);assert.deepEqual(advance(7200),[],'two hours of the evening rush and no click');
 for(const id of BUSY)assert.equal(isWorking(id),true,id);
 for(const f of ONSEN_FIX.circuits){
  assert.match(f.tape.jp,/^[\p{Script=Han}\p{Script=Katakana}ー ]+$/u,'the tape is written in Japanese');assert.ok(f.tape.en.length>5,'with a small English line');
  assert.equal(f.amps,20);assert.ok(f.why.length>30);
 }
 assert.ok(ONSEN_FIX.tape.why.length>30&&ONSEN_FIX.route.length>30,'the fix says where the cable goes and why the labels');
 assert.ok(ONSEN_SCENARIOS.fixed.panels.includes('7c')&&ONSEN_SCENARIOS.fitting.panels.includes('7b'));
 // In the room: covers out, new breakers in with their levers up, tape on, the inspect text knows.
 const {room,hits,actions,layout}=build();
 for(const w of ONSEN_SPARE_WAYS){
  assert.equal(visibleInWorld(room.getObjectByName(w.cover)),false);
  assert.ok(visibleInWorld(room.getObjectByName('New breaker '+w.id)));
  assert.ok(room.getObjectByName('Breaker lever '+w.id).rotation.x<Math.PI/2,'lever up');
  assert.ok(visibleInWorld(room.getObjectByName('Tape label '+w.id)));
 }
 assert.ok(visibleInWorld(room.getObjectByName('Tape label circuit list')),'ways 7 and 8 written in on the circuit list too');
 hits.find(h=>h.label==='Look at the breaker board').fn();assert.match(actions.at(-1)[2],/eight 20 A breakers/);assert.match(actions.at(-1)[2],/masking tape/);
 hits.find(h=>h.label==='Use a hair dryer').fn();assert.match(actions.at(-1)[2],/circuit of its own/);
 ticks(layout,3);for(const id of BUSY)assert.equal(isWorking(id),true,id+' still running after the room has ticked');
 layout.dispose();
 // 7b: isolated while he fits them: main off, the new levers down, no tape yet.
 stageScenario('fitting');const b=build();
 assert.equal(isOn('main'),false);
 for(const f of ONSEN_FIX.circuits){assert.ok(visibleInWorld(b.room.getObjectByName('New breaker '+f.id)));assert.ok(b.room.getObjectByName('Breaker lever '+f.id).rotation.x>Math.PI/2,'lever down while fitting');
  assert.equal(visibleInWorld(b.room.getObjectByName('Tape label '+f.id)),false,'not labelled yet');}
 b.layout.dispose();
 // Back to the story's start: as built again.
 stageScenario('rest');assert.equal(boardWiring().wiring,'as-built');assert.equal(circuitOf('dryer-2'),'changing-sockets');assert.equal(isFitted('vanity-2'),false);
});

test('the 1994 raceway runs from the women\'s left mirror, through the partition and over both noren to the chair, flat on the walls',()=>{
 stageScenario('rest');const {room,layout}=build();
 const R=ONSEN_RACEWAY;
 assert.equal(R.year,1994,'inside the town\'s years (1985–1999)');assert.equal(R.circuit,circuitOf('massage-chair'));assert.ok(R.why.length>60&&R.period.length>40);
 assert.equal(ONSEN_CIRCUITS[0].loads.find(l=>l.id==='massage-chair').raceway,R.name);
 assert.ok(room.getObjectByName(R.from)&&room.getObjectByName(R.to),'both ends are real sockets');
 const group=room.getObjectByName(R.name);assert.ok(group);
 const pieces=meshes(group);assert.ok(pieces.length>10,'runs, elbows, corners and caps');
 // One continuous line: each run starts where the last ended (through the wall at the end cap).
 for(let i=1;i<R.runs.length;i++){const a=R.runs[i-1].path.at(-1),b=R.runs[i].path[0];const gap=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);assert.ok(gap<.15,'run '+i+' joins the last: '+gap.toFixed(3));}
 // It starts at the left mirror's socket and ends on top of the socket box.
 const box=b=>new THREE.Box3().setFromObject(b),start=box(room.getObjectByName(R.from)),end=box(room.getObjectByName('Massage chair socket box'));
 assert.ok(Math.abs(R.runs[0].path[0][0]-start.min.x)<.002,'leaves the side of the left mirror’s socket');
 assert.ok(Math.abs(R.runs.at(-1).path.at(-1)[1]-end.max.y)<.002,'arrives on top of the socket box');
 // Over both noren: along the bandai wall from the west wall to the partition, end caps either side of the hole he
 // drilled through it, and on along the men's side; where it crosses the doorways it is above the rods and the header.
 const women=R.runs.find(r=>r.side==='women'&&r.end==='wall'),men=R.runs.find(r=>r.side==='men'&&r.start==='wall');
 assert.ok(women&&men,'one run each side of the partition');
 assert.ok(Math.abs(women.path.at(-1)[0]+.05)<.002&&Math.abs(men.path[0][0]-.05)<.002,'through the partition (x ±0.05)');
 for(const r of [women,men])assert.ok(r.path.every(p=>Math.abs(p[2]-1.6)<.08),'on the bandai wall');
 const rods=meshes(room).filter(m=>m.name==='Noren rod').map(box);assert.equal(rods.length,2,'two noren, two rods');
 for(const p of pieces)for(const rod of rods){const b=box(p);if(b.max.x>rod.min.x&&b.min.x<rod.max.x&&b.max.z>1.45&&b.min.z<1.75)assert.ok(b.min.y>rod.max.y,'the raceway crosses over the noren rods');}
 for(const n of meshes(room).filter(m=>m.name==='Noren'))assert.ok(rods.some(rod=>box(n).max.y<rod.max.y+.001));
 const shrink=b=>b.clone().expandByScalar(-.0008);
 const own=new Set(pieces);
 const allowed=o=>own.has(o)||/^(Umi-no-yu wall|Umi-no-yu floor|Rock bath paving|Umi-no-yu sea view)$/.test(o.name)||o.name===R.from+' plate'||o.parent?.name===R.to;
 for(const p of pieces){
  const b=box(p);assert.ok(b.min.y>.85,p.name+' is up on the wall, not at a foot or a towel');
  for(const o of meshes(room)){if(allowed(o))continue;const ob=box(o);if(ob.isEmpty())continue;
   assert.ok(!shrink(b).intersectsBox(ob),`${p.name} at ${b.getCenter(new THREE.Vector3()).toArray().map(v=>v.toFixed(2))} clips ${o.name||o.type}`);}
 }
 // Under the ceiling beams, and its back on a wall face: never floating, never inside the plaster.
 for(const beam of meshes(room).filter(m=>m.name==='Ceiling beam'))for(const p of pieces)assert.ok(!box(p).intersectsBox(box(beam)));
 const walls=meshes(room).filter(m=>m.name==='Umi-no-yu wall').map(box);
 for(const p of pieces.filter(m=>m.name==='Raceway run')){const b=box(p),touch=walls.some(w=>w.clone().expandByScalar(.0005).intersectsBox(b)),inside=walls.some(w=>shrink(w).intersectsBox(shrink(b)));
  assert.ok(touch,'a run sits on a wall');assert.ok(!inside,'a run is not inside a wall');}
 // The socket box by the chair is out of reach of a walking body (the cooler and the chair fence it).
 const blocked=(x,z,r)=>layout.colliders.some(c=>circleHitsRect(x,z,r,c));
 assert.ok(blocked(4.62,2.9,.25),'nobody stands in the gap between the cooler and the chair');
 layout.dispose();
});

test('dryers and the chair look on when they run and dead when they do not, and the same moment always looks the same',()=>{
 const src=readFileSync(new URL('../src/world/interiors/onsen-electrics.js',import.meta.url),'utf8');
 assert.ok(!/Math\.random/.test(src),'nothing random in the electrics');
 const sample=()=>{stageScenario('rush');const {room,layout}=build();ticks(layout,2);
  const out={layout,room,look:Object.fromEntries(BUSY.map(id=>[id,layout.power.appearance(id)])),
   yaw:[1,2,3].map(i=>room.getObjectByName('Hair dryer '+i).rotation.y),rollers:meshes(room).filter(m=>m.name==='Massage chair roller').map(m=>m.position.toArray())};return out;};
 const first=sample();
 for(const id of ['dryer-1','dryer-2','dryer-3']){const l=first.look[id];assert.ok(l.working&&l.lamp&&l.air,id+' lamp lit and air blowing: '+JSON.stringify(l));}
 assert.ok(first.look['massage-chair'].lamp&&first.look['massage-chair'].moving,'the chair’s lamp is lit and it kneads');
 assert.equal(first.rollers.length,2);
 // Resting on the counter while it hums: never below the vanity top.
 for(let i=1;i<=3;i++){const b=new THREE.Box3().setFromObject(first.room.getObjectByName('Hair dryer '+i));assert.ok(b.min.y>.81-.0005,'dryer '+i+' on the counter: '+b.min.y.toFixed(4));}
 // The rollers travel gently: within the backrest, a few centimetres a frame at most.
 const before=first.rollers;ticks(first.layout,1/30,1/30);const after=meshes(first.room).filter(m=>m.name==='Massage chair roller').map(m=>m.position.toArray());
 const step=Math.max(...before.map((p,i)=>Math.hypot(p[0]-after[i][0],p[1]-after[i][1],p[2]-after[i][2])));assert.ok(step>0&&step<.02,'roller step '+step.toFixed(4));
 const back=new THREE.Box3().setFromObject(first.room.getObjectByName('Massage chair back'));
 for(const p of after)assert.ok(p[1]>back.min.y+.1&&p[1]<back.max.y-.1&&p[2]>back.min.z&&p[2]<back.max.z,'roller inside the backrest’s face');
 first.layout.dispose();
 const second=sample();
 assert.deepEqual(second.yaw,first.yaw,'the same hum at the same moment');assert.deepEqual(second.rollers,first.rollers);
 // The click: lamps out at once, the air fades out within a second, the chair stops where it is.
 stageScenario('busy');
 for(const id of BUSY){const l=second.layout.power.appearance(id);assert.equal(l.working,false);assert.equal(l.lamp,false,id+' lamp dark at once');}
 ticks(second.layout,1.2);
 for(const id of ['dryer-1','dryer-2','dryer-3']){assert.equal(second.layout.power.appearance(id).air,false,id+' no air');assert.equal(second.room.getObjectByName('Hair dryer '+id.at(-1)).rotation.y,0,'still');}
 const stopped=meshes(second.room).filter(m=>m.name==='Massage chair roller').map(m=>m.position.toArray());ticks(second.layout,1);
 assert.deepEqual(meshes(second.room).filter(m=>m.name==='Massage chair roller').map(m=>m.position.toArray()),stopped,'mid-knead, and it stays there');
 assert.equal(second.layout.power.appearance('massage-chair').moving,false);
 // After the fix, everything runs at once and keeps running.
 stageScenario('fixed');ticks(second.layout,2);
 for(const id of BUSY){const l=second.layout.power.appearance(id);assert.ok(l.working&&l.lamp,id+' on after the fix');}
 assert.ok(second.layout.power.appearance('massage-chair').moving);
 second.layout.dispose();stageScenario('rest');
});
