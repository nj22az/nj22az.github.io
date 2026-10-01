/**
 * CPU-only ramen counter integration regression.
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

test('Ramen counter preserves its table position and the real simulation delivers once',async()=>{
  try {
    fixtures.installDOM();
    // The game starts at one of several openings (world/openings.js); this test rides from the Sakura bench.
    globalThis.location.search='?spawn=sakura-bench';
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
    source=source.replace(/(from\s*['"])(\.[^'"]+)(['"])/g,(_,prefix,relative,suffix)=>prefix+new URL(relative,gameUrl).href+suffix);
    const rendererShim=dataModule(`
      export * from ${JSON.stringify(threeUrl)};
      export class WebGLRenderer {
        constructor({canvas}){this.domElement=canvas;this.capabilities={getMaxAnisotropy:()=>8,isWebGL2:true};this.shadowMap={};this.dpr=1;this.width=1;this.height=1;this.target=null;this.autoClear=true;this.info={render:{calls:0,triangles:0}};}
        setPixelRatio(value){this.dpr=value;}
        getPixelRatio(){return this.dpr;}
        setSize(width,height,updateStyle=true){this.width=width;this.height=height;if(updateStyle){this.domElement.style.width=width+'px';this.domElement.style.height=height+'px';}}
        render(scene,camera){scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);}
        // The ink pipeline draws the town into an offscreen target before grading it,
        // so the double has to answer the render-target half of the renderer too.
        getDrawingBufferSize(target){target.set(this.width*this.dpr,this.height*this.dpr);return target;}
        getRenderTarget(){return this.target;}
        setRenderTarget(target){this.target=target;}
        clear(){}
        clearDepth(){}
      }
    `);
    const threeImport="import * as THREE from '"+threeUrl+"';";
    assert.ok(source.includes(threeImport),'Expected canonical vendored Three.js import');
    source=source.replace(threeImport,"import * as THREE from '"+rendererShim+"';");
    source+='\nexport {scene,camera,world,player,SITES,activities,simulate,advanceAbsentTown,catchUpFrame,enterRoom,leaveRoom,runStabilityChecks,setTime,keys,characters,sitOnSeat,standUp,interaction,resizeRenderer,doInteract,touchSticks,residentBlocked,occupiedByPerson,startBicycleRide,stopBicycleRide,updateContextControls};\nexport const reviewRamen=()=>ramenPlayerService;export const reviewSeat=()=>parkSeat;export const reviewRoom=()=>room;export const reviewShop=()=>sakuraShop;export const reviewSetActive=o=>active={...o.userData.hit,object:o};\nexport const reviewCurrentRoom=()=>current;\nexport const reviewSetMinutes=value=>{followRealClock=false;minutes=value;};export const reviewSetYaw=value=>yaw=value;\nexport const reviewRoomState=()=>({visible:room.visible,townVisible:town.visible,colliders:roomColliders.length});\nexport const reviewHiddenCutaways=()=>{let hidden=0;room.traverse(o=>{if(o.userData.cutaway&&o.layers.mask!==1)hidden++;});return hidden;};\n//# sourceURL=johansson-town-cpu-smoke.js\n';
    // Load the real room assets before exercising the counter through game wiring.
    const originalFetch=globalThis.fetch;
    globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:2048,height:2048,close(){}});
    globalThis.fetch=async url=>String(url).startsWith('blob:')?originalFetch(url):new Response(await readFile(resolve(root,'assets',new URL(url).pathname.split('/assets/')[1])));
    const {preloadSuppliedRooms,SUPPLIED_ROOM_LAYOUTS}=await import('../src/world/supplied-rooms.js?snappy=1');
    assert.deepEqual(await preloadSuppliedRooms(),[true,true,true,true,true],'All supplied rooms preloaded');
    const {preloadPark}=await import('../src/world/park.js?snappy=1');assert.equal(await preloadPark(),true);
    const {preloadIzakaya}=await import('../src/world/izakaya.js?snappy=1');
    assert.deepEqual(await preloadIzakaya(),{ready:2,total:2},'New izakaya exterior and existing dining room preloaded');
    const {preloadSakuraBench}=await import('../src/world/sakura-bench.js');
    assert.equal(await preloadSakuraBench(),true,'Sakura viewing bench preloaded');
    const api=await import(dataModule(source));
    api.reviewSetMinutes(720);await api.enterRoom(api.SITES.find(s=>s.id==='ramen'));
    assert.equal(api.sitOnSeat('Sit at the ramen counter'),true);
    const service=api.reviewRamen(),seat=api.reviewSeat();
    const originalSeat=api.reviewRoom().getObjectByName('Sit at the ramen counter').userData.seat;
    assert.deepEqual(seat.table,originalSeat.table,'the seated player retains the counter delivery position');
    const startingYen=api.activities.state.yen;
    assert.equal(service.request('shoyu'),true);
    for(let i=0;i<240;i++)api.simulate(1/60);
    assert.equal(service.order.delivered,false);assert.equal(api.activities.state.yen,startingYen);
    for(let i=0;i<61;i++)api.simulate(1/60);
    assert.equal(service.order.delivered,true);assert.equal(api.activities.state.yen,startingYen-450);
    const bowl=api.reviewRoom().children.find(o=>o.visible&&o.position.toArray().every((v,i)=>v===seat.table[i]));
    assert.ok(bowl,'bowl is on the counter surface');
    for(let i=0;i<360;i++)api.simulate(1/60);
    assert.equal(api.activities.state.yen,startingYen-450);assert.equal(service.eat(),true);assert.equal(service.eat(),false);assert.equal(bowl.visible,false);
    assert.equal(service.request('shoyu'),true);api.standUp();for(let i=0;i<360;i++)api.simulate(1/60);
    assert.equal(service.order,null);assert.equal(api.activities.state.yen,startingYen-450);
    api.leaveRoom();
    globalThis.fetch=originalFetch;
  }catch(error){throw quietDataUrlError(error);}
});
