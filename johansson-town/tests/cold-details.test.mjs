import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTown} from '../src/world/town.js?snappy=1';
import {preloadJapaneseTown} from '../src/world/japanese-town.js';
import {preloadVending} from '../src/world/vending.js';
import {createCharacters} from '../src/people/characters.js?snappy=1';

test('cold street needs only two models; streamed facades preserve every door and collider',async()=>{
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 const nativeFetch=globalThis.fetch,requests=[];
 globalThis.ProgressEvent=class {constructor(type,data){this.type=type;Object.assign(this,data);}};
 globalThis.fetch=async url=>{url=url.url||url;if(String(url).startsWith('blob:'))return nativeFetch(url);const path=new URL(url).pathname.split('/assets/')[1];requests.push(path);return new Response(await readFile(new URL('../assets/'+path,import.meta.url)));};
 await Promise.all([preloadJapaneseTown(),preloadVending()]);
 assert.deepEqual(requests.sort(),['models/japanese-town/street-kit.glb','models/props/vending-machine.glb']);
 const bytes=(await Promise.all(requests.map(path=>readFile(new URL('../assets/'+path,import.meta.url))))).reduce((sum,b)=>sum+b.length,0);assert.ok(bytes<2_250_000,'Opening model budget');
 const sites=['office','frontrow','form3d','stepwise','journal','electronics','market','career'].map((id,i)=>({id,title:id,jp:id,side:i%2?1:-1,z:[38,30,18,8,-4,-16,-28,-39][i],color:0x777766,accent:'#49675d',line:id}));
 const world=createTown({scene:new THREE.Scene(),sites,mobile:true,shadows:false,register(){},onAction(){},enter(){},getPlayerPosition:()=>new THREE.Vector3()});
 assert.equal(requests.length,2,'Constructing the town starts no district model requests');
 const colliders=JSON.stringify(world.colliders),doors=JSON.stringify(sites.map(s=>[s.id,s.door]));
 for(const id of ['tea-house','ramen-exterior','izakaya-exterior','park','street-plants']){
  const detail=world.details.find(d=>d.id===id);assert.ok(detail,id+' is deferred');assert.equal(await detail.load(),true,id+' mounts its supplied model');
  assert.equal(JSON.stringify(world.colliders),colliders,id+' cannot change collision');assert.equal(JSON.stringify(sites.map(s=>[s.id,s.door])),doors,id+' cannot move entrances');
 }
 assert.equal(requests.includes('models/izakaya/minato-interior.glb'),false,'Izakaya interior waits for its door');
 const characters=createCharacters({mobile:true,shadows:false}),yuri=world.people.find(p=>p.g.userData.name==='Yuri').g;
 characters.attach(yuri,'Yuri',1.6);const old=[...yuri.children],entries=[];
 characters.streamDetails({add:entry=>entries.push(entry)},()=>{});
 const requestsBefore=requests.length;assert.equal(await entries[0].load(),true);assert.equal(requests.length,requestsBefore+1,'Only Yuri is fetched');
 assert.ok(requests.at(-1).startsWith('characters/residents/town-female_casual.glb'));assert.ok(old.every(child=>child.parent===null));assert.equal(characters.actors.length,1);assert.ok(characters.actors[0].mixer);
 globalThis.fetch=nativeFetch;
});
