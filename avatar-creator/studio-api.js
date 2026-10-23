// Johansson Studio's agent API, loaded only when the page is opened with ?agent (by the johansson-studio MCP server's
// headless page, or by an agent in a browser). It draws with the Studio's own code -- World's avatar builder and the
// Build scene posing, World's packs and the one label renderer -- so a portrait, a pack or a baked label an agent
// renders is what the creator sees on the iPad. Comic edits create an isolated output copy; no API here publishes
// World data. See avatar-creator/docs/STUDIO-MCP.md.
import * as THREE from '../johansson-town/vendor/three.module.js';
import {drawLabel} from '../johansson-town/src/commerce/label-art.js';
import {drawFreshLabel} from '../johansson-town/src/commerce/fresh-labels.js';
import {buildPack} from '../johansson-town/src/world/interiors/item-viewer.js';
import {shopProductTemplate,shopProductMaterials} from '../johansson-town/src/commerce/shop-product.js';
import {getLabelMaterial,paintFlavourCell,cellOrigin,ATLAS_COLS,ATLAS_ROWS,ATLAS_SPAN} from '../johansson-town/src/world/interiors/store-advertising.js';
import {assetURL} from '../johansson-town/src/assets.js';
import {buildAvatar} from '../johansson-town/src/avatars/build.js';
import {normalizeRecipe,seeded} from '../johansson-town/src/avatars/recipe.js';
import {poseSceneAvatar} from './scene-avatar.js?v=20261011-1';
import {KNOWN_POSES,KNOWN_EXPRESSIONS} from './scene-catalogue.mjs';

export const VERSION=3;
/** The view's turn, in degrees: a body at turn 0 faces the camera. */
export const VIEWS=Object.freeze({front:0,quarter:-35,left:-90,right:90,back:180});
const LIGHTS={warm:[0xffffff,0xc8a878,2.2,0xfff4e0,1.9,[2,4,5]]};

let renderer=null;
function canvasRenderer(size){
 if(!renderer){
  const canvas=document.createElement('canvas');
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
 }
 renderer.setSize(size,size,false);return renderer;
}

/**
 * A portrait of a recipe as a PNG data URL. view: front, quarter, left, right or back; expression and pose: any the
 * Build scene offers (KNOWN_EXPRESSIONS, KNOWN_POSES); framing: full (the whole body) or face; size: 128 to 1024
 * pixels square; background: #rrggbb or 'transparent'. The same recipe and options always give the same pixels
 * (the body's idle sway and blinks are drawn from a fixed seed).
 */
export function renderPortrait(recipe,{view='front',expression='smile',pose='Idle',framing='full',size=512,background='#f3ede2'}={}){
 if(!Object.hasOwn(VIEWS,view))throw Error(`Unknown view "${view}". Views: ${Object.keys(VIEWS).join(', ')}.`);
 if(!KNOWN_EXPRESSIONS.has(expression))throw Error(`Unknown expression "${expression}".`);
 if(!KNOWN_POSES.has(pose))throw Error(`Unknown pose "${pose}".`);
 if(!['full','face'].includes(framing))throw Error('Framing is full or face.');
 size=Math.round(Math.min(1024,Math.max(128,Number(size)||512)));
 const clear=background==='transparent'?null:/^#[0-9a-f]{6}$/i.test(background)?new THREE.Color(background):null;
 if(background!=='transparent'&&!clear)throw Error('Background is #rrggbb or transparent.');
 const random=Math.random;Math.random=seeded('johansson-studio-portrait');
 const scene=new THREE.Scene(),[sky,ground,fill,key,power,position]=LIGHTS.warm;
 scene.add(new THREE.HemisphereLight(sky,ground,fill));const sun=new THREE.DirectionalLight(key,power);sun.position.set(...position);scene.add(sun);
 let avatar=null;
 try{
  avatar=buildAvatar(normalizeRecipe(recipe),{shadows:false,faceSize:512});
  poseSceneAvatar(avatar,{pose,expression,turn:VIEWS[view]});scene.add(avatar.root);avatar.root.updateMatrixWorld(true);
  const box=new THREE.Box3();
  if(framing==='face'&&avatar.face?.head)box.setFromObject(avatar.face.head);else box.setFromObject(avatar.root);
  const centre=box.getCenter(new THREE.Vector3()),extent=box.getSize(new THREE.Vector3());
  const half=Math.max(extent.y,extent.x,extent.z)*(framing==='face'?.78:.56);
  const camera=new THREE.OrthographicCamera(-half,half,half,-half,.01,50);
  camera.position.set(centre.x,centre.y,centre.z+10);camera.lookAt(centre);camera.updateMatrixWorld(true);
  const r=canvasRenderer(size);
  if(clear)r.setClearColor(clear,1);else r.setClearColor(0x000000,0);
  r.clear();r.render(scene,camera);
  return r.domElement.toDataURL('image/png');
 }finally{
  Math.random=random;
  if(avatar){avatar.root.removeFromParent();avatar.body?.skeleton?.dispose();avatar.dispose();}
 }
}

// ─── Products and labels (stage 2) ───────────────────────────────────────────────────────────────────────────────
/** The two painted packaging sheets: a painted label is a cell (four across, four down) of one of them. */
const SHEETS=['packaging-atlas.webp','packaging-groceries.webp'],images=new Map();
const LABEL_W=1024,LABEL_H=512,CELL_W=256,CELL_H=128;
function loadImage(src){
 if(!images.has(src))images.set(src,new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>{images.delete(src);reject(Error(`A picture did not load (${src.startsWith('data:')?'a picture sent with the call':src.split('/').slice(-2).join('/')}).`));};i.src=src;}));
 return images.get(src);
}
const canvasOf=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
/** A painted atlas cell, cut from its sheet at full size (what the close-up shows). */
async function paintedCell(cell){
 const sheet=await loadImage(assetURL('graphics/konbini/'+SHEETS[Math.floor(cell/16)])),c=canvasOf(LABEL_W,LABEL_H),cw=sheet.width/ATLAS_COLS,ch=sheet.height/4,k=cell%16;
 c.getContext('2d').drawImage(sheet,k%ATLAS_COLS*cw,Math.floor(k/ATLAS_COLS)*ch,cw,ch,0,0,LABEL_W,LABEL_H);return c;
}
/** The pictures a label's layers show: sent with the call (data URLs by file), or kept in assets/graphics/labels/. */
async function layerPictures(spec,pictures={}){
 const out={};
 for(const l of spec?.layers||[])if(l.type==='picture'&&!out[l.file])out[l.file]=await loadImage(Object.hasOwn(pictures,l.file)?pictures[l.file]:assetURL('graphics/labels/'+l.file));
 return out;
}
/**
 * A designed label baked the way World will show it: the spec drawn by label-art.js at 1024×512 over the product's
 * own painting (base "painted", where it has one) or its brand's paper. Returns a PNG data URL.
 */
export async function bakeLabel(product,spec,{pictures={}}={}){
 // Only the first 32 cells have a painting under them (the two painted sheets); anything else starts from paper.
 const cell=product.cells?.brand,painting=spec.base==='painted'&&Number.isInteger(cell)&&cell>=0&&cell<32?await paintedCell(cell):null;
 const c=canvasOf(LABEL_W,LABEL_H);drawLabel(c.getContext('2d'),spec,product.brand,LABEL_W,LABEL_H,{painting,pictures:await layerPictures(spec,pictures)});
 return c.toDataURL('image/png');
}
/** A picture cut to a shape (2:1 for a label) at most maxSide wide: `crop` is {x, y, w, h} as fractions, or the centre. */
export async function cropPicture(src,{crop=null,aspect=2,maxSide=2048}={}){
 const image=await loadImage(src),W=image.naturalWidth,H=image.naturalHeight;
 let {x,y,w,h}=crop||{};
 if(!crop){if(W/H>aspect){h=1;w=H*aspect/W;}else{w=1;h=W/aspect/H;}x=(1-w)/2;y=(1-h)/2;}
 const sw=Math.max(1,Math.round(w*W)),sh=Math.max(1,Math.round(h*H)),scale=Math.min(1,maxSide/Math.max(sw,sh));
 const c=canvasOf(Math.max(1,Math.round(sw*scale)),Math.max(1,Math.round(sh*scale)));
 c.getContext('2d').drawImage(image,Math.round(x*W),Math.round(y*H),sw,sh,0,0,c.width,c.height);
 return c.toDataURL('image/png');
}
/** The label a product shows, at 1024×512: a picture sent with the call, its baked label, its painting, or its fresh face. */
async function labelCanvas(product,labelImage){
 const c=canvasOf(LABEL_W,LABEL_H),ctx=c.getContext('2d'),l=product.label;
 if(labelImage)ctx.drawImage(await loadImage(labelImage),0,0,LABEL_W,LABEL_H);
 else if(l.source==='designed')ctx.drawImage(await loadImage(assetURL('graphics/'+l.image)),0,0,LABEL_W,LABEL_H);
 else if(l.source==='painted')ctx.drawImage(await paintedCell(l.sheet*16+l.cell),0,0);
 else if(!drawFreshLabel(ctx,product.id,LABEL_W,LABEL_H)){ctx.fillStyle=product.brand.paper;ctx.fillRect(0,0,LABEL_W,LABEL_H);}
 return c;
}
/** The label as it stands on the shelf: its 256×128 cell, and each flavour painted from it as the atlas paints them. */
function cellStrip(label,product){
 const flavours=product.cells.flavours,c=canvasOf(CELL_W*(1+flavours.length),CELL_H),ctx=c.getContext('2d');
 ctx.drawImage(label,0,0,CELL_W,CELL_H);
 flavours.forEach((f,i)=>paintFlavourCell(ctx,[0,0],[CELL_W*(i+1),0],f));
 return c;
}
let packRenderer=null;
function packScene(size,background){
 packRenderer??=new THREE.WebGLRenderer({canvas:canvasOf(size,size),antialias:true,alpha:true,preserveDrawingBuffer:true});
 packRenderer.setPixelRatio(1);packRenderer.outputColorSpace=THREE.SRGBColorSpace;packRenderer.setSize(size,size,false);
 packRenderer.toneMapping=THREE.ACESFilmicToneMapping;packRenderer.toneMappingExposure=1.05;
 const scene=new THREE.Scene();if(background!=='transparent')scene.background=new THREE.Color(background);
 // The item viewer's own lights (item-viewer.js), so a pack looks as it does picked up in World.
 scene.add(new THREE.HemisphereLight(0xfff6e6,0x5a5048,1.6));const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(.6,1,1.4);scene.add(key);
 const rim=new THREE.DirectionalLight(0xfff0d0,1.2);rim.position.set(-1,.4,-1);scene.add(rim);
 return scene;
}
/** One frame of a pack held up in front of you, turned `yaw` (0: its front). */
function packFrame(pack,scene,size,yaw){
 const pivot=new THREE.Group();pivot.add(pack);scene.add(pivot);pivot.rotation.set(.12,yaw,0);
 const r=pack.userData.radius,camera=new THREE.PerspectiveCamera(28,1,.01,10),fit=r/Math.tan(28*Math.PI/360)*1.35;
 camera.position.set(0,-r*.18,fit);camera.lookAt(0,-r*.18,0);packRenderer.render(scene,camera);
 const c=canvasOf(size,size);c.getContext('2d').drawImage(packRenderer.domElement,0,0);scene.remove(pivot);pivot.remove(pack);return c;
}
/**
 * A product drawn by World's own code, as the creator would see it: front or back (the pack picked up, item-viewer.js),
 * turn (four sides), shelf (the line and its flavours facing out on a shelf, the atlas's own painting), flat (the label
 * unrolled, with the part that faces you marked), or cell (the 256×128 shelf cell and its flavours). `labelImage` is a
 * baked label to show instead of the product's own (a draft). Returns a PNG data URL.
 */
export async function renderProduct(product,{view='front',size=512,background='#f3ede2',labelImage=null}={}){
 const label=await labelCanvas(product,labelImage);
 if(view==='flat'){
  const c=canvasOf(LABEL_W,LABEL_H),ctx=c.getContext('2d');ctx.drawImage(label,0,0);
  if(['bottle','can','cup','foil-cup'].includes(product.pack.shape)){ctx.setLineDash([14,10]);ctx.lineWidth=3;ctx.strokeStyle='rgba(20,20,20,.55)';for(const x of [.3,.7]){ctx.beginPath();ctx.moveTo(x*LABEL_W,0);ctx.lineTo(x*LABEL_W,LABEL_H);ctx.stroke();}}
  return c.toDataURL('image/png');
 }
 if(view==='cell')return cellStrip(label,product).toDataURL('image/png');
 size=Math.round(Math.min(1024,Math.max(128,Number(size)||512)));
 if(view==='shelf'){
  // The line on a shelf: a copy of World's own atlas with this label (and its flavours) painted into its cells.
  const atlas=getLabelMaterial().map.image,copy=canvasOf(atlas.width,atlas.height),ctx=copy.getContext('2d');ctx.drawImage(atlas,0,0);
  const [bx,by]=cellOrigin(product.cells.brand);ctx.drawImage(label,bx,by,CELL_W,CELL_H);
  for(const f of product.cells.flavours)paintFlavourCell(ctx,[bx,by],cellOrigin(f.cell,true),f);
  const map=new THREE.CanvasTexture(copy);map.colorSpace=THREE.SRGBColorSpace;
  const t=shopProductTemplate(product),material=new THREE.MeshBasicMaterial({map,toneMapped:false}),[plain]=shopProductMaterials();
  // Each flavour's wrapper turned by the same hue as its print, as the shelf tints it (shelf-flavours.js flavourTint).
  const bodies=[plain,...product.cells.flavours.map(f=>{const base=new THREE.Color(product.brand.paper),hsl={};base.getHSL(hsl,THREE.SRGBColorSpace);
   const turned=new THREE.Color().setHSL(((hsl.h+f.hue/360)%1+1)%1,hsl.s,hsl.l,THREE.SRGBColorSpace);
   return new THREE.MeshStandardMaterial({vertexColors:true,roughness:.62,color:new THREE.Color(...[[turned.r,base.r],[turned.g,base.g],[turned.b,base.b]].map(([a,o])=>Math.min(4,a/Math.max(.02,o))))});})];
  const scene=packScene(size,background),group=new THREE.Group(),kinds=1+product.cells.flavours.length,count=Math.max(4,kinds*2);
  const width=t.bounds.max.x-t.bounds.min.x,step=width+.012;
  for(let i=0;i<count;i++){
   const k=i%kinds,art=t.art.clone();
   if(k){const [vx,vy]=cellOrigin(product.cells.flavours[k-1].cell,true),uv=art.attributes.uv,du=(vx-bx)/CELL_W/ATLAS_SPAN,dv=-(vy-by)/CELL_H/ATLAS_ROWS;for(let j=0;j<uv.count;j++)uv.setXY(j,uv.getX(j)+du,uv.getY(j)+dv);}
   const pack=new THREE.Group();pack.add(new THREE.Mesh(t.body,bodies[k]),new THREE.Mesh(art,material));pack.position.x=(i-(count-1)/2)*step;group.add(pack);
  }
  const board=new THREE.Mesh(new THREE.BoxGeometry(count*step+.06,.012,.2),new THREE.MeshStandardMaterial({color:0xe8e4da,roughness:.8}));board.position.y=-.006;group.add(board);
  scene.add(group);const h=t.bounds.max.y,camera=new THREE.PerspectiveCamera(30,1,.01,20),span=Math.max(count*step,h)*1.05;
  camera.position.set(0,h*.55,span/2/Math.tan(15*Math.PI/180));camera.lookAt(0,h*.45,0);packRenderer.render(scene,camera);
  const out=packRenderer.domElement.toDataURL('image/png');
  group.traverse(o=>{if(o.isMesh&&o.geometry!==t.body&&o.geometry!==t.art)o.geometry.dispose();});material.dispose();map.dispose();bodies.slice(1).forEach(m=>m.dispose());
  return out;
 }
 const scene=packScene(size,background),pack=buildPack(product,{renderer:packRenderer,labelCanvas:label});
 try{
  if(view==='turn'){const c=canvasOf(size*4,size),ctx=c.getContext('2d');[0,Math.PI/2,Math.PI,Math.PI*1.5].forEach((yaw,i)=>ctx.drawImage(packFrame(pack,scene,size,yaw),i*size,0));return c.toDataURL('image/png');}
  return packFrame(pack,scene,size,view==='back'?Math.PI:0).toDataURL('image/png');
 }finally{pack.userData.dispose();}
}

/**
 * An asset's files as "Make model" saves them (model-assets.mjs exportAll), for the johansson-studio tools' asset_export:
 * key "catalogue:<id>" or "registry:<id>", or "lathe" with a Lathe design's params and card (name, kind, purpose, tags,
 * action, version). Base64 GLB, STL and transparent PNG, the card, the resolved card and the checks.
 */
async function exportAsset({key,params=null,card=null,png=true}={}){
 const [A,{normalizeLathe},{slugify},{base64}]=await Promise.all([import('./model-assets.mjs?v=20261014-1'),import('../johansson-town/src/studio/makers/lathe.js'),
  import('../johansson-town/src/studio/modeller/card-checks.js'),import('../johansson-town/src/studio/modeller/export.js')]);
 let item;
 if(key==='lathe'){
  if(!params||!card?.name)throw Error('A Lathe design needs its params and a card with at least a name.');
  const p=normalizeLathe(params),id=card.id||slugify(card.name),rules=await A.loadRules();
  const full=A.latheCard(p,{id,name:card.name,kind:card.kind||'prop',purpose:card.purpose||{for:'',why:'',where:''},tags:card.tags||[],action:card.action,version:card.version||1},A.buildMade(p,card),rules);
  item=A.madeItem(id,{card:full,params:p});card=full;
 }else item=A.libraryItems().find(i=>i.key===key);
 if(!item)throw Error(`Make model has no asset ${JSON.stringify(key)}.`);
 const r=await A.exportAll(item,{card,png});
 return {card:r.card,resolved:r.resolved,checks:r.checks,ok:r.ok,glb:base64(r.glb),stl:base64(r.stl.bytes),png:r.png?base64(r.png):null,print:r.stl.words,triangles:r.stl.report.triangles};
}

let comicWorkspace;
async function comicAfterEffects(options={}){
 const {createSceneWorkspace}=await import('./scene.js?v=20261023-hybrids');
 if(!comicWorkspace){comicWorkspace=createSceneWorkspace({getCharacter:()=>({}),onEdit(){},onMode(){}});comicWorkspace.root.hidden=true;document.body.append(comicWorkspace.root);}
 return comicWorkspace.afterEffects(options);
}
window.__JOHANSSON_STUDIO__=Object.freeze({version:VERSION,ready:true,views:Object.keys(VIEWS),poses:[...KNOWN_POSES],expressions:[...KNOWN_EXPRESSIONS],renderPortrait,
 productViews:['front','back','turn','shelf','flat','cell'],bakeLabel,cropPicture,renderProduct,exportAsset,comicAfterEffects});
