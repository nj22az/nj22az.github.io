import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {RESIDENTS} from '../src/people/residents.js';
import {PROFILES} from '../src/people/profiles.js';
import {preloadModels,createLocalCharacters,createYuriFigurine} from '../src/people/models.js?snappy=1';
import {createResidentLedger,restoreResidentLife} from '../src/people/resident-personalities.js';
import {SAVE_KEY} from '../src/save.js';

test('all named low-poly identities are distinct, retain shared body buffers and keep original Yuri only as a small static figurine',async()=>{
 installDOM();const native=globalThis.fetch,requests=[];globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 globalThis.fetch=async input=>{const url=String(input.url||input);if(url.startsWith('blob:'))return native(input);requests.push(url);return new Response(await readFile(new URL('../assets/characters/'+new URL(url).pathname.split('/characters/')[1],import.meta.url)));};
 try{
  await preloadModels();assert.equal(requests.length,5);assert.ok(requests.every(url=>!url.includes('/realistic/')&&!url.includes('vroid')));
  const scene=new THREE.Scene(),models=createLocalCharacters(),signatures=new Set(),actors=[];
  const cast=[...PROFILES,RESIDENTS.find(p=>p.name==='Yuri'),{name:'Yui'}];
  for(const profile of cast){
   const g=new THREE.Group();g.userData.name=profile.name;scene.add(g);const actor=models.attach(g,profile.name,profile.height);actors.push(actor);
   let skin;actor.model.traverse(o=>{if(o.isSkinnedMesh)skin=o;});assert.ok(actor.lowPoly&&skin);const accessories=[];actor.model.traverse(o=>{if(o.name.startsWith('resident-')&&o.name!=='resident-held-item')accessories.push(o.name);});assert.ok(accessories.length,profile.name+' has an authored accessory');
   const colors=skin.geometry.attributes.color.array;signatures.add(JSON.stringify([skin.geometry.attributes.position.count,Array.from(colors),actor.model.scale.toArray()]));
   let bodyDraws=0;actor.model.traverse(o=>{if(o.isMesh)bodyDraws++;});assert.ok(bodyDraws<=3,profile.name+' keeps at most three standing draws');
  }
  assert.equal(signatures.size,cast.length);const yuri=actors.find(a=>a.isYuri);assert.equal(yuri.height,1.64);assert.ok(yuri.model.getObjectByName('resident-ribbon-apron'));
  const nao=actors.find(a=>a.entity.userData.name==='Nao');let ys,ns;for(const [actor,id] of [[yuri,'y'],[nao,'n']])actor.model.traverse(o=>{if(o.isSkinnedMesh){if(id==='y')ys=o;else ns=o;}});assert.equal(ys.geometry.attributes.position,ns.geometry.attributes.position);assert.notDeepEqual(Array.from(ys.geometry.attributes.color.array),Array.from(ns.geometry.attributes.color.array));
  const figure=await createYuriFigurine();assert.ok(figure);assert.equal(requests.filter(url=>url.includes('yuri-playful')).length,1);let skins=0;figure.traverse(o=>{if(o.isSkinnedMesh)skins++;});assert.equal(skins,0,'Figurine is frozen geometry, not another actor');
  const bounds=new THREE.Box3().setFromObject(figure);assert.ok(Math.abs(bounds.max.y-bounds.min.y-.30)<.001);assert.equal(figure.userData.figurine,true);assert.equal(models.actors.length,cast.length);
  await createYuriFigurine();assert.equal(requests.filter(url=>url.includes('yuri-playful')).length,1);
 }finally{globalThis.fetch=native;}
});

test('resident budgets and delivered meals survive real save restoration without changing the player wallet',async()=>{
 const state={yen:777},ledger=createResidentLedger(()=>state);ledger.purchase('Kenji',900,'market-meal','bun',150);const record=ledger.account('Kenji',900);record.meals={market:{item:'bun',delivered:true,finished:false,eaten:7}};
 const dom=installDOM({[SAVE_KEY]:JSON.stringify(state)}),{createActivities}=await import('../activities.js?resident-save=1');
 const activities=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>900});assert.equal(activities.state.yen,777);assert.equal(activities.state.residentLife.Kenji.yen,2250);assert.equal(activities.state.residentLife.Kenji.meals.market.eaten,7);
 const reloaded=createResidentLedger(()=>activities.state);assert.equal(reloaded.purchase('Kenji',900,'market-meal','bun',150),true);assert.equal(activities.state.residentLife.Kenji.yen,2250);activities.save();assert.equal(JSON.parse(dom.storage.get(SAVE_KEY)).residentLife.Kenji.purchases.length,1);
 const next=reloaded.account('Kenji',1441);assert.equal(next.yen,2400);assert.equal(next.purchases.length,0);
 assert.deepEqual(restoreResidentLife({Kenji:{day:0,yen:'bad'},stranger:{day:0,yen:1}}),{});
});
