import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../johansson-town/vendor/three.module.js';
import {EQUIPMENT,buildEquipment,setExplode,setCutaway,highlight,triangleCount,procedureState,showProcedureStep,clearProcedure} from '../catalogue.js';
import {FIRING_ORDER,CRANK,pinHeight,throwAngle} from '../models/diesel-engine.js';

const size=model=>{model.group.updateMatrixWorld(true);return new THREE.Box3().setFromObject(model.group).getSize(new THREE.Vector3());};
/** Roughly how big each machine really is, metres along its main axis (X), or for the valve,
 * which is short along the pipe, its height with the lever. */
const LENGTH={'centrifugal-pump':[.6,1.0],'shaft-coupling':[.5,1.0],'switchboard':[2.0,2.4],'butterfly-valve':[.4,.7],'induction-motor':[.6,1.0],'generator':[1.6,2.4],'diesel-engine':[2.2,3.0]};

for(const entry of EQUIPMENT){
 test(`${entry.id}: every part is named and described in Swedish and English`,()=>{
  const m=buildEquipment(THREE,entry.id);
  assert.equal(m.id,entry.id);assert.ok(m.title.sv&&m.title.en&&m.summary.sv&&m.summary.en);
  assert.ok(m.parts.length>=8,'too few parts to teach from');
  assert.equal(new Set(m.parts.map(p=>p.id)).size,m.parts.length,'two parts share an id');
  for(const p of m.parts){
   assert.match(p.id,/^[a-z][a-z-]*$/);
   for(const lang of ['sv','en']){assert.ok(p.name[lang],`${p.id} has no ${lang} name`);assert.ok(p.text[lang].length>30,`${p.id} has no ${lang} text`);}
   assert.ok(p.text.sv!==p.text.en,`${p.id} was not translated`);
   let meshes=0;p.object.traverse(o=>{if(o.isMesh)meshes++;});assert.ok(meshes>0,`${p.id} has nothing to show`);
  }
 });

 test(`${entry.id}: real size, and light enough for an iPad`,()=>{
  const m=buildEquipment(THREE,entry.id),s=size(m),[min,max]=LENGTH[entry.id],span=['butterfly-valve','switchboard'].includes(entry.id)?s.y:s.x;
  assert.ok(span>=min&&span<=max,`${entry.id} measures ${span.toFixed(2)} m`);
  if(entry.id==='butterfly-valve')assert.ok(s.x<.2,'a lug valve is short along the pipe');
  assert.ok(triangleCount(m)<60000,`${triangleCount(m)} triangles`);
 });

 test(`${entry.id}: explodes and goes back together exactly; cutaway and highlight are reversible`,()=>{
  const m=buildEquipment(THREE,entry.id);
  const before=m.parts.map(p=>p.object.position.toArray());
  setExplode(m,1);
  assert.ok(m.parts.some((p,i)=>p.object.position.distanceTo(new THREE.Vector3(...before[i]))>.05),'nothing moved');
  assert.ok(size(m).length()>0);
  setExplode(m,0);
  m.parts.forEach((p,i)=>assert.deepEqual(p.object.position.toArray(),before[i],`${p.id} did not go back`));
  assert.ok(m.parts.some(p=>p.shell),'nothing to cut away');
  const made=new Map(m.parts.flatMap(p=>[...p.materials.values()]).map(mat=>[mat,mat.opacity]));
  setCutaway(m,true);for(const p of m.parts.filter(p=>p.shell))for(const mat of p.materials.values())assert.ok(mat.transparent&&mat.opacity<.5);
  setCutaway(m,false);for(const [mat,opacity] of made)assert.equal(mat.opacity,opacity,'cutaway did not restore a material');
  const target=m.parts[1].id;highlight(m,target);
  for(const p of m.parts)for(const mat of p.materials.values())assert.equal(mat.emissiveIntensity>0,p.id===target);
  highlight(m,null);
 });
}

test('butterfly valve: the disc, stem and lever turn together; the lever lies across the pipe when shut',()=>{
 const v=buildEquipment(THREE,'butterfly-valve'),open=v.controls.find(c=>c.id==='opening');
 const part=id=>v.parts.find(p=>p.id===id).object;
 open.set(0);assert.equal(part('disc').rotation.y,0);
 const grip=part('lever').getObjectByName('Lever grip'),at=()=>{v.group.updateMatrixWorld(true);return grip.getWorldPosition(new THREE.Vector3());};
 let g=at();assert.ok(Math.abs(g.z)>Math.abs(g.x)*5,'closed lever not across the pipe');
 open.set(90);g=at();assert.ok(Math.abs(g.x)>Math.abs(g.z)*5,'open lever not along the pipe');
 for(const id of ['disc','stem','lever'])assert.ok(Math.abs(part(id).rotation.y-Math.PI/2)<1e-9);
 open.set(200);assert.equal(open.value,90);
});

test('induction motor: frame 160 shaft height, the rotor turns when running, the links switch star and delta',()=>{
 const m=buildEquipment(THREE,'induction-motor'),rotor=m.parts.find(p=>p.id==='rotor').object;
 assert.ok(Math.abs(rotor.position.y-.16)<1e-9,'shaft height is not 160 mm');
 m.update(1);assert.equal(rotor.rotation.x,0,'turned while stopped');
 m.controls.find(c=>c.id==='running').set(true);m.update(.5);assert.ok(rotor.rotation.x>0);
 const links=m.parts.find(p=>p.id==='links').object,shown=name=>links.children.filter(o=>o.name===name&&o.visible).length;
 const c=m.controls.find(c=>c.id==='connection');
 c.set('delta');assert.equal(shown('Delta link'),3);assert.equal(shown('Star link'),0);
 c.set('star');assert.equal(shown('Delta link'),0);assert.equal(shown('Star link'),1);
});

test('generator: the exciter and rectifier ride on the rotor; the exciter stator stays put',()=>{
 const g=buildEquipment(THREE,'generator'),rotor=g.parts.find(p=>p.id==='rotor').object;
 for(const id of ['exciter-rotor','rotating-rectifier','field-winding','fan','shaft'])assert.equal(g.parts.find(p=>p.id===id).object.parent,rotor,id);
 assert.notEqual(g.parts.find(p=>p.id==='exciter-stator').object.parent,rotor);
 g.controls.find(c=>c.id==='running').set(true);g.update(.5);assert.ok(rotor.rotation.x>0);
});

test('diesel engine: slider-crank pistons, firing order 1-5-3-6-2-4, camshaft at half speed',()=>{
 const e=buildEquipment(THREE,'diesel-engine'),crank=e.controls.find(c=>c.id==='crank');
 const {radius:r,rod:l}=CRANK,top=r+l,bottom=l-r;
 assert.deepEqual(e.firingOrder,[1,5,3,6,2,4]);
 // Each cylinder reaches top dead centre at its own angle, in the firing order, 120° apart.
 FIRING_ORDER.forEach((cyl,k)=>{
  crank.set(k*120);
  assert.ok(Math.abs(e.pinHeight(cyl)-top)<1e-9,`cylinder ${cyl} is not at TDC at ${k*120}°`);
  assert.ok(Math.abs(pinHeight(cyl,k*120+180)-bottom)<1e-9,`cylinder ${cyl} is not at BDC half a turn later`);
 });
 // Pistons in the same pair (1 and 6, 2 and 5, 3 and 4) move together.
 for(const a of [0,37,200,555])for(const [x,y] of [[1,6],[2,5],[3,4]])assert.ok(Math.abs(pinHeight(x,a)-pinHeight(y,a))<1e-12);
 // Every piston stays between its dead centres, and the stroke is twice the crank radius.
 for(let a=0;a<720;a+=7)for(let i=1;i<=6;i++){const h=pinHeight(i,a);assert.ok(h<=top+1e-12&&h>=bottom-1e-12);}
 assert.equal(throwAngle(5,120),0);
 const cam=e.parts.find(p=>p.id==='camshaft').object,shaft=e.parts.find(p=>p.id==='crankshaft').object;
 crank.set(300);assert.ok(Math.abs(cam.rotation.x*2-shaft.rotation.x)<1e-12,'camshaft not at half speed');
 // A cylinder glows as it fires and not otherwise.
 crank.set(120);const glow=n=>e.group.getObjectByName('Combustion '+n).material.emissiveIntensity;
 assert.ok(glow(5)>1.9);assert.equal(glow(2),0,'cylinder 2 glowed at its exchange TDC');
 e.controls.find(c=>c.id==='running').set(true);const before=crank.value;e.update(1);assert.notEqual(crank.value,before);
});

for(const entry of EQUIPMENT){
 const probe=buildEquipment(THREE,entry.id);
 for(const proc of probe.procedures)test(`${entry.id}: procedure "${proc.id}" names real parts and controls, in Swedish and English, and steps back and forth`,()=>{
  const m=buildEquipment(THREE,entry.id),ids=new Set(m.parts.map(p=>p.id)),controls=new Set(m.controls.map(c=>c.id));
  assert.ok(proc.title.sv&&proc.title.en);assert.ok(proc.steps.length>=4);
  for(const [i,st] of proc.steps.entries()){
   assert.ok(st.sv.length>15&&st.en.length>15&&st.sv!==st.en,`step ${i+1} is not written in both languages`);
   for(const k of ['tool','check'])if(st[k])assert.ok(st[k].sv&&st[k].en,`step ${i+1} ${k} untranslated`);
   for(const id of [...(st.remove||[]),...(st.focus||[]),...Object.keys(st.move||{})])assert.ok(ids.has(id),`step ${i+1} names unknown part ${id}`);
   for(const id of Object.keys(st.set||{}))assert.ok(controls.has(id),`step ${i+1} sets unknown control ${id}`);
  }
  for(const [id] of proc.initial||[])assert.ok(controls.has(id));
  // Every procedure starts from a stopped machine.
  const run=m.controls.find(c=>c.id==='running');if(run)run.set(true);
  showProcedureStep(m,proc.id,0);if(run)assert.equal(run.value,false,'still running during service');
  // A part taken off stays off afterwards, unless a later step is about refitting it.
  for(let i=0;i<proc.steps.length;i++){
   const {removed,focus}=showProcedureStep(m,proc.id,i);
   for(const id of removed){const visible=m.parts.find(p=>p.id===id).object.visible;
    const leaving=(proc.steps[i].remove||[]).includes(id);assert.equal(visible,leaving||focus.includes(id),`step ${i+1}: ${id}`);}
  }
  // Going back gives the same machine as going forward did.
  const forward=proc.steps.map((_,i)=>{showProcedureStep(m,proc.id,i);return JSON.stringify([m.parts.map(p=>[p.object.visible,p.object.position.toArray()]),m.controls.map(c=>c.value)]);});
  for(let i=proc.steps.length-1;i>=0;i--){showProcedureStep(m,proc.id,i);assert.equal(JSON.stringify([m.parts.map(p=>[p.object.visible,p.object.position.toArray()]),m.controls.map(c=>c.value)]),forward[i],`step ${i+1} differs going back`);}
  clearProcedure(m);assert.ok(m.parts.every(p=>p.object.visible));
 });
}

test('kit: a sector is centred on its angle, measured from +Y towards +Z',()=>{
 const g=buildEquipment(THREE,'generator'),rotor=g.parts.find(p=>p.id==='rotor').object;g.group.updateMatrixWorld(true);
 const shoes=rotor.children.filter(o=>o.name==='Pole shoe'),bodies=rotor.children.filter(o=>o.name==='Pole body');
 assert.equal(shoes.length,4);
 shoes.forEach((shoe,i)=>{shoe.geometry.computeBoundingBox();const c=shoe.geometry.boundingBox.getCenter(new THREE.Vector3());
  const b=bodies[i].position;assert.ok(Math.abs(Math.atan2(c.z,c.y)-Math.atan2(b.z,b.y))<.05,'pole shoe is not over its pole');});
});

test('generator: built like a marine brushless set, with exciter, rectifier, PMG, heater and sensors',()=>{
 const g=buildEquipment(THREE,'generator'),ids=g.parts.map(p=>p.id);
 for(const id of ['stator-core','stator-winding','damper-winding','field-winding','exciter-stator','exciter-rotor','rotating-rectifier','pmg-rotor','pmg-stator','avr','space-heater','temperature-sensors','bearing-de','bearing-nde','bearing-cap-de','shims','main-terminals'])assert.ok(ids.includes(id),id);
 const rect=g.parts.find(p=>p.id==='rotating-rectifier').object;assert.equal(rect.children.filter(o=>o.name==='Diode').length,6,'a three-phase bridge has six diodes');
 const core=g.parts.find(p=>p.id==='stator-core').object;assert.equal(core.children.filter(o=>o.name==='Stator tooth').length,48);
 const rotor=g.parts.find(p=>p.id==='rotor').object;
 for(const id of ['pmg-rotor','bearing-de','bearing-nde','coupling-hub'])assert.equal(g.parts.find(p=>p.id===id).object.parent,rotor,id+' should turn with the rotor');
 for(const id of ['pmg-stator','exciter-stator','end-cover-nde'])assert.notEqual(g.parts.find(p=>p.id===id).object.parent,rotor,id+' should stand still');
});

test('pump: the impeller turns when running; a back pull-out leaves the volute on its pipes',()=>{
 const p=buildEquipment(THREE,'centrifugal-pump'),part=id=>p.parts.find(x=>x.id===id).object;
 p.controls.find(c=>c.id==='running').set(true);p.update(.5);assert.ok(part('impeller').rotation.x>0);
 const proc=p.procedures.find(x=>x.id==='seal-change'),pull=proc.steps.findIndex(s=>s.move);
 const volute=part('volute').position.clone(),shaft=part('shaft').position.clone();
 showProcedureStep(p,'seal-change',pull);
 assert.deepEqual(part('volute').position.toArray(),volute.toArray(),'the volute moved');
 assert.ok(part('shaft').position.x>shaft.x+.2,'the rotating unit did not come out');
});

test('coupling: the rim reading is twice the offset, and the misalignment moves the pump side only',()=>{
 const c=buildEquipment(THREE,'shaft-coupling'),off=c.controls.find(x=>x.id==='offset'),hub=id=>c.parts.find(p=>p.id===id).object;
 const at=id=>{c.group.updateMatrixWorld(true);return hub(id).getWorldPosition(new THREE.Vector3());};
 const motor=at('motor-hub'),pump=at('pump-hub');
 off.set(.25);assert.equal(c.rimReading(),.5);
 assert.deepEqual(at('motor-hub').toArray(),motor.toArray());
 assert.ok(Math.abs(at('pump-hub').y-pump.y-.25/1000*c.misalignmentScale)<1e-9);
 showProcedureStep(c,'alignment',0);assert.ok(off.value>0,'the procedure should start misaligned');
 showProcedureStep(c,'alignment',c.procedures[0].steps.length-1);assert.equal(off.value,0);assert.equal(c.controls.find(x=>x.id==='angle').value,0);
});

test('switchboard: a closed breaker cannot be racked; an open one racks out and the shutters drop',()=>{
 const sb=buildEquipment(THREE,'switchboard'),brk=sb.controls.find(c=>c.id==='breaker'),pos=sb.controls.find(c=>c.id==='position');
 const shutters=()=>sb.parts.find(p=>p.id==='cradle').object.children.filter(o=>o.name==='Shutter'&&o.visible).length;
 assert.equal(brk.value,'closed');assert.equal(pos.value,'connected');assert.equal(shutters(),0);
 pos.set('disconnected');assert.equal(pos.value,'connected','racked while closed');assert.ok(pos.note?.sv&&pos.note?.en,'no interlock message');
 brk.set('open');pos.set('disconnected');assert.equal(pos.value,'disconnected');assert.equal(pos.note,null);assert.equal(shutters(),2);
 const carriage=sb.group.getObjectByName('Breaker carriage');assert.ok(carriage.position.z>.15,'the breaker did not come out');
 const steps=sb.procedures[0].steps.length;
 showProcedureStep(sb,'isolate-breaker',steps-1);assert.equal(brk.value,'open');assert.equal(pos.value,'disconnected');
 showProcedureStep(sb,'isolate-breaker',0);assert.equal(brk.value,'closed');assert.equal(pos.value,'connected');
});
