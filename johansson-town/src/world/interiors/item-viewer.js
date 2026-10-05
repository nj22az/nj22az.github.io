import * as THREE from '../../../vendor/three.module.js';
import {assetURL} from '../../assets.js';
import {shopProductTemplate} from '../../commerce/shop-product.js';
import {drawBack} from '../../commerce/packaging-art.js';
import {FRESH_LABELS,drawFreshLabel} from '../../commerce/fresh-labels.js';
import {getLabelMaterial,packagingSlot,ATLAS_COLS,ATLAS_ROWS,ATLAS_SPAN} from './store-advertising.js';
import {STORE_BRANDS} from '../../commerce/brands.js';
import {stockSpec} from '../../commerce/shop-stock.js';

/**
 * Picking something off the shelf to look at it.
 *
 * The shop goes dim behind, and the pack comes up into the light at reading size, the way
 * you hold a bag of crisps up to read it: the front's art and its flash, then turned over,
 * the ingredients, the nutrition panel, the barcode. Drag to turn it, pinch or scroll to
 * bring it closer; underneath, its name, its price and what Thuan says about it, and the
 * choices a shopper has: put it back, take it to the till, or ask her.
 *
 * It draws with its own small renderer on its own canvas, so the town underneath does
 * not have to stop being what it is, and each pack is built at full size from
 * packaging-art.js rather than from the shelf's atlas.
 */
const CSS=`
#itemViewer{position:fixed;inset:0;z-index:2000;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;
 background:radial-gradient(ellipse at 50% 42%,rgba(255,248,232,.30),rgba(24,20,16,.72) 70%);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);
 font-family:"M PLUS Rounded 1c","Hiragino Maru Gothic ProN",system-ui,sans-serif;touch-action:none;user-select:none;-webkit-user-select:none}
#itemViewer[hidden]{display:none}
#itemViewer canvas{position:absolute;inset:0;width:100%;height:100%;cursor:grab}
#itemViewer canvas:active{cursor:grabbing}
#itemViewer .iv-card{position:relative;margin:0 12px max(12px,env(safe-area-inset-bottom));width:min(560px,calc(100% - 24px));background:#f8f1e1;color:#2f2a24;
 border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,.35);padding:14px 16px 12px}
#itemViewer .iv-brand{font-size:13px;letter-spacing:.06em;color:#7a6a58}
#itemViewer .iv-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
#itemViewer .iv-name{font-size:20px;font-weight:700;margin:2px 0}
#itemViewer .iv-price{font-size:22px;font-weight:800;color:#b8332c;white-space:nowrap}
#itemViewer .iv-line{font-size:14px;line-height:1.45;margin:4px 0 10px;color:#4a4038}
#itemViewer .iv-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
#itemViewer button{min-height:46px;border:0;border-radius:14px;font:inherit;font-size:15px;font-weight:700;background:#e9dcc4;color:#2f2a24}
#itemViewer button.iv-buy{background:#b8332c;color:#fff}
#itemViewer .iv-close{position:absolute;top:max(14px,env(safe-area-inset-top));right:14px;width:46px;height:46px;border-radius:50%;background:rgba(248,241,225,.92);font-size:22px;min-height:0}
#itemViewer .iv-hint{position:absolute;top:max(22px,env(safe-area-inset-top));left:0;right:0;text-align:center;color:#fff8e8;font-size:13px;opacity:.85;text-shadow:0 1px 2px rgba(0,0,0,.5);pointer-events:none}
`;


/** The painted labels at the resolution they were painted (store-advertising.js draws them into the shelf atlas at 256×128). */
// Round packs wrap their label most of the way round; the back panel fills the gap.
const ROUND=new Set(['tea','water','cola','orange','soy','soda','coffee','beer','tuna','peaches','noodles','yogurt','pudding']),TOP_PRINTED=new Set(['bento','newspaper']);
const SOURCES=['packaging-atlas.webp','packaging-groceries.webp'],sourceImages=new Map();
function sourceImage(file){
 if(!sourceImages.has(file))sourceImages.set(file,new Promise(resolve=>new THREE.ImageLoader().load(assetURL('graphics/konbini/'+file),resolve,undefined,()=>resolve(null))));
 return sourceImages.get(file);
}
/**
 * The pack in your hand is the pack on the shelf: the same shape (shop-product.js, with
 * more segments for the round ones) and the same painted label, cut from the painting at
 * full size instead of the shelf's small copy, so nothing changes but the sharpness.
 */
export function buildPack(id,renderer){
 const t=shopProductTemplate(id,{sides:64}),slot=packagingSlot(id),col=slot%ATLAS_COLS,row=Math.floor(slot/ATLAS_COLS);
 const art=t.art.clone(),uv=art.attributes.uv;
 for(let i=0;i<uv.count;i++){
  const u=(uv.getX(i)*ATLAS_SPAN-col-.025)/.95,v=1-((1-uv.getY(i))*ATLAS_ROWS-row-.025)/.95;
  uv.setXY(i,THREE.MathUtils.clamp(u,0,1),THREE.MathUtils.clamp(v,0,1));
 }
 uv.needsUpdate=true;
 const label=document.createElement('canvas');label.width=1024;label.height=512;const ctx=label.getContext('2d');
 // At once: the shelf's own copy, scaled up; then the original painting when it has loaded.
 const atlas=getLabelMaterial().map.image,TW=atlas.width/ATLAS_SPAN,TH=atlas.height/ATLAS_ROWS;
 if(!drawFreshLabel(ctx,id,label.width,label.height))ctx.drawImage(atlas,col*TW,row*TH,TW,TH,0,0,label.width,label.height);
 const map=new THREE.CanvasTexture(label);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=renderer?.capabilities?.getMaxAnisotropy?.()||4;
 const file=SOURCES[Math.floor(row/4)];
 if(file&&!FRESH_LABELS.includes(id))sourceImage(file).then(image=>{
  if(!image)return;const cw=image.width/ATLAS_COLS,ch=image.height/4;
  ctx.drawImage(image,col*cw,(row%4)*ch,cw,ch,0,0,label.width,label.height);map.needsUpdate=true;
 });
 const body=t.body.clone(),group=new THREE.Group(),inner=new THREE.Group();
 inner.add(new THREE.Mesh(body,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.55})));
 inner.add(new THREE.Mesh(art,new THREE.MeshStandardMaterial({map,roughness:.42,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.35})));
 const box=t.bounds,centre=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
 // Turned over: the 一括表示 panel every pack carries, ingredients, contents, maker and
 // barcode, printed from the item's own data (packaging-art.js drawBack).
 art.computeBoundingBox();const a=art.boundingBox,round=ROUND.has(id);
 const faceW=round?Math.PI*.38*Math.max(Math.abs(a.min.x),Math.abs(a.max.x)):a.max.x-a.min.x,faceH=a.max.y-a.min.y;
 const backMap=new THREE.CanvasTexture(drawBack(id,768,Math.round(THREE.MathUtils.clamp(768*faceH/Math.max(faceW,.01),512,1536))));backMap.colorSpace=THREE.SRGBColorSpace;backMap.anisotropy=map.anisotropy;
 const backMaterial=new THREE.MeshStandardMaterial({map:backMap,roughness:.5,emissive:0xffffff,emissiveMap:backMap,emissiveIntensity:.3});
 let panel=null;
 if(round){
  const r=Math.max(Math.abs(a.min.x),Math.abs(a.max.x))+.0006,hgt=(a.max.y-a.min.y)*.96,arc=Math.PI*.38;
  panel=new THREE.Mesh(new THREE.CylinderGeometry(r,r,hgt,24,1,true,Math.PI-arc/2,arc),backMaterial);panel.position.y=(a.min.y+a.max.y)/2;
 }else if(a.min.z<-.002&&!TOP_PRINTED.has(id)){
  const pw=faceW+.001,ph=faceH+.001;
  panel=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),backMaterial);panel.rotation.y=Math.PI;panel.position.set((a.min.x+a.max.x)/2,(a.min.y+a.max.y)/2,a.min.z-.0008);
 }
 if(panel)inner.add(panel);
 inner.position.copy(centre).multiplyScalar(-1);group.add(inner);
 // Lidded packs are printed on top: held up and tilted to you, so the lid is what you read.
 if(['bento','newspaper'].includes(id))group.rotation.x=Math.PI*.38;
 group.userData.radius=size.length()/2;
 group.userData.dispose=()=>{body.dispose();art.dispose();map.dispose();backMap.dispose();panel?.geometry.dispose();backMaterial.dispose();inner.traverse(o=>{if(o.isMesh)o.material.dispose();});};
 return group;
}
export function createItemViewer({onClose=()=>{}}={}){
 if(!document.getElementById('itemViewerStyle')){const s=document.createElement('style');s.id='itemViewerStyle';s.textContent=CSS;document.head.append(s);}
 const root=document.createElement('section');root.id='itemViewer';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-label','Looking at an item');
 root.innerHTML=`<canvas aria-hidden="true"></canvas><div class="iv-hint">Drag to turn it · pinch to look closer</div>
 <button class="iv-close" aria-label="Put it back">×</button>
 <div class="iv-card"><div class="iv-brand"></div><div class="iv-row"><div class="iv-name"></div><div class="iv-price"></div></div><p class="iv-line"></p>
 <div class="iv-actions"><button class="iv-turn">Turn over</button><button class="iv-back">Put back</button><button class="iv-talk">Ask Thuan</button><button class="iv-buy">Into basket</button></div></div>`;
 document.body.append(root);
 const canvas=root.querySelector('canvas'),$=s=>root.querySelector(s);
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(28,1,.01,10);
 scene.add(new THREE.HemisphereLight(0xfff6e6,0x5a5048,1.6));
 const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(.6,1,1.4);scene.add(key);
 const rim=new THREE.DirectionalLight(0xfff0d0,1.2);rim.position.set(-1,.4,-1);scene.add(rim);
 const pivot=new THREE.Group();scene.add(pivot);
 let held=null,item=null,raf=0,yaw=0,pitch=0,targetYaw=0,targetPitch=0,zoom=1,targetZoom=1,last=0,idle=0;
 const pointers=new Map();let drag=null,pinch=null;
 function resize(){const w=root.clientWidth||innerWidth,h=root.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 function frame(time){
  raf=requestAnimationFrame(frame);const dt=Math.min(.05,(time-last)/1000||0);last=time;idle+=dt;
  if(!drag&&!pinch&&idle>2.5)targetYaw+=dt*.25;
  yaw+=(targetYaw-yaw)*Math.min(1,dt*10);pitch+=(targetPitch-pitch)*Math.min(1,dt*10);zoom+=(targetZoom-zoom)*Math.min(1,dt*8);
  pivot.rotation.set(pitch,yaw,0);
  // Framed so the pack fills about two thirds of the height above the card.
  const r=held?.userData.radius||.15,fit=r/Math.tan(camera.fov*Math.PI/360)*1.35/zoom;
  camera.position.set(0,-r*.18,fit);camera.lookAt(0,-r*.18,0);
  renderer.render(scene,camera);
 }
 function open(data){
  close(true);item=data;const id=data.productId||data.id;
  const spec=stockSpec(id)||{},brand=STORE_BRANDS[id==='bun'?'buns':id]||{};
  held=buildPack(id,renderer);pivot.add(held);
  yaw=targetYaw=-.35;pitch=targetPitch=.12;zoom=targetZoom=1;idle=0;
  const same=(a,b)=>String(a||'').replace(/\s/g,'').toLowerCase()===String(b||'').replace(/\s/g,'').toLowerCase();
  $('.iv-brand').textContent=[brand.name,same(brand.jp,brand.name)?'':brand.jp,brand.line].filter(Boolean).join(' · ');
  $('.iv-name').textContent=spec.name||data.title||id;
  $('.iv-price').textContent=spec.cost!=null?'¥'+spec.cost:'';
  // The stock text opens with the brand, which the card already shows above it.
  const about=(spec.text&&!spec.text.includes(spec.name)?spec.text:'').replace(/^[A-Z0-9 ]+ · \S+\s*/,'');
  $('.iv-line').textContent=[data.liftLine?'Thuan: “'+data.liftLine+'”':'',about].filter(Boolean).join(' ');
  $('.iv-buy').textContent=spec.cost!=null?'Into basket · ¥'+spec.cost:'Into basket';
  $('.iv-talk').hidden=!(data.canTalk?.()??true);
  root.hidden=false;resize();last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
  $('.iv-back').focus({preventScroll:true});
 }
 function close(silent=false){
  if(!held)return;cancelAnimationFrame(raf);pivot.remove(held);held.userData.dispose();held=null;root.hidden=true;
  const was=item;item=null;if(!silent)onClose(was);
 }
 $('.iv-close').onclick=$('.iv-back').onclick=()=>close();
 $('.iv-turn').onclick=()=>{targetYaw+=Math.PI;idle=0;};
 $('.iv-buy').onclick=()=>{const buy=item?.onBuy;close();buy?.();};
 $('.iv-talk').onclick=()=>{const talk=item?.onTalk;close();talk?.();};
 canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);idle=0;
  if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),z:targetZoom};drag=null;}else drag={x:e.clientX,y:e.clientY,yaw:targetYaw,pitch:targetPitch};});
 canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,[e.clientX,e.clientY]);idle=0;
  if(pinch&&pointers.size>=2){const [a,b]=[...pointers.values()];targetZoom=THREE.MathUtils.clamp(pinch.z*Math.hypot(a[0]-b[0],a[1]-b[1])/pinch.d,.7,3);return;}
  if(drag){const s=Math.PI*2/Math.max(320,canvas.clientWidth);targetYaw=drag.yaw+(e.clientX-drag.x)*s;targetPitch=THREE.MathUtils.clamp(drag.pitch+(e.clientY-drag.y)*s,-1.2,1.2);}});
 const up=e=>{pointers.delete(e.pointerId);if(pointers.size<2)pinch=null;if(!pointers.size)drag=null;};
 canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
 canvas.addEventListener('wheel',e=>{e.preventDefault();idle=0;targetZoom=THREE.MathUtils.clamp(targetZoom*Math.exp(-e.deltaY*.0015),.7,3);},{passive:false});
 root.addEventListener('keydown',e=>{
  if(e.key==='Escape'||e.key==='q'||e.key==='Q'){e.preventDefault();close();}
  else if(e.key==='ArrowLeft'){targetYaw-=.3;idle=0;}else if(e.key==='ArrowRight'){targetYaw+=.3;idle=0;}
  else if(e.key==='ArrowUp'){targetPitch-=.2;idle=0;}else if(e.key==='ArrowDown'){targetPitch+=.2;idle=0;}
  e.stopPropagation();
 });
 addEventListener('resize',()=>{if(held)resize();});
 return {open,close:()=>close(),get active(){return !!held;}};
}
