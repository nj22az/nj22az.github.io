import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {installDOM} from './fixtures.mjs';
import {createShopGlass,prepareIzakayaGlass} from '../src/world/shop-glass.js';
import {DINING,restaurantPoint,restaurantApproach,izakayaPlot,IZAKAYA_DOOR} from '../src/world/dining-layout.js';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';
import {SAKURA_FRONT} from '../src/world/interiors/sakura-layout.js';
import {buildStorefront} from '../src/world/storefront.js';
import {buildStoreShell} from '../src/world/interiors/convenience.js';
import {RESIDENTS} from '../src/people/residents.js';
import {MAIN_ROAD} from '../src/world/main-road.js';
import {WEST_SHOPS} from '../src/world/west-shops.js';

function assertGlass(material){
 assert.equal(material.color.getHex(),0xffffff);
 assert.equal(material.transparent,true);
 assert.ok(material.opacity>0&&material.opacity<=.06);
 assert.equal(material.depthWrite,false);
 assert.equal(material.side,THREE.DoubleSide);
 assert.equal(material.toneMapped,false);
 assert.equal(material.map,null);
}

test('shop glass is neutral, translucent and does not hide the room',()=>{
 assertGlass(createShopGlass());
});

test('only the measured izakaya panes become glass; walls and neon keep their materials',async()=>{
 installDOM();
 const beforeSelf=globalThis.self,beforeBitmap=globalThis.createImageBitmap;
 globalThis.self=globalThis;
 globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 try{
  const bytes=await readFile(new URL('../assets/models/izakaya/minato-benmaher-exterior.glb',import.meta.url));
  const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  let building;scene.traverse(o=>{if(o.isMesh&&o.material.name==='BenMaher building PBR')building=o;});
  assert.ok(building);
  const originalMaterial=building.material,originalIndex=building.geometry.index.count;
  assert.equal(prepareIzakayaGlass(scene),10);
  const panes=scene.getObjectByName('Minato clear window panes');
  assert.ok(panes);assertGlass(panes.material);
  assert.equal(panes.geometry.index.count,30);
  assert.equal(building.geometry.index.count,originalIndex-30);
  assert.equal(building.material,originalMaterial);
  assert.equal(building.material.transparent,false);
  assert.equal(panes.castShadow,false);
  assert.equal(panes.receiveShadow,false);
  const count=scene.children.length;
  assert.equal(prepareIzakayaGlass(scene),10);
  assert.equal(scene.children.length,count,'Repeated preparation must not duplicate glass');
 }finally{globalThis.self=beforeSelf;globalThis.createImageBitmap=beforeBitmap;}
});

test('an unexpected izakaya asset is not made transparent',()=>{
 const scene=new THREE.Group();
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({name:'BenMaher building PBR'}));
 scene.add(mesh);const geometry=mesh.geometry;
 assert.equal(prepareIzakayaGlass(scene),0);
 assert.equal(mesh.geometry,geometry);
 assert.equal(scene.children.length,1);
 assert.equal(mesh.material.transparent,false);
});

test('Sakura keeps its full-size frontage and clear street and interior glazing',()=>{
 installDOM();
 const parent=new THREE.Group(),site={id:'market',side:-1,z:-28,title:'Sakura'};
 const facade=buildStorefront({parent,site,label(){},register(){},enter(){},placement:{x:-7.45,z:-28,yaw:Math.PI/2,scale:1}});
 assert.deepEqual(facade.scale.toArray(),[1,1,1]);
 const panes=facade.children.filter(o=>o.userData.clearWindow);
 assert.equal(panes.length,3);panes.forEach(o=>assertGlass(o.material));
 const room=new THREE.Group(),box=(size,pos,color,parent)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color}));m.position.set(...pos);parent.add(m);return m;};
 buildStoreShell({room,box,reg(){},exit(){}});
 const inside=room.children.filter(o=>o.userData.clearWindow);
 assert.equal(inside.length,3);inside.forEach(o=>assertGlass(o.material));
});

test('Minato stands beside Sakura with its door and NPC approach facing the road',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../assets/models/izakaya/benmaher-manifest.json',import.meta.url)));
 const northWallOfSakura=-28+10.5/2;
 const southEdgeOfMinato=Math.min(...[manifest.bounds.min[0],manifest.bounds.max[0]].flatMap(x=>[manifest.bounds.min[2],manifest.bounds.max[2]].map(z=>restaurantPoint('izakaya',x,z)[1])));
 assert.ok(southEdgeOfMinato>northWallOfSakura,'Keep a gap between the buildings');
 assert.ok(southEdgeOfMinato-northWallOfSakura<1,'Put Minato directly beside Sakura');
 assert.equal(DINING.izakayaYaw,Math.PI/2);
 const approach=restaurantApproach('izakaya');
 assert.ok(approach[0]>DINING.izakayaDoor[0]);
 assert.equal(approach[1],DINING.izakayaDoor[1]);
 assert.deepEqual(RESIDENTS.find(p=>p.name==='Nao').work,IZAKAYA_DOOR);
 assert.deepEqual(RESIDENTS.find(p=>p.name==='Thuan').evening,approach);
 assert.deepEqual(restaurantPoint('ramen',2,3),[DINING.ramenX-3,DINING.ramenZ+2]);
});

test('on the peninsula Minato stands next to the bookshop, clear of the konbini',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../assets/models/izakaya/benmaher-manifest.json',import.meta.url)));
 const corners=key=>[manifest.bounds.min[0],manifest.bounds.max[0]]
  .flatMap(x=>[manifest.bounds.min[2],manifest.bounds.max[2]].map(z=>restaurantPoint('izakaya',x,z)[key]));
 try{
  configureTownMode(TOWN_MODES.PENINSULA);izakayaPlot();
  const northGable=Math.max(...corners(1)),southGable=Math.min(...corners(1)),eastFace=Math.max(...corners(0));
  // The bookshop it was asked to be next to.
  const books=WEST_SHOPS.frontrow,booksSouthWall=books.z-books.width/2;
  assert.ok(northGable<booksSouthWall,'Minato is inside the bookshop');
  assert.ok(booksSouthWall-northGable<1,'Minato is not next to the bookshop');
  // and clear of the fourteen-metre konbini it used to stand inside.
  assert.ok(southGable>-26.8+SAKURA_FRONT.width/2,'Minato is inside the konbini');
  // and still set back off the footway rather than standing on it.
  assert.ok(eastFace<MAIN_ROAD.pavementWest,'Minato stands on the pavement');

  // Everything that holds the door holds the same array, so it moved with the plot.
  assert.equal(IZAKAYA_DOOR[1],izakayaPlot().z);
  assert.deepEqual(RESIDENTS.find(p=>p.name==='Nao').work,IZAKAYA_DOOR);
  assert.deepEqual(RESIDENTS.find(p=>p.name==='Thuan').evening,restaurantApproach('izakaya'));
 }finally{configureTownMode(TOWN_MODES.LEGACY);izakayaPlot();}
 // and back on the old street it is where it always was.
 assert.equal(izakayaPlot().z,DINING.izakayaZ);
 assert.equal(IZAKAYA_DOOR[1],DINING.izakayaDoor[1]);
});
