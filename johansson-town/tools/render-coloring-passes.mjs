// Captures the passes a coloring-book page is drawn from, for the town feed's comic sets: for every place in
// src/feed/places.js and every view already recorded in assets/images/feed/views.json (same cameras as the comic sets),
//   <out>/<id>-<view>-id.png      every mesh (and every instance of an instanced mesh) in its own flat colour
//   <out>/<id>-<view>-normal.png  view-space normals, flat per face
//   <out>/<id>-<view>-depth.png   linear view depth in metres / 60, 16-bit in red and green
// Outlines are then where the id changes (one thing meets another), where the normal turns (a fold in one thing)
// and where the depth jumps (a thing in front of itself). Studio's coloring-page maker draws the page from them:
// jojo/research/mario-artist/ours/coloring/page.py. Residents, hands and the HUD are hidden, as in the comic sets.
// node tools/render-coloring-passes.mjs --out <dir> [id …]   (serves the repository itself; needs the built runtime)
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {FEED_PLACES} from '../src/feed/places.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),site=resolve(root,'..');
const args=process.argv.slice(2),outArg=args.indexOf('--out');
if(outArg<0||!args[outArg+1])throw Error('usage: node tools/render-coloring-passes.mjs --out <dir> [id …]');
const out=resolve(args[outArg+1]),only=new Set(args.filter((a,i)=>!a.startsWith('--')&&i!==outArg+1));
const W=1600,H=1200,FAR=60;
const views=JSON.parse(await readFile(resolve(root,'assets/images/feed/views.json'),'utf8'));
const TYPES={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary','.svg':'image/svg+xml','.ogg':'audio/ogg','.mp3':'audio/mpeg','.wasm':'application/wasm','.ktx2':'image/ktx2','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
 try{const path=decodeURIComponent(new URL(req.url,'http://x').pathname);const file=resolve(site,'.'+(path.endsWith('/')?path+'index.html':path));
  if(!file.startsWith(site))throw Error('outside');res.writeHead(200,{'content-type':TYPES[extname(file)]||'application/octet-stream'});res.end(await readFile(file));}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
await mkdir(out,{recursive:true});
let browser;
try{
 browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH||undefined,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:W,height:H},serviceWorkers:'block',deviceScaleFactor:1});
 await context.addInitScript(()=>{localStorage.setItem('johansson-town-clock',JSON.stringify({start:'12:00',speed:1}));Element.prototype.requestFullscreen=async()=>{};});
 const page=await context.newPage();page.setDefaultTimeout(240000);
 page.on('pageerror',e=>console.warn('Page error:',e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/johansson-town/?audit&visual-audit`);
 await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_AUDIT__&&!window.__JOHANSSON_AUDIT__.blocked.catchingUp,null,{timeout:240000});
 const settle=async()=>{await page.waitForFunction(()=>!window.__JOHANSSON_AUDIT__.blocked.roomLoading&&!window.__JOHANSSON_STREAMING__?.active);await page.waitForTimeout(2500);};
 const hideCast=()=>page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;
  for(const h of [a.hands,a.hands?.group,a.hands?.root])if(h?.isObject3D)h.visible=false;
  a.scene.traverse(o=>{if(o.isSkinnedMesh)o.visible=false;if(o.isBone)o.traverse(c=>{if(c.isMesh)c.visible=false;});});});

 /** The three passes for the camera on screen, as base64 PNGs. */
 const passes=()=>page.evaluate(async({W,H,FAR})=>{
  const a=window.__JOHANSSON_AUDIT__,THREE=await import('/johansson-town/vendor/three.module.js'),r=a.renderer;
  let camera=null;a.scene.traverse(o=>{if(o.isPerspectiveCamera&&!camera)camera=o;});camera.updateMatrixWorld(true);
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  const head='#include <common>\n#include <batching_pars_vertex>\n#include <skinning_pars_vertex>\n';
  const body='#include <skinbase_vertex>\n#include <begin_vertex>\n#include <batching_vertex>\n#include <skinning_vertex>\n#include <project_vertex>\n';
  // A cut-out (a leaf card, a fence, a hanging sign with alphaTest) keeps its shape: its texture's alpha still cuts.
  const make=(frag,uniforms={},o=null)=>{
   const m=o&&(Array.isArray(o.material)?o.material[0]:o.material),cut=!!(m&&m.alphaTest>0&&m.map);
   if(cut){m.map.updateMatrix();Object.assign(uniforms,{cutMap:{value:m.map},cutLevel:{value:m.alphaTest},cutMatrix:{value:m.map.matrix.clone()}});}
   // Each surface keeps its own sidedness: from inside a closed shape the game sees through its back faces, so must we.
   return new THREE.ShaderMaterial({uniforms,side:m?m.side:THREE.DoubleSide,defines:cut?{CUT:''}:{},
    vertexShader:head+'varying float vz;varying vec3 vpos;flat varying int inst;\n#ifdef CUT\nuniform mat3 cutMatrix;varying vec2 cutUv;\n#endif\nvoid main(){\n'+body+'vz=-mvPosition.z;vpos=mvPosition.xyz;\n#ifdef USE_INSTANCING\ninst=gl_InstanceID;\n#else\ninst=0;\n#endif\n#ifdef CUT\ncutUv=(cutMatrix*vec3(uv,1.)).xy;\n#endif\n}',
    fragmentShader:'varying float vz;varying vec3 vpos;flat varying int inst;\n#ifdef CUT\nuniform sampler2D cutMap;uniform float cutLevel;varying vec2 cutUv;\n#endif\n'+frag.replace('void main(){','void main(){\n#ifdef CUT\nif(texture2D(cutMap,cutUv).a<cutLevel)discard;\n#endif\n')});
  };
  // Glass, see-through and depth-only surfaces are not outlined (the room behind them is).
  const solid=o=>{const m=Array.isArray(o.material)?o.material[0]:o.material;return !(m&&m.transparent&&m.opacity<.5)&&!(m&&m.visible===false)&&!(m&&m.colorWrite===false);};
  const meshes=[];a.scene.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh&&visible(o))meshes.push(o);});
  const render=(materialFor)=>{
   const saved=meshes.map(o=>[o,o.material,o.visible]),before={bg:a.scene.background,fog:a.scene.fog,tone:r.toneMapping,override:a.scene.overrideMaterial,clear:r.getClearColor(new THREE.Color()),clearAlpha:r.getClearAlpha()};
   for(const o of meshes){if(!solid(o)){o.visible=false;continue;}o.material=materialFor(o);}
   a.scene.background=new THREE.Color(0,0,0);a.scene.fog=null;a.scene.overrideMaterial=null;r.toneMapping=THREE.NoToneMapping;
   const target=new THREE.WebGLRenderTarget(W,H,{type:THREE.UnsignedByteType});
   r.setRenderTarget(target);r.setClearColor(0x000000,1);r.clear();r.render(a.scene,camera);
   const px=new Uint8Array(W*H*4);r.readRenderTargetPixels(target,0,0,W,H,px);r.setRenderTarget(null);target.dispose();
   for(const [o,m,v] of saved){if(o.material!==m)o.material.dispose?.();o.material=m;o.visible=v;}
   a.scene.background=before.bg;a.scene.fog=before.fog;r.toneMapping=before.tone;a.scene.overrideMaterial=before.override;r.setClearColor(before.clear,before.clearAlpha);
   const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d'),img=ctx.createImageData(W,H);
   for(let y=0;y<H;y++)for(let x=0;x<W;x++){const s=((H-1-y)*W+x)*4,d=(y*W+x)*4;img.data[d]=px[s];img.data[d+1]=px[s+1];img.data[d+2]=px[s+2];img.data[d+3]=255;}
   ctx.putImageData(img,0,0);return canvas.toDataURL('image/png').split(',')[1];
  };
  // Id: 0 is the background; meshes count from 1, and an instance adds its index (a shelf of books is many books).
  let next=1;const ids=new Map();for(const o of meshes){ids.set(o,next);next+=o.isInstancedMesh?o.count:1;}
  const id=render(o=>make('uniform float base;void main(){float n=base+float(inst);float r=mod(n,256.),g=mod(floor(n/256.),256.),b=floor(n/65536.);gl_FragColor=vec4(r/255.,g/255.,b/255.,1.);}',{base:{value:ids.get(o)}},o));
  const normal=render(o=>make('void main(){vec3 n=normalize(cross(dFdx(vpos),dFdy(vpos)));gl_FragColor=vec4(n*.5+.5,1.);}',{},o));
  const depth=render(o=>make('uniform float far;void main(){float d=floor(clamp(vz/far,0.,1.)*65535.+.5);float r=floor(d/256.);gl_FragColor=vec4(r/255.,(d-r*256.)/255.,0.,1.);}',{far:{value:FAR}},o));
  return {id,normal,depth,meshes:meshes.length,ids:next-1};
 },{W,H,FAR});

 /** Puts the game's camera where a recorded comic-set view was: its position, looking along its rotation. */
 const aim=view=>page.evaluate(async v=>{const a=window.__JOHANSSON_AUDIT__,THREE=await import('/johansson-town/vendor/three.module.js');
  const p=new THREE.Vector3(...v.camera.position),f=new THREE.Vector3(0,0,-1).applyQuaternion(new THREE.Quaternion(...v.camera.quaternion));
  a.camera={pos:p.toArray(),at:p.clone().addScaledVector(f,5).toArray()};a.render();},view);

 const shoot=async place=>{
  for(const [name,view] of Object.entries(views[place.id]||{})){
   await aim(view);await page.waitForTimeout(800);await hideCast();
   const p=await passes();
   for(const k of ['id','normal','depth'])await writeFile(resolve(out,`${place.id}-${name}-${k}.png`),Buffer.from(p[k],'base64'));
   console.log('Passes:',place.id,name,'meshes',p.meshes,'ids',p.ids);
  }
 };

 for(const place of FEED_PLACES.filter(p=>!only.size||only.has(p.id))){
  const shot=place.shot;
  await page.evaluate(minutes=>window.__JOHANSSON_AUDIT__.setTime(minutes),shot.time??720);
  if(shot.room){
   await page.evaluate(async id=>{const a=window.__JOHANSSON_AUDIT__;a.camera=null;await a.enter(id);a.render();},shot.room);
   await settle();await shoot(place);
   await page.evaluate(()=>{const a=window.__JOHANSSON_AUDIT__;a.camera=null;a.leave();});await settle();
  }else{
   const at=await page.evaluate(async shot=>{
    if(!shot.lane)return shot.at;
    const {shoppingLanePoint}=await import('/johansson-town/src/world/shopping-lane-plan.js');return shoppingLanePoint(...shot.lane.at);
   },shot);
   await page.evaluate(at=>{window.__JOHANSSON_AUDIT__.teleport(...at);},at);
   await settle();await shoot(place);
   await page.evaluate(()=>{window.__JOHANSSON_AUDIT__.camera=null;});
  }
 }
}finally{await browser?.close();await new Promise(r=>server.close(r));}
