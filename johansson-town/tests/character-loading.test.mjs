import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {createCharacters} from '../src/people/characters.js?snappy=1';
import {preloadCharacter,preloadModel} from '../src/people/models.js?snappy=1';
import {installDOM} from './fixtures.mjs';

test('delayed and failed character loads never show a placeholder or another identity',async()=>{
 installDOM();const original=globalThis.fetch;globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:512,height:512,close(){}});
 let release,workerRequests=0,failYuri=true;const held=new Promise(resolve=>{release=resolve;});
 globalThis.fetch=async input=>{const url=String(input.url||input);if(url.startsWith('blob:'))return original(input);
  assert.doesNotMatch(url,/vroid|realistic\/yui/);
  if(url.includes('town-suit')){workerRequests++;await held;}
  if(url.includes('town-female_casual')&&failYuri)return new Response('',{status:503});
  return new Response(await readFile(new URL('../assets/characters/'+new URL(url).pathname.split('/characters/')[1],import.meta.url)));
 };
 try{
  assert.equal(await preloadModel('vroid-bob'),false);
  const characters=createCharacters(),scene=new THREE.Scene(),entries=[],people=[];
  for(const name of ['Harbour master','Bus driver','Yuri','Aya','Reiko']){
   const g=new THREE.Group();g.userData.name=name;scene.add(g);const obsolete=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial());g.add(obsolete);
   assert.equal(characters.attach(g,name),null);assert.equal(g.children.length,0);assert.equal(obsolete.parent,null);assert.equal(g.userData.visualReady,false);people.push(g);
  }
  characters.streamDetails({add:entry=>entries.push(entry)},()=>{},()=>new THREE.Vector3());
  assert.ok(entries.every(entry=>Number.isFinite(entry.distance(new THREE.Vector3()))),'Waiting residents remain eligible to load');
  const kenji=entries.find(e=>e.id==='resident:Harbour master'),tetsuo=entries.find(e=>e.id==='resident:Bus driver');
  const a=kenji.load(),b=tetsuo.load();await Promise.resolve();assert.equal(workerRequests,1,'Shared body fetched once');assert.equal(characters.actors.length,0);
  release();assert.equal(await a,true);assert.equal(await b,true);assert.equal(characters.actors.length,2);assert.ok(people.slice(0,2).every(g=>g.userData.visualReady&&g.children.length===1));
  const yuri=entries.find(e=>e.id==='resident:Yuri');assert.equal(await yuri.load(),false);assert.equal(people[2].children.length,0);assert.equal(people[2].userData.visualReady,false);
  failYuri=false;assert.equal(await preloadCharacter('Yuri'),true);characters.update(0);assert.equal(people[2].userData.character.isYuri,true,'Warm model mounts immediately without waiting behind scenery');
  assert.equal(await yuri.load(),true);assert.equal(people[2].children.length,1,'Late queue completion cannot add a duplicate');
  for(const name of ['Aya','Reiko'])assert.equal(await entries.find(e=>e.id==='resident:'+name).load(),true);
  assert.equal(people[3].userData.character.isAya,true);assert.equal(people[4].userData.character.isNozomi,true);assert.equal(characters.actors.length,5);
 }finally{release();globalThis.fetch=original;}
});
