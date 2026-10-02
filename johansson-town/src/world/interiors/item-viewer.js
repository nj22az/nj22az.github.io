import * as THREE from '../../../vendor/three.module.js';
import {PACKS,drawFront,drawBack,drawSide} from '../../commerce/packaging-art.js';
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

function texture(canvas,renderer){const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
const px=(metres)=>Math.max(256,Math.min(1024,Math.round(metres*4096/64)*64));

/** The pack as a mesh, from its shape in PACKS and its faces from packaging-art.js. */
export function buildPack(id,renderer){
 const pack=PACKS[id]||{shape:'box',size:[.15,.15,.06]},brand=STORE_BRANDS[id==='bun'?'buns':id]||STORE_BRANDS.stock;
 const [w,h,d]=pack.size,group=new THREE.Group(),textures=[];
 const tex=c=>{const t=texture(c,renderer);textures.push(t);return t;};
 const film=(map,extra={})=>new THREE.MeshStandardMaterial({map,roughness:.42,metalness:.02,...extra});
 const plain=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.55,...extra});
 // Front and back are drawn at the pack's own aspect, so nothing is stretched.
 const aspect=(a,b)=>{const s=1024/Math.max(a,b);return [Math.round(a*s),Math.round(b*s)];};
 if(pack.shape==='box'||pack.shape==='flat'||pack.shape==='bag'){
  const [fw,fh]=aspect(w,h),front=tex(drawFront(id,fw,fh)),back=tex(drawBack(id,fw,fh));
  const sideTex=tex(drawSide(id,256,Math.round(256*h/Math.max(d,.01)))),paper=plain(brand.paper);
  const bag=pack.shape==='bag';
  const geometry=new THREE.BoxGeometry(w,h,d,bag?6:1,bag?12:1,bag?6:1);
  if(bag){
   // A pillow pack: full in the middle, pressed flat to its seals at the top and bottom.
   const p=geometry.attributes.position;
   for(let i=0;i<p.count;i++){const t=Math.abs(p.getY(i))/(h/2),s=Math.abs(p.getX(i))/(w/2);p.setZ(i,p.getZ(i)*(1-.92*t**3)*(1-.25*s**4));p.setX(i,p.getX(i)*(1-.05*t));}
   geometry.computeVertexNormals();
  }
  const sideMat=pack.shape==='flat'?paper:film(sideTex);
  const mesh=new THREE.Mesh(geometry,[sideMat,sideMat,paper,paper,film(front,{roughness:bag?.32:.5}),film(back,{roughness:bag?.32:.5})]);
  group.add(mesh);
  if(bag)for(const sy of [-1,1]){
   // The crimped seals: a strip of film with its teeth.
   const seal=new THREE.Mesh(new THREE.BoxGeometry(w*1.0,h*.06,d*.08),plain(brand.accent,{roughness:.35}));seal.position.y=sy*(h/2-h*.03);group.add(seal);
   for(let i=0;i<Math.round(w/.008);i++){const tooth=new THREE.Mesh(new THREE.BoxGeometry(.0035,h*.055,d*.1),plain(brand.ink));tooth.position.set(-w/2+.004+i*.008,sy*(h/2-h*.03),0);group.add(tooth);}
  }
 }else if(pack.shape==='can'||pack.shape==='bottle'||pack.shape==='cup'){
  const r=w/2,label=pack.shape==='bottle'?h*.45:h*.92,wrapW=2048,wrapH=Math.round(wrapW*label/(Math.PI*2*r));
  // One canvas round the whole body: the back panel, then the front, each half the way round.
  const wrap=document.createElement('canvas');wrap.width=wrapW;wrap.height=Math.max(256,Math.min(2048,wrapH));
  const ctx=wrap.getContext('2d');ctx.drawImage(drawBack(id,1024,wrap.height),0,0,wrapW/2,wrap.height);ctx.drawImage(drawFront(id,1024,wrap.height),wrapW/2,0,wrapW/2,wrap.height);
  const map=tex(wrap);
  const bottom=pack.shape==='cup'?r*.76:r;
  const body=new THREE.Mesh(new THREE.CylinderGeometry(r,bottom,label,64,1,true),film(map,{side:THREE.DoubleSide,roughness:pack.shape==='can'?.3:.42,metalness:pack.shape==='can'?.25:.02}));
  // The front's middle (u = .75) is at +x before this turn; turned, it faces the viewer.
  body.rotation.y=Math.PI/2;
  if(pack.shape==='can'){
   body.position.y=0;group.add(body);
   const metal=plain(0xc9ced2,{metalness:.8,roughness:.25});
   for(const sy of [-1,1]){const rim=new THREE.Mesh(new THREE.CylinderGeometry(r*.98,r,h*.04,48),metal);rim.position.y=sy*(label/2+h*.02);group.add(rim);}
   const lid=new THREE.Mesh(new THREE.CircleGeometry(r*.9,48).rotateX(-Math.PI/2),metal);lid.position.y=label/2+h*.04;group.add(lid);
   const tab=new THREE.Mesh(new THREE.BoxGeometry(r*.5,.002,r*.25),metal);tab.position.set(0,label/2+h*.045,r*.25);group.add(tab);
  }else if(pack.shape==='bottle'){
   const liquid={tea:0x8a9a3c,cola:0x3a1a12,water:0xd8eef2,soy:0x2a120c,soda:0xc8ecee}[id]??0xd8eef2;
   const clear=new THREE.MeshPhysicalMaterial({color:liquid,roughness:.08,transmission:.35,transparent:true,opacity:id==='cola'||id==='soy'?.95:.55,thickness:.02});
   const lower=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.95,h*.2,48),clear);lower.position.y=-h*.4;group.add(lower);
   body.position.y=-h*.075;group.add(body);
   const shoulder=new THREE.Mesh(new THREE.CylinderGeometry(r*.32,r,h*.22,48),clear);shoulder.position.y=h*.26;group.add(shoulder);
   const neck=new THREE.Mesh(new THREE.CylinderGeometry(r*.3,r*.32,h*.06,32),clear);neck.position.y=h*.4;group.add(neck);
   const cap=new THREE.Mesh(new THREE.CylinderGeometry(r*.34,r*.34,h*.07,32),plain(brand.ink,{roughness:.4}));cap.position.y=h*.465;group.add(cap);
  }else{
   body.position.y=0;group.add(body);
   const [fw,fh]=[1024,1024],lidArt=tex(drawFront(id,fw,fh));
   const lid=new THREE.Mesh(new THREE.CircleGeometry(r*1.02,48).rotateX(-Math.PI/2),film(lidArt,{roughness:.3,metalness:.3}));lid.position.y=label/2+.001;group.add(lid);
   const rim=new THREE.Mesh(new THREE.TorusGeometry(r*1.01,.0025,8,48).rotateX(Math.PI/2),plain(brand.ink));rim.position.y=label/2;group.add(rim);
   const base=new THREE.Mesh(new THREE.CircleGeometry(bottom,48).rotateX(Math.PI/2),plain(brand.paper));base.position.y=-label/2;group.add(base);
  }
 }else if(pack.shape==='carton'){
  const body=h*.8,[fw,fh]=aspect(w,body),front=tex(drawFront(id,fw,fh)),back=tex(drawBack(id,fw,fh)),side=tex(drawSide(id,256,Math.round(256*body/d)));
  const box=new THREE.Mesh(new THREE.BoxGeometry(w,body,d),[film(side),film(side),plain(brand.paper),plain(brand.paper),film(front),film(back)]);box.position.y=-h*.1;group.add(box);
  // The gable top: two sloping panels meeting at a ridge, and the sealed fin along it.
  const top=body/2-h*.1,rise=h*.15,shape=new THREE.Shape([new THREE.Vector2(-d/2,0),new THREE.Vector2(d/2,0),new THREE.Vector2(0,rise)]);
  const gable=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:w,bevelEnabled:false}).rotateY(Math.PI/2).translate(-w/2,0,0),plain(brand.paper,{flatShading:true}));
  gable.position.y=top;group.add(gable);
  const fin=new THREE.Mesh(new THREE.BoxGeometry(w,h*.05,.006),plain(brand.ink));fin.position.y=top+rise+h*.02;group.add(fin);
 }else if(pack.shape==='tray'){
  // The bento: a black tray, its clear lid and the printed band across it, seen from above.
  const tray=new THREE.Mesh(new THREE.BoxGeometry(w,h*.6,d),plain(0x1d1d1d,{roughness:.4}));tray.position.y=-h*.2;group.add(tray);
  const top=tex(drawFront(id,1024,Math.round(1024*d/w)));
  const lid=new THREE.Mesh(new THREE.PlaneGeometry(w*.98,d*.98).rotateX(-Math.PI/2),film(top,{roughness:.2}));lid.position.y=h*.12;group.add(lid);
  // The paper band round one end, clear of the picture on the lid.
  const band=new THREE.Mesh(new THREE.BoxGeometry(w*.09,h*.5,d+.004),plain(brand.accent));band.position.set(w*.41,-h*.04,0);group.add(band);
  const cover=new THREE.Mesh(new THREE.BoxGeometry(w,h*.4,d),new THREE.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:.18,roughness:.05}));cover.position.y=h*.1-.001;group.add(cover);
  // Held up and tilted to you, so the lid is what you read.
  group.rotation.x=Math.PI*.38;
 }
 group.userData.radius=Math.hypot(w,h,d)/2;
 group.userData.dispose=()=>{group.traverse(o=>{if(!o.isMesh)return;o.geometry.dispose();for(const m of [].concat(o.material))m.dispose();});textures.forEach(t=>t.dispose());};
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
  $('.iv-brand').textContent=[brand.name,brand.jp,brand.line].filter(Boolean).join(' · ');
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
