import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {configureTownMode} from '../src/world/town-mode.js';
import {COAST_BOUNDS} from '../src/world/peninsula.js';
import {GARDEN_BRIDGE_AUTHOR_Z,GARDEN_BENCHES_AUTHOR,gardenPoint} from '../src/world/garden-layout.js';
import {ONSEN_APPROACH,onsenPoint} from '../src/world/onsen-layout.js';
import {MOUNTAIN_TRAIL,COAST_ROAD} from '../src/world/island-plan.js';
import {onPeninsulaLand} from '../src/world/coastal-ground.js';
import {createWalkSurface} from '../src/world/walk-surface.js';
import {groundHeight,planHeight,setWalkSurface} from '../src/world/layout.js';
import {townBoundsBlocked,standingHitsRect,canStepBetween} from '../physics.js';

test('garden bridge, bench and outer-island trails connect on real supported floors with ordinary collision',async()=>{
 installDOM();globalThis.self=globalThis;configureTownMode('peninsula');
 const {createTown}=await import('../src/world/town.js');
 const world=createTown({scene:new THREE.Scene(),sites:[],townMode:'peninsula',mobile:true,shadows:false,register(){},enter(){},onAction(){}});
 // Match the live game's terrain sampling origin and dimensions.
 const surface=createWalkSurface({minX:COAST_BOUNDS.minX-2,maxX:COAST_BOUNDS.maxX+2,minZ:COAST_BOUNDS.minZ-2,maxZ:COAST_BOUNDS.maxZ+2,base:planHeight});surface.add(world.group);setWalkSurface(surface);
 const bins=new Map();for(const c of world.colliders){const reach=Math.hypot(c.w,c.d)/2+.4;for(let i=Math.floor((c.x-reach)/4);i<=Math.floor((c.x+reach)/4);i++)for(let j=Math.floor((c.z-reach)/4);j<=Math.floor((c.z+reach)/4);j++){const key=i+','+j;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(c);}}
 world.group.updateMatrixWorld(true);const floors=[];world.group.traverse(o=>{if(!o.isMesh||o.material?.transparent)return;for(let p=o;p;p=p.parent)if(!p.visible||p.userData.dynamicProp)return;floors.push({mesh:o,bounds:new THREE.Box3().setFromObject(o)});});
 const ray=new THREE.Raycaster();
 function walk(points,label,{land=false}={}){
  let [x,z]=points[0];
  for(const [tx,tz] of points.slice(1)){
   const sx=x,sz=z,n=Math.ceil(Math.hypot(tx-x,tz-z)/.04);
   for(let k=1;k<=n;k++)for(const [px,pz] of [[sx+(tx-sx)*k/n,z],[sx+(tx-sx)*k/n,sz+(tz-sz)*k/n]]){
    if(land)for(let i=0;i<8;i++){const a=i*Math.PI/4;assert.ok(onPeninsulaLand(px+Math.cos(a)*.32,pz+Math.sin(a)*.32),label+' leaves actual land at '+[px,pz]);}
    const y=groundHeight(px,pz);assert.ok(canStepBetween(groundHeight(x,z),y),label+' height cliff at '+[px,pz]);
    assert.equal(townBoundsBlocked(px,pz,.32),false,label+' bounds at '+[px,pz]);
    assert.equal((bins.get(Math.floor(px/4)+','+Math.floor(pz/4))||[]).some(c=>standingHitsRect(px,pz,.32,y,c)),false,label+' solid at '+[px,pz]);
    if(k%5===0||k===n){ray.set(new THREE.Vector3(px,y+.24,pz),new THREE.Vector3(0,-1,0));const candidates=floors.filter(({bounds:b})=>px>=b.min.x&&px<=b.max.x&&pz>=b.min.z&&pz<=b.max.z&&b.min.y<=y+.24&&b.max.y>=y-.06).map(o=>o.mesh);assert.ok(ray.intersectObjects(candidates,false).some(h=>Math.abs(h.point.y-y)<.06),label+' missing drawn floor at '+[px,pz]);}
    x=px;z=pz;
   }
  }
 }
 try{
  const z=gardenPoint(-34,GARDEN_BRIDGE_AUTHOR_Z)[1];
  walk([[-23.4,40.6],[-20.4,44.8],[-18.85,44.8],[-18.85,z],[-20.4,z],[-33.6,z],[-33.6,49]],'southern approach and east-to-west crossing');
  walk([[-33.6,49],[-33.6,z],[-20.4,z],[-20.4,52],[-23.4,54.6],[-23.4,56.8]],'west-to-east crossing and northern circuit');
  const bench=gardenPoint(...GARDEN_BENCHES_AUTHOR[1].stand);
  walk([[-23.4,56.8],[-23.4,bench[1]],bench],'northern circuit to the real garden bench stand');
  walk([[-20.4,z],[-18.85,z],[-18.85,44.8],ONSEN_APPROACH],'bridge to bathhouse porch');
  walk([[-20.4,44.8],[-21.7,44.8],onsenPoint(1.9,8.5)],'southern circuit to footbath seat approach');
  walk([[23.5,90],...MOUNTAIN_TRAIL.slice(0,5)],'Fukugi Lane to Aoba Radio');
  const radio=[[40,158],[39.3,159.2],[39.3,160],[39.3,166.16],[39.1,166.8],[37.5,166.8],[36.2,164.8],[34.8,165.8]];
  walk(radio,'radio outside stair and public lookout');
  walk([...radio].reverse(),'radio lookout return down the real stair');
  walk([[53,66],...COAST_ROAD.slice(0,4)],'Kitahama street to coastal road across the lower-island and upland ground join',{land:true});
  walk([...COAST_ROAD.slice(0,4)].reverse().concat([[53,66]]),'coastal road return to the Kitahama street',{land:true});
 }finally{setWalkSurface(null);configureTownMode('legacy');}
});
