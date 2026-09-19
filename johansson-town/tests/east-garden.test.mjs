import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildEastGarden,EAST_GARDEN} from '../src/world/east-garden.js';
import {buildEastLawn,EAST_LAWN} from '../src/world/east-lawn.js';
import {createTown} from '../src/world/town.js';
import {createBusinesses} from '../src/world/businesses.js';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';
import {groundHeight,routeAt} from '../src/world/layout.js?snappy=1';
import {PARK,PARK_SKIRT} from '../src/world/park-layout.js';
import {GROUND_LAYER} from '../src/world/ground-layers.js';
import {applyCelShading} from '../src/render/cel.js';
import {createTownSections} from '../src/render/town-sections.js';
import {circleHitsRect} from '../physics.js';

function town(mode=TOWN_MODES.PENINSULA){
 installDOM();
 return createTown({scene:new THREE.Scene(),sites:createBusinesses().filter(s=>['market','frontrow'].includes(s.id)),
  townMode:mode,mobile:false,shadows:false,register(){},onAction(){},enter(){},getPlayerPosition:()=>new THREE.Vector3()});
}

test('the lawn builds one garden, keeps its greenery hook and forwards the pond interaction without fetching assets',()=>{
 installDOM();
 const requests=[],original=globalThis.fetch,anchors=[],actions=[];
 globalThis.fetch=(...args)=>{requests.push(args);throw Error('The garden must not fetch a model');};
 try{
  const parent=new THREE.Group(),colliders=[];
  const lawn=buildEastLawn({parent,colliders,heightAt:()=>2,shadows:true,
   register:(object,label,run)=>anchors.push({object,label,run}),onAction:(...args)=>actions.push(args)});
  assert.equal(lawn.garden.group.parent,lawn.group);
  assert.equal(lawn.group.children.filter(o=>o===lawn.garden.group).length,1);
  assert.equal(typeof lawn.useParkGreenery,'function');
  assert.equal(colliders.filter(c=>c.id===EAST_GARDEN.id).length,1);
  const look=anchors.find(a=>a.object.name==='east-garden-view');
  assert.ok(look);look.run();
  assert.deepEqual(actions[0].slice(0,2),['inspect','Garden pond']);
  assert.ok(lawn.garden.pond.position.y>2,'The supplied terrain height is used');
  assert.ok(lawn.garden.group.children.some(o=>o.castShadow));
  lawn.tick(17,1110);
  assert.equal(lawn.garden.pond.material.uniforms.uTime.value,17);
  assert.equal(lawn.garden.fireflies.visible,true);
  assert.deepEqual(requests,[],'No garden asset request, including the source project baked GLB');
 }finally{globalThis.fetch=original;}
});

test('the real world update drives both shaders through dusk, dawn and midnight wrap',()=>{
 const world=town(),{pond,fireflies}=world.eastLawn.garden;
 assert.equal(fireflies.visible,false,'No fireflies before the first daytime update');
 let time=0;
 for(const [minutes,visible] of [[1109.99,false],[1110,true],[1439,true],[1440,true],[1799.99,true],[1800,false],[-1,true],[360,false],[720,false]]){
  world.update(.016,++time,.5,minutes);
  assert.equal(fireflies.visible,visible,'Town minute '+minutes);
  assert.equal(pond.material.uniforms.uTime.value,time,'Water uses elapsed seconds');
  assert.equal(fireflies.material.uniforms.uTime.value,time,'Fireflies use elapsed seconds');
 }
 world.update(.016,++time,1);
 assert.equal(fireflies.visible,false,'The default town time stays afternoon');
 assert.equal(fireflies.geometry.attributes.position.count,24);
});

test('layouts without an east lawn still update normally',()=>{
 for(const mode of [TOWN_MODES.LEGACY,TOWN_MODES.SHOPPING]){
  const world=town(mode);
  assert.equal(world.eastLawn,undefined);
  assert.doesNotThrow(()=>world.update(.016,3,.5,1110));
 }
 configureTownMode(TOWN_MODES.PENINSULA);
});

test('the garden stays on the lawn, off the park slope, with solid props and a reachable inspection point',()=>{
 installDOM();configureTownMode(TOWN_MODES.PENINSULA);
 const world=town(),garden=world.eastLawn.garden,{x,z,radius}=EAST_GARDEN;
 const colliders=world.colliders.filter(c=>c.id?.startsWith('east-garden'));
 assert.equal(colliders.length,4);
 for(const c of colliders){
  assert.ok(circleHitsRect(c.x,c.z,.32,c),'Prop collision: '+c.id);
  assert.ok(c.x-c.w/2>EAST_LAWN.minX&&c.x+c.w/2<EAST_LAWN.maxX);
  assert.ok(c.z-c.d/2>EAST_LAWN.minZ&&c.z+c.d/2<EAST_LAWN.maxZ);
  for(const sx of [-1,1])for(const sz of [-1,1]){
   const px=c.x+sx*c.w/2,pz=c.z+sz*c.d/2;
   const dx=Math.max(0,Math.abs(px-PARK.x)-PARK.half),dz=Math.max(0,Math.abs(pz-PARK.z)-PARK.half);
   assert.ok(Math.hypot(dx,dz)>PARK_SKIRT,'Garden touches the park mound or skirt');
   assert.equal(groundHeight(px,pz),0);
  }
 }
 const marker=garden.group.getObjectByName('east-garden-view');
 assert.ok(routeAt(marker.position.x,marker.position.z,.32));
 assert.ok(!world.colliders.some(c=>circleHitsRect(marker.position.x,marker.position.z,.32,c)),'Inspection point is blocked');
 // A complete loop outside all garden props, at normal player width.
 for(let i=0;i<72;i++){
  const a=i*Math.PI/36,px=x+Math.cos(a)*(radius+1.7),pz=z+Math.sin(a)*(radius+1.7);
  assert.ok(routeAt(px,pz,.32));
  assert.ok(!world.colliders.some(c=>circleHitsRect(px,pz,.32,c)),'Blocked garden approach at '+i);
 }
});

test('wave troughs clear the lawn, crests stay inside the rim, and the pond has interior wave vertices',()=>{
 const {pond,group}=buildEastGarden({parent:new THREE.Group(),heightAt:()=>2});
 const u=pond.material.uniforms,rim=group.children.find(o=>o.geometry?.type==='TorusGeometry');
 assert.ok(pond.position.y-u.uMaxDepth.value>2+GROUND_LAYER.grass+.015,'Grass can pierce the water');
 assert.ok(pond.position.y+u.uWavesAmplitude.value<rim.position.y+rim.geometry.parameters.tube,'Waves spill over the rim');
 assert.match(pond.material.vertexShader,/elevation=max\(elevation,-uMaxDepth\)/,'The depth limit must reach the shader');
 const positions=pond.geometry.attributes.position,radii=new Set();
 for(let i=0;i<positions.count;i++)radii.add(Math.hypot(positions.getX(i),positions.getY(i)).toFixed(2));
 assert.ok(radii.size>=8,'A centre-and-edge fan cannot describe small ripples');
});

test('cel conversion and section culling preserve animated shader materials and daytime visibility',()=>{
 const scene=new THREE.Scene(),town=new THREE.Group();scene.add(town);
 const garden=buildEastGarden({parent:town}),water=garden.pond.material,flies=garden.fireflies.material;
 applyCelShading(town);
 assert.equal(garden.pond.material,water);
 assert.equal(garden.fireflies.material,flies);
 const camera=new THREE.PerspectiveCamera();camera.position.set(27,2,-3);camera.lookAt(28,0,-6);
 const sections=createTownSections({mobile:true}),renderer={render(){}};
 for(const minutes of [720,1110,360]){
  garden.tick(10,minutes);
  for(const position of [{x:500,z:500},{x:28,z:-6}]){
   sections.render({renderer,scene,camera,town,position});
   assert.equal(garden.fireflies.visible,minutes===1110,'Culling changed the time-of-day visibility');
  }
 }
});
