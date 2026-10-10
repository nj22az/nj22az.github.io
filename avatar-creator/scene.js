import * as THREE from '../johansson-town/vendor/three.module.js';
import {buildAvatar} from '../johansson-town/src/avatars/build.js';
import {buildSceneWorld} from './scene-world.js';
import {poseSceneAvatar} from './scene-avatar.js';
import {CAST_RECIPES,ORIGINAL_THUAN_RECIPE} from '../johansson-town/src/avatars/cast.js';
import {normalizeRecipe} from '../johansson-town/src/avatars/recipe.js';
import {drawCaptions,comicLayout,FORMATS} from '../johansson-town/src/photo/layout.js';
import {SCENE_KEY,MAX_ACTORS,MAX_PANELS,LOCATIONS,POSES,EXPRESSIONS,emptyScene,normalizeScene,addCharacter,moveCharacter,panelOrder,text} from './scene-model.mjs';

const friendly={Idle:'Standing',Kachashi:'Dance',Tada:'Ta-da',HandsOnHips:'Hands on hips',HeelKick:'Heel kick',CheekRest:'Hand on cheek',DoubleCheek:'Both cheeks'};
const nameOf=n=>n==='Thuan'?'Thuận':n;
const download=(url,name)=>{const a=document.createElement('a');a.href=url;a.download=name;a.click();};
const loadImage=url=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('The image could not be loaded.'));img.src=url;});

/** 3D scene editor: shared town geometry, ground, furniture and avatar models. */
export function createSceneWorkspace({getCharacter,onEdit,onMode}){
 let state=emptyScene();try{state=normalizeScene(JSON.parse(localStorage.getItem(SCENE_KEY)),normalizeRecipe);}catch{}
 let selected=state.actors[0]?.id,step='location',mode='scene',generation=0,pending=Promise.resolve(),valid=false,renderer;
 const panels=[],avatars=new Map();let world=null,worldId='',views=null,townData=null,drag=null,capturing=false,queue=Promise.resolve();
 const root=document.createElement('main');root.className='scene-workspace';root.hidden=true;
 root.innerHTML=`<div class="scene-heading"><div><h1>Build a scene</h1><p>Choose a place, add characters, then pose them and write your dialogue.</p></div><button type="button" data-action="download-project">Download project</button><button type="button" data-action="open-project">Open project</button><input type="file" data-project-input accept=".json,application/json" hidden></div>
 <nav class="scene-steps" aria-label="Scene building steps">
 <button type="button" data-step="location">1. Choose location</button><button type="button" data-step="characters">2. Add characters</button><button type="button" data-step="pose">3. Pose & position</button><button type="button" data-step="text">4. Add text</button><button type="button" data-step="export">5. Export</button></nav>
 <div class="scene-layout"><section class="scene-picture" aria-label="Scene preview"><div class="scene-frame"><canvas width="1200" height="900" tabindex="0" aria-label="Scene. Drag a character to move it; arrow keys move the selected character."></canvas><div class="scene-selection" hidden></div></div><p class="scene-hint">Drag a character across the ground. Walls, furniture and the edge of the pier stop movement. Use a seat below to sit on furniture.</p><div class="scene-camera"><label>Camera turn<input data-camera="orbit" type="range" min="-180" max="180" step="2" value="0"></label><label>Camera height<input data-camera="elevation" type="range" min="-25" max="40" step="1" value="0"></label><label>Camera distance<input data-camera="zoom" type="range" min=".55" max="1.8" step=".05" value="1"></label><button data-action="reset-camera">Reset camera</button></div><p class="scene-status" role="status" aria-live="polite"></p></section>
 <aside class="scene-controls" aria-label="Scene controls">
 <section data-pane="location"><h2>Choose a location</h2><p>These are the real 3D locations in Johansson World. Move the camera to compose your scene.</p><div class="scene-locations"></div></section>
 <section data-pane="characters" hidden><h2>Add characters</h2><p>Use your own character or choose a town resident. Up to six characters can share a scene.</p><button class="scene-primary" data-action="add-current">Add my character</button><label>Town resident<select data-field="resident"></select></label><button data-action="add-resident">Add resident</button><div class="scene-cast"></div></section>
 <section data-pane="pose" hidden><h2>Pose & position</h2><div class="scene-cast"></div><div class="scene-actor-controls">
 <label>Pose<select data-field="pose"></select></label><label>Expression<select data-field="expression"></select></label>
 <label>Turn<input data-field="turn" type="range" min="-180" max="180" step="5"></label><label>Size<input data-field="size" type="range" min=".6" max="1.4" step=".01"></label>
 <label>Left / right<input data-field="x" type="range" min="-8" max="8" step=".01"></label><label>Near / far<input data-field="z" type="range" min="-8" max="8" step=".01"></label>
 <label>Use furniture<select data-field="seat"><option value="">Stand on ground</option></select></label><button data-action="edit-character">Edit appearance</button><button data-action="duplicate">Duplicate character</button><button data-action="remove">Remove character</button></div></section>
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
 for(const [id,name] of LOCATIONS){const b=document.createElement('button');b.type='button';b.dataset.location=id;b.setAttribute('aria-label',name);const img=document.createElement('img');img.src=`../johansson-town/assets/images/feed/${id}.webp`;img.alt='';img.loading='lazy';const label=document.createElement('span');label.textContent=name;b.append(img,label);b.onclick=()=>{state.location=id;state.camera={orbit:0,elevation:0,zoom:1};for(const a of state.actors){a.seat='';a.x=0;a.z=0;}changed();sync();announce(name+' selected. Continue to Add characters.');};$('.scene-locations').append(b);}
 function save(){try{localStorage.setItem(SCENE_KEY,JSON.stringify(state));}catch{announce('Browser storage is unavailable. Download a project to keep your scene.');}}
 function changed(){save();pending=draw();syncSelection();}
 function setStep(value){step=value;for(const pane of root.querySelectorAll('[data-pane]'))pane.hidden=pane.dataset.pane!==step;for(const b of root.querySelectorAll('[data-step]')){b.setAttribute('aria-current',b.dataset.step===step?'step':'false');b.onclick=()=>setStep(b.dataset.step);}const i=keys.indexOf(step);$('[data-action="previous"]').disabled=i===0;$('[data-action="next"]').hidden=i===keys.length-1;$('[data-action="next"]').textContent='Next: '+({characters:'Add characters',pose:'Pose & position',text:'Add text',export:'Export'}[keys[i+1]]||'');sync();}
 function sync(){
  for(const c of root.querySelectorAll('[data-camera]'))c.value=state.camera[c.dataset.camera];
  const a=current();for(const n of ['pose','expression','turn','size','x','z','speech','seat']){field(n).disabled=!a;field(n).value=a?.[n]??'';}
  for(const n of ['style','top','bottom','format'])field(n).value=state[n];
  for(const b of root.querySelectorAll('[data-location]'))b.setAttribute('aria-pressed',String(b.dataset.location===state.location));
  for(const list of root.querySelectorAll('.scene-cast')){list.replaceChildren();if(!state.actors.length){const p=document.createElement('p');p.textContent='No characters yet. Use Add characters to begin.';list.append(p);}state.actors.forEach((actor,i)=>{const b=document.createElement('button');b.textContent=(i+1)+'. '+actor.name;b.setAttribute('aria-pressed',String(actor.id===selected));b.onclick=()=>{selected=actor.id;sync();};list.append(b);});}
  for(const b of root.querySelectorAll('[data-action="add-current"],[data-action="add-resident"],[data-action="duplicate"]'))b.disabled=state.actors.length>=MAX_ACTORS||(b.dataset.action==='duplicate'&&!a);
  for(const b of root.querySelectorAll('[data-action="remove"],[data-action="edit-character"]'))b.disabled=!a;
  for(const b of root.querySelectorAll('[data-action="capture"]'))b.disabled=panels.length>=MAX_PANELS;
  $('[data-action="export-comic"]').disabled=!panels.length;syncSelection();
 }
 function syncSelection(){const a=current(),entry=a&&avatars.get(a.id);selection.hidden=!entry||!world||mode==='comic';if(selection.hidden)return;
  const box=new THREE.Box3().setFromObject(entry.avatar.root),points=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])points.push(new THREE.Vector3(x,y,z).project(world.camera));
  if(points.some(p=>p.z>1||p.z<-1)){selection.hidden=true;return;}
  const left=Math.max(0,Math.min(...points.map(p=>(p.x+1)/2))),right=Math.min(1,Math.max(...points.map(p=>(p.x+1)/2))),top=Math.max(0,Math.min(...points.map(p=>(1-p.y)/2))),bottom=Math.min(1,Math.max(...points.map(p=>(1-p.y)/2)));
  if(right<=left||bottom<=top){selection.hidden=true;return;}Object.assign(selection.style,{left:left*100+'%',top:top*100+'%',width:(right-left)*100+'%',height:(bottom-top)*100+'%'});
 }
 for(const control of root.querySelectorAll('[data-camera]'))control.addEventListener('input',()=>{state.camera[control.dataset.camera]=Number(control.value);changed();});
 for(const n of ['pose','expression','turn','size','x','z','speech','seat'])field(n).addEventListener('input',()=>{const a=current();if(!a)return;
  if(n==='x'||n==='z'){if(world&&worldId===state.location){const x=world.origin[0]+(n==='x'?Number(field(n).value):a.x),z=world.origin[2]+(n==='z'?Number(field(n).value):a.z);if(!world.move(a,x,z,state.actors))announce('Movement stopped by furniture, another character or the ground boundary.');}}
  else if(n==='seat'){const id=field(n).value;if(state.actors.some(other=>other.id!==a.id&&other.seat===id&&id)){announce('That seat is occupied.');sync();return;}if(!id&&a.seat){const seat=world?.seats.find(s=>s.id===a.seat),stand=seat?.stand;if(stand){a.x=stand[0]-world.origin[0];a.z=stand[2]-world.origin[2];}}a.seat=id;a.pose=id?'Sit':'Idle';a.size=1;}
  else {a[n]=['turn','size'].includes(n)?Number(field(n).value):text(field(n).value);if(n==='pose'&&a.pose!=='Sit')a.seat='';}
  changed();sync();});
 for(const n of ['style','top','bottom','format'])field(n).addEventListener('input',()=>{state[n]=text(field(n).value);changed();});
 async function loadWorld(id){
  if(world&&worldId===id)return world;
  views??=await fetch(new URL('../johansson-town/assets/images/feed/views.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Locations unavailable');return r.json();});
  const next=await buildSceneWorld(id,views,townData);townData=next.townData||townData;world?.dispose();world=next;worldId=id;
  field('seat').replaceChildren(new Option('Stand on ground',''),...world.seats.filter(s=>Math.hypot(s.position[0]-world.origin[0],s.position[2]-world.origin[2])<12).map(s=>new Option(s.label,s.id)));
  return world;
 }
 function clearAvatar(entry){entry.avatar.body?.skeleton?.dispose();entry.avatar.dispose();entry.avatar.root.removeFromParent();}
 function draw(){const token=++generation;valid=false;canvas.setAttribute('aria-busy','true');const snapshot=structuredClone(state);
  queue=queue.catch(()=>{}).then(async()=>{
   if(token!==generation)return;
   try{
    const w=1200,h=Math.round(w/FORMATS[snapshot.format]),environment=await loadWorld(snapshot.location);if(token!==generation)return;
    renderer??=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.setSize(w,h,false);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    for(const [id,entry] of avatars)if(!snapshot.actors.some(a=>a.id===id)){clearAvatar(entry);avatars.delete(id);}
    for(const entry of avatars.values())entry.avatar.root.removeFromParent();
    const camera=environment.camera,preset=views[snapshot.location].wide.camera;
    camera.position.fromArray(preset.position);camera.quaternion.fromArray(preset.quaternion);camera.aspect=w/h;camera.updateProjectionMatrix();
    const target=new THREE.Vector3(environment.origin[0],environment.origin[1]+.9,environment.origin[2]);
    if(snapshot.camera.orbit||snapshot.camera.elevation||snapshot.camera.zoom!==1){const spherical=new THREE.Spherical().setFromVector3(camera.position.clone().sub(target));spherical.theta+=snapshot.camera.orbit*Math.PI/180;spherical.phi=THREE.MathUtils.clamp(spherical.phi-snapshot.camera.elevation*Math.PI/180,.25,Math.PI*.48);spherical.radius*=snapshot.camera.zoom;camera.position.copy(target).add(new THREE.Vector3().setFromSpherical(spherical));camera.lookAt(target);
     const direction=camera.position.clone().sub(target),length=direction.length(),ray=new THREE.Raycaster(target,direction.normalize(),.15,length),hit=ray.intersectObjects(environment.meshes,false).find(h=>h.object.visible&&h.object.material?.depthWrite!==false);if(hit)camera.position.copy(target).addScaledVector(direction,Math.max(.3,hit.distance-.15));
    }
    camera.updateMatrixWorld(true);environment.settle(snapshot.actors);const bubbles=[];
    for(const actor of snapshot.actors){const key=JSON.stringify([actor.recipe,actor.pose,actor.expression,actor.turn,actor.size,actor.seat]);let entry=avatars.get(actor.id);
     if(!entry||entry.key!==key){if(entry)clearAvatar(entry);entry={key,avatar:buildAvatar(actor.recipe,{shadows:true,faceSize:256})};entry.avatar.root.userData.studioActor=true;avatars.set(actor.id,entry);}
     const position=environment.place(actor),avatar=entry.avatar;
     // Each avatar is a mesh in the same scene graph as the counter and walls.
     environment.scene.add(avatar.root);avatar.root.position.set(0,0,0);avatar.root.scale.setScalar(actor.size);
     poseSceneAvatar(avatar,{...actor,seatHeight:position.seat?(position.seat.surfaceY-position.y)/actor.size:.48});
     if(position.seat)avatar.root.rotation.y=Math.PI+(position.seat.yaw||0);
     avatar.root.position.set(position.x,position.y,position.z);avatar.root.updateMatrixWorld(true);
     const box=new THREE.Box3().setFromObject(avatar.root),head=new THREE.Vector3(position.x,box.max.y,position.z),projected=head.clone().project(camera);
     const direction=head.clone().sub(camera.position),distance=direction.length();const hits=new THREE.Raycaster(camera.position,direction.normalize(),.05,distance-.08).intersectObjects(environment.meshes,false);
     bubbles.push({text:actor.speech,x:(projected.x+1)/2,y:(1-projected.y)/2,visible:projected.z<1&&projected.z>-1&&!hits.some(h=>h.object.visible&&h.object.material?.depthWrite!==false)});
     const live=state.actors.find(a=>a.id===actor.id);if(live){live.x=actor.x;live.z=actor.z;live.seat=actor.seat;}
    }
    environment.sky?.update(camera,1,false,false);renderer.render(environment.scene,camera);
    canvas.width=w;canvas.height=h;ctx.drawImage(renderer.domElement,0,0);const overlay=document.createElement('canvas');overlay.width=w;overlay.height=h;drawCaptions(overlay.getContext('2d'),w,h,{style:snapshot.style,top:snapshot.top,bottom:snapshot.bottom,bubbles});ctx.drawImage(overlay,0,0);
    valid=true;canvas.setAttribute('aria-busy','false');sync();save();
   }catch(e){canvas.setAttribute('aria-busy','false');announce('The 3D location could not load. Select the location again to retry.');console.error('Johansson Studio 3D scene',e);}
  });return queue;
 }
 function rayAt(e){const r=canvas.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),world.camera);return ray;}
 canvas.addEventListener('pointerdown',e=>{if(!world||!valid)return;const ray=rayAt(e),objects=[...avatars.values()].map(e=>e.avatar.root),hit=ray.intersectObjects(objects,true)[0];if(!hit)return;
  const obstruction=ray.intersectObjects(world.meshes,false).find(h=>h.object.visible&&h.object.material?.depthWrite!==false);if(obstruction&&obstruction.distance<hit.distance-.05)return;
  const a=state.actors.find(a=>{let o=hit.object;while(o){if(o===avatars.get(a.id)?.avatar.root)return true;o=o.parent;}return false;});if(!a)return;selected=a.id;const p=world.place(a),ground=new THREE.Vector3();ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-p.y),ground);drag={id:a.id,dx:p.x-ground.x,dz:p.z-ground.z};canvas.setPointerCapture(e.pointerId);sync();});
 canvas.addEventListener('pointermove',e=>{if(!drag||!world)return;const a=current(),p=world.place(a),point=new THREE.Vector3();if(!rayAt(e).ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-p.y),point))return;if(!world.move(a,point.x+drag.dx,point.z+drag.dz,state.actors))announce('Movement stopped at a solid object or ground boundary.');pending=draw();sync();});
 const endDrag=()=>{if(drag){drag=null;save();sync();}};canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
 canvas.addEventListener('keydown',e=>{const a=current(),directions={ArrowLeft:[-.15,0],ArrowRight:[.15,0],ArrowUp:[0,-.15],ArrowDown:[0,.15]};if(a&&world&&directions[e.key]){e.preventDefault();const p=world.place(a),[x,z]=directions[e.key];world.move(a,p.x+x,p.z+z,state.actors);changed();sync();}});
 function add(recipe,name){const a=addCharacter(state,normalizeRecipe(recipe),name);if(!a){announce('The scene already has six characters.');return;}selected=a.id;changed();sync();announce(a.name+' added. Select Pose & position to arrange them.');}
 async function ready(){let task;do{task=pending;await task;}while(task!==pending);if(!valid){announce('Wait for the scene to finish loading, then try again.');return false;}return true;}
 async function exportPNG(){if(!await ready())return;download(canvas.toDataURL('image/png'),'johansson-studio-scene.png');announce('Scene PNG exported.');}
 async function capture(){if(capturing)return;capturing=true;try{if(panels.length>=MAX_PANELS){announce('Your comic already has four panels. Remove a panel to replace it.');return;}if(!await ready())return;const url=canvas.toDataURL('image/png');panels.push({url,image:await loadImage(url)});renderPanels();announce('Panel '+panels.length+' added. Open Comic to review it, or compose the next scene.');}finally{capturing=false;}}
 function renderPanels(){const list=$('.scene-panels');list.replaceChildren();$('[data-panel-count]').textContent=panels.length;panels.forEach((p,i)=>{const figure=document.createElement('figure'),img=document.createElement('img');img.src=p.url;img.alt='Comic panel '+(i+1);figure.append(img);const row=document.createElement('div');for(const [label,action] of [['Move earlier',()=>{panelOrder(panels,i,-1);renderPanels();}],['Move later',()=>{panelOrder(panels,i,1);renderPanels();}],['Remove',()=>{panels.splice(i,1);renderPanels();}],['Save PNG',()=>download(p.url,'johansson-studio-panel-'+(i+1)+'.png')]]){const b=document.createElement('button');b.textContent=label;b.onclick=action;b.disabled=(label==='Move earlier'&&i===0)||(label==='Move later'&&i===panels.length-1);row.append(b);}figure.append(row);list.append(figure);});sync();}
 async function exportComic(){if(!panels.length)return;const layout=comicLayout(panels.length,field('layout').value),out=document.createElement('canvas');out.width=layout.width;out.height=layout.height;const c=out.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,out.width,out.height);panels.forEach((p,i)=>{const r=layout.cells[i],s=Math.min(r.w/p.image.width,r.h/p.image.height),w=p.image.width*s,h=p.image.height*s;c.drawImage(p.image,r.x+(r.w-w)/2,r.y+(r.h-h)/2,w,h);c.strokeStyle='#243442';c.lineWidth=2;c.strokeRect(r.x,r.y,r.w,r.h);});download(out.toDataURL('image/png'),'johansson-studio-comic.png');announce('Comic PNG exported.');}
 function downloadProject(){const url=URL.createObjectURL(new Blob([JSON.stringify({format:'johansson-studio-project',version:1,scene:state,panels:panels.map(p=>p.url)})],{type:'application/json'}));download(url,'johansson-studio-project.json');setTimeout(()=>URL.revokeObjectURL(url),10000);announce('Editable project downloaded, including comic panels.');}
 const projectInput=$('[data-project-input]');projectInput.onchange=async()=>{try{const file=projectInput.files[0];if(!file)return;if(file.size>34000000)throw Error('Project too large');const project=JSON.parse(await file.text());if(project.format!=='johansson-studio-project'||project.version!==1||![1,2].includes(project.scene?.version))throw Error('Invalid project');const scene=normalizeScene(project.scene,normalizeRecipe),urls=(Array.isArray(project.panels)?project.panels:[]).slice(0,MAX_PANELS);if(urls.some(url=>typeof url!=='string'||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(url)||url.length>8000000))throw Error('Invalid panel');const loaded=await Promise.all(urls.map(async url=>({url,image:await loadImage(url)})));state=scene;selected=state.actors[0]?.id;panels.splice(0,panels.length,...loaded);changed();renderPanels();sync();announce('Project opened.');}catch{announce('Unable to open this project. Choose a Johansson Studio project JSON file.');}finally{projectInput.value='';}};
 const actions={
  'reset-camera':()=>{state.camera={orbit:0,elevation:0,zoom:1};for(const c of root.querySelectorAll('[data-camera]'))c.value=state.camera[c.dataset.camera];changed();},
  'add-current':()=>add(getCharacter()),'add-resident':()=>{const n=resident.value;add(n==='Thuan'?ORIGINAL_THUAN_RECIPE:CAST_RECIPES[n],nameOf(n));},
  'edit-character':()=>{const a=current();if(a)onEdit(a.recipe,a.id);},'duplicate':()=>{const a=current();if(a)add(a.recipe,a.name);},
  'remove':()=>{state.actors=state.actors.filter(a=>a.id!==selected);selected=state.actors[0]?.id;changed();sync();},
  'previous':()=>setStep(keys[Math.max(0,keys.indexOf(step)-1)]),'next':()=>setStep(keys[Math.min(4,keys.indexOf(step)+1)]),
  'export':exportPNG,'capture':capture,'comic':()=>onMode('comic'),'compose':()=>{onMode('scene');setStep('location');},
  'export-comic':exportComic,'download-project':downloadProject,'open-project':()=>projectInput.click()
 };
 for(const b of root.querySelectorAll('[data-action]'))b.onclick=()=>{Promise.resolve(actions[b.dataset.action]()).catch(e=>{console.error(e);announce('The action could not be completed. Your scene is still available.');});};
 setStep('location');renderPanels();
 return {root,show(value){mode=value;root.dataset.mode=value;root.hidden=false;$('.scene-comic').hidden=value!=='comic';$('.scene-steps').hidden=value==='comic';$('.scene-controls').hidden=value==='comic';$('.scene-heading h1').textContent=value==='comic'?'Make a comic':'Build a scene';pending=draw();sync();},hide(){root.hidden=true;},useCharacter(recipe,id){const a=state.actors.find(a=>a.id===id);if(a){a.recipe=normalizeRecipe(recipe);a.name=text(recipe.name)||a.name;selected=a.id;changed();sync();}else add(recipe);setStep('pose');},dispose(){generation++;for(const entry of avatars.values())clearAvatar(entry);world?.dispose();renderer?.dispose();renderer?.forceContextLoss();root.remove();}};
}
