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

test('Published peninsula boots, shares the wooden bookshop/workshop and visits every interior',async()=>{
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
    source+='\nexport {scene,camera,world,player,SITES,activities,simulate,advanceAbsentTown,catchUpFrame,enterRoom,leaveRoom,runStabilityChecks,setTime,keys,characters,interaction,resizeRenderer,doInteract,touchSticks,residentBlocked,occupiedByPerson};\nexport const reviewRoom=()=>room;export const reviewShop=()=>sakuraShop;export const reviewSetActive=o=>active={...o.userData.hit,object:o};\nexport const reviewCurrentRoom=()=>current;\nexport const reviewSetMinutes=value=>{followRealClock=false;minutes=value;};export const reviewSetYaw=value=>yaw=value;\nexport const reviewRoomState=()=>({visible:room.visible,townVisible:town.visible,colliders:roomColliders.length});\nexport const reviewHiddenCutaways=()=>{let hidden=0;room.traverse(o=>{if(o.userData.cutaway&&o.layers.mask!==1)hidden++;});return hidden;};\n//# sourceURL=johansson-town-cpu-smoke.js\n';
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
    assert.deepEqual(await preloadModels(),{ready:7,total:7},'Actual selected character rigs preloaded');
    const api=await import(dataModule(source));
    const {Vector3}=await import(threeUrl);
    const {BOOKSHOP_WORKSHOP_ROOM}=await import('../src/world/bookshop-workshop-layout.js');
    const {SAKURA_SHOP}=await import('../src/world/sakura-bench.js');
    const {circleHitsRect}=await import('../physics.js?snappy=1');
    assert.deepEqual(api.SITES.map(s=>s.id).sort(),['frontrow','izakaya','market','office']);
    assert.deepEqual(api.world.landmarks.map(s=>s.id).sort(),['bus-station','warehouse']);
    assert.deepEqual(api.world.harbourShops.map(s=>s.id).sort(),['frontrow','office']);
    assert.ok(api.world.group.getObjectByName('west-shop:frontrow'));
    assert.equal(api.world.group.getObjectByName('west-shop:form3d'),undefined,'Only one bookshop/workshop exterior');
    assert.equal(api.world.group.getObjectByName('Sato Ramen restaurant'),undefined,'The peninsula has no ramen premises');
    assert.equal(window.__JOHANSSON_RUNNING__,true);
    assert.equal(window.__JOHANSSON_STABILITY__?.ok,true,'Startup stability: '+JSON.stringify(window.__JOHANSSON_STABILITY__?.failures));
    // Check the actual actions as well as the mode-aware diagnostic count.
    const streetLabels=new Set();api.world.group.traverse(o=>{if(o.userData.hit)streetLabels.add(o.userData.hit.label);});
    for(const label of ['Sit on neighbourhood bench','Inspect post box','Read harbour notices','Inspect utility cabinet','Inspect traffic mirror','Inspect recycling bins','Test hand pump'])assert.ok(streetLabels.has(label),label);
    const waiting=api.world.people.find(p=>p.profile.name==='Kenji').g;
    const savedPosition=waiting.position.clone(),savedVisibility=waiting.visible;
    waiting.position.set(0,0,10);waiting.visible=true;waiting.userData.visualReady=false;
    assert.equal(api.residentBlocked(0,10),false,'Pending characters cannot create invisible collisions');
    assert.equal(api.occupiedByPerson(0,10),false);
    waiting.userData.visualReady=true;assert.equal(api.residentBlocked(0,10),true);
    waiting.position.copy(savedPosition);waiting.visible=savedVisibility;

    const market=api.SITES.find(s=>s.id==='market'),books=api.SITES.find(s=>s.id==='frontrow');
    const destinations=[...api.SITES,...api.world.landmarks],bench=api.world.sakuraBench;
    // The bus stop is an outdoor destination; the warehouse has an interior.
    const interiors=[...api.SITES,api.world.landmarks.find(s=>s.id==='warehouse')];
    assert.equal(bench.source,'blender');
    assert.deepEqual(api.player.position.toArray(),bench.seat.position,'Start seated on the viewing bench');
    const look=api.camera.getWorldDirection(new Vector3());look.y=0;look.normalize();
    const toShop=new Vector3(SAKURA_SHOP.x-api.player.position.x,0,SAKURA_SHOP.z-api.player.position.z).normalize();
    assert.ok(look.dot(toShop)>.97,'Opening view faces the actual Sakura frontage');
    const openingSit=api.player.position.clone();api.keys.KeyW=true;api.simulate(.1);api.keys.KeyW=false;
    assert.ok(api.player.position.distanceTo(openingSit)<.001,'Sitting prevents walking');
    assert.ok(!api.world.colliders.some(c=>circleHitsRect(bench.seat.stand[0],bench.seat.stand[2],.28,c)),'Clear stand-up point');
    api.doInteract();assert.ok(api.player.position.distanceTo(new Vector3(...bench.seat.stand))<.2);
    api.player.position.set(0,0,14);api.reviewSetYaw(0);api.simulate(1/60);
    const runningStart=api.player.position.clone();
    for(let ahead=0;ahead<=.8;ahead+=.1)assert.ok(!api.world.colliders.some(c=>circleHitsRect(runningStart.x,runningStart.z-ahead,.34,c)),'Clear movement test route');
    api.touchSticks.move.y=-1;api.simulate(.1);const walked=api.player.position.distanceTo(runningStart);
    api.player.position.copy(runningStart);document.querySelector('#run').onpointerdown({button:0,pointerType:'touch',preventDefault(){},stopPropagation(){}});api.simulate(.1);
    assert.ok(api.player.position.distanceTo(runningStart)>walked*1.6,'Touch Run increases speed');
    document.querySelector('#run').onpointerdown({button:0,pointerType:'touch',preventDefault(){},stopPropagation(){}});
    api.player.position.copy(runningStart);api.keys.ShiftRight=true;api.simulate(.1);
    assert.ok(api.player.position.distanceTo(runningStart)>walked*1.6,'Right Shift runs');
    api.keys.ShiftRight=false;api.touchSticks.reset();api.player.position.copy(runningStart);
    const startX=api.player.position.x;api.keys.KeyA=true;api.simulate(.1);api.keys.KeyA=false;assert.ok(api.player.position.x<startX);
    const leftX=api.player.position.x;api.keys.KeyD=true;api.simulate(.1);api.keys.KeyD=false;assert.ok(api.player.position.x>leftX);
    assert.equal(window.__JOHANSSON_JUMP__(),true);api.simulate(.1);assert.ok(api.player.position.y>0);
    for(let i=0;i<12;i++)api.simulate(.1);assert.equal(api.player.position.y,0);
    assert.equal(api.player.visible,false);assert.equal(api.player.children.length,0);assert.equal(api.camera.fov,65);
    assert.equal(api.scene.fog,null);assertFiniteTransforms(api,'outdoor startup');

    const directory=()=>document.querySelector('#directoryButton').onclick();
    const find=id=>document.querySelector('#directoryGrid').children.find(b=>b.dataset.id===id);
    directory();assert.equal(find('form3d'),undefined,'No duplicate workshop destination');
    const walkingStart=api.player.position.clone();
    for(const site of destinations){directory();assert.equal(find(site.id).dataset.travel,'locked');find(site.id).onclick();assert.deepEqual(api.player.position.toArray(),walkingStart.toArray(),'Locked shortcut: '+site.id);}
    api.activities.state.quest=3;api.activities.state.kenjiEscort='done';
    directory();assert.equal(find('frontrow').dataset.travel,'ready');find('frontrow').onclick();
    assert.ok(Math.hypot(api.player.position.x-books.door[0],api.player.position.z-books.door[2])<1.2);
    api.simulate(1/60);api.interaction();assert.match(document.querySelector('#prompt').textContent,/Enter Front-Row Books & Workshop/);
    // The street action includes the real asynchronous threshold animation.
    const entrance=api.world.group.getObjectByName('frontrow-west-entrance');
    await entrance.userData.hit.fn();assert.equal(api.reviewCurrentRoom()?.id,'frontrow');
    assert.deepEqual(api.player.position.toArray(),BOOKSHOP_WORKSHOP_ROOM.spawn);
    await document.querySelector('#exitRoomButton').onclick();assert.equal(api.reviewCurrentRoom(),null);
    assert.ok(Math.hypot(api.player.position.x-books.door[0],api.player.position.z-books.door[2])<1.2,'Return to the same entrance');

    const visited=new Set();
    for(const site of interiors){
      api.reviewSetMinutes(1050);api.reviewSetYaw((site.streetFrontage?.yaw??site.entryFacing??0)+Math.PI);
      await api.enterRoom(site);assert.equal(api.reviewCurrentRoom()?.id,site.id,'Interior entry: '+site.id);
      assert.equal(api.reviewRoomState().visible,true);assert.equal(api.reviewRoomState().townVisible,false);
      assert.ok(api.reviewRoomState().colliders>0,'Interior colliders: '+site.id);
      if(site.id==='frontrow'){
        assert.deepEqual(api.player.position.toArray(),BOOKSHOP_WORKSHOP_ROOM.spawn);
        for(const name of ['Bookselling counter','Editor and printing bench','Shared repair bench','Form 3D printing machine','Star Port cabinet'])assert.ok(api.reviewRoom().getObjectByName(name),name+' shares the room');
        const exits=[];api.reviewRoom().traverse(o=>{if(o.userData.hit?.label.startsWith('Exit to '))exits.push(o);});
        assert.equal(exits.length,1,'One shared interior exit');
      }
      if(site.id==='office'){
        assert.deepEqual(api.player.position.toArray(),SUPPLIED_ROOM_LAYOUTS.office.spawn);
        assert.ok(api.reviewRoom().getObjectByName('Supplied office'));
        assert.ok(api.reviewRoom().getObjectByName('Clerk CRT monitor'));
      }
      if(site.id==='warehouse')assert.ok(api.reviewRoom().getObjectByName('warehouse-ledger-bench'));
      if(site.id==='izakaya')assert.ok(api.reviewRoom().getObjectByName('Minato CRT television'));
      // Movement uses the room's forward direction; entry itself preserves street yaw.
      const facing=site.id==='frontrow'?0:SUPPLIED_ROOM_LAYOUTS[site.id]?.yaw??0;api.reviewSetYaw(facing);
      const roomStart=api.player.position.clone();api.keys.KeyW=true;api.simulate(.1);api.keys.KeyW=false;
      assert.ok((api.player.position.x-roomStart.x)*-Math.sin(facing)+(api.player.position.z-roomStart.z)*-Math.cos(facing)>0,'Walk inside '+site.id);
      assert.equal(api.player.visible,false);assert.equal(api.reviewHiddenCutaways(),0);assertFiniteTransforms(api,'inside '+site.id);
      if(site.id==='market'){
        const rotation=api.camera.quaternion.clone();
        for(const [width,height] of [[390,844],[768,1030],[1024,768],[844,390]]){
          globalThis.innerWidth=width;globalThis.innerHeight=height;api.resizeRenderer();
          for(const talking of [true,false]){
            if(talking)api.activities.action('resident','Thuan');else api.activities.close();
            const canvas=document.querySelector('#game'),w=parseFloat(canvas.style.width),h=parseFloat(canvas.style.height),projection=api.camera.projectionMatrix.elements;
            assert.ok(Math.abs(api.camera.aspect-w/h)<1e-12);assert.ok(Math.abs(projection[0]*w/(projection[5]*h)-1)<1e-12,'Conversation keeps correct proportions');
          }
        }
        assert.ok(api.camera.quaternion.angleTo(rotation)<1e-6,'Conversation preserves view direction');
        globalThis.innerWidth=1024;globalThis.innerHeight=768;api.resizeRenderer();
        api.activities.action('resident','Thuan');
      }
      await document.querySelector('#exitRoomButton').onclick();
      assert.equal(api.activities.paused,false);assert.equal(api.reviewCurrentRoom(),null);
      assert.equal(api.reviewRoomState().townVisible,true);assert.equal(api.reviewRoom().getObjectByName('Minato CRT television'),undefined);
      assertFiniteTransforms(api,'outside '+site.id);visited.add(site.id);
    }
    assert.deepEqual([...visited].sort(),['frontrow','izakaya','market','office','warehouse']);

    // All four existing workers share this room after their afternoon shopping.
    const {createResidentLedger}=await import('../src/people/resident-personalities.js');
    const ledger=createResidentLedger(()=>api.activities.state),staffNames=['Aya','Kenji','Reiko','Tetsuo'];
    for(const name of staffNames)ledger.account(name,1050).shopping={finished:true};
    api.reviewSetMinutes(1050);api.player.position.set(0,0,14);
    const staff=api.world.people.filter(p=>staffNames.includes(p.profile.name));
    for(let i=0;i<600&&!staff.every(p=>p.g.userData.indoors==='work');i++)api.simulate(.1);
    await api.enterRoom(books);
    for(const name of staffNames){const p=api.world.people.find(p=>p.profile.name===name);assert.equal(p.profile.workSite,'frontrow');assert.equal(p.g.userData.inWorkplace,'frontrow',name+' works in the shared room');assert.equal(p.g.visible,true);}
    const choose=label=>{const button=document.querySelector('#activityActions').children.find(b=>b.textContent===label);assert.ok(button,'Action: '+label);assert.equal(button.disabled,false);button.onclick();};
    api.reviewRoom().getObjectByName('content-stepwise').userData.hit.fn();assert.match(document.querySelector('#activityTitle').textContent,/StepWise/);choose('Use this pattern in Form 3D');
    const workshopBalance=api.activities.state.yen;choose('Print model · ¥40');
    api.leaveRoom();for(let i=0;i<90;i++)api.simulate(.1);assert.equal(api.activities.state.workshop.job.remaining,0,'Printing progresses outside');
    // Old saved workshop addresses must resolve to this same room too.
    await api.enterRoom({id:'form3d'});assert.equal(api.reviewCurrentRoom().id,'frontrow');
    api.reviewRoom().getObjectByName('Use Form 3D printer').userData.hit.fn();choose('Collect model');
    assert.ok(api.activities.state.inventory.includes('Johansson cable ring'));assert.equal(api.activities.state.yen,workshopBalance-40);api.leaveRoom();

    // Catch-up is queued now: drive the same bounded frame worker as the browser.
    api.reviewSetMinutes(5*1440+510);const journalBefore=api.activities.state.sakura.journal.length;
    api.advanceAbsentTown(1440);
    let batches=0;while(api.activities.state.pendingTownMinutes>0&&batches++<10000)api.catchUpFrame();
    assert.equal(api.activities.state.pendingTownMinutes,0,'Unattended day completes through bounded batches');
    const dayRows=api.activities.state.sakura.journal.slice(journalBefore);
    assert.ok(dayRows.some(r=>r.kind==='Sale'&&r.buyer!=='Johansson'),'Residents shop while the player is absent');
    assert.ok(dayRows.some(r=>r.kind==='Restocked'),'Thuan restocks after hours');
    assert.ok(dayRows.filter(r=>r.kind==='Restocked').every(r=>r.minute%1440>=1200||r.minute%1440<540));
    const savedShop=JSON.stringify(api.activities.state.sakura);await api.enterRoom(market);api.leaveRoom();
    assert.equal(JSON.stringify(api.activities.state.sakura),savedShop,'Entering does not replay sales');
    for(const site of interiors){api.reviewSetMinutes(180);await api.enterRoom(site);api.simulate(.1);assert.equal(api.reviewCurrentRoom()?.id,site.id,'Overnight entry: '+site.id);api.leaveRoom();}
    api.runStabilityChecks();assert.equal(window.__JOHANSSON_STABILITY__.ok,true,'Post-walkthrough stability: '+JSON.stringify(window.__JOHANSSON_STABILITY__.failures));
    globalThis.fetch=originalFetch;
  }catch(error){throw quietDataUrlError(error);}
});
