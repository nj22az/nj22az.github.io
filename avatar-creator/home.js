import * as THREE from '../johansson-town/vendor/three.module.js';
import {buildMayorHome,MAYOR_HOME_FLOOR} from '../johansson-town/src/world/interiors/town-hall.js';
import {createHomeCustomization} from '../johansson-town/src/world/interiors/home-customization.js';
import {createHomeDecorating} from '../johansson-town/src/build/home-decorate.js';
import {HOME_WALLS,HOME_TEXTILES,restoreHomeDecor,unlockedHomeKeepsakes} from '../johansson-town/src/progression/home-decor.js';
import {readPlayers,readSave} from '../johansson-town/src/save.js';
import {readStudioChoices,writeStudioChoices} from '../johansson-town/src/studio-handoff.js';

/** Every keepsake the shelf can hold, and how each is earned in World (src/progression/home-decor.js). */
const KEEPSAKES=Object.freeze([
 {id:'postcard',name:'Swedish harbour postcard',the:'the Swedish harbour postcard',how:'yours from the start'},
 {id:'shell',name:'Fishing-pier shell',the:'the fishing-pier shell',how:'your first catch'},
 {id:'cat',name:'Tama thank-you cat',the:'the Tama thank-you cat',how:'bringing Tama home'},
 {id:'radio',name:'Workshop miniature radio',the:'the workshop miniature radio',how:'the walk to Chin’s workshop'},
]);
const ceilingAbove=2.5;
// The whole room from above, from the same side as the furniture tool's dollhouse view (src/build/build-mode.js),
// far enough back to see the walls and the shelf.
const VIEW={azimuth:Math.PI*1.25,elevation:1.05,distance:9.5};
/** The middle of the rooms he furnishes: the living room and the kitchen on his house's ground floor (MAYOR_HOME_FLOOR). */
const HOME_CENTRE=Object.freeze([-3.48,.4,0]);

/**
 * "Decorate home": the mayor's home, his house on Kitano-jima, decorated and furnished here and sent to Johansson World,
 * which only shows it (World's src/studio-handoff.js). It is World's own house (johansson-house-interior.js, by its
 * old name in town-hall.js), its own colours and
 * keepsakes (home-decor.js) and its own furniture tool (home-decorate.js), so what you see here is what World shows.
 * Keepsakes are earned by playing World; the shelf offers the ones this saved game has earned.
 */
export function createHomeWorkspace(){
 const root=document.createElement('main');root.className='scene-workspace home-workspace';root.hidden=true;
 const choice=(name,label,items)=>`<p class="scene-label" id="home-${name}">${label}</p><div class="scene-choice" role="group" aria-labelledby="home-${name}" data-choice="${name}">${items.map(i=>`<button type="button" data-value="${i.id}" aria-pressed="false">${i.name}</button>`).join('')}</div>`;
 root.innerHTML=`<div class="scene-heading"><div><h1>Decorate your home</h1><p>Johansson’s house on Kitano-jima: the living room and the kitchen on the ground floor. Choose the colours and the keepsake, arrange the furniture, then send it to Johansson World.</p></div></div>
 <div class="scene-layout"><section class="scene-picture" aria-label="The mayor’s home"><div class="scene-frame"><canvas class="home-canvas" role="img" aria-label="The mayor’s home, seen from above."></canvas></div><p class="scene-hint" data-hint></p></section>
 <aside class="scene-controls" aria-label="Home controls"><p class="home-save" data-save></p>
 ${choice('wall','Wall colour',HOME_WALLS)}${choice('textile','Cushions and quilt',HOME_TEXTILES)}
 <p class="scene-label" id="home-keepsake">Keepsake shelf</p><div class="scene-choice home-keepsakes" role="group" aria-labelledby="home-keepsake" data-choice="keepsake">${KEEPSAKES.map(k=>`<button type="button" data-value="${k.id}" aria-pressed="false" title="Earned by ${k.how}">${k.name}</button>`).join('')}</div><p class="home-note" data-keepsake-note></p>
 <p class="scene-label">Furniture</p><p class="home-note" data-furniture></p><div class="scene-save-row"><button type="button" data-action="arrange">Arrange furniture</button></div>
 <div class="scene-save-row"><button type="button" class="scene-primary" data-action="send">Use in Johansson World</button><a class="scene-button home-play" href="/johansson-town/">Play Johansson World</a></div>
 <p class="scene-export-status" role="status" aria-live="polite" data-status></p></aside></div>`;
 document.body.append(root);
 const $=s=>root.querySelector(s),canvas=$('canvas'),status=$('[data-status]');

 // What this saved game has in World: the home Studio sent last (or, before that, the one in the save) and the
 // keepsakes it has earned. Re-read every time the workspace opens, so a World played since then counts.
 let state=null,dirty=false,leaving=false;
 function read(){
  const save=readSave(globalThis.localStorage)||{},sent=readStudioChoices(globalThis.localStorage).home;
  return {homeDecor:restoreHomeDecor(sent||save.homeDecor),fish:save.fish,quest:save.quest,kenjiEscort:save.kenjiEscort};
 }
 // Unsent changes would be lost by leaving the page: the browser asks first (and the Play link does).
 const guard=event=>{if(dirty&&!leaving){event.preventDefault();event.returnValue='';}};
 addEventListener('beforeunload',guard);
 const player=()=>{const roster=readPlayers(globalThis.localStorage);return roster.players.find(p=>p.id===roster.active)?.name||'Visitor';};

 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setPixelRatio(Math.min(2,globalThis.devicePixelRatio||1));
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xe8e4d8);
 scene.add(new THREE.HemisphereLight(0xfff5e5,0x80949c,2.2));const sun=new THREE.DirectionalLight(0xfff3de,1.1);sun.position.set(3,6,4);scene.add(sun);
 const camera=new THREE.PerspectiveCamera(42,4/3,.05,60);
 let room=null,decor=null,arranging=null,holding=false,frame=0,shown=false;
 const overview=()=>{const r=VIEW.distance*Math.cos(VIEW.elevation);camera.position.set(HOME_CENTRE[0]+Math.sin(VIEW.azimuth)*r,VIEW.distance*Math.sin(VIEW.elevation),HOME_CENTRE[2]+Math.cos(VIEW.azimuth)*r);camera.lookAt(...HOME_CENTRE);};
 const stage={hold(){holding=true;},release(){holding=false;overview();},show(pos,at){camera.position.set(...pos);camera.lookAt(...at);}};

 /** Builds World's room from the current choices (again after loading, so furniture and keepsakes start fresh). */
 function build(){
  arranging?.close();
  // The old room goes with everything it put on the graphics card (a mode switch on the iPad must not add up).
  if(room){scene.remove(room);room.traverse(o=>{if(!o.isMesh)return;o.geometry?.dispose();for(const m of [o.material].flat()){m?.map?.dispose();m?.dispose();}});}
  room=new THREE.Group();scene.add(room);const colliders=[];
  const layout=buildMayorHome({room,reg(){},action(){},exit(){},collider:(x,z,w,d,height,minY)=>colliders.push({x,z,w,d,height,minY})});
  // His house has three floors (World's johansson-house-interior.js): the furniture is arranged on the ground floor.
  layout?.showStorey?.('G0');
  const group=room.getObjectByName('Mayor’s home');
  // The ceiling and the tops of the walls are lifted off, as in the furniture tool, so the room reads from above.
  group.traverse(o=>{if(o.isMesh){o.updateWorldMatrix(true,false);if(o.getWorldPosition(new THREE.Vector3()).y>ceilingAbove)o.visible=false;}});
  decor=createHomeCustomization({room,state});
  arranging=createHomeDecorating({group,colliders,state,save:changed,canvas,camera,floor:MAYOR_HOME_FLOOR.walkable,keepClear:MAYOR_HOME_FLOOR.keepClear,stage,onClose:()=>{refresh();root.querySelector('[data-action="arrange"]')?.focus();}});
  overview();refresh();
 }
 function changed(){dirty=true;refresh();}
 function refresh(){
  if(!state)return;
  const applied=decor?.snapshot()||restoreHomeDecor(state.homeDecor),earned=new Set(unlockedHomeKeepsakes(state).map(k=>k.id));
  for(const group of root.querySelectorAll('[data-choice]'))for(const b of group.querySelectorAll('button')){
   const key=group.dataset.choice;b.setAttribute('aria-pressed',String(applied[key]===b.dataset.value));
   if(key==='keepsake')b.disabled=!earned.has(b.dataset.value);
  }
  const locked=KEEPSAKES.filter(k=>!earned.has(k.id));
  $('[data-keepsake-note]').textContent=locked.length?'Still to earn in Johansson World: '+locked.map(k=>`${k.the} (${k.how})`).join(', ')+'.':'Every keepsake is earned.';
  const items=arranging?.placements.list().length||0;
  $('[data-furniture]').textContent=items?`${items} ${items===1?'piece':'pieces'} placed. Arrange furniture to move, turn or remove them.`:'Nothing placed yet. Arrange furniture to add a tansu, a lamp, a palm, a rug and more.';
  $('[data-save]').textContent=`For ${player()}’s saved game. `+(dirty?'Changed here: not in Johansson World yet.':'This is the home as Johansson World has it.');
  $('[data-hint]').textContent=holding?'Drag to look around, click the floor to place, click a piece to move it.':'Your changes stay here until you use them in Johansson World.';
 }
 root.addEventListener('click',event=>{
  if(event.target.closest('.home-play')){if(dirty&&!confirm('Your home changes are not in Johansson World yet. Leave without sending them?'))event.preventDefault();else leaving=true;return;}
  const b=event.target.closest('button');if(!b||!state)return;
  const group=b.closest('[data-choice]');
  if(group){state.homeDecor={...restoreHomeDecor(state.homeDecor),[group.dataset.choice]:b.dataset.value};changed();return;}
  if(b.dataset.action==='arrange'){arranging.open();refresh();}
  else if(b.dataset.action==='send'){
   const sent=writeStudioChoices({home:state.homeDecor},globalThis.localStorage);
   if(sent){dirty=false;status.textContent='Your home is in Johansson World now. It shows when World opens, and at once in a World tab that is already open.';}
   else status.textContent='Browser storage is unavailable, so Johansson World could not be updated.';
   refresh();
  }
 });

 function resize(){
  const w=Math.max(1,canvas.clientWidth),h=Math.max(1,Math.round(w*.75));
  if(canvas.width!==Math.round(w*renderer.getPixelRatio())||canvas.height!==Math.round(h*renderer.getPixelRatio()))renderer.setSize(w,h,false);
  camera.aspect=w/h;camera.updateProjectionMatrix();
 }
 const resizer=new ResizeObserver(resize);resizer.observe(canvas);
 function loop(){if(!shown)return;frame=requestAnimationFrame(loop);resize();renderer.render(scene,camera);}

 return {root,
  show(){
   // Unsent changes are kept; otherwise the home is read again, as World has it now, and rebuilt only if it changed.
   if(!room){state=read();dirty=false;build();}
   else if(!dirty){const fresh=read();if(JSON.stringify(fresh)!==JSON.stringify(state)){state=fresh;build();}else refresh();}
   else refresh();
   root.hidden=false;shown=true;cancelAnimationFrame(frame);loop();document.getElementById('loading')?.remove();
  },
  hide(){arranging?.close();root.hidden=true;shown=false;cancelAnimationFrame(frame);},
  dispose(){this.hide();removeEventListener('beforeunload',guard);resizer.disconnect();renderer.dispose();root.remove();},
  /** For tests: the choices as they stand, and whether they have been sent. */
  get state(){return {homeDecor:structuredClone(state?.homeDecor),dirty};},
 };
}
