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
    source+='\nexport {scene,camera,world,player,SITES,activities,simulate,enterRoom,leaveRoom,runStabilityChecks,setTime,keys,characters,interaction,resizeRenderer,doInteract};\nexport const reviewRoom=()=>room;\nexport const reviewCurrentRoom=()=>current;\nexport const reviewSetMinutes=value=>minutes=value;export const reviewSetYaw=value=>yaw=value;\nexport const reviewRoomState=()=>({visible:room.visible,townVisible:town.visible,colliders:roomColliders.length});\nexport const reviewHiddenCutaways=()=>{let hidden=0;room.traverse(o=>{if(o.userData.cutaway&&o.layers.mask!==1)hidden++;});return hidden;};\n//# sourceURL=johansson-town-cpu-smoke.js\n';
    // Exercise the new geometry in the full game, including actual room exits.
    const originalFetch=globalThis.fetch;
    globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:2048,height:2048,close(){}});
    globalThis.fetch=async url=>String(url).startsWith('blob:')?originalFetch(url):new Response(await readFile(resolve(root,'assets',new URL(url).pathname.split('/assets/')[1])));
    const {preloadHarbourBlock}=await import('../src/world/harbour-block.js');
    assert.equal(await preloadHarbourBlock(),true,'Real harbour block preloaded');
    const {preloadSuppliedRooms,SUPPLIED_ROOM_LAYOUTS}=await import('../src/world/supplied-rooms.js');
    assert.deepEqual(await preloadSuppliedRooms(),[true,true,true],'All supplied rooms preloaded');
    const {preloadPark}=await import('../src/world/park.js');assert.equal(await preloadPark(),true);
    const {preloadIzakaya}=await import('../src/world/izakaya.js');
    assert.deepEqual(await preloadIzakaya(),{ready:2,total:2},'New izakaya exterior and existing dining room preloaded');
    const api=await import(dataModule(source));
    assert.equal(api.world.harbourShops.length,4);

    assert.equal(window.__JOHANSSON_RUNNING__,true,'Game must reach running state');
    assert.equal(window.__JOHANSSON_CAMERA_MODE__,'first','Exploration is always first person');
    assert.equal(window.__JOHANSSON_STABILITY__?.ok,true,'Startup stability: '+JSON.stringify(window.__JOHANSSON_STABILITY__?.failures));
    api.simulate(1/60);
    api.setTime();
    assert.equal(api.scene.fog,null,'Scene fog is disabled');
    assertFiniteTransforms(api,'outdoor startup');

    assert.equal(api.player.visible,false);assert.equal(api.player.children.length,0,'No protagonist mesh is attached to the controller');
    assert.equal(api.player.userData.visualSource,'First-person controller');assert.equal(api.camera.fov,65);
    assert.equal('cameraMode' in api.activities.state,false,'Legacy camera preference is discarded');
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
    const find=id=>document.querySelector('#directoryGrid').children.find(b=>b.dataset.id===id);
    const walkingStart=api.player.position.clone();
    for(const site of api.SITES){document.querySelector('#directoryButton').onclick();assert.equal(find(site.id).dataset.travel,'locked');find(site.id).onclick();assert.deepEqual(api.player.position.toArray(),walkingStart.toArray(),'Locked destination only marks directions: '+site.id);}
    assert.match(document.querySelector('#waypoint').textContent,/Corner Tea House|Minato Izakaya/);
    api.activities.state.quest=3;document.querySelector('#directoryButton').onclick();find('izakaya').onclick();assert.deepEqual(api.player.position.toArray(),walkingStart.toArray(),'One completed quest does not unlock shortcuts');
    api.activities.state.kenjiEscort='done';api.activities.save();document.querySelector('#directoryButton').onclick();
    const shortcut=find('izakaya');assert.equal(shortcut.dataset.travel,'ready');shortcut.onclick();
    assert.equal(api.player.position.x,24);assert.equal(api.player.position.z,18.8);
    api.simulate(1/60);api.interaction();assert.match(document.querySelector('#prompt').textContent,/Minato Izakaya/,'Unlocked shortcut faces the usable entrance');
    document.querySelector('#directoryButton').onclick();find('tea-house').onclick();assert.equal(api.player.position.x,46);assert.equal(api.player.position.z,62.7);
    api.simulate(1/60);api.interaction();assert.match(document.querySelector('#prompt').textContent,/Corner Tea House/);
    const minato=api.SITES.find(s=>s.id==='izakaya');assert.ok(Number.isFinite(minato.x)&&Number.isFinite(minato.z),'Izakaya appears on the map');
    document.querySelector('#notebookButton').onclick();
    assert.equal(document.querySelector('#activityTitle').textContent,'Field book');
    api.activities.close();

    let entered=0;
    for(const site of api.SITES){
      api.enterRoom(site);
      assert.equal(api.reviewCurrentRoom()?.id,site.id,'Interior entry: '+site.id);
      if(SUPPLIED_ROOM_LAYOUTS[site.id]){
        assert.deepEqual(api.player.position.toArray(),SUPPLIED_ROOM_LAYOUTS[site.id].spawn,'Spawn matches supplied floor');
        const model=api.reviewRoom().children.find(o=>o.userData.suppliedRoom===site.id);assert.ok(model,'The supplied model replaces the generic room');
        assert.ok(api.reviewRoom().children.every(o=>o===model||!o.isMesh),'No generic shell or furniture overlays');
        model.traverse(o=>{if(o.isMesh){o.geometry.addEventListener('dispose',()=>assert.fail('Shared room geometry disposed'));o.material.addEventListener('dispose',()=>assert.fail('Shared room material disposed'));}});
        if(site.id==='ramen'){
          api.reviewRoom().children.find(o=>o.name==='Order ramen · ¥300').userData.hit.fn();
          assert.equal(document.querySelector('#activityTitle').textContent,'Sato Ramen','Order action uses the restaurant name');
          api.activities.close();
        }
      }
      assert.deepEqual(api.reviewRoomState(),{visible:true,townVisible:false,colliders:api.reviewRoomState().colliders});
      assert.ok(api.reviewRoomState().colliders>0,'Interior has colliders: '+site.id);
      api.simulate(1/60);assert.equal(api.camera.fov,65);assert.equal(api.player.visible,false,'FPV inside '+site.id);assert.equal(api.reviewHiddenCutaways(),0,'FPV keeps the room enclosure visible: '+site.id);
      const roomStart=api.player.position.clone();api.keys.KeyW=true;api.simulate(.1);api.keys.KeyW=false;assert.ok(api.player.position.z<roomStart.z,'Interior FPV walks forward');

      api.simulate(1/60);
      assertFiniteTransforms(api,'inside '+site.id);
      if(site.id==='market'){
        const rotation=api.camera.quaternion.clone(),aspect=api.camera.aspect;
        api.activities.action('resident','Yuri');
        assert.ok(api.camera.aspect<aspect,'Speech rail reserves horizontal scene space');
        const clerk=api.scene.children.find(o=>o.userData.name==='Yuri');assert.ok(clerk);
        const target=clerk.position.clone();target.y+=1.25;api.camera.updateMatrixWorld(true);target.project(api.camera);
        assert.ok(Math.abs(target.x)<.95&&Math.abs(target.y)<.95,'Conversation keeps Yuri inside the unobstructed scene');
        api.activities.close();assert.equal(api.camera.aspect,aspect);
        const canvas=document.querySelector('#game');
        for(const [width,height] of [[390,844],[768,1030],[1024,768],[844,390]]){
          globalThis.innerWidth=width;globalThis.innerHeight=height;
          api.resizeRenderer();
          for(const talking of [true,false]){
            if(talking)api.activities.action('resident','Yuri');else api.activities.close();
            const displayWidth=parseFloat(canvas.style.width),displayHeight=parseFloat(canvas.style.height);
            assert.ok(Math.abs(api.camera.aspect-displayWidth/displayHeight)<1e-12,'Camera must match the canvas dimensions');
            const projection=api.camera.projectionMatrix.elements;
            assert.ok(Math.abs(projection[0]*displayWidth/(projection[5]*displayHeight)-1)<1e-12,'Equal world lengths project to equal pixel lengths');
          }
        }
        globalThis.innerWidth=1024;globalThis.innerHeight=768;api.resizeRenderer();
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
      const exitButton=document.querySelector('#exitRoomButton');
      assert.equal(exitButton.classList.contains('hidden'),false,'Visible exit control: '+site.id);
      if(site.id==='market')api.activities.action('resident','Yuri');
      exitButton.onclick();
      assert.equal(api.activities.paused,false,'Exit closes conversation');
      assert.equal(exitButton.classList.contains('hidden'),true,'Exit hides on the street');
      assert.equal(api.reviewCurrentRoom(),null,'Interior exit: '+site.id);
      assert.equal(api.reviewRoomState().townVisible,true);
      api.simulate(1/60);
      assert.equal(window.__JOHANSSON_CAMERA_MODE__,'first');assert.equal(api.player.visible,false,'Leaving '+site.id+' remains FPV');
      assertFiniteTransforms(api,'outside '+site.id);
      entered++;
    }
    assert.ok(entered>=8,'All existing interiors remain registered');
    const yuri=api.world.people.find(p=>p.profile.name==='Yuri').g,yuriScale=yuri.scale.clone();
    api.reviewSetMinutes(1230);api.enterRoom(api.SITES.find(s=>s.id==='izakaya'));api.interaction();
    assert.equal(yuri.visible,true,'Yuri visits after Sakura closes');
    assert.equal(yuri.userData.inIzakaya,true);assert.ok(yuri.scale.equals(yuriScale));
    assert.equal(api.scene.children.filter(o=>o.userData.name==='Yuri').length,1,'Reuse the existing Yuri');
    yuri.userData.hit.fn();assert.equal(document.querySelector('#activityTitle').textContent,'Yuri · After hours');api.activities.close();
    api.reviewSetMinutes(1290);api.simulate(1/60);api.interaction();assert.equal(yuri.parent,api.world.group,'Yuri resumes walking outside when her visit ends');assert.equal(yuri.userData.inIzakaya,undefined);
    api.leaveRoom();api.reviewSetMinutes(1440+1230);api.enterRoom(api.SITES.find(s=>s.id==='izakaya'));api.interaction();
    assert.equal(yuri.parent,api.world.group,'She stays outside the restaurant on alternate evenings');api.leaveRoom();
    api.reviewSetMinutes(1002);api.enterRoom(api.SITES.find(s=>s.id==='market'));api.interaction();
    assert.equal(yuri.visible,true,'Yuri returns to the shop');assert.equal(yuri.userData.inIzakaya,undefined);assert.ok(yuri.scale.equals(yuriScale));
    assert.equal(yuri.position.x,3.35);assert.equal(yuri.position.z,-1.95);api.leaveRoom();
    api.reviewSetMinutes(1619.99);api.enterRoom(api.SITES.find(s=>s.id==='izakaya'));api.simulate(.1);
    assert.equal(api.reviewRoomState().townVisible,true,'03:00 closing returns the player to the street');
    assert.equal(api.world.people.find(p=>p.profile.name==='Nao').g.parent,api.world.group,'Nao leaves her counter at closing');
    const seat=api.world.park.seat;api.player.position.set(...seat.stand);api.reviewSetYaw(-Math.PI/2);api.simulate(1/60);api.doInteract();api.simulate(.1);
    assert.ok(Math.abs(api.camera.position.y-seat.eyeY)<.001,'Park sitting places the eye above the actual bench');
    const sitting=api.player.position.clone();api.keys.KeyW=true;api.simulate(.1);api.keys.KeyW=false;assert.ok(api.player.position.distanceTo(sitting)<.001,'Sitting prevents walking');
    api.doInteract();assert.ok(api.player.position.distanceTo(api.player.position.clone().set(...seat.stand))<.001,'Standing returns to a clear point beside the bench');
    api.runStabilityChecks();
    assert.equal(window.__JOHANSSON_STABILITY__.ok,true,'Post-interior stability: '+JSON.stringify(window.__JOHANSSON_STABILITY__.failures));
  }catch(error){throw quietDataUrlError(error);}
});
