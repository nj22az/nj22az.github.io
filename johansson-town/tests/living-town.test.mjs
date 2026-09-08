import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {PROFILES} from '../src/people/profiles.js';
import {supperGuests,residentPlan,IZAKAYA_SEATS,gossipAt} from '../src/people/social.js';
import {createIzakayaGuests} from '../src/people/izakaya-guests.js';
import {createActivities} from '../activities.js';
import {installDOM} from './fixtures.mjs';

test('all residents have distinct identities, actual friendships and time-bound supper visits',()=>{
 assert.equal(new Set(PROFILES.map(p=>p.model)).size,PROFILES.length);
 for(const p of PROFILES){assert.ok(PROFILES.some(friend=>friend.name===p.friend));assert.ok(p.hello&&p.gossip&&p.clue&&p.look);}
 assert.equal(supperGuests(959).length,0);assert.equal(supperGuests(1439).length,0);
 for(let t=0;t<1440;t+=7){const guests=supperGuests(t);assert.ok(guests.length<=IZAKAYA_SEATS.length);for(const p of guests){assert.ok(t>=p.supperStart&&t<p.supperEnd);assert.equal(residentPlan(p,t).place,'izakaya');}}
 assert.equal(residentPlan(PROFILES.find(p=>p.name==='Nao'),1002).place,'izakaya');
 assert.equal(gossipAt(1110,['Aiko','Emi']).id,'apron');assert.equal(gossipAt(1110,['Aiko']).id,'welcome');
});

test('izakaya borrows existing entities, updates guests and restores interaction ownership without duplicates',()=>{
 const street=new THREE.Group(),scene=new THREE.Group(),world={people:PROFILES.map((profile,i)=>{const g=new THREE.Group();g.userData.name=profile.name;g.userData.hit={inside:false};g.position.set(i,0,i+1);street.add(g);return {g,profile};})};scene.add(street);
 const before=world.people.map(p=>({g:p.g,pos:p.g.position.clone(),hit:p.g.userData.hit}));const guests=createIzakayaGuests({world,parent:scene});
 const names=guests.sync(1135);assert.ok(names.length>1);assert.equal(new Set(world.people.map(p=>p.g.uuid)).size,PROFILES.length);
 for(const name of names){const g=world.people.find(p=>p.g.userData.name===name).g;assert.equal(g.parent,scene);assert.equal(g.userData.hit.inside,true);assert.ok(g.userData.socialPose);}
 guests.sync(1335);guests.restore();guests.restore();assert.equal(guests.names().length,0);
 for(const {g,pos,hit} of before){assert.equal(g.parent,street);assert.ok(g.position.equals(pos));assert.equal(g.userData.hit,hit);assert.equal(hit.inside,false);assert.equal(g.userData.inIzakaya,undefined);}
});

test('supper charges once, advances the evening, saves a memory and refuses insufficient funds',()=>{
 const dom=installDOM();let minutes=1100;const acts=createActivities({say(){},onWeather(){},onCamera(){},onTime:v=>{if(typeof v==='number')minutes+=v;},getMinutes:()=>minutes,getSocialContext:()=>({inside:'izakaya',names:['Aiko','Emi']})});
 acts.action('izakaya-menu');dom.button('Yakitori plate · ¥180');assert.equal(acts.state.yen,1020);assert.equal(minutes,1108);assert.ok(acts.state.notes.includes('Supper at Minato: Yakitori plate.'));
 dom.button('Listen to the table');assert.match(document.querySelector('#activityBody').firstChild.textContent,/cat apron/);
 acts.state.yen=0;acts.action('izakaya-menu');dom.button('Oden supper · ¥260');assert.equal(acts.state.yen,0);assert.equal(minutes,1108);
});

test('all exported Blender residents retain finite grounded poses and a single body draw',async()=>{
 const loader=new GLTFLoader();for(const p of PROFILES){const bytes=await readFile(new URL('../assets/characters/living/'+p.model+'.glb',import.meta.url));const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');const meshes=[];gltf.scene.traverse(o=>{if(o.isMesh)meshes.push(o);});assert.equal(meshes.length,1,p.name);assert.ok(meshes[0].isSkinnedMesh);assert.ok(meshes[0].material.vertexColors);assert.equal(meshes[0].geometry.groups.length,0);
  const mixer=new THREE.AnimationMixer(gltf.scene),point=new THREE.Vector3();let standingTop=0;
  for(const name of ['Idle_Neutral','Walk','Run','Wave','Sit','Eat','Drink']){const clip=gltf.animations.find(c=>c.name===name);assert.ok(clip,p.name+' '+name);mixer.stopAllAction();mixer.clipAction(clip).play();
   for(const fraction of [0,.25,.5,.75]){mixer.setTime(clip.duration*fraction);gltf.scene.updateMatrixWorld(true);for(const mesh of meshes){mesh.skeleton.update();for(let i=0;i<mesh.geometry.attributes.position.count;i+=31){mesh.getVertexPosition(i,point).applyMatrix4(mesh.matrixWorld);assert.ok(point.toArray().every(Number.isFinite));assert.ok(point.length()<3,p.name+' exploded');}}
    const b=new THREE.Box3().setFromObject(gltf.scene,true);assert.ok(b.min.y>-.05,p.name+' below floor '+name);if(name==='Idle_Neutral')standingTop=b.max.y;if(name==='Sit')assert.ok(b.max.y<standingTop-.15,p.name+' must lower onto stool');
   }
  }
 }
});

test('izakaya exports load locally with bounded geometry and at most ten static draws',async()=>{
 for(const kind of ['exterior','interior']){const bytes=await readFile(new URL('../assets/models/izakaya/minato-'+kind+'.glb',import.meta.url));const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');let draws=0;gltf.scene.traverse(o=>{if(o.isMesh){draws++;assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));}});assert.ok(draws<=10);const box=new THREE.Box3().setFromObject(gltf.scene);assert.ok(box.getSize(new THREE.Vector3()).x<=13.1);}
});
