import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {applyCelShading} from '../src/render/cel.js';
import {batchStaticProps} from '../src/render/static-props.js';
import {buildMinatoFacade} from '../src/world/minato-facade.js';
import {buildSakuraInterior} from '../src/world/interiors/sakura-interior.js';
import {createTown} from '../src/world/town.js';
import {createBusinesses} from '../src/world/businesses.js';
import {TOWN_MODES} from '../src/world/town-mode.js';
import {clock,PALETTE} from '../src/render/dusk.js';

test('Minato lanterns and sign still change on the visible cel materials after batching',()=>{
 installDOM();const parent=new THREE.Group(),facade=buildMinatoFacade({parent});
 batchStaticProps(parent);applyCelShading(parent);
 const countLights=()=>{let n=0;parent.traverse(o=>{if(o.isPointLight)n++;});return n;};
 assert.equal(countLights(),0);
 for(const minutes of [960,1050,1140,1380,120]){
  const c=clock(minutes);facade.lit(true,c.day,c.lanternGlow);
  for(const mesh of facade.lanterns){
   assert.equal(mesh.layers.mask,1,'Clock-driven lanterns must remain rendered');
   assert.equal(mesh.userData.renderBatch,undefined,'No frozen static clone');
   const mat=Array.isArray(mesh.material)?mesh.material[4]:mesh.material;
   assert.equal(mat.type,'MeshToonMaterial');
   assert.equal(mat.emissiveIntensity,.35+c.lanternGlow*1.35);
  }
 }
 facade.lit(false,0,1);
 for(const mesh of facade.lanterns)assert.equal((Array.isArray(mesh.material)?mesh.material[4]:mesh.material).emissiveIntensity,0);
});

test('world updates keep garden animation and existing harbour lights on the same dusk clock',()=>{
 installDOM();const world=createTown({scene:new THREE.Scene(),sites:createBusinesses(),townMode:TOWN_MODES.PENINSULA,mobile:false,shadows:true,register(){},onAction(){},enter(){},getPlayerPosition:()=>new THREE.Vector3()});
 applyCelShading(world.group);
 const globes=[];let points=0;
 world.group.traverse(o=>{if(o.isMesh&&o.geometry.type==='SphereGeometry'&&o.geometry.parameters.radius===.25)globes.push(o);if(o.isPointLight)points++;});
 assert.ok(globes.length>0);
 let elapsed=0;
 for(const minutes of [1020,1050,1110,1200,1230,1440,1800,1860]){
  const c=clock(minutes);world.update(.016,++elapsed,c.day,minutes);
  for(const globe of globes)assert.equal(globe.material.emissiveIntensity,.12+c.lanternGlow*.82);
  const {pond,fireflies}=world.eastLawn.garden;
  assert.equal(pond.material.uniforms.uTime.value,elapsed);
  const m=minutes%1440;assert.equal(fireflies.visible,m>=1110||m<360);
 }
 let after=0;world.group.traverse(o=>{if(o.isPointLight)after++;});assert.equal(after,points);
});

test('Sakura tubes load at the current hour without making stock emissive or cel shaded',async()=>{
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 const old=fetch;globalThis.fetch=async input=>String(input).startsWith('blob:')?old(input):new Response(await readFile(new URL('../assets/'+new URL(input).pathname.split('/assets/')[1],import.meta.url)));
 try{
  const room=new THREE.Group(),display=buildSakuraInterior({room,reg(){},action(){},exit(){}});
  display.updateLighting(1200);assert.ok(await display.ready());applyCelShading(room);
  const tube=room.getObjectByName('sakura-light'),shelf=room.getObjectByName('sakura-shelf');
  assert.ok(tube&&shelf);assert.notEqual(tube.material,shelf.material);
  assert.equal(tube.material.emissiveIntensity,.35);
  assert.equal(tube.material.type,'MeshStandardMaterial');assert.equal(shelf.material.type,'MeshStandardMaterial');
  assert.equal(shelf.material.emissive.getHex(),0);
  for(const [minutes,level] of [[540,1],[1110,1],[1199,1],[1200,.35],[1440,.35]]){
   display.updateLighting(minutes);
   assert.equal(tube.material.emissive.getHex(),PALETTE.sakuraTube);
   assert.equal(tube.material.emissiveIntensity,level);
   assert.equal(room.children.find(o=>o.isHemisphereLight).intensity,1.2*level);
  }
 }finally{globalThis.fetch=old;}
});
