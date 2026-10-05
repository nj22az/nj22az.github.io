import {createIndoorResidents} from '../src/people/indoor-residents.js';
import {RESIDENTS} from '../src/people/residents.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {PROFILES} from '../src/people/profiles.js';
import {supperGuests,residentPlan,IZAKAYA_SEATS,gossipAt,thuanVisitsIzakaya,thuanEveningPlace,inTimeRange,izakayaOpen,IZAKAYA_DOOR,RAMEN_DOOR} from '../src/people/social.js';
import {createIzakayaGuests} from '../src/people/izakaya-guests.js';
import {createVenueService} from '../src/people/venue-service.js';
import {createActivities} from '../activities.js?snappy=1';
import {installDOM} from './fixtures.mjs';


test('the Barfly stays in Minato, drinks without a purchase and sleeps overnight',()=>{
 const person=PROFILES.find(p=>p.name==='Barfly');assert.ok(person);
 // After closing he helps clean up (03:00-04:00, izakaya-hours.js), then sleeps until ten.
 for(const minute of [0,180,239,600,1439]){const plan=residentPlan(person,minute);assert.equal(plan.place,'izakaya');assert.equal(plan.barflySleeping,false);}
 for(const minute of [240,300,599]){const plan=residentPlan(person,minute);assert.equal(plan.place,'izakaya');assert.equal(plan.barflySleeping,true);}
});

test('the Barfly drinks indefinitely without a bill and sleeps through the night',()=>{
 const profile=PROFILES.find(p=>p.name==='Barfly'),person={profile,g:{visible:true,userData:{}}},room=new THREE.Group();
 let minutes=1200;
 const service=createVenueService({room,place:'izakaya',getCustomers:()=>[person],getMinutes:()=>minutes,
  ledger:{account(){throw Error('Barfly must not open a meal ledger');},purchase(){throw Error('Barfly must never be charged');}}});
 service.update(1);assert.equal(person.g.userData.socialPose,'Drink');assert.equal(person.g.userData.heldItem,'beer');
 minutes=240;service.update(1);assert.equal(person.g.userData.socialPose,'Sleep');assert.equal(person.g.userData.heldItem,undefined);
 service.dispose();
});

test('izakaya borrows existing entities, updates guests and restores interaction ownership without duplicates',()=>{
 const street=new THREE.Group(),scene=new THREE.Group(),world={people:PROFILES.map((profile,i)=>{const g=new THREE.Group();g.userData.name=profile.name;g.userData.hit={inside:false};g.position.set(i,0,i+1);street.add(g);return {g,profile};})};scene.add(street);
 const before=world.people.map(p=>({g:p.g,pos:p.g.position.clone(),hit:p.g.userData.hit}));const guests=createIzakayaGuests({world,parent:scene});
 for(const p of world.people)if(residentPlan(p.profile,1135).place==='izakaya'){p.g.position.set(IZAKAYA_DOOR[0],0,IZAKAYA_DOOR[1]);p.g.userData.indoors='izakaya';}
 const names=guests.sync(1135);assert.ok(names.length>1);assert.equal(new Set(world.people.map(p=>p.g.uuid)).size,PROFILES.length);
 for(const name of names){const g=world.people.find(p=>p.g.userData.name===name).g;assert.equal(g.parent,scene);assert.equal(g.userData.hit.inside,true);assert.ok(g.userData.socialPose||g.userData.name==='Nao');}
 const laterNames=guests.sync(1335);guests.restore();guests.restore();assert.equal(guests.names().length,0);
 for(const {g,pos,hit} of before){
  assert.equal(g.parent,street);
  const wasGuest=[...names,...laterNames].includes(g.userData.name);
  if(wasGuest){
   const d=Math.hypot(g.position.x-IZAKAYA_DOOR[0],g.position.z-IZAKAYA_DOOR[1]);
   assert.ok(d<.01,g.userData.name+' returns to the actual izakaya threshold');
   assert.ok(d<3,g.userData.name+' stays near the izakaya door');
  }else assert.ok(g.position.equals(pos),g.userData.name+' '+g.position.toArray()+' expected '+pos.toArray());
  assert.equal(g.userData.hit,hit);assert.equal(hit.inside,false);assert.equal(g.userData.inIzakaya,undefined);
 }
});

test('supper charges once, advances the evening, saves a memory and refuses insufficient funds',()=>{
 // Ordered from your seat: Nao cooks it and brings it over (people/izakaya-beer.js).
 const dom=installDOM();let minutes=1100;const ordered=[];
 const acts=createActivities({say(){},onWeather(){},onTime:v=>{if(typeof v==='number')minutes+=v;},getMinutes:()=>minutes,getSocialContext:()=>({inside:'izakaya',names:['Aya','Reiko']}),
  getBeerTable:()=>({drink:null,dish:null,order:null,naoHere:true}),onOrderDrink:id=>{ordered.push(id);return true;}});
 acts.action('izakaya-table');dom.button('Order something to eat…');dom.button('Assorted Yakitori · ¥180');
 assert.equal(acts.state.yen,1020);assert.equal(minutes,1102);assert.deepEqual(ordered,['yakitori']);
 assert.ok(acts.state.notes.includes('Ordered a plate of yakitori at Minato.'));
 acts.state.yen=100;acts.action('izakaya-table');dom.button('Order a drink…');dom.button('Orion draught, medium mug · ¥450 (not enough yen)');
 assert.equal(acts.state.yen,100);assert.deepEqual(ordered,['yakitori'],'nothing you cannot pay for');
 acts.action('izakaya-menu');dom.button('Read the food');assert.match(document.querySelector('#activityBody').firstChild.textContent,/Grilled Atka mackerel/);
});

test('Thuan visits after closing on alternate days and has off-duty conversation',()=>{
 for(const m of [0,1199,1290,1439,1440+1230])assert.equal(thuanVisitsIzakaya(m),false);
 for(const m of [1200,1219,1220,1230,1289,2880+1230])assert.equal(thuanVisitsIzakaya(m),true);
 const dom=installDOM();const acts=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>1230,getSocialContext:()=>({inside:'izakaya',names:['Thuan','Nao']})});
 acts.action('resident','Thuan');assert.equal(document.querySelector('#activityTitle').textContent,'Thuan · After hours');
 assert.match(document.querySelector('#activityBody').firstChild.textContent,/all locked up/);
 dom.button('What is your favourite snack?');assert.match(document.querySelector('#activityBody').firstChild.textContent,/Nao saved me/);
 assert.ok(acts.state.notes.includes('Caught up with Thuan after closing at Minato Izakaya.'));
 assert.equal(gossipAt(1230,['Thuan','Nao']).id,'yuri-evening');
});


test('izakaya exports load locally with bounded geometry and at most ten static draws',async()=>{
 for(const kind of ['exterior','interior']){const bytes=await readFile(new URL('../assets/models/izakaya/minato-'+kind+'.glb',import.meta.url));const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');let draws=0;gltf.scene.traverse(o=>{if(o.isMesh){draws++;assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));}});assert.ok(draws<=10);const box=new THREE.Box3().setFromObject(gltf.scene),size=box.getSize(new THREE.Vector3());
  // The interior carries Sato Ramen beside Minato, sharing its kitchen: 13 m of bar and 5 m of ramen shop.
  assert.ok(size.x<=(kind==='interior'?18.2:13.1));assert.ok(size.z<=13.1);
  if(kind==='interior'){gltf.scene.updateMatrixWorld(true);IZAKAYA_SEATS.forEach(([x,z],i)=>{
   const hits=new THREE.Raycaster(new THREE.Vector3(x,1.5,z),new THREE.Vector3(0,-1,0)).intersectObject(gltf.scene,true);
   assert.ok(hits.length);assert.ok(Math.abs(hits[0].point.y-(i<5?.71:.565))<.015,'Runtime seat height matches the actual furniture');
  });}
}
});



test('at Minato you can stand somebody a drink, and they remember it',()=>{
 const dom=installDOM();const treated=[];
 const acts=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>1200,getSocialContext:()=>({inside:'izakaya',names:['Aya','Nao']}),onTreat:name=>treated.push(name)});
 const yen=acts.state.yen;acts.action('resident','Aya');dom.button('Buy Aya a drink · ¥450');
 assert.equal(acts.state.yen,yen-450);assert.equal(acts.state.treats.Aya,1);assert.deepEqual(treated,['Aya']);
 assert.ok(acts.state.notes.includes('Bought Aya a drink at Minato.'));
 acts.action('resident','Nao');assert.ok(!dom.has('Buy Nao a drink · ¥450'),'Nao is working');
});
