import * as THREE from '../../vendor/three.module.js';
import {buildAvatar} from './build.js';
import {createAvatarAnimator} from './animate.js';
import {drawFace} from './face.js';
import {PALETTE,PARTS,normalizeRecipe,encodeRecipe,decodeRecipe,randomRecipe} from './recipe.js';
import {CAST_RECIPES} from './cast.js';

/**
 * The Shimanchu maker: where you make the person you walk the town as.
 *
 * Laid out the way a character maker on a games console is -- a turning figure on one
 * side, a row of tabs on the other, each tab a grid of parts drawn as they will look,
 * then colours, then a few sliders -- and made for a thumb first: every target is big,
 * nothing needs a hover, and the figure turns with a drag. The parts, pictures and
 * layout are the town's own.
 *
 * openCreator() works inside the game (from the Town book) and on its own page
 * (creator/), which is what a shared link opens.
 */

const FACE_TABS=new Set(['head','hair','eyes','brows','nose','mouth','extras','hat']);
const LABEL={
 crop:'Crop',sidepart:'Side part',bob:'Bob',long:'Long',ponytail:'Ponytail',braids:'Braids',bun:'Bun',spiky:'Spiky',perm:'Perm',buzz:'Buzz',afro:'Afro',horseshoe:'Horseshoe',bald:'Bald',
 round:'Round',dot:'Dot',almond:'Almond',sleepy:'Sleepy',lashes:'Lashes',narrow:'Narrow',sparkle:'Sparkle',gentle:'Gentle',
 straight:'Straight',arched:'Arched',thick:'Thick',thin:'Thin',worried:'Worried',bushy:'Bushy',none:'None',
 button:'Button',line:'Line',wide:'Wide',hook:'Hook',
 smile:'Smile',flat:'Flat',grin:'Grin',small:'Small',smirk:'Smirk',pout:'Pout',
 square:'Square',sun:'Shades',half:'Half-rim',
 moustache:'Moustache',walrus:'Walrus',stubble:'Stubble',beard:'Beard',goatee:'Goatee',
 tee:'T-shirt',kariyushi:'Kariyushi',polo:'Polo',blouse:'Blouse',jacket:'Jacket',apron:'Apron',smock:'Smock',
 shorts:'Shorts',trousers:'Trousers',skirt:'Skirt',longskirt:'Long skirt',
 cap:'Cap',captain:'Captain',police:'Police',helmet:'Helmet',straw:'Straw hat',headband:'Headband',kerchief:'Kerchief',
 flowers:'Flowers',stripes:'Stripes',dots:'Dots',
};

/**
 * Every tab: a part grid (drawn as a face or as the figure), colours, sliders, switches.
 * `at` is where in the recipe a control writes, as 'section.field'.
 */
const TABS=[
 {id:'body',icon:'🧍',name:'Body',controls:[
  {kind:'slider',at:'body.height',label:'Height'},{kind:'slider',at:'body.build',label:'Build'},
  {kind:'colours',at:'body.skin',label:'Skin',palette:PALETTE.skin}]},
 {id:'head',icon:'🙂',name:'Face',controls:[
  {kind:'slider',at:'head.size',label:'Head size'},{kind:'slider',at:'head.shape',label:'Round ↔ tall'},
  {kind:'slider',at:'blush',label:'Rosy cheeks'},{kind:'slider',at:'wrinkles',label:'Laughter lines'},
  {kind:'toggle',at:'freckles',label:'Freckles'},{kind:'toggle',at:'mole',label:'Beauty spot'}]},
 {id:'hair',icon:'💇',name:'Hair',controls:[
  {kind:'parts',at:'hair.style',list:PARTS.hair,draw:'figure'},
  {kind:'colours',at:'hair.colour',label:'Colour',palette:PALETTE.hair},
  {kind:'toggle',at:'hair.flip',label:'Part on the other side'}]},
 {id:'eyes',icon:'👀',name:'Eyes',controls:[
  {kind:'parts',at:'eyes.style',list:PARTS.eyes,draw:'face'},
  {kind:'colours',at:'eyes.colour',label:'Colour',palette:PALETTE.eyes},
  {kind:'slider',at:'eyes.size',label:'Size'},{kind:'slider',at:'eyes.spacing',label:'Closer ↔ apart'},
  {kind:'slider',at:'eyes.height',label:'Lower ↔ higher',invert:true},{kind:'slider',at:'eyes.tilt',label:'Tilt'}]},
 {id:'brows',icon:'〰️',name:'Brows',controls:[
  {kind:'parts',at:'brows.style',list:PARTS.brows,draw:'face'},
  {kind:'colours',at:'brows.colour',label:'Colour',palette:PALETTE.hair},
  {kind:'slider',at:'brows.size',label:'Size'},{kind:'slider',at:'brows.height',label:'Lower ↔ higher',invert:true},{kind:'slider',at:'brows.tilt',label:'Tilt'}]},
 {id:'nose',icon:'👃',name:'Nose',controls:[
  {kind:'parts',at:'nose.style',list:PARTS.nose,draw:'face'},
  {kind:'slider',at:'nose.size',label:'Size'},{kind:'slider',at:'nose.height',label:'Lower ↔ higher',invert:true}]},
 {id:'mouth',icon:'👄',name:'Mouth',controls:[
  {kind:'parts',at:'mouth.style',list:PARTS.mouth,draw:'face'},
  {kind:'colours',at:'mouth.colour',label:'Lips',palette:PALETTE.lips},
  {kind:'slider',at:'mouth.size',label:'Size'},{kind:'slider',at:'mouth.height',label:'Lower ↔ higher',invert:true}]},
 {id:'extras',icon:'👓',name:'Glasses & beard',controls:[
  {kind:'parts',at:'glasses.style',list:PARTS.glasses,draw:'face'},
  {kind:'colours',at:'glasses.colour',label:'Frames',palette:['#2b2b2b','#8a4a3a','#c8a060','#e06a7a','#3d6a8a','#d8342c']},
  {kind:'parts',at:'facial.style',list:PARTS.facial,draw:'face'},
  {kind:'colours',at:'facial.colour',label:'Beard',palette:PALETTE.hair}]},
 {id:'top',icon:'👕',name:'Top',controls:[
  {kind:'parts',at:'outfit.top',list:PARTS.top,draw:'figure'},
  {kind:'chips',at:'outfit.pattern',list:['none','flowers','stripes','dots'],label:'Print'},
  {kind:'colours',at:'outfit.topColour',label:'Colour',palette:PALETTE.cloth},
  {kind:'colours',at:'outfit.accent',label:'Ribbons & print',palette:PALETTE.cloth}]},
 {id:'bottom',icon:'👖',name:'Bottoms',controls:[
  {kind:'parts',at:'outfit.bottom',list:PARTS.bottom,draw:'figure'},
  {kind:'colours',at:'outfit.bottomColour',label:'Colour',palette:PALETTE.cloth},
  {kind:'colours',at:'outfit.shoes',label:'Shoes',palette:['#6d4a32','#2b2b2b','#f4f1ea','#d8342c','#3fa0c8','#f4d23c','#8fbf4a','#e98aa6']},
  {kind:'colours',at:'swim.colour',label:'Swimwear, for the onsen',palette:PALETTE.cloth}]},
 {id:'hat',icon:'👒',name:'Hat',controls:[
  {kind:'parts',at:'outfit.hat',list:PARTS.hat,draw:'figure'},
  {kind:'colours',at:'outfit.hatColour',label:'Colour',palette:PALETTE.cloth}]},
];

const POSES=[['idle','🧍','Stand'],['Wave','👋','Wave'],['Hop','😊','Happy'],['walk','🚶','Walk'],['Kachashi','💃','Dance'],['Bow','🙇','Bow'],['sit','🪑','Sit']];

const get=(r,at)=>at.split('.').reduce((o,k)=>o?.[k],r);
function set(r,at,value){const keys=at.split('.'),last=keys.pop();let o=r;for(const k of keys)o=o[k];o[last]=value;}

const CSS=`
.shm{position:fixed;inset:0;z-index:4000;display:grid;grid-template-rows:auto minmax(0,1fr) auto;grid-template-columns:minmax(0,1fr);overflow:hidden;background:linear-gradient(#cfe9ea,#fff4dc 55%);color:#293e48;font-family:"Avenir Next","Arial Rounded MT Bold","Yu Gothic",system-ui,sans-serif;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.shm *{box-sizing:border-box}
.shm button{font-family:inherit;cursor:pointer}
.shm-top{display:flex;align-items:center;gap:10px;padding:max(10px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) 8px max(14px,env(safe-area-inset-left))}
.shm-top h2{margin:0;font-size:clamp(18px,3.4vw,24px);color:#28594f;letter-spacing:-.02em;white-space:nowrap}
.shm-top h2 small{display:block;font-size:11px;letter-spacing:.09em;color:#775c4a;font-weight:800}
.shm-name{flex:1;min-width:0;max-width:260px;margin-left:auto;height:44px;padding:0 16px;border:2px solid #e6d8bd;border-radius:999px;background:#fffdf7;color:#293e48;font:inherit;font-size:16px;font-weight:800}
.shm-pill{min-height:44px;padding:8px 16px;border:2px solid #e6d8bd;border-radius:999px;background:#fffdf7;color:#52615c;font-weight:800;font-size:14px;white-space:nowrap}
.shm-main{display:grid;grid-template-columns:minmax(260px,42%) minmax(0,1fr);min-height:0;min-width:0}
.shm-main>*{min-width:0}
.shm-stage{position:relative;min-height:0;display:flex;flex-direction:column}
.shm-stage canvas{flex:1;width:100%;min-height:0;touch-action:none;cursor:grab}
.shm-poses{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:6px 10px 10px}
.shm-poses button{width:48px;height:48px;border:2px solid #fffdf2;border-radius:50%;background:#fff8e9;box-shadow:0 3px 0 #d9c7a2;font-size:22px;line-height:1}
.shm-poses button[aria-pressed=true]{background:#ffe1a4;box-shadow:0 3px 0 #ceb079}
.shm-stage .shm-dice{position:absolute;top:8px;left:10px;display:flex;gap:8px}
.shm-stage .shm-dice button{width:52px;height:52px;border:3px solid #fffdf2;border-radius:18px;background:#d7efdc;box-shadow:0 4px 0 #91b49d;font-size:24px}
.shm-panel{display:grid;grid-template-rows:auto 1fr;min-height:0;margin:0 12px 0 0;border:3px solid #fffdf2;border-radius:28px;background:#fff8e9;box-shadow:0 6px 0 #b9c6b5}
.shm-tabs{display:flex;gap:6px;overflow-x:auto;padding:10px;scrollbar-width:none;border-bottom:2px dashed #eadfc8}
.shm-tabs::-webkit-scrollbar{display:none}
.shm-tabs button{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:64px;min-height:60px;padding:6px 8px;border:2px solid transparent;border-radius:18px;background:transparent;color:#52615c;font-size:11px;font-weight:800}
.shm-tabs button span{font-size:24px;line-height:1.1}
.shm-tabs button[aria-selected=true]{background:#d7efdc;border-color:#98c7ae;color:#214b3b}
.shm-body{overflow-y:auto;padding:12px 16px 20px;scrollbar-width:thin}
.shm-body h4{margin:14px 2px 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#775c4a}
.shm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:10px}
.shm-grid button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 4px 8px;border:3px solid #eadfc8;border-radius:20px;background:#fffdf8;color:#52615c;font-size:11px;font-weight:800}
.shm-grid button canvas{width:68px;height:68px;border-radius:50%;background:#f3ecdc}
.shm-grid button[aria-pressed=true]{border-color:#e7a35a;background:#fff1d0;box-shadow:0 3px 0 #e2b474}
.shm-swatches{display:flex;flex-wrap:wrap;gap:10px}
.shm-swatches button{width:44px;height:44px;border:3px solid #fffdf2;border-radius:50%;box-shadow:0 0 0 2px #e6d8bd}
.shm-swatches button[aria-pressed=true]{box-shadow:0 0 0 3px #e7a35a;transform:scale(1.08)}
.shm-slider{display:grid;grid-template-columns:120px 1fr;align-items:center;gap:12px;margin:10px 2px}
.shm-slider span{font-size:13px;font-weight:800;color:#52615c}
.shm-slider input{width:100%;height:36px;accent-color:#2f6a5d}
.shm-chips{display:flex;flex-wrap:wrap;gap:8px}
.shm-chips button,.shm-toggle{min-height:44px;padding:8px 16px;border:2px solid #e6d8bd;border-radius:999px;background:#fffdf8;color:#52615c;font-weight:800;font-size:13px}
.shm-chips button[aria-pressed=true],.shm-toggle[aria-pressed=true]{background:#ffebbd;border-color:#e7c47f;color:#654a22}
.shm-toggle{display:block;margin:10px 0}
.shm-foot{display:flex;gap:10px;align-items:center;padding:10px max(14px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left))}
.shm-save{margin-left:auto;min-height:52px;padding:10px 26px;border:3px solid #fffdf2;border-radius:20px;background:#2f6a5d;color:#fff;box-shadow:0 5px 0 #1d4a40;font-size:17px;font-weight:800}
.shm-share{position:fixed;inset:0;z-index:4001;display:grid;place-items:center;padding:18px;background:rgba(29,48,57,.35)}
.shm-share>div{width:min(520px,100%);padding:22px;border:3px solid #fffdf2;border-radius:28px;background:#fff8e9;box-shadow:0 8px 0 #b9c6b5}
.shm-share h3{margin:0 0 8px;color:#28594f}
.shm-share p{margin:0 0 12px;font-size:14px;line-height:1.5}
.shm-share textarea{width:100%;height:84px;padding:10px;border:2px solid #e6d8bd;border-radius:16px;background:#fffdf7;font:12px ui-monospace,monospace;resize:none;overflow-wrap:anywhere}
.shm-share .row{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
@media (max-width:760px),(orientation:portrait){
 .shm-main{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(210px,40%) minmax(0,1fr)}
 .shm-panel{margin:0 10px}
 .shm-top h2 small{display:none}
 .shm-poses{gap:6px;padding:4px 8px 8px}
 .shm-poses button{width:42px;height:42px;font-size:19px}
}
@media (max-width:520px){
 .shm-top h2{display:none}
 .shm-name{max-width:none}
 .shm-foot{gap:8px}
 .shm-foot .shm-pill{padding:8px 12px;font-size:13px}
 .shm-save{flex:1;min-width:0;padding:10px 12px;font-size:15px;white-space:normal;line-height:1.2}
 .shm-grid{grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:8px}
 .shm-grid button canvas{width:60px;height:60px}
 .shm-slider{grid-template-columns:96px 1fr}
}
`;

/**
 * @param {object} options
 * @param {object} [options.recipe] who to start from
 * @param {(recipe:object)=>void} [options.onSave]
 * @param {()=>void} [options.onClose]
 * @param {string} [options.saveLabel]
 * @param {(code:string)=>string} [options.shareLink] a link that opens a recipe code
 * @returns {{close:()=>void, get recipe():object}}
 */
export function openCreator({recipe:start=CAST_RECIPES.Johansson,onSave=()=>{},onClose=()=>{},saveLabel='Save and play',shareLink=null}={}){
 if(!document.getElementById('shimanchu-css')){const style=document.createElement('style');style.id='shimanchu-css';style.textContent=CSS;document.head.append(style);}
 let recipe=normalizeRecipe(start);const history=[];
 let tab='body',pose='idle';
 const el=(tag,props={},...children)=>{const e=Object.assign(document.createElement(tag),props);for(const c of children)if(c!=null)e.append(c);return e;};

 // ----- Layout -----
 const root=el('div',{className:'shm',role:'dialog',ariaLabel:'Make your Shimanchu'});
 const name=el('input',{className:'shm-name',value:recipe.name||'',placeholder:'Name',maxLength:24,ariaLabel:'Name'});
 const close=el('button',{className:'shm-pill',textContent:'✕ Close'});
 root.append(el('div',{className:'shm-top'},el('h2',{},el('small',{textContent:'SHIMANCHU MAKER · 島人'}),'Make your islander'),name,close));
 const canvas=el('canvas',{ariaLabel:'Your islander. Drag to turn.'});
 const dice=el('button',{textContent:'🎲',title:'Somebody new',ariaLabel:'Somebody new'}),undo=el('button',{textContent:'↶',title:'Undo',ariaLabel:'Undo'});
 const poses=el('div',{className:'shm-poses'});
 const stage=el('div',{className:'shm-stage'},canvas,el('div',{className:'shm-dice'},dice,undo),poses);
 const tabs=el('div',{className:'shm-tabs',role:'tablist'}),body=el('div',{className:'shm-body'});
 root.append(el('div',{className:'shm-main'},stage,el('div',{className:'shm-panel'},tabs,body)));
 const share=el('button',{className:'shm-pill',textContent:'🔗 Share'}),reset=el('button',{className:'shm-pill',textContent:'Start over'});
 const save=el('button',{className:'shm-save',textContent:saveLabel});
 root.append(el('div',{className:'shm-foot'},share,reset,save));
 document.body.append(root);
 // Keys typed here are for the name box, not for walking about behind the maker.
 const swallow=e=>{if(root.isConnected)e.stopPropagation();if(e.key==='Escape'&&e.type==='keydown')finish(false);};
 window.addEventListener('keydown',swallow,true);window.addEventListener('keyup',swallow,true);

 // ----- The figure -----
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene();
 scene.add(new THREE.HemisphereLight(0xffffff,0xb8a88a,2.2));
 const sun=new THREE.DirectionalLight(0xfff4e0,1.9);sun.position.set(2,4,5);scene.add(sun);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(.62,40),new THREE.MeshBasicMaterial({color:0xe9dcc0}));floor.rotation.x=-Math.PI/2;scene.add(floor);
 const holder=new THREE.Group();scene.add(holder);
 const camera=new THREE.PerspectiveCamera(28,1,.05,50);
 let avatar=null,animator=null,spin=0,spinVelocity=0,dragging=null,frame=0,dirty=true,clock=performance.now(),focus=0;
 function rebuild(){
  if(avatar){avatar.root.removeFromParent();avatar.dispose();}
  avatar=buildAvatar(recipe,{shadows:false,faceSize:512});animator=createAvatarAnimator(avatar);holder.add(avatar.root);
  if(pose!=='idle'&&pose!=='walk'&&pose!=='sit')animator.play(pose);
 }
 function resize(){
  const w=canvas.clientWidth||300,h=canvas.clientHeight||300;
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 }
 function aim(dt){
  const m=avatar.measure,want=FACE_TABS.has(tab)?1:0;focus+=(want-focus)*Math.min(1,dt*5);
  // Whole figure, or in close on the face for the face tabs.
  const fullY=m.H*.52,fullD=m.H*2.5+1.2/camera.aspect*.4,faceY=m.headCentre-m.Rh*.18,faceD=m.Rh*8.6;
  const y=THREE.MathUtils.lerp(fullY,faceY,focus),d=THREE.MathUtils.lerp(fullD,faceD,focus);
  camera.position.set(0,y+.08*(1-focus),d);camera.lookAt(0,y,0);
 }
 function loop(){
  frame=requestAnimationFrame(loop);
  const now=performance.now(),dt=Math.min(.05,(now-clock)/1000);clock=now;
  if(dirty){rebuild();dirty=false;}
  if(!dragging){spin+=spinVelocity*dt;spinVelocity*=Math.exp(-dt*3);if(Math.abs(spinVelocity)<.05)spin+=(0-spin)*Math.min(1,dt*1.5)*(pose==='walk'?0:1);}
  // A body faces -z in the town; here it turns round to face you.
  holder.rotation.y=Math.PI+spin+(pose==='walk'?now/1000*.6:0);
  animator.update(dt,{speed:pose==='walk'?1.2:0,seated:pose==='sit',seatHeight:.42,expression:pose==='Hop'?'happy':pose==='Kachashi'?'laugh':'smile'});
  aim(dt);renderer.render(scene,camera);
 }
 canvas.addEventListener('pointerdown',e=>{dragging={x:e.clientX,spin,t:performance.now()};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=(e.clientX-dragging.x)/Math.max(120,canvas.clientWidth)*Math.PI*1.6;spinVelocity=(spin-(dragging.spin+dx))/-.016;spin=dragging.spin+dx;spinVelocity=THREE.MathUtils.clamp(spinVelocity,-8,8);});
 const endDrag=()=>{dragging=null;};canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
 const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;observer?.observe(canvas);resize();

 // ----- Part pictures -----
 // Faces are drawn flat, straight from the face painter. Hair, clothes and hats are the
 // figure itself, rendered small, a corner of the same canvas at a time.
 const thumbs=new Map();
 function faceThumb(r,c){
  const src=document.createElement('canvas');src.width=src.height=256;drawFace(src.getContext('2d'),r,{expression:'neutral',size:256});
  const ctx=c.getContext('2d');ctx.drawImage(src,40,34,176,176,0,0,c.width,c.height);
 }
 const thumbCamera=new THREE.PerspectiveCamera(30,1,.05,20),thumbScene=new THREE.Scene();
 thumbScene.add(new THREE.HemisphereLight(0xffffff,0xb8a88a,2.2));const thumbSun=sun.clone();thumbScene.add(thumbSun);
 function figureThumb(r,c,at){
  const a=buildAvatar(r,{shadows:false,faceSize:128}),m=a.measure;
  a.root.rotation.y=.45;thumbScene.add(a.root);a.root.updateMatrixWorld(true);
  const onHead=at.startsWith('hair')||at==='outfit.hat';
  const y=onHead?m.headCentre+m.Rh*.2:at==='outfit.bottom'?m.hipY*.7:m.hipY+m.torso*.55,d=onHead?m.Rh*5.4:at==='outfit.bottom'?m.H*.95:m.H*.85;
  thumbCamera.position.set(0,y+(onHead?m.Rh*.4:.1),d);thumbCamera.lookAt(0,y,0);
  const px=c.width;renderer.setScissorTest(true);renderer.setViewport(0,0,px/renderer.getPixelRatio(),px/renderer.getPixelRatio());renderer.setScissor(0,0,px/renderer.getPixelRatio(),px/renderer.getPixelRatio());
  renderer.setClearColor(0xf3ecdc,1);renderer.clear();renderer.render(thumbScene,thumbCamera);
  const ctx=c.getContext('2d'),H=renderer.domElement.height;ctx.clearRect(0,0,px,px);ctx.drawImage(renderer.domElement,0,H-px,px,px,0,0,px,px);
  renderer.setScissorTest(false);renderer.setClearColor(0x000000,0);resize();
  a.root.removeFromParent();a.dispose();
 }
 function drawThumb(control,value,c){
  const r=structuredClone(recipe);set(r,control.at,value);
  // Show a hat on the hat tab only, and a bare head for the hairstyles.
  if(control.at.startsWith('hair'))r.outfit.hat='none';
  const key=control.at+'|'+value+'|'+JSON.stringify(control.draw==='face'?{...r,outfit:0,body:{skin:r.body.skin}}:r);
  if(thumbs.has(key)){c.getContext('2d').drawImage(thumbs.get(key),0,0);return;}
  if(control.draw==='face')faceThumb(r,c);else figureThumb(r,c,control.at);
  const copy=document.createElement('canvas');copy.width=c.width;copy.height=c.height;copy.getContext('2d').drawImage(c,0,0);thumbs.set(key,copy);
 }

 // ----- The panel -----
 function change(at,value){
  if(get(recipe,at)===value)return;
  history.push(structuredClone(recipe));if(history.length>60)history.shift();
  set(recipe,at,value);recipe=normalizeRecipe(recipe);dirty=true;
 }
 function renderTabs(){
  tabs.replaceChildren(...TABS.map(t=>{const b=el('button',{role:'tab'},el('span',{textContent:t.icon}),t.name);b.setAttribute('aria-selected',String(t.id===tab));b.onclick=()=>{tab=t.id;renderTabs();renderBody();};return b;}));
 }
 let pictureQueue=[],pictureFrame=0;
 function renderBody(){
  cancelAnimationFrame(pictureFrame);pictureQueue=[];
  const t=TABS.find(x=>x.id===tab);body.replaceChildren();
  for(const control of t.controls){
   if(control.label)body.append(el('h4',{textContent:control.label}));
   if(control.kind==='parts'){
    const grid=el('div',{className:'shm-grid'});
    for(const value of control.list){
     const c=el('canvas',{width:136,height:136});
     const b=el('button',{},c,LABEL[value]||value);b.setAttribute('aria-pressed',String(get(recipe,control.at)===value));
     b.onclick=()=>{change(control.at,value);for(const x of grid.children)x.setAttribute('aria-pressed',String(x===b));};
     grid.append(b);pictureQueue.push(()=>drawThumb(control,value,c));
    }
    body.append(grid);
   }else if(control.kind==='colours'){
    const row=el('div',{className:'shm-swatches'});
    for(const hex of control.palette){const b=el('button',{ariaLabel:hex});b.style.background=hex;b.setAttribute('aria-pressed',String(get(recipe,control.at)===hex));
     b.onclick=()=>{change(control.at,hex);for(const x of row.children)x.setAttribute('aria-pressed',String(x===b));if(t.controls.some(c=>c.kind==='parts'))renderPictures();};row.append(b);}
    body.append(row);
   }else if(control.kind==='slider'){
    const input=el('input',{type:'range',min:0,max:1,step:.01,value:control.invert?1-get(recipe,control.at):get(recipe,control.at),ariaLabel:control.label});
    input.oninput=()=>change(control.at,control.invert?1-+input.value:+input.value);
    body.lastChild.remove();body.append(el('label',{className:'shm-slider'},el('span',{textContent:control.label}),input));
   }else if(control.kind==='toggle'){
    const b=el('button',{className:'shm-toggle',textContent:control.label});b.setAttribute('aria-pressed',String(!!get(recipe,control.at)));
    b.onclick=()=>{change(control.at,!get(recipe,control.at));b.setAttribute('aria-pressed',String(!!get(recipe,control.at)));};
    body.lastChild.remove();body.append(b);
   }else if(control.kind==='chips'){
    const row=el('div',{className:'shm-chips'});
    for(const value of control.list){const b=el('button',{textContent:LABEL[value]||value});b.setAttribute('aria-pressed',String(get(recipe,control.at)===value));b.onclick=()=>{change(control.at,value);for(const x of row.children)x.setAttribute('aria-pressed',String(x===b));renderPictures();};row.append(b);}
    body.append(row);
   }
  }
  paintQueued();
 }
 // Pictures are drawn a few a frame, so a tab opens at once and fills in.
 function paintQueued(){pictureFrame=requestAnimationFrame(()=>{const t0=performance.now();while(pictureQueue.length&&performance.now()-t0<24)pictureQueue.shift()();if(pictureQueue.length)paintQueued();});}
 let picturesDue=0;
 function renderPictures(){clearTimeout(picturesDue);picturesDue=setTimeout(()=>{const y=body.scrollTop;renderBody();body.scrollTop=y;},180);}
 function renderPoses(){
  poses.replaceChildren(...POSES.map(([id,icon,label])=>{const b=el('button',{textContent:icon,title:label,ariaLabel:label});b.setAttribute('aria-pressed',String(pose===id));
   b.onclick=()=>{pose=id;renderPoses();if(!['idle','walk','sit'].includes(id))animator.play(id);else animator.stop();};return b;}));
 }

 // ----- Buttons -----
 name.oninput=()=>{recipe.name=name.value.slice(0,24);};
 dice.onclick=()=>{history.push(structuredClone(recipe));const r=randomRecipe();r.name=recipe.name;recipe=normalizeRecipe(r);dirty=true;renderBody();};
 undo.onclick=()=>{const r=history.pop();if(!r)return;recipe=r;name.value=recipe.name||'';dirty=true;renderBody();};
 reset.onclick=()=>{history.push(structuredClone(recipe));recipe=normalizeRecipe({...CAST_RECIPES.Johansson,name:recipe.name});dirty=true;renderBody();};
 share.onclick=()=>{
  const code=encodeRecipe({...recipe,name:name.value});const link=shareLink?.(code);
  const text=el('textarea',{value:link||code,readOnly:true});
  const paste=el('textarea',{placeholder:'Paste a code or link here to try it on'});
  const copy=el('button',{className:'shm-pill',textContent:'Copy'}),use=el('button',{className:'shm-pill',textContent:'Try the pasted one'}),done=el('button',{className:'shm-pill',textContent:'Done'});
  const layer=el('div',{className:'shm-share'},el('div',{},el('h3',{textContent:'Share your islander'}),el('p',{textContent:link?'Send this link and it opens the maker with your islander in it.':'This code is your islander. Anyone can paste it into their maker.'}),text,el('div',{className:'row'},copy),el('h3',{textContent:'Try someone else’s'}),paste,el('div',{className:'row'},use,done)));
  copy.onclick=async()=>{try{await navigator.clipboard.writeText(text.value);copy.textContent='Copied ✓';}catch{text.select();}};
  use.onclick=()=>{const raw=paste.value.trim(),code=raw.includes('=')?new URL(raw,location.href).searchParams.get('r')||new URL(raw,location.href).searchParams.get('avatar'):raw,r=decodeRecipe(code||'');
   if(!r){use.textContent='That code did not work';return;}history.push(structuredClone(recipe));recipe=r;name.value=r.name||'';dirty=true;renderBody();layer.remove();};
  done.onclick=()=>layer.remove();root.append(layer);
 };
 function finish(saving){
  if(!root.isConnected)return;
  cancelAnimationFrame(frame);cancelAnimationFrame(pictureFrame);clearTimeout(picturesDue);observer?.disconnect();
  window.removeEventListener('keydown',swallow,true);window.removeEventListener('keyup',swallow,true);
  const out=normalizeRecipe({...recipe,name:name.value});
  avatar?.dispose();renderer.dispose();renderer.forceContextLoss?.();root.remove();
  if(saving)onSave(out);onClose(out,saving);
 }
 close.onclick=()=>finish(false);save.onclick=()=>finish(true);

 renderTabs();renderBody();renderPoses();loop();
 return {close:()=>finish(false),get recipe(){return normalizeRecipe({...recipe,name:name.value});},get root(){return root;}};
}
