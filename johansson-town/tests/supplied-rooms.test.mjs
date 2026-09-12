import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {preloadSuppliedRooms,buildSuppliedRoom,buildRamenRestaurant,SUPPLIED_ROOM_LAYOUTS,suppliedRoomBoundsBlocked} from '../src/world/supplied-rooms.js?snappy=1';
import {circleHitsRect,townBoundsBlocked,sweepFraction} from '../physics.js?snappy=1';

function reachableFloor(layout){
  const radius=.28,step=.1,blocked=(x,z)=>suppliedRoomBoundsBlocked(layout,x,z,radius)||layout.colliders.some(c=>circleHitsRect(x,z,radius,c));
  const origin={x:layout.spawn[0],z:layout.spawn[2]},queue=[[0,0]],seen=new Set(['0,0']),points=[];
  assert.equal(blocked(origin.x,origin.z),false,'Entry spawn is clear');
  for(let head=0;head<queue.length;head++){
    const [i,j]=queue[head],x=origin.x+i*step,z=origin.z+j*step;points.push({x,z});
    for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const ni=i+di,nj=j+dj,key=ni+','+nj;if(seen.has(key))continue;seen.add(key);
      if(!blocked(origin.x+ni*step,origin.z+nj*step))queue.push([ni,nj]);
    }
  }
  return points;
}

test('supplied models retain textures, correct material support and reachable room interactions',async()=>{
  installDOM();
  const originalFetch=globalThis.fetch,originalBitmap=globalThis.createImageBitmap,originalSelf=globalThis.self;
  globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:128,height:128,close(){}});
  globalThis.fetch=async url=>String(url).startsWith('blob:')?originalFetch(url):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
  try{
    assert.deepEqual(await preloadSuppliedRooms(),[true,true,true,true,true]);
    for(const id of ['office']){
      const folder=new URL('../assets/models/'+id+'/',import.meta.url);
      const manifest=JSON.parse(await readFile(new URL('manifest.json',folder),'utf8'));
      const bytes=await readFile(new URL(manifest.file,folder));
      assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sha256);
      const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
      assert.ok(!gltf.extensionsRequired?.includes('KHR_materials_pbrSpecularGlossiness'),'No unsupported legacy required material extension');
      assert.ok(gltf.materials.every(m=>!m.extensions?.KHR_materials_pbrSpecularGlossiness));
      assert.equal(gltf.images.length,id==='office'?25:56,'Every embedded source texture retained');
      assert.ok(gltf.images.every(i=>Number.isInteger(i.bufferView)&&!i.uri),'No external model dependencies');
      assert.equal(manifest.triangles,id==='office'?2991:7765);
      assert.equal(manifest.removedDuplicatePrimitives,id==='office'?40:0);
      if(id==='office'){
        assert.ok(gltf.materials.some(m=>m.pbrMetallicRoughness.baseColorTexture?.extensions?.KHR_texture_transform?.scale[0]>10),'Office floor tiling preserved');
        assert.ok(gltf.materials.some(m=>m.alphaMode==='BLEND'&&!m.pbrMetallicRoughness.baseColorTexture),'Baked vertex shadow alpha repaired');
      }
      const room=new THREE.Group(),actions=[],colliders=[],calls=[];let exits=0;
      const layout=buildSuppliedRoom({site:{id,line:'14 September 1988'},room,
        reg:(object,label,fn,inside)=>actions.push({object,label,fn,inside}),
        collider:(x,z,w,d,height)=>colliders.push({x,z,w,d,height}),action:(...args)=>calls.push(args),exit:()=>exits++});
      assert.equal(layout,SUPPLIED_ROOM_LAYOUTS[id]);assert.deepEqual(colliders,layout.colliders);
      const model=room.children.find(o=>o.userData.sharedAsset);assert.ok(model);
      const bounds=new THREE.Box3().setFromObject(model);
      assert.ok(bounds.min.y>-.006&&bounds.min.y<.006,'Floor grounded in metres');
      assert.ok(bounds.max.y>2.65&&bounds.max.y<3.2,'Ceiling at the intended human scale');
      let meshCount=0;
      model.traverse(o=>{if(!o.isMesh)return;meshCount++;assert.ok(o.material.isMeshBasicMaterial,'Baked lighting retained');if(o.material.transparent)assert.equal(o.material.depthWrite,false);});
      assert.equal(meshCount,manifest.draws);
      const points=reachableFloor(layout);assert.ok(points.length>500,'Connected usable floor area');
      for(const {object,label,fn,inside} of actions){
        assert.equal(inside,true);
        assert.ok(points.some(p=>Math.hypot(p.x-object.position.x,p.z-object.position.z)<1.65),'Walk close enough to use '+id+': '+label);
        fn();
      }
      assert.equal(exits,1);assert.ok(calls.some(c=>c[0]==='read'));assert.ok(calls.some(c=>c[0]==='seat'));
      if(id==='ramen')assert.ok(calls.some(c=>c[0]==='ramen'&&c[1]==='Sato Ramen'));
      const blocked=(x,z)=>suppliedRoomBoundsBlocked(layout,x,z,.28)||layout.colliders.some(c=>circleHitsRect(x,z,.28,c));
      for(const pos of id==='office'?[[0,0],[-1.5,-1.05],[1.7,-1.15]]:[[1.5,1.7],[1.5,-1.36],[1,-2.65]]){
        assert.equal(blocked(...pos),false,'Clear main aisle at '+pos);
        assert.ok(points.some(p=>Math.hypot(p.x-pos[0],p.z-pos[1])<.15),'Main aisle connects to entry');
      }
    }
    {
      const id='yuri-home',folder=new URL('../assets/models/yuri-home/',import.meta.url);
      const manifest=JSON.parse(await readFile(new URL('manifest.json',folder),'utf8'));
      const bytes=await readFile(new URL(manifest.file,folder));
      assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sha256);
      const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
      assert.equal(gltf.images.length,67);assert.equal(manifest.triangles,11813);assert.equal(manifest.draws,78);
      assert.ok(gltf.images.every(i=>Number.isInteger(i.bufferView)&&!i.uri));
      assert.ok(gltf.materials.every(m=>m.extensions?.KHR_materials_unlit));
      const room=new THREE.Group(),actions=[],colliders=[],calls=[];let exits=0;
      const layout=buildSuppliedRoom({site:{id,line:'Yuri’s room'},room,
        reg:(object,label,fn,inside)=>actions.push({object,label,fn,inside}),
        collider:(x,z,w,d,height)=>colliders.push({x,z,w,d,height}),action:(...args)=>calls.push(args),exit:()=>exits++});
      assert.equal(layout,SUPPLIED_ROOM_LAYOUTS[id]);assert.deepEqual(colliders,layout.colliders);
      const model=room.children.find(o=>o.userData.sharedAsset);assert.ok(model);
      const bounds=new THREE.Box3().setFromObject(model);
      assert.ok(bounds.min.y>-.87&&bounds.min.y<0,'Exterior foundation stays below the playable floor');
      assert.ok(bounds.max.y>2.65&&bounds.max.y<3.2,'Ceiling at the intended human scale');
      let meshCount=0;
      model.traverse(o=>{if(!o.isMesh)return;meshCount++;assert.ok(o.material.isMeshBasicMaterial,'Baked lighting retained');});
      assert.equal(meshCount,manifest.draws);
      const points=reachableFloor(layout);assert.ok(points.length>500,'Connected usable floor area');
      for(const {object,label,fn,inside} of actions){
        assert.equal(inside,true);
        assert.ok(points.some(p=>Math.hypot(p.x-object.position.x,p.z-object.position.z)<1.65),'Walk close enough to use '+id+': '+label);
        fn();
      }
      assert.equal(exits,1);assert.ok(calls.some(c=>c[0]==='read'));assert.ok(calls.some(c=>c[0]==='seat'));
      const blocked=(x,z)=>suppliedRoomBoundsBlocked(layout,x,z,.28)||layout.colliders.some(c=>circleHitsRect(x,z,.28,c));
      assert.equal(blocked(-.45,.4),false,'Apartment doorway spawn is clear');
      assert.equal(blocked(-1,2.2),false,'Sofa approach is clear');
      for(const [x,z] of [[-1.3,-3.5],[-4,-.35],[-1,2.2]])assert.ok(points.some(p=>Math.hypot(p.x-x,p.z-z)<.2),'Apartment room connects to entry: '+[x,z]);
      assert.equal(blocked(1.5,-1.5),true,'Neighbour corridor remains outside the apartment');
    }
    const world={group:new THREE.Group(),colliders:[]},sites=[],entries=[];
    const site=buildRamenRestaurant(world,{sites,register:(o,label,fn)=>entries.push({o,label,fn}),enter:s=>assert.equal(s.id,'ramen')});
    assert.equal(sites.length,2);assert.equal(entries.length,2);entries[0].fn();
    const blocked=(x,z)=>townBoundsBlocked(x,z,.28)||world.colliders.some(c=>circleHitsRect(x,z,.28,c));
    for(const z of [site.door[2],site.door[2]+.6,site.door[2]+.7])assert.equal(blocked(site.door[0],z),false,'Restaurant exit on walkable street');
    assert.equal(sweepFraction({x:24,z:18},{x:site.door[0],z:site.door[2]},blocked),1,'Existing east-lane route reaches the restaurant');
    assert.ok(Math.hypot(site.door[0]-entries[0].o.position.x,site.door[2]-entries[0].o.position.z)<1,'Door prompt at the supplied entrance');
    const exterior=world.group.getObjectByName('Supplied ramen-exterior');
    assert.ok(exterior,'The Inakaya exterior replaces the old restaurant');
    const neighbour=sites.find(s=>s.id==='crystal-room');
    assert.ok(neighbour&&Math.abs(neighbour.door[0]-site.door[0])<4,'Crystal room is in the adjoining building');
    assert.equal(blocked(neighbour.door[0],neighbour.door[2]),false,'Neighbour exit is clear');
    assert.equal(sweepFraction({x:21.2,z:18},{x:neighbour.door[0],z:neighbour.door[2]},blocked),1);
    const manifest=JSON.parse(await readFile(new URL('../assets/models/ramen/inakaya-manifest.json',import.meta.url)));
    const bytes=await readFile(new URL('../assets/models/ramen/'+manifest.file,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sha256);
    assert.ok(bytes.length<manifest.sourceBytes*.5,'Exterior transfer size is reduced');
    world.group.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(exterior);
    assert.ok(Math.abs(bounds.min.y)<.01,'Exterior is grounded');
    assert.ok(bounds.min.x>19.5&&bounds.max.z<14,'Source paving and props stay off the lanes');
    let draws=0;exterior.traverse(o=>{if(o.isMesh)draws++;});assert.equal(draws,manifest.draws);
    const interior=new THREE.Group();
    buildSuppliedRoom({site:{id:'ramen'},room:interior,reg(){},collider(){},action(){},exit(){}});
    assert.ok(interior.getObjectByName('Supplied ramen'),'Inakaya playable interior is installed');

  }finally{globalThis.fetch=originalFetch;globalThis.createImageBitmap=originalBitmap;globalThis.self=originalSelf;}
});

test('missing supplied models preserve the existing procedural buildings and rooms',async()=>{
  const mod=await import('../src/world/supplied-rooms.js?load-failure=1');
  const originalFetch=globalThis.fetch,originalWarn=console.warn;globalThis.fetch=async()=>new Response('',{status:404});console.warn=()=>{};
  try{
    assert.deepEqual(await mod.preloadSuppliedRooms(),[false,false,false,false,false]);
    assert.equal(mod.buildRamenRestaurant({},{},{x:0,z:0}),false);
    for(const id of ['office','ramen'])assert.equal(mod.buildSuppliedRoom({site:{id},room:new THREE.Group()}),null);
  }finally{globalThis.fetch=originalFetch;console.warn=originalWarn;}
});

test('crystal room is a connected surprise beside Sato Ramen with a reliable exit',async()=>{
 installDOM();const originalFetch=fetch;globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:128,height:128,close(){}});
 globalThis.fetch=async url=>String(url).startsWith('blob:')?originalFetch(url):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
 try{
  const module=await import('../src/world/supplied-rooms.js?snappy=1');await module.preloadSuppliedRooms();
  const room=new THREE.Group(),actions=[];let left=false;
  const layout=module.buildSuppliedRoom({site:{id:'crystal-room'},room,reg:(o,label,fn)=>actions.push({o,label,fn}),collider(){},action(){},exit:()=>left=true});
  const points=reachableFloor(layout);assert.ok(points.length>500);
  for(const a of actions)assert.ok(points.some(p=>Math.hypot(p.x-a.o.position.x,p.z-a.o.position.z)<1.65),a.label+' reachable');
  actions.find(a=>a.label==='Exit to street').fn();assert.equal(left,true);
  let meshes=0;room.traverse(o=>{if(o.isMesh){meshes++;assert.ok(o.material.map,'Crystal illustration retained');}});assert.equal(meshes,16);
 }finally{globalThis.fetch=originalFetch;}
});
