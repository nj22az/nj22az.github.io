import {WORKSHOP_OBJECTS} from '../johansson-town/src/studio/workshop-contract.js';
import * as THREE from '../johansson-town/vendor/three.module.js';
import {newRoom,readRoom,validateRoom,roomHistory,freeId,encodeGLB,decodeGLB} from '../johansson-town/src/studio/room-project.js';
import {buildRoom,exportRoom,checkRoom,starterRoom,dropRoomObject} from '../johansson-town/src/studio/room-render.js';
import {disposeModel,glbDocument} from '../johansson-town/src/studio/model-workbench.js';
import {openRoomStore} from './room-storage.mjs';
import {createCelPass} from '../johansson-town/src/render/cel.js';
import {createReadyFile,bindSaveLink,deliverFile} from './studio-share.mjs';

const ACTIVE='nj-studio-active-room',uid=()=>`room-${crypto.randomUUID().slice(0,8)}`;
export function createRoomWorkspace({onScene=()=>{}}={}){
 const root=document.createElement('main');root.className='scene-workspace room-workspace';root.hidden=true;
 const xyz=(key,label)=>['x','y','z'].map((a,i)=>`<label>${a.toUpperCase()}<input type="number" step="${key==='rotation'?15:.05}" data-vector="${key}" data-axis="${i}" aria-label="${label} ${a.toUpperCase()}"></label>`).join('');
 root.innerHTML=`<div class="scene-heading"><div><h1>Room projects</h1><p>Arrange editable model copies. Save a room project to continue here or exchange it with Claude.</p></div>
 <button data-world-workshop>Open World workshop</button><button data-new>New room</button><button data-starter>World furniture starter</button><button data-open>Open project</button><input type="file" accept=".json" data-project-file hidden><button data-download>Download project</button><a class="scene-save scene-primary" data-export>Export room GLB</a></div>
 <section data-world-panel hidden class="room-world-panel"><h2>World workshop</h2><button data-workshop-scene>Build a scene here</button><p data-world-info></p><p>Fixed services remain connected. Move or remove the table, motor bench and arcade; add up to eight static props. Floor contact is required unless Allow floating is enabled. Use quarter turns. The cutaway is for editing only. Build scene uses the published revision; publish and reload before shooting your changes.</p><button data-prepare-world>Check and prepare World update</button><button data-download-world hidden>Download World update</button><p data-world-result role="status"></p></section>
 <label class="room-title">Project title<input data-title maxlength="120" aria-label="Project title"></label><p role="status" aria-live="polite" data-status></p>
 <div class="room-layout"><aside class="scene-controls room-library"><h2>Objects</h2><div class="scene-save-row"><button data-add>Import model</button><input type="file" accept=".glb" data-model-file hidden></div><div data-objects role="group" aria-label="Room objects"></div><button data-clean-assets>Remove unused assets</button></aside>
 <section class="scene-picture"><canvas class="room-canvas" tabindex="0" aria-label="Room preview. Select and drag an object to move it on the floor."></canvas><div class="scene-save-row"><button data-view="angle">Three-quarter</button><button data-view="top">Top</button><button data-view="front">Front</button><button data-frame>Frame all</button></div><p>Drag a model to move it. Distances are in metres. The grid is a guide, not part of the export.</p><p data-render-status role="status"></p></section>
 <aside class="scene-controls"><div class="scene-save-row"><button data-undo disabled>Undo</button><button data-redo disabled>Redo</button></div><section data-inspector hidden>
 <h2>Selected object</h2><label>Name<input data-name maxlength="120"></label><p data-identity></p><label>Scale<input data-scale type="number" min="0.001" max="100" step="0.1"></label>
 <p>Position</p><div class="model-vector">${xyz('position','Object position')}</div><p>Rotation in degrees</p><div class="model-vector">${xyz('rotation','Object rotation')}</div>
 <label><input type="checkbox" data-floating>Allow floating (intentional)</label><label>Support<select data-support><option value="resting">Resting on a surface</option><option value="attached">Attached to something</option><option value="suspended">Deliberately suspended</option></select></label><button data-drop>Drop onto support</button><label>Grid spacing<input data-grid type="number" value="0.05" min="0.001" max="10" step="0.01"></label><button data-snap>Snap selected to grid</button>
 <div class="scene-save-row"><button data-duplicate>Duplicate</button><button data-delete>Delete</button><button data-replace>Replace model</button><input type="file" accept=".glb" data-replace-file hidden></div></section>
 <button data-check>Check room surfaces</button><p data-check-report></p><p class="room-scope">Room projects do not change the playable town. Doors, routes and gameplay need World validation before publication.</p></aside></div>`;
 document.body.append(root);const $=s=>root.querySelector(s),status=$('[data-status]'),canvas=$('canvas'),store=openRoomStore();
 let preparedWorld=null;
 let history=roomHistory(newRoom({id:uid()})),selected=null,savedRevision=null,saveBlocked=false,saveQueue=Promise.resolve(),loadToken=0,renderQueue=Promise.resolve(),shown=false,disposed=false,modelRoot=null,frame=0,view='angle',cameraDirty=true,gesture=null;
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xe9eeeb);scene.add(new THREE.HemisphereLight(0xfff5e5,0x80949c,2));const sun=new THREE.DirectionalLight(0xfff4e8,2);sun.position.set(6,10,5);scene.add(sun);
 const grid=new THREE.GridHelper(12,24,0xb3c2b8,0xd1dcd5);grid.position.y=-.005;scene.add(grid);
 const camera=new THREE.PerspectiveCamera(45,1,.01,100),ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let outline=null;
 const say=text=>{status.textContent=text;};const project=()=>history.current;
 const downloadFile=createReadyFile({name:()=>project().id+'.glb',type:'model/gltf-binary',build:async()=>new Blob([await exportRoom(project())],{type:'model/gltf-binary'}),onChange:()=>updateExport(),delay:350});
 const updateExport=bindSaveLink($('[data-export]'),downloadFile,{say,disabled:()=>!project().objects.length,words:{busy:'The room GLB is being prepared.',download:'Room GLB downloaded.',shared:'Room GLB handed to the share sheet.'}});
 function save(){
  const p=project();say(saveBlocked?'Local save needs attention. Download the project to keep it.':'Saving room…');
  saveQueue=saveQueue.catch(()=>{}).then(async()=>{if(saveBlocked||disposed)return;
   try{savedRevision=await store.save(p,savedRevision);try{localStorage.setItem(ACTIVE,p.id);}catch{}if(project().id===p.id&&project().revision===p.revision)say('Saved on this device · revision '+p.revision);}
   catch(e){saveBlocked=true;say(e.message+' Download the project to keep your work.');}
  });
 }
 function change(commands){try{history.apply(commands);sync();save();drawProject();}catch(e){sync();say(e.message);}}
 function sync(){
  preparedWorld=null;$('[data-download-world]').hidden=true;$('[data-world-result]').textContent='';
  const native=!!project().world;$('[data-world-panel]').hidden=!native;if(native)$('[data-world-info]').textContent='Based on World revision '+project().world.revision+'. A prepared update is a proposal; Claude or Codex publishes it through world_room_publish after the checks pass.';
  $('[data-title]').value=project().title;$('[data-undo]').disabled=!history.canUndo;$('[data-redo]').disabled=!history.canRedo;
  const list=$('[data-objects]');list.replaceChildren();for(const o of project().objects){const b=document.createElement('button');b.textContent=o.name;b.setAttribute('aria-pressed',String(o.id===selected));b.onclick=()=>{selected=o.id;sync();selectOutline();};list.append(b);}
  const o=project().objects.find(o=>o.id===selected);$('[data-inspector]').hidden=!o;
  if(o){$('[data-floating]').checked=o.support==='suspended';$('[data-support]').value=o.support||'resting';$('[data-name]').value=o.name;$('[data-scale]').value=o.scale;$('[data-identity]').textContent=`${o.id} · ${project().assets[o.asset].name} · v${project().assets[o.asset].version}`;
   for(const input of root.querySelectorAll('[data-vector]'))input.value=o[input.dataset.vector][Number(input.dataset.axis)];}
  const fixed=native&&!!WORKSHOP_OBJECTS[o?.id]?.locked,builtIn=native&&!!WORKSHOP_OBJECTS[o?.id];
  for(const input of root.querySelectorAll('[data-vector]'))input.disabled=fixed||(native&&(input.dataset.vector==='position'?input.dataset.axis==='1'&&o?.support!=='suspended':input.dataset.axis!=='1'));
  $('[data-floating]').disabled=fixed;$('[data-scale]').disabled=builtIn;$('[data-scale]').max=native?'4':'100';for(const key of ['duplicate','replace'])$('[data-'+key+']').disabled=builtIn;for(const key of ['delete','snap'])$('[data-'+key+']').disabled=fixed;for(const key of ['support','drop'])$('[data-'+key+']').disabled=native;
  $('[data-identity]').textContent+=(fixed?' · Protected service assembly':builtIn?' · Native World assembly':'');
  renderer.clippingPlanes=native?[new THREE.Plane(new THREE.Vector3(0,-1,0),2.35),new THREE.Plane(new THREE.Vector3(0,0,-1),3.2),new THREE.Plane(new THREE.Vector3(-1,0,0),4.05)]:[];
  updateExport();$('[data-check-report]').textContent='';
 }
 function selectOutline(){if(outline){scene.remove(outline);outline.geometry.dispose();outline.material.dispose();outline=null;}const o=modelRoot?.children.find(o=>o.userData.roomObject===selected);if(o){outline=new THREE.BoxHelper(o,0x267b65);outline.material.depthTest=false;outline.renderOrder=100;scene.add(outline);}}
 function resize(){const w=Math.max(1,canvas.clientWidth),h=Math.max(180,Math.min(650,w*.85));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 function frameAll(){
  const box=modelRoot?.children.length?new THREE.Box3().setFromObject(modelRoot):new THREE.Box3(new THREE.Vector3(-2,0,-2),new THREE.Vector3(2,2,2));
  const centre=box.getCenter(new THREE.Vector3()),radius=Math.max(2,box.getBoundingSphere(new THREE.Sphere()).radius),direction=new THREE.Vector3(...(view==='top'?[0,1,.001]:view==='front'?[0,.2,1]:[1,1,1]));
  camera.position.copy(centre).addScaledVector(direction.normalize(),radius*(project().world?2.4:3.2));camera.lookAt(centre);camera.near=Math.max(.005,radius*.001);camera.far=radius*10+50;camera.updateProjectionMatrix();cameraDirty=false;
 }
 function drawProject(){
  const mine=++loadToken,p=project();downloadFile.invalidate();$('[data-render-status]').textContent='Loading room…';
  renderQueue=renderQueue.catch(()=>{}).then(async()=>{if(disposed||mine!==loadToken)return;let next;
   try{next=await buildRoom(p);if(disposed||mine!==loadToken){disposeModel(next);return;}if(modelRoot)disposeModel(modelRoot);modelRoot=next;createCelPass().apply(next);scene.add(next);if(cameraDirty)frameAll();selectOutline();$('[data-render-status]').textContent='';downloadFile.schedule();}
   catch(e){disposeModel(next);$('[data-render-status]').textContent='Room could not render: '+e.message;}
  });
 }
 async function adopt(p,{copy=false}={}){
  await saveQueue;if(copy)p={...p,id:uid()};validateRoom(p,{models:true});history=roomHistory(p);selected=p.objects[0]?.id||null;savedRevision=copy?null:(await store.read(p.id))?.revision??null;saveBlocked=false;cameraDirty=true;sync();drawProject();save();
 }
 async function importModel(file,replace=false){
  if(!file)return;const before=project(),replacing=selected;if(file.size>24*1024*1024)throw Error('Choose a GLB smaller than 24 MiB.');const bytes=new Uint8Array(await file.arrayBuffer());glbDocument(bytes);
  if(before!==project()||(replace&&replacing!==selected))throw Error('The room or selection changed during import. Choose the model again.');
  const p=project(),asset=freeId(p,'asset'),name=file.name.replace(/\.glb$/i,'');
  if(replace&&!p.objects.some(o=>o.id===selected))throw Error('Select the object to replace.');
  const key=replace?selected:freeId(p);change([{op:'asset.add',id:asset,name,glb:encodeGLB(bytes)},replace?{op:'object.replace',id:key,asset}:{op:'object.add',id:key,asset,name}]);selected=key;sync();
 }
 $('[data-add]').onclick=()=> $('[data-model-file]').click();$('[data-replace]').onclick=()=> $('[data-replace-file]').click();
 $('[data-clean-assets]').onclick=()=>{const unused=Object.keys(project().assets).filter(id=>!project().assets[id].world&&!project().objects.some(o=>o.asset===id));if(unused.length)change(unused.map(id=>({op:'asset.remove',id})));else say('Every asset is used.');};
 for(const [selector,replace] of [['[data-model-file]',false],['[data-replace-file]',true]])$(selector).onchange=async e=>{try{await importModel(e.target.files[0],replace);}catch(error){say(error.message);}finally{e.target.value='';}};
 $('[data-workshop-scene]').onclick=()=>onScene('dock-workshop');
 $('[data-world-workshop]').onclick=async()=>{try{say('Opening the real World workshop…');const {openWorkshopProject}=await import('../johansson-town/src/studio/workshop-room.js');await adopt(await openWorkshopProject(),{copy:true});}catch(e){say(e.message);}};
 $('[data-prepare-world]').onclick=async()=>{const p=project();$('[data-world-result]').textContent='Checking floor contact, collisions, doorway and staff access…';try{const W=await import('../johansson-town/src/studio/workshop-room.js');if(await W.workshopSource()!==p.world.source)throw Error('Workshop source changed. Reopen World workshop.');const report=await W.checkWorkshop(p);if(p!==project())throw Error('The room changed during validation. Check it again.');if(!report.ok)throw Error(report.findings.map(f=>[f.id,f.kind,f.target,f.with].filter(Boolean).join(': ')).join('; '));preparedWorld=new File([JSON.stringify(p)],'dock-workshop-update.room.json',{type:'application/json'});$('[data-download-world]').hidden=false;$('[data-world-result]').textContent='Checks passed. Download this update for Claude or Codex; World revision '+p.world.revision+' and draft revision '+p.revision+' are required when publishing.';}catch(e){if(p===project())$('[data-world-result]').textContent=e.message;}};
 $('[data-download-world]').onclick=()=>{if(preparedWorld)deliverFile(preparedWorld,{onResult:r=>say(r.ok?'World update proposal downloaded.':'World update proposal was not saved.')});};
 $('[data-new]').onclick=()=>adopt(newRoom({id:uid()})).catch(e=>say(e.message));
 $('[data-starter]').onclick=async()=>{try{say('Preparing World furniture…');const p=await starterRoom();await adopt({...p,id:uid()});}catch(e){say(e.message);}};
 $('[data-open]').onclick=()=> $('[data-project-file]').click();$('[data-project-file]').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>41*1024*1024)throw Error('Project exceeds 41 MiB.');await adopt(readRoom(await f.text()),{copy:true});}catch(error){say(error.message);}finally{e.target.value='';}};
 $('[data-download]').onclick=()=>deliverFile(new File([JSON.stringify(project())],project().id+'.room.json',{type:'application/json'}),{onResult:r=>say(r.ok?'Project file saved.':'Project file was not saved.')});
 $('[data-title]').onchange=e=>change([{op:'title',title:e.target.value}]);
 $('[data-name]').onchange=e=>change([{op:'object.update',id:selected,set:{name:e.target.value}}]);$('[data-scale]').onchange=e=>change([{op:'object.update',id:selected,set:{scale:Number(e.target.value)}}]);
 for(const input of root.querySelectorAll('[data-vector]'))input.onchange=()=>{const o=project().objects.find(o=>o.id===selected);if(!o)return;const v=[...o[input.dataset.vector]];v[Number(input.dataset.axis)]=Number(input.value);change([{op:'object.update',id:selected,set:{[input.dataset.vector]:v}}]);};
 $('[data-floating]').onchange=e=>{const o=project().objects.find(o=>o.id===selected);if(o)change([{op:'object.update',id:selected,set:{support:e.target.checked?'suspended':'resting',...project().world&&!e.target.checked?{position:[o.position[0],0,o.position[2]]}:{}}}]);};
 $('[data-support]').onchange=e=>change([{op:'object.update',id:selected,set:{support:e.target.value}}]);
 $('[data-drop]').onclick=async()=>{const p=project(),id=selected;try{const r=await dropRoomObject(p,id);if(p!==project()||id!==selected)throw Error('Room changed during placement. Try again.');change([{op:'object.update',id,set:{position:r.position,support:'resting'}}]);}catch(e){say(e.message);}};
 $('[data-snap]').onclick=()=>change([{op:'object.snap',id:selected,mode:'grid',step:Number($('[data-grid]').value)}]);
 $('[data-delete]').onclick=()=>{const id=selected;selected=null;change([{op:'object.delete',id}]);};$('[data-duplicate]').onclick=()=>change([{op:'object.duplicate',id:selected}]);
 for(const direction of ['undo','redo'])$(`[data-${direction}]`).onclick=()=>{history[direction]();sync();save();drawProject();};
 for(const b of root.querySelectorAll('[data-view]'))b.onclick=()=>{view=b.dataset.view;frameAll();};$('[data-frame]').onclick=frameAll;
 $('[data-check]').onclick=async()=>{const p=project();$('[data-check-report]').textContent='Checking room surfaces…';try{const r=await checkRoom(p);if(p===project())$('[data-check-report]').textContent=p.world?(r.ok?'Workshop checks passed: contact, collisions, door, staff routes and prompt access.':r.findings.map(f=>[f.id,f.kind,f.target,f.with].filter(Boolean).join(': ')).join('; ')):`${r.findings.length} possible overlaps. ${r.support.findings.length} resting objects need support review. ${r.complete?'Static-object scan complete.':'Partial scan: limit or unsupported geometry.'} Game routes and interactions are not checked.`;}catch(e){$('[data-check-report]').textContent=e.message;}};
 const point=e=>{const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);};
 const planePoint=e=>{point(e);return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-gesture.y),new THREE.Vector3());};
 canvas.onpointerdown=e=>{if(e.button!==0||!modelRoot)return;point(e);const hit=ray.intersectObject(modelRoot,true)[0];let node=hit?.object;while(node&&node.parent!==modelRoot)node=node.parent;selected=node?.userData.roomObject||null;sync();selectOutline();if(node){const o=project().objects.find(o=>o.id===selected);if(project().world&&WORKSHOP_OBJECTS[o.id]?.locked)return;gesture={node,id:o.id,start:[...o.position],y:o.position[1],pointer:e.pointerId};const p=planePoint(e);if(!p){gesture=null;return;}gesture.offset=node.position.clone().sub(p);canvas.setPointerCapture(e.pointerId);}};
 canvas.onpointermove=e=>{if(!gesture||e.pointerId!==gesture.pointer)return;const p=planePoint(e);if(p){gesture.node.position.copy(p.add(gesture.offset));outline?.update();}};
 const end=e=>{if(!gesture||e.pointerId!==gesture.pointer)return;const g=gesture;gesture=null;if(e.type==='pointercancel'){g.node.position.fromArray(g.start);outline?.update();return;}const p=g.node.position.toArray();if(p.some((v,i)=>Math.abs(v-g.start[i])>.0001))change([{op:'object.update',id:g.id,set:{position:p}},{op:'object.snap',id:g.id,mode:'grid',step:Number($('[data-grid]').value)}]);};canvas.onpointerup=end;canvas.onpointercancel=end;
 const resizer=new ResizeObserver(resize);resizer.observe(canvas);
 const key=e=>{if(root.hidden||e.target.closest('input,textarea,select'))return;if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$(`[data-${e.shiftKey?'redo':'undo'}]`).click();}else if(e.key==='Delete'&&selected){e.preventDefault();$('[data-delete]').click();}};root.addEventListener('keydown',key);
 const loop=()=>{if(!shown)return;frame=requestAnimationFrame(loop);renderer.render(scene,camera);};let loaded=false,initializing;
 return {root,async show(){root.hidden=false;shown=true;resize();frameAll();cancelAnimationFrame(frame);loop();if(!loaded){loaded=true;initializing=(async()=>{try{const active=localStorage.getItem(ACTIVE),p=active?await store.read(active):null;if(p){history=roomHistory(validateRoom(p,{models:true}));savedRevision=p.revision;selected=p.objects[0]?.id||null;}sync();drawProject();if(!p)save();else say('Restored saved room · revision '+p.revision);}catch(e){say(e.message);sync();drawProject();}})();}await initializing;},
 hide(){root.hidden=true;shown=false;cancelAnimationFrame(frame);},dispose(){this.hide();disposed=true;++loadToken;downloadFile.dispose();resizer.disconnect();renderQueue.finally(()=>{disposeModel(modelRoot);if(outline){outline.geometry.dispose();outline.material.dispose();}grid.geometry.dispose();grid.material.dispose();renderer.dispose();store.close().catch(()=>{});});root.remove();},
 async addWorldAsset(e){let bytes;if(e.access==='glb'){const r=await fetch('/'+e.source);if(!r.ok)throw Error('World model could not load.');if(Number(r.headers.get('content-length'))>24*1024*1024)throw Error('Choose a GLB smaller than 24 MiB.');bytes=new Uint8Array(await r.arrayBuffer());}else if(e.id.startsWith('home:')){const {homeFurnitureFactory}=await import('../johansson-town/src/build/home-furniture.js');const model=homeFurnitureFactory()[e.id.slice(5)]?.(0,0,0).object;if(!model)throw Error('Unknown home model.');const {exportModel}=await import('../johansson-town/src/studio/model-workbench.js');bytes=await exportModel(model);}else{const {libraryItems,glbOf}=await import('./model-assets.mjs');const item=libraryItems({made:{}}).find(i=>i.key===e.id);if(!item)throw Error('This model still needs a Studio adapter.');bytes=await glbOf(item,await item.card());}await importModel(new File([bytes],e.name+'.glb'));},
 get project(){return project();}
 };
}
