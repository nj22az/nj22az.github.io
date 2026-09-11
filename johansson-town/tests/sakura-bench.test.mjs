import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {installDOM} from './fixtures.mjs';
import {createTown} from '../src/world/town.js?snappy=1';
import {createPropFactory} from '../prop-factory.js';
import {circleHitsRect} from '../physics.js?snappy=1';
import {FULL_TOWN} from '../src/world/full-town-state.js';
import {preloadSakuraBench,buildSakuraBench,sakuraBenchSeat,SAKURA_SHOP,SAKURA_BENCH_PLACE} from '../src/world/sakura-bench.js';

function lookDot(from,yaw){
  const fw=[-Math.sin(yaw),-Math.cos(yaw)];
  const to=[SAKURA_SHOP.x-from[0],SAKURA_SHOP.z-from[2]];
  const len=Math.hypot(...to);
  return (fw[0]*to[0]+fw[1]*to[1])/len;
}

test('authored cedar bench sits the player looking at Sakura from across the street',async()=>{
  installDOM();
  const previous={fetch:globalThis.fetch,bitmap:globalThis.createImageBitmap,self:globalThis.self};
  globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:512,height:512,close(){}});
  globalThis.fetch=async url=>String(url).startsWith('blob:')?previous.fetch(url):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
  try{
    const bytes=await readFile(new URL('../assets/models/street/sakura-bench.glb',import.meta.url));
    assert.ok(bytes.byteLength>80_000&&bytes.byteLength<220_000);
    const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
    const meshes=[];gltf.scene.traverse(o=>{if(o.isMesh)meshes.push(o);});
    assert.ok(meshes.length>=3&&meshes.length<=8);
    const bounds=new THREE.Box3().setFromObject(gltf.scene);
    assert.ok(bounds.min.y>-.001&&bounds.max.y<.95,'Bench stays under a metre tall');
    assert.ok(bounds.max.x-bounds.min.x>1.4&&bounds.max.x-bounds.min.x<2.1,'Bench is street-furniture width');

    assert.equal(await preloadSakuraBench(),true);
    const seat=sakuraBenchSeat();
    assert.ok(lookDot(seat.position,seat.yaw)>.97,'Seat faces the konbini');
    assert.ok(Math.hypot(seat.position[0]-SAKURA_SHOP.x,seat.position[2]-SAKURA_SHOP.z)>12);
    assert.ok(Math.hypot(seat.stand[0]-SAKURA_BENCH_PLACE.x,seat.stand[2]-SAKURA_BENCH_PLACE.z)>1.1,'Stand steps off the slats');

    const world={group:new THREE.Group(),colliders:[]};
    const built=buildSakuraBench(world,{factory:createPropFactory({shadows:false}),register(){},onAction(){}});
    assert.equal(built.source,'blender');
    assert.ok(world.group.getObjectByName('sakura-viewing-bench'));
    assert.ok(world.group.getObjectByName('sakura-bench-seat'));
    assert.equal(world.colliders.some(c=>circleHitsRect(seat.stand[0],seat.stand[2],.28,c)),false,'Stand-up is clear of the bench');
    assert.equal(world.colliders.some(c=>circleHitsRect(seat.position[0],seat.position[2],.28,c)),true,'Sit point is on the bench');
  }finally{
    globalThis.fetch=previous.fetch;globalThis.createImageBitmap=previous.bitmap;globalThis.self=previous.self;
  }
});

test('harbour town keeps the viewing bench and the neighbourhood bench',()=>{
  installDOM();
  FULL_TOWN.active=false;
  const world=createTown({scene:new THREE.Scene(),sites:[{id:'market',title:'Sakura Shōten',jp:'桜商店',side:-1,z:-28,color:0x9d7c7e,accent:'#a76680',line:'Yuri'}],mobile:true,shadows:false,register(){},onAction(){},enter(){},getPlayerPosition:()=>new THREE.Vector3()});
  assert.ok(world.group.getObjectByName('sakura-viewing-bench'));
  assert.ok(world.group.getObjectByName('prop:bench'),'Neighbourhood bench remains further north');
  assert.ok(world.sakuraBench?.seat);
  const seat=world.sakuraBench.seat;
  assert.ok(lookDot(seat.position,seat.yaw)>.97);
});
