/**
 * CPU-only full-game wiring smoke.
 * Run from the Johansson Town directory:
 *   npm test
 * Or set TOWN_REVIEW_ROOT to that directory.
 *
 * This substitutes only WebGLRenderer and DOM/browser APIs. The real vendored
 * Three.js scene graph, geometry, town, content, activities, people, room
 * construction, fixed simulation and save modules execute. It does not test
 * WebGL support, shader compilation, screenshots, sound playback or frame rate.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const root=resolve(new URL('..',import.meta.url).pathname);
const fixtures=await import(pathToFileURL(resolve(root,'tests/fixtures.mjs')).href);
const dataModule=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');

function assertFiniteTransforms(api,label){
  api.scene.updateMatrixWorld(true);
  api.camera.updateMatrixWorld(true);
  for(const object of [api.scene,api.camera])object.traverse(node=>{
    assert.ok(node.matrix.elements.every(Number.isFinite),label+': invalid local matrix on '+(node.name||node.type));
    assert.ok(node.matrixWorld.elements.every(Number.isFinite),label+': invalid world matrix on '+(node.name||node.type));
    assert.ok([node.position.x,node.position.y,node.position.z].every(Number.isFinite),label+': invalid position');
  });
  assert.ok(api.camera.projectionMatrix.elements.every(Number.isFinite),label+': invalid camera projection');
}

function quietDataUrlError(error){
  // Keep failed assertions readable: a Node stack can otherwise print the full
  // base64-encoded source of the imported game and obscure the actual failure.
  if(error?.stack)error.stack=error.stack.split('\n').map(line=>line.length>1200?line.slice(0,100)+' … '+line.slice(-80):line).join('\n');
  return error;
}

test('Complete supplied overworld preserves gameplay, reachable destinations and touch sprint',async()=>{
  try {
    fixtures.installDOM();
    globalThis.innerHeight=768;
    globalThis.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
    globalThis.addEventListener=()=>{};
    globalThis.requestAnimationFrame=()=>1; // No real browser render scheduling.
    globalThis.cancelAnimationFrame=()=>{};
    document.querySelectorAll=()=>[];
    window.devicePixelRatio=1;
    document.hidden=false;

    const gameUrl=pathToFileURL(resolve(root,'src/game.js'));
    const threeUrl=pathToFileURL(resolve(root,'vendor/three.module.js')).href;
    let source=await readFile(gameUrl,'utf8');
    const index=await readFile(resolve(root,'index.html'),'utf8');
    assert.doesNotMatch(index,/id="(?:view|camera)Button"/,'FPV-only UI must not expose camera switching');
    assert.doesNotMatch(source,/toggleCamera|KeyV|cameraMode/,'FPV-only runtime must not retain a third-person path');
    source=source.replace(/(from\s*['"])(\.[^'"]+)(['"])/g,(_,prefix,relative,suffix)=>prefix+new URL(relative,gameUrl).href+suffix);
    const rendererShim=dataModule(`
      export * from ${JSON.stringify(threeUrl)};
      export class WebGLRenderer {
        constructor({canvas}){this.domElement=canvas;this.capabilities={getMaxAnisotropy:()=>8};this.shadowMap={};this.dpr=1;this.info={render:{calls:0,triangles:0}};}
        setPixelRatio(value){this.dpr=value;}
        getPixelRatio(){return this.dpr;}
        setSize(width,height,updateStyle=true){this.width=width;this.height=height;if(updateStyle){this.domElement.style.width=width+'px';this.domElement.style.height=height+'px';}}
        render(scene,camera){scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);}
      }
    `);
    const threeImport="import * as THREE from '"+threeUrl+"';";
    assert.ok(source.includes(threeImport),'Expected canonical vendored Three.js import');
    source=source.replace(threeImport,"import * as THREE from '"+rendererShim+"';");
    source+='\nexport {scene,camera,world,player,SITES,activities,simulate,enterRoom,leaveRoom,runStabilityChecks,setTime,keys,characters,interaction,resizeRenderer,doInteract,moveTouch};\nexport const reviewRoom=()=>room;\nexport const reviewCurrentRoom=()=>current;\nexport const reviewSetMinutes=value=>minutes=value;export const reviewSetYaw=value=>yaw=value;\nexport const reviewRoomState=()=>({visible:room.visible,townVisible:town.visible,colliders:roomColliders.length});\nexport const reviewHiddenCutaways=()=>{let hidden=0;room.traverse(o=>{if(o.userData.cutaway&&o.layers.mask!==1)hidden++;});return hidden;};\n//# sourceURL=johansson-town-cpu-smoke.js\n';
    // Exercise the new geometry in the full game, including actual room exits.
    const originalFetch=globalThis.fetch;
    globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:2048,height:2048,close(){}});
    globalThis.fetch=async url=>String(url).startsWith('blob:')?originalFetch(url):new Response(await readFile(resolve(root,'assets',new URL(url).pathname.split('/assets/')[1])));
    const {preloadHarbourBlock}=await import('../src/world/harbour-block.js');
    assert.equal(await preloadHarbourBlock(),true,'Real harbour block preloaded');
    const {preloadSuppliedRooms,SUPPLIED_ROOM_LAYOUTS}=await import('../src/world/supplied-rooms.js');
    assert.deepEqual(await preloadSuppliedRooms(),[true,true,true],'All supplied rooms preloaded');
    const {preloadJapaneseTown}=await import('../src/world/japanese-town.js');assert.equal(await preloadJapaneseTown(),true);
    const {preloadPark}=await import('../src/world/park.js');assert.equal(await preloadPark(),true);
    const {preloadIzakaya}=await import('../src/world/izakaya.js');
    assert.deepEqual(await preloadIzakaya(),{ready:2,total:2},'New izakaya exterior and existing dining room preloaded');
    const {preloadFullTown}=await import('../src/world/full-town.js');
    assert.equal(await preloadFullTown(),true);
    const api=await import(dataModule(source));
    assert.equal(window.__JOHANSSON_STABILITY__?.ok,true,JSON.stringify(window.__JOHANSSON_STABILITY__));
    assert.equal(api.world.quality.completeSuppliedOverworld,true);
    assert.equal(api.world.quality.citySections,2);
    assert.equal(api.world.quality.removedStreetColliders,40);
    assert.equal(api.world.quality.canalPromenade,true);
    assert.equal(api.world.quality.streetLandmarks,true);
    assert.equal(api.world.quality.streetDoors,15);
    assert.ok(api.world.group.getObjectByName('canal-harbour-water'));
    assert.ok(api.world.group.getObjectByName('Sakura Konbini landmark'));
    assert.ok(api.world.group.getObjectByName('Sato Ramen restaurant'));
    const sakura=api.world.group.getObjectByName('Sakura Konbini landmark');
    assert.ok(Math.abs(sakura.position.x-7.02)<.2,'Konbini sits on the north side of the walking street');
    assert.ok(sakura.position.z<3.2,'Konbini faces the canal street, not the back lots');
    assert.ok(sakura.scale.y>.9,'Konbini is a full-height shop, not a squat kiosk');
    const ramenShop=api.world.group.getObjectByName('Sato Ramen restaurant');
    assert.ok(ramenShop.position.x<-8,'Ramen replaces the west street building');
    assert.ok(ramenShop.position.z<7,'Ramen faces the walking street');
    assert.ok(ramenShop.scale.y>.9,'Ramen is a full-height shop');
    const sections=api.world.group.children.filter(g=>g.name==='Original canal, bridge, buildings and streets');
    assert.equal(sections.length,2);assert.equal(sections[1].position.x,44);
    assert.equal(sections[0].children[0].geometry,sections[1].children[0].geometry,'Repeat shares cleaned GPU geometry');
    assert.equal(sections[0].children[0].material,sections[1].children[0].material,'Repeat shares textures/materials');
    assert.equal(api.world.people.length,22);
    assert.equal(api.world.homes.size,22);
    const {createNavigation}=await import('../src/people/navmesh.js');
    const {townBoundsBlocked,circleHitsRect}=await import('../physics.js');
    const blocked=(x,z,r=.32)=>townBoundsBlocked(x,z,r)||api.world.colliders.some(c=>circleHitsRect(x,z,r,c));
    const nav=createNavigation(blocked),spawn=api.player.position.clone();
    assert.deepEqual(spawn.toArray(),api.world.spawn);
    for(const site of api.SITES){
      assert.ok(nav.path(spawn,{x:site.door[0],z:site.door[2]}).length,'Door reachable: '+site.id);
      api.reviewSetMinutes(1002);api.enterRoom(site);
      assert.equal(api.reviewCurrentRoom()?.id,site.id);
      assertFiniteTransforms(api,'inside '+site.id);api.leaveRoom();
      assert.deepEqual(api.player.position.toArray(),site.exitPosition,'Safe exit: '+site.id);
      assert.equal(blocked(api.player.position.x,api.player.position.z),false);
    }
    const {STREET_DOORS,doorApproach}=await import('../src/world/full-town-state.js');
    for(const door of STREET_DOORS){
      const [x,z]=doorApproach(door);
      assert.equal(blocked(x,z),false,'Original entrance clear: '+door.id);
      assert.ok(nav.path(spawn,{x,z}).length,'Original entrance reachable: '+door.id);
    }
    for(const person of api.world.people)for(const tag of ['work','home','evening']){
      const p=person.profile[tag];assert.ok(nav.path(spawn,{x:p[0],z:p[1]}).length,person.profile.name+' '+tag+' reachable');
    }
    for(const [x,z] of [[35.7,-38],[0,-31],[-5,-24],[26,0],[39,0],[44,0],[59,0]])assert.ok(nav.path(spawn,{x,z}).length,'Park or port reachable '+[x,z]);
    for(let x=17;x<=27;x+=.1)for(const z of [-.75,0,.75])assert.equal(blocked(x,z),false,'Clear two-way city connection '+[x,z]);
    for(let x=0;x<=18;x+=.2)for(const z of [-20.75,-20,-19.25])assert.equal(blocked(x,z),false,'Clear quay lane '+[x,z]);
    assert.equal(blocked(44,-6),true,'Repeated canal water is not walkable');
    assert.equal(blocked(44,0),false,'Repeated bridge is walkable');
    assert.equal(blocked(0,-6),true,'Canal water is not walkable');
    assert.equal(blocked(0,0),false,'Original bridge is walkable');
    api.player.position.copy(spawn);api.reviewSetYaw(0);api.activities.close();
    api.moveTouch.id=81;api.moveTouch.cx=100;api.moveTouch.cy=400;api.moveTouch.x=100;api.moveTouch.y=352;
    api.simulate(.1);const walked=api.player.position.distanceTo(spawn);
    api.player.position.copy(spawn);document.querySelector('#run').onpointerdown({button:0,pointerType:'touch',preventDefault(){},stopPropagation(){}});api.simulate(.1);
    assert.ok(api.player.position.distanceTo(spawn)>walked*1.6,'Touch Run increases speed in the actual world');api.moveTouch.id=null;
    for(const m of [180,540,1002,1320]){api.reviewSetMinutes(m);for(let i=0;i<10;i++)api.simulate(.1);assertFiniteTransforms(api,'clock '+m);}
    assert.equal(api.world.isOpen(api.SITES.find(s=>s.id==='izakaya'),179),true);
    assert.equal(api.world.isOpen(api.SITES.find(s=>s.id==='izakaya'),180),false);
  }catch(error){throw quietDataUrlError(error);}
});

test('Packed asset retains the complete source geometry in four material batches',async()=>{
 const file=await readFile(resolve(root,'assets/models/full-town/overworld.glb'));
 const data=JSON.parse(file.subarray(20,20+file.readUInt32LE(12)));
 const manifest=JSON.parse(await readFile(resolve(root,'assets/models/full-town/manifest.json')));
 assert.equal(data.meshes.length,4);
 assert.equal(data.meshes.reduce((sum,m)=>sum+m.primitives.reduce((n,p)=>n+data.accessors[p.indices].count/3,0),0),96308);
 assert.equal(manifest.pieces,1230);assert.equal(manifest.completeScene,true);
 assert.equal(file.length,manifest.bytes);assert.ok(file.length<8_000_000);
 assert.ok(data.images.every(image=>image.bufferView!==undefined&&!image.uri),'All textures are embedded');
 const bounds=data.meshes.map(m=>data.accessors[m.primitives[0].attributes.POSITION]);
 assert.ok(Math.min(...bounds.map(b=>b.min[0]))<-21,'Original western extent retained');
 assert.ok(Math.max(...bounds.map(b=>b.max[0]))>18,'Original eastern extent retained');
 assert.ok(Math.max(...bounds.map(b=>b.max[2]))>15,'Original northern extent retained');
});
