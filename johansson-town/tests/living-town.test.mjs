import {createIndoorResidents} from '../src/people/indoor-residents.js';
import {RESIDENTS} from '../src/people/residents.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {PROFILES} from '../src/people/profiles.js';
import {supperGuests,residentPlan,IZAKAYA_SEATS,gossipAt,yuriVisitsIzakaya,inTimeRange,izakayaOpen,IZAKAYA_DOOR} from '../src/people/social.js';
import {createIzakayaGuests} from '../src/people/izakaya-guests.js';
import {createActivities} from '../activities.js';
import {installDOM} from './fixtures.mjs';

test('all residents have distinct identities, actual friendships and time-bound supper visits',()=>{
 assert.equal(new Set(PROFILES.map(p=>p.model)).size,PROFILES.length);
 for(const p of PROFILES){assert.ok(PROFILES.some(friend=>friend.name===p.friend));assert.ok(p.hello&&p.gossip&&p.clue&&p.look);}
 assert.equal(supperGuests(959).length,0);assert.ok(supperGuests(1439).length>0);assert.equal(supperGuests(180).length,0);
 for(let t=0;t<1440;t+=7){const guests=supperGuests(t);assert.ok(guests.length<=IZAKAYA_SEATS.length);for(const p of guests){assert.ok(inTimeRange(t,p.supperStart,p.supperEnd));assert.equal(residentPlan(p,t).place,'izakaya');}}
 assert.equal(residentPlan(PROFILES.find(p=>p.name==='Nao'),1002).place,'izakaya');
 assert.equal(gossipAt(1110,['Aiko','Emi']).id,'apron');assert.equal(gossipAt(1110,['Aiko']).id,'welcome');
});

test('izakaya borrows existing entities, updates guests and restores interaction ownership without duplicates',()=>{
 const street=new THREE.Group(),scene=new THREE.Group(),world={people:PROFILES.map((profile,i)=>{const g=new THREE.Group();g.userData.name=profile.name;g.userData.hit={inside:false};g.position.set(i,0,i+1);street.add(g);return {g,profile};})};scene.add(street);
 const before=world.people.map(p=>({g:p.g,pos:p.g.position.clone(),hit:p.g.userData.hit}));const guests=createIzakayaGuests({world,parent:scene});
 const names=guests.sync(1135);assert.ok(names.length>1);assert.equal(new Set(world.people.map(p=>p.g.uuid)).size,PROFILES.length);
 for(const name of names){const g=world.people.find(p=>p.g.userData.name===name).g;assert.equal(g.parent,scene);assert.equal(g.userData.hit.inside,true);assert.ok(g.userData.socialPose);}
 const laterNames=guests.sync(1335);guests.restore();guests.restore();assert.equal(guests.names().length,0);
 for(const {g,pos,hit} of before){assert.equal(g.parent,street);assert.ok(g.position.equals([...names,...laterNames].includes(g.userData.name)?new THREE.Vector3(...[IZAKAYA_DOOR[0],0,IZAKAYA_DOOR[1]]):pos),g.userData.name+' '+g.position.toArray()+' expected '+pos.toArray());assert.equal(g.userData.hit,hit);assert.equal(hit.inside,false);assert.equal(g.userData.inIzakaya,undefined);}
});

test('supper charges once, advances the evening, saves a memory and refuses insufficient funds',()=>{
 const dom=installDOM();let minutes=1100;const acts=createActivities({say(){},onWeather(){},onTime:v=>{if(typeof v==='number')minutes+=v;},getMinutes:()=>minutes,getSocialContext:()=>({inside:'izakaya',names:['Aiko','Emi']})});
 acts.action('izakaya-menu');dom.button('Yakitori plate · ¥180');assert.equal(acts.state.yen,1020);assert.equal(minutes,1108);assert.ok(acts.state.notes.includes('Supper at Minato: Yakitori plate.'));
 dom.button('Listen to the table');assert.match(document.querySelector('#activityBody').firstChild.textContent,/cat apron/);
 acts.state.yen=0;acts.action('izakaya-menu');dom.button('Oden supper · ¥260');assert.equal(acts.state.yen,0);assert.equal(minutes,1108);
});

test('Yuri visits after closing on alternate days and has off-duty conversation',()=>{
 for(const m of [0,1199,1200,1219,1290,1439,1440+1230])assert.equal(yuriVisitsIzakaya(m),false);
 for(const m of [1220,1230,1289,2880+1230])assert.equal(yuriVisitsIzakaya(m),true);
 const dom=installDOM();const acts=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>1230,getSocialContext:()=>({inside:'izakaya',names:['Yuri','Nao']})});
 acts.action('resident','Yuri');assert.equal(document.querySelector('#activityTitle').textContent,'Yuri · After hours');
 assert.match(document.querySelector('#activityBody').firstChild.textContent,/all locked up/);
 dom.button('What is your favourite snack?');assert.match(document.querySelector('#activityBody').firstChild.textContent,/Nao saved me/);
 assert.ok(acts.state.notes.includes('Caught up with Yuri after closing at Minato Izakaya.'));
 assert.equal(gossipAt(1230,['Yuri','Nao']).id,'yuri-evening');
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

test('izakaya hours and late guests cross midnight and close exactly at 03:00',()=>{
 for(const day of [0,1440,2880]){
  for(const t of [960,1439,0,179.99])assert.equal(izakayaOpen(day+t),true);
  for(const t of [180,540,959.99])assert.equal(izakayaOpen(day+t),false);
  const nao=PROFILES.find(p=>p.name==='Nao');
  assert.equal(residentPlan(nao,day+60).place,'izakaya');assert.equal(residentPlan(nao,day+180).place,'home');
  assert.ok(supperGuests(day+60).some(p=>p.name==='Masaru'));assert.ok(supperGuests(day+60).some(p=>p.name==='Tetsuo'));
  assert.equal(supperGuests(day+180).length,0);
  const mori=PROFILES.find(p=>p.name==='Officer Mori');for(const t of [1320,1439,0,359])assert.equal(residentPlan(mori,day+t,true).place,'patrol');
  assert.equal(residentPlan(mori,day+360).place,'home');
 }
 const dom=installDOM();let minutes=1618;const acts=createActivities({say(){},onWeather(){},onTime:v=>{minutes+=v;},getMinutes:()=>minutes});
 acts.action('izakaya-menu');dom.button('Yakitori plate · ¥180');const money=acts.state.yen;
 dom.button('Something else?');assert.equal(acts.paused,false,'Closing ends the menu');assert.equal(acts.state.yen,money);
});

test('ramen and Sakura reuse their residents and release them at the street door',()=>{
 const street=new THREE.Group(),scene=new THREE.Group(),world={people:RESIDENTS.map(profile=>{const g=new THREE.Group();g.userData.name=profile.name;g.userData.hit={inside:false};street.add(g);return {g,profile};})};scene.add(street);
 const ramen=createIndoorResidents({world,parent:scene,place:'ramen'}),market=createIndoorResidents({world,parent:scene,place:'market'});
 assert.deepEqual(ramen.sync(1090),['Hana']);const hana=world.people.find(p=>p.profile.name==='Hana').g;assert.equal(hana.parent,scene);assert.equal(hana.userData.socialPose,'Eat');
 assert.deepEqual(ramen.sync(1125),['Daichi']);assert.equal(hana.parent,street);assert.equal(hana.userData.hit.inside,false);assert.equal(hana.position.x,24.65);assert.equal(hana.userData.socialPose,undefined);
 ramen.restore();assert.equal(scene.children.length,1);
 assert.deepEqual(market.sync(1199),['Yuri']);const yuri=world.people.find(p=>p.profile.name==='Yuri').g;assert.equal(yuri.parent,scene);
 assert.deepEqual(market.sync(1200),[]);assert.equal(yuri.parent,street);assert.equal(yuri.userData.inMarket,undefined);assert.equal(yuri.position.x,-4);assert.equal(yuri.position.z,-25.5);
});
