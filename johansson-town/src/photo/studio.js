import * as THREE from '../../vendor/three.module.js';
import {buildAvatar} from '../avatars/build.js';
import {createAvatarAnimator,GESTURES} from '../avatars/animate.js';
import {CAST_RECIPES,recipeFor} from '../avatars/cast.js';
import {playerRecipe} from '../avatars/actors.js';
import {CAST_LIMIT,PHOTO_LIMIT,FORMATS,POSES,EXPRESSIONS,cleanCaption,frameSize,comicLayout,drawCaptions} from './layout.js';

const POSE_LABELS={Kachashi:'Dance',Tada:'Ta-da!',HandsOnHips:'Hands on hips',HeelKick:'Heel kick'};

export function poseStudioActor(actor){
 const animator=createAvatarAnimator(actor.avatar),duration=GESTURES[actor.pose],time=Number.isFinite(duration)?duration*.43:.7;
 if(duration)animator.play(actor.pose);
 const steps=Math.max(1,Math.ceil(time/.025));
 for(let i=0;i<steps;i++)animator.update(time/steps,{expression:actor.expression,seated:actor.pose==='Sit',seatHeight:.48});
 actor.avatar.paintFace({expression:actor.expression,blink:0,talk:0,look:[0,0]});
}

export function createPhotoStudio({scene,renderer,gameCamera,draw,getContext,onOpen,onClose,cameraBlocked=()=>false}){
 const canvas=renderer.domElement,view=gameCamera.clone(false),stageGroup=new THREE.Group();stageGroup.name='Photo studio cast';
 const panels=[],actors=[],hidden=new Map();let opened=false,busy=false,dirty=true,selected=0,context,canvasHome,focusBefore,originalStyle;
 let azimuth=0,elevation=.1,distance=2.4,targetHeight=1.05,panX=0,panZ=0;
 const ui=document.createElement('section');ui.id='photoStudio';ui.hidden=true;ui.setAttribute('role','dialog');ui.setAttribute('aria-modal','true');ui.setAttribute('aria-labelledby','photoTitle');
 const options=values=>values.map(v=>`<option value="${v}">${POSE_LABELS[v]||v}</option>`).join('');
 const range=(name,label,min,max,step,value)=>`<label>${label}<input name="${name}" aria-label="${label}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
 ui.innerHTML=`<header><div><h2 id="photoTitle">Johansson Town · Photo studio</h2><p>Stage the cast. Make a memory, a meme or a comic.</p></div><button data-close>Return to town</button></header>
 <div class="photo-stage"><div class="photo-frame"><canvas class="photo-captions" aria-hidden="true"></canvas></div></div>
 <aside class="photo-tools" aria-label="Photo controls">
 <div class="photo-row"><label>Format<select aria-label="Format" name="format"><option value="landscape">Landscape</option><option value="square">Square</option><option value="portrait">Portrait</option></select></label><label>Style<select aria-label="Style" name="style"><option value="photo">Photograph</option><option value="meme">Meme</option><option value="comic">Comic panel</option></select></label></div>
 <button class="primary" data-capture>Capture panel</button><p class="photo-status" role="status" aria-live="polite"></p>
 <details open><summary>Cast & poses</summary><div class="photo-row"><label>Add a character<select aria-label="Add a character" name="addCast"></select></label><button data-add>Add</button></div><label>Selected character<select aria-label="Selected character" name="actor"></select></label>
 <div class="photo-row"><label>Pose<select aria-label="Pose" name="pose">${options(POSES)}</select></label><label>Expression<select aria-label="Expression" name="expression">${options(EXPRESSIONS)}</select></label></div>
 ${range('actorX','Left / right',-5,5,.05,0)}${range('actorZ','Forward / back',-5,5,.05,0)}${range('actorY','Height',-1,3,.05,0)}${range('actorTurn','Turn character',-180,180,5,0)}
 <label>Speech bubble<input name="speech" type="text" maxlength="120" placeholder="What are they saying?"></label>${range('bubbleLift','Bubble height',-.25,.4,.01,.12)}<button data-remove>Remove character</button></details>
 <details><summary>Camera & framing</summary><p>Drag the photograph to orbit. Use the sliders to frame the scene.</p>
 ${range('azimuth','Orbit',-180,180,1,0)}${range('elevation','Camera angle',-15,65,1,6)}${range('distance','Camera distance',1.5,12,.1,2.4)}${range('targetHeight','Camera height',.2,4,.05,1.05)}${range('panX','Pan sideways',-6,6,.1,0)}${range('panZ','Pan depth',-6,6,.1,0)}${range('fov','Lens',30,85,1,50)}<button data-reset>Reset framing</button></details>
 <details open><summary>Captions</summary><label>Top text · meme<input name="top" type="text" maxlength="120" placeholder="WHEN THE BOAT IS LATE"></label><label>Bottom text · meme or comic<input name="bottom" type="text" maxlength="120" placeholder="Write your punchline…"></label></details>
 <details open><summary>Comic strip · <span data-count>0</span> / 4 panels</summary><p>Capture up to four panels. Return to town to choose another scene; your panels stay here until this page closes.</p><div class="photo-film"></div><label>Comic layout<select aria-label="Comic layout" name="layout"><option value="grid">Comic page</option><option value="strip">Horizontal strip</option></select></label><button data-comic>Save comic PNG</button><div data-comic-link></div></details>
 </aside>`;
 document.body.append(ui);const $=s=>ui.querySelector(s),field=n=>$(`[name="${n}"]`),frame=$('.photo-frame'),stage=$('.photo-stage'),overlay=$('.photo-captions'),status=$('.photo-status');
 let comicURL=null;
 const announce=text=>status.textContent=text;
 const selectedActor=()=>actors[selected];
 function updateButtons(){field('actor').disabled=!actors.length;for(const name of ['pose','expression','actorX','actorY','actorZ','actorTurn','speech','bubbleLift'])field(name).disabled=!actors.length;$('[data-remove]').disabled=!actors.length;$('[data-add]').disabled=actors.length>=CAST_LIMIT;$('[data-capture]').disabled=busy||panels.length>=PHOTO_LIMIT;$('[data-comic]').disabled=busy||!panels.length;}
 function actorList(){field('actor').replaceChildren(...actors.map((a,i)=>new Option(`${i+1}. ${a.name}`,String(i))));field('actor').value=String(selected);syncActor();updateButtons();}
 function syncActor(){const a=selectedActor();if(!a)return;queueMicrotask?.(()=>typeof syncChips==='function'&&syncChips());for(const [name,value] of Object.entries({pose:a.pose,expression:a.expression,actorX:a.x,actorY:a.y,actorZ:a.z,actorTurn:a.turn,speech:a.speech,bubbleLift:a.lift}))field(name).value=String(value);}
 function placeActor(a){a.holder.position.set(a.x,a.y,a.z);a.holder.rotation.y=Math.PI+a.turn*Math.PI/180;}
 function addActor(name){
  if(actors.length>=CAST_LIMIT)return;
  const source=context.cast.find(c=>c.name===name),recipe=name==='Johansson'?playerRecipe():source?.recipe||recipeFor(name);
  const avatar=buildAvatar(recipe,{shadows:false,faceSize:256}),holder=new THREE.Group();holder.add(avatar.root);stageGroup.add(holder);
  const [x,z]=[[-.45,0],[.45,0],[-1.35,0],[1.35,0],[-.45,-.9],[.45,-.9]].find(([x,z])=>actors.every(a=>Math.hypot(a.x-x,a.z-z)>.4))||[0,-1.8];
  const a={name,avatar,holder,x,y:0,z,turn:0,pose:'Idle',expression:'smile',speech:'',lift:.12};
  actors.push(a);selected=actors.length-1;placeActor(a);poseStudioActor(a);actorList();
 }
 function clearActors(){for(const a of actors){a.holder.removeFromParent();a.avatar.dispose();}actors.length=0;selected=0;}
 function captions(width,height){
  const bubbles=actors.map(a=>{const p=a.avatar.bones.head.getWorldPosition(new THREE.Vector3());p.y+=.32;p.project(view);return {text:a.speech,x:(p.x+1)/2,y:(1-p.y)/2-a.lift,visible:p.z>=-1&&p.z<=1&&Math.abs(p.x)<1.1&&Math.abs(p.y)<1.2};});
  return {style:field('style').value,top:cleanCaption(field('top').value),bottom:cleanCaption(field('bottom').value),bubbles};
 }
 function updateView(){
  const target=new THREE.Vector3(panX,targetHeight,panZ).applyAxisAngle(new THREE.Vector3(0,1,0),context.yaw).add(stageGroup.position),angle=context.yaw+azimuth;
  view.position.set(target.x+Math.sin(angle)*distance*Math.cos(elevation),target.y+Math.sin(elevation)*distance,target.z+Math.cos(angle)*distance*Math.cos(elevation));const wanted=view.position.clone(),ray=wanted.clone().sub(target),length=ray.length();ray.normalize();
  for(let d=.3;d<=length;d+=.1){const p=target.clone().addScaledVector(ray,d);if(cameraBlocked(p.x,p.z,p.y,.12)){view.position.copy(target).addScaledVector(ray,Math.max(.25,d-.15));break;}}
  view.lookAt(target);view.fov=Number(field('fov').value);view.clearViewOffset();view.updateProjectionMatrix();view.updateMatrixWorld(true);
 }
 function size(){
  const rect=stage.getBoundingClientRect(),aspect=FORMATS[field('format').value],fit=frameSize(Math.max(1,rect.width-24),Math.max(1,rect.height-24),aspect);
  frame.style.width=fit.width+'px';frame.style.height=fit.height+'px';
  const old=renderer.getSize(new THREE.Vector2());if(old.x!==fit.width||old.y!==fit.height){renderer.setSize(fit.width,fit.height,false);}
  if(overlay.width!==1200||overlay.height!==Math.round(1200/aspect)){overlay.width=1200;overlay.height=Math.round(1200/aspect);}
  const changed=view.aspect!==aspect||old.x!==fit.width||old.y!==fit.height;view.aspect=aspect;return changed;
 }
 function render(){if(!opened||document.hidden)return;const resized=size();if(!dirty&&!resized)return;dirty=false;updateView();draw(view,stageGroup.position);drawCaptions(overlay.getContext('2d'),overlay.width,overlay.height,captions());}
 function resetCamera(){azimuth=0;elevation=.1;distance=2.4;targetHeight=1.05;panX=0;panZ=0;for(const [n,v] of Object.entries({azimuth:0,elevation:6,distance,targetHeight,panX,panZ,fov:50}))field(n).value=String(v);}
 function invalidateComic(){if(comicURL)URL.revokeObjectURL(comicURL);comicURL=null;$('[data-comic-link]').replaceChildren();}
 function film(){
  invalidateComic();$('[data-count]').textContent=String(panels.length);$('.photo-film').replaceChildren(...panels.map((panel,i)=>{
   const figure=document.createElement('figure'),img=document.createElement('img'),row=document.createElement('div');row.className='photo-row';img.src=panel.url;img.alt=`Captured panel ${i+1}`;figure.append(img,row);
   const link=document.createElement('a');link.href=panel.url;link.download=`johansson-town-panel-${i+1}.png`;link.textContent='Save PNG';row.append(link);
   const remove=document.createElement('button');remove.textContent='Remove';remove.setAttribute('aria-label',`Remove panel ${i+1}`);remove.onclick=()=>{if(busy)return;URL.revokeObjectURL(panel.url);panel.image.width=0;panels.splice(i,1);film();announce('Panel removed.');};row.append(remove);
   if(navigator.canShare?.({files:[new File([panel.blob],'johansson-town.png',{type:'image/png'})]})){
    const share=document.createElement('button');share.textContent='Share';share.onclick=async()=>{try{await navigator.share({files:[new File([panel.blob],'johansson-town.png',{type:'image/png'})]});}catch(e){if(e.name!=='AbortError')announce('Sharing unavailable. Use Save PNG.');}};figure.append(share);
   }
   return figure;
  }));updateButtons();
 }
 const toBlob=image=>new Promise((resolve,reject)=>image.toBlob(blob=>blob?resolve(blob):reject(Error('PNG encoding failed')),'image/png'));
 async function capture(){
  if(!opened||busy||panels.length>=PHOTO_LIMIT)return;busy=true;updateButtons();const sizeBefore=renderer.getSize(new THREE.Vector2()),ratioBefore=renderer.getPixelRatio();let image;
  try{
   updateView();const w=1200,h=Math.round(w/FORMATS[field('format').value]);image=document.createElement('canvas');image.width=w;image.height=h;const ctx=image.getContext('2d');
   renderer.setPixelRatio(1);renderer.setSize(w,h,false);draw(view,stageGroup.position);ctx.drawImage(canvas,0,0,w,h);
   const text=document.createElement('canvas');text.width=w;text.height=h;drawCaptions(text.getContext('2d'),w,h,captions());ctx.drawImage(text,0,0);text.width=0;
  }catch(e){announce('Could not capture this view. Try again.');console.warn('Photo capture failed',e);}
  finally{renderer.setPixelRatio(ratioBefore);renderer.setSize(sizeBefore.x,sizeBefore.y,false);dirty=true;}
  try{if(image){const blob=await toBlob(image);panels.push({image,blob,url:URL.createObjectURL(blob)});film();announce(`Panel ${panels.length} captured. Save PNG or add another scene.`);}}
  catch(e){announce('PNG export failed. Your existing panels are still available.');}
  finally{busy=false;updateButtons();}
 }
 async function saveComic(){
  if(!panels.length||busy)return;busy=true;updateButtons();
  try{const layout=comicLayout(panels.length,field('layout').value),image=document.createElement('canvas');image.width=layout.width;image.height=layout.height;const ctx=image.getContext('2d');ctx.fillStyle='#fff8e7';ctx.fillRect(0,0,image.width,image.height);
   panels.forEach((p,i)=>{const c=layout.cells[i],s=Math.min(c.w/p.image.width,c.h/p.image.height),w=p.image.width*s,h=p.image.height*s;ctx.drawImage(p.image,c.x+(c.w-w)/2,c.y+(c.h-h)/2,w,h);ctx.strokeStyle='#263a36';ctx.lineWidth=2;ctx.strokeRect(c.x,c.y,c.w,c.h);});
   const blob=await toBlob(image);image.width=0;invalidateComic();comicURL=URL.createObjectURL(blob);const link=document.createElement('a');link.href=comicURL;link.download='johansson-town-comic.png';link.textContent='Download comic PNG';$('[data-comic-link]').append(link);link.click();announce('Comic ready. Use Download comic PNG if it did not save automatically.');
  }catch(e){announce('Could not export the comic. Your panels are still available.');}finally{busy=false;updateButtons();}
 }
 function close(){
  if(!opened)return;opened=false;ui.hidden=true;document.documentElement.classList.remove('photo-open');
  for(const [o,visible] of hidden)o.visible=visible;hidden.clear();clearActors();stageGroup.removeFromParent();canvasHome.parent.insertBefore(canvas,canvasHome.next?.parentNode===canvasHome.parent?canvasHome.next:null);canvas.style.cssText=originalStyle;
  onClose();if(focusBefore?.getClientRects?.().length)focusBefore.focus();else document.querySelector('#directoryButton')?.focus();
 }
 function open(){
  if(opened)return;context=getContext();focusBefore=document.activeElement;canvasHome={parent:canvas.parentNode,next:canvas.nextSibling};originalStyle=canvas.style.cssText;opened=true;dirty=true;
  try{onOpen();document.exitPointerLock?.();document.documentElement.classList.add('photo-open');ui.hidden=false;frame.prepend(canvas);stageGroup.position.copy(context.position);stageGroup.position.add(new THREE.Vector3(-Math.sin(context.yaw)*2.5,0,-Math.cos(context.yaw)*2.5));stageGroup.rotation.y=context.yaw;scene.add(stageGroup);
   for(const o of context.hide.filter(Boolean)){if(!hidden.has(o)){hidden.set(o,o.visible);o.visible=false;}}
   const names=[...new Set(['Johansson','Thuan',...context.cast.map(c=>c.name),...Object.keys(CAST_RECIPES)])];field('addCast').replaceChildren(...names.map(n=>new Option(n,n)));
   resetCamera();addActor('Johansson');addActor('Thuan');actors[0].x=-.45;actors[1].x=.45;actors.forEach(placeActor);selected=0;actorList();film();announce('Scene paused. Drag to orbit; arrange the cast below.');$('[data-close]').focus();render();
  }catch(e){close();throw e;}
 }
 field('actor').onchange=()=>{selected=Number(field('actor').value);syncActor();};
 for(const n of ['pose','expression'])field(n).onchange=()=>{const a=selectedActor();if(a){a[n]=field(n).value;poseStudioActor(a);}syncChips();};
 // Pose and expression as chips you tap, the way the rest of the town's menus work; the
 // selects stay underneath for keyboards and screen readers.
 const chipRows={};
 {const row=field('pose').closest('.photo-row');row.classList.add('photo-row-selects');
  for(const [n,list] of [['pose',POSES],['expression',EXPRESSIONS]]){
   const box=document.createElement('div');box.className='photo-chips';box.dataset.chips=n;box.setAttribute('role','group');box.setAttribute('aria-label',n==='pose'?'Pose':'Expression');
   const title=document.createElement('span');title.className='photo-chips-title';title.textContent=n==='pose'?'Pose':'Expression';box.append(title);
   for(const value of list){const b=document.createElement('button');b.type='button';b.className='photo-chip';b.dataset.value=value;b.textContent=POSE_LABELS[value]||value[0].toUpperCase()+value.slice(1);
    b.onclick=()=>{if(field(n).disabled)return;field(n).value=value;field(n).onchange();};box.append(b);}
   chipRows[n]=box;row.after(box);
  }
  chipRows.pose.after(chipRows.expression);}
 function syncChips(){for(const [n,box] of Object.entries(chipRows))for(const b of box.querySelectorAll('.photo-chip')){b.classList.toggle('on',b.dataset.value===field(n).value);b.disabled=field(n).disabled;}}
 for(const [n,key] of Object.entries({actorX:'x',actorY:'y',actorZ:'z',actorTurn:'turn',bubbleLift:'lift'}))field(n).oninput=()=>{const a=selectedActor();if(a){a[key]=Number(field(n).value);placeActor(a);}};
 field('speech').oninput=()=>{const a=selectedActor();if(a)a.speech=cleanCaption(field('speech').value);};
 for(const n of ['azimuth','elevation','distance','targetHeight','panX','panZ'])field(n).oninput=()=>{const v=Number(field(n).value);if(n==='azimuth')azimuth=v*Math.PI/180;if(n==='elevation')elevation=v*Math.PI/180;if(n==='distance')distance=v;if(n==='targetHeight')targetHeight=v;if(n==='panX')panX=v;if(n==='panZ')panZ=v;};
 $('[data-close]').onclick=close;$('[data-add]').onclick=()=>addActor(field('addCast').value);$('[data-remove]').onclick=()=>{const a=selectedActor();if(!a)return;a.holder.removeFromParent();a.avatar.dispose();actors.splice(selected,1);selected=Math.max(0,selected-1);actorList();};$('[data-reset]').onclick=resetCamera;$('[data-capture]').onclick=capture;$('[data-comic]').onclick=saveComic;field('layout').onchange=invalidateComic;
 let drag=null;frame.onpointerdown=e=>{if(e.button!==0||drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};frame.setPointerCapture(e.pointerId);};frame.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;azimuth=THREE.MathUtils.clamp(azimuth-(e.clientX-drag.x)*.008,-Math.PI,Math.PI);elevation=THREE.MathUtils.clamp(elevation+(e.clientY-drag.y)*.006,-.26,1.13);drag.x=e.clientX;drag.y=e.clientY;dirty=true;field('azimuth').value=String(azimuth*180/Math.PI);field('elevation').value=String(elevation*180/Math.PI);};frame.onpointerup=frame.onpointercancel=frame.onlostpointercapture=()=>drag=null;
 for(const event of ['input','change','click'])ui.addEventListener(event,()=>{dirty=true;});
 document.addEventListener('keydown',e=>{if(!opened)return;e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const all=[...ui.querySelectorAll('button,input,select,a[href],summary')].filter(o=>!o.disabled&&o.getClientRects().length),i=all.indexOf(document.activeElement);e.preventDefault();all[i<0?(e.shiftKey?all.length-1:0):(i+(e.shiftKey?-1:1)+all.length)%all.length]?.focus();}},true);
 return {open,close,render,get active(){return opened;},get panelCount(){return panels.length;}};
}
