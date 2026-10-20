import {stageComicExit} from './scene-exit.js?v=20261020-vi';
import {gradientMap} from '../johansson-town/src/render/cel.js';
import {createSceneFacePainter} from './scene-face.js';
import {drawShout,drawStatement,drawComicChaos} from './scene-lettering.js?v=20261020-vi';
import {CLASSROOM_VIEW} from './classroom-stage.js';
import {classroomComic} from './classroom-comic.mjs?v=20261020-vi';
import {createSoleFinder} from '../johansson-town/src/avatars/foot-ground.js';
import {applySceneContacts} from './scene-contact.js?v=20261020-vi';
import {filmStaging} from './film-staging.mjs';
import {KNOWN_EXPRESSIONS,KNOWN_POSES} from './scene-catalogue.mjs?v=20261020-vi';
import {createActingPanel} from './acting/panel.js?v=20261016-1';
import {sampleTake,normalizeTake} from './acting/takes.mjs';
import {applyActorFrame} from '../johansson-town/src/avatars/acting.js';
import * as THREE from '../johansson-town/vendor/three.module.js';
import {buildAvatar} from '../johansson-town/src/avatars/build.js';
import {drawFace} from '../johansson-town/src/avatars/face.js';
import {svg} from '../johansson-town/src/ui/icons.js';
import {ORIGINAL_THUAN_RECIPE,recipeFor,RESIDENT_NAMES} from '../johansson-town/src/avatars/cast.js';
import {STUDIO_CHARACTERS} from '../johansson-town/src/studio/characters-data.js';
import {normalizeRecipe} from '../johansson-town/src/avatars/recipe.js';
import {drawCaptions,comicLayout,FORMATS} from '../johansson-town/src/photo/layout.js';
import {buildSceneWorld} from './scene-world.js?v=20261020-vi';
import {poseSceneAvatar,placeSceneAvatar,movingPose} from './scene-avatar.js?v=20261020-vi';
import {SCENE_KEY,MAX_ACTORS,MAX_PANELS,LOCATIONS,emptyScene,normalizeScene,addCharacter,removeCharacter,restoreCharacter,panelOrder,text,placementOf,applyPlacement,samePlacement} from './scene-model.mjs?v=20261020-vi';
import {pickMoment,applyMoment,aim} from './scene-moments.mjs?v=20261011-2';
import {POSE_GROUPS,EXPRESSION_GROUPS,seatedPose} from './scene-catalogue.mjs?v=20261020-vi';
import {turnToward,touchAngle,twistTurn,nudgeStep,placeToolbar,pickBox,nearestSeat} from './scene-controls.mjs?v=20261011-2';
import {SNAP,resolveSnap,snapTurn,stepTurn,edgeLine,lineDistance} from './scene-snap.mjs?v=20261011-2';
import {touchFirst,dataURLToBlob,canvasToBlob,createReadyFile,bindSaveLink,createPreview,deliverFile} from './studio-share.mjs';

const nameOf=n=>n==='Thuan'?'Thuận':n;
const loadImage=url=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('The image could not be loaded.'));img.src=url;});
/** Turns step to stops around facing the camera: a turn button to the next 45° (front, three-quarter, profile, …), Q/E 15°. */
const TURN_TAP=SNAP.turn.tap,TURN_KEY=SNAP.turn.step,UNDO_MS=7000,PORTRAIT=96,SNAP_KEY='nj-studio-snap',KEY_BURST=600;
/** "Sit at the ramen counter 3" → "sits at the ramen counter 3"; any other seat label → "sits down: <label>". */
const sits=label=>/^Sit\b/.test(label)?'sits'+label.slice(3):'sits down: '+label;
// Sit down and stand up as a seated and a standing figure (World's icon set has no seated one).
const figure=body=>`<svg class="ui-icon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const sitIcon=figure('<circle cx="9" cy="4.5" r="2.5"/><path d="M9 8v6h6v6M9 10.5l4.5 2M4 21h16"/>'),standIcon=figure('<circle cx="12" cy="4.5" r="2.5"/><path d="M12 8v7M8.5 11.5h7M9.5 21l2.5-6 2.5 6"/>');
const choice=(name,label,options)=>`<div class="scene-choice" role="group" aria-label="${label}" data-choice="${name}">${options.map(([value,text])=>`<button type="button" data-value="${value}" aria-pressed="false">${text}</button>`).join('')}</div>`;

const furnitureInk=new WeakMap();
function inkProps(furniture,enabled){
 for(const prop of Object.values(furniture||{})){
  let lines=furnitureInk.get(prop);
  if(!lines&&enabled){const meshes=[];prop.traverse(m=>{if(m.isMesh&&!m.isSkinnedMesh)meshes.push(m);});lines=meshes.map(m=>{const ink=new THREE.Mesh(m.geometry,new THREE.MeshBasicMaterial({color:'#241e18',side:THREE.BackSide}));ink.scale.setScalar(1.025);ink.userData.studioInk=true;m.add(ink);return ink;});furnitureInk.set(prop,lines);}
  for(const ink of lines||[])ink.visible=enabled;
 }
}
function drawDash(ctx,w,h,contacts=[]){ctx.save();for(const p of contacts){const x=(p.x+1)*w/2,y=(1-p.y)*h/2+3;ctx.strokeStyle='#756b5c';ctx.lineWidth=w*.003;ctx.beginPath();ctx.moveTo(x-w*.08,y+1);ctx.lineTo(x+w*.07,y-1);ctx.moveTo(x-w*.15,y-3);ctx.lineTo(x-w*.11,y-3);ctx.moveTo(x-w*.12,y-h*.025);ctx.quadraticCurveTo(x-w*.15,y-h*.045,x-w*.16,y-h*.01);ctx.stroke();}ctx.strokeStyle='#332b2a';ctx.lineWidth=2;for(let i=0;i<14;i++){const y=h*(.47+i*.029),x=w*(.03+(i%3)*.024);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w*(.12+(i%4)*.025),y-h*.015);ctx.stroke();}ctx.translate(w*.14,h*.57);ctx.rotate(-.22);ctx.font=`900 ${Math.round(w*.075)}px sans-serif`;ctx.lineWidth=8;ctx.strokeStyle='#fff9ed';ctx.strokeText('KRAASH!',0,0);ctx.fillStyle='#30282b';ctx.fillText('KRAASH!',0,0);ctx.restore();}
/** 3D scene editor: shared town geometry, ground, furniture and avatar models. */
export function createSceneWorkspace({getCharacter,onEdit,onMode}){
 let state=emptyScene();try{state=normalizeScene(JSON.parse(localStorage.getItem(SCENE_KEY)),normalizeRecipe);}catch{}
 let selected=state.actors[0]?.id??null,step='location',mode='scene',generation=0,pending=Promise.resolve(),valid=false,renderer;
 let liveActor=null,liveFrame=null,scenePlaying=false,sceneTime=state.time||0,playStart=0,playFrame=0,lastActDraw=0;
 const panels=[],avatars=new Map(),portraits=new Map();
 let preparedFilm=null,exportingStaging=false;
 let lastMoment='',world=null,worldId='',views=null,townData=null,capturing=false,queue=Promise.resolve(),boxes=[],layoutStyle='grid',overlayStep='',editingPanel=null;
 const touch=touchFirst();
 // Snap into place (scene-snap.mjs): on unless this viewer turned it off. Placement history for Undo, kept in memory.
 let snapOn=true;try{snapOn=localStorage.getItem(SNAP_KEY)!=='0';}catch{}
 const history=[],standingPose=new Map();let draws=0,sliding=null,burst={id:null,at:0};
 const root=document.createElement('main');root.className='scene-workspace';root.hidden=true;
 root.innerHTML=`<div class="scene-heading"><div><h1>Build a scene</h1><p>Choose a place, add characters, then pose them and write your dialogue.</p></div><a class="scene-button" data-save="project">Download project</a><button type="button" data-action="open-project">Open project</button><button type="button" data-action="prepare-film">Prepare film staging</button><button type="button" data-action="save-film" hidden>Download film staging</button><input type="file" data-project-input accept=".json,application/json" hidden></div>
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
 <div class="scene-moment"><button type="button" data-action="classroom-example">Build Vy’s classroom comic</button><button type="button" data-action="shuffle-moment">Shuffle a moment</button><p class="scene-moment-note">Turns everyone on stage into a little scene: poses, faces, lines and a caption.</p></div>
 <details data-classroom-props hidden><summary>Classroom furniture</summary><label>Object<select data-prop-id><option value="desk">Desk</option><option value="chair">Chair</option></select></label><label><input type="checkbox" data-prop-visible> Visible</label><label>Size<input data-prop-size type="number" min=".5" max="1.5" step=".05" value="1"></label><div class="scene-actor-controls">${['x','y','z','pitch','yaw','roll'].map((label,i)=>`<label>${label}<input type="number" data-prop-axis="${i}" step="${i<3?'.05':'5'}" min="${i<3?'-4':'-180'}" max="${i<3?'4':'180'}"></label>`).join('')}</div></details>
 <h3 class="scene-picker-title" id="scene-pose-title">Pose</h3><div class="scene-picker" data-picker="pose" role="group" aria-labelledby="scene-pose-title"></div>
 <h3 class="scene-picker-title" id="scene-face-title">Expression</h3><div class="scene-picker" data-picker="expression" role="group" aria-labelledby="scene-face-title"></div>
 <div class="scene-actor-controls"><label class="scene-snap"><input type="checkbox" role="switch" data-setting="snap"> Snap into place</label><label>Turn<input data-field="turn" type="range" min="-180" max="180" step="5"></label><label>Size<input data-field="size" type="range" min=".6" max="1.4" step=".01"></label>
 <label>Left / right<input data-field="x" type="range" min="-12" max="12" step=".01"></label><label>Near / far<input data-field="z" type="range" min="-12" max="12" step=".01"></label>
 <label>Height above floor<input data-field="y" type="range" min="0" max="1.5" step=".01"></label><label>Lifted by<select data-field="liftedBy" aria-label="Lifted by"><option value="">Nobody</option></select></label><label>Use furniture<select data-field="seat" aria-label="Use furniture"><option value="">Stand on ground</option></select></label><button data-action="edit-character">Edit appearance</button><button data-action="duplicate">Duplicate character</button><button data-action="remove">Remove character</button></div></section>
 <section data-pane="text" hidden><h2>Add text</h2><label>Picture style<select data-field="style" aria-label="Picture style"><option value="photo">Photograph with speech bubbles</option><option value="meme">Meme with top and bottom text</option><option value="comic">Comic panel with caption</option></select></label>
 <label>Speech lettering<select data-field="speechStyle"><option value="bubble">Speech bubble</option><option value="shout">Large dramatic shout</option><option value="large">Large readable bubble</option></select></label><label>Action marks<select data-field="effect"><option value="">None</option><option value="dash">Speed lines and crash</option><option value="chaos">Comic chaos and flying papers</option><option value="escape">Flee towards an open exit</option></select></label><label>Exit sign<input data-field="exitLabel" maxlength="24" placeholder="EXIT"></label><label>Backdrop<select data-field="backdrop"><option value="">Full location</option><option value="paper">Plain comic paper</option></select></label><label>Selected character’s speech<input data-field="speech" maxlength="120" placeholder="What are they saying?" aria-label="Selected character’s speech"></label>
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
 const acting=createActingPanel({
  getControls:()=>({expression:current()?.expression||'neutral',pose:current()?.pose||'Idle',strength:1}),
  onFrame:value=>{if(!current())return;liveActor=selected;liveFrame=value;const now=performance.now();if(!scenePlaying&&now-lastActDraw>=1000/15){lastActDraw=now;pending=draw();}},
  onStop:()=>{if(liveFrame)pending=draw();},
  onAssign:(take,loop)=>{const actor=current();if(!actor){announce('Select a character first.');return;}acting.session.hold();actor.take=normalizeTake(take);actor.takeLoop=loop;liveFrame=null;liveActor=null;sceneTime=0;changed();sync();announce('Take assigned to '+actor.name+'. Play the cast to direct the actors together.');}
 });
 $('[data-pane="pose"]').append(acting.root);
 const transport=document.createElement('div');transport.className='studio-acting-transport';
 transport.innerHTML='<button type="button" data-play-cast>Play cast</button><button type="button" data-rewind-cast>Rewind</button><button type="button" data-clear-take>Remove actor take</button><label>Scene time<input type="range" data-scene-time min="0" max="60" step=".05" value="0"></label><output data-scene-clock>0.0 s</output>';
 $('[data-pane="pose"]').append(transport);
 function syncClock(){transport.querySelector('[data-scene-clock]').textContent=sceneTime.toFixed(1)+' s';transport.querySelector('[data-scene-time]').value=String(sceneTime);transport.querySelector('[data-play-cast]').textContent=scenePlaying?'Pause cast':'Play cast';}
 function stopCast(){scenePlaying=false;cancelAnimationFrame(playFrame);syncClock();sceneFile.schedule();}
 function playCast(now){if(!scenePlaying||root.hidden)return;sceneTime=Math.min(60,(now-playStart)/1000);syncClock();if(now-lastActDraw>=1000/15){lastActDraw=now;pending=draw();}if(sceneTime>=60){stopCast();return;}playFrame=requestAnimationFrame(playCast);}
 transport.querySelector('[data-play-cast]').onclick=()=>{if(scenePlaying){stopCast();state.time=sceneTime;pending=draw();return;}acting.session.hold();liveFrame=null;liveActor=null;scenePlaying=true;if(sceneTime>=60)sceneTime=0;playStart=performance.now()-sceneTime*1000;playFrame=requestAnimationFrame(playCast);};
 transport.querySelector('[data-rewind-cast]').onclick=()=>{stopCast();sceneTime=0;state.time=0;syncClock();pending=draw();};
 transport.querySelector('[data-scene-time]').oninput=e=>{const value=Number(e.target.value);stopCast();sceneTime=value;state.time=value;syncClock();pending=draw();};
 transport.querySelector('[data-clear-take]').onclick=()=>{const actor=current();if(actor){delete actor.take;delete actor.takeLoop;changed();announce('Take removed from '+actor.name+'.');}};

 // Every resident of World as World draws them (with any look published from Studio; World's Thuan among them), the
 // characters made in Studio, and the original Thuận design.
 const resident=field('resident'),optgroup=(label,options)=>{const g=document.createElement('optgroup');g.label=label;g.append(...options);return g;};
 resident.append(optgroup('Residents of Johansson World',RESIDENT_NAMES.map(n=>new Option(nameOf(n),n))),
  ...Object.keys(STUDIO_CHARACTERS).length?[optgroup('Studio characters',Object.entries(STUDIO_CHARACTERS).map(([id,c])=>new Option(c.name,'studio:'+id)))]:[],
  optgroup('Other designs',[new Option('Thuận · original','design:thuan-original')]));
 for(const [id,name] of LOCATIONS){const b=document.createElement('button');b.type='button';b.dataset.location=id;b.setAttribute('aria-label',name);const img=document.createElement('img');img.src=id==='classroom'?'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180"><rect width="240" height="180" fill="#eee4cc"/><rect x="25" y="22" width="190" height="82" fill="#355d50"/><text x="120" y="71" text-anchor="middle" fill="white" font-size="22">Classroom</text><path d="M50 130H190M65 130V165M175 130V165" stroke="#795c3b" stroke-width="8"/></svg>'):`../johansson-town/assets/images/feed/${id}.webp`;img.alt='';img.loading='lazy';const label=document.createElement('span');label.textContent=name;b.append(img,label);b.onclick=()=>{state.location=id;state.camera={orbit:0,elevation:0,zoom:1};for(const a of state.actors){a.seat='';a.x=0;a.z=0;}forget();changed();sync();announce(name+' selected. Continue to Add characters.');};$('.scene-locations').append(b);}
 $('.scene-hint').textContent=touch?'Tap a character to select them. Drag to move: they snap onto seats, counters and beside people. Twist two fingers to turn.':'Click a character to select them. Drag to move: they snap onto seats, counters and beside people. Hold Alt (Option) while dragging to place freely. Q and E turn, the arrow keys nudge, Delete removes.';
 const snapSwitch=$('[data-setting="snap"]');snapSwitch.checked=snapOn;
 snapSwitch.addEventListener('change',()=>{snapOn=snapSwitch.checked;try{localStorage.setItem(SNAP_KEY,snapOn?'1':'0');}catch{}announce(snapOn?'Characters snap onto seats, counters and beside people.':'Characters go exactly where you drop them.');});
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
  const layout=comicLayout(panels.length,layoutStyle,layoutStyle==='strip'?3200:1800);if(panels.length&&panels.every(p=>Math.abs(p.image.width/p.image.height-panels[0].image.width/panels[0].image.height)<.01)){const aspect=panels[0].image.width/panels[0].image.height,cellH=layout.cells[0].w/aspect;for(let i=0;i<layout.cells.length;i++){layout.cells[i].h=cellH;layout.cells[i].y=18+Math.floor(i/(layoutStyle==='strip'?panels.length:Math.min(2,panels.length)))*(cellH+18);}layout.height=Math.ceil(Math.max(...layout.cells.map(c=>c.y+c.h))+18);}const out=document.createElement('canvas');out.width=layout.width;out.height=layout.height;const c=out.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,out.width,out.height);
  panels.forEach((p,i)=>{const r=layout.cells[i],s=Math.min(r.w/p.image.width,r.h/p.image.height),w=p.image.width*s,h=p.image.height*s;c.drawImage(p.image,r.x+(r.w-w)/2,r.y+(r.h-h)/2,w,h);c.strokeStyle='#243442';c.lineWidth=2;c.strokeRect(r.x,r.y,r.w,r.h);});
  return out;
 }
 let comicLink=()=>{};const comicFile=createReadyFile({name:'johansson-studio-comic.png',type:'image/png',build:()=>panels.length?canvasToBlob(composeComic()):null,
  buildNow:()=>panels.length?dataURLToBlob(composeComic().toDataURL('image/png')):null,onChange:()=>{comicLink();preview.update();}});
 comicLink=bindSaveLink($('[data-save="comic"]'),comicFile,{say:say('comic'),disabled:()=>!panels.length,words:{busy:'Add a panel first.',...saved('Comic')}});
 const projectFile={ready:false,now:()=>({file:new File([JSON.stringify({format:'johansson-studio-project',version:1,layout:layoutStyle,scene:state,panels:panels.map(p=>p.dataURL),panelScenes:panels.map(p=>p.scene||null)})],'johansson-studio-project.json',{type:'application/json'}),url:''})};
 bindSaveLink($('[data-save="project"]'),projectFile,{say:text=>announce(text),words:{download:'Editable project'+(touch?' saved to Downloads in the Files app, including comic panels.':' downloaded, including comic panels.'),shared:'Done. If you chose Save to Files, the project is in the Files app.'}});

 function save(){try{localStorage.setItem(SCENE_KEY,JSON.stringify(state));}catch{announce('Browser storage is unavailable. Download a project to keep your scene.');}}
 function changed(){preparedFilm=null;$('[data-action="save-film"]').hidden=true;save();sceneFile.invalidate();pending=draw();syncSelection();}
 function setStep(value){if(value!=='pose'&&scenePlaying)stopCast();step=value;for(const pane of root.querySelectorAll('[data-pane]'))pane.hidden=pane.dataset.pane!==step;for(const b of root.querySelectorAll('[data-step]')){b.setAttribute('aria-current',b.dataset.step===step?'step':'false');b.onclick=()=>setStep(b.dataset.step);}const i=keys.indexOf(step);$('[data-action="previous"]').disabled=i===0;$('[data-action="next"]').hidden=i===keys.length-1;$('[data-action="next"]').textContent='Next: '+({characters:'Add characters',pose:'Pose & position',text:'Add text',export:'Export'}[keys[i+1]]||'');sync();}

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
 /** Sit `a` on `seat` (the menu, the toolbar and a drop): facing the way the seat faces, a seated pose kept, else Sit. */
 function sitOn(a,seat,pose=seatedPose(a.pose)?a.pose:'Sit'){if(!a.seat&&!seatedPose(a.pose))standingPose.set(a.id,a.pose);world.put(a,{x:seat.position[0],z:seat.position[2],seat:seat.id});a.turn=seat.turn;a.pose=pose;}
 function setPose(name){const a=current();if(!a)return;const before=placementOf(a);if(!seatedPose(name)&&a.seat)standUp(a);a.pose=name;changed();sync();remember({kind:'place',id:a.id,before},a);}
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
 function select(id,{reveal=false}={}){if(id!==selected){acting.session.hold();liveFrame=null;liveActor=null;}selected=id;if(reveal)overlayStep=step;sync();}

 function syncProps(){const box=$('[data-classroom-props]');box.hidden=state.location!=='classroom';if(box.hidden||!world?.furniture)return;const id=$('[data-prop-id]').value,o=world.furniture[id];if(!o)return;$('[data-prop-visible]').checked=o.visible;$('[data-prop-size]').value=state.furniture?.[id]?.size||1;box.querySelectorAll('[data-prop-axis]').forEach(input=>{const i=Number(input.dataset.propAxis),v=i<3?o.position.toArray()[i]:o.rotation.toArray()[i-3]*180/Math.PI;if(document.activeElement!==input)input.value=Math.round(v*100)/100;});}
 $('[data-prop-id]').onchange=syncProps;
 for(const input of root.querySelectorAll('[data-prop-axis],[data-prop-visible],[data-prop-size]'))input.onchange=()=>{if(!world?.furniture)return;const id=$('[data-prop-id]').value,o=world.furniture[id],before=structuredClone(state.furniture||{});state.furniture??={};const s=state.furniture[id]??={position:o.position.toArray(),rotation:o.rotation.toArray().slice(0,3),visible:o.visible};if(input.dataset.propAxis!==undefined){const i=Number(input.dataset.propAxis),v=Number(input.value);if(!Number.isFinite(v))return;(i<3?s.position:s.rotation)[i%3]=i<3?Math.max(-4,Math.min(4,v)):Math.max(-180,Math.min(180,v))*Math.PI/180;}else if(input.hasAttribute('data-prop-size'))s.size=Math.max(.5,Math.min(1.5,Number(input.value)||1));else s.visible=input.checked;changed();offerUndo('Furniture moved.',()=>{state.furniture=before;changed();sync();});};
 function sync(){syncProps();syncClock();
  for(const c of root.querySelectorAll('[data-camera]'))c.value=state.camera[c.dataset.camera];
  const a=current();const lift=field('liftedBy');lift.replaceChildren(new Option('Nobody',''),...state.actors.filter(b=>b.id!==a?.id&&!b.liftedBy).map(b=>new Option(b.name,b.id)));
  for(const n of ['turn','size','x','z','y','speech','speechStyle','seat','liftedBy']){field(n).disabled=!a;field(n).value=a?.[n]??'';}
  for(const n of ['style','top','bottom','backdrop','effect'])field(n).value=state[n]||'';field('exitLabel').value=state.exitLabel||'EXIT';field('exitLabel').disabled=state.effect!=='escape';
  for(const o of field('seat').options){if(!o.value)continue;const user=state.actors.find(x=>x.id!==a?.id&&x.seat===o.value);o.disabled=!!user;o.textContent=o.dataset.label+(user?' ('+user.name+')':'');}
  snapSwitch.checked=snapOn;
  for(const [name,value] of [['format',state.format],['layout',layoutStyle]])for(const b of root.querySelectorAll(`[data-choice="${name}"] button`))b.setAttribute('aria-pressed',String(b.dataset.value===value));
  for(const b of root.querySelectorAll('[data-location]'))b.setAttribute('aria-pressed',String(b.dataset.location===state.location));
  for(const [box,value] of [[posePicker,a?.pose],[facePicker,a?.expression]])for(const b of box.querySelectorAll('button')){b.disabled=!a;b.setAttribute('aria-pressed',String(b.dataset.value===value));}
  if(a&&step==='pose')paintFaces(a.recipe);
  $('[data-note="pose"]').textContent=!state.actors.length?'Add a character first (step 2).':a?'Posing '+a.name+'. Drag them in the picture to move them.':'Select a character in the picture or in the strip below it.';
  $('[data-action="shuffle-moment"]').disabled=!state.actors.length;
  for(const b of root.querySelectorAll('[data-action="add-current"],[data-action="add-resident"],[data-action="duplicate"]'))b.disabled=state.actors.length>=MAX_ACTORS||(b.dataset.action==='duplicate'&&!a);
  for(const b of root.querySelectorAll('[data-action="remove"],[data-action="edit-character"]'))b.disabled=!a;
  for(const b of root.querySelectorAll('[data-action="capture"]'))b.disabled=panels.length>=MAX_PANELS&&editingPanel===null;
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
  // While dragging, the outline goes where they will land at once (the picture follows when it is drawn), solid when caught.
  const drag=gesture?.kind==='drag'&&gesture.moved&&gesture.id===a.id?gesture:null,landed=drag?.landing&&b.feet&&onPicture([drag.landing.x,drag.landing.y,drag.landing.z]);
  selection.toggleAttribute('data-locked',!!drag?.landing?.target);
  selection.style.transform=landed?`translate(${((landed.x-b.feet.x)*w).toFixed(1)}px,${((landed.y-b.feet.y)*h).toFixed(1)}px)`:'';
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
 for(const n of ['turn','size','x','z','y','speech','speechStyle','seat','liftedBy'])field(n).addEventListener('input',()=>{const a=current();if(!a)return;
  if(['turn','size','x','z','y'].includes(n)&&sliding?.id!==a.id)sliding={id:a.id,before:placementOf(a)};
  if(n==='x'||n==='z'){if(world&&worldId===state.location){const x=world.origin[0]+(n==='x'?Number(field(n).value):a.x),z=world.origin[2]+(n==='z'?Number(field(n).value):a.z);if(!world.move(a,x,z,state.actors))announce('Movement stopped by furniture, another character or the ground boundary.');}}
  else if(n==='seat'){const id=field(n).value;if(state.actors.some(other=>other.id!==a.id&&other.seat===id&&id)){announce('That seat is occupied.');sync();return;}const before=placementOf(a);
   if(!id&&a.seat){standUp(a);a.pose=standingPose.get(a.id)||'Idle';}else if(id){const seat=world?.seats.find(s=>s.id===id);if(seat)sitOn(a,seat);}
   changed();sync();remember({kind:'place',id:a.id,before},a);return;}
  else if(n==='liftedBy'){const id=field(n).value;if(id&&state.actors.some(b=>b.id!==a.id&&b.liftedBy===id)){announce('That character is already carrying someone.');sync();return;}a.liftedBy=id;a.seat='';if(id)a.pose='LiftedBack';}
  else a[n]=['turn','size','y'].includes(n)?Number(field(n).value):text(field(n).value);
  changed();sync();});
 // One Undo step per slider gesture: the place before the first 'input', remembered on 'change'.
 for(const n of ['turn','size','x','z','y'])field(n).addEventListener('change',()=>{const a=current();if(a&&sliding?.id===a.id)remember({kind:'place',id:a.id,before:sliding.before},a);sliding=null;});
 for(const n of ['style','top','bottom','exitLabel'])field(n).addEventListener('input',()=>{state[n]=text(field(n).value);changed();});
 for(const b of root.querySelectorAll('[data-choice] button'))b.addEventListener('click',()=>{const name=b.parentElement.dataset.choice;if(name==='format'){state.format=b.dataset.value;changed();}else{layoutStyle=b.dataset.value;comicFile.schedule(0);}sync();});

 async function loadWorld(id){
  if(world&&worldId===id)return world;
  views??=await fetch(new URL('../johansson-town/assets/images/feed/views.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Locations unavailable');return r.json();});
  views.classroom={wide:CLASSROOM_VIEW};
  const next=await buildSceneWorld(id,views,townData);townData=next.townData||townData;world?.dispose();world=next;worldId=id;renderer?.renderLists.dispose();
  field('seat').replaceChildren(new Option('Stand on ground',''),...world.seats.filter(s=>Math.hypot(s.position[0]-world.origin[0],s.position[2]-world.origin[2])<SNAP.reach).map(s=>{const o=new Option(s.label,s.id);o.dataset.label=s.label;return o;}));
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
 function draw(){const time=sceneTime,capturedActor=liveActor,capturedFrame=liveFrame;const token=++generation;draws++;valid=false;canvas.setAttribute('aria-busy','true');state.time=time;const snapshot=structuredClone(state);
  queue=queue.catch(()=>{}).then(async()=>{
   if(token!==generation)return;
   const restore=[];
   try{
    const w=1200,h=Math.round(w/FORMATS[snapshot.format]),environment=await loadWorld(snapshot.location);if(token!==generation)return;
    renderer??=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.setSize(w,h,false);renderer.setViewport(0,0,w,h);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    for(const [id,entry] of avatars)if(!snapshot.actors.some(a=>a.id===id)){clearAvatar(entry);avatars.delete(id);}
    for(const entry of avatars.values())entry.avatar.root.removeFromParent();
    environment.stage?.(snapshot.furniture);stageComicExit(environment,snapshot.effect==='escape'&&snapshot.backdrop==='paper',snapshot.exitLabel);inkProps(environment.furniture,snapshot.backdrop==='paper'&&snapshot.style==='comic');if(snapshot.location==='classroom')for(const [id,o] of Object.entries(environment.furniture||{}))o.scale.setScalar(1.35*(snapshot.furniture?.[id]?.size||1));
    if(snapshot.backdrop==='paper'){
     const keep=new Set();for(const o of Object.values(environment.furniture||{}))o.traverse(m=>keep.add(m));
     for(const m of environment.meshes)if(m.visible&&!keep.has(m)){m.visible=false;restore.push(()=>m.visible=true);}
     const bg=environment.scene.background;environment.scene.background=new THREE.Color('#faf7ee');restore.push(()=>environment.scene.background=bg);
    }
    const camera=environment.camera,preset=views[snapshot.location].wide.camera;
    camera.position.fromArray(preset.position);camera.quaternion.fromArray(preset.quaternion);camera.fov=snapshot.camera.fov||(snapshot.location==='dock-workshop'?65:55);if(snapshot.camera.position){camera.position.fromArray(snapshot.camera.position);camera.lookAt(...snapshot.camera.target);}camera.aspect=w/h;camera.updateProjectionMatrix();
    const target=new THREE.Vector3(environment.origin[0],environment.origin[1]+.9,environment.origin[2]);if(snapshot.camera.target)target.fromArray(snapshot.camera.target);
    if(snapshot.camera.orbit||snapshot.camera.elevation||snapshot.camera.zoom!==1){const spherical=new THREE.Spherical().setFromVector3(camera.position.clone().sub(target));spherical.theta+=snapshot.camera.orbit*Math.PI/180;spherical.phi=THREE.MathUtils.clamp(spherical.phi-snapshot.camera.elevation*Math.PI/180,.25,Math.PI*.48);spherical.radius*=snapshot.camera.zoom;camera.position.copy(target).add(new THREE.Vector3().setFromSpherical(spherical));camera.lookAt(target);
     const direction=camera.position.clone().sub(target),length=direction.length(),ray=new THREE.Raycaster(target,direction.normalize(),.15,length),hit=ray.intersectObjects(environment.meshes,false).find(h=>h.object.visible&&h.object.material?.depthWrite!==false);if(hit)camera.position.copy(target).addScaledVector(direction,Math.max(.3,hit.distance-.15));
    }
    camera.updateMatrixWorld(true);environment.settle(snapshot.actors);const bubbles=[],placed=[],records=[];
    const solid=(from,to)=>{const direction=to.clone().sub(from),distance=direction.length();return new THREE.Raycaster(from,direction.normalize(),.05,distance-.08).intersectObjects(environment.meshes,false).some(h=>h.object.visible&&h.object.material?.depthWrite!==false);};
    for(const actor of snapshot.actors){
     // A posed avatar is kept while only its place changes: moving between stools of one height and facing reuses it.
     const position=environment.place(actor),seatShape=position.seat?[Math.round((position.seat.surfaceY-position.y)*100)/100,position.seat.yaw||0]:0;
     const key=JSON.stringify([actor.recipe,actor.pose,actor.expression,actor.turn,actor.size,seatShape]);let entry=avatars.get(actor.id);
     if(!entry||entry.key!==key){if(entry)clearAvatar(entry);entry={key,avatar:buildAvatar(actor.recipe,{shadows:true,faceSize:256})};entry.avatar.paintFace=createSceneFacePainter(entry.avatar,actor.recipe,()=>entry.poseName||actor.pose);entry.avatar.root.userData.studioActor=true;avatars.set(actor.id,entry);}
     const avatar=entry.avatar;
     // Each avatar is a mesh in the same scene graph as the counter and walls.
     environment.scene.add(avatar.root);avatar.root.position.set(0,0,0);avatar.root.scale.setScalar(actor.size);
     const performance=capturedActor===actor.id&&capturedFrame?capturedFrame:actor.take?sampleTake(actor.take,time,{loop:actor.takeLoop}):null;
     const actedPose=performance?.pose==='idle'?'Idle':performance?.pose;
     const poseName=actedPose&&KNOWN_POSES.has(actedPose)?actedPose:actor.pose;
     if(entry.poseName!==poseName||movingPose(poseName)){poseSceneAvatar(avatar,{...actor,pose:poseName,time,seatHeight:position.seat?(position.seat.surfaceY-position.y)/actor.size:0});entry.poseName=poseName;entry.basePose=Object.values(avatar.bones).map(b=>[b,b.quaternion.clone()]);entry.rootY=avatar.root.position.y;entry.rootTurn=avatar.root.rotation.y;}
     else{for(const [bone,q] of entry.basePose)bone.quaternion.copy(q);avatar.root.position.y=entry.rootY;avatar.root.rotation.y=entry.rootTurn;}
     avatar.paintFace({expression:actor.expression,blink:0,talk:0,look:actor.pose==='LiftedBack'&&actor.expression==='embarrassed'?[0,.8]:[0,0],blinkLeft:undefined,blinkRight:undefined,actingBrow:0,actingSmile:0});
     if(performance)applyActorFrame(avatar,{...performance,expression:KNOWN_EXPRESSIONS.has(performance.expression)?performance.expression:actor.expression});
     if(position.seat)avatar.root.rotation.y=Math.PI+(position.seat.yaw||0);
     placeSceneAvatar(avatar,position,actor.size);records.push({actor,avatar,position});
    }
    const contacts=applySceneContacts(records);
    for(const {actor,avatar,position} of records){
     const box=new THREE.Box3().setFromObject(avatar.root),head=headCentre(avatar),projected=head.clone().project(camera);
     const visible=projected.z<1&&projected.z>-1&&!solid(camera.position,head);
     const top=new THREE.Vector3(head.x,box.max.y,head.z).project(camera);bubbles.push({shout:actor.speechStyle==='shout',large:actor.speechStyle==='large',text:actor.speech,x:(projected.x+1)/2,y:(1-top.y)/2-(w/h)*.10-.025,visible});
     placed.push({id:actor.id,box,face:headCentre(avatar),radius:avatar.measure.Rh*Math.max(avatar.measure.headSX,avatar.measure.headSY)*actor.size,visible,feet:new THREE.Vector3(position.x,position.y,position.z)});
     const live=state.actors.find(a=>a.id===actor.id);if(live){live.x=actor.x;live.z=actor.z;live.seat=actor.seat;}
    }
    if(snapshot.backdrop==='paper'&&snapshot.style==='comic'){
     const faces=new Set(records.map(r=>r.avatar.face.texture)),materials=new Set();for(const object of [...records.map(r=>r.avatar.root),...Object.values(environment.furniture||{})])object.traverse(m=>{for(const material of Array.isArray(m.material)?m.material:[m.material])if(material?.isMeshToonMaterial&&!faces.has(material.map))materials.add(material);});
     for(const material of materials){const before=material.gradientMap;material.gradientMap=gradientMap(2);restore.push(()=>material.gradientMap=before);}
     environment.scene.traverse(o=>{if(o.isHemisphereLight){const before=o.intensity;o.intensity=1.35;restore.push(()=>o.intensity=before);}});
    }
    environment.sky?.update(camera,1,false,false);renderer.render(environment.scene,camera);
    canvas.width=w;canvas.height=h;ctx.drawImage(renderer.domElement,0,0);if(snapshot.effect==='dash'){const contacts=snapshot.backdrop==='paper'?records.filter(r=>movingPose(r.actor.pose)&&!r.actor.y&&!r.actor.seat).map(r=>{const soles=createSoleFinder(r.avatar)(),side=soles.L.y<soles.R.y?'L':'R',point=r.avatar.root.worldToLocal(r.avatar.bones['foot'+side].getWorldPosition(new THREE.Vector3()));point.y=soles[side].y;point.z=soles[side].z;return r.avatar.root.localToWorld(point).project(camera);}):[];drawDash(ctx,w,h,contacts);}if(['chaos','escape'].includes(snapshot.effect))drawComicChaos(ctx,w,h,records.map(r=>headCentre(r.avatar).project(camera)),snapshot.effect==='escape');const overlay=document.createElement('canvas');overlay.width=w;overlay.height=h;drawCaptions(overlay.getContext('2d'),w,h,{style:snapshot.style,top:snapshot.top,bottom:snapshot.bottom,bubbles:bubbles.filter(b=>!b.shout&&!b.large)});ctx.drawImage(overlay,0,0);for(const b of bubbles.filter(b=>b.shout))drawShout(ctx,w,h,b.text);for(const b of bubbles.filter(b=>b.large))drawStatement(ctx,w,h,b.text,b.x);
    // Where each character is on the picture (fractions of it), for picking, the outline and the toolbar.
    const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0);
    boxes=placed.map(p=>{const corners=[];for(const x of [p.box.min.x,p.box.max.x])for(const y of [p.box.min.y,p.box.max.y])for(const z of [p.box.min.z,p.box.max.z])corners.push(new THREE.Vector3(x,y,z).project(camera));
     const behind=corners.some(c=>c.z>1||c.z<-1),xs=corners.map(c=>(c.x+1)/2),ys=corners.map(c=>(1-c.y)/2),f=p.face.clone().project(camera),edge=p.face.clone().addScaledVector(right,p.radius).project(camera),feet=p.feet.project(camera);
     return {id:p.id,visible:p.visible&&!behind,left:Math.max(0,Math.min(...xs)),right:Math.min(1,Math.max(...xs)),top:Math.max(0,Math.min(...ys)),bottom:Math.min(1,Math.max(...ys)),face:{x:(f.x+1)/2,y:(1-f.y)/2,r:Math.abs(edge.x-f.x)/2},feet:{x:(feet.x+1)/2,y:(1-feet.y)/2}};}).filter(b=>b.right>b.left&&b.bottom>b.top);
    drawPortraits(h);renderer.setViewport(0,0,w,h);
    canvas.dataset.framing=JSON.stringify(placed.map(p=>{const f=p.face.clone().project(camera);return {id:p.id,head:[f.x,f.y,f.z],visible:p.visible};}));canvas.dataset.contacts=JSON.stringify(contacts);valid=true;canvas.setAttribute('aria-busy','false');sync();if(!scenePlaying&&!capturedFrame&&!exportingStaging)save();if(token===generation&&!scenePlaying&&!exportingStaging)sceneFile.schedule();
   }catch(e){canvas.setAttribute('aria-busy','false');announce('The 3D location could not load. Select the location again to retry.');console.error('Johansson Studio 3D scene',e);}finally{for(const reset of restore)reset();}
  });return queue;
 }

 field('effect').onchange=()=>{state.effect=field('effect').value;changed();};
 field('backdrop').onchange=()=>{state.backdrop=field('backdrop').value;changed();};
 // ---- Direct control in the picture: tap selects, drag lifts a character and drops them where they snap into place
 // (scene-snap.mjs: a free seat, beside someone, at a counter; else exactly there), two fingers turn. ----
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
 /** Where a point in the town is on the picture, as fractions of it (null behind the camera). */
 function onPicture(p){if(!world)return null;const v=new THREE.Vector3(p[0],p[1],p[2]).project(world.camera);return v.z>1||v.z<-1?null:{x:(v.x+1)/2,y:(1-v.y)/2};}
 /** CSS px on the picture for a point in the town; null behind the camera or, with `clip`, off the picture (8 px in). */
 function projector(){const r=canvas.getBoundingClientRect();
  return (p,clip=true)=>{const f=onPicture(p);if(!f)return null;const x=f.x*r.width,y=f.y*r.height;return clip&&(x<8||y<8||x>r.width-8||y>r.height-8)?null:{x,y};};}
 /** Everything a drag of `a` can snap to, worked out once (the camera and the others stay put during a drag). */
 function snapContext(a){const project=projector();return {...world.snapTargets(a,state.actors,{project,seen:world.seeing(renderer),seated:seatedPose}),project,floor:world.floor};}
 /**
  * The feet under the finger: they stay where they were on the picture relative to the finger (the same pixels below and
  * beside it), and their own ray is met with the floor where they will stand (settled three times). Rays to the feet meet
  * the floor steeply; a ray through the grabbed body point meets any level plane almost edge-on when the camera is at eye
  * height, and there a few pixels would throw the character metres away.
  */
 function wantedFeet(e,g){const at={clientX:e.clientX-g.offX,clientY:e.clientY-g.offY};let y=g.y0,point=groundAt(at,y);
  for(let i=0;i<3&&point;i++){const f=world.floor(point.x,point.z);if(!Number.isFinite(f)||Math.abs(f-y)<1e-4)break;y=f;point=groundAt(at,y)||point;}
  return point&&{x:point.x,y,z:point.z};}
 /** A landing, worked out from where the drag began so it never drifts: seated on a seat, else standing as they were. */
 function applyLanding(a,g,landing){
  if(landing.kind==='seat'){sitOn(a,landing.seat,seatedPose(g.start.pose)?g.start.pose:'Sit');return;}
  world.put(a,landing);a.size=g.start.size;
  a.pose=g.startSeat?(standingPose.get(a.id)||'Idle'):g.start.pose;
  a.turn=landing.turn??(g.startSeat?g.startSeat.turn:g.start.turn);
 }
 canvas.addEventListener('pointerdown',e=>{
  if(mode!=='scene'||!world)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){if(gesture?.kind==='drag')finishDrag();const a=current();
   if(a&&!a.seat){const [p,q]=[...pointers.values()];startTwist(a,p,q);}
   else if(a)announce('Seated characters face the way their seat faces. Stand them up to turn them.');return;}
  if(pointers.size>2)return;
  const id=actorAt(e);
  if(!id){gesture={kind:'tap',x:e.clientX,y:e.clientY,pointer:e.pointerId};return;}
  selected=id;overlayStep=step;const a=current(),p=world.place(a),r=canvas.getBoundingClientRect(),feet=onPicture([p.x,p.y,p.z]);
  if(!a.seat&&!seatedPose(a.pose))standingPose.set(a.id,a.pose);
  gesture={kind:'drag',id,pointer:e.pointerId,x:e.clientX,y:e.clientY,moved:false,y0:p.y,offX:feet?e.clientX-r.left-feet.x*r.width:0,offY:feet?e.clientY-r.top-feet.y*r.height:0,
   start:placementOf(a),startSeat:p.seat||null,capturePx:e.pointerType==='touch'?SNAP.capturePx.touch:SNAP.capturePx.mouse,ctx:null,landing:null};
  try{canvas.setPointerCapture(e.pointerId);}catch{}sync();
 });
 canvas.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId)||!world)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(gesture?.kind==='twist'&&pointers.size>=2){twistTo(e);return;}
  const g=gesture;if(g?.kind!=='drag'||e.pointerId!==g.pointer)return;
  if(!g.moved&&Math.hypot(e.clientX-g.x,e.clientY-g.y)<4)return;
  const a=state.actors.find(a=>a.id===g.id);if(!a)return;
  if(!g.moved){g.moved=true;g.ctx=snapContext(a);}
  const want=g.want=wantedFeet(e,g),landing=want&&resolveSnap(want,{...g.ctx,capturePx:g.capturePx,snapping:snapOn&&!e.altKey,lock:g.landing?.target?.id||null,previous:g.landing});
  // Nowhere free and seen under the finger: they stay where they last landed.
  if(landing&&landing.key!==g.landing?.key){g.landing=landing;applyLanding(a,g,landing);sceneFile.invalidate();pending=draw();}
  syncSelection();
 });
 function endPointer(e){
  if(!pointers.delete(e.pointerId))return;
  if(gesture?.kind==='twist'){if(pointers.size<2)finishTwist();return;}
  if(gesture?.kind==='drag'&&e.pointerId===gesture.pointer){if(e.type==='pointercancel')cancelDrag();else finishDrag();return;}
  if(gesture?.kind==='tap'&&e.pointerId===gesture.pointer){const tap=Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)<8&&e.type==='pointerup';gesture=null;if(tap&&selected){selected=null;sync();}}
 }
 /** Letting go keeps exactly what is showing; one Undo step, and a sentence for what caught them. */
 function finishDrag(){const g=gesture;gesture=null;const a=state.actors.find(x=>x.id===g.id);
  if(!g.moved||!a){sync();return;}
  const placed=remember({kind:'place',id:a.id,before:g.start},a);changed();sync();if(placed)tell(a,g);}
 function cancelDrag(){const g=gesture;gesture=null;if(g.moved){applyPlacement(state,g.id,g.start);changed();}sync();}
 function tell(a,g){
  const seat=a.seat&&world.seats.find(s=>s.id===a.seat),seated=g.start.seat!==a.seat?a.name+(seat?' '+sits(seat.label):' stands up')+'.':'',L=g.landing;
  const caught=!a.seat&&L?.kind==='edge'?a.name+' stands at the counter.':!a.seat&&L?.kind==='person'?a.name+(L.target.mark==='talk'?' faces ':' stands beside ')+L.target.other.name+'.':'';
  announce(caught||seated);if(seated)offerUndo(seated,undoLast);
 }
 for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,endPointer);
 // Safari's own pinch and rotate gestures would zoom the page while two fingers turn a character.
 canvas.addEventListener('gesturestart',e=>e.preventDefault());
 canvas.addEventListener('lostpointercapture',e=>{if(gesture?.kind==='drag'&&e.pointerId===gesture.pointer)endPointer(e);});

 // ---- Turning: stops of 15° from facing the camera (keys, twist) and 45° (toolbar); a twist also catches on facing the
 // nearest neighbour within 2.5 m and, at a counter, on facing it. The Turn slider (5°) and a twist without snapping are free. ----
 const cameraXZ=()=>({x:world.camera.position.x,z:world.camera.position.z});
 function startTwist(a,p,q){const at=world.place(a),detents=[];let nearest=null,reach=SNAP.turn.detentReach;
  for(const o of state.actors){if(o.id===a.id)continue;const op=world.place(o),d=Math.hypot(op.x-at.x,op.z-at.z);if(d>.01&&d<=reach){reach=d;nearest=op;}}
  if(nearest)detents.push(turnToward(at,nearest));
  for(const edge of world.edges){const line=edgeLine(edge,a.size);if(line&&lineDistance(at,line)<=.05)detents.push(edge.turn);}
  gesture={kind:'twist',id:a.id,turn:a.turn,angle:touchAngle(p,q),zero:turnToward(at,cameraXZ()),detents,snap:null,before:placementOf(a)};syncSelection();}
 function twistTo(e){const g=gesture,a=state.actors.find(a=>a.id===g.id);if(!a)return;const [p,q]=[...pointers.values()],raw=twistTurn(g.turn,g.angle,touchAngle(p,q));
  let turn=raw;if(snapOn&&!e.altKey){g.snap=snapTurn(raw,{zero:g.zero,previous:g.snap,detents:g.detents});turn=g.snap.turn;}else g.snap=null;
  if(turn===a.turn)return;a.turn=turn;sceneFile.invalidate();pending=draw();}
 function finishTwist(){const g=gesture;gesture=null;const a=state.actors.find(x=>x.id===g.id);if(a)remember({kind:'place',id:a.id,before:g.before},a);changed();sync();}
 /** To the next stop (`step` degrees) to the left (dir +1) or right around facing the camera. → the place before, or null. */
 function turnBy(dir,step){const a=current();if(!a||!world)return null;if(a.seat){announce('Seated characters face the way their seat faces. Stand them up to turn them.');return null;}
  const before=placementOf(a),p=world.place(a);a.turn=stepTurn(a.turn,dir,{zero:turnToward({x:p.x,z:p.z},cameraXZ()),step});changed();sync();return before;}
 function faceCamera(){const a=current();if(!a||!world||a.seat)return;const before=placementOf(a),p=world.place(a);a.turn=turnToward({x:p.x,z:p.z},cameraXZ());changed();sync();remember({kind:'place',id:a.id,before},a);announce(a.name+' faces the camera.');}
 function sitOrStand(){const a=current();if(!a||!world)return;const before=placementOf(a);
  if(a.seat||seatedPose(a.pose)){if(a.seat)standUp(a);a.pose=standingPose.get(a.id)||'Idle';changed();sync();remember({kind:'place',id:a.id,before},a);announce(a.name+' stands up.');return;}
  const p=world.place(a),seat=nearestSeat(world.seats,{x:p.x,z:p.z},new Set(state.actors.filter(o=>o.id!==a.id&&o.seat).map(o=>o.seat)));
  if(seat){sitOn(a,seat);announce(a.name+' '+sits(seat.label)+'.');}else{standingPose.set(a.id,a.pose);a.pose='Sit';announce('No free seat nearby, so '+a.name+' sits on the ground.');}
  changed();sync();remember({kind:'place',id:a.id,before},a);
 }
 const turnTool=dir=>()=>{const before=turnBy(dir,TURN_TAP),a=current();if(before&&a)remember({kind:'place',id:a.id,before},a);};
 const tools={'turn-left':turnTool(1),'turn-right':turnTool(-1),'face-camera':faceCamera,'sit':sitOrStand,'remove':()=>{const a=current();if(a)removeActor(a.id);}};
 for(const b of toolbar.querySelectorAll('[data-tool]'))b.addEventListener('click',()=>tools[b.dataset.tool]());
 toolbar.addEventListener('pointerdown',e=>e.stopPropagation());
 document.addEventListener('keydown',onKey);
 /** Key presses for one character less than 600 ms apart are one Undo step. */
 function rememberKey(a,before){const now=performance.now(),last=history.at(-1),same=burst.id===a.id&&now-burst.at<KEY_BURST&&last?.kind==='place'&&last.id===a.id;burst={id:a.id,at:now};if(!same)remember({kind:'place',id:a.id,before},a);}
 function onKey(e){
  if(root.hidden||mode!=='scene'||!preview.element.hidden||e.defaultPrevented)return;
  if((e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==='z'&&!e.target.closest?.('input,textarea,select')){e.preventDefault();if(!toast.hidden&&undoAction&&undoAction!==undoLast)undo();else undoLast();return;}
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  const inPicture=e.target===document.body||e.target.closest?.('.scene-picture');if(!inPicture||e.target.closest('input,textarea,select'))return;
  const a=current();if(!a||!world)return;
  const step=nudgeStep(e.key,world.camera.getWorldDirection(new THREE.Vector3()),e.shiftKey?.5:.15);
  if(step){e.preventDefault();const before=placementOf(a),p=world.place(a);if(!world.move(a,p.x+step.dx,p.z+step.dz,state.actors))announce('Stopped by a wall, furniture, another character or the edge of the ground.');changed();sync();rememberKey(a,before);return;}
  if(['q','Q','['].includes(e.key)){e.preventDefault();const before=turnBy(1,TURN_KEY);if(before)rememberKey(a,before);}
  else if(['e','E',']'].includes(e.key)){e.preventDefault();const before=turnBy(-1,TURN_KEY);if(before)rememberKey(a,before);}
  else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();removeActor(a.id);}
  else if(e.key==='Escape'){selected=null;sync();}
 }

 // ---- Undo: every placement change and removal (up to 20, this location only); the toast offers it for a removal or a
 // drag that sits someone down or stands them up. Ctrl/Cmd+Z takes back the last one at any time. ----
 const toast=$('.scene-toast');let toastTimer=0,undoAction=null;
 // Seven seconds of a page that can be used: while a slow device is busy redrawing or making a file, at most half a
 // second of each stall counts, so the Undo is never gone before it could be tapped.
 function offerUndo(message,action){clearInterval(toastTimer);undoAction=action;toast.querySelector('.scene-toast-text').textContent=message;toast.hidden=false;
  let left=UNDO_MS,last=performance.now();toastTimer=setInterval(()=>{const now=performance.now();left-=Math.min(now-last,500);last=now;if(left<=0)hideToast();},250);}
 function hideToast(){clearInterval(toastTimer);toast.hidden=true;undoAction=null;}
 function undo(){const action=undoAction;hideToast();action?.();}
 toast.querySelector('[data-undo]').onclick=undo;
 function shuffleMoment(){
  const moment=pickMoment(state.actors.length,{last:lastMoment});if(!moment){announce('Add a character first, then shuffle a moment.');return;}
  const before={actors:structuredClone(state.actors),bottom:state.bottom},camera=world&&worldId===state.location?{x:world.camera.position.x-world.origin[0],z:world.camera.position.z-world.origin[2]}:null;
  const open=(x,z,r=.3)=>!world.blocked(world.origin[0]+x,world.origin[2]+z,r);
  // Open floor that the camera can see: nothing solid on the line from the spot to the camera (a shelf in front hides them).
  // …and well inside the picture: chest and head project inside the frame, at least 1.6 m from the lens.
  const v=new THREE.Vector3(),inView=(x,z)=>{if(!camera)return true;world.camera.updateMatrixWorld(true);for(const h of [.8,1.4]){v.set(world.origin[0]+x,world.origin[1]+h,world.origin[2]+z);if(v.distanceTo(world.camera.position)<1.6)return false;v.project(world.camera);if(!(Math.abs(v.x)<.75&&Math.abs(v.y)<.85&&v.z<1))return false;}return true;};
  const free=world&&worldId===state.location?(x,z)=>{if(!open(x,z)||!inView(x,z))return false;if(!camera)return true;const d=Math.hypot(camera.x-x,camera.z-z);for(let t=.35;t<d-.6;t+=.25){const k=t/d;if(!open(x+(camera.x-x)*k,z+(camera.z-z)*k,.08))return false;}return true;}:null;
  applyMoment(state,moment,{camera,free:free&&[free,(x,z)=>open(x,z)&&inView(x,z)]});
  if(free){world.settle(state.actors);aim(state.actors,moment.layout,camera).forEach((t,i)=>{state.actors[i].turn=t;});}
  lastMoment=moment.id;changed();sync();
  offerUndo('Shuffled “'+moment.title+'”. Poses, faces, lines and caption changed.',()=>{state.actors=before.actors;state.bottom=before.bottom;changed();sync();});
 }
 /** Keep an Undo step (a placement only when something changed); any new step hides the toast. → whether it was kept. */
 function remember(entry,a){if(entry.kind==='place'&&samePlacement(entry.before,placementOf(a)))return false;history.push(entry);if(history.length>SNAP.history)history.shift();hideToast();return true;}
 function forget(){history.length=0;standingPose.clear();sliding=null;hideToast();}
 function undoLast(){hideToast();
  while(history.length){const entry=history.pop();
   if(entry.kind==='remove'){const actor=restoreCharacter(state,entry.removed);if(!actor){history.push(entry);announce('The scene is full: remove someone first to bring '+entry.removed.actor.name+' back.');return;}selected=actor.id;overlayStep=step;changed();sync();announce(actor.name+' is back.');return;}
   const a=applyPlacement(state,entry.id,entry.before);if(a){selected=a.id;overlayStep=step;changed();sync();announce('Undone: '+a.name+' is back as before.');return;}
  }
  announce('Nothing to undo.');}
 function removeActor(id){
  const removed=removeCharacter(state,id);if(!removed)return;if(selected===id)selected=null;
  remember({kind:'remove',removed});changed();sync();announce(removed.actor.name+' removed from the scene.');
  offerUndo(removed.actor.name+' removed.',undoLast);
 }
 // For the browser tests only (navigator.webdriver): the snap targets and feet in client px, and how often it drew.
 if(navigator.webdriver)window.__studioSnap={
  targets(id=selected){const a=state.actors.find(x=>x.id===id);if(!a||!world)return [];const ctx=snapContext(a),r=canvas.getBoundingClientRect(),at=p=>{const q=ctx.project(p,false);return q&&{x:r.left+q.x,y:r.top+q.y};};
   return ctx.targets.map(t=>t.line?{id:t.id,kind:t.kind,turn:t.turn,line:t.line,normal:t.edge.n,a:at([t.line.a[0],world.floor(...t.line.a),t.line.a[1]]),b:at([t.line.b[0],world.floor(...t.line.b),t.line.b[1]])}
    :{id:t.id,kind:t.kind,label:t.label||'',turn:t.turn,mark:t.mark||'',other:t.other?.id||'',point:t.point,ok:t.ok?t.ok(t.point[0],t.point[2]):true,...at(t.point)});},
  feet(id=selected){const a=state.actors.find(x=>x.id===id);if(!a||!world)return null;const p=world.place(a),q=projector()([p.x,p.y,p.z],false),r=canvas.getBoundingClientRect();return q&&{x:r.left+q.x,y:r.top+q.y,world:[p.x,p.y,p.z]};},
  /** A client point on the picture that picks this character (their own body, not someone in front of them). */
  grip(id=selected){const b=boxes.find(x=>x.id===id),r=canvas.getBoundingClientRect();if(!b)return null;
   for(const fy of [.45,.3,.6,.2,.75,.12,.88])for(const fx of [.5,.35,.65]){const p={clientX:r.left+(b.left+(b.right-b.left)*fx)*r.width,clientY:r.top+(b.top+(b.bottom-b.top)*fy)*r.height};if(actorAt(p)===id)return {x:p.clientX,y:p.clientY};}
   return null;},
  /** Could the selected character stand at (x,z) (town metres): free, and seen by the camera? */
  check(x,z,id=selected){const a=state.actors.find(o=>o.id===id);if(!a||!world)return null;const c=snapContext(a);return {free:c.free(x,z),seen:c.seen(x,z)};},
  /** During a drag: the client point where the finger must be for the feet to land on `point` [x,y,z]. */
  aim(point){const g=gesture;if(g?.kind!=='drag'||!world)return null;const q=projector()(point,false),r=canvas.getBoundingClientRect();return q&&{x:r.left+q.x+g.offX,y:r.top+q.y+g.offY};},
  get draws(){return draws;},
  drag(){const g=gesture;return g?.kind==='drag'?{offX:g.offX,offY:g.offY,y0:g.y0,want:g.want&&[+g.want.x.toFixed(2),+g.want.z.toFixed(2)],free:g.want&&g.ctx?[g.ctx.free(g.want.x,g.want.z),g.ctx.seen(g.want.x,g.want.z)]:null,landing:g.landing&&{x:g.landing.x,z:g.landing.z,kind:g.landing.kind,key:g.landing.key}}:null;},
  origin(){return world?.origin.slice(0,3)||null;},
  /** The depth picture against rays at `n` points over the floor: how often they agree. */
  agreement(n=200){if(!world||!renderer)return null;const see=world.seeing(renderer),o=world.origin,project=projector();let agree=0,seen=0,shown=0;const differ=[];
   for(let i=0;i<n;i++){const x=o[0]+(Math.sin(i*12.9898)*43758.5453%1)*12,z=o[2]+(Math.sin(i*78.233)*12543.21%1)*12,y=world.floor(x,z)+1.45;if(!Number.isFinite(y)||!project([x,y,z]))continue;shown++;const ray=world.seen(x,y,z),depth=see(x,y,z);if(ray===depth)agree++;else differ.push([+x.toFixed(2),+y.toFixed(2),+z.toFixed(2),ray,depth]);if(ray)seen++;}
   return {agree,shown,seen,differ:differ.slice(0,12)};},
 };

 function add(recipe,name){const a=addCharacter(state,normalizeRecipe(recipe),name);if(!a){announce('The scene already has six characters.');return;}selected=a.id;changed();sync();announce(a.name+' added. Select Pose & position to arrange them.');}
 async function ready(){let task;do{task=pending;await task;}while(task!==pending);if(!valid){announce('Wait for the scene to finish loading, then try again.');return false;}return true;}
 async function capture(){if(capturing)return;capturing=true;try{if(panels.length>=MAX_PANELS&&editingPanel===null){announce('Your comic already has four panels. Remove a panel to replace it.');return;}if(!await ready())return;
  const dataURL=canvas.toDataURL('image/png'),blob=dataURLToBlob(dataURL),url=URL.createObjectURL(blob);
  const panel={dataURL,url,file:new File([blob],'johansson-studio-panel.png',{type:'image/png'}),image:await loadImage(url),scene:structuredClone(state)};if(editingPanel!==null&&panels[editingPanel]){URL.revokeObjectURL(panels[editingPanel].url);panels[editingPanel]=panel;editingPanel=null;}else panels.push(panel);renderPanels();announce('Panel '+panels.length+' added. Open Comic to review it, or compose the next scene.');}
  catch(e){console.warn('Johansson Studio: capture',e);announce('The panel could not be captured. Please try again.');}finally{capturing=false;}}
 async function captureStaging(){
  stopCast();acting.session.hold();liveFrame=null;liveActor=null;if(!await ready())throw Error('Scene is not ready.');
  const original=state,scene=structuredClone(state),camera=world.camera,direction=camera.getWorldDirection(new THREE.Vector3()),cam={pos:camera.position.toArray(),at:camera.position.clone().add(direction).toArray(),fov:camera.fov,size:[canvas.width,canvas.height]},origin=world.origin.slice(0,3);
  const cast=state.actors.map(a=>{const p=world.place(a);return {id:a.id,name:a.name,recipe:structuredClone(a.recipe),position:[p.x,p.y,p.z],turn:a.turn,size:a.size,pose:a.pose,expression:a.expression,seat:p.seat?{surfaceY:p.seat.surfaceY,yaw:p.seat.yaw}:null,take:a.take?structuredClone(a.take):null};});
  const wasInert=root.inert;root.inert=true;exportingStaging=true;
  try{state={...scene,actors:[],style:'photo',top:'',bottom:''};pending=draw();if(!await ready())throw Error('Clean plate could not render.');return filmStaging({scene,camera:cam,origin,cast,image:canvas.toDataURL('image/png')});}
  finally{state=original;pending=draw();try{if(!await ready())throw Error('The original scene could not redraw. Its saved cast and captions are preserved.');}finally{exportingStaging=false;save();root.inert=wasInert;sceneFile.schedule();}}
 }
 function renderPanels(){const list=$('.scene-panels');list.replaceChildren();$('[data-panel-count]').textContent=panels.length;
  panels.forEach((p,i)=>{const figure=document.createElement('figure'),img=document.createElement('img');img.src=p.url;img.alt='Comic panel '+(i+1);figure.append(img);const row=document.createElement('div');
   for(const [label,action] of [...(p.scene?[['Edit scene',()=>{state=normalizeScene(p.scene,normalizeRecipe);sceneTime=state.time||0;editingPanel=i;selected=state.actors[0]?.id??null;forget();onMode('scene');setStep('pose');changed();sync();announce('Editing panel '+(i+1)+'. Add panel updates this panel.');}]]:[]),['Move earlier',()=>{panelOrder(panels,i,-1);renderPanels();}],['Move later',()=>{panelOrder(panels,i,1);renderPanels();}],['Remove',()=>removePanel(i)]]){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=action;b.disabled=(label==='Move earlier'&&i===0)||(label==='Move later'&&i===panels.length-1);row.append(b);}
   const link=document.createElement('a');link.className='scene-save';link.textContent='Save PNG';link.setAttribute('aria-label','Save panel '+(i+1)+' as PNG');
   const file=new File([p.file],'johansson-studio-panel-'+(i+1)+'.png',{type:'image/png'});bindSaveLink(link,{ready:true,file,url:p.url,now:()=>({file,url:p.url})},{say:say('comic'),words:saved('Panel')});
   row.append(link);figure.append(row);list.append(figure);});
  comicFile.schedule(0);sync();}
 function removePanel(i){const [panel]=panels.splice(i,1);renderPanels();offerUndo('Panel '+(i+1)+' removed.',()=>{if(panels.length>=MAX_PANELS)return;panels.splice(Math.min(i,panels.length),0,panel);renderPanels();});}
 const projectInput=$('[data-project-input]');projectInput.onchange=async()=>{try{const file=projectInput.files[0];if(!file)return;if(file.size>34000000)throw Error('Project too large');const project=JSON.parse(await file.text());if(project.format!=='johansson-studio-project'||project.version!==1||![1,2].includes(project.scene?.version))throw Error('Invalid project');const scene=normalizeScene(project.scene,normalizeRecipe),urls=(Array.isArray(project.panels)?project.panels:[]).slice(0,MAX_PANELS);if(urls.some(url=>typeof url!=='string'||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(url)||url.length>8000000))throw Error('Invalid panel');
  const loaded=await Promise.all(urls.map(async (dataURL,i)=>{const blob=dataURLToBlob(dataURL),url=URL.createObjectURL(blob);return {scene:project.panelScenes?.[i]?normalizeScene(project.panelScenes[i],normalizeRecipe):null,dataURL,url,file:new File([blob],'johansson-studio-panel.png',{type:'image/png'}),image:await loadImage(url)};}));
  layoutStyle=project.layout==='strip'?'strip':'grid';editingPanel=null;state=scene;sceneTime=state.time||0;selected=state.actors[0]?.id??null;forget();for(const p of panels)URL.revokeObjectURL(p.url);panels.splice(0,panels.length,...loaded);changed();renderPanels();sync();announce('Project opened.');}catch(e){console.warn('Johansson Studio: open project',e);announce('Unable to open this project. Choose a Johansson Studio project JSON file.');}finally{projectInput.value='';}};
 const actions={
  'classroom-example':async()=>{if(panels.length){announce('Open a new project or remove the current panels before building the example.');return;}for(const scene of classroomComic(recipeFor)){state=normalizeScene(scene,normalizeRecipe);sceneTime=state.time||0;selected=state.actors[0]?.id??null;pending=draw();await capture();}onMode('comic');renderPanels();},
  'shuffle-moment':shuffleMoment,
  'reset-camera':()=>{state.camera={orbit:0,elevation:0,zoom:1};for(const c of root.querySelectorAll('[data-camera]'))c.value=state.camera[c.dataset.camera];changed();},
  'add-current':()=>add(getCharacter()),'add-resident':()=>{const n=resident.value,id=n.startsWith('studio:')?n.slice(7):null;
   if(id&&Object.hasOwn(STUDIO_CHARACTERS,id))add(STUDIO_CHARACTERS[id].recipe,STUDIO_CHARACTERS[id].name);
   else if(n==='design:thuan-original')add(ORIGINAL_THUAN_RECIPE,'Thuận');
   else add(recipeFor(n),nameOf(n));},
  'edit-character':()=>{const a=current();if(a)onEdit(a.recipe,a.id);},'duplicate':()=>{const a=current();if(a)add(a.recipe,a.name);},
  'remove':()=>{const a=current();if(a)removeActor(a.id);},
  'previous':()=>setStep(keys[Math.max(0,keys.indexOf(step)-1)]),'next':()=>setStep(keys[Math.min(4,keys.indexOf(step)+1)]),
  'preview':()=>preview.open({title:'Your picture',ready:sceneFile,url:sceneFile.ready||!valid?'':canvas.toDataURL('image/png'),alt:'The scene as it will be saved'}),
  'preview-comic':()=>{if(panels.length)preview.open({title:'Your comic',ready:comicFile,url:comicFile.ready?'':composeComic().toDataURL('image/png'),alt:'The comic page as it will be saved'});},
  'capture':capture,'comic':()=>onMode('comic'),'compose':()=>{onMode('scene');setStep('location');},
  'prepare-film':async()=>{if(capturing)return;capturing=true;try{announce('Preparing a clean plate and camera/actor marks for the existing film pipeline…');preparedFilm=await captureStaging();$('[data-action="save-film"]').hidden=false;announce('Film staging ready. Download it for jojo/remotion; its collision and review gates still apply.');}finally{capturing=false;}},
  'save-film':()=>{if(preparedFilm)return deliverFile(new File([JSON.stringify(preparedFilm)],'johansson-'+state.location+'.staging.json',{type:'application/json'}));},
  'open-project':()=>projectInput.click()
 };
 for(const b of root.querySelectorAll('[data-action]'))b.onclick=()=>{Promise.resolve(actions[b.dataset.action]()).catch(e=>{console.warn('Johansson Studio',e);announce('The action could not be completed. Your scene is still available.');});};
 if(matchMedia('(max-width: 800px)').matches)$('.scene-camera-box').open=false;
 new ResizeObserver(()=>syncSelection()).observe(frame);
 setStep('location');renderPanels();
 return {root,captureStaging,async renderComic(scenes,{layout='strip'}={}){if(!Array.isArray(scenes)||!scenes.length||scenes.length>MAX_PANELS)throw Error('Give one to four scenes.');for(const p of panels)URL.revokeObjectURL(p.url);panels.length=0;editingPanel=null;layoutStyle=layout==='grid'?'grid':'strip';for(const scene of scenes){state=normalizeScene(scene,normalizeRecipe);sceneTime=state.time||0;pending=draw();if(!await ready())throw Error('Scene failed to render.');await capture();}return {image:composeComic().toDataURL('image/png'),project:{format:'johansson-studio-project',version:1,layout:layoutStyle,scene:structuredClone(state),panels:panels.map(p=>p.dataURL),panelScenes:panels.map(p=>p.scene)},contacts:JSON.parse(canvas.dataset.contacts||'[]')};},async renderScene(scene){state=normalizeScene(scene,normalizeRecipe);sceneTime=state.time||0;selected=state.actors[0]?.id??null;pending=draw();if(!await ready())throw Error('Scene failed to render.');return {image:canvas.toDataURL('image/png'),scene:structuredClone(state),contacts:JSON.parse(canvas.dataset.contacts||'[]'),framing:JSON.parse(canvas.dataset.framing||'[]')};},loadScene(scene){state=normalizeScene(scene,normalizeRecipe);sceneTime=state.time||0;selected=state.actors[0]?.id??null;forget();changed();sync();},setLocation(id){if(!LOCATIONS.some(([key])=>key===id))throw Error('Unknown Studio location.');state.location=id;changed();sync();},show(value){mode=value;root.dataset.mode=value;root.hidden=false;$('.scene-comic').hidden=value!=='comic';$('.scene-steps').hidden=value==='comic';$('.scene-controls').hidden=value==='comic';$('.scene-heading h1').textContent=value==='comic'?'Make a comic':'Build a scene';$('.scene-heading p').textContent=value==='comic'?'Add the scene you built as a panel, arrange up to four panels, then save your comic.':'Choose a place, add characters, then pose them and write your dialogue.';pending=draw();sync();},hide(){stopCast();acting.session.hold();root.hidden=true;hideToast();preview.close();},useCharacter(recipe,id){const a=state.actors.find(a=>a.id===id);if(a){a.recipe=normalizeRecipe(recipe);a.name=text(recipe.name)||a.name;selected=a.id;changed();sync();}else add(recipe);setStep('pose');},
  dispose(){stopCast();acting.dispose();generation++;document.removeEventListener('keydown',onKey);hideToast();sceneFile.dispose();comicFile.dispose();for(const p of panels)URL.revokeObjectURL(p.url);preview.element.remove();for(const entry of avatars.values())clearAvatar(entry);world?.dispose();renderer?.dispose();renderer?.forceContextLoss();root.remove();}};
}
