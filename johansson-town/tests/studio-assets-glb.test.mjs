import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {registerStudioAsset,resetStudioAssets,restoreNames,STUDIO_ASSETS_KEY,travelAlong} from '../src/world/studio-assets.js';
import {buildOnsenInterior} from '../src/world/interiors/onsen.js';
import {stageScenario,chairTimer} from '../src/world/interiors/onsen-electrics.js';
import {ONSEN_PROPS} from '../src/world/interiors/onsen-props.js';

// Studio's massage chair as World loads it: the real published GLB (assets/catalog/massage-chair/model.glb), with its
// label textures left out because node cannot decode PNGs. Built into the onsen with Studio's assets switched on, it
// must work the way the old chair did (tests/onsen-fix.test.mjs, onsen-story-props.test.mjs) in its own geometry.
async function loadChair(){
 const glb=readFileSync(new URL('../assets/catalog/massage-chair/model.glb',import.meta.url));
 const jsonLength=glb.readUInt32LE(12),json=JSON.parse(glb.subarray(20,20+jsonLength).toString()),bin=glb.subarray(20+jsonLength);
 delete json.images;delete json.textures;delete json.samplers;
 for(const m of json.materials||[])if(m.pbrMetallicRoughness)delete m.pbrMetallicRoughness.baseColorTexture;
 let text=Buffer.from(JSON.stringify(json));text=Buffer.concat([text,Buffer.alloc((4-text.length%4)%4,0x20)]);
 const head=Buffer.alloc(12);head.write('glTF',0);head.writeUInt32LE(2,4);head.writeUInt32LE(12+8+text.length+bin.length,8);
 const chunk=Buffer.alloc(8);chunk.writeUInt32LE(text.length,0);chunk.write('JSON',4);
 const out=Buffer.concat([head,chunk,text,bin]);
 const {scene}=await new GLTFLoader().parseAsync(out.buffer.slice(out.byteOffset,out.byteOffset+out.length),'');
 return {card:JSON.parse(readFileSync(new URL('../assets/catalog/massage-chair/asset.json',import.meta.url))),scene:restoreNames(scene)};
}
const asset=await loadChair();
const switchedOn=fn=>{const old=globalThis.localStorage;globalThis.localStorage={getItem:k=>k===STUDIO_ASSETS_KEY?'on':null};
 resetStudioAssets();registerStudioAsset('massage-chair',asset);try{return fn();}finally{globalThis.localStorage=old;resetStudioAssets();}};
const build=()=>{const room=new THREE.Group();const layout=buildOnsenInterior({room,reg(){},action(){},exit(){}});room.updateMatrixWorld(true);return {room,layout};};
const ticks=(layout,seconds,dt=1/30)=>{for(let t=0;t<seconds-1e-9;t+=dt)layout.tick(dt,1170);};
const worldBox=o=>{o.updateWorldMatrix(true,true);return new THREE.Box3().setFromObject(o);};

test('the real chair loads with Studio’s names, and every part World looks up is a mesh',()=>switchedOn(()=>{
 const {room}=build(),chair=room.getObjectByName(asset.card.name);
 assert.ok(chair?.userData.studioAsset,'Studio’s chair in the onsen');
 for(const p of asset.card.parts)if(p.name!==asset.card.name)assert.ok(room.getObjectByName(p.name)?.isMesh,p.name);
 assert.equal(room.getObjectByName('Massage chair arm'),undefined,'no old boxes');
}));

test('running, the chair lights its lamp and kneads; the power gone, the lamp is dark and the rollers stop',()=>switchedOn(()=>{
 stageScenario('last-straw');const {room,layout}=build();ticks(layout,2);
 const look=layout.power.appearance('massage-chair');
 assert.equal(look.lamp,true,'the lamp is lit while it runs');assert.equal(chairTimer().lit,true);
 const rollers=room.getObjectByName('Massage chair rollers (part)'),track=asset.card.anchors['roller-track'];
 const chairFrame=room.getObjectByName(asset.card.name);
 const inChair=()=>{const b=worldBox(rollers);return b.applyMatrix4(chairFrame.matrixWorld.clone().invert());};
 let prev=rollers.position.y,moved=0;
 for(let i=0;i<9*30;i++){ticks(layout,1/30);const b=inChair(),step=Math.abs(rollers.position.y-prev);prev=rollers.position.y;moved=Math.max(moved,step);
  assert.ok(b.max.y<=track.max[1]-.0099&&b.min.y>=track.min[1]+.0099,`rollers inside the track at frame ${i}: ${b.min.y.toFixed(3)}..${b.max.y.toFixed(3)}`);}
 assert.ok(moved>0&&moved<.02,'they travel gently: '+moved.toFixed(4)+' m a frame at most');
 const half=(worldBox(rollers).max.y-worldBox(rollers).min.y)/2;assert.ok(travelAlong(track,half).amplitude>.15,'and they travel most of the back');
 stageScenario('blackout');ticks(layout,1/30);const stopped=rollers.position.y;ticks(layout,1);
 assert.equal(layout.power.appearance('massage-chair').lamp,false,'dark at once');assert.equal(rollers.position.y,stopped,'they stop where they are');
 layout.dispose?.();
}));

test('Fujita’s coffee milks stand on the chair’s right arm top, inside its edges',()=>switchedOn(()=>{
 const {room,layout}=build();layout.props.stage({offering:'full'});
 const chair=room.getObjectByName(asset.card.name),toChair=chair.matrixWorld.clone().invert();
 for(let i=1;i<=3;i++){
  const b=worldBox(room.getObjectByName(`Coffee milk ${i} bottle`)).applyMatrix4(toChair);
  assert.ok(Math.abs(b.min.y-ONSEN_PROPS.offering.top)<.002,`milk ${i} stands on the arm top: ${b.min.y.toFixed(4)}`);
  assert.ok(b.min.x>=-.435&&b.max.x<=-.375,`milk ${i} within the arm pad’s width (x −0.435..−0.375): ${b.min.x.toFixed(3)}..${b.max.x.toFixed(3)}`);
 }
 layout.props.stage({offering:'none'});
}));
