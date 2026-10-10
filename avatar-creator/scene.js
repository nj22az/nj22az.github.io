import * as THREE from '../johansson-town/vendor/three.module.js';
import {buildAvatar} from '../johansson-town/src/avatars/build.js';
import {poseSceneAvatar} from './scene-avatar.js';
import {CAST_RECIPES,ORIGINAL_THUAN_RECIPE} from '../johansson-town/src/avatars/cast.js';
import {normalizeRecipe} from '../johansson-town/src/avatars/recipe.js';
import {drawCaptions,comicLayout,FORMATS} from '../johansson-town/src/photo/layout.js';
import {SCENE_KEY,MAX_ACTORS,MAX_PANELS,LOCATIONS,POSES,EXPRESSIONS,emptyScene,normalizeScene,addCharacter,moveCharacter,panelOrder,text} from './scene-model.mjs';

const friendly={Idle:'Standing',Kachashi:'Dance',Tada:'Ta-da',HandsOnHips:'Hands on hips',HeelKick:'Heel kick',CheekRest:'Hand on cheek',DoubleCheek:'Both cheeks'};
const nameOf=n=>n==='Thuan'?'Thuận':n;
const download=(url,name)=>{const a=document.createElement('a');a.href=url;a.download=name;a.click();};
const loadImage=url=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('The image could not be loaded.'));img.src=url;});

/** Independent scene compositor: existing town captures and the shared live avatar models. */
export function createSceneWorkspace({getCharacter,onEdit,onMode}){
 let state=emptyScene();try{state=normalizeScene(JSON.parse(localStorage.getItem(SCENE_KEY)),normalizeRecipe);}catch{}
 let selected=state.actors[0]?.id,step='location',mode='scene',generation=0,pending=Promise.resolve(),valid=false,renderer;
 const panels=[],sprites=new Map(),images=new Map();let drag=null,capturing=false;
 const root=document.createElement('main');root.className='scene-workspace';root.hidden=true;
 root.innerHTML=`<div class="scene-heading"><div><h1>Build a scene</h1><p>Choose a place, add characters, then pose them and write your dialogue.</p></div><button type="button" data-action="download-project">Download project</button><button type="button" data-action="open-project">Open project</button><input type="file" data-project-input accept=".json,application/json" hidden></div>
 <nav class="scene-steps" aria-label="Scene building steps">
 <button type="button" data-step="location">1. Choose location</button><button type="button" data-step="characters">2. Add characters</button><button type="button" data-step="pose">3. Pose & position</button><button type="button" data-step="text">4. Add text</button><button type="button" data-step="export">5. Export</button></nav>
 <div class="scene-layout"><section class="scene-picture" aria-label="Scene preview"><div class="scene-frame"><canvas width="1200" height="900" tabindex="0" aria-label="Scene. Drag a character to move it; arrow keys move the selected character."></canvas><div class="scene-selection" hidden></div></div><p class="scene-hint">Drag a character to move it. Select a character below to change its pose.</p><p class="scene-status" role="status" aria-live="polite"></p></section>
 <aside class="scene-controls" aria-label="Scene controls">
 <section data-pane="location"><h2>Choose a location</h2><p>These backdrops are captured from Johansson World. Each has a fixed camera view.</p><div class="scene-locations"></div></section>
 <section data-pane="characters" hidden><h2>Add characters</h2><p>Use your own character or choose a town resident. Up to six characters can share a scene.</p><button class="scene-primary" data-action="add-current">Add my character</button><label>Town resident<select data-field="resident"></select></label><button data-action="add-resident">Add resident</button><div class="scene-cast"></div></section>
 <section data-pane="pose" hidden><h2>Pose & position</h2><div class="scene-cast"></div><div class="scene-actor-controls">
 <label>Pose<select data-field="pose"></select></label><label>Expression<select data-field="expression"></select></label>
 <label>Turn<input data-field="turn" type="range" min="-180" max="180" step="5"></label><label>Size<input data-field="size" type="range" min=".18" max=".75" step=".01"></label>
 <label>Left / right<input data-field="x" type="range" min=".08" max=".92" step=".01"></label><label>Up / down<input data-field="y" type="range" min=".35" max=".96" step=".01"></label>
 <button data-action="edit-character">Edit appearance</button><button data-action="duplicate">Duplicate character</button><button data-action="remove">Remove character</button></div></section>
 <section data-pane="text" hidden><h2>Add text</h2><label>Picture style<select data-field="style"><option value="photo">Photograph with speech bubbles</option><option value="meme">Meme with top and bottom text</option><option value="comic">Comic panel with caption</option></select></label>
 <div class="scene-cast"></div><label>Selected character’s speech<input data-field="speech" maxlength="120" placeholder="What are they saying?"></label>
 <label>Top text (meme)<input data-field="top" maxlength="120" placeholder="WHEN THE FERRY IS LATE"></label><label>Bottom text / caption<input data-field="bottom" maxlength="120" placeholder="Write your punchline…"></label></section>
 <section data-pane="export" hidden><h2>Export your picture</h2><label>Picture format<select data-field="format"><option value="landscape">Landscape</option><option value="square">Square</option><option value="portrait">Portrait</option></select></label>
 <button class="scene-primary" data-action="export">Export scene PNG</button><button data-action="capture">Add panel to comic</button><button data-action="comic">Open comic</button><p>Your scene is saved in this browser. Download a project to keep an editable copy, including captured panels.</p></section>
 <div class="scene-next"><button data-action="previous">Previous step</button><button class="scene-primary" data-action="next">Next: Add characters</button></div>
 </aside></div>
 <section class="scene-comic" hidden><h2>Your comic · <span data-panel-count>0</span> / 4 panels</h2><p>Compose a scene, then select Add panel to comic. Change the location, poses or dialogue for the next panel.</p><div class="scene-panels"></div><label>Comic layout<select data-field="layout"><option value="grid">Comic page</option><option value="strip">Horizontal strip</option></select></label><button class="scene-primary" data-action="capture">Add current scene as panel</button><button data-action="compose">Compose next panel</button><button class="scene-primary" data-action="export-comic">Export comic PNG</button><p>Captured panels stay available while this page is open. Download a project to save them.</p></section>`;
 document.body.append(root);
 const $=s=>root.querySelector(s),field=n=>$(`[data-field="${n}"]`),canvas=$('canvas'),ctx=canvas.getContext('2d'),status=$('.scene-status'),selection=$('.scene-selection');
 const announce=s=>{status.textContent=s;};
 const current=()=>state.actors.find(a=>a.id===selected);
 const keys=['location','characters','pose','text','export'];
 const resident=field('resident');resident.append(...Object.keys(CAST_RECIPES).map(n=>new Option(nameOf(n),n)));
 field('pose').append(...POSES.map(n=>new Option(friendly[n]||n,n)));field('expression').append(...EXPRESSIONS.map(n=>new Option(n[0].toUpperCase()+n.slice(1),n)));
 for(const [id,name] of LOCATIONS){const b=document.createElement('button');b.type='button';b.dataset.location=id;b.setAttribute('aria-label',name);const img=document.createElement('img');img.src=`../johansson-town/assets/images/feed/${id}.webp`;img.alt='';img.loading='lazy';const label=document.createElement('span');label.textContent=name;b.append(img,label);b.onclick=()=>{state.location=id;changed();sync();announce(name+' selected. Continue to Add characters.');};$('.scene-locations').append(b);}
 function save(){try{localStorage.setItem(SCENE_KEY,JSON.stringify(state));}catch{announce('Browser storage is unavailable. Download a project to keep your scene.');}}
 function changed(){save();pending=draw();syncSelection();}
 function setStep(value){step=value;for(const pane of root.querySelectorAll('[data-pane]'))pane.hidden=pane.dataset.pane!==step;for(const b of root.querySelectorAll('[data-step]')){b.setAttribute('aria-current',b.dataset.step===step?'step':'false');b.onclick=()=>setStep(b.dataset.step);}const i=keys.indexOf(step);$('[data-action="previous"]').disabled=i===0;$('[data-action="next"]').hidden=i===keys.length-1;$('[data-action="next"]').textContent='Next: '+({characters:'Add characters',pose:'Pose & position',text:'Add text',export:'Export'}[keys[i+1]]||'');sync();}
 function sync(){
  const a=current();for(const n of ['pose','expression','turn','size','x','y','speech']){field(n).disabled=!a;field(n).value=a?.[n]??'';}
  for(const n of ['style','top','bottom','format'])field(n).value=state[n];
  for(const b of root.querySelectorAll('[data-location]'))b.setAttribute('aria-pressed',String(b.dataset.location===state.location));
  for(const list of root.querySelectorAll('.scene-cast')){list.replaceChildren();if(!state.actors.length){const p=document.createElement('p');p.textContent='No characters yet. Use Add characters to begin.';list.append(p);}state.actors.forEach((actor,i)=>{const b=document.createElement('button');b.textContent=(i+1)+'. '+actor.name;b.setAttribute('aria-pressed',String(actor.id===selected));b.onclick=()=>{selected=actor.id;sync();};list.append(b);});}
  for(const b of root.querySelectorAll('[data-action="add-current"],[data-action="add-resident"],[data-action="duplicate"]'))b.disabled=state.actors.length>=MAX_ACTORS||(b.dataset.action==='duplicate'&&!a);
  for(const b of root.querySelectorAll('[data-action="remove"],[data-action="edit-character"]'))b.disabled=!a;
  for(const b of root.querySelectorAll('[data-action="capture"]'))b.disabled=panels.length>=MAX_PANELS;
  $('[data-action="export-comic"]').disabled=!panels.length;syncSelection();
 }
 function syncSelection(){const a=current();selection.hidden=!a||mode==='comic';if(a){const half=a.size/(FORMATS[state.format]*3);selection.style.left=(a.x-half)*100+'%';selection.style.top=(a.y-a.size)*100+'%';selection.style.width=half*2*100+'%';selection.style.height=a.size*100+'%';}}
 for(const n of ['pose','expression','turn','size','x','y','speech'])field(n).addEventListener('input',()=>{const a=current();if(!a)return;a[n]=['turn','size','x','y'].includes(n)?Number(field(n).value):text(field(n).value);changed();});
 for(const n of ['style','top','bottom','format'])field(n).addEventListener('input',()=>{state[n]=text(field(n).value);changed();});
 async function backdrop(id){if(!images.has(id)){images.set(id,loadImage(`../johansson-town/assets/images/feed/${id}.webp`).catch(e=>{images.delete(id);throw e;}));}return images.get(id);}
 async function sprite(a){
  const key=JSON.stringify([a.recipe,a.pose,a.expression,a.turn]);if(sprites.has(key)){const value=sprites.get(key);sprites.delete(key);sprites.set(key,value);return value;}
  renderer??=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.setSize(512,768,false);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0,0);
  const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0xc8a878,2.2));const light=new THREE.DirectionalLight(0xfff4e0,1.9);light.position.set(2,4,5);scene.add(light);
  const avatar=buildAvatar(a.recipe,{shadows:false,faceSize:256});scene.add(avatar.root);
  try{const camera=poseSceneAvatar(avatar,a);renderer.render(scene,camera);
   const out=document.createElement('canvas');out.width=512;out.height=768;out.getContext('2d').drawImage(renderer.domElement,0,0);sprites.set(key,out);
   while(sprites.size>18){const first=sprites.keys().next().value;const old=sprites.get(first);old.width=0;sprites.delete(first);}return out;
  }finally{avatar.body?.skeleton?.dispose();avatar.dispose();renderer.renderLists.dispose();}
 }
 async function draw(){
  const token=++generation;valid=false;canvas.setAttribute('aria-busy','true');const snapshot=structuredClone(state),w=1200,h=Math.round(w/FORMATS[snapshot.format]);
  try{const image=await backdrop(snapshot.location);const out=document.createElement('canvas');out.width=w;out.height=h;const c=out.getContext('2d');const scale=Math.max(w/image.width,h/image.height);c.drawImage(image,(w-image.width*scale)/2,(h-image.height*scale)/2,image.width*scale,image.height*scale);
   const bubbles=[];
   // Higher feet are farther away; nearer characters paint last.
   for(const a of [...snapshot.actors].sort((a,b)=>a.y-b.y)){const img=await sprite(a),height=a.size*h,width=height*2/3;c.drawImage(img,a.x*w-width/2,a.y*h-height,width,height);bubbles.push({text:a.speech,x:a.x,y:a.y-a.size*.85,visible:true});}
   const overlay=document.createElement('canvas');overlay.width=w;overlay.height=h;drawCaptions(overlay.getContext('2d'),w,h,{style:snapshot.style,top:snapshot.top,bottom:snapshot.bottom,bubbles});c.drawImage(overlay,0,0);
   if(token!==generation)return;canvas.width=w;canvas.height=h;ctx.drawImage(out,0,0);valid=true;canvas.setAttribute('aria-busy','false');syncSelection();
  }catch(e){if(token===generation){canvas.setAttribute('aria-busy','false');announce('Scene could not be rendered. Please select the location again to retry.');}console.error('Johansson Studio scene render',e);}
 }
 function point(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};}
 canvas.addEventListener('pointerdown',e=>{const p=point(e),a=[...state.actors].sort((a,b)=>b.y-a.y).find(a=>Math.abs(p.x-a.x)<a.size/(FORMATS[state.format]*3)&&p.y>a.y-a.size&&p.y<a.y);if(!a)return;selected=a.id;drag={id:a.id,dx:p.x-a.x,dy:p.y-a.y};canvas.setPointerCapture(e.pointerId);sync();});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;const a=state.actors.find(a=>a.id===drag.id),p=point(e);moveCharacter(a,p.x-drag.dx,p.y-drag.dy);syncSelection();pending=draw();});
 const endDrag=()=>{if(drag){drag=null;save();sync();}};canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
 canvas.addEventListener('keydown',e=>{const a=current(),directions={ArrowLeft:[-.01,0],ArrowRight:[.01,0],ArrowUp:[0,-.01],ArrowDown:[0,.01]};if(a&&directions[e.key]){e.preventDefault();const [x,y]=directions[e.key];moveCharacter(a,a.x+x,a.y+y);changed();sync();}});
 function add(recipe,name){const a=addCharacter(state,normalizeRecipe(recipe),name);if(!a){announce('The scene already has six characters.');return;}selected=a.id;changed();sync();announce(a.name+' added. Select Pose & position to arrange them.');}
 async function ready(){await pending;if(!valid){announce('Wait for the scene to finish loading, then try again.');return false;}return true;}
 async function exportPNG(){if(!await ready())return;download(canvas.toDataURL('image/png'),'johansson-studio-scene.png');announce('Scene PNG exported.');}
 async function capture(){if(capturing)return;capturing=true;try{if(panels.length>=MAX_PANELS){announce('Your comic already has four panels. Remove a panel to replace it.');return;}if(!await ready())return;const url=canvas.toDataURL('image/png');panels.push({url,image:await loadImage(url)});renderPanels();announce('Panel '+panels.length+' added. Open Comic to review it, or compose the next scene.');}finally{capturing=false;}}
 function renderPanels(){const list=$('.scene-panels');list.replaceChildren();$('[data-panel-count]').textContent=panels.length;panels.forEach((p,i)=>{const figure=document.createElement('figure'),img=document.createElement('img');img.src=p.url;img.alt='Comic panel '+(i+1);figure.append(img);const row=document.createElement('div');for(const [label,action] of [['Move earlier',()=>{panelOrder(panels,i,-1);renderPanels();}],['Move later',()=>{panelOrder(panels,i,1);renderPanels();}],['Remove',()=>{panels.splice(i,1);renderPanels();}],['Save PNG',()=>download(p.url,'johansson-studio-panel-'+(i+1)+'.png')]]){const b=document.createElement('button');b.textContent=label;b.onclick=action;b.disabled=(label==='Move earlier'&&i===0)||(label==='Move later'&&i===panels.length-1);row.append(b);}figure.append(row);list.append(figure);});sync();}
 async function exportComic(){if(!panels.length)return;const layout=comicLayout(panels.length,field('layout').value),out=document.createElement('canvas');out.width=layout.width;out.height=layout.height;const c=out.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,out.width,out.height);panels.forEach((p,i)=>{const r=layout.cells[i],s=Math.min(r.w/p.image.width,r.h/p.image.height),w=p.image.width*s,h=p.image.height*s;c.drawImage(p.image,r.x+(r.w-w)/2,r.y+(r.h-h)/2,w,h);c.strokeStyle='#243442';c.lineWidth=2;c.strokeRect(r.x,r.y,r.w,r.h);});download(out.toDataURL('image/png'),'johansson-studio-comic.png');announce('Comic PNG exported.');}
 function downloadProject(){const url=URL.createObjectURL(new Blob([JSON.stringify({format:'johansson-studio-project',version:1,scene:state,panels:panels.map(p=>p.url)})],{type:'application/json'}));download(url,'johansson-studio-project.json');setTimeout(()=>URL.revokeObjectURL(url),10000);announce('Editable project downloaded, including comic panels.');}
 const projectInput=$('[data-project-input]');projectInput.onchange=async()=>{try{const file=projectInput.files[0];if(!file)return;if(file.size>34000000)throw Error('Project too large');const project=JSON.parse(await file.text());if(project.format!=='johansson-studio-project'||project.version!==1||project.scene?.version!==1)throw Error('Invalid project');const scene=normalizeScene(project.scene,normalizeRecipe),urls=(Array.isArray(project.panels)?project.panels:[]).slice(0,MAX_PANELS);if(urls.some(url=>typeof url!=='string'||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(url)||url.length>8000000))throw Error('Invalid panel');const loaded=await Promise.all(urls.map(async url=>({url,image:await loadImage(url)})));state=scene;selected=state.actors[0]?.id;panels.splice(0,panels.length,...loaded);changed();renderPanels();sync();announce('Project opened.');}catch{announce('Unable to open this project. Choose a Johansson Studio project JSON file.');}finally{projectInput.value='';}};
 const actions={
  'add-current':()=>add(getCharacter()),'add-resident':()=>{const n=resident.value;add(n==='Thuan'?ORIGINAL_THUAN_RECIPE:CAST_RECIPES[n],nameOf(n));},
  'edit-character':()=>{const a=current();if(a)onEdit(a.recipe,a.id);},'duplicate':()=>{const a=current();if(a)add(a.recipe,a.name);},
  'remove':()=>{state.actors=state.actors.filter(a=>a.id!==selected);selected=state.actors[0]?.id;changed();sync();},
  'previous':()=>setStep(keys[Math.max(0,keys.indexOf(step)-1)]),'next':()=>setStep(keys[Math.min(4,keys.indexOf(step)+1)]),
  'export':exportPNG,'capture':capture,'comic':()=>onMode('comic'),'compose':()=>{onMode('scene');setStep('location');},
  'export-comic':exportComic,'download-project':downloadProject,'open-project':()=>projectInput.click()
 };
 for(const b of root.querySelectorAll('[data-action]'))b.onclick=()=>{Promise.resolve(actions[b.dataset.action]()).catch(e=>{console.error(e);announce('The action could not be completed. Your scene is still available.');});};
 setStep('location');renderPanels();
 return {root,show(value){mode=value;root.dataset.mode=value;root.hidden=false;$('.scene-comic').hidden=value!=='comic';$('.scene-steps').hidden=value==='comic';$('.scene-controls').hidden=value==='comic';$('.scene-heading h1').textContent=value==='comic'?'Make a comic':'Build a scene';pending=draw();sync();},hide(){root.hidden=true;},useCharacter(recipe,id){const a=state.actors.find(a=>a.id===id);if(a){a.recipe=normalizeRecipe(recipe);a.name=text(recipe.name)||a.name;selected=a.id;changed();sync();}else add(recipe);setStep('pose');},dispose(){generation++;renderer?.dispose();renderer?.forceContextLoss();root.remove();}};
}
