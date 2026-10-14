import * as THREE from '../johansson-town/vendor/three.module.js';
import {addLights,createCelPass,createInkPipeline,INK_OPTIONS,HERO,frameBox,viewDirection,renderHero,createHeroStage} from '../johansson-town/src/studio/modeller/look.js';
import {prepareForExport,exportGlb,assetFileName,resolveCard} from '../johansson-town/src/studio/modeller/export.js';
import {disposeMade} from '../johansson-town/src/studio/modeller/made.js';
import {slugify} from '../johansson-town/src/studio/modeller/card-checks.js';
import {LATHE_FAMILIES,LATHE_PALETTE,WAVES,DETAIL_LEVELS,latheParamsFor,latheKind,normalizeLathe,capDetail,profileCurve} from '../johansson-town/src/studio/makers/lathe.js';
import {buildAvatar} from '../johansson-town/src/avatars/build.js';
import {recipeFor} from '../johansson-town/src/avatars/cast.js';
import {catalogIds,catalogCard} from '../johansson-town/src/catalog/catalog-cards.js';
import {poseSceneAvatar} from './scene-avatar.js?v=20261011-1';
import {createReadyFile,bindSaveLink,touchFirst} from './studio-share.mjs';
import {loadRules,libraryItems,madeItem,readMade,writeMade,checkAsset,stlOf,glbOf,buildMade,latheCard,handOff} from './model-assets.mjs?v=20261014-1';

/**
 * "Make model": every asset of Johansson World in one library, each opened in World's look to turn round with a finger,
 * checked as the desktop Studio checks it, and saved in one tap as a GLB for World, an STL for a 3D printer, a
 * transparent PNG and its asset card (the creator, 2026-10-14: "I want all assets to be available in a studio maker as
 * well and easy to export"). "New from a shape: Lathe" makes a new one from a profile (makers/lathe.js), saved as its
 * parameters so it opens again; one whose checks pass can be sent to World's draft (johansson-studio's asset_draft),
 * and World changes only when the creator says "update World".
 *
 * Saving follows studio-share.mjs: every file is made ahead, whenever what it holds changes, so a tap on the iPad hands
 * it to the share sheet (Save to Files) or downloads it while Safari still counts the tap.
 */
const RESIDENT='Miss Higa',HANG_AT=2.2;
const KIND_WORDS={prop:'Props',furniture:'Furniture',fixture:'Fixtures',sign:'Signs',plant:'Plants','vehicle-part':'Vehicles and their parts','building-part':'Building parts'};
const SOURCE_WORDS={catalogue:'Catalogue',registry:'World code',made:'Made in Studio'};
const cm=v=>Math.round(v*1000)/10,fmt=n=>n.toLocaleString('en-GB');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function createModelWorkspace(){
 const root=document.createElement('main');root.className='scene-workspace model-workspace';root.hidden=true;
 root.innerHTML=`<div class="scene-heading"><div><h1>Make model</h1><p>Every asset of Johansson World: open one to turn it round in World’s look, check it, and save it for World, for a 3D printer or as a picture.</p></div>
 <button type="button" class="scene-primary" data-action="lathe">New from a shape: Lathe</button></div>
 <section class="model-library" data-view="library" aria-label="Asset library">
  <div class="model-search"><label>Search the library<input type="search" data-search placeholder="Name, kind or tag" autocomplete="off"></label>
  <button type="button" data-action="open-file">Open a design file</button><input type="file" accept=".json,application/json" data-file hidden></div>
  <p class="scene-export-status" role="status" data-library-status></p>
  <div data-groups></div>
 </section>
 <div class="scene-layout model-open" data-view="open" hidden>
  <section class="scene-picture" aria-label="The model">
   <div class="scene-frame"><canvas class="model-canvas" role="img"></canvas></div>
   <div class="model-view-row"><button type="button" data-action="library">Back to the library</button><button type="button" data-action="reset-view">Reset view</button><button type="button" data-action="resident" aria-pressed="false">Beside ${RESIDENT}</button></div>
   <p class="scene-hint" data-hint>Drag to turn it, pinch to come closer, double-tap to start again.</p>
   <h2 class="model-checks-title">Checks</h2><ul class="model-checks" data-checks aria-live="polite"></ul>
  </section>
  <aside class="scene-controls" aria-label="Model controls">
   <div data-maker hidden></div>
   <div data-about></div>
   <h2>Save</h2>
   <p class="scene-save-note" data-save-note></p>
   <div class="model-exports">
    <a class="scene-save scene-primary" data-save="glb">3D model for World (.glb)</a>
    <a class="scene-save" data-save="stl">For 3D printing (.stl)</a>
    <a class="scene-save" data-save="png">Transparent picture (.png)</a>
    <a class="scene-save" data-save="card">Asset card (.json)</a>
   </div>
   <p class="model-print" data-print></p>
   <div data-draft hidden><h2>World’s draft</h2><p data-draft-note></p><div class="scene-save-row"><a class="scene-save" data-save="package">Send to World’s draft</a></div></div>
   <p class="scene-export-status" role="status" aria-live="polite" data-status></p>
  </aside>
 </div>`;
 document.body.append(root);
 const $=s=>root.querySelector(s),canvas=$('.model-canvas'),status=$('[data-status]'),touch=touchFirst();
 $('[data-save-note]').textContent=touch?'Each file opens the share sheet: Save to Files keeps it in the Files app. Files are named by the asset’s id and version.':'Each file downloads at once, named by the asset’s id and version.';
 const say=text=>{status.textContent=text;};

 // ---- The view: World's lights, cel shading and ink, on the hero render's light ground, with a soft shadow.
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.setPixelRatio(Math.min(2,globalThis.devicePixelRatio||1));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();scene.background=new THREE.Color(HERO.background);
 const lights=addLights(scene,{turn:HERO.lightTurn,shadows:true,fit:{center:new THREE.Vector3(0,.5,0),radius:1}});
 const ground=new THREE.Mesh(new THREE.CircleGeometry(30,72),new THREE.ShadowMaterial({opacity:HERO.shadow,depthWrite:false}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.renderOrder=-1;scene.add(ground);
 const holder=new THREE.Group();holder.name='Model';scene.add(holder);
 const camera=new THREE.PerspectiveCamera(HERO.fov+6,4/3,.01,200),cel=createCelPass();
 let ink=null;try{ink=createInkPipeline(renderer,INK_OPTIONS);}catch(e){console.warn('Make model: drawing without ink',e);}
 const orbit={azimuth:HERO.azimuth,elevation:HERO.elevation,zoom:1};
 let model=null,resident=null,showResident=false,frame=0,shown=false,dirty=true;
 const request=()=>{dirty=true;if(shown&&!frame)frame=requestAnimationFrame(draw);};
 function draw(){
  frame=0;if(!shown||!dirty)return;dirty=false;resize();place();
  try{if(ink){ink.setCamera(camera);ink.render(r=>r.render(scene,camera));}else renderer.render(scene,camera);}
  catch(e){console.warn('Make model: ink failed, drawing plain',e);ink=null;renderer.render(scene,camera);}
 }
 function resize(){
  // its shape is the stylesheet's (4:3, square on a phone): the drawing follows it, never stretched
  const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight||Math.round(w*.75)),pr=renderer.getPixelRatio();
  if(canvas.width!==Math.round(w*pr)||canvas.height!==Math.round(h*pr))renderer.setSize(w,h,false);
  camera.aspect=w/h;camera.updateProjectionMatrix();
 }
 /** The camera round whatever is shown (the model, and the resident beside it), and the sun's shadow over it. */
 function place(){
  const box=new THREE.Box3();
  for(const o of [holder,showResident?resident?.root:null])if(o){o.updateMatrixWorld(true);o.traverse(m=>{if(m.isMesh&&m.visible)box.expandByObject(m);});}
  if(box.isEmpty())box.set(new THREE.Vector3(-.5,0,-.5),new THREE.Vector3(.5,1,.5));
  const centre=frameBox(camera,box,viewDirection(orbit.azimuth,orbit.elevation),.8);
  camera.position.sub(centre).multiplyScalar(orbit.zoom).add(centre);camera.lookAt(centre);
  const radius=box.getBoundingSphere(new THREE.Sphere()).radius,d=camera.position.distanceTo(centre);
  camera.near=Math.max(.005,d-radius*3);camera.far=d+radius*10;camera.updateProjectionMatrix();
  const sun=lights.sun,r=Math.max(.3,radius*1.4),from=new THREE.Vector3(-28,38,18).applyAxisAngle(new THREE.Vector3(0,1,0),HERO.lightTurn).normalize();
  sun.position.copy(centre).addScaledVector(from,r*3);sun.target.position.copy(centre);sun.target.updateMatrixWorld();
  Object.assign(sun.shadow.camera,{left:-r,right:r,top:r,bottom:-r,near:.05,far:r*8});sun.shadow.camera.updateProjectionMatrix();
 }
 const resizer=new ResizeObserver(request);resizer.observe(canvas);

 // Turning it with a finger: one drags round, two pinch, a double tap starts again.
 const pointers=new Map();let pinch=0,lastTap=0;
 canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){const [a,b]=[...pointers.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y);}
  const now=performance.now();if(pointers.size===1&&now-lastTap<320){resetView();}lastTap=now;});
 canvas.addEventListener('pointermove',e=>{const p=pointers.get(e.pointerId);if(!p)return;
  if(pointers.size===1){orbit.azimuth-=(e.clientX-p.x)*.009;orbit.elevation=Math.min(1.45,Math.max(-.15,orbit.elevation+(e.clientY-p.y)*.007));}
  p.x=e.clientX;p.y=e.clientY;
  if(pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch>0)orbit.zoom=Math.min(3,Math.max(.25,orbit.zoom*pinch/d));pinch=d;}
  request();});
 const up=e=>{pointers.delete(e.pointerId);pinch=0;};canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
 canvas.addEventListener('wheel',e=>{e.preventDefault();orbit.zoom=Math.min(3,Math.max(.25,orbit.zoom*Math.exp(e.deltaY*.001)));request();},{passive:false});
 function resetView(){Object.assign(orbit,{azimuth:HERO.azimuth,elevation:HERO.elevation,zoom:1});request();}

 function setModel(object){
  if(model){holder.remove(model);model.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of [o.material].flat())m.dispose();}if(o.isSprite)o.material.dispose();});}
  model=object;holder.add(model);cel.apply(model);
  model.traverse(o=>{if(o.isMesh){o.castShadow=!o.material.isMeshBasicMaterial&&!o.material.isShadowMaterial;o.receiveShadow=true;}});
  standResident();request();
 }
 /** Miss Higa beside it, for its size: a hanging thing hung as under Sakura's awning, its hang point 2.2 m up. */
 function standResident(){
  holder.position.set(0,0,0);
  if(!showResident||!model){if(resident)resident.root.visible=false;return;}
  if(!resident){resident=buildAvatar(recipeFor(RESIDENT),{shadows:true});poseSceneAvatar(resident,{pose:'Idle',expression:'smile',turn:0});cel.apply(resident.root);scene.add(resident.root);}
  resident.root.visible=true;
  const box=new THREE.Box3();model.traverse(o=>{if(o.isMesh)box.expandByObject(o);});
  const hang=model.userData.anchors?.hang;
  if(hang)holder.position.y=HANG_AT-hang[1];
  resident.root.position.set(box.min.x-.42,0,0);resident.root.updateMatrixWorld(true);
 }
 $('[data-action="resident"]').onclick=e=>{showResident=!showResident;e.currentTarget.setAttribute('aria-pressed',String(showResident));standResident();orbit.zoom=1;request();
  $('[data-hint]').textContent=showResident?`Beside ${RESIDENT}, as tall as World draws her${model?.userData.anchors?.hang?`; hung with its top ${HANG_AT} m up, as under Sakura’s awning`:''}.`:'Drag to turn it, pinch to come closer, double-tap to start again.';};
 $('[data-action="reset-view"]').onclick=resetView;

 // ---- The library: picture tiles grouped by kind, searchable.
 let items=[],current=null,rules=null,checkToken=0;
 const pictures=new Map();
 const groups=$('[data-groups]'),search=$('[data-search]');
 function renderLibrary(){
  const q=search.value.trim().toLowerCase(),match=i=>!q||[i.name,i.id,i.kind,KIND_WORDS[i.kind]||'',SOURCE_WORDS[i.source],...i.tags].join(' ').toLowerCase().includes(q);
  const byKind=new Map();for(const i of items.filter(match)){if(!byKind.has(i.kind))byKind.set(i.kind,[]);byKind.get(i.kind).push(i);}
  const order=Object.keys(KIND_WORDS);
  groups.innerHTML=[...byKind].sort((a,b)=>order.indexOf(a[0])-order.indexOf(b[0])).map(([kind,list])=>`<section class="model-group"><h2>${esc(KIND_WORDS[kind]||kind)} <span>${list.length}</span></h2><div class="model-tiles">${
   list.map(i=>`<button type="button" class="model-tile" data-key="${esc(i.key)}"><span class="model-tile-picture">${pictures.get(i.key)||i.picture?`<img alt="" src="${esc(pictures.get(i.key)||i.picture)}">`:''}</span><span class="model-tile-name">${esc(i.name)}</span><span class="model-tile-from">${esc(SOURCE_WORDS[i.source])}</span></button>`).join('')}</div></section>`).join('')||'<p>Nothing matches. Try another word.</p>';
 }
 search.addEventListener('input',renderLibrary);
 groups.addEventListener('click',e=>{const b=e.target.closest('.model-tile');if(b)open(items.find(i=>i.key===b.dataset.key));});

 // Pictures for the tiles of things that have none yet, drawn one at a time with one renderer.
 let stage=null,drawing=Promise.resolve();
 const onStage=task=>{const run=drawing.then(task);drawing=run.catch(()=>{});return run;};
 function drawPictures(){
  for(const i of items){if(i.picture||pictures.has(i.key))continue;
   onStage(async()=>{if(root.hidden&&!current)return;stage??=createHeroStage();
    const png=await renderHero(await i.build(),{size:320,stage});
    pictures.set(i.key,URL.createObjectURL(new Blob([png],{type:'image/png'})));
    const img=groups.querySelector(`[data-key="${CSS.escape(i.key)}"] .model-tile-picture`);if(img)img.innerHTML=`<img alt="" src="${pictures.get(i.key)}">`;
   }).catch(e=>console.warn('Make model: no picture for '+i.name,e));
  }
 }
 function refreshItems(){items=libraryItems();renderLibrary();drawPictures();}

 // ---- An asset opened: its card, its checks and its files.
 let card=null,params=null,lastChecks=[];
 const files={};
 const fileName=ext=>card?assetFileName(card,ext):'asset.'+ext;
 const prepared=(kind,{name,type,build,words})=>{
  const f=createReadyFile({name,type,build:()=>onStage(build),delay:400,onChange:()=>update()});
  const update=bindSaveLink($(`[data-save="${kind}"]`),f,{say,disabled:()=>!card||(kind==='package'&&!lastChecks.every(c=>c.ok)),words});
  files[kind]=f;return f;
 };
 const where=touch?' Choose Save to Files to keep it in the Files app.':'';
 prepared('glb',{name:()=>fileName('glb'),type:'model/gltf-binary',build:async()=>new Blob([await glbOf(currentItem(),card)],{type:'model/gltf-binary'}),words:{download:'3D model saved to your downloads.',shared:'3D model handed over.'+where}});
 let printWords='';
 prepared('stl',{name:()=>fileName('stl'),type:'model/stl',build:async()=>{const s=stlOf(await currentItem().build(),card.name);printWords=s.words;$('[data-print]').textContent='3D printing: '+s.words;return new Blob([s.bytes],{type:'model/stl'});},words:{download:'STL saved to your downloads.',shared:'STL handed over.'+where}});
 prepared('png',{name:()=>fileName('png'),type:'image/png',build:async()=>new Blob([await renderHero(await currentItem().build(),{size:1200,transparent:true,stage:stage??=createHeroStage()})],{type:'image/png'}),words:{download:'Picture saved to your downloads.',shared:'Picture handed over.'}});
 prepared('card',{name:()=>fileName('asset.json'),type:'application/json',build:async()=>new Blob([JSON.stringify(await resolved(),null,1)+'\n'],{type:'application/json'}),words:{download:'Asset card saved to your downloads.',shared:'Asset card handed over.'+where}});
 prepared('package',{name:()=>fileName('studio-asset.json'),type:'application/json',build:async()=>{
  if(!lastChecks.every(c=>c.ok))return null;
  const item=currentItem(),out=await resolved(),glb=await glbOf(item,card),hero=await renderHero(await item.build(),{size:1200,stage:stage??=createHeroStage()});
  return new Blob([JSON.stringify(handOff(out,glb,hero))],{type:'application/json'});},
  words:{download:'Saved to your downloads: give the file to Claude, who keeps it in World’s draft until you say "update World".',shared:'Handed over: give the file to Claude, who keeps it in World’s draft until you say "update World".'}});
 const currentItem=()=>current?.source==='made'||current?.source==='lathe'?{...current,build:async()=>buildMade(params,card)}:current;
 async function resolved(){
  const item=currentItem();if(item.source==='catalogue')return card;
  const built=await item.build(),r=await checkAsset(item,card,built),out=resolveCard(card,r.made,r.result,r.checks);disposeMade(r.made);return out;
 }
 function scheduleFiles(){for(const f of Object.values(files))f.schedule();}

 async function runChecks(){
  const token=++checkToken,item=currentItem(),built=item.source==='made'||item.source==='lathe'?buildMade(params,card):await item.build();
  const r=await checkAsset(item,card,built);disposeMade(r.made);if(token!==checkToken)return;
  lastChecks=r.checks;
  $('[data-checks]').innerHTML=r.checks.map(c=>`<li data-ok="${c.ok}"><b>${c.ok?'Pass':'Fail'}</b> <span><strong>${esc(c.label)}.</strong> ${esc(c.detail)}</span></li>`).join('');
  const draft=$('[data-draft]');draft.hidden=current.source==='catalogue';
  $('[data-draft-note]').textContent=r.ok?'Every check passes. Send it, and Claude keeps it in World’s draft; World changes only when you say "update World".':'Every check must pass before it can go to World’s draft.';
  for(const f of Object.values(files))f.schedule?.(f===files.package?600:400);
 }

 async function open(item){
  if(!item)return;rules??=await loadRules();
  current=item;params=item.params?structuredClone(item.params):null;lastChecks=[];printWords='';
  root.querySelector('[data-view="library"]').hidden=true;root.querySelector('[data-view="open"]').hidden=false;
  $('[data-checks]').innerHTML='<li>Checking…</li>';$('[data-print]').textContent='';say('');
  card=await item.card();
  canvas.setAttribute('aria-label',`${card.name}, in World’s look. Drag to turn it.`);
  if(item.source==='made'||item.source==='lathe'){openMaker();setModel(buildMade(params,card));}
  else{$('[data-maker]').hidden=true;setModel(await item.build());}
  showAbout();resetView();await runChecks();scheduleFiles();
  root.scrollIntoView?.({block:'start'});
 }
 function showAbout(){
  const about=$('[data-about]');
  if(current.source==='made'||current.source==='lathe'){about.innerHTML='';return;}
  const p=card.purpose||{};
  about.innerHTML=`<h2>${esc(card.name)}</h2><p class="model-from">${esc(current.from)} · ${esc(card.kind)} · version ${card.version}</p>
  <dl class="model-purpose"><dt>Who it is for</dt><dd>${esc(p.for||'')}</dd><dt>Why</dt><dd>${esc(p.why||'')}</dd><dt>Where</dt><dd>${esc(p.where||'')}</dd></dl>
  ${current.source==='registry'?'<p class="scene-save-note">World builds this in its own code; the files here are made from that code, so they always match what World shows.</p>':''}`;
 }
 function backToLibrary(){
  current=null;card=null;++checkToken;for(const f of Object.values(files))f.invalidate();
  root.querySelector('[data-view="open"]').hidden=true;root.querySelector('[data-view="library"]').hidden=false;refreshItems();
 }
 $('[data-action="library"]').onclick=backToLibrary;

 // ---- The Lathe maker.
 const maker=$('[data-maker]');
 let latheMeta=null;
 function newLathe(family='chochin',preset=null){
  const fam=LATHE_FAMILIES[family],pre=preset||fam.presets[0].id,p=latheParamsFor(family,pre),kind=latheKind(family,pre);
  latheMeta={family,preset:pre};
  const name=fam.presets.find(x=>x.id===pre).name.replace(/\s*\(.*\)$/,'');
  const item={key:'lathe:new',source:'lathe',id:slugify(name),name,kind,tags:[],version:1,params:p,from:'Made in Studio: '+fam.name,
   card:async()=>latheCard(p,{id:slugify(name),name,kind,purpose:{for:'',why:'',where:''},tags:[fam.name.split(' ')[0].toLowerCase()]},buildMade(p,{name}),rules)};
  return item;
 }
 $('[data-action="lathe"]').onclick=async()=>{rules??=await loadRules();await open(newLathe());};
 function versionFor(id){const live=catalogIds().includes(id)?catalogCard(id).version:0;return live+1;}

 function openMaker(){
  maker.hidden=false;const fam=()=>LATHE_FAMILIES[params.family];
  const range=(key,label)=>`<label class="model-range">${label} <output data-out="${key}"></output><input type="range" data-range="${key}"></label>`;
  const choice=(key,label,list)=>`<p class="scene-label">${label}</p><div class="scene-choice" role="group" aria-label="${label}" data-choice="${key}">${list.map(([v,t])=>`<button type="button" data-value="${v}" aria-pressed="false">${t}</button>`).join('')}</div>`;
  const swatches=(key,label)=>`<p class="scene-label">${label} <span data-colour-name="${key}"></span></p><div class="model-swatches" role="group" aria-label="${label}" data-swatch="${key}">${LATHE_PALETTE.map(c=>`<button type="button" data-value="${c.hex}" aria-pressed="false" aria-label="${esc(c.name)}" title="${esc(c.name)}: ${esc(c.from)}" style="background:${c.hex}"></button>`).join('')}</div>`;
  maker.innerHTML=`<h2>Lathe</h2><p>A profile spun round: drag its points, then shape it with the sliders.</p>
  ${choice('family','Shape',Object.entries(LATHE_FAMILIES).map(([k,f])=>[k,f.name]))}
  <p class="scene-label">Start from</p><div class="scene-choice" role="group" aria-label="Start from" data-presets></div>
  <p class="scene-label">Profile</p><canvas class="model-profile" data-profile role="img" aria-label="The profile: drag a point to change the shape"></canvas>
  ${range('height','Height')}${range('bottom','Bottom radius')}${range('middle','Middle radius')}${range('top','Top radius')}${range('bulge','Bulge')}
  ${range('ribs','Ribs')}${range('depth','Rib depth')}
  ${choice('wave','Rib shape',WAVES.map(w=>[w,w[0].toUpperCase()+w.slice(1)]))}
  ${choice('along','Ribs run',[['around','Round it'],['height','Up it']])}
  ${range('twist','Twist')}${range('wall','Wall')}
  ${choice('sides','Sides',[['0','Round'],['4','Four'],['6','Six'],['8','Eight']])}
  ${choice('bottomEnd','Bottom',[['closed','Closed'],['open','Open']])}${choice('topEnd','Top',[['closed','Closed'],['open','Open']])}
  ${range('trim','Rim height')}${range('flare','Rim stands out')}${range('bands','Hoops')}
  ${swatches('body','Body colour')}${swatches('trim','Rim colour')}
  <div data-glow-row>${range('glow','Glow')}</div>
  ${range('detail','Smoothness')}<p class="model-budget" data-budget></p>
  <h2>Its card</h2>
  <label>Name<input type="text" data-field="name" maxlength="60"></label><p class="model-id" data-id></p>
  <label>Who it is for<textarea data-field="for" rows="2" placeholder="The people who use it, by name where you can"></textarea></label>
  <label>Why they want it<textarea data-field="why" rows="2" placeholder="What it does for them"></textarea></label>
  <label>Where it belongs<textarea data-field="where" rows="2" placeholder="The place in World, and why there"></textarea></label>
  <label>Tags<input type="text" data-field="tags" placeholder="Words to find it by, with commas"></label>
  <label>What the player does<select data-field="action"><option value="look">Look at it</option><option value="use">Use it</option><option value="buy">Buy it</option><option value="none">Nothing (decoration)</option></select></label>
  <div class="scene-save-row"><button type="button" data-action="save-design">Save in this browser</button></div>`;
  const R={
   height:{min:2,max:150,step:1,unit:'cm',get:()=>cm(params.height),set:v=>{params.height=v/100;}},
   bottom:{min:.3,max:60,step:.1,unit:'cm',get:()=>cm(params.profile[0][1]),set:v=>{params.profile[0][1]=v/100;}},
   middle:{min:.3,max:60,step:.1,unit:'cm',get:()=>cm(Math.max(...params.profile.slice(1,-1).map(p=>p[1]))),set:v=>{const inner=params.profile.slice(1,-1),now=Math.max(...inner.map(p=>p[1]));for(const p of inner)p[1]*=v/100/now;}},
   top:{min:.3,max:60,step:.1,unit:'cm',get:()=>cm(params.profile.at(-1)[1]),set:v=>{params.profile.at(-1)[1]=v/100;}},
   bulge:{min:-10,max:10,step:.1,unit:'cm',get:()=>cm(params.bulge),set:v=>{params.bulge=v/100;}},
   ribs:{min:0,max:48,step:1,unit:'',get:()=>params.ribs.count,set:v=>{params.ribs.count=v;}},
   depth:{min:0,max:30,step:1,unit:'%',get:()=>Math.round(params.ribs.depth*100),set:v=>{params.ribs.depth=v/100;}},
   twist:{min:-180,max:180,step:5,unit:'°',get:()=>params.twist,set:v=>{params.twist=v;}},
   wall:{min:0,max:30,step:.5,unit:'mm',get:()=>Math.round(params.wall*2000)/2,set:v=>{params.wall=v/1000;},say:v=>v?`${v} mm`:'none: a sheet, like paper'},
   trim:{min:0,max:80,step:1,unit:'mm',get:()=>Math.round(params.trim.height*1000),set:v=>{params.trim.height=v/1000;if(v&&params.trim.ends==='none')params.trim.ends='both';}},
   flare:{min:0,max:40,step:1,unit:'mm',get:()=>Math.round(params.trim.flare*1000),set:v=>{params.trim.flare=v/1000;}},
   bands:{min:0,max:6,step:1,unit:'',get:()=>params.bands.count,set:v=>{params.bands.count=v;}},
   glow:{min:0,max:100,step:5,unit:'%',get:()=>Math.round(params.glow*100),set:v=>{params.glow=v/100;},say:v=>v?`${v}%: lit`:'off'},
   detail:{min:1,max:DETAIL_LEVELS,step:1,unit:'',get:()=>params.detail,set:v=>{params.detail=v;}},
  };
  for(const [key,r] of Object.entries(R)){const input=maker.querySelector(`[data-range="${key}"]`);Object.assign(input,{min:r.min,max:r.max,step:r.step});
   input.addEventListener('input',()=>{r.set(Number(input.value));changed({rangeKey:key});});}
  maker.onclick=e=>{
   const b=e.target.closest('button');if(!b)return;
   const group=b.closest('[data-choice]'),sw=b.closest('[data-swatch]');
   if(b.dataset.preset){const kind=latheKind(params.family,b.dataset.preset);params=latheParamsFor(params.family,b.dataset.preset);latheMeta.preset=b.dataset.preset;card.kind=kind;changed({rebuildForm:true});return;}
   if(sw){params.colours[sw.dataset.swatch]=b.dataset.value;changed();return;}
   if(b.dataset.action==='save-design'){saveDesign();return;}
   if(!group)return;const v=b.dataset.value;
   switch(group.dataset.choice){
    case 'family':{latheMeta={family:v,preset:LATHE_FAMILIES[v].presets[0].id};params=latheParamsFor(v,latheMeta.preset);card.kind=latheKind(v,latheMeta.preset);changed({rebuildForm:true});return;}
    case 'wave':params.ribs.wave=v;if(!params.ribs.count)params.ribs.count=12;if(v!=='facet'&&!params.ribs.depth)params.ribs.depth=.06;break;
    case 'along':params.ribs.along=v;if(!params.ribs.count)params.ribs.count=12;if(!params.ribs.depth)params.ribs.depth=.05;break;
    case 'sides':params.sides=Number(v);break;
    case 'bottomEnd':params.bottom=v;break;
    case 'topEnd':params.top=v;break;
   }
   changed();
  };
  const field=k=>maker.querySelector(`[data-field="${k}"]`);
  for(const k of ['name','for','why','where','tags','action'])field(k).addEventListener('input',()=>{cardFromForm();changed({cardOnly:true});});
  profileEditor(maker.querySelector('[data-profile]'));
  syncForm(true);
  function syncForm(withCard){
   params=normalizeLathe(params);
   maker.querySelector('[data-presets]').innerHTML=fam().presets.map(p=>`<button type="button" data-preset="${p.id}" aria-pressed="${latheMeta?.preset===p.id}">${esc(p.name)}</button>`).join('');
   for(const [key,r] of Object.entries(R)){const input=maker.querySelector(`[data-range="${key}"]`),v=r.get();input.value=String(v);maker.querySelector(`[data-out="${key}"]`).textContent=r.say?r.say(v):`${v}${r.unit?(r.unit==='°'||r.unit==='%'?'':' ')+r.unit:''}`;}
   maker.querySelector('[data-range="middle"]').closest('label').hidden=params.profile.length<3;
   const pressed={family:params.family,wave:params.ribs.wave,along:params.ribs.along,sides:String(params.sides),bottomEnd:params.bottom,topEnd:params.top};
   for(const g of maker.querySelectorAll('[data-choice]'))for(const b of g.querySelectorAll('button'))b.setAttribute('aria-pressed',String(pressed[g.dataset.choice]===b.dataset.value));
   for(const g of maker.querySelectorAll('[data-swatch]')){const v=params.colours[g.dataset.swatch];for(const b of g.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.value===v));
    maker.querySelector(`[data-colour-name="${g.dataset.swatch}"]`).textContent=LATHE_PALETTE.find(c=>c.hex===v)?.name||v;}
   maker.querySelector('[data-glow-row]').hidden=!fam().lamp;
   if(withCard){field('name').value=card.name;field('for').value=card.purpose.for;field('why').value=card.purpose.why;field('where').value=card.purpose.where;field('tags').value=(card.tags||[]).join(', ');field('action').value=card.action?.kind||'look';}
   maker.querySelector('[data-id]').textContent=`Id ${card.id}, version ${card.version}: the files are named ${assetFileName(card,'glb')} and so on.`;
  }
  function cardFromForm(){
   const name=field('name').value.trim()||LATHE_FAMILIES[params.family].name,kind=card.kind,id=slugify(name),act=field('action').value;
   card={...card,id,name,version:versionFor(id),purpose:{for:field('for').value.trim(),why:field('why').value.trim(),where:field('where').value.trim()},
    tags:field('tags').value.split(',').map(t=>t.trim()).filter(Boolean),action:act==='none'?{kind:'none',label:''}:{kind:act,label:{look:'Look at the ',use:'Use the ',buy:'Buy the '}[act]+name.toLowerCase()},kind};
  }
  let rebuildTimer=0;
  function changed({rebuildForm=false,cardOnly=false,rangeKey=null}={}){
   params=normalizeLathe(params);
   // the phone budget holds the smoothness down
   const budget=rules.kinds[card.kind]?.triangles||3000,capped=capDetail(params,budget);
   const asked=params.detail;params.detail=capped.detail;
   maker.querySelector('[data-budget]').textContent=`${fmt(capped.triangles)} of the ${fmt(budget)} triangles a ${card.kind} may have on a phone.`+(capped.capped||asked>capped.detail?` Smoothness stays at ${capped.detail}: finer would pass the phone budget.`:'');
   if(rebuildForm)syncForm(false);else if(!cardOnly){for(const [key,r] of Object.entries(R))if(key!==rangeKey){const input=maker.querySelector(`[data-range="${key}"]`);input.value=String(r.get());}
    for(const [key,r] of Object.entries(R)){const v=r.get();maker.querySelector(`[data-out="${key}"]`).textContent=r.say?r.say(v):`${v}${r.unit?(r.unit==='°'||r.unit==='%'?'':' ')+r.unit:''}`;}
    syncForm(false);}
   const built=buildMade(params,card);
   // the card's size and anchors follow the shape (the name and words are the creator's)
   const fresh=latheCard(params,{...card,purpose:card.purpose,tags:card.tags},built,rules);card={...fresh,id:card.id,name:card.name,version:card.version,action:card.action};
   if(!cardOnly){setModel(built);drawProfile();}else built.traverse(o=>{if(o.isMesh)o.geometry.dispose();});
   maker.querySelector('[data-id]').textContent=`Id ${card.id}, version ${card.version}: the files are named ${assetFileName(card,'glb')} and so on.`;
   clearTimeout(rebuildTimer);rebuildTimer=setTimeout(()=>{runChecks().catch(e=>console.warn(e));},250);
   for(const f of Object.values(files))f.invalidate();
  }
  // the first look: its size and budget
  changed({rebuildForm:true});
 }
 function saveDesign(){
  if(!card||!params)return;
  const made=readMade();made[card.id]={card:{...card,maker:normalizeLathe(params)},params:normalizeLathe(params),saved:new Date().toISOString()};
  say(writeMade(made)?`Saved in this browser: ${card.name} is in the library under ${KIND_WORDS[card.kind]||card.kind}, Made in Studio. Its asset card (.json) is the design too: open it again from the library.`:'This browser cannot keep it (storage is off): save its asset card (.json) to keep the design.');
 }

 // The profile, drawn from the side: the shape's outline mirrored round its axis, its points to drag (on the right).
 let drawProfile=()=>{};
 function profileEditor(c){
  const g=c.getContext('2d');let drag=-1;
  const geom=()=>{const w=c.clientWidth||300,h=Math.round(Math.min(260,w*.8)),pr=Math.min(2,devicePixelRatio||1);
   if(c.width!==Math.round(w*pr)||c.height!==Math.round(h*pr)){c.width=Math.round(w*pr);c.height=Math.round(h*pr);c.style.height=h+'px';}
   const rmax=Math.max(...params.profile.map(p=>p[1]))+Math.abs(params.bulge)+.01,m=22,s=Math.min((w-2*m)/(2*rmax*1.25),(h-2*m)/params.height);
   return {w,h,pr,s,cx:w/2,base:h-m};};
  drawProfile=()=>{
   const {w,h,pr,s,cx,base}=geom(),curve=profileCurve(params.profile),H=params.height;g.setTransform(pr,0,0,pr,0,0);g.clearRect(0,0,w,h);
   g.fillStyle='#f7f3ea';g.fillRect(0,0,w,h);g.strokeStyle='#d9d3c4';g.lineWidth=1;g.beginPath();g.moveTo(cx,8);g.lineTo(cx,h-8);g.moveTo(8,base);g.lineTo(w-8,base);g.stroke();
   const pts=[];for(let i=0;i<=60;i++){const v=i/60;pts.push([curve(v)+params.bulge*Math.sin(Math.PI*v),v*H]);}
   g.fillStyle=params.colours.body;g.strokeStyle='#2b2a33';g.lineWidth=2;g.beginPath();
   pts.forEach(([r,y],i)=>{const X=cx+r*s,Y=base-y*s;i?g.lineTo(X,Y):g.moveTo(X,Y);});
   [...pts].reverse().forEach(([r,y])=>g.lineTo(cx-r*s,base-y*s));g.closePath();g.globalAlpha=.55;g.fill();g.globalAlpha=1;g.stroke();
   g.fillStyle='#2b2a33';g.font='12px system-ui,sans-serif';g.fillText(`${cm(H)} cm`,8,16);
   for(const [i,[v,r]] of params.profile.entries()){const X=cx+r*s,Y=base-v*H*s;g.beginPath();g.arc(X,Y,i===drag?11:9,0,Math.PI*2);g.fillStyle=i===drag?'#06c755':'#fff';g.fill();g.lineWidth=2.5;g.strokeStyle='#06c755';g.stroke();}
  };
  const at=e=>{const r=c.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
  c.addEventListener('pointerdown',e=>{const [x,y]=at(e),{s,cx,base}=geom(),H=params.height;let best=-1,bd=30;
   params.profile.forEach(([v,r],i)=>{const d=Math.hypot(cx+r*s-x,base-v*H*s-y);if(d<bd){bd=d;best=i;}});
   if(best>=0){drag=best;c.setPointerCapture?.(e.pointerId);e.preventDefault();drawProfile();}});
  c.addEventListener('pointermove',e=>{if(drag<0)return;const [x,y]=at(e),{s,cx,base}=geom(),H=params.height,P=params.profile,n=P.length;
   P[drag][1]=Math.min(1.5,Math.max(.003,(x-cx)/s));
   if(drag>0&&drag<n-1)P[drag][0]=Math.min(P[drag+1][0]-.02,Math.max(P[drag-1][0]+.02,(base-y)/s/H));
   changedFromProfile();});
  const end=()=>{if(drag<0)return;drag=-1;drawProfile();};c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);
  let pending=0;const changedFromProfile=()=>{if(pending)return;pending=requestAnimationFrame(()=>{pending=0;maker.querySelector('[data-range="detail"]')?.dispatchEvent(new Event('input'));});};
  new ResizeObserver(()=>drawProfile()).observe(c);
 }

 // ---- Opening a design file (an asset card with its maker's parameters, or a hand-off package).
 const fileInput=$('[data-file]');
 $('[data-action="open-file"]').onclick=()=>fileInput.click();
 fileInput.onchange=async()=>{
  const out=$('[data-library-status]');
  try{const f=fileInput.files[0];if(!f)return;if(f.size>20e6)throw Error('size');let data=JSON.parse(await f.text());if(data.format==='johansson-studio-asset')data=data.card;
   if(!data?.maker||data.maker.maker!=='lathe')throw Error('maker');
   rules??=await loadRules();const m={card:data,params:normalizeLathe(data.maker)};await open({...madeItem(data.id,m),source:'made'});out.textContent='';}
  catch{out.textContent='That file is not a design Studio can open: choose an asset card (.json) made with the Lathe maker.';}
  finally{fileInput.value='';}
 };

 return {root,
  show(){root.hidden=false;shown=true;if(!items.length)refreshItems();request();document.getElementById('loading')?.remove();},
  hide(){root.hidden=true;shown=false;cancelAnimationFrame(frame);frame=0;},
  dispose(){this.hide();resizer.disconnect();ink?.dispose();renderer.dispose();stage?.dispose();for(const u of pictures.values())URL.revokeObjectURL(u);for(const f of Object.values(files))f.dispose();root.remove();},
  /** For tests and the agent: what is open, its checks and which files are ready. */
  get state(){return {open:current?.key||null,id:card?.id||null,version:card?.version||null,checks:lastChecks.map(c=>({id:c.id,ok:c.ok,detail:c.detail})),
   params:params?structuredClone(params):null,ready:Object.fromEntries(Object.entries(files).map(([k,f])=>[k,f.ready])),print:printWords,items:items.length};},
  open:key=>open(items.find(i=>i.key===key)),newLathe:async(family,preset)=>{rules??=await loadRules();return open(newLathe(family,preset));},
 };
}
