import * as THREE from '../johansson-town/vendor/three.module.js';
import {buildAvatar} from '../johansson-town/src/avatars/build.js';
import {drawFace} from '../johansson-town/src/avatars/face.js';
import {svg} from '../johansson-town/src/ui/icons.js';
import {ORIGINAL_THUAN_RECIPE,recipeFor,RESIDENT_NAMES} from '../johansson-town/src/avatars/cast.js';
import {normalizeRecipe} from '../johansson-town/src/avatars/recipe.js';
import {drawCaptions,comicLayout,FORMATS} from '../johansson-town/src/photo/layout.js';
import {buildSceneWorld} from './scene-world.js';
import {poseSceneAvatar,placeSceneAvatar} from './scene-avatar.js?v=20261011-1';
import {SCENE_KEY,MAX_ACTORS,MAX_PANELS,LOCATIONS,emptyScene,normalizeScene,addCharacter,removeCharacter,restoreCharacter,panelOrder,text} from './scene-model.mjs?v=20261011-1';
import {POSE_GROUPS,EXPRESSION_GROUPS,seatedPose} from './scene-catalogue.mjs';
import {wrapTurn,turnToward,touchAngle,twistTurn,nudgeStep,placeToolbar,pickBox,nearestSeat} from './scene-controls.mjs';
import {touchFirst,dataURLToBlob,canvasToBlob,createReadyFile,bindSaveLink,createPreview} from './studio-share.mjs';

const nameOf=n=>n==='Thuan'?'Thuận':n;
const loadImage=url=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('The image could not be loaded.'));img.src=url;});
/** Degrees for one tap on a turn button, and for one Q/E key press. */
const TURN_TAP=30,TURN_KEY=15,UNDO_MS=7000,PORTRAIT=96;
// Sit down and stand up as a seated and a standing figure (World's icon set has no seated one).
const figure=body=>`<svg class="ui-icon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const sitIcon=figure('<circle cx="9" cy="4.5" r="2.5"/><path d="M9 8v6h6v6M9 10.5l4.5 2M4 21h16"/>'),standIcon=figure('<circle cx="12" cy="4.5" r="2.5"/><path d="M12 8v7M8.5 11.5h7M9.5 21l2.5-6 2.5 6"/>');
const choice=(name,label,options)=>`<div class="scene-choice" role="group" aria-label="${label}" data-choice="${name}">${options.map(([value,text])=>`<button type="button" data-value="${value}" aria-pressed="false">${text}</button>`).join('')}</div>`;

/** 3D scene editor: shared town geometry, ground, furniture and avatar models. */
export function createSceneWorkspace({getCharacter,onEdit,onMode}){
 let state=emptyScene();try{state=normalizeScene(JSON.parse(localStorage.getItem(SCENE_KEY)),normalizeRecipe);}catch{}
 let selected=state.actors[0]?.id??null,step='location',mode='scene',generation=0,pending=Promise.resolve(),valid=false,renderer;
 const panels=[],avatars=new Map(),portraits=new Map();
 let world=null,worldId='',views=null,townData=null,capturing=false,queue=Promise.resolve(),boxes=[],layoutStyle='grid',overlayStep='';
 const touch=touchFirst();
 const root=document.createElement('main');root.className='scene-workspace';root.hidden=true;
 root.innerHTML=`<div class="scene-heading"><div><h1>Build a scene</h1><p>Choose a place, add characters, then pose them and write your dialogue.</p></div><a class="scene-button" data-save="project">Download project</a><button type="button" data-action="open-project">Open project</button><input type="file" data-project-input accept=".json,application/json" hidden></div>
 <nav class="scene-steps" aria-label="Scene building steps">
 <button type="button" data-step="location">1. Choose location</button><button type="button" data-step="characters">2. Add characters</button><button type="button" data-step="pose">3. Pose & position</button><button type="button" data-step="text">4. Add text</button><button type="button" data-step="export">5. Export</button></nav>
 <div class="scene-layout"><section class="scene-picture" aria-label="Scene preview"><div class="scene-frame"><canvas width="1200" height="900" tabindex="0" aria-label="Scene. Tap a character to select them and drag to move them."></canvas><div class="scene-selection" hidden></div>
 <div class="scene-toolbar" role="group" aria-label="Selected character" hidden>
 <button type="button" data-tool="turn-left" aria-label="Turn left" title="Turn left">${svg('reset')}</button><button type="button" data-tool="turn-right" aria-label="Turn right" title="Turn right">${svg('reset')}</button><button type="button" data-tool="face-camera" aria-label="Face the camera" title="Face the camera">${svg('camera')}</button><button type="button" data-tool="sit" aria-label="Sit down" title="Sit down">${sitIcon}</button><button type="button" data-tool="remove" aria-label="Remove from the scene" title="Remove from the scene">${svg('trash')}</button></div></div>
 <div class="scene-strip" role="group" aria-label="Characters in this scene"></div>
 <p class="scene-hint"></p><details class="scene-camera-box" open><summary>Camera</summary><div class="scene-camera"><label>Camera turn<input data-camera="orbit" type="range" min="-180" max="180" step="2" value="0"></label><label>Camera height<input data-camera="elevation" type="range" min="-25" max="40" step="1" value="0"></label><label>Camera distance<input data-camera="zoom" type="range" min=".55" max="1.8" step=".05" value="1"></label><button data-action="reset-camera">Reset camera</button></div></details><p class="scene-status" role="status" aria-live="polite"></p></section>
 <aside class="scene-controls" aria-label="Scene controls">
 <section data-pane="location"><h2>Choose a location</h2><p>These are the real 3D locations in Johansson World. Move the camera to compose your scene.</p><div class="scene-locations"></div></section>
 <section data-pane="characters" hidden><h2>Add characters</h2><p>Use your own character or choose a town resident. Up to six characters can share a scene.</p><button class="scene-primary" data-action="add-current">Add my character</button><label>Town resident<select data-field="resident" aria-label="Town resident"></select></label><button data-action="add-resident">Add resident</button></section>
 <section data-pane="pose" hidden><h2>Pose & position</h2><p class="scene-pane-note" data-note="pose"></p>
 <h3 class="scene-picker-title" id="scene-pose-title">Pose</h3><div class="scene-picker" data-picker="pose" role="group" aria-labelledby="scene-pose-title"></div>
 <h3 class="scene-picker-title" id="scene-face-title">Expression</h3><div class="scene-picker" data-picker="expression" role="group" aria-labelledby="scene-face-title"></div>
 <div class="scene-actor-controls"><label>Turn<input data-field="turn" type="range" min="-180" max="180" step="5"></label><label>Size<input data-field="size" type="range" min=".6" max="1.4" step=".01"></label>
 <label>Left / right<input data-field="x" type="range" min="-8" max="8" step=".01"></label><label>Near / far<input data-field="z" type="range" min="-8" max="8" step=".01"></label>
 <label>Use furniture<select data-field="seat" aria-label="Use furniture"><option value="">Stand on ground</option></select></label><button data-action="edit-character">Edit appearance</button><button data-action="duplicate">Duplicate character</button><button data-action="remove">Remove character</button></div></section>
 <section data-pane="text" hidden><h2>Add text</h2><label>Picture style<select data-field="style" aria-label="Picture style"><option value="photo">Photograph with speech bubbles</option><option value="meme">Meme with top and bottom text</option><option value="comic">Comic panel with caption</option></select></label>
 <label>Selected character’s speech<input data-field="speech" maxlength="120" placeholder="What are they saying?" aria-label="Selected character’s speech"></label>
 <label>Top text (meme)<input data-field="top" maxlength="120" placeholder="WHEN THE FERRY IS LATE" aria-label="Top text (meme)"></label><label>Bottom text / caption<input data-field="bottom" maxlength="120" placeholder="Write your punchline…" aria-label="Bottom text / caption"></label></section>
 <section data-pane="export" hidden><h2>Export your picture</h2><p class="scene-label">Picture format</p>${choice('format','Picture format',[['landscape','Landscape'],['square','Square'],['portrait','Portrait']])}
 <div class="scene-save-row"><a class="scene-save scene-primary" data-save="scene">Save picture</a><button data-action="preview">Preview</button></div><p class="scene-save-note"></p><p class="scene-export-status" role="status" aria-live="polite" data-status="scene"></p>
 <div class="scene-save-row"><button data-action="capture">Add panel to comic</button><button data-action="comic">Open comic</button></div><p>Your scene is saved in this browser. Download a project to keep an editable copy, including captured panels.</p></section>
 <div class="scene-next"><button data-action="previous">Previous step</button><button class="scene-primary" data-action="next">Next: Add characters</button></div>
 </aside></div>
 <section class="scene-comic" hidden><h2>Your comic · <span data-panel-count>0</span> / 4 panels</h2><p>Compose a scene, then select Add panel to comic. Change the location, poses or dialogue for the next panel.</p><div class="scene-panels"></div><p class="scene-label">Comic layout</p>${choice('layout','Comic layout',[['grid','Comic page'],['strip','Horizontal strip']])}
 <div class="scene-save-row"><button data-action="capture">Add current scene as panel</button><button data-action="compose">Compose next panel</button></div>
 <div class="scene-save-row"><a class="scene-save scene-primary" data-save="comic">Save comic</a><button data-action="preview-comic">Preview comic</button></div><p class="scene-save-note"></p><p class="scene-export-status" role="status" aria-live="polite" data-status="comic"></p><p>Captured panels stay available while this page is open. Download a project to save them.</p></section>
 <div class="scene-toast" hidden><span class="scene-toast-text" role="status" aria-live="polite"></span><button type="button" data-undo>Undo</button></div>`;
 document.body.append(root);
 const $=s=>root.querySelector(s),field=n=>$(`[data-field="${n}"]`),canvas=$('canvas'),ctx=canvas.getContext('2d'),status=$('.scene-status'),selection=$('.scene-selection'),toolbar=$('.scene-toolbar'),strip=$('.scene-strip'),frame=$('.scene-frame');
 const announce=s=>{status.textContent=s;};
 const current=()=>state.actors.find(a=>a.id===selected);
 const keys=['location','characters','pose','text','export'];
 // Every resident of World, as World draws them (with any look published from Studio).
 const resident=field('resident');resident.append(...RESIDENT_NAMES.map(n=>new Option(nameOf(n),n)));
 for(const [id,name] of LOCATIONS){const b=document.createElement('button');b.type='button';b.dataset.location=id;b.setAttribute('aria-label',name);const img=document.createElement('img');img.src=`../johansson-town/assets/images/feed/${id}.webp`;img.alt='';img.loading='lazy';const label=document.createElement('span');label.textContent=name;b.append(img,label);b.onclick=()=>{state.location=id;state.camera={orbit:0,elevation:0,zoom:1};for(const a of state.actors){a.seat='';a.x=0;a.z=0;}changed();sync();announce(name+' selected. Continue to Add characters.');};$('.scene-locations').append(b);}
 $('.scene-hint').textContent=touch?'Tap a character to select them. Drag to move, twist two fingers to turn.':'Click a character to select them. Drag to move. Q and E turn, the arrow keys nudge, Delete removes.';
 for(const note of root.querySelectorAll('.scene-save-note'))note.textContent=touch?'Save opens the share sheet: choose Save Image to put it in Photos.':'';

 // ---- Saving: every file is made ahead of time so a tap only hands it over (studio-share.mjs). ----
 // Where a saved file went: Photos via the share sheet on an iPad; otherwise the downloads (on an iPad, the Files app).
 const saved=what=>({download:what+(touch?' saved to Downloads in the Files app.':' saved to your downloads.'),shared:'Done. If you chose Save Image, the '+what.toLowerCase()+' is in Photos.'});
 const say=name=>text=>{const line=$(`[data-status="${name}"]`);if(line)line.textContent=text;};
 const preview=createPreview();
 const sceneName=()=>'johansson-studio-'+state.location+'.png';
 let sceneLink=()=>{};const sceneFile=createReadyFile({name:sceneName,type:'image/png',build:()=>canvasToBlob(canvas),
  buildNow:()=>valid?dataURLToBlob(canvas.toDataURL('image/png')):null,onChange:()=>{sceneLink();preview.update();}});
 sceneLink=bindSaveLink($('[data-save="scene"]'),sceneFile,{say:say('scene'),words:{busy:'The picture is still being drawn. Try again in a moment.',...saved('Picture')}});
 function composeComic(){
  const layout=comicLayout(panels.length,layoutStyle),out=document.createElement('canvas');out.width=layout.width;out.height=layout.height;const c=out.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,out.width,out.height);
  panels.forEach((p,i)=>{const r=layout.cells[i],s=Math.min(r.w/p.image.width,r.h/p.image.height),w=p.image.width*s,h=p.image.height*s;c.drawImage(p.image,r.x+(r.w-w)/2,r.y+(r.h-h)/2,w,h);c.strokeStyle='#243442';c.lineWidth=2;c.strokeRect(r.x,r.y,r.w,r.h);});
  return out;
 }
 let comicLink=()=>{};const comicFile=createReadyFile({name:'johansson-studio-comic.png',type:'image/png',build:()=>panels.length?canvasToBlob(composeComic()):null,
  buildNow:()=>panels.length?dataURLToBlob(composeComic().toDataURL('image/png')):null,onChange:()=>{comicLink();preview.update();}});
 comicLink=bindSaveLink($('[data-save="comic"]'),comicFile,{say:say('comic'),disabled:()=>!panels.length,words:{busy:'Add a panel first.',...saved('Comic')}});
 const projectFile={ready:false,now:()=>({file:new File([JSON.stringify({format:'johansson-studio-project',version:1,scene:state,panels:panels.map(p=>p.dataURL)})],'johansson-studio-project.json',{type:'application/json'}),url:''})};
 bindSaveLink($('[data-save="project"]'),projectFile,{say:text=>announce(text),words:{download:'Editable project'+(touch?' saved to Downloads in the Files app, including comic panels.':' downloaded, including comic panels.'),shared:'Done. If you chose Save to Files, the project is in the Files app.'}});

 function save(){try{localStorage.setItem(SCENE_KEY,JSON.stringify(state));}catch{announce('Browser storage is unavailable. Download a project to keep your scene.');}}
 function changed(){save();sceneFile.invalidate();pending=draw();syncSelection();}
 function setStep(value){step=value;for(const pane of root.querySelectorAll('[data-pane]'))pane.hidden=pane.dataset.pane!==step;for(const b of root.querySelectorAll('[data-step]')){b.setAttribute('aria-current',b.dataset.step===step?'step':'false');b.onclick=()=>setStep(b.dataset.step);}const i=keys.indexOf(step);$('[data-action="previous"]').disabled=i===0;$('[data-action="next"]').hidden=i===keys.length-1;$('[data-action="next"]').textContent='Next: '+({characters:'Add characters',pose:'Pose & position',text:'Add text',export:'Export'}[keys[i+1]]||'');sync();}

 // ---- Pose and expression pickers: World's lists, grouped, as labelled buttons. ----
 function picker(name,groups,faces=false){
  const box=$(`[data-picker="${name}"]`);
  for(const group of groups){
   const section=document.createElement('section');section.className='scene-picker-group';const h=document.createElement('h4');h.textContent=group.title;
   const grid=document.createElement('div');grid.className='scene-picker-grid';
   for(const item of group.items){const b=document.createElement('button');b.type='button';b.dataset.value=item.name;b.setAttribute('aria-pressed','false');
    if(faces){const face=document.createElement('canvas');face.width=face.height=64;face.className='scene-face';face.setAttribute('aria-hidden','true');b.append(face);}
    b.append(item.label);b.onclick=()=>name==='pose'?setPose(item.name):setExpression(item.name);grid.append(b);}
   section.append(h,grid);box.append(section);
  }
  return box;
 }
 const posePicker=picker('pose',POSE_GROUPS),facePicker=picker('expression',EXPRESSION_GROUPS,true);let facesFor='';
 function paintFaces(recipe){const key=JSON.stringify(recipe);if(key===facesFor)return;facesFor=key;
  for(const c of facePicker.querySelectorAll('canvas')){const g=c.getContext('2d');try{drawFace(g,recipe,{expression:c.parentElement.dataset.value,size:64});}catch(e){console.warn('Johansson Studio: face preview',e);}}}
 function standUp(a){const seat=world?.seats.find(s=>s.id===a.seat);if(seat?.stand){a.x=seat.stand[0]-world.origin[0];a.z=seat.stand[2]-world.origin[2];}a.seat='';}
 function setPose(name){const a=current();if(!a)return;if(!seatedPose(name)&&a.seat)standUp(a);a.pose=name;changed();sync();}
 function setExpression(name){const a=current();if(!a)return;a.expression=name;changed();sync();}

 // ---- The cast strip: one chip per character (face and name), tap to select, ✕ to remove. ----
 let stripKey='';
 function renderStrip(){
  const key=state.actors.map(a=>a.id+'\u0000'+a.name+'\u0000'+(portraits.get(JSON.stringify(a.recipe))||'')).join('\u0001');
  if(key!==stripKey){stripKey=key;strip.replaceChildren(...state.actors.map(actor=>{
   const chip=document.createElement('div');chip.className='scene-chip';chip.dataset.id=actor.id;
   const pick=document.createElement('button');pick.type='button';pick.className='scene-chip-pick';pick.setAttribute('aria-pressed','false');
   const portrait=portraits.get(JSON.stringify(actor.recipe));
   if(portrait){const img=document.createElement('img');img.src=portrait;img.alt='';img.width=img.height=36;pick.append(img);}
   else{const blank=document.createElement('span');blank.className='scene-chip-face';blank.setAttribute('aria-hidden','true');pick.append(blank);}
   const label=document.createElement('span');label.className='scene-chip-name';label.textContent=actor.name;pick.append(label);
   pick.onclick=()=>select(actor.id,{reveal:true});
   const remove=document.createElement('button');remove.type='button';remove.className='scene-chip-remove';remove.setAttribute('aria-label','Remove '+actor.name);remove.title='Remove '+actor.name;remove.innerHTML=svg('close',{size:18});
   remove.onclick=()=>removeActor(actor.id);chip.append(pick,remove);return chip;}));}
  for(const chip of strip.children){const on=chip.dataset.id===selected;chip.toggleAttribute('data-selected',on);chip.firstChild.setAttribute('aria-pressed',String(on));}
  strip.hidden=mode==='comic'||step==='location'||!state.actors.length;$('.scene-hint').hidden=mode==='comic'||step==='location'||!state.actors.length;
 }
 function select(id,{reveal=false}={}){selected=id;if(reveal)overlayStep=step;sync();}

 function sync(){
  for(const c of root.querySelectorAll('[data-camera]'))c.value=state.camera[c.dataset.camera];
  const a=current();for(const n of ['turn','size','x','z','speech','seat']){field(n).disabled=!a;field(n).value=a?.[n]??'';}
  for(const n of ['style','top','bottom'])field(n).value=state[n];
  for(const [name,value] of [['format',state.format],['layout',layoutStyle]])for(const b of root.querySelectorAll(`[data-choice="${name}"] button`))b.setAttribute('aria-pressed',String(b.dataset.value===value));
  for(const b of root.querySelectorAll('[data-location]'))b.setAttribute('aria-pressed',String(b.dataset.location===state.location));
  for(const [box,value] of [[posePicker,a?.pose],[facePicker,a?.expression]])for(const b of box.querySelectorAll('button')){b.disabled=!a;b.setAttribute('aria-pressed',String(b.dataset.value===value));}
  if(a&&step==='pose')paintFaces(a.recipe);
  $('[data-note="pose"]').textContent=!state.actors.length?'Add a character first (step 2).':a?'Posing '+a.name+'. Drag them in the picture to move them.':'Select a character in the picture or in the strip below it.';
  for(const b of root.querySelectorAll('[data-action="add-current"],[data-action="add-resident"],[data-action="duplicate"]'))b.disabled=state.actors.length>=MAX_ACTORS||(b.dataset.action==='duplicate'&&!a);
  for(const b of root.querySelectorAll('[data-action="remove"],[data-action="edit-character"]'))b.disabled=!a;
  for(const b of root.querySelectorAll('[data-action="capture"]'))b.disabled=panels.length>=MAX_PANELS;
  $('.scene-comic [data-action="capture"]').classList.toggle('scene-primary',!panels.length);
  $('[data-action="preview-comic"]').disabled=!panels.length;
  sceneLink();comicLink();renderStrip();syncSelection();
 }

 // ---- The selected character in the picture: an outline and a small toolbar beside them, never over the face. ----
 let gesture=null;
 function syncSelection(){
  const a=current(),b=a&&boxes.find(x=>x.id===a.id);
  const show=!!(b&&world&&mode==='scene'&&(['characters','pose','text'].includes(step)||overlayStep===step));
  selection.hidden=!show;toolbar.hidden=!show||gesture?.kind==='twist'||!!gesture?.moved;if(!show)return;
  const w=frame.clientWidth,h=frame.clientHeight;
  Object.assign(selection.style,{left:b.left*100+'%',top:b.top*100+'%',width:(b.right-b.left)*100+'%',height:(b.bottom-b.top)*100+'%'});
  const seated=!!a.seat;
  for(const t of ['turn-left','turn-right','face-camera']){const button=toolbar.querySelector(`[data-tool="${t}"]`);button.disabled=seated;button.title=seated?'Seated characters face the way their seat faces':button.getAttribute('aria-label');}
  const sit=toolbar.querySelector('[data-tool="sit"]'),sitting=seated||seatedPose(a.pose),label=sitting?'Stand up':'Sit down';
  if(sit.dataset.state!==String(sitting)){sit.dataset.state=String(sitting);sit.innerHTML=sitting?standIcon:sitIcon;}sit.setAttribute('aria-label',label);sit.title=label;
  if(toolbar.hidden)return;
  const spot=placeToolbar({frame:{w,h},box:{left:b.left*w,top:b.top*h,right:b.right*w,bottom:b.bottom*h},face:{x:b.face.x*w,y:b.face.y*h,r:b.face.r*w},bar:{w:toolbar.offsetWidth,h:toolbar.offsetHeight},
   others:boxes.filter(o=>o!==b&&o.visible).map(o=>({x:o.face.x*w,y:o.face.y*h,r:o.face.r*w}))});
  if(!spot){toolbar.hidden=true;return;}
  toolbar.style.left=spot.x+'px';toolbar.style.top=spot.y+'px';toolbar.dataset.where=spot.where;
 }
 for(const control of root.querySelectorAll('[data-camera]'))control.addEventListener('input',()=>{state.camera[control.dataset.camera]=Number(control.value);changed();});
 for(const n of ['turn','size','x','z','speech','seat'])field(n).addEventListener('input',()=>{const a=current();if(!a)return;
  if(n==='x'||n==='z'){if(world&&worldId===state.location){const x=world.origin[0]+(n==='x'?Number(field(n).value):a.x),z=world.origin[2]+(n==='z'?Number(field(n).value):a.z);if(!world.move(a,x,z,state.actors))announce('Movement stopped by furniture, another character or the ground boundary.');}}
  else if(n==='seat'){const id=field(n).value;if(state.actors.some(other=>other.id!==a.id&&other.seat===id&&id)){announce('That seat is occupied.');sync();return;}if(!id&&a.seat){standUp(a);a.pose='Idle';}else if(id){a.seat=id;if(!seatedPose(a.pose))a.pose='Sit';a.size=1;}}
  else a[n]=['turn','size'].includes(n)?Number(field(n).value):text(field(n).value);
  changed();sync();});
 for(const n of ['style','top','bottom'])field(n).addEventListener('input',()=>{state[n]=text(field(n).value);changed();});
 for(const b of root.querySelectorAll('[data-choice] button'))b.addEventListener('click',()=>{const name=b.parentElement.dataset.choice;if(name==='format'){state.format=b.dataset.value;changed();}else{layoutStyle=b.dataset.value;comicFile.schedule(0);}sync();});

 async function loadWorld(id){
  if(world&&worldId===id)return world;
  views??=await fetch(new URL('../johansson-town/assets/images/feed/views.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Locations unavailable');return r.json();});
  const next=await buildSceneWorld(id,views,townData);townData=next.townData||townData;world?.dispose();world=next;worldId=id;renderer?.renderLists.dispose();
  field('seat').replaceChildren(new Option('Stand on ground',''),...world.seats.filter(s=>Math.hypot(s.position[0]-world.origin[0],s.position[2]-world.origin[2])<12).map(s=>new Option(s.label,s.id)));
  return world;
 }
 function clearAvatar(entry){entry.avatar.body?.skeleton?.dispose();entry.avatar.dispose();entry.avatar.root.removeFromParent();}
 // A head-and-shoulders portrait of each look, for the cast strip: drawn once per look in a corner of the renderer.
 const portraitScene=new THREE.Scene();portraitScene.background=new THREE.Color(0xe7eeeb);portraitScene.add(new THREE.HemisphereLight(0xffffff,0x8a9aa0,2.3));
 const portraitKey=new THREE.DirectionalLight(0xffffff,1.7);portraitKey.position.set(1.2,2.2,4);portraitScene.add(portraitKey);const portraitCamera=new THREE.PerspectiveCamera(28,1,.05,20);
 const headCentre=(avatar,v=new THREE.Vector3())=>avatar.bones.head.localToWorld(v.set(0,avatar.measure.Rh*avatar.measure.headSY*.94,0));
 function drawPortraits(height){
  const missing=[...new Set(state.actors.map(a=>JSON.stringify(a.recipe)))].filter(k=>!portraits.has(k));if(!missing.length)return false;
  renderer.setScissorTest(true);renderer.setViewport(0,0,PORTRAIT,PORTRAIT);renderer.setScissor(0,0,PORTRAIT,PORTRAIT);
  for(const key of missing){const avatar=buildAvatar(JSON.parse(key),{shadows:false,faceSize:128});
   try{poseSceneAvatar(avatar,{pose:'Idle',expression:'smile',turn:0});portraitScene.add(avatar.root);avatar.root.updateMatrixWorld(true);
    const m=avatar.measure,c=headCentre(avatar),r=m.Rh*Math.max(m.headSX,m.headSY),d=r*1.45/Math.tan(THREE.MathUtils.degToRad(14));
    portraitCamera.position.set(c.x,c.y+r*.1,c.z+d);portraitCamera.lookAt(c.x,c.y-r*.12,c.z);portraitCamera.updateMatrixWorld(true);renderer.render(portraitScene,portraitCamera);
    const out=document.createElement('canvas');out.width=out.height=PORTRAIT;out.getContext('2d').drawImage(renderer.domElement,0,height-PORTRAIT,PORTRAIT,PORTRAIT,0,0,PORTRAIT,PORTRAIT);portraits.set(key,out.toDataURL('image/png'));}
   catch(e){console.warn('Johansson Studio: portrait',e);portraits.set(key,'');}
   finally{avatar.root.removeFromParent();avatar.body?.skeleton?.dispose();avatar.dispose();}}
  renderer.setScissorTest(false);return true;
 }
 function draw(){const token=++generation;valid=false;canvas.setAttribute('aria-busy','true');const snapshot=structuredClone(state);
  queue=queue.catch(()=>{}).then(async()=>{
   if(token!==generation)return;
   try{
    const w=1200,h=Math.round(w/FORMATS[snapshot.format]),environment=await loadWorld(snapshot.location);if(token!==generation)return;
    renderer??=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.setSize(w,h,false);renderer.setViewport(0,0,w,h);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    for(const [id,entry] of avatars)if(!snapshot.actors.some(a=>a.id===id)){clearAvatar(entry);avatars.delete(id);}
    for(const entry of avatars.values())entry.avatar.root.removeFromParent();
    const camera=environment.camera,preset=views[snapshot.location].wide.camera;
    camera.position.fromArray(preset.position);camera.quaternion.fromArray(preset.quaternion);camera.aspect=w/h;camera.updateProjectionMatrix();
    const target=new THREE.Vector3(environment.origin[0],environment.origin[1]+.9,environment.origin[2]);
    if(snapshot.camera.orbit||snapshot.camera.elevation||snapshot.camera.zoom!==1){const spherical=new THREE.Spherical().setFromVector3(camera.position.clone().sub(target));spherical.theta+=snapshot.camera.orbit*Math.PI/180;spherical.phi=THREE.MathUtils.clamp(spherical.phi-snapshot.camera.elevation*Math.PI/180,.25,Math.PI*.48);spherical.radius*=snapshot.camera.zoom;camera.position.copy(target).add(new THREE.Vector3().setFromSpherical(spherical));camera.lookAt(target);
     const direction=camera.position.clone().sub(target),length=direction.length(),ray=new THREE.Raycaster(target,direction.normalize(),.15,length),hit=ray.intersectObjects(environment.meshes,false).find(h=>h.object.visible&&h.object.material?.depthWrite!==false);if(hit)camera.position.copy(target).addScaledVector(direction,Math.max(.3,hit.distance-.15));
    }
    camera.updateMatrixWorld(true);environment.settle(snapshot.actors);const bubbles=[],placed=[];
    const solid=(from,to)=>{const direction=to.clone().sub(from),distance=direction.length();return new THREE.Raycaster(from,direction.normalize(),.05,distance-.08).intersectObjects(environment.meshes,false).some(h=>h.object.visible&&h.object.material?.depthWrite!==false);};
    for(const actor of snapshot.actors){const key=JSON.stringify([actor.recipe,actor.pose,actor.expression,actor.turn,actor.size,actor.seat]);let entry=avatars.get(actor.id);
     if(!entry||entry.key!==key){if(entry)clearAvatar(entry);entry={key,avatar:buildAvatar(actor.recipe,{shadows:true,faceSize:256})};entry.avatar.root.userData.studioActor=true;avatars.set(actor.id,entry);}
     const position=environment.place(actor),avatar=entry.avatar;
     // Each avatar is a mesh in the same scene graph as the counter and walls.
     environment.scene.add(avatar.root);avatar.root.position.set(0,0,0);avatar.root.scale.setScalar(actor.size);
     poseSceneAvatar(avatar,{...actor,seatHeight:position.seat?(position.seat.surfaceY-position.y)/actor.size:0});
     if(position.seat)avatar.root.rotation.y=Math.PI+(position.seat.yaw||0);
     placeSceneAvatar(avatar,position,actor.size);
     const box=new THREE.Box3().setFromObject(avatar.root),head=new THREE.Vector3(position.x,box.max.y,position.z),projected=head.clone().project(camera);
     const visible=projected.z<1&&projected.z>-1&&!solid(camera.position,head);
     bubbles.push({text:actor.speech,x:(projected.x+1)/2,y:(1-projected.y)/2,visible});
     placed.push({id:actor.id,box,face:headCentre(avatar),radius:avatar.measure.Rh*Math.max(avatar.measure.headSX,avatar.measure.headSY)*actor.size,visible});
     const live=state.actors.find(a=>a.id===actor.id);if(live){live.x=actor.x;live.z=actor.z;live.seat=actor.seat;}
    }
    environment.sky?.update(camera,1,false,false);renderer.render(environment.scene,camera);
    canvas.width=w;canvas.height=h;ctx.drawImage(renderer.domElement,0,0);const overlay=document.createElement('canvas');overlay.width=w;overlay.height=h;drawCaptions(overlay.getContext('2d'),w,h,{style:snapshot.style,top:snapshot.top,bottom:snapshot.bottom,bubbles});ctx.drawImage(overlay,0,0);
    // Where each character is on the picture (fractions of it), for picking, the outline and the toolbar.
    const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0);
    boxes=placed.map(p=>{const corners=[];for(const x of [p.box.min.x,p.box.max.x])for(const y of [p.box.min.y,p.box.max.y])for(const z of [p.box.min.z,p.box.max.z])corners.push(new THREE.Vector3(x,y,z).project(camera));
     const behind=corners.some(c=>c.z>1||c.z<-1),xs=corners.map(c=>(c.x+1)/2),ys=corners.map(c=>(1-c.y)/2),f=p.face.clone().project(camera),edge=p.face.clone().addScaledVector(right,p.radius).project(camera);
     return {id:p.id,visible:p.visible&&!behind,left:Math.max(0,Math.min(...xs)),right:Math.min(1,Math.max(...xs)),top:Math.max(0,Math.min(...ys)),bottom:Math.min(1,Math.max(...ys)),face:{x:(f.x+1)/2,y:(1-f.y)/2,r:Math.abs(edge.x-f.x)/2}};}).filter(b=>b.right>b.left&&b.bottom>b.top);
    drawPortraits(h);renderer.setViewport(0,0,w,h);
    valid=true;canvas.setAttribute('aria-busy','false');sync();save();if(token===generation)sceneFile.schedule();
   }catch(e){canvas.setAttribute('aria-busy','false');announce('The 3D location could not load. Select the location again to retry.');console.error('Johansson Studio 3D scene',e);}
  });return queue;
 }

 // ---- Direct control in the picture: tap selects, drag moves (stopped by walls and furniture), two fingers turn. ----
 const pointers=new Map();
 function rayAt(e){const r=canvas.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),world.camera);return ray;}
 function actorAt(e){
  if(!world)return null;const ray=rayAt(e),hit=ray.intersectObjects([...avatars.values()].map(v=>v.avatar.root),true)[0];
  if(hit){const obstruction=ray.intersectObjects(world.meshes,false).find(h=>h.object.visible&&h.object.material?.depthWrite!==false);
   if(!obstruction||obstruction.distance>=hit.distance-.05){const a=state.actors.find(a=>{let o=hit.object;while(o){if(o===avatars.get(a.id)?.avatar.root)return true;o=o.parent;}return false;});if(a)return a.id;}}
  const r=canvas.getBoundingClientRect();
  return pickBox({x:e.clientX-r.left,y:e.clientY-r.top},boxes.map(b=>({...b,left:b.left*r.width,right:b.right*r.width,top:b.top*r.height,bottom:b.bottom*r.height})),touch?16:6);
 }
 const groundAt=(e,y)=>{const point=new THREE.Vector3();return rayAt(e).ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-y),point)?point:null;};
 canvas.addEventListener('pointerdown',e=>{
  if(mode!=='scene'||!world)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){const a=current();if(gesture?.kind==='drag')gesture=null;
   if(a&&!a.seat){const [p,q]=[...pointers.values()];gesture={kind:'twist',id:a.id,turn:a.turn,angle:touchAngle(p,q)};syncSelection();}
   else if(a)announce('Seated characters face the way their seat faces. Stand them up to turn them.');return;}
  if(pointers.size>2)return;
  const id=actorAt(e);
  if(!id){gesture={kind:'tap',x:e.clientX,y:e.clientY,pointer:e.pointerId};return;}
  selected=id;overlayStep=step;const a=current(),p=world.place(a),ground=groundAt(e,p.y);
  gesture={kind:'drag',id,pointer:e.pointerId,x:e.clientX,y:e.clientY,moved:false,dx:ground?p.x-ground.x:0,dz:ground?p.z-ground.z:0,y0:p.y,stopped:false};
  try{canvas.setPointerCapture(e.pointerId);}catch{}sync();
 });
 canvas.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId)||!world)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(gesture?.kind==='twist'&&pointers.size>=2){const a=state.actors.find(a=>a.id===gesture.id);if(!a)return;const [p,q]=[...pointers.values()];a.turn=twistTurn(gesture.turn,gesture.angle,touchAngle(p,q));sceneFile.invalidate();pending=draw();return;}
  if(gesture?.kind!=='drag'||e.pointerId!==gesture.pointer)return;
  if(!gesture.moved&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)<4)return;
  if(!gesture.moved){gesture.moved=true;syncSelection();}
  const a=state.actors.find(a=>a.id===gesture.id),point=a&&groundAt(e,gesture.y0);if(!point)return;
  if(!world.move(a,point.x+gesture.dx,point.z+gesture.dz,state.actors)&&!gesture.stopped){gesture.stopped=true;announce('Stopped by a wall, furniture, another character or the edge of the ground.');}
  sceneFile.invalidate();pending=draw();
 });
 function endPointer(e){
  if(!pointers.delete(e.pointerId))return;
  if(gesture?.kind==='twist'){if(pointers.size<2){gesture=null;changed();sync();}return;}
  if(gesture?.kind==='drag'&&e.pointerId===gesture.pointer){const moved=gesture.moved;gesture=null;if(moved){changed();}sync();return;}
  if(gesture?.kind==='tap'&&e.pointerId===gesture.pointer){const tap=Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)<8&&e.type==='pointerup';gesture=null;if(tap&&selected){selected=null;sync();}}
 }
 for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,endPointer);
 // Safari's own pinch and rotate gestures would zoom the page while two fingers turn a character.
 canvas.addEventListener('gesturestart',e=>e.preventDefault());
 canvas.addEventListener('lostpointercapture',e=>{if(gesture?.kind==='drag'&&e.pointerId===gesture.pointer)endPointer(e);});

 // ---- The toolbar and the keys: turn, face the camera, sit or stand, remove. ----
 function turnBy(degrees){const a=current();if(!a)return;if(a.seat){announce('Seated characters face the way their seat faces. Stand them up to turn them.');return;}a.turn=wrapTurn(a.turn+degrees);changed();sync();}
 function faceCamera(){const a=current();if(!a||!world||a.seat)return;const p=world.place(a);a.turn=turnToward({x:p.x,z:p.z},{x:world.camera.position.x,z:world.camera.position.z});changed();sync();announce(a.name+' faces the camera.');}
 function sitOrStand(){const a=current();if(!a||!world)return;
  if(a.seat||seatedPose(a.pose)){if(a.seat)standUp(a);a.pose='Idle';changed();sync();announce(a.name+' stands up.');return;}
  const p=world.place(a),seat=nearestSeat(world.seats,{x:p.x,z:p.z},new Set(state.actors.filter(o=>o.id!==a.id&&o.seat).map(o=>o.seat)));
  if(seat){a.seat=seat.id;a.size=1;a.pose='Sit';announce(a.name+' sits down on the nearest free seat.');}else{a.pose='Sit';announce('No free seat nearby, so '+a.name+' sits on the ground.');}
  changed();sync();
 }
 const tools={'turn-left':()=>turnBy(TURN_TAP),'turn-right':()=>turnBy(-TURN_TAP),'face-camera':faceCamera,'sit':sitOrStand,'remove':()=>{const a=current();if(a)removeActor(a.id);}};
 for(const b of toolbar.querySelectorAll('[data-tool]'))b.addEventListener('click',()=>tools[b.dataset.tool]());
 toolbar.addEventListener('pointerdown',e=>e.stopPropagation());
 document.addEventListener('keydown',onKey);
 function onKey(e){
  if(root.hidden||mode!=='scene'||!preview.element.hidden||e.defaultPrevented)return;
  if((e.metaKey||e.ctrlKey)&&!e.altKey&&e.key.toLowerCase()==='z'&&!toast.hidden&&!e.target.closest?.('input,textarea,select')){e.preventDefault();undo();return;}
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  const inPicture=e.target===document.body||e.target.closest?.('.scene-picture');if(!inPicture||e.target.closest('input,textarea,select'))return;
  const a=current();if(!a||!world)return;
  const step=nudgeStep(e.key,world.camera.getWorldDirection(new THREE.Vector3()),e.shiftKey?.5:.15);
  if(step){e.preventDefault();const p=world.place(a);if(!world.move(a,p.x+step.dx,p.z+step.dz,state.actors))announce('Stopped by a wall, furniture, another character or the edge of the ground.');changed();sync();return;}
  if(['q','Q','['].includes(e.key)){e.preventDefault();turnBy(TURN_KEY);}
  else if(['e','E',']'].includes(e.key)){e.preventDefault();turnBy(-TURN_KEY);}
  else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();removeActor(a.id);}
  else if(e.key==='Escape'){selected=null;sync();}
 }

 // ---- Removing a character, with Undo for a few seconds. ----
 const toast=$('.scene-toast');let toastTimer=0,undoAction=null;
 function offerUndo(message,action){clearTimeout(toastTimer);undoAction=action;toast.querySelector('.scene-toast-text').textContent=message;toast.hidden=false;toastTimer=setTimeout(hideToast,UNDO_MS);}
 function hideToast(){clearTimeout(toastTimer);toast.hidden=true;undoAction=null;}
 function undo(){const action=undoAction;hideToast();action?.();}
 toast.querySelector('[data-undo]').onclick=undo;
 function removeActor(id){
  const removed=removeCharacter(state,id);if(!removed)return;if(selected===id)selected=null;
  changed();sync();announce(removed.actor.name+' removed from the scene.');
  offerUndo(removed.actor.name+' removed.',()=>{const actor=restoreCharacter(state,removed);if(!actor){announce('The scene is full: remove someone first to bring '+removed.actor.name+' back.');return;}selected=actor.id;overlayStep=step;changed();sync();announce(actor.name+' is back.');});
 }

 function add(recipe,name){const a=addCharacter(state,normalizeRecipe(recipe),name);if(!a){announce('The scene already has six characters.');return;}selected=a.id;changed();sync();announce(a.name+' added. Select Pose & position to arrange them.');}
 async function ready(){let task;do{task=pending;await task;}while(task!==pending);if(!valid){announce('Wait for the scene to finish loading, then try again.');return false;}return true;}
 async function capture(){if(capturing)return;capturing=true;try{if(panels.length>=MAX_PANELS){announce('Your comic already has four panels. Remove a panel to replace it.');return;}if(!await ready())return;
  const dataURL=canvas.toDataURL('image/png'),blob=dataURLToBlob(dataURL),url=URL.createObjectURL(blob);
  panels.push({dataURL,url,file:new File([blob],'johansson-studio-panel.png',{type:'image/png'}),image:await loadImage(url)});renderPanels();announce('Panel '+panels.length+' added. Open Comic to review it, or compose the next scene.');}
  catch(e){console.warn('Johansson Studio: capture',e);announce('The panel could not be captured. Please try again.');}finally{capturing=false;}}
 function renderPanels(){const list=$('.scene-panels');list.replaceChildren();$('[data-panel-count]').textContent=panels.length;
  panels.forEach((p,i)=>{const figure=document.createElement('figure'),img=document.createElement('img');img.src=p.url;img.alt='Comic panel '+(i+1);figure.append(img);const row=document.createElement('div');
   for(const [label,action] of [['Move earlier',()=>{panelOrder(panels,i,-1);renderPanels();}],['Move later',()=>{panelOrder(panels,i,1);renderPanels();}],['Remove',()=>removePanel(i)]]){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=action;b.disabled=(label==='Move earlier'&&i===0)||(label==='Move later'&&i===panels.length-1);row.append(b);}
   const link=document.createElement('a');link.className='scene-save';link.textContent='Save PNG';link.setAttribute('aria-label','Save panel '+(i+1)+' as PNG');
   const file=new File([p.file],'johansson-studio-panel-'+(i+1)+'.png',{type:'image/png'});bindSaveLink(link,{ready:true,file,url:p.url,now:()=>({file,url:p.url})},{say:say('comic'),words:saved('Panel')});
   row.append(link);figure.append(row);list.append(figure);});
  comicFile.schedule(0);sync();}
 function removePanel(i){const [panel]=panels.splice(i,1);renderPanels();offerUndo('Panel '+(i+1)+' removed.',()=>{if(panels.length>=MAX_PANELS)return;panels.splice(Math.min(i,panels.length),0,panel);renderPanels();});}
 const projectInput=$('[data-project-input]');projectInput.onchange=async()=>{try{const file=projectInput.files[0];if(!file)return;if(file.size>34000000)throw Error('Project too large');const project=JSON.parse(await file.text());if(project.format!=='johansson-studio-project'||project.version!==1||![1,2].includes(project.scene?.version))throw Error('Invalid project');const scene=normalizeScene(project.scene,normalizeRecipe),urls=(Array.isArray(project.panels)?project.panels:[]).slice(0,MAX_PANELS);if(urls.some(url=>typeof url!=='string'||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(url)||url.length>8000000))throw Error('Invalid panel');
  const loaded=await Promise.all(urls.map(async dataURL=>{const blob=dataURLToBlob(dataURL),url=URL.createObjectURL(blob);return {dataURL,url,file:new File([blob],'johansson-studio-panel.png',{type:'image/png'}),image:await loadImage(url)};}));
  state=scene;selected=state.actors[0]?.id??null;for(const p of panels)URL.revokeObjectURL(p.url);panels.splice(0,panels.length,...loaded);changed();renderPanels();sync();announce('Project opened.');}catch(e){console.warn('Johansson Studio: open project',e);announce('Unable to open this project. Choose a Johansson Studio project JSON file.');}finally{projectInput.value='';}};
 const actions={
  'reset-camera':()=>{state.camera={orbit:0,elevation:0,zoom:1};for(const c of root.querySelectorAll('[data-camera]'))c.value=state.camera[c.dataset.camera];changed();},
  'add-current':()=>add(getCharacter()),'add-resident':()=>{const n=resident.value;add(n==='Thuan'?ORIGINAL_THUAN_RECIPE:recipeFor(n),nameOf(n));},
  'edit-character':()=>{const a=current();if(a)onEdit(a.recipe,a.id);},'duplicate':()=>{const a=current();if(a)add(a.recipe,a.name);},
  'remove':()=>{const a=current();if(a)removeActor(a.id);},
  'previous':()=>setStep(keys[Math.max(0,keys.indexOf(step)-1)]),'next':()=>setStep(keys[Math.min(4,keys.indexOf(step)+1)]),
  'preview':()=>preview.open({title:'Your picture',ready:sceneFile,url:sceneFile.ready||!valid?'':canvas.toDataURL('image/png'),alt:'The scene as it will be saved'}),
  'preview-comic':()=>{if(panels.length)preview.open({title:'Your comic',ready:comicFile,url:comicFile.ready?'':composeComic().toDataURL('image/png'),alt:'The comic page as it will be saved'});},
  'capture':capture,'comic':()=>onMode('comic'),'compose':()=>{onMode('scene');setStep('location');},
  'open-project':()=>projectInput.click()
 };
 for(const b of root.querySelectorAll('[data-action]'))b.onclick=()=>{Promise.resolve(actions[b.dataset.action]()).catch(e=>{console.warn('Johansson Studio',e);announce('The action could not be completed. Your scene is still available.');});};
 if(matchMedia('(max-width: 800px)').matches)$('.scene-camera-box').open=false;
 new ResizeObserver(()=>syncSelection()).observe(frame);
 setStep('location');renderPanels();
 return {root,show(value){mode=value;root.dataset.mode=value;root.hidden=false;$('.scene-comic').hidden=value!=='comic';$('.scene-steps').hidden=value==='comic';$('.scene-controls').hidden=value==='comic';$('.scene-heading h1').textContent=value==='comic'?'Make a comic':'Build a scene';$('.scene-heading p').textContent=value==='comic'?'Add the scene you built as a panel, arrange up to four panels, then save your comic.':'Choose a place, add characters, then pose them and write your dialogue.';pending=draw();sync();},hide(){root.hidden=true;hideToast();preview.close();},useCharacter(recipe,id){const a=state.actors.find(a=>a.id===id);if(a){a.recipe=normalizeRecipe(recipe);a.name=text(recipe.name)||a.name;selected=a.id;changed();sync();}else add(recipe);setStep('pose');},
  dispose(){generation++;document.removeEventListener('keydown',onKey);hideToast();sceneFile.dispose();comicFile.dispose();for(const p of panels)URL.revokeObjectURL(p.url);preview.element.remove();for(const entry of avatars.values())clearAvatar(entry);world?.dispose();renderer?.dispose();renderer?.forceContextLoss();root.remove();}};
}
