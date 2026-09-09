import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {applyStreetClearance} from '../src/world/street-clearance.js';
import {LANDMARK_LOTS,hideLandmarkLots,colliderInLandmarkLot,localToWorld} from '../src/world/landmark-lots.js';

const folder=new URL('../assets/models/full-town/',import.meta.url);
const bytes=await readFile(new URL('overworld.glb',folder));
const navigation=JSON.parse(await readFile(new URL('navigation.json',folder)));
const manifest=JSON.parse(await readFile(new URL('street-clearance.json',folder)));
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});

test('Sakura and ramen lots hide the original street buildings without cutting the road',async()=>{
 const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 applyStreetClearance(scene,navigation,manifest);
 const before=scene.children.reduce((sum,m)=>sum+m.geometry.index.count/3,0);
 const removed=hideLandmarkLots(scene);
 assert.ok(removed>6000,'Both shop lots lose their original walls and roofs');
 assert.equal(scene.children.reduce((sum,m)=>sum+m.geometry.index.count/3,0),before-removed);
 const p=scene.children.find(m=>m.name==='Atlas02').geometry.attributes.position;
 const idx=scene.children.find(m=>m.name==='Atlas02').geometry.index;
 let leftover=0;
 for(let i=0;i<idx.count;i+=3){
  const a=idx.getX(i),b=idx.getX(i+1),c=idx.getX(i+2);
  const x=(p.getX(a)+p.getX(b)+p.getX(c))/3,y=(p.getY(a)+p.getY(b)+p.getY(c))/3,z=(p.getZ(a)+p.getZ(b)+p.getZ(c))/3;
  if(y>1.2&&LANDMARK_LOTS.some(lot=>x>=lot.minX&&x<=lot.maxX&&z>=lot.minZ&&z<=lot.maxZ))leftover++;
 }
 assert.ok(leftover<40,'Shop lots keep only leftover ground-level scraps');
 assert.equal(colliderInLandmarkLot({x:7.02,z:4.8,height:3}),true);
 assert.equal(colliderInLandmarkLot({x:6.18,z:1.5,height:3}),false,'Walking street in front of Sakura stays clear');
 assert.equal(colliderInLandmarkLot({x:-9.15,z:2.6,height:3}),false,'Walking street in front of ramen stays clear');
});

test('Landmark placements face the walking street at the canal quarter doors',()=>{
 const sakura=LANDMARK_LOTS.find(l=>l.id==='sakura'),ramen=LANDMARK_LOTS.find(l=>l.id==='ramen');
 assert.ok(Math.abs(sakura.yaw-Math.PI)<1e-6);assert.ok(Math.abs(ramen.yaw-Math.PI)<1e-6);
 assert.ok(sakura.scale.y>=.9,'Konbini keeps a full building height on the street');
 assert.ok(ramen.scale.y>=.9,'Ramen keeps a full building height on the street');
 const [sx,sz]=localToWorld(sakura.x,sakura.z,sakura.yaw,sakura.scale,0,.85);
 assert.ok(sz<sakura.z,'Sakura door is on the street side of the lot');
 assert.ok(sx>4&&sx<10);
 const [rx,rz]=localToWorld(ramen.x,ramen.z,ramen.yaw,ramen.scale,.65,4.7);
 assert.ok(rz<3.5,'Ramen door sits on the walking street');
 assert.ok(rx>-13&&rx<-6);
});
