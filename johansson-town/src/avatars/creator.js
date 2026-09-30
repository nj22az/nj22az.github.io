import * as THREE from '../../vendor/three.module.js';
import {buildAvatar} from './build.js';
import {createAvatarAnimator} from './animate.js';
import {drawFace} from './face.js';
import {PALETTE,PARTS,normalizeRecipe,encodeRecipe,decodeRecipe,randomRecipe} from './recipe.js';
import {CAST_RECIPES} from './cast.js';
import {svg} from '../ui/icons.js';

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

const FACE_TABS=new Set(['head','hair','eyes','brows','nose','mouth','extras','hat','accessories']);
const LABEL={
 crop:'Crop',sidepart:'Side part',bob:'Bob',long:'Long',ponytail:'Ponytail',braids:'Braids',bun:'Bun',spiky:'Spiky',perm:'Perm',buzz:'Buzz',afro:'Afro',horseshoe:'Horseshoe',bald:'Bald',
 round:'Round',dot:'Dot',almond:'Almond',sleepy:'Sleepy',lashes:'Lashes',narrow:'Narrow',sparkle:'Sparkle',gentle:'Gentle',
 straight:'Straight',arched:'Arched',thick:'Thick',thin:'Thin',worried:'Worried',bushy:'Bushy',none:'None',
 button:'Button',line:'Line',wide:'Wide',hook:'Hook',
 smile:'Smile',flat:'Flat',grin:'Grin',small:'Small',smirk:'Smirk',pout:'Pout',
 square:'Square',oval:'Oval',heart:'Heart',sun:'Shades',half:'Half-rim',
 moustache:'Moustache',walrus:'Walrus',stubble:'Stubble',beard:'Beard',goatee:'Goatee',
 tee:'T-shirt',kariyushi:'Kariyushi',polo:'Polo',blouse:'Blouse',jacket:'Jacket',apron:'Apron',smock:'Smock',
 shorts:'Shorts',trousers:'Trousers',skirt:'Skirt',longskirt:'Long skirt',
 cap:'Cap',captain:'Captain',police:'Police',helmet:'Helmet',straw:'Straw hat',headband:'Headband',kerchief:'Kerchief',
 beanie:'Beanie',beret:'Beret',bucket:'Bucket hat',ribbon:'Hair bow',studs:'Studs',hoops:'Hoops',pendant:'Pendant',scarf:'Scarf',
 flowers:'Flowers',stripes:'Stripes',dots:'Dots',
};

/**
 * Every tab: a part grid (drawn as a face or as the figure), colours, sliders, switches.
 * `at` is where in the recipe a control writes, as 'section.field'.
 */
const TABS=[
 {id:'body',name:'Body',controls:[
  {kind:'slider',at:'body.height',label:'Height'},{kind:'slider',at:'body.build',label:'Build'},
  {kind:'colours',at:'body.skin',label:'Skin',palette:PALETTE.skin}]},
 {id:'head',name:'Face',controls:[
  {kind:'chips',at:'head.form',label:'Face shape',list:PARTS.head},
  {kind:'slider',at:'head.size',label:'Head size'},{kind:'slider',at:'head.shape',label:'Narrow ↔ broad'},
  {kind:'slider',at:'head.jaw',label:'Jaw width'},{kind:'slider',at:'head.cheeks',label:'Cheek fullness'},
  {kind:'slider',at:'blush',label:'Rosy cheeks'},{kind:'slider',at:'wrinkles',label:'Laughter lines'},
  {kind:'toggle',at:'freckles',label:'Freckles'},{kind:'toggle',at:'mole',label:'Beauty spot'}]},
 {id:'hair',name:'Hair',controls:[
  {kind:'parts',at:'hair.style',list:PARTS.hair,draw:'figure'},
  {kind:'colours',at:'hair.colour',label:'Colour',palette:PALETTE.hair},
  {kind:'toggle',at:'hair.flip',label:'Part on the other side'}]},
 {id:'eyes',name:'Eyes',controls:[
  {kind:'parts',at:'eyes.style',list:PARTS.eyes,draw:'face'},
  {kind:'colours',at:'eyes.colour',label:'Colour',palette:PALETTE.eyes},
  {kind:'slider',at:'eyes.size',label:'Size'},{kind:'slider',at:'eyes.width',label:'Eye width'},{kind:'slider',at:'eyes.spacing',label:'Closer ↔ apart'},
  {kind:'slider',at:'eyes.height',label:'Lower ↔ higher',invert:true},{kind:'slider',at:'eyes.tilt',label:'Tilt'}]},
 {id:'brows',name:'Brows',controls:[
  {kind:'parts',at:'brows.style',list:PARTS.brows,draw:'face'},
  {kind:'colours',at:'brows.colour',label:'Colour',palette:PALETTE.hair},
  {kind:'slider',at:'brows.size',label:'Size'},{kind:'slider',at:'brows.spacing',label:'Brow spacing'},{kind:'slider',at:'brows.height',label:'Lower ↔ higher',invert:true},{kind:'slider',at:'brows.tilt',label:'Tilt'}]},
 {id:'nose',name:'Nose',controls:[
  {kind:'parts',at:'nose.style',list:PARTS.nose,draw:'face'},
  {kind:'slider',at:'nose.size',label:'Size'},{kind:'slider',at:'nose.x',label:'Left / right'},{kind:'slider',at:'nose.height',label:'Lower ↔ higher',invert:true}]},
 {id:'mouth',name:'Mouth',controls:[
  {kind:'parts',at:'mouth.style',list:PARTS.mouth,draw:'face'},
  {kind:'colours',at:'mouth.colour',label:'Lips',palette:PALETTE.lips},
  {kind:'slider',at:'mouth.size',label:'Size'},{kind:'slider',at:'mouth.width',label:'Mouth width'},{kind:'slider',at:'mouth.x',label:'Left / right'},{kind:'slider',at:'mouth.height',label:'Lower ↔ higher',invert:true}]},
 {id:'extras',name:'Glasses & beard',controls:[
  {kind:'parts',at:'glasses.style',list:PARTS.glasses,draw:'face'},
  {kind:'colours',at:'glasses.colour',label:'Frames',palette:['#2b2b2b','#8a4a3a','#c8a060','#e06a7a','#3d6a8a','#d8342c']},
  {kind:'parts',at:'facial.style',list:PARTS.facial,draw:'face'},
  {kind:'colours',at:'facial.colour',label:'Beard',palette:PALETTE.hair}]},
 {id:'top',name:'Top',controls:[
  {kind:'parts',at:'outfit.top',list:PARTS.top,draw:'figure'},
  {kind:'chips',at:'outfit.pattern',list:['none','flowers','stripes','dots'],label:'Print'},
  {kind:'colours',at:'outfit.topColour',label:'Colour',palette:PALETTE.cloth},
  {kind:'colours',at:'outfit.accent',label:'Ribbons & print',palette:PALETTE.cloth}]},
 {id:'bottom',name:'Bottoms',controls:[
  {kind:'parts',at:'outfit.bottom',list:PARTS.bottom,draw:'figure'},
  {kind:'colours',at:'outfit.bottomColour',label:'Colour',palette:PALETTE.cloth},
  {kind:'colours',at:'outfit.shoes',label:'Shoes',palette:['#6d4a32','#2b2b2b','#f4f1ea','#d8342c','#3fa0c8','#f4d23c','#8fbf4a','#e98aa6']},
  {kind:'colours',at:'swim.colour',label:'Swimwear, for the onsen',palette:PALETTE.cloth}]},
 {id:'accessories',name:'Accessories',controls:[
  {kind:'parts',at:'accessories.earrings',label:'Earrings',list:PARTS.earrings,draw:'figure'},
  {kind:'parts',at:'accessories.neckwear',label:'Neckwear',list:PARTS.neckwear,draw:'figure'},
  {kind:'toggle',at:'accessories.pin',label:'Lapel pin'},
  {kind:'colours',at:'accessories.colour',label:'Accessory colour',palette:PALETTE.cloth}]},
 {id:'hat',name:'Hats & bows',controls:[
  {kind:'parts',at:'outfit.hat',list:PARTS.hat,draw:'figure'},
  {kind:'colours',at:'outfit.hatColour',label:'Colour',palette:PALETTE.cloth}]},
];

for(const t of TABS){
 if(!['eyes','brows','nose','mouth'].includes(t.id))continue;
 t.controls.splice(1,0,{kind:'position',label:'Position',at:t.id+'.height',horizontal:t.id+(t.id==='eyes'||t.id==='brows'?'.spacing':'.x'),paired:t.id==='eyes'||t.id==='brows'});
}

const POSES=[['idle','Stand'],['Wave','Wave'],['Hop','Happy'],['walk','Walk'],['Kachashi','Dance'],['Bow','Bow'],['sit','Sit']];

const get=(r,at)=>at.split('.').reduce((o,k)=>o?.[k],r);
function set(r,at,value){const keys=at.split('.'),last=keys.pop();let o=r;for(const k of keys)o=o[k];o[last]=value;}

const CSS=`
.shm{position:fixed;inset:0;z-index:4000;display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden;background:linear-gradient(160deg,#d9f1fa,#fffaf0 65%);color:var(--isle-ink,#3b3f55);font-family:var(--isle-font,"M PLUS Rounded 1c",system-ui,sans-serif);-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.shm *{box-sizing:border-box;min-width:0}
.shm button,.shm select,.shm input{font-family:inherit}
.shm button{cursor:pointer}
.shm button:focus-visible,.shm input:focus-visible,.shm select:focus-visible,.shm textarea:focus-visible{outline:3px solid #2a8fcc;outline-offset:2px}
.shm button:disabled{opacity:.4;cursor:default}
.shm .ui-icon{flex-shrink:0;width:20px;height:20px}
.shm-top{display:flex;align-items:center;gap:12px;padding:max(8px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) 8px max(12px,env(safe-area-inset-left))}
.shm-top h2{margin:0;font-size:20px;white-space:nowrap}
.shm-name{flex:1;max-width:280px;margin-left:auto;height:44px;padding:0 14px;border:1px solid #e6e1d6;border-radius:14px;background:#fffaf0;color:inherit;font-size:16px}
.shm-pill,.shm-save,.shm-select{min-height:44px;padding:8px 14px;border:1px solid #e6e1d6;border-radius:14px;background:#fffaf0;color:inherit;font-size:14px;font-weight:800}
.shm-pill{display:inline-flex;align-items:center;justify-content:center;gap:7px}
.shm-main{display:grid;grid-template-columns:minmax(0,40%) minmax(0,1fr);min-height:0}
.shm-stage{position:relative;min-height:0;overflow:hidden}
.shm-stage>canvas{display:block;width:100%;height:100%;touch-action:none;cursor:grab}
.shm-dice{position:absolute;top:8px;left:12px;display:flex;gap:8px}
.shm-dice button{display:grid;place-items:center;width:44px;height:44px;border:1px solid #e6e1d6;border-radius:14px;background:#fffaf0e8;color:inherit}
.shm-poses{position:absolute;bottom:8px;left:12px;right:12px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:12px;font-weight:800}
.shm-poses .shm-select{width:110px}
.shm-panel{display:grid;grid-template-rows:auto minmax(0,1fr);min-height:0;margin:0 12px 0 0;border:1px solid #e6e1d6;border-radius:20px;background:#fffaf0;overflow:hidden}
.shm-tabs{display:flex;overflow-x:auto;padding:8px;gap:4px;border-bottom:1px solid #e6e1d6}
.shm-tabs button{flex:0 0 auto;min-height:44px;padding:8px 12px;border:0;border-radius:12px;background:transparent;color:inherit;font-size:13px;font-weight:800}
.shm-tabs button[aria-selected=true]{background:#45b7f0;color:#fff}
.shm-category{display:none;padding:8px 12px;border-bottom:1px solid #e6e1d6;align-items:center;gap:10px;font-size:13px;font-weight:800}
.shm-category select{flex:1;width:100%}
.shm-body{overflow-y:auto;overscroll-behavior:contain;padding:12px 16px 20px;scrollbar-width:thin}
.shm-body h4{margin:14px 0 8px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#686675}
.shm-body h4:first-child{margin-top:0}
.shm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:8px}
.shm-grid button{display:flex;flex-direction:column;align-items:center;gap:4px;min-height:90px;padding:6px 4px;border:2px solid #e6e1d6;border-radius:14px;background:#fff;color:inherit;font-size:11px;font-weight:800}
.shm-grid button canvas{width:60px;height:60px;border-radius:12px;background:#f3ecdc}
.shm-grid button[aria-pressed=true]{border-color:#2a8fcc;background:#e1f4ff}
.shm-swatches{display:flex;flex-wrap:wrap;gap:10px;padding:3px}
.shm-swatches button{width:44px;height:44px;border:4px solid #fff;border-radius:50%;box-shadow:0 0 0 1px #e6e1d6}
.shm-swatches button[aria-pressed=true]{box-shadow:0 0 0 3px #2a8fcc}
.shm-slider{display:grid;grid-template-columns:110px minmax(0,1fr);align-items:center;gap:10px;margin:8px 0}
.shm-slider span{font-size:12px;font-weight:800}
.shm-slider input{width:100%;height:44px;margin:0;accent-color:#2a8fcc}
.shm-chips{display:flex;flex-wrap:wrap;gap:8px}
.shm-chips button,.shm-toggle{min-height:44px;padding:8px 14px;border:1px solid #e6e1d6;border-radius:12px;background:#fff;color:inherit;font-size:13px;font-weight:800}
.shm-chips button[aria-pressed=true],.shm-toggle[aria-pressed=true]{background:#e1f4ff;border-color:#2a8fcc}
.shm-toggle{display:block;margin:10px 0}
.shm-foot{display:flex;gap:8px;align-items:center;padding:8px max(12px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left))}
.shm-save{margin-left:auto;background:#45b7f0;border-color:#2a8fcc;color:#fff;box-shadow:0 3px 0 #2a8fcc}
.shm-share{position:absolute;inset:0;z-index:1;display:grid;place-items:center;padding:12px;background:#25374680}
.shm-share>div{width:min(520px,100%);max-height:100%;overflow-y:auto;overscroll-behavior:contain;padding:20px;border:1px solid #e6e1d6;border-radius:20px;background:#fffaf0}
.shm-share h3{margin:0 0 8px}
.shm-share p{margin:0 0 12px;font-size:13px;line-height:1.5}
.shm-share textarea{width:100%;height:72px;padding:10px;border:1px solid #e6e1d6;border-radius:12px;background:#fff;font:16px ui-monospace,monospace;resize:none;overflow-wrap:anywhere}
.shm-share .row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 16px}
@media(max-width:760px){
 .shm-top h2{font-size:16px}
 .shm-tabs{display:none}.shm-category{display:flex}
 .shm-main{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,36%) minmax(0,1fr)}
 .shm-panel{margin:0 10px}.shm-body{padding:12px}
 .shm-poses{justify-content:flex-end}.shm-poses>span{display:none}
 .shm-poses{left:auto;right:10px;bottom:8px}
 .shm-slider{grid-template-columns:100px minmax(0,1fr)}
}
@media(max-width:520px){.shm-top h2{display:none}.shm-name{max-width:none}.shm-foot .shm-pill{padding:8px 10px}.shm-save{flex:1;padding:8px;font-size:13px}}
@media(max-height:500px) and (orientation:portrait){.shm-main{grid-template-rows:minmax(0,28%) minmax(0,1fr)}}
@media(max-height:500px) and (orientation:landscape){
 .shm-main{grid-template-columns:minmax(0,35%) minmax(0,1fr);grid-template-rows:minmax(0,1fr)}
 .shm-tabs{display:none}.shm-category{display:flex}.shm-top h2{font-size:16px}
 .shm-panel{margin-right:10px}.shm-top,.shm-foot{padding-top:4px;padding-bottom:4px}
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
 const previousFocus=document.activeElement;
 const root=el('div',{className:'shm',role:'dialog',ariaModal:'true',ariaLabel:'Make your islander'});
 const iconButton=(icon,label,props={})=>{const b=el('button',{type:'button',ariaLabel:label,title:label,...props});b.innerHTML=svg(icon);return b;};
 const name=el('input',{className:'shm-name',value:recipe.name||'',placeholder:'Name',maxLength:24,ariaLabel:'Name'});
 const close=iconButton('close','Close',{className:'shm-pill'});
 root.append(el('div',{className:'shm-top'},el('h2',{textContent:'Make your islander'}),name,close));
 const canvas=el('canvas',{ariaLabel:'Your islander. Drag to turn.'});
 const dice=iconButton('shuffle','Randomise appearance'),undo=iconButton('undo','Undo',{disabled:true});
 const poses=el('div',{className:'shm-poses'});
 const stage=el('div',{className:'shm-stage'},canvas,el('div',{className:'shm-dice'},dice,undo),poses);
 const category=el('select',{className:'shm-select',ariaLabel:'Appearance category'},...TABS.map(t=>el('option',{value:t.id,textContent:t.name})));
 const categoryRow=el('label',{className:'shm-category'},'Edit',category);
 const tabs=el('div',{className:'shm-tabs',role:'tablist',ariaLabel:'Appearance category'}),body=el('div',{className:'shm-body',id:'shm-body',role:'tabpanel'});
 const panelHead=el('div',{},tabs,categoryRow);
 root.append(el('div',{className:'shm-main'},stage,el('div',{className:'shm-panel'},panelHead,body)));
 const share=el('button',{className:'shm-pill',textContent:'Share'}),reset=iconButton('reset','Start over',{className:'shm-pill'});
 const save=el('button',{className:'shm-save',textContent:saveLabel});
 root.append(el('div',{className:'shm-foot'},share,reset,save));
 document.body.append(root);
 const viewport=window.visualViewport;
 const fitViewport=()=>{if(viewport){root.style.height=viewport.height+'px';root.style.top=viewport.offsetTop+'px';root.style.bottom='auto';}};
 viewport?.addEventListener('resize',fitViewport);viewport?.addEventListener('scroll',fitViewport);fitViewport();
 // Keys typed here are for the name box, not for walking about behind the maker.
 let shareLayer=null;
 const closeShare=()=>{shareLayer?.remove();shareLayer=null;for(const child of root.children)child.inert=false;share.focus();};
 const swallow=e=>{
  if(!root.isConnected)return;e.stopPropagation();
  if(e.type!=='keydown')return;
  if(e.key==='Escape'){e.preventDefault();shareLayer?closeShare():finish(false);}
  if(e.key==='Tab'){const scope=shareLayer||root,items=[...scope.querySelectorAll('button:not(:disabled),input,select,textarea,[tabindex="0"]')].filter(x=>x.getClientRects().length);
   const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
 };
 root.addEventListener('keydown',swallow);root.addEventListener('keyup',swallow);

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
  animator.update(dt,{speed:pose==='walk'?1.2:0,seated:pose==='sit',seatHeight:.42,expression:pose==='Hop'?'happy':pose==='Kachashi'?'laugh':pose==='idle'?'neutral':'smile'});
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
 const thumbTarget=new THREE.WebGLRenderTarget(136,136);thumbTarget.texture.colorSpace=THREE.SRGBColorSpace;
 const thumbCamera=new THREE.PerspectiveCamera(30,1,.05,20),thumbScene=new THREE.Scene();
 thumbScene.add(new THREE.HemisphereLight(0xffffff,0xb8a88a,2.2));const thumbSun=sun.clone();thumbScene.add(thumbSun);
 function figureThumb(r,c,at){
  const a=buildAvatar(r,{shadows:false,faceSize:128}),m=a.measure;
  a.root.rotation.y=.45;thumbScene.add(a.root);a.root.updateMatrixWorld(true);
  const onHead=at.startsWith('hair')||at==='outfit.hat'||at==='accessories.earrings';
  const y=onHead?m.headCentre+m.Rh*.2:at==='outfit.bottom'?m.hipY*.7:m.hipY+m.torso*.55,d=onHead?m.Rh*5.4:at==='outfit.bottom'?m.H*.95:m.H*.85;
  thumbCamera.position.set(0,y+(onHead?m.Rh*.4:.1),d);thumbCamera.lookAt(0,y,0);
  const px=c.width;
  renderer.setRenderTarget(thumbTarget);renderer.setClearColor(0xf3ecdc,1);renderer.clear();renderer.render(thumbScene,thumbCamera);
  const pixels=new Uint8Array(px*px*4);renderer.readRenderTargetPixels(thumbTarget,0,0,px,px,pixels);
  const ctx=c.getContext('2d'),image=ctx.createImageData(px,px);
  for(let y=0;y<px;y++)image.data.set(pixels.subarray((px-1-y)*px*4,(px-y)*px*4),y*px*4);
  ctx.putImageData(image,0,0);
  renderer.setRenderTarget(null);renderer.setClearColor(0x000000,0);
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
 function change(at,value,remember=true){
  if(get(recipe,at)===value)return;
  if(remember){history.push(structuredClone(recipe));if(history.length>60)history.shift();}
  set(recipe,at,value);recipe=normalizeRecipe(recipe);dirty=true;undo.disabled=false;
 }
 function chooseTab(id){tab=id;category.value=id;renderTabs();renderBody();body.scrollTop=0;}
 category.onchange=()=>chooseTab(category.value);
 function renderTabs(){
  if(!tabs.children.length)tabs.append(...TABS.map(t=>{const b=el('button',{role:'tab',id:'shm-tab-'+t.id,textContent:t.name});b.setAttribute('aria-controls','shm-body');b.onclick=()=>chooseTab(t.id);return b;}));
  [...tabs.children].forEach((b,i)=>{const active=TABS[i].id===tab;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
  body.setAttribute('aria-label',TABS.find(t=>t.id===tab).name);
 }
 tabs.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const i=TABS.findIndex(t=>t.id===tab),n=e.key==='Home'?0:e.key==='End'?TABS.length-1:(i+(e.key==='ArrowRight'?1:-1)+TABS.length)%TABS.length;chooseTab(TABS[n].id);tabs.children[n].focus();tabs.children[n].scrollIntoView({block:'nearest',inline:'nearest'});};
 let pictureQueue=[],pictureJobs=[],pictureFrame=0;
 function renderBody(){
  cancelAnimationFrame(pictureFrame);clearTimeout(picturesDue);pictureQueue=[];pictureJobs=[];
  const t=TABS.find(x=>x.id===tab);body.replaceChildren();
  for(const control of t.controls){
   if(control.label)body.append(el('h4',{textContent:control.label}));
   if(control.kind==='parts'){
    const grid=el('div',{className:'shm-grid'});
    for(const value of control.list){
     const c=el('canvas',{width:136,height:136});
     const b=el('button',{},c,LABEL[value]||value);b.setAttribute('aria-pressed',String(get(recipe,control.at)===value));
     b.onclick=()=>{change(control.at,value);for(const x of grid.children)x.setAttribute('aria-pressed',String(x===b));};
     grid.append(b);pictureJobs.push(()=>drawThumb(control,value,c));
    }
    body.append(grid);
   }else if(control.kind==='colours'){
    const row=el('div',{className:'shm-swatches'});
    for(const hex of control.palette){const b=el('button',{ariaLabel:hex});b.style.background=hex;b.setAttribute('aria-pressed',String(get(recipe,control.at)===hex));
     b.onclick=()=>{change(control.at,hex);for(const x of row.children)x.setAttribute('aria-pressed',String(x===b));if(t.controls.some(c=>c.kind==='parts'))renderPictures();};row.append(b);}
    body.append(row);
   }else if(control.kind==='position'){
    const row=el('div',{className:'shm-chips',role:'group',ariaLabel:'Position '+t.name.toLowerCase()});
    const directions=[['arrow-left',control.paired?'Closer':'Move left',control.horizontal,-.04],['arrow-up','Move up',control.at,.04],['arrow-down','Move down',control.at,-.04],['arrow-right',control.paired?'Wider apart':'Move right',control.horizontal,.04]];
    for(const [icon,label,at,delta] of directions){const b=iconButton(icon,label);b.onclick=()=>{change(at,Math.max(0,Math.min(1,get(recipe,at)+delta)));for(const range of body.querySelectorAll('input[type=range]'))if(range.dataset.at===at)range.value=range.dataset.invert==='true'?1-get(recipe,at):get(recipe,at);renderPictures();};row.append(b);}
    body.append(row);
   }else if(control.kind==='slider'){
    const input=el('input',{type:'range',min:0,max:1,step:.01,value:control.invert?1-get(recipe,control.at):get(recipe,control.at),ariaLabel:control.label});
    input.dataset.at=control.at;input.dataset.invert=String(!!control.invert);
    let adjusting=false;
    input.oninput=()=>{change(control.at,control.invert?1-+input.value:+input.value,!adjusting);adjusting=true;};
    input.onchange=()=>{adjusting=false;};
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
  pictureQueue=[...pictureJobs];paintQueued();
 }
 // Pictures are drawn a few a frame, so a tab opens at once and fills in.
 function paintQueued(){pictureFrame=requestAnimationFrame(()=>{const t0=performance.now();while(pictureQueue.length&&performance.now()-t0<8)pictureQueue.shift()();if(pictureQueue.length)paintQueued();});}
 let picturesDue=0;
 function renderPictures(){clearTimeout(picturesDue);picturesDue=setTimeout(()=>{cancelAnimationFrame(pictureFrame);pictureQueue=[...pictureJobs];paintQueued();},180);}
 function renderPoses(){
  const select=el('select',{className:'shm-select',ariaLabel:'Preview pose'},...POSES.map(([id,label])=>el('option',{value:id,textContent:label})));select.value=pose;
  select.onchange=()=>{pose=select.value;if(!['idle','walk','sit'].includes(pose))animator.play(pose);else animator.stop();};
  poses.append(el('span',{textContent:'Preview pose'}),select);
 }

 // ----- Buttons -----
 name.oninput=()=>{recipe.name=name.value.slice(0,24);};
 dice.onclick=()=>{history.push(structuredClone(recipe));const r=randomRecipe();r.name=recipe.name;recipe=normalizeRecipe(r);dirty=true;undo.disabled=!history.length;renderBody();};
 undo.onclick=()=>{const r=history.pop();if(!r)return;recipe=r;name.value=recipe.name||'';dirty=true;undo.disabled=!history.length;renderBody();};
 reset.onclick=()=>{history.push(structuredClone(recipe));recipe=normalizeRecipe({...CAST_RECIPES.Johansson,name:recipe.name});dirty=true;undo.disabled=!history.length;renderBody();};
 share.onclick=()=>{
  const code=encodeRecipe({...recipe,name:name.value});const link=shareLink?.(code);
  const text=el('textarea',{value:link||code,readOnly:true,ariaLabel:'Share link or code'});
  const paste=el('textarea',{placeholder:'Paste a code or link here to try it on',ariaLabel:'Import an islander'});
  const copy=el('button',{className:'shm-pill',textContent:'Copy'}),use=el('button',{className:'shm-pill',textContent:'Try the pasted one'}),done=el('button',{className:'shm-pill',textContent:'Done'});
  const layer=el('div',{className:'shm-share',role:'dialog',ariaModal:'true',ariaLabel:'Share your islander'},el('div',{},el('h3',{textContent:'Share your islander'}),el('p',{textContent:link?'Send this link and it opens the maker with your islander in it.':'This code is your islander. Anyone can paste it into their maker.'}),text,el('div',{className:'row'},copy),el('h3',{textContent:'Try someone else’s'}),paste,el('div',{className:'row'},use,done)));
  copy.onclick=async()=>{try{await navigator.clipboard.writeText(text.value);copy.textContent='Copied';}catch{text.select();}};
  use.onclick=()=>{const raw=paste.value.trim();let code=raw;try{if(raw.includes('=')){const url=new URL(raw,location.href);code=url.searchParams.get('r')||url.searchParams.get('avatar');}}catch{code='';}const r=decodeRecipe(code||'');
   if(!r){use.textContent='That code did not work';return;}history.push(structuredClone(recipe));recipe=r;name.value=r.name||'';dirty=true;undo.disabled=false;renderBody();closeShare();};
  done.onclick=closeShare;shareLayer=layer;for(const child of root.children)child.inert=true;root.append(layer);done.focus();
 };
 function finish(saving){
  if(!root.isConnected)return;
  cancelAnimationFrame(frame);cancelAnimationFrame(pictureFrame);clearTimeout(picturesDue);observer?.disconnect();viewport?.removeEventListener('resize',fitViewport);viewport?.removeEventListener('scroll',fitViewport);
  root.removeEventListener('keydown',swallow);root.removeEventListener('keyup',swallow);
  const out=normalizeRecipe({...recipe,name:name.value});
  avatar?.dispose();thumbTarget.dispose();renderer.dispose();renderer.forceContextLoss?.();floor.geometry.dispose();floor.material.dispose();root.remove();previousFocus?.focus?.();
  if(saving)onSave(out);onClose(out,saving);
 }
 close.onclick=()=>finish(false);save.onclick=()=>finish(true);

 renderTabs();renderBody();renderPoses();loop();close.focus();
 return {close:()=>finish(false),get recipe(){return normalizeRecipe({...recipe,name:name.value});},get root(){return root;}};
}
