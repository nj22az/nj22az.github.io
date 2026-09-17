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
    assert.doesNotMatch(index,/id="viewButton"/,'FPV-only UI must not expose camera switching');
    assert.doesNotMatch(source,/toggleCamera|KeyV|cameraMode/,'FPV-only runtime must not retain a third-person path');
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
    source+='\nexport {scene,camera,world,player,SITES,activities,simulate,advanceAbsentTown,enterRoom,leaveRoom,runStabilityChecks,setTime,keys,characters,interaction,resizeRenderer,doInteract,touchSticks,residentBlocked,occupiedByPerson};\nexport const reviewRoom=()=>room;export const reviewShop=()=>sakuraShop;export const reviewSetActive=o=>active={...o.userData.hit,object:o};\nexport const reviewCurrentRoom=()=>current;\nexport const reviewSetMinutes=value=>minutes=value;export const reviewSetYaw=value=>yaw=value;\nexport const reviewRoomState=()=>({visible:room.visible,townVisible:town.visible,colliders:roomColliders.length});\nexport const reviewHiddenCutaways=()=>{let hidden=0;room.traverse(o=>{if(o.userData.cutaway&&o.layers.mask!==1)hidden++;});return hidden;};\n//# sourceURL=johansson-town-cpu-smoke.js\n';
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
    assert.ok(!api.SITES.some(s=>s.id==='crystal-room'));
    const waiting=api.world.people.find(p=>p.g.userData.name==='Kenji').g;
    const savedPosition=waiting.position.clone(),savedVisibility=waiting.visible;
    waiting.position.set(0,0,10);waiting.visible=true;waiting.userData.visualReady=false;
    assert.equal(api.residentBlocked(0,10),false,'Pending characters cannot create invisible player collisions');
    assert.equal(api.occupiedByPerson(0,10),false,'Pending characters do not displace the player');
    waiting.userData.visualReady=true;assert.equal(api.residentBlocked(0,10),true,'The completed character regains normal collision');
    waiting.position.copy(savedPosition);waiting.visible=savedVisibility;

    assert.ok(api.world.group.getObjectByName('Sato Ramen restaurant'));
    assert.equal(api.world.group.getObjectByName('Inakaya restaurant and neighbour'),undefined);

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
    // Nothing may stand inside the bench itself. The recycling bins were placed here
    // first and the bench was later put across them, so half a metre of cedar grew out
    // of a bin and the player spawned looking at it.
    {const seat=bench.seat.position,half={x:.65,z:.84};
     const inside=api.world.colliders.filter(c=>
      // The bench's own collider sits on the bench, which is not the problem.
      Math.hypot(c.x-seat[0],c.z-seat[2])>.25&&
      Math.abs(c.x-seat[0])<c.w/2+half.x-.05&&Math.abs(c.z-seat[2])<c.d/2+half.z-.05);
     assert.deepEqual(inside,[],'Street furniture stands through the viewing bench');}
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
    // Somewhere with room to run. The old start was 0.73m in front of the bus-station
    // bench, which a walk step cleared and a run step did not, so this read as a speed
    // fault for as long as the bench has existed. Assert the clearance rather than
    // trusting it: the next thing placed on the street would break it again silently.
    api.player.position.set(0,0,14);api.reviewSetYaw(0);api.simulate(1/60);
    const runningStart=api.player.position.clone();
    for(let ahead=0;ahead<=.8;ahead+=.1)
     assert.ok(!api.world.colliders.some(c=>circleHitsRect(runningStart.x,runningStart.z-ahead,.34,c)),
      'The running test needs a clear run of 0.8m, but something stands at '+ahead.toFixed(1)+'m');
    api.touchSticks.move.y=-1;api.simulate(.1);const walked=api.player.position.distanceTo(runningStart);
    api.player.position.copy(runningStart);document.querySelector('#run').onpointerdown({button:0,pointerType:'touch',preventDefault(){},stopPropagation(){}});document.querySelector('#run').onclick({detail:1});api.simulate(.1);
    const ran=api.player.position.distanceTo(runningStart);assert.ok(ran>walked*1.6&&ran<walked*1.9,'Touch Run increases movement speed');
    document.querySelector('#run').onpointerdown({button:0,pointerType:'touch',preventDefault(){},stopPropagation(){}});api.player.position.copy(runningStart);api.keys.ShiftRight=true;api.simulate(.1);
    assert.ok(api.player.position.distanceTo(runningStart)>walked*1.6,'Right Shift also runs');
    api.keys.ShiftRight=false;api.keys.KeyW=false;api.touchSticks.reset();api.player.position.copy(runningStart);

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
    api.reviewSetMinutes(180);await api.enterRoom(api.world.landmarks.find(s=>s.id==='warehouse'));
    assert.equal(api.reviewCurrentRoom()?.id,'warehouse','Warehouse stays open overnight');
    api.leaveRoom();api.reviewSetMinutes(1002);
    document.querySelector('#directoryButton').onclick();
    const shortcut=find('izakaya');assert.equal(shortcut.dataset.travel,'ready');shortcut.onclick();
    // A step from the door, either side of it: which side is the layout's business,
    // and the line below is what actually matters — that the entrance is usable from
    // where the shortcut sets you down.
    assert.ok(Math.abs(Math.abs(api.player.position.x-DINING.izakayaDoor[0])-.7)<1e-9,
     'Set down a step from the izakaya door, not on top of it');
    assert.equal(api.player.position.z,DINING.izakayaDoor[1]);
    api.simulate(1/60);api.interaction();assert.match(document.querySelector('#prompt').textContent,/Minato Izakaya/,'Unlocked shortcut faces the usable entrance');
    document.querySelector('#directoryButton').onclick();find('tea-house').onclick();
    // Against the tea house's own door rather than a copied pair of numbers: the shops
    // move, and a shortcut that lands you at the door is the thing being tested.
    {const tea=api.SITES.find(site=>site.id==='tea-house');
     assert.ok(Math.hypot(api.player.position.x-tea.door[0],api.player.position.z-tea.door[2])<1.2,
      'The tea house shortcut sets you down at its door');}
    api.simulate(1/60);api.interaction();assert.match(document.querySelector('#prompt').textContent,/Corner Tea House/);
    const minato=api.SITES.find(s=>s.id==='izakaya');assert.ok(Number.isFinite(minato.x)&&Number.isFinite(minato.z),'Izakaya appears on the map');
    document.querySelector('#notebookButton').onclick();
    assert.equal(document.querySelector('#activityTitle').textContent,'Field book');
    api.activities.close();

    let entered=0;
    for(const site of api.SITES){
      await api.enterRoom(site);
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
        const clerk=api.world.people.find(p=>p.profile.name==='Thuan').g;assert.ok(clerk);
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
          api.player.position.set(3.7,0,-.5);api.reviewSetYaw(0);api.interaction();assert.equal(welcomes,0,'Do not wave behind the camera');
          api.player.position.set(3.7,0,.85);api.reviewSetYaw(-Math.PI/2);api.interaction();assert.equal(welcomes,1,'Approaching the counter triggers a visible welcome');
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
    assert.equal(entered,api.SITES.length,'Every registered interior is entered');
    // Households are a residential-town feature: the shipping shopping district does
    // not build them, so what "all of them" means depends on the mode. Both are asserted
    // rather than the count being loosened, or this stops noticing a missing shop.
    const households=api.SITES.filter(s=>s.homeOwner).length;
    if(households){
     assert.ok(entered>=15,'Consolidated homes and existing businesses remain registered');
     assert.equal(households,7,'Seven households remain accessible through five doors');
    }else{
     assert.deepEqual(api.SITES.map(s=>s.id).sort(),
      ['form3d','frontrow','izakaya','market','office','ramen','tea-house'],
      'Every shopping-district business is registered and enterable');
    }
    for(const site of api.SITES){api.reviewSetMinutes(180);await api.enterRoom(site);assert.equal(api.reviewCurrentRoom()?.id,site.id,'Overnight entry: '+site.id);api.simulate(.1);assert.equal(api.reviewCurrentRoom()?.id,site.id);api.leaveRoom();}
    const yuri=api.world.people.find(p=>p.profile.name==='Thuan').g,yuriScale=yuri.scale.clone();
    const finishShopShift=()=>{if(yuri.userData.inMarket){api.reviewSetMinutes(1200);for(let i=0;i<2400&&yuri.userData.inMarket;i++)api.simulate(.1);assert.equal(yuri.userData.inMarket,undefined,'The persistent shop releases Thuan after she walks out: '+api.reviewShop().service.phase+' '+yuri.position.toArray()+' '+api.activities.state.sakura.restockedDay);}};finishShopShift();
    yuri.position.set(DINING.izakayaDoor[0],0,DINING.izakayaDoor[1]);yuri.userData.indoors='izakaya';delete yuri.userData.justArrived;
    api.reviewSetMinutes(1230);await api.enterRoom(api.SITES.find(s=>s.id==='izakaya'));api.interaction();
    assert.equal(yuri.visible,true,'Thuan visits after Sakura closes');
    assert.equal(yuri.userData.inIzakaya,true);assert.ok(yuri.scale.equals(yuriScale));
    assert.equal(api.scene.children.filter(o=>o.userData.name==='Thuan').length,1,'Reuse the existing Thuan');
    yuri.userData.hit.fn();assert.equal(document.querySelector('#activityTitle').textContent,'Thuan · After hours');api.activities.close();
    api.reviewSetMinutes(1290);api.simulate(1/60);api.interaction();assert.ok(yuri.parent===api.scene,'Thuan first walks to the indoor exit');for(let i=0;i<250;i++)api.simulate(.1);assert.ok(yuri.parent===api.world.group,'Thuan resumes walking outside after reaching the exit: '+yuri.position.toArray()+' '+yuri.userData.activity);assert.equal(yuri.userData.inIzakaya,undefined);
    api.leaveRoom();api.reviewSetMinutes(1440+1230);await api.enterRoom(api.SITES.find(s=>s.id==='izakaya'));api.interaction();
    assert.ok(yuri.parent===api.world.group,'She stays outside the restaurant on alternate evenings');api.leaveRoom();
    yuri.position.set(-4,0,-25.5);yuri.userData.indoors='market';delete yuri.userData.justArrived;api.reviewSetMinutes(1002);await api.enterRoom(api.SITES.find(s=>s.id==='market'));api.interaction();
    assert.equal(yuri.visible,true,'Thuan returns to the shop');assert.equal(yuri.userData.inIzakaya,undefined);assert.ok(yuri.scale.equals(yuriScale));
    const {SAKURA_LAYOUT}=await import('../src/world/interiors/sakura-layout.js');const STORE_CLERK_POSITION=SAKURA_LAYOUT.staff;
    assert.deepEqual(yuri.position.toArray(),[...STORE_CLERK_POSITION]);api.leaveRoom();
    finishShopShift();const home=api.world.people.find(p=>p.g===yuri).profile.home;yuri.position.set(home[0],0,home[1]);yuri.userData.indoors='home';delete yuri.userData.justArrived;api.reviewSetMinutes(1420);await api.enterRoom(api.SITES.find(s=>s.id==='yuri-home'));api.interaction();
    assert.equal(api.reviewCurrentRoom()?.id,'yuri-home');
    assert.equal(yuri.visible,true,'Thuan is home late at night');
    assert.equal(yuri.userData.inHome,true);assert.equal(api.scene.children.filter(o=>o.userData.name==='Thuan').length,1);
    api.leaveRoom();
    api.reviewSetMinutes(1619.99);await api.enterRoom(api.SITES.find(s=>s.id==='izakaya'));api.simulate(.1);
    assert.equal(api.reviewRoomState().townVisible,false,'03:00 closing keeps the player indoors');assert.equal(api.reviewCurrentRoom().id,'izakaya');
    const nao=api.world.people.find(p=>p.profile.name==='Nao').g;for(let i=0;i<300&&nao.userData.inIzakaya;i++)api.simulate(.1);assert.ok(nao.parent===api.world.group,'Nao walks out after closing');
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
    const {STORE_ITEMS}=await import('../src/commerce/catalogue.js');api.activities.action('store-item','tea',STORE_ITEMS[0]);choose('Into the basket · ¥120');
    // Goods are paid for at the counter now, so the sale is the whole ritual.
    api.activities.konbiniCounter();choose('I have my own');choose('Pay ¥120 in cash');api.activities.close();assert.ok(api.activities.state.sakura.cash>=120,'A completed shop sale funds inventory purchases');
    yuri.userData.hit.fn();choose('Sell items from my bag');choose('Sell Johansson cable ring · +¥120');
    assert.equal(api.activities.state.yen,workshopBalance+80-120);assert.ok(!api.activities.state.inventory.includes('Johansson cable ring'));api.leaveRoom();
    // The supplied store is retail-only; food is prepared at the ramen counter.
    api.reviewSetMinutes(600);await api.enterRoom(api.SITES.find(s=>s.id==='ramen'));
    const stool=api.reviewRoom().children.find(o=>Number.isInteger(o.userData.seat?.ramenSeatId));
    assert.ok(stool,'The player can sit at the ramen counter');
    api.player.position.set(...stool.userData.seat.stand);api.reviewSetYaw(Math.PI/2);api.interaction();
    // Select this nearby authored stool through the same seat action as touch/E.
    api.reviewSetActive(stool);stool.userData.hit.fn();api.doInteract();
    choose('Shoyu ramen · ¥300');const ramenBalance=api.activities.state.yen;
    for(let i=0;i<70;i++)api.simulate(.1);
    assert.equal(api.activities.state.yen,ramenBalance-300,'Counter service charges only on delivery');
    assert.ok(api.reviewRoom().getObjectByName('resident-prop-ramen')?.visible,'The served bowl is visible on the actual counter');
    api.doInteract();choose('Eat Shoyu ramen');assert.equal(api.activities.state.yen,ramenBalance-300,'Eating cannot charge twice');api.leaveRoom();
    // Run a full unattended day through the actual world and indoor controllers.
    api.reviewSetMinutes(5*1440+510);const journalBefore=api.activities.state.sakura.journal.length;
    api.advanceAbsentTown(660);
    assert.ok(Object.values(api.activities.state.residentLife).some(r=>r.purchases.some(p=>p.id==='ramen-meal')),'Ramen guests also eat and pay while the player is elsewhere');
    api.advanceAbsentTown(780);
    const dayRows=api.activities.state.sakura.journal.slice(journalBefore);
    assert.ok(dayRows.some(r=>r.kind==='Sale'&&r.buyer!=='Johansson'),'Unattended residents arrive, buy and pay in the real game');
    assert.ok(dayRows.some(r=>r.kind==='Restocked'),'Thuan restocks without the player entering the shop');
    assert.ok(dayRows.filter(r=>r.kind==='Restocked').every(r=>r.minute%1440>=1200||r.minute%1440<540),'Restocking is confined to closing hours');
    const savedShop=JSON.stringify(api.activities.state.sakura);await api.enterRoom(market);api.leaveRoom();
    assert.equal(JSON.stringify(api.activities.state.sakura),savedShop,'Opening and leaving the shop cannot replay its sales');
    api.runStabilityChecks();
    assert.equal(window.__JOHANSSON_STABILITY__.ok,true,'Post-interior stability: '+JSON.stringify(window.__JOHANSSON_STABILITY__.failures));
  }catch(error){throw quietDataUrlError(error);}
});
