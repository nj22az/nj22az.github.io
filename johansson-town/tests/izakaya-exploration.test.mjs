import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildIzakayaExploration,createMinatoMemories,MINATO_MEMORIES,MINATO_MEMORY_STORY,MINATO_RECIPE_CARD} from '../src/world/interiors/izakaya-exploration.js';
import {buildIzakayaLivedIn,MINATO_DETAIL_SURFACES} from '../src/world/interiors/izakaya-lived-in.js';
import {createIzakayaStreetView} from '../src/render/izakaya-street-view.js';

function memoryHarness(state={}){
 let shown=null,saves=0,closes=0;const curtains=[];
 const memories=createMinatoMemories({state,show:(title,text,actions)=>shown={title,text,actions},save:()=>saves++,close:()=>closes++,onCurtain:open=>curtains.push(open)});
 const read=id=>{memories.open(id);shown.actions.find(([label])=>label===MINATO_MEMORIES.find(m=>m.id===id).choice)[1]();};
 const press=label=>{const action=shown.actions.find(([text])=>text===label);assert.ok(action,'Available action: '+label);action[1]();};
 return {state,memories,read,press,curtains,get shown(){return shown;},get saves(){return saves;},get closes(){return closes;}};
}

// Match the public activities restore boundary: each saved string list keeps
// at most its first 100 entries. This catches markers falling beyond that edge.
function savedReload(state){
 const saved=JSON.parse(JSON.stringify(state));
 for(const k of ['inspectedIds','notes','inventory'])saved[k]=saved[k].filter(x=>typeof x==='string').slice(0,100);
 return memoryHarness(saved);
}

test('Minato physical memories autosave one story and one recipe across revisits',()=>{
 const h=memoryHarness();
 for(const m of MINATO_MEMORIES)h.read(m.id);
 assert.deepEqual(h.memories.snapshot(),{found:MINATO_MEMORIES.map(m=>m.id),complete:true});
 assert.equal(h.state.inventory.filter(i=>i==='Minato house recipe card').length,1);
 assert.equal(h.state.notes.filter(n=>n.startsWith('Minato · First Lantern Night:')).length,1);
 assert.ok(h.saves>=4);
 const reload=memoryHarness(JSON.parse(JSON.stringify(h.state)));for(const m of MINATO_MEMORIES)reload.read(m.id);
 assert.equal(reload.state.inventory.filter(i=>i==='Minato house recipe card').length,1);
 assert.equal(reload.state.notes.filter(n=>n.startsWith('Minato · First Lantern Night:')).length,1);
 const before=reload.saves;reload.memories.open('unknown');assert.equal(reload.saves,before);
});

test('full field books retain the Minato story and discovery markers through save restore',()=>{
 const h=memoryHarness({inspectedIds:Array.from({length:100},(_,i)=>'old-inspection:'+i),notes:Array.from({length:100},(_,i)=>'Older field note '+i),inventory:[]});
 for(const m of MINATO_MEMORIES)h.read(m.id);
 assert.equal(h.state.inspectedIds.length,100);assert.equal(h.state.notes.length,100);
 for(const id of [...MINATO_MEMORIES.map(m=>m.id),'complete','collected'])assert.ok(h.memories.seen(id),'Saved marker '+id);
 // Existing note() appends ordinary notes then trims the oldest. The newly
 // earned story must survive the next ordinary note rather than being oldest.
 h.state.notes.push('A new ordinary field note');h.state.notes=h.state.notes.slice(-100);
 const reload=savedReload(h.state);
 assert.equal(reload.state.notes.filter(n=>n===MINATO_MEMORY_STORY).length,1);
 assert.deepEqual(reload.memories.snapshot(),{found:MINATO_MEMORIES.map(m=>m.id),complete:true});
 for(const m of MINATO_MEMORIES)reload.read(m.id);
 assert.equal(reload.state.inventory.filter(i=>i===MINATO_RECIPE_CARD).length,1);
});

test('a full bag defers the recipe card and allows one claim after reload and freeing a slot',()=>{
 const h=memoryHarness({inventory:Array.from({length:100},(_,i)=>'Existing item '+i)});
 for(const m of MINATO_MEMORIES)h.read(m.id);
 assert.equal(h.state.inventory.length,100);assert.ok(h.memories.seen('complete'));assert.equal(h.memories.seen('collected'),false);
 assert.equal(h.state.inventory.includes(MINATO_RECIPE_CARD),false);assert.match(h.shown.text,/Make room in your bag/);
 h.press('Take the recipe card');assert.equal(h.state.inventory.length,100);assert.equal(h.memories.seen('collected'),false);
 const reload=savedReload(h.state);reload.state.inventory.pop();reload.memories.open('guestbook');reload.press('Take the recipe card');
 assert.equal(reload.state.inventory.length,100);assert.equal(reload.state.inventory.filter(i=>i===MINATO_RECIPE_CARD).length,1);assert.ok(reload.memories.seen('collected'));
 assert.ok(!reload.shown.actions.some(([label])=>label==='Take the recipe card'));
 // An intentionally discarded card must never turn this discovery into an
 // infinite item source; the collected marker survives a room/save revisit.
 reload.state.inventory=reload.state.inventory.filter(i=>i!==MINATO_RECIPE_CARD);
 const revisit=savedReload(reload.state);for(const m of MINATO_MEMORIES)revisit.read(m.id);
 assert.equal(revisit.state.inventory.includes(MINATO_RECIPE_CARD),false);assert.ok(revisit.memories.seen('collected'));
});

test('an already owned recipe is recognised and the story reader survives normal note eviction',()=>{
 const h=memoryHarness({inventory:[MINATO_RECIPE_CARD,...Array.from({length:99},(_,i)=>'Other item '+i)]});
 for(const m of MINATO_MEMORIES)h.read(m.id);
 assert.equal(h.state.inventory.length,100);assert.equal(h.state.inventory.filter(i=>i===MINATO_RECIPE_CARD).length,1);assert.ok(h.memories.seen('collected'));
 h.state.notes=[];const reload=savedReload(h.state);reload.memories.open('recipe');reload.press('Read the recipe card');
 assert.equal(reload.shown.title,MINATO_RECIPE_CARD);assert.equal(reload.shown.text,MINATO_MEMORY_STORY);reload.press('Keep exploring');assert.equal(reload.closes,1);
});

test('window controls operate the cloth without claiming a memory and the radio saves its chosen station',()=>{
 const h=memoryHarness();h.memories.open('window');h.press('Draw the curtains');h.memories.open('window');h.press('Slide the curtains open');
 assert.deepEqual(h.curtains,[false,true]);assert.equal(h.closes,2);assert.equal(h.saves,0);assert.deepEqual(h.memories.snapshot(),{found:[],complete:false});
 for(const m of MINATO_MEMORIES.filter(m=>m.id!=='radio'))h.read(m.id);
 h.memories.open('radio');h.press('Tune to harbour music');
 assert.equal(h.state.radioStation,1);assert.equal(h.shown.title,'Harbour music');assert.ok(h.memories.seen('radio'));assert.ok(h.memories.seen('complete'));
 const reload=savedReload(h.state);assert.equal(reload.state.radioStation,1);assert.ok(reload.memories.seen('collected'));
 h.press('Back to the radio');assert.equal(h.shown.title,'The old radio');
});

test('the Minato guestbook rests on its actual table and leaves lived-in objects clear',()=>{
 installDOM();const room=new THREE.Group(),{group}=buildIzakayaExploration(room,{}),book=new THREE.Box3();
 const solids=group.getObjectByName('Minato door joinery and discovery objects').geometry.attributes.position;
 for(let i=0;i<solids.count;i++){const p=new THREE.Vector3().fromBufferAttribute(solids,i);if(p.x>-5&&p.x<-4.7&&p.z>4.7&&p.z<5&&p.y<.9)book.expandByPoint(p);}
 assert.ok(!book.isEmpty());const table=MINATO_DETAIL_SURFACES.loungeSouth;
 assert.ok(book.min.x>=table.minX&&book.max.x<=table.maxX&&book.min.z>=table.minZ&&book.max.z<=table.maxZ);
 assert.ok(Math.abs(book.min.y-table.y-.004)<.000001,'Book clears the thin table patina');
 const {placements}=buildIzakayaLivedIn(new THREE.Group());
 for(const p of placements.filter(p=>p.surface==='loungeSouth'))assert.ok(!(book.min.x<p.max[0]&&book.max.x>p.min[0]&&book.min.z<p.max[2]&&book.max.z>p.min[2]),'Guestbook clears '+p.id);
});

test('sliding door pockets preserve the entire entry and curtains clear wooden frames',()=>{
 installDOM();let menu;
 const room=new THREE.Group(),{group,memories}=buildIzakayaExploration(room,{anchor(){},exploration:{state:{},show:(title,text,actions)=>menu={title,text,actions}}});
 room.updateMatrixWorld(true);
 const door=group.getObjectByName('Minato door joinery and discovery objects');
 const ray=new THREE.Raycaster();
 for(const x of [-1.85,-1,0,1,1.85])for(const y of [.12,1,2.18]){ray.set(new THREE.Vector3(x,y,5.7),new THREE.Vector3(0,0,1));ray.far=.65;assert.deepEqual(ray.intersectObject(door),[],'Clear door route at '+x+','+y);}
 const curtains=group.getObjectByName('Minato sliding window curtains');
 for(const m of curtains.children){const b=new THREE.Box3().setFromObject(m);assert.ok(b.min.x>=-5.03&&b.max.x<=-2.77,'Open curtain stays inside the frame');assert.ok(b.max.z<6.245,'Cloth stays in front of the timber');}
 memories.open('window');menu.actions.find(([label])=>label==='Draw the curtains')[1]();room.updateMatrixWorld(true);
 for(const m of curtains.children){const b=new THREE.Box3().setFromObject(m);assert.ok(b.min.x>=-5.045&&b.max.x<=-2.755,'Drawn cloth overlaps only the front of the outer frame');assert.ok(b.max.z<6.245,'Drawn cloth never intersects timber');}
 const [left,right]=curtains.children.map(m=>new THREE.Box3().setFromObject(m)).sort((a,b)=>a.min.x-b.min.x);
 assert.ok(left.max.x>=right.min.x-.000001,'Drawing the curtains closes the central glass rather than leaving a gap');
});

function streetHarness(viewCamera){
 let now=0,draws=0,target=null;
 const scene=new THREE.Scene(),town=new THREE.Group(),room=new THREE.Group(),hands=new THREE.Group(),hidden=new THREE.Group(),light=new THREE.HemisphereLight();scene.add(town,room,hands,hidden,light);town.visible=false;hidden.visible=false;
 const oldTarget={name:'Main render target'},clipping=[];
 const renderer={target:oldTarget,autoClear:false,clippingPlanes:clipping,shadowMap:{enabled:true},getRenderTarget(){return this.target;},setRenderTarget(t){this.target=t;},render(s,c){draws++;target=this.target;assert.equal(town.visible,true);assert.equal(room.visible,false);assert.equal(hands.visible,false);assert.equal(hidden.visible,false);assert.equal(light.visible,true);assert.equal(this.shadowMap.enabled,false);assert.equal(this.autoClear,true);assert.equal(this.clippingPlanes.length,1);assert.ok(c.getWorldDirection(new THREE.Vector3()).distanceTo(new THREE.Vector3(1,0,0))<.000001);}};
 const view=createIzakayaStreetView({renderer,scene,town,room,site:{entryFacing:Math.PI/2,door:[-7.05,0,-10.43]},viewCamera,now:()=>now});
 const restored=()=>{assert.equal(renderer.target,oldTarget);assert.equal(renderer.autoClear,false);assert.equal(renderer.clippingPlanes,clipping);assert.equal(renderer.shadowMap.enabled,true);assert.equal(town.visible,false);assert.equal(room.visible,true);assert.equal(hands.visible,true);assert.equal(hidden.visible,false);};
 return {view,renderer,room,restored,setNow:n=>now=n,get draws(){return draws;},get target(){return target;}};
}

test('actual street preview uses one small target, throttles updates and restores renderer state',()=>{
 const h=streetHarness();h.view.update();h.restored();assert.equal(h.draws,1);assert.equal(h.target.width,512);assert.equal(h.target.height,256);
 h.setNow(2499);h.view.update();assert.equal(h.draws,1);h.setNow(2500);h.view.update();assert.equal(h.draws,2);
 h.room.visible=false;h.setNow(5000);h.view.update();assert.equal(h.draws,2);h.room.visible=true;
 let disposed=0;h.target.addEventListener('dispose',()=>disposed++);h.view.dispose();h.view.dispose();assert.equal(disposed,1);h.view.update();assert.equal(h.draws,2);
});

test('street capture pauses with a lost context or hidden tab and refreshes on return',()=>{
 const h=streetHarness();let lost=true;
 h.renderer.getContext=()=>({isContextLost:()=>lost});
 h.view.update();assert.equal(h.draws,0,'A lost context never binds or renders the street target');h.restored();
 lost=false;h.view.update();assert.equal(h.draws,1,'Restoration populates the first texture immediately');h.restored();
 h.setNow(2500);lost=true;h.view.update();assert.equal(h.draws,1);h.restored();
 lost=false;h.view.update();assert.equal(h.draws,2,'A paused refresh does not consume the next update');h.restored();
 const descriptor=Object.getOwnPropertyDescriptor(document,'hidden');
 try{
  Object.defineProperty(document,'hidden',{configurable:true,value:true});
  h.setNow(5000);h.view.update();assert.equal(h.draws,2,'A background tab does not render the optional street view');h.restored();
  Object.defineProperty(document,'hidden',{configurable:true,value:false});
  h.view.update();assert.equal(h.draws,3,'Returning to the tab refreshes without another throttle interval');h.restored();
 }finally{
  if(descriptor)Object.defineProperty(document,'hidden',descriptor);else delete document.hidden;
  h.view.dispose();
 }
});

test('failed street capture restores target, clipping, shadows and visibility',()=>{
 const h=streetHarness();h.renderer.render=()=>{throw Error('Street GPU failure');};
 assert.throws(()=>h.view.update(),/Street GPU failure/);h.restored();h.view.dispose();
});

test('street refresh stops while its window is outside the player camera and resumes when visible',()=>{
 const camera=new THREE.PerspectiveCamera(55,1.6,.1,90);camera.position.set(-3.9,1.72,0);camera.lookAt(-3.9,1.72,-6);
 const h=streetHarness(camera);h.view.update();assert.equal(h.draws,1,'Initial texture is populated even before looking at the window');h.restored();
 h.setNow(2500);h.view.update();assert.equal(h.draws,1,'No off-screen street refresh');
 camera.lookAt(-3.9,1.72,6.283);h.view.update();assert.equal(h.draws,2,'A visible window refreshes without an extra throttle delay');h.restored();h.view.dispose();
});
