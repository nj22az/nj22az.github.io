import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../vendor/three.module.js';
import {createCharacters,preloadCharacter} from '../src/people/characters.js';
import {installDOM,rigBone} from './fixtures.mjs';
import {createPropFactory} from '../prop-factory.js';
import {buildStaffBench,STAFF_BENCH} from '../src/world/staff-bench.js';
import {createStaffBenchRoutine} from '../src/people/staff-bench-routine.js';

async function setup(run){
 installDOM();const previous={fetch,bitmap:globalThis.createImageBitmap,self:globalThis.self};globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 globalThis.fetch=async input=>String(input).startsWith('blob:')?previous.fetch(input):new Response(await readFile(new URL('../assets/'+new URL(input).pathname.split('/assets/')[1],import.meta.url)));
 try{await preloadCharacter('Thuan');await run();}finally{globalThis.fetch=previous.fetch;globalThis.self=previous.self;globalThis.createImageBitmap=previous.bitmap;}
}
test('the actual Thuan rig rests on the outdoor bench with grounded feet and no body penetration',()=>setup(()=>{
 const room=new T.Group(),clerk=new T.Group();clerk.userData.name='Thuan';room.add(clerk);
 clerk.position.set(STAFF_BENCH.stand[0],0,STAFF_BENCH.stand[1]);
 const built=buildStaffBench({parent:room,factory:createPropFactory({shadows:false})}),solids=[];
 room.updateMatrixWorld(true);built.group.traverse(mesh=>{if(mesh.isMesh){mesh.geometry.computeBoundingBox();solids.push(mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld).expandByScalar(-.012));}});
 const characters=createCharacters(),actor=characters.attach(clerk,'Thuan'),routine=createStaffBenchRoutine({entity:clerk,seat:built.seat}),anchors=new Map();
 // Every visible skinned part: the Meshy rig is one mesh, the MakeHuman one is dressed in several.
 const meshes=[];actor.model.traverse(o=>{if(o.isSkinnedMesh&&o.visible)meshes.push(o);});const p=new T.Vector3();let previous='idle';const phases=new Set();
 for(let frame=0;frame<30*60;frame++){
  routine.update(1/60,frame<20*60);characters.update(1/60);room.updateMatrixWorld(true);const phase=routine.phase;phases.add(phase);
  if(['sit','stand'].includes(phase)){
   if(previous!==phase)anchors.clear();
   for(const name of ['LeftToeBase','RightToeBase']){const foot=rigBone(actor.model,name).getWorldPosition(new T.Vector3());if(!anchors.has(name))anchors.set(name,foot.clone());assert.ok(foot.distanceTo(anchors.get(name))<.009,'Planted feet during '+phase+' frame '+frame+' drift '+foot.distanceTo(anchors.get(name))+' '+foot.toArray()+' anchor '+anchors.get(name).toArray());}
  }
  if(['sit','rest','sleep','wake','stand'].includes(phase)&&frame%12===0){
   let lowest=Infinity;
   for(const mesh of meshes){mesh.skeleton.update();for(let i=0;i<mesh.geometry.attributes.position.count;i++){
    mesh.getVertexPosition(i,p).applyMatrix4(mesh.matrixWorld);lowest=Math.min(lowest,p.y);
    assert.ok(!solids.some(box=>box.containsPoint(p)),`Body penetrates staff bench during ${phase} blend ${clerk.userData.chairBlend} frame ${frame}: ${mesh.name} ${p.toArray()} local ${new T.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,i).toArray()} entity ${clerk.worldToLocal(p.clone()).toArray()} solids ${JSON.stringify(solids.filter(b=>b.containsPoint(p)))}`);
   }}
   assert.ok(lowest>.023&&lowest<.058,`Shoes touch the .04m paving during ${phase}: ${lowest}`);
  }
  previous=phase;
 }
 for(const phase of ['sit','rest','sleep','wake','stand','leave'])assert.ok(phases.has(phase),phase);
}));
