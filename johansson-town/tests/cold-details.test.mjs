import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTown} from '../src/world/town.js?snappy=1';
import {preloadDiningStreet} from '../src/world/dining-street.js';
import {preloadVending} from '../src/world/vending.js';
import {createCharacters} from '../src/people/characters.js?snappy=1';

test('retained alley and vending assets fit their budget; streamed facades preserve every door and collider',async()=>{
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 const nativeFetch=globalThis.fetch,requests=[];
 globalThis.ProgressEvent=class {constructor(type,data){this.type=type;Object.assign(this,data);}};
 globalThis.fetch=async url=>{url=url.url||url;if(String(url).startsWith('blob:'))return nativeFetch(url);const path=new URL(url).pathname.split('/assets/')[1];requests.push(path);return new Response(await readFile(new URL('../assets/'+path,import.meta.url)));};
 await Promise.all([preloadDiningStreet(),preloadVending()]);
 assert.deepEqual(requests.sort(),['models/dining-street/night-lane.glb','models/props/vending-machine.glb']);
 const bytes=(await Promise.all(requests.map(path=>readFile(new URL('../assets/'+path,import.meta.url))))).reduce((sum,b)=>sum+b.length,0);assert.ok(bytes<4_950_000,'Opening model budget');
 const sites=['office','frontrow','form3d','stepwise','journal','electronics','market','career'].map((id,i)=>({id,title:id,jp:id,side:i%2?1:-1,z:[38,30,18,8,-4,-16,-28,-39][i],color:0x777766,accent:'#49675d',line:id}));
 const world=createTown({scene:new THREE.Scene(),sites,mobile:true,shadows:false,register(){},onAction(){},enter(){},getPlayerPosition:()=>new THREE.Vector3()});
 assert.equal(requests.length,2,'Constructing the town starts no district model requests');
 const colliders=JSON.stringify(world.colliders),doors=JSON.stringify(sites.map(s=>[s.id,s.door]));
 // The park is drawn in place now (world/park.js) and fetches nothing, so it is not deferred.
 assert.equal(world.details.some(d=>d.id==='park'),false,'the park still waits for a model');
 for(const id of ['tea-house','ramen-exterior','izakaya-exterior','street-plants']){
  const detail=world.details.find(d=>d.id===id);assert.ok(detail,id+' is deferred');assert.equal(await detail.load(),true,id+' mounts its supplied model');
  assert.equal(JSON.stringify(world.colliders),colliders,id+' cannot change collision');assert.equal(JSON.stringify(sites.map(s=>[s.id,s.door])),doors,id+' cannot move entrances');
 }
 assert.equal(requests.includes('models/izakaya/minato-interior.glb'),false,'Izakaya interior waits for its door');
 const characters=createCharacters({mobile:true,shadows:false}),yuri=world.people.find(p=>p.g.userData.name==='Thuan').g;
 // Residents are Shimanchu, built in place: attaching one fetches nothing.
 const requestsBefore=requests.length;characters.attach(yuri,'Thuan',1.6);
 assert.equal(requests.length,requestsBefore,'Attaching Thuan downloads nothing');assert.equal(characters.actors.length,1);assert.ok(characters.actors[0].isAvatar);
 globalThis.fetch=nativeFetch;
});
