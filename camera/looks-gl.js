/**
 * Pocket Camera's engine: Johansson World's Looks (johansson-town/src/render/looks.js), run on a photograph or a
 * camera frame instead of the town. The shaders are World's own, imported, never copied: each Look is built without
 * depth (the picture-only version Studio's comic panels use), turned into WebGL2's GLSL, and wrapped so that it can
 * be mixed back into what came before it. That makes Looks stackable: Manga, then Old TV over it, then Miniature.
 *
 * One change is made to World's source, by replacement: unit(), which sizes every pattern (dots, strokes, lines) to
 * a 1080-line screen, follows the picture's own height instead. A pattern then covers the same share of the photo in
 * the viewfinder, in a thumbnail and in a 12-megapixel save, so what is seen is what is saved.
 *
 * Every picture goes through a first pass of our own: crop, mirror, Light, Contrast, Colour and Warmth, and for the
 * Looks that draw lines a light edge-keeping smoothing, so camera noise is not inked as detail.
 */
import {LOOKS,lookFragment,lookUsesDepth} from '../johansson-town/src/render/looks.js?v=20261029-camera';

export {LOOKS};
/** In the order World's menu offers them. */
export const LOOK_NAMES=Object.freeze(Object.keys(LOOKS));
/** The longest side and the most pixels a save may have (iOS Safari refuses canvases over 16.7 million pixels). */
export const MAX_SIDE=4096,MAX_PIXELS=16e6;

const WORLD_UNIT='float unit(){return max(1.0,uResolution.y/1080.0);}';
const PHOTO_UNIT='uniform float uLines;uniform float uUnitFloor;\nfloat unit(){return max(uUnitFloor,uResolution.y/uLines);}';

/** World's fragment for a Look as GLSL ES 3.00, mixed into its input by uAmount; null for Natural. */
export function photoFragment(name,{light=false}={}){
 const world=lookFragment(name,{light,depth:false});
 if(!world)return null;
 const body=world.replace('#include <packing>','').replace(WORLD_UNIT,PHOTO_UNIT).replace(/void\s+main\s*\(\s*\)/,'void lookMain()');
 return `#version 300 es
precision highp float;precision highp int;
#define varying in
#define texture2D texture
vec4 lookColor;
#define gl_FragColor lookColor
${body}
uniform float uAmount;
out highp vec4 fragColor;
void main(){lookMain();vec3 before=texture(tDiffuse,vUv).rgb;fragColor=vec4(mix(before,clamp(lookColor.rgb,0.0,1.0),uAmount),1.0);}`;
}

/** Whether a Look draws outlines (and so wants camera noise smoothed away first). */
export const lookDrawsLines=name=>name!=='none'&&lookUsesDepth(name);
/**
 * The Looks that print a picture in a few inks at fixed thresholds. World's town is bright and evenly lit, and they
 * are set for it; a photo of a shady garden would print almost solid. So, as the town's Pocket camera exposes each
 * photo before its dither (src/photo/pocket-camera.js), a picture is exposed for them first: its average brought to
 * the town's middle.
 */
export const INK_LOOKS=Object.freeze(['pocket','snes','lines','manga','print','riso','pencilManga','stamp']);

/** A recipe with every field present and in range. */
export function normalRecipe(recipe={}){
 const n=(v,lo,hi,d)=>Number.isFinite(+v)?Math.min(hi,Math.max(lo,+v)):d;
 const layers=(Array.isArray(recipe.layers)?recipe.layers:[]).slice(0,3)
  .map(l=>({look:Object.hasOwn(LOOKS,l?.look)?l.look:'none',amount:n(l?.amount,0,1,1)}));
 if(!layers.length)layers.push({look:'none',amount:1});
 const a=recipe.adjust||{};
 // Stickers (stickers.js): centre, height as a share of the picture's height, angle in degrees, mirrored or not.
 const stickers=(Array.isArray(recipe.stickers)?recipe.stickers:[]).filter(s=>typeof s?.id==='string').slice(0,40)
  .map(s=>({id:s.id,x:n(s.x,-.2,1.2,.5),y:n(s.y,-.2,1.2,.5),size:n(s.size,.06,1.6,.42),angle:n(s.angle,-3600,3600,0),flip:!!s.flip}));
 return {layers,adjust:{light:n(a.light,-1,1,0),contrast:n(a.contrast,-1,1,0),colour:n(a.colour,-1,1,0),warmth:n(a.warmth,-1,1,0),pattern:n(a.pattern,-1,1,0)},stamp:!!recipe.stamp,stickers};
}

/** The size a save of a w×h crop may have: as it is, or scaled down to the limits. */
export function exportSize(w,h,limit=MAX_SIDE){
 const s=Math.min(1,limit/Math.max(w,h),Math.sqrt(MAX_PIXELS/(w*h)));
 return {width:Math.max(1,Math.round(w*s)),height:Math.max(1,Math.round(h*s))};
}

const VERTEX=`#version 300 es
in vec2 aPos;out vec2 vUv;void main(){vUv=aPos*.5+.5;gl_Position=vec4(aPos,0.,1.);}`;

// Crop, mirror and the adjustments, from a source whose first row is the top of the picture.
const PREPARE=`#version 300 es
precision highp float;
in vec2 vUv;out vec4 fragColor;
uniform sampler2D tSource;
uniform vec4 uCrop;
uniform float uMirror,uSmooth,uAuto,uBias,uLight,uContrast,uColour,uWarmth;
uniform vec2 uStep;
float luma(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
vec3 at(vec2 p){
 vec2 q=vec2(p.x,1.0-p.y);if(uMirror>.5)q.x=1.0-q.x;
 return texture(tSource,uCrop.xy+q*uCrop.zw,uBias).rgb;
}
void main(){
 vec3 c=at(vUv);
 if(uSmooth>0.0){
  // Edge-keeping smoothing on two rings: neighbours much unlike the centre count for little.
  vec3 sum=c;float total=1.0;
  for(int r=1;r<=2;r++)for(int k=0;k<8;k++){
   float a=float(k)*.785398+float(r)*.3927;vec3 n=at(vUv+vec2(cos(a),sin(a))*uStep*float(r));
   vec3 d=n-c;float w=exp(-dot(d,d)*90.0)*(r==1?1.0:.6);sum+=n*w;total+=w;
  }
  c=mix(c,sum/total,uSmooth);
 }
 if(uAuto>0.0){
  // The whole picture's average, from its smallest mipmap.
  float mean=clamp(luma(textureLod(tSource,vec2(.5),16.0).rgb),.02,.98);
  c=pow(max(c,vec3(0.0)),vec3(mix(1.0,clamp(log(.56)/log(mean),.45,2.2),uAuto)));
 }
 c=pow(max(c,vec3(0.0)),vec3(exp2(-uLight*.85)));
 c=(c-.5)*(1.0+uContrast*.6)+.5;
 c=mix(vec3(luma(c)),c,1.0+uColour);
 c*=vec3(1.0+uWarmth*.09,1.0+uWarmth*.015,1.0-uWarmth*.1);
 fragColor=vec4(clamp(c,0.0,1.0),1.0);
}`;

const COPY=`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform sampler2D tDiffuse;
void main(){fragColor=vec4(texture(tDiffuse,vUv).rgb,1.0);}`;

/**
 * The engine on one canvas. `light` asks for the versions of the heavy Looks a phone or tablet can afford in the
 * viewfinder; a save always uses the full ones.
 */
export function createLookEngine(canvas,{light=false}={}){
 const gl=canvas.getContext('webgl2',{antialias:false,alpha:false,depth:false,stencil:false,premultipliedAlpha:false,preserveDrawingBuffer:false,powerPreference:'high-performance'});
 if(!gl)throw new Error('WebGL2 is not available');
 const parallel=gl.getExtension('KHR_parallel_shader_compile');
 const maxTexture=gl.getParameter(gl.MAX_TEXTURE_SIZE);
 const triangle=gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER,triangle);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const programs=new Map(),sources=new Map(),targets=new Map();

 function shader(type,text){const s=gl.createShader(type);gl.shaderSource(s,text);gl.compileShader(s);return s;}
 function build(key,fragment){
  const p=gl.createProgram(),v=shader(gl.VERTEX_SHADER,VERTEX),f=shader(gl.FRAGMENT_SHADER,fragment);
  gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'aPos');gl.linkProgram(p);
  const entry={program:p,vertex:v,fragment:f,uniforms:null,failed:false};programs.set(key,entry);return entry;
 }
 function finish(entry,key){
  if(entry.uniforms||entry.failed)return entry;
  if(!gl.getProgramParameter(entry.program,gl.LINK_STATUS)){
   entry.failed=true;console.error(`Pocket Camera: ${key} did not compile`,gl.getShaderInfoLog(entry.fragment)||gl.getProgramInfoLog(entry.program));return entry;
  }
  const u={},count=gl.getProgramParameter(entry.program,gl.ACTIVE_UNIFORMS);
  for(let i=0;i<count;i++){const name=gl.getActiveUniform(entry.program,i).name;u[name]=gl.getUniformLocation(entry.program,name);}
  entry.uniforms=u;return entry;
 }
 const lookKey=(name,full)=>name+(full||!light?':full':':light');
 /** Starts compiling a Look without waiting for it (thumbnails ask for every Look at once). */
 function request(name,full=false){
  const key=lookKey(name,full);
  return programs.get(key)||build(key,photoFragment(name,{light:light&&!full}));
 }
 const ready=entry=>entry.uniforms||entry.failed||!parallel||gl.getProgramParameter(entry.program,parallel.COMPLETION_STATUS_KHR);
 /** The compiled program for a Look, compiling it now if need be; null if it failed. */
 function look(name,full=false){const key=lookKey(name,full),e=finish(request(name,full),key);return e.failed?null:e;}
 const fixed=(key,text)=>{const e=finish(programs.get(key)||build(key,text),key);return e.failed?null:e;};

 function texture(w,h){
  const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  if(w)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  return t;
 }
 /** Two textures to ping-pong between, at one size, kept under a name. */
 function pair(name,w,h){
  let p=targets.get(name);
  if(p&&(p.w!==w||p.h!==h)){release(name);p=null;}
  if(!p){
   p={w,h,items:[0,1].map(()=>{const t=texture(w,h),f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return {t,f};})};
   targets.set(name,p);
  }
  return p;
 }
 function release(name){const p=targets.get(name);if(!p)return;for(const i of p.items){gl.deleteTexture(i.t);gl.deleteFramebuffer(i.f);}targets.delete(name);}

 /** Uploads a picture (an image, a canvas, a bitmap or a playing video) under a name, with its mipmaps. */
 function setSource(name,element,width,height){
  let s=sources.get(name);
  if(!s){s={t:texture()};sources.set(name,s);}
  gl.bindTexture(gl.TEXTURE_2D,s.t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,gl.RGBA,gl.UNSIGNED_BYTE,element);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  s.width=width;s.height=height;
 }
 function dropSource(name){const s=sources.get(name);if(s){gl.deleteTexture(s.t);sources.delete(name);}}

 // One full-screen pass, into a framebuffer (or the canvas) over a viewport, in tiles when asked so that a large
 // save never hands the GPU one draw long enough for the system to reset it.
 function pass(entry,input,output,[x,y,w,h],set,tile=0){
  gl.useProgram(entry.program);
  gl.bindFramebuffer(gl.FRAMEBUFFER,output);
  gl.viewport(x,y,w,h);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,input);
  const u=entry.uniforms;
  if(u.tDiffuse)gl.uniform1i(u.tDiffuse,0);
  if(u.tSource)gl.uniform1i(u.tSource,0);
  set?.(u);
  gl.bindBuffer(gl.ARRAY_BUFFER,triangle);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  if(!tile){gl.drawArrays(gl.TRIANGLES,0,3);return;}
  gl.enable(gl.SCISSOR_TEST);
  for(let ty=0;ty<h;ty+=tile)for(let tx=0;tx<w;tx+=tile){gl.scissor(x+tx,y+ty,Math.min(tile,w-tx),Math.min(tile,h-ty));gl.drawArrays(gl.TRIANGLES,0,3);gl.flush();}
  gl.disable(gl.SCISSOR_TEST);
 }

 const f1=(l,v)=>{if(l)gl.uniform1f(l,v);};
 function prepare(recipe,crop,mirror,w,h,smooth,auto){
  const a=recipe.adjust;
  // A Look that draws lines finds them in the detail of a picture about as tall as its patterns are sized for (the
  // viewfinder's): a larger save reads its source that much softer, so its lines are the viewfinder's lines, not the
  // floor's grain as well. Patterns, outlines and dots are still drawn at the save's full size.
  const bias=smooth?Math.max(0,Math.log2(h/(1080*2**-a.pattern))):0;
  return u=>{
   f1(u.uBias,bias);
   gl.uniform4f(u.uCrop,crop.x,crop.y,crop.w,crop.h);f1(u.uMirror,mirror?1:0);f1(u.uSmooth,smooth?1:0);f1(u.uAuto,auto?1:0);
   // Smoothing reaches about a thousandth of the picture's height, whatever its size.
   if(u.uStep)gl.uniform2f(u.uStep,h/(900*w),1/900);
   f1(u.uLight,a.light);f1(u.uContrast,a.contrast);f1(u.uColour,a.colour);f1(u.uWarmth,a.warmth);
  };
 }
 const lookUniforms=(amount,w,h,pattern,floor=.5)=>u=>{
  f1(u.uAmount,amount);if(u.uTexel)gl.uniform2f(u.uTexel,1/w,1/h);if(u.uResolution)gl.uniform2f(u.uResolution,w,h);
  // Pattern: -1 finer, +1 coarser, a factor of two either way.
  f1(u.uLines,1080*2**-pattern);f1(u.uUnitFloor,floor);
  f1(u.uComic,1);f1(u.uSkyDepth,120);f1(u.uFocusDistance,6);f1(u.uFocusRange,3);f1(u.uNear,.05);f1(u.uFar,60);
 };

 /**
  * Runs a recipe from a source into `output` (a framebuffer, or null for the canvas). Returns false while a Look in
  * it is still compiling (nothing is drawn then), so a frame never shows half a recipe.
  */ 
 function run(recipe,{source,crop={x:0,y:0,w:1,h:1},mirror=false,width,height,output=null,viewport,targetName='view',full=false,tile=0,layers=recipe.layers}){
  if(!sources.has(source))return false;
  const active=layers.filter(l=>l.look!=='none'&&l.amount>0);
  const entries=active.map(l=>full?look(l.look,true):(ready(request(l.look))?look(l.look):undefined));
  if(entries.some(e=>e===undefined))return false;
  const prep=fixed('prepare',PREPARE);
  const steps=active.map((l,i)=>({layer:l,entry:entries[i]})).filter(s=>s.entry);
  const smooth=steps.some(s=>lookDrawsLines(s.layer.look)),auto=steps.some(s=>INK_LOOKS.includes(s.layer.look));
  const vp=viewport||[0,0,width,height];
  if(!steps.length){pass(prep,sources.get(source).t,output,vp,prepare(recipe,crop,mirror,width,height,false),tile);return true;}
  const p=pair(targetName,width,height);let read=0;
  pass(prep,sources.get(source).t,p.items[0].f,[0,0,width,height],prepare(recipe,crop,mirror,width,height,smooth,auto),tile);
  steps.forEach(({layer,entry},i)=>{
   const last=i===steps.length-1;
   pass(entry,p.items[read].t,last?output:p.items[1-read].f,last?vp:[0,0,width,height],lookUniforms(layer.amount,width,height,recipe.adjust.pattern),tile);
   read=1-read;
  });
  return true;
 }

 return {
  gl,maxTexture,
  setSource,dropSource,hasSource:name=>sources.has(name),
  sourceSize:name=>{const s=sources.get(name);return s?{width:s.width,height:s.height}:null;},
  /** Starts compiling Looks in the background. */
  warm(names){if(parallel)for(const n of names)if(n!=='none')request(n);},
  isReady:name=>name==='none'||ready(request(name)),
  /** Draws a recipe on the canvas at the canvas's own size. */
  draw(recipe,options){return run(recipe,{...options,width:canvas.width,height:canvas.height,output:null});},
  /**
   * Draws one small square per Look into an atlas and hands back its pixels (rows top first): each Look as the
   * chosen layer would be, over the layers before it. Looks still compiling are left out (`missing`).
   */
  thumbnails(recipe,{source,crop,mirror,size,names,layer=0}){
   if(!sources.has(source))return null;
   const n=names.length,w=size*n,h=size,atlas=pair('atlas',w,h),missing=[];
   gl.bindFramebuffer(gl.FRAMEBUFFER,atlas.items[0].f);gl.viewport(0,0,w,h);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
   const before={...recipe,layers:recipe.layers.slice(0,layer)};
   const base=pair('thumb-base',size,size);
   if(!run(before,{source,crop,mirror,width:size,height:size,output:base.items[0].f,targetName:'thumb'}))return null;
   // Without background compiling, a few new Looks are compiled per call, so the strip fills in without a long stall.
   let budget=parallel?Infinity:3;
   names.forEach((name,i)=>{
    if(name==='none'){pass(fixed('copy',COPY),base.items[0].t,atlas.items[0].f,[i*size,0,size,size]);return;}
    const e=programs.get(lookKey(name,false));
    if(!e&&budget<=0){missing.push(name);return;}
    if(!e)budget--;
    if(!ready(request(name))){missing.push(name);return;}
    const entry=look(name);if(!entry){missing.push(name);return;}
    pass(entry,base.items[0].t,atlas.items[0].f,[i*size,0,size,size],lookUniforms(1,size,size,recipe.adjust.pattern,.35));
   });
   const pixels=new Uint8Array(w*h*4);
   gl.bindFramebuffer(gl.FRAMEBUFFER,atlas.items[0].f);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
   return {width:w,height:h,data:flipRows(pixels,w,h),missing};
  },
  /** The recipe at full quality and full size, as pixels (rows top first). */
  render(recipe,{source,crop,mirror,width,height}){
   const out=pair('export-out',width,height);
   if(!run(recipe,{source,crop,mirror,width,height,output:out.items[0].f,targetName:'export',full:true,tile:1024}))throw new Error('The picture could not be drawn');
   const pixels=new Uint8Array(width*height*4);
   gl.bindFramebuffer(gl.FRAMEBUFFER,out.items[0].f);gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
   release('export');release('export-out');
   return {width,height,data:flipRows(pixels,width,height)};
  },
  failed:name=>!!programs.get(lookKey(name,false))?.failed,
  lost:()=>gl.isContextLost(),
 };
}

/** WebGL reads rows bottom first; pictures want them top first. */
export function flipRows(pixels,w,h){
 const row=w*4,out=new Uint8ClampedArray(pixels.length);
 for(let y=0;y<h;y++)out.set(pixels.subarray((h-1-y)*row,(h-y)*row),y*row);
 return out;
}
