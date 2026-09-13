import {DINING} from '../src/world/dining-layout.js';
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
    source+='\nexport {scene,camera,world,player,SITES,activities,simulate,enterRoom,leaveRoom,runStabilityChecks,setTime,keys,characters,interaction,resizeRenderer,doInteract,moveTouch,residentBlocked,occupiedByPerson};\nexport const reviewRoom=()=>room;\nexport const reviewCurrentRoom=()=>current;\nexport const reviewSetMinutes=value=>minutes=value;export const reviewSetYaw=value=>yaw=value;\nexport const reviewRoomState=()=>({visible:room.visible,townVisible:town.visible,colliders:roomColliders.length});\nexport const reviewHiddenCutaways=()=>{let hidden=0;room.traverse(o=>{if(o.userData.cutaway&&o.layers.mask!==1)hidden++;});return hidden;};\n//# sourceURL=johansson-town-cpu-smoke.js\n';
    // Exercise the new geometry in the full game, including actual room exits.
    const originalFetch=globalThis.fetch;
    globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:2048,height:2048,close(){}});
    globalThis.fetch=async url=>String(url).startsWith('blob:')?originalFetch(url):new Response(await readFile(resolve(root,'assets',new URL(url).pathname.split('/assets/')[1])));
    const {preloadHarbourBlock}=await import('../src/world/harbour-block.js');
    assert.equal(await preloadHarbourBlock(),true,'Real harbour block preloaded');
    const {preloadSuppliedRooms,SUPPLIED_ROOM_LAYOUTS}=await import('../src/world/supplied-rooms.js?snappy=1');
    assert.deepEqual(await preloadSuppliedRooms(),[true,true,true,true,true],'All supplied rooms preloaded');
    const {preloadJapaneseTown}=await import('../src/world/japanese-town.js');assert.equal(await preloadJapaneseTown(),true);
    const {preloadPark}=await import('../src/world/park.js?snappy=1');assert.equal(await preloadPark(),true);
    const {preloadIzakaya}=await import('../src/world/izakaya.js?snappy=1');
    assert.deepEqual(await preloadIzakaya(),{ready:2,total:2},'New izakaya exterior and existing dining room preloaded');
    const {preloadYuriHome}=await import('../src/world/yuri-home.js');
    assert.equal(await preloadYuriHome(),true,'Thuan house exterior preloaded');
    const {preloadSakuraBench}=await import('../src/world/sakura-bench.js');
    assert.equal(await preloadSakuraBench(),true,'Sakura viewing bench preloaded');
    const {preloadModels}=await import('../src/people/models.js?snappy=1');
    assert.deepEqual(await preloadModels(),{ready:6,total:6},'Actual selected character rigs preloaded');
    const api=await import(dataModule(source));
    assert.deepEqual(api.world.harbourShops.map(s=>s.id).sort(),['form3d','frontrow','office']);
    assert.ok(api.world.group.getObjectByName('Sakura glass storefront'));
    assert.ok(api.SITES.some(s=>s.id==='crystal-room'));
    const waiting=api.world.people.find(p=>p.g.userData.name==='Kenji').g;
    const savedPosition=waiting.position.clone(),savedVisibility=waiting.visible;
    waiting.position.set(0,0,10);waiting.visible=true;waiting.userData.visualReady=false;
    assert.equal(api.residentBlocked(0,10),false,'Pending characters cannot create invisible player collisions');
    assert.equal(api.occupiedByPerson(0,10),false,'Pending characters do not displace the player');
    waiting.userData.visualReady=true;assert.equal(api.residentBlocked(0,10),true,'The completed character regains normal collision');
    waiting.position.copy(savedPosition);waiting.visible=savedVisibility;

    assert.ok(api.world.group.getObjectByName('Inakaya restaurant and neighbour'));

    assert.equal(window.__JOHANSSON_RUNNING__,true,'Game must reach running state');
    assert.equal(window.__JOHANSSON_CAMERA_MODE__,'first','Exploration is always first person');
    assert.equal(window.__JOHANSSON_STABILITY__?.ok,true,'Startup stability: '+JSON.stringify(window.__JOHANSSON_STABILITY__?.failures));
    const market=api.SITES.find(s=>s.id==='market');
    const bench=api.world.sakuraBench;
    assert.ok(bench,'Sakura viewing bench is on the street');
    assert.ok(api.world.group.getObjectByName('sakura-viewing-bench'));
    assert.equal(bench.source,'blender');
    assert.deepEqual(api.player.position.toArray(),bench.seat.position,'Spawn seated on the viewing bench');
    const {Vector3}=await import(threeUrl);
    const look=api.camera.getWorldDirection(new Vector3());look.y=0;look.normalize();
    const toShop=new Vector3(market.side*7.55-api.player.position.x,0,market.z-api.player.position.z).normalize();
    assert.ok(look.dot(toShop)>.92,'Opening view faces Sakura Shōten across the street');
    assert.ok(Math.hypot(api.player.position.x-market.side*7.55,api.player.position.z-market.z)>12,'Konbini is seen from a distance');
    const openingSit=api.player.position.clone();
    api.keys.KeyW=true;api.simulate(.1);api.keys.KeyW=false;
    assert.ok(api.player.position.distanceTo(openingSit)<.001,'Opening sit prevents walking');
    assert.ok(api.world.colliders.every(c=>Math.abs(c.x-bench.seat.stand[0])>c.w/2+.28||Math.abs(c.z-bench.seat.stand[2])>c.d/2+.28),'Stand-up point is clear of walls');
    api.doInteract();
    assert.ok(Math.hypot(api.player.position.x-bench.seat.stand[0],api.player.position.z-bench.seat.stand[2])<.2,'E stands in front of the bench');
    assert.match(document.querySelector('#subtitle').textContent,/You stand up|Across the street/);
    // Movement speed checks use the unobstructed central street.
    api.player.position.set(0,0,26);api.reviewSetYaw(0);
    api.simulate(1/60);
    api.setTime();
    assert.equal(api.scene.fog,null,'Scene fog is disabled');
    assertFiniteTransforms(api,'outdoor startup');

    assert.equal(api.player.visible,false);assert.equal(api.player.children.length,0,'No protagonist mesh is attached to the controller');
    assert.equal(api.player.userData.visualSource,'First-person controller');assert.equal(api.camera.fov,65);
    assert.equal('cameraMode' in api.activities.state,false,'Legacy camera preference is discarded');
    const {ROUTES}=await import('../src/world/layout.js?snappy=1'),{circleHitsRect}=await import('../physics.js?snappy=1');
    for(const route of ROUTES.filter(r=>r.id.endsWith('-cut')))for(let i=1;i<route.points.length;i++)for(let t=0;t<=1;t+=.025){const a=route.points[i-1],b=route.points[i],x=a[0]*(1-t)+b[0]*t,z=a[1]*(1-t)+b[1]*t;assert.equal(api.world.colliders.some(c=>circleHitsRect(x,z,.32,c)),false,route.id+' clears the supplied shopfronts');}
    const runningStart=api.player.position.clone();
    api.moveTouch.id=81;api.moveTouch.cx=100;api.moveTouch.cy=400;api.moveTouch.x=100;api.moveTouch.y=352;api.simulate(.1);const walked=api.player.position.distanceTo(runningStart);
    api.player.position.copy(runningStart);document.querySelector('#run').onpointerdown({button:0,pointerType:'touch',preventDefault(){},stopPropagation(){}});document.querySelector('#run').onclick({detail:1});api.simulate(.1);
    const ran=api.player.position.distanceTo(runningStart);assert.ok(ran>walked*1.6&&ran<walked*1.9,'Touch Run increases movement speed');
    document.querySelector('#run').onpointerdown({button:0,pointerType:'touch',preventDefault(){},stopPropagation(){}});api.player.position.copy(runningStart);api.keys.ShiftRight=true;api.simulate(.1);
    assert.ok(api.player.position.distanceTo(runningStart)>walked*1.6,'Right Shift also runs');
    api.keys.ShiftRight=false;api.keys.KeyW=false;api.moveTouch.id=null;api.player.position.copy(runningStart);

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
    document.querySelector('#directoryButton').onclick();assert.equal(find('warehouse').dataset.travel,'locked');find('warehouse').onclick();
    assert.deepEqual(api.player.position.toArray(),walkingStart.toArray(),'Warehouse directions respect the shortcut unlock');
    assert.match(document.querySelector('#waypoint').textContent,/Harbour Warehouse/);
    assert.match(document.querySelector('#subtitle').textContent,/past Sakura Konbini/);
    api.activities.state.quest=3;document.querySelector('#directoryButton').onclick();find('izakaya').onclick();assert.deepEqual(api.player.position.toArray(),walkingStart.toArray(),'One completed quest does not unlock shortcuts');
    api.activities.state.kenjiEscort='done';api.activities.save();document.querySelector('#directoryButton').onclick();
    assert.equal(find('warehouse').dataset.travel,'ready');find('warehouse').onclick();
    assert.deepEqual(api.player.position.toArray(),[-8.6,0,-38.65],'Warehouse shortcut lands on the clear quay approach');
    api.simulate(1/60);api.interaction();assert.match(document.querySelector('#prompt').textContent,/Enter Harbour Warehouse/);
    api.doInteract();assert.equal(api.reviewCurrentRoom()?.id,'warehouse','Street door opens the warehouse');
    assert.ok(api.reviewRoomState().colliders>0);
    assert.ok(api.reviewRoom().getObjectByName('warehouse-inside-door'));
    assert.ok(api.reviewRoom().getObjectByName('warehouse-ledger-bench'));
    const warehouseExit=api.reviewRoom().getObjectByName('warehouse-room-exit');
    warehouseExit.userData.hit.fn();
    assert.ok(Math.hypot(api.player.position.x+8.0,api.player.position.z+38.65)<.01,'Warehouse exit returns outside the same door');
    api.leaveRoom();assert.equal(api.reviewCurrentRoom(),null);
    api.reviewSetMinutes(180);api.enterRoom(api.world.landmarks.find(s=>s.id==='warehouse'));
    assert.equal(api.reviewCurrentRoom()?.id,'warehouse','Warehouse stays open overnight');
    api.leaveRoom();api.reviewSetMinutes(1002);
    document.querySelector('#directoryButton').onclick();
    const shortcut=find('izakaya');assert.equal(shortcut.dataset.travel,'ready');shortcut.onclick();
    assert.equal(api.player.position.x,DINING.izakayaDoor[0]-.7);assert.equal(api.player.position.z,DINING.izakayaDoor[1]);
    api.simulate(1/60);api.interaction();assert.match(document.querySelector('#prompt').textContent,/Minato Izakaya/,'Unlocked shortcut faces the usable entrance');
    document.querySelector('#directoryButton').onclick();find('tea-house').onclick();assert.equal(api.player.position.x,28);assert.equal(api.player.position.z,30.7);
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
      if(site.id==='izakaya'){assert.ok(api.reviewRoom().getObjectByName('Minato CRT television'));assert.equal(api.world.group.getObjectByName('Street advertising billboard'),undefined);}
      api.simulate(1/60);assert.equal(api.camera.fov,65);assert.equal(api.player.visible,false,'FPV inside '+site.id);assert.equal(api.reviewHiddenCutaways(),0,'FPV keeps the room enclosure visible: '+site.id);
      const roomStart=api.player.position.clone();api.keys.KeyW=true;api.simulate(.1);api.keys.KeyW=false;const facing=SUPPLIED_ROOM_LAYOUTS[site.id]?.yaw??0;assert.ok((api.player.position.x-roomStart.x)*-Math.sin(facing)+(api.player.position.z-roomStart.z)*-Math.cos(facing)>0,'Interior FPV walks forward: '+site.id);

      api.simulate(1/60);
      assertFiniteTransforms(api,'inside '+site.id);
      if(site.id==='market'){
        const rotation=api.camera.quaternion.clone(),aspect=api.camera.aspect;
        api.activities.action('resident','Thuan');
        assert.ok(api.camera.aspect<aspect,'Speech rail reserves horizontal scene space');
        const clerk=api.scene.children.find(o=>o.userData.name==='Thuan');assert.ok(clerk);
        const target=clerk.position.clone();target.y+=1.25;api.camera.updateMatrixWorld(true);target.project(api.camera);
        assert.ok(Math.abs(target.x)<.95&&Math.abs(target.y)<.95,'Conversation keeps Thuan inside the unobstructed scene');
        api.activities.close();assert.equal(api.camera.aspect,aspect);
        const canvas=document.querySelector('#game');
        for(const [width,height] of [[390,844],[768,1030],[1024,768],[844,390]]){
          globalThis.innerWidth=width;globalThis.innerHeight=height;
          api.resizeRenderer();
          for(const talking of [true,false]){
            if(talking)api.activities.action('resident','Thuan');else api.activities.close();
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
        api.characters.gesture=entity=>{assert.equal(entity.userData.name,'Thuan');welcomes++;};
        try{
          api.interaction();assert.equal(welcomes,0,'No distant wave from the entrance');
          api.player.position.set(3.35,0,-4.5);api.interaction();assert.equal(welcomes,0,'Do not wave behind the camera');
          api.player.position.set(3.35,0,.7);api.interaction();assert.equal(welcomes,1,'Approaching the counter triggers a visible welcome');
          api.interaction();api.interaction();assert.equal(welcomes,1,'Only one proximity welcome per visit');
          assert.equal(api.activities.paused,false,'The greeting must not open a panel over Thuan');
        }finally{api.characters.gesture=gesture;}
      }
      const exitButton=document.querySelector('#exitRoomButton');
      assert.equal(exitButton.classList.contains('hidden'),false,'Visible exit control: '+site.id);
      if(site.id==='market')api.activities.action('resident','Thuan');
      exitButton.onclick();
      assert.equal(api.activities.paused,false,'Exit closes conversation');
      assert.equal(exitButton.classList.contains('hidden'),true,'Exit hides on the street');
      assert.equal(api.reviewCurrentRoom(),null,'Interior exit: '+site.id);
      assert.equal(api.reviewRoomState().townVisible,true);assert.equal(api.reviewRoom().getObjectByName('Minato CRT television'),undefined,'The television releases its media on exit');
      api.simulate(1/60);
      assert.equal(window.__JOHANSSON_CAMERA_MODE__,'first');assert.equal(api.player.visible,false,'Leaving '+site.id+' remains FPV');
      assertFiniteTransforms(api,'outside '+site.id);
      entered++;
    }
    assert.equal(entered,api.SITES.length,'Every registered interior is entered');assert.ok(entered>=15,'Consolidated homes and existing businesses remain registered');assert.equal(api.SITES.filter(s=>s.homeOwner).length,7,'Seven households remain accessible through five doors');
    for(const site of api.SITES){api.reviewSetMinutes(180);api.enterRoom(site);assert.equal(api.reviewCurrentRoom()?.id,site.id,'Overnight entry: '+site.id);api.simulate(.1);assert.equal(api.reviewCurrentRoom()?.id,site.id);api.leaveRoom();}
    const yuri=api.world.people.find(p=>p.profile.name==='Thuan').g,yuriScale=yuri.scale.clone();
    yuri.position.set(DINING.izakayaDoor[0],0,DINING.izakayaDoor[1]);yuri.userData.indoors='izakaya';delete yuri.userData.justArrived;
    api.reviewSetMinutes(1230);api.enterRoom(api.SITES.find(s=>s.id==='izakaya'));api.interaction();
    assert.equal(yuri.visible,true,'Thuan visits after Sakura closes');
    assert.equal(yuri.userData.inIzakaya,true);assert.ok(yuri.scale.equals(yuriScale));
    assert.equal(api.scene.children.filter(o=>o.userData.name==='Thuan').length,1,'Reuse the existing Thuan');
    yuri.userData.hit.fn();assert.equal(document.querySelector('#activityTitle').textContent,'Thuan · After hours');api.activities.close();
    api.reviewSetMinutes(1290);api.simulate(1/60);api.interaction();assert.ok(yuri.parent===api.scene,'Thuan first walks to the indoor exit');for(let i=0;i<250;i++)api.simulate(.1);assert.ok(yuri.parent===api.world.group,'Thuan resumes walking outside after reaching the exit: '+yuri.position.toArray()+' '+yuri.userData.activity);assert.equal(yuri.userData.inIzakaya,undefined);
    api.leaveRoom();api.reviewSetMinutes(1440+1230);api.enterRoom(api.SITES.find(s=>s.id==='izakaya'));api.interaction();
    assert.ok(yuri.parent===api.world.group,'She stays outside the restaurant on alternate evenings');api.leaveRoom();
    yuri.position.set(-4,0,-25.5);yuri.userData.indoors='market';delete yuri.userData.justArrived;api.reviewSetMinutes(1002);api.enterRoom(api.SITES.find(s=>s.id==='market'));api.interaction();
    assert.equal(yuri.visible,true,'Thuan returns to the shop');assert.equal(yuri.userData.inIzakaya,undefined);assert.ok(yuri.scale.equals(yuriScale));
    const {STORE_CLERK_POSITION}=await import('../src/world/interiors/store-layout.js');
    assert.deepEqual(yuri.position.toArray(),[...STORE_CLERK_POSITION]);api.leaveRoom();
    const home=api.world.people.find(p=>p.g===yuri).profile.home;yuri.position.set(home[0],0,home[1]);yuri.userData.indoors='home';delete yuri.userData.justArrived;api.reviewSetMinutes(1420);api.enterRoom(api.SITES.find(s=>s.id==='yuri-home'));api.interaction();
    assert.equal(api.reviewCurrentRoom()?.id,'yuri-home');
    assert.equal(yuri.visible,true,'Thuan is home late at night');
    assert.equal(yuri.userData.inHome,true);assert.equal(api.scene.children.filter(o=>o.userData.name==='Thuan').length,1);
    api.leaveRoom();
    api.reviewSetMinutes(1619.99);api.enterRoom(api.SITES.find(s=>s.id==='izakaya'));api.simulate(.1);
    assert.equal(api.reviewRoomState().townVisible,false,'03:00 closing keeps the player indoors');assert.equal(api.reviewCurrentRoom().id,'izakaya');
    assert.ok(api.world.people.find(p=>p.profile.name==='Nao').g.parent===api.world.group,'Nao leaves her counter at closing');
    api.leaveRoom();const seat=api.world.park.seat;api.player.position.set(...seat.stand);api.reviewSetYaw(-Math.PI/2);api.simulate(1/60);api.doInteract();api.simulate(.1);
    assert.ok(Math.abs(api.camera.position.y-seat.eyeY)<.001,'Park sitting places the eye above the actual bench');
    const sitting=api.player.position.clone();api.keys.KeyW=true;api.simulate(.1);api.keys.KeyW=false;assert.ok(api.player.position.distanceTo(sitting)<.001,'Sitting prevents walking');
    api.doInteract();assert.ok(api.player.position.distanceTo(api.player.position.clone().set(...seat.stand))<.001,'Standing returns to a clear point beside the bench');
    const choose=label=>{const button=document.querySelector('#activityActions').children.find(b=>b.textContent===label);assert.ok(button,'Workshop action: '+label);assert.equal(button.disabled,false);button.onclick();};
    api.reviewSetMinutes(1002);await api.enterRoom(api.SITES.find(s=>s.id==='form3d'));
    assert.ok(api.reviewRoom().getObjectByName('Form 3D printing machine'),'The real workshop contains the printer');
    api.reviewRoom().getObjectByName('content-stepwise').userData.hit.fn();assert.match(document.querySelector('#activityTitle').textContent,/StepWise/);choose('Use this pattern in Form 3D');
    const workshopBalance=api.activities.state.yen;choose('Print model · ¥40');
    api.leaveRoom();for(let i=0;i<90;i++)api.simulate(.1);assert.equal(api.activities.state.workshop.job.remaining,0,'Printing progresses while exploring outdoors');
    await api.enterRoom(api.SITES.find(s=>s.id==='form3d'));api.reviewRoom().getObjectByName('Use Form 3D printer').userData.hit.fn();choose('Collect model');
    assert.ok(api.activities.state.inventory.includes('Johansson cable ring'));assert.equal(api.activities.state.yen,workshopBalance-40);api.leaveRoom();
    yuri.position.set(-4,0,-25.5);yuri.userData.indoors='market';delete yuri.userData.justArrived;api.reviewSetMinutes(1002);await api.enterRoom(api.SITES.find(s=>s.id==='market'));
    const {STORE_ITEMS}=await import('../src/commerce/catalogue.js');api.activities.action('store-item','tea',STORE_ITEMS[0]);choose('Buy in town · ¥120');api.activities.close();assert.ok(api.activities.state.sakura.cash>=120,'A completed shop sale funds inventory purchases');
    yuri.userData.hit.fn();choose('Sell items from my bag');choose('Sell Johansson cable ring · +¥120');
    assert.equal(api.activities.state.yen,workshopBalance+80-120);assert.ok(!api.activities.state.inventory.includes('Johansson cable ring'));api.leaveRoom();
    // Exercise the actual fixed loop, indoor ownership, greetings and rig update
    // together. A service-only test cannot catch another controller overriding it.
    {
      const kenji=api.world.people.find(p=>p.profile.name==='Kenji').g;
      api.activities.state.kenjiEscort='done';
      delete api.activities.state.residentLife.Kenji;
      api.reviewSetMinutes(1022.8); // Kenji arrives just before his window ends.
      for(const g of [kenji,yuri]){g.position.set(-4,0,-25.5);g.userData.indoors='market';g.userData.justArrived=g===kenji;}
      await api.enterRoom(market);api.player.position.set(0,0,4.5);api.reviewSetYaw(0);
      const cashBefore=api.activities.state.sakura.cash,poses=new Set();
      for(let frame=0;frame<115*30;frame++){
        api.simulate(1/30);api.interaction();api.characters.update(1/30);
        const meal=api.activities.state.residentLife.Kenji?.meals?.market;
        assert.ok(meal,'The visit starts at the door, before reaching a chair');
        if(!meal.finished)assert.equal(kenji.userData.inMarket,true,'A late arrival stays through ordering and eating');
        poses.add(kenji.userData.socialPose);
      }
      const meal=api.activities.state.residentLife.Kenji.meals.market;
      assert.ok(meal.delivered&&meal.finished,'Thuan completes the late arrival’s meal in the running game');
      assert.ok(poses.has('Eat')&&poses.has('Sit'),'The diner eats between seated pauses');
      assert.equal(api.activities.state.residentLife.Kenji.purchases.filter(p=>p.id==='market-meal').length,1);
      assert.ok(api.activities.state.sakura.cash>=cashBefore+150,'The completed meal funds Thuan’s till');
      api.leaveRoom();

      // Leave the counter quiet so the real break routine reaches its chair.
      for(const record of Object.values(api.activities.state.residentLife)){record.meals??={};record.meals.market={item:'bun',finished:true};}
      api.reviewSetMinutes(1160);yuri.userData.indoors='market';delete yuri.userData.justArrived;
      await api.enterRoom(market);api.player.position.set(0,0,4.5);api.reviewSetYaw(0);
      let greetedWhileWalking=false;
      for(let frame=0;frame<31*30;frame++){
        api.simulate(1/30);api.characters.update(1/30);
        if(!greetedWhileWalking&&yuri.userData.character.moving){
          const rotation=yuri.quaternion.clone(),position=yuri.position.clone();
          yuri.userData.hit.fn();api.activities.close();
          assert.ok(yuri.quaternion.angleTo(rotation)<1e-6,'Talking cannot instantly turn a walking Thuan');
          assert.ok(yuri.position.equals(position),'Talking cannot drag her out of the aisle');
          greetedWhileWalking=true;
        }
      }
      assert.ok(greetedWhileWalking);assert.equal(yuri.userData.socialPose,'Sit');
      api.reviewSetMinutes(1199.9);let stood=false,walkedOut=false;
      for(let frame=0;frame<50*30;frame++){
        const before=yuri.position.clone(),wasInside=yuri.userData.inMarket;
        api.simulate(1/30);api.characters.update(1/30);
        if(wasInside&&yuri.userData.inMarket)assert.ok(yuri.position.distanceTo(before)<.05,'Closing cannot teleport Thuan from the break chair to the counter');
        if(Number.isFinite(yuri.userData.chairBlend)&&yuri.userData.chairBlend<.95)stood=true;
        if(wasInside&&!yuri.userData.inMarket)walkedOut=true;
      }
      assert.ok(stood&&walkedOut,'Closing uses the stand-up transition before walking to the exit');
      api.leaveRoom();
    }
    api.runStabilityChecks();
    assert.equal(window.__JOHANSSON_STABILITY__.ok,true,'Post-interior stability: '+JSON.stringify(window.__JOHANSSON_STABILITY__.failures));
  }catch(error){throw quietDataUrlError(error);}
});
