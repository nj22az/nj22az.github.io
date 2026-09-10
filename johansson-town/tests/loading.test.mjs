import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {installDOM} from './fixtures.mjs';
import {preloadSuppliedRooms,suppliedRoomReady,SUPPLIED_ROOM_LAYOUTS,suppliedRoomBoundsBlocked} from '../src/world/supplied-rooms.js';
import {circleHitsRect} from '../physics.js';

// A texture-free triangle isolates the request/cache behaviour from large assets.
const positions=new Float32Array([0,0,0,1,0,0,0,1,0]);
const gltf={asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0}}]}],buffers:[{uri:'data:application/octet-stream;base64,'+Buffer.from(positions.buffer).toString('base64'),byteLength:36}],bufferViews:[{buffer:0,byteOffset:0,byteLength:36}],accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3',min:[0,0,0],max:[1,1,0]}]};

test('interiors load only on request, share in-flight work, cache success and retry failure',async()=>{
 installDOM();globalThis.self=globalThis;globalThis.ProgressEvent=class {constructor(type,init){this.type=type;Object.assign(this,init);}};
 const originalFetch=fetch,calls=[];let fail=true;
 globalThis.fetch=async(url,options)=>{
  if(String(url.url||url).startsWith('data:'))return originalFetch(url,options);
  calls.push(String(url));
  if(String(url).includes('crystal')&&fail)return new Response('',{status:503});
  return new Response(JSON.stringify(gltf));
 };
 try{
  assert.equal(suppliedRoomReady('yuri-home'),false);
  const results=await Promise.all([preloadSuppliedRooms(['yuri-home']),preloadSuppliedRooms(['yuri-home'])]);
  assert.deepEqual(results,[[true],[true]]);assert.equal(calls.length,1);assert.match(calls[0],/yuri-bedroom/);
  await preloadSuppliedRooms(['yuri-home']);assert.equal(calls.length,1);
  assert.equal(suppliedRoomReady('office'),false);
  assert.deepEqual(await preloadSuppliedRooms(['stepwise']),[false]);fail=false;
  assert.deepEqual(await preloadSuppliedRooms(['stepwise']),[true]);assert.equal(calls.length,3);
 }finally{globalThis.fetch=originalFetch;}
});

test('Yuri entry is clear of measured furniture and set back from the walls',async()=>{
 const layout=SUPPLIED_ROOM_LAYOUTS['yuri-home'],[x,,z]=layout.spawn;
 assert.equal(suppliedRoomBoundsBlocked(layout,x,z,.65),false);
 for(const c of layout.colliders)assert.equal(circleHitsRect(x,z,.32,c),false);
 const manifest=JSON.parse(await readFile(new URL('../assets/models/yuri-home/manifest.json',import.meta.url)));
 for(const [name,b] of Object.entries(manifest.furniture)){
  if(/^Wall|Celing|Ceiling|CFL|Scerting/.test(name)||b.min[1]>1.9||b.max[1]<.15)continue;
  const c={x:(b.min[0]+b.max[0])/2,z:(b.min[2]+b.max[2])/2,w:b.max[0]-b.min[0],d:b.max[2]-b.min[2]};
  assert.equal(circleHitsRect(x,z,.32,c),false,name+' must clear the entry');
 }
 assert.equal(layout.yaw,Math.PI/2);
});
