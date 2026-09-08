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

test('CPU-only game boots, passes startup checks and enters/exits every registered interior',async()=>{
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
    source=source.replace(/(from\s*['"])(\.[^'"]+)(['"])/g,(_,prefix,relative,suffix)=>prefix+new URL(relative,gameUrl).href+suffix);
    const rendererShim=dataModule(`
      export * from ${JSON.stringify(threeUrl)};
      export class WebGLRenderer {
        constructor(){this.capabilities={getMaxAnisotropy:()=>8};this.shadowMap={};this.dpr=1;this.info={render:{calls:0,triangles:0}};}
        setPixelRatio(value){this.dpr=value;}
        getPixelRatio(){return this.dpr;}
        setSize(){}
        render(scene,camera){scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);}
      }
    `);
    const threeImport="import * as THREE from '"+threeUrl+"';";
    assert.ok(source.includes(threeImport),'Expected canonical vendored Three.js import');
    source=source.replace(threeImport,"import * as THREE from '"+rendererShim+"';");
    source+='\nexport {scene,camera,world,player,SITES,activities,simulate,enterRoom,leaveRoom,runStabilityChecks,setTime,keys,characters,interaction};\nexport const reviewCurrentRoom=()=>current;\nexport const reviewRoomState=()=>({visible:room.visible,townVisible:town.visible,colliders:roomColliders.length});\n//# sourceURL=johansson-town-cpu-smoke.js\n';
    const api=await import(dataModule(source));

    assert.equal(window.__JOHANSSON_RUNNING__,true,'Game must reach running state');
    assert.equal(window.__JOHANSSON_CAMERA_MODE__,'first','Default camera remains first person');
    assert.equal(window.__JOHANSSON_STABILITY__?.ok,true,'Startup stability: '+JSON.stringify(window.__JOHANSSON_STABILITY__?.failures));
    api.simulate(1/60);
    api.setTime();
    assert.equal(api.scene.fog,null,'Scene fog is disabled');
    assertFiniteTransforms(api,'outdoor startup');

    const runningStart=api.player.position.clone();
    api.keys.KeyW=true;api.simulate(.1);const walked=api.player.position.distanceTo(runningStart);
    api.player.position.copy(runningStart);document.querySelector('#run').onclick();api.simulate(.1);
    const ran=api.player.position.distanceTo(runningStart);assert.ok(ran>walked*1.6&&ran<walked*1.9,'Touch Run increases movement speed');
    document.querySelector('#run').onclick();api.player.position.copy(runningStart);api.keys.ShiftRight=true;api.simulate(.1);
    assert.ok(api.player.position.distanceTo(runningStart)>walked*1.6,'Right Shift also runs');
    api.keys.ShiftRight=false;api.keys.KeyW=false;api.player.position.copy(runningStart);

    const startX=api.player.position.x;
    api.keys.KeyA=true;api.simulate(.1);api.keys.KeyA=false;assert.ok(api.player.position.x<startX,'A moves left in first person');
    const leftX=api.player.position.x;api.keys.KeyD=true;api.simulate(.1);api.keys.KeyD=false;assert.ok(api.player.position.x>leftX,'D moves right in first person');
    assert.equal(window.__JOHANSSON_JUMP__(),true);api.simulate(.1);assert.ok(api.player.position.y>0,'Jump rises above ground');for(let i=0;i<12;i++)api.simulate(.1);assert.equal(api.player.position.y,0,'Jump lands on shared ground');

    document.querySelector('#directoryButton').onclick();
    assert.ok(document.querySelector('#directoryGrid').children.length>api.SITES.length,'Directory includes town content');
    for(const site of api.SITES)assert.ok(document.querySelector('#directoryGrid').children.some(b=>b.dataset.id===site.id),'WebMCP travel target '+site.id);
    document.querySelector('#closeDirectory').onclick();
    document.querySelector('#notebookButton').onclick();
    assert.equal(document.querySelector('#activityTitle').textContent,'Field book');
    api.activities.close();

    let entered=0;
    for(const site of api.SITES){
      api.enterRoom(site);
      assert.equal(api.reviewCurrentRoom()?.id,site.id,'Interior entry: '+site.id);
      assert.deepEqual(api.reviewRoomState(),{visible:true,townVisible:false,colliders:api.reviewRoomState().colliders});
      assert.ok(api.reviewRoomState().colliders>0,'Interior has colliders: '+site.id);
      api.simulate(1/60);
      assertFiniteTransforms(api,'inside '+site.id);
      if(site.id==='market'){
        const rotation=api.camera.quaternion.clone(),aspect=api.camera.aspect;
        api.activities.action('resident','Yuri');
        assert.ok(api.camera.aspect<aspect,'Speech rail reserves horizontal scene space');
        const clerk=api.scene.children.find(o=>o.userData.name==='Yuri');assert.ok(clerk);
        const target=clerk.position.clone();target.y+=1.25;api.camera.updateMatrixWorld(true);target.project(api.camera);
        assert.ok(Math.abs(target.x)<.95&&Math.abs(target.y)<.95,'Cutaway keeps Yuri inside the unobstructed scene');
        api.activities.close();assert.equal(api.camera.aspect,aspect);
        assert.ok(api.camera.quaternion.angleTo(rotation)<1e-6,'Closing restores the previous camera direction');
      }
      assert.equal(api.scene.fog,null,'No interior fog');
      if(site.id==='market'){
        const gesture=api.characters.gesture;let welcomes=0;
        api.characters.gesture=entity=>{assert.equal(entity.userData.name,'Yuri');welcomes++;};
        try{
          api.interaction();assert.equal(welcomes,0,'No distant wave from the entrance');
          api.player.position.set(3.35,0,-4.5);api.interaction();assert.equal(welcomes,0,'Do not wave behind the camera');
          api.player.position.set(3.35,0,.7);api.interaction();assert.equal(welcomes,1,'Approaching the counter triggers a visible welcome');
          api.interaction();api.interaction();assert.equal(welcomes,1,'Only one proximity welcome per visit');
          assert.equal(api.activities.paused,false,'The greeting must not open a panel over Yuri');
        }finally{api.characters.gesture=gesture;}
      }
      api.leaveRoom();
      assert.equal(api.reviewCurrentRoom(),null,'Interior exit: '+site.id);
      assert.equal(api.reviewRoomState().townVisible,true);
      api.simulate(1/60);
      assertFiniteTransforms(api,'outside '+site.id);
      entered++;
    }
    assert.ok(entered>=8,'All existing interiors remain registered');
    api.runStabilityChecks();
    assert.equal(window.__JOHANSSON_STABILITY__.ok,true,'Post-interior stability: '+JSON.stringify(window.__JOHANSSON_STABILITY__.failures));
  }catch(error){throw quietDataUrlError(error);}
});
