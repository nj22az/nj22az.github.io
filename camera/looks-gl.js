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
 * Every picture goes through a first pass of our own: crop, mirror, the trick lens (Twin, Quad), Light, Contrast,
 * Colour and Warmth, and for the Looks that draw lines a light edge-keeping smoothing, so camera noise is not inked as
 * detail (Detail sets how much).
 */
import {LOOKS as WORLD_LOOKS,lookFragment,lookUsesDepth} from '../johansson-town/src/render/looks.js?v=20261029-camera';

// Camera-only original Looks. They build on World's shared sampling helpers, without adding World Looks. The five after
// Adventure Ink came with the owner's "Yes add" (29 October 2026): an instant print, an 80s camcorder tape, comic
// dots, a blueprint and night vision.
export const LOOKS=Object.freeze({...WORLD_LOOKS,
 adventureInk:Object.freeze({label:'Adventure Ink',short:'Adventure',hint:'Bright cel colours and clean manga-inspired ink.'}),
 instant:Object.freeze({label:'Instant film',short:'Instant',hint:'An instant print: a soft matte fade, warm light, a leak of light in the corner.'}),
 camcorder:Object.freeze({label:'VHS camcorder',short:'VHS',hint:'A home video tape of the 80s: colours that bleed, soft lines, a wobble at the foot.'}),
 halftone:Object.freeze({label:'Comic dots',short:'Dots',hint:'A printed comic page: the picture in cyan, magenta, yellow and black dots.'}),
 cyanotype:Object.freeze({label:'Blueprint',short:'Blueprint',hint:'A cyanotype: Prussian blue and paper white, as an engineer\'s plans were printed.'}),
 nightVision:Object.freeze({label:'Night vision',short:'Night',hint:'Green phosphor through an image tube: the dark brought up, with grain.'}),
});
/** The World Look whose little house stands in for a camera-only Look until its live thumbnail is drawn. */
export const LOOK_STANDIN=Object.freeze({adventureInk:'flat',instant:'sepia',camcorder:'crt',halftone:'riso',cyanotype:'mono',nightVision:'pocket'});

// Clean coloured-comic panels: preserve the photo's hue, group the light into five gentle cel bands, and keep small
// dark details (especially eyes) as well as colour boundaries. No copied characters, art or shader code is used.
const ADVENTURE_BODY=`
// Smooth small photo texture while keeping strong boundaries. A five-tap, edge-aware brush makes a more legible
// colour cel than posterising the original pixel noise. Five taps per probe keeps the live-camera cost bounded.
vec3 adventureSmooth(vec2 p,float radius){
 vec3 c=texture2D(tDiffuse,p).rgb;
 vec2 d=uTexel*radius;
 vec3 a=texture2D(tDiffuse,p+vec2(d.x,0.0)).rgb;
 vec3 b=texture2D(tDiffuse,p-vec2(d.x,0.0)).rgb;
 vec3 e=texture2D(tDiffuse,p+vec2(0.0,d.y)).rgb;
 vec3 f=texture2D(tDiffuse,p-vec2(0.0,d.y)).rgb;
 vec3 da=a-c,db=b-c,de=e-c,df=f-c;
 float wa=exp(-dot(da,da)*16.0),wb=exp(-dot(db,db)*16.0);
 float we=exp(-dot(de,de)*16.0),wf=exp(-dot(df,df)*16.0);
 return (c+a*wa+b*wb+e*we+f*wf)/(1.0+wa+wb+we+wf);
}
void main(){
 float u=unit();
 vec3 orig=texture2D(tDiffuse,vUv).rgb;
 vec3 source=adventureSmooth(vUv,2.1*u);
 float l=luma(source);
 float band=.14+.15*smoothstep(.18,.25,l)+.19*smoothstep(.36,.43,l)
   +.21*smoothstep(.57,.64,l)+.18*smoothstep(.77,.84,l);
 // A shared gain keeps skin and strong colours in hue; gentle transitions prevent speckles near a tone boundary.
 float target=mix(l,band,.68);
 vec3 col=source*(target/max(l,.035));
 col/=max(1.0,max(col.r,max(col.g,col.b)));
 col=clamp(mix(vec3(luma(col)),col,1.11)*1.04,0.0,1.0);
 // Ink only broad, stable differences between smoothed regions, not tiny photo texture.
 vec2 t=uTexel*2.0*u;
 vec3 gx=adventureSmooth(vUv+vec2(t.x,0.0),2.1*u)-adventureSmooth(vUv-vec2(t.x,0.0),2.1*u);
 vec3 gy=adventureSmooth(vUv+vec2(0.0,t.y),2.1*u)-adventureSmooth(vUv-vec2(0.0,t.y),2.1*u);
 float strength=length(vec2(length(gx),length(gy)))*.577;
 float ink=smoothstep(.14,.38,strength)*.72;
 // Restore very dark marks only, preserving eyes and thin lettering without outlining every bit of texture.
 float dark=1.0-smoothstep(.025,.15,luma(orig));
 col=mix(col,orig,dark*.80);
 col=mix(col,vec3(.09,.095,.12),ink);
 gl_FragColor=vec4(col,1.0);
}`;

// An instant print: a gentle S curve, then a matte fade (blacks lifted, whites softened), cool shadows and warm
// highlights, a leak of orange light from the top right corner, soft corners and a fine grain.
const INSTANT_BODY=`
void main(){
 float u=unit();
 vec3 c=texture2D(tDiffuse,vUv).rgb;
 float l=luma(c);
 c=mix(vec3(l),c,.78);
 c=mix(c,c*c*(3.0-2.0*c),.45);
 c=mix(vec3(.16,.13,.15),vec3(.97,.91,.78),c);
 c+=vec3(.06,.025,-.05)*smoothstep(.4,1.0,l)+vec3(-.03,.01,.05)*(1.0-smoothstep(0.0,.45,l));
 vec2 q=(vUv-vec2(1.02,1.02))*vec2(1.5,1.0);
 c+=vec3(.75,.30,.08)*exp(-dot(q,q)*3.2)*.7;
 vec2 v=vUv-.5;
 c*=1.0-dot(v,v)*.8;
 c+=(hash(floor(vUv*uResolution/(1.4*u)))-.5)*.06;
 gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
}`;
// A home video tape: the picture split into brightness and colour as a VHS recorder does, the colour smeared and late
// along each line, every line a hair off its neighbours and the bottom few torn sideways (the head switch), a few
// specks of tape noise and faint lines. Still, as every Look is: nothing moves with time.
const CAMCORDER_BODY=`
vec3 toYiq(vec3 c){return vec3(dot(c,vec3(.299,.587,.114)),dot(c,vec3(.596,-.274,-.322)),dot(c,vec3(.211,-.523,.312)));}
vec3 fromYiq(vec3 y){return vec3(y.x+.956*y.y+.621*y.z,y.x-.272*y.y-.647*y.z,y.x-1.106*y.y+1.703*y.z);}
void main(){
 float u=unit();
 float row=floor(vUv.y*uResolution.y/(2.0*u));
 float jitter=(hash(vec2(row,7.0))-.5)*2.0*u*uTexel.x+(1.0-smoothstep(0.0,.07,vUv.y))*(.01+hash(vec2(row,3.0))*.02);
 vec2 p=vec2(vUv.x+jitter,vUv.y);
 float y=0.0;vec2 iq=vec2(0.0);
 for(int i=-2;i<=2;i++){y+=toYiq(texture2D(tDiffuse,p+vec2(float(i)*2.2*u*uTexel.x,0.0)).rgb).x*(i==0?.32:.17);}
 for(int i=0;i<8;i++){iq+=toYiq(texture2D(tDiffuse,p+vec2((float(i)+1.5)*5.0*u*uTexel.x,0.0)).rgb).yz;}
 vec3 c=fromYiq(vec3(y*.96+.03,iq/8.0*1.45));
 c+=step(.998,hash(vec2(floor(vUv.x*uResolution.x/(4.0*u)),row)))*.4;
 c*=.88+.12*step(.5,fract(vUv.y*uResolution.y/(3.0*u)));
 c=mix(c,vec3(luma(c)),.06);
 c=c*vec3(1.06,1.0,.94)*1.04-.02;
 gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
}`;
// A printed comic page: the picture separated into cyan, magenta, yellow and black, each printed as a grid of round
// dots at its own screen angle on cream paper, the dots as big as their ink's share of the colour.
const HALFTONE_BODY=`
float comicDot(vec2 px,float angle,float cell,float cover){
 float s=sin(angle),c=cos(angle);
 vec2 f=fract(mat2(c,-s,s,c)*px/cell)-.5;
 float r=sqrt(clamp(cover,0.0,1.0))*.62;
 return 1.0-smoothstep(r-.07,r+.07,length(f));
}
void main(){
 float u=unit(),cell=max(6.0,13.0*u);
 vec2 px=vUv*uResolution;
 vec3 c=texture2D(tDiffuse,vUv).rgb;
 float k=1.0-max(c.r,max(c.g,c.b));
 vec3 cmy=(1.0-c-k)/max(1.0-k,.001)*.9;
 vec3 col=vec3(.98,.96,.90);
 col*=mix(vec3(1.0),vec3(0.0,.66,.92),comicDot(px,.26,cell,cmy.x));
 col*=mix(vec3(1.0),vec3(.92,.16,.52),comicDot(px,1.31,cell,cmy.y));
 col*=mix(vec3(1.0),vec3(1.0,.90,.05),comicDot(px,0.0,cell,cmy.z));
 // Black only where the picture is truly dark, as a comic's key plate: the shadows, not every middle tone.
 col*=mix(vec3(1.0),vec3(.13,.12,.14),comicDot(px,.79,cell,smoothstep(.38,1.0,k)*.95));
 gl_FragColor=vec4(col,1.0);
}`;
// A cyanotype: the light of the picture printed from Prussian blue to paper white, with the paper's grain and its
// brushed-on edges a little darker.
const CYANOTYPE_BODY=`
void main(){
 float u=unit();
 float l=pow(smoothstep(.04,.96,luma(texture2D(tDiffuse,vUv).rgb)),.85);
 vec3 deep=vec3(.03,.17,.36),mid=vec3(.13,.39,.62),paper=vec3(.90,.94,.95);
 vec3 col=l<.5?mix(deep,mid,l*2.0):mix(mid,paper,(l-.5)*2.0);
 col+=(noise(vUv*uResolution/(3.0*u))-.5)*.05;
 vec2 v=vUv-.5;
 col*=1.0-dot(v,v)*.35;
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;
// Night vision: the picture's light amplified into green phosphor, the bright parts glowing out a little, grain and
// faint lines, seen through the round end of an image tube.
const NIGHT_BODY=`
void main(){
 float u=unit();
 vec3 c=texture2D(tDiffuse,vUv).rgb,g=vec3(0.0);
 for(int i=0;i<8;i++){float a=float(i)*.785;g+=texture2D(tDiffuse,vUv+vec2(cos(a),sin(a))*uTexel*5.0*u).rgb;}
 float l=smoothstep(.03,.95,luma(c)*.85+luma(g/8.0)*.3);
 l=pow(l,.9);
 l+=(hash(floor(vUv*uResolution/(1.5*u)))-.5)*.14;
 l*=.92+.08*step(.5,fract(vUv.y*uResolution.y/(3.0*u)));
 vec2 v=(vUv-.5)*vec2(uResolution.x/uResolution.y,1.0);
 float tube=1.0-smoothstep(.42,.72,length(v));
 gl_FragColor=vec4(clamp(vec3(.10,1.0,.32)*l*tube+vec3(0.0,.03,0.0),0.0,1.0),1.0);
}`;
/** The camera's own Looks: each a main of its own over World's shared helpers (Cartoon's program supplies them). */
const CAMERA_BODIES={adventureInk:ADVENTURE_BODY,instant:INSTANT_BODY,camcorder:CAMCORDER_BODY,halftone:HALFTONE_BODY,cyanotype:CYANOTYPE_BODY,nightVision:NIGHT_BODY};

/** In the order World's menu offers them. */
export const LOOK_NAMES=Object.freeze(Object.keys(LOOKS));
/** The trick lenses, as the hand-held cameras had them: Twin mirrors the left half onto the right, Quad the top left
 * quarter into all four. */
export const TRICKS=Object.freeze(['none','twin','quad']);
/** The longest side and the most pixels a save may have (iOS Safari refuses canvases over 16.7 million pixels). */
export const MAX_SIDE=4096,MAX_PIXELS=16e6;

const WORLD_UNIT='float unit(){return max(1.0,uResolution.y/1080.0);}';
const PHOTO_UNIT='uniform float uLines;uniform float uUnitFloor;\nfloat unit(){return max(uUnitFloor,uResolution.y/uLines);}';

/** World's fragment for a Look as GLSL ES 3.00, mixed into its input by uAmount; null for Natural. */
export function photoFragment(name,{light=false}={}){
 const own=CAMERA_BODIES[name];
 let world=lookFragment(own?'flat':name,{light,depth:false});
 if(!world)return null;
 if(own){
  // flat's program is the final main after the shared helpers; replace only it, retaining the camera conversion.
  const main=world.lastIndexOf('void main()');
  if(main<0)throw new Error('World Look helper entry point changed');
  world=world.slice(0,main)+own;
 }
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
export const lookDrawsLines=name=>name==='adventureInk'||(name!=='none'&&lookUsesDepth(name));
/**
 * The Looks that print a picture in a few inks at fixed thresholds. World's town is bright and evenly lit, and they
 * are set for it; a photo of a shady garden would print almost solid. So, as the town's Pocket camera exposes each
 * photo before its dither (src/photo/pocket-camera.js), a picture is exposed for them first: its average brought to
 * the town's middle.
 */
export const INK_LOOKS=Object.freeze(['pocket','snes','lines','manga','print','riso','pencilManga','stamp','halftone','cyanotype','nightVision']);

/** A recipe with every field present and in range. */
export function normalRecipe(recipe={}){
 const n=(v,lo,hi,d)=>Number.isFinite(+v)?Math.min(hi,Math.max(lo,+v)):d;
 const layers=(Array.isArray(recipe.layers)?recipe.layers:[]).slice(0,3)
  .map(l=>({look:Object.hasOwn(LOOKS,l?.look)?l.look:'none',amount:n(l?.amount,0,1,1)}));
 if(!layers.length)layers.push({look:'none',amount:1});
 const a=recipe.adjust||{};
 // Stickers (stickers.js): centre, height as a share of the picture's height, angle in degrees, mirrored or not; a
 // balloon (lettering.js) also keeps its words.
 const stickers=(Array.isArray(recipe.stickers)?recipe.stickers:[]).filter(s=>typeof s?.id==='string').slice(0,40)
  .map(s=>({id:s.id,x:n(s.x,-.2,1.2,.5),y:n(s.y,-.2,1.2,.5),size:n(s.size,.015,1.6,.42),angle:n(s.angle,-3600,3600,0),flip:!!s.flip,
   ...(s.id.startsWith('balloon:')?{text:String(s.text??'').slice(0,140)}:{})}));
 return {layers,
  adjust:{light:n(a.light,-1,1,0),contrast:n(a.contrast,-1,1,0),colour:n(a.colour,-1,1,0),warmth:n(a.warmth,-1,1,0),pattern:n(a.pattern,-1,1,0),detail:n(a.detail,-1,1,0)},
  stamp:!!recipe.stamp,stickers,
  // The print's border (frames.js) and the trick lens.
  frame:typeof recipe.frame==='string'&&/^[a-z]{1,20}$/.test(recipe.frame)?recipe.frame:'none',
  trick:TRICKS.includes(recipe.trick)?recipe.trick:'none'};
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
uniform float uMirror,uSmooth,uAuto,uBias,uTrick,uLight,uContrast,uColour,uWarmth;
uniform vec2 uStep;
uniform float uMeanLod;
float luma(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
vec3 at(vec2 p){
 if(uTrick>.5)p.x=.5-abs(p.x-.5);
 if(uTrick>1.5)p.y=.5+abs(p.y-.5);
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
  // The average of the part of the picture that is kept (the crop, so the viewfinder and the save agree), from nine
  // samples of a mipmap about a third of it across.
  float mean=0.0;
  for(int j=0;j<3;j++)for(int i=0;i<3;i++)mean+=luma(textureLod(tSource,uCrop.xy+(vec2(i,j)+.5)/3.0*uCrop.zw,uMeanLod).rgb);
  mean=clamp(mean/9.0,.02,.98);
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
  // A lost context answers nothing; that is not the shader's fault, so nothing is marked as failed.
  if(gl.isContextLost())return entry;
  if(!gl.getProgramParameter(entry.program,gl.LINK_STATUS)){
   entry.failed=true;console.error(`Pocket Camera: ${key} did not compile`,gl.getShaderInfoLog(entry.fragment)||gl.getProgramInfoLog(entry.program));return entry;
  }
  const u={},count=gl.getProgramParameter(entry.program,gl.ACTIVE_UNIFORMS);
  for(let i=0;i<count;i++){const name=gl.getActiveUniform(entry.program,i).name;u[name]=gl.getUniformLocation(entry.program,name);}
  entry.uniforms=u;return entry;
 }
 // Only the Looks with a lighter build (#ifdef LIGHT: Oil, Heavy brush) have two programs on a phone.
 const lighter=new Map(),hasLight=name=>{if(!lighter.has(name))lighter.set(name,/#ifdef LIGHT/.test(photoFragment(name)||''));return lighter.get(name);};
 const lookKey=(name,full)=>name+(full||!light||!hasLight(name)?':full':':light');
 /** Starts compiling a Look without waiting for it (thumbnails ask for every Look at once). */
 function request(name,full=false){
  const key=lookKey(name,full);
  return programs.get(key)||build(key,photoFragment(name,{light:key.endsWith(':light')}));
 }
 const ready=entry=>entry.uniforms||entry.failed||!parallel||gl.getProgramParameter(entry.program,parallel.COMPLETION_STATUS_KHR);
 /** The compiled program for a Look, compiling it now if need be; null if it failed. */
 function look(name,full=false){
  if(gl.isContextLost())return undefined;
  const key=lookKey(name,full),e=finish(request(name,full),key);
  // A full build that will not compile on this device falls back to the light one.
  if(e.failed&&full&&key!==lookKey(name,false))return look(name,false);
  return e.failed?null:e;
 }
 const fixed=(key,text)=>{const e=finish(programs.get(key)||build(key,text),key);return e.failed||!e.uniforms?null:e;};

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
 function prepare(recipe,source,crop,mirror,w,h,smooth,auto){
  const a=recipe.adjust,s=sources.get(source);
  const meanLod=Math.max(0,Math.log2(Math.max(crop.w*s.width,crop.h*s.height)/3));
  // A Look that draws lines finds them in the detail of a picture about as tall as its patterns are sized for (the
  // viewfinder's): a larger save reads its source that much softer, so its lines are the viewfinder's lines, not the
  // floor's grain as well. Patterns, outlines and dots are still drawn at the save's full size.
  // Detail: less (-1) smooths wider and reads softer still, for fewer, bolder lines; more (+1) smooths nothing.
  const d=a.detail||0,bias=smooth?Math.max(0,Math.log2(h/(1080*2**-a.pattern))*(1-Math.max(0,d))+Math.max(0,-d)*1.3):0;
  const smoothing=smooth?Math.min(1,1-d):0,reach=2**-d;
  return u=>{
   f1(u.uBias,bias);f1(u.uMeanLod,meanLod);
   gl.uniform4f(u.uCrop,crop.x,crop.y,crop.w,crop.h);f1(u.uMirror,mirror?1:0);f1(u.uSmooth,smoothing);f1(u.uAuto,auto?1:0);
   f1(u.uTrick,TRICKS.indexOf(recipe.trick||'none'));
   // Smoothing reaches about a thousandth of the picture's height, whatever its size.
   if(u.uStep)gl.uniform2f(u.uStep,reach*h/(900*w),reach/900);
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
  * Runs a recipe from a source into `output` (a framebuffer, null for the canvas, or 'pair' to leave the result in the
  * target pair and get its framebuffer back). Returns false while a Look in it is still compiling (nothing is drawn
  * then), so a frame never shows half a recipe. `expose` exposes the picture as for an ink Look whatever the recipe.
  */
 function run(recipe,{source,crop={x:0,y:0,w:1,h:1},mirror=false,width,height,output=null,viewport,targetName='view',full=false,tile=0,layers=recipe.layers,expose=false}){
  if(!sources.has(source)||gl.isContextLost())return false;
  const active=layers.filter(l=>l.look!=='none'&&l.amount>0);
  const entries=active.map(l=>full?look(l.look,true):(ready(request(l.look))?look(l.look):undefined));
  if(entries.some(e=>e===undefined))return false;
  if(full&&entries.some(e=>!e))throw new Error(`${active[entries.indexOf(null)].look} cannot be drawn on this device`);
  const prep=fixed('prepare',PREPARE),src=sources.get(source).t,intoPair=output==='pair';
  if(!prep)return false;
  const steps=active.map((l,i)=>({layer:l,entry:entries[i]})).filter(s=>s.entry);
  const smooth=steps.some(s=>lookDrawsLines(s.layer.look)),auto=expose||steps.some(s=>INK_LOOKS.includes(s.layer.look));
  const vp=viewport||[0,0,width,height];
  if(!steps.length&&!intoPair){pass(prep,src,output,vp,prepare(recipe,source,crop,mirror,width,height,false,auto),tile);return true;}
  const p=pair(targetName,width,height);let read=0;
  pass(prep,src,p.items[0].f,[0,0,width,height],prepare(recipe,source,crop,mirror,width,height,smooth,auto),tile);
  steps.forEach(({layer,entry},i)=>{
   const last=i===steps.length-1&&!intoPair;
   pass(entry,p.items[read].t,last?output:p.items[1-read].f,last?vp:[0,0,width,height],lookUniforms(layer.amount,width,height,recipe.adjust.pattern),tile);
   read=1-read;
  });
  return intoPair?p.items[read].f:true;
 }

 return {
  gl,maxTexture,
  setSource,dropSource,hasSource:name=>sources.has(name),
  sourceSize:name=>{const s=sources.get(name);return s?{width:s.width,height:s.height}:null;},
  /** Starts compiling Looks in the background. */
  warm(names){if(parallel)for(const n of names)if(n!=='none')request(n);},
  isReady:name=>name==='none'||ready(request(name)),
  /** Draws a recipe on the canvas at the canvas's own size. */
  draw(recipe,options){
   // The full builds a save will use start compiling now, not when the shutter is pressed.
   if(light)for(const l of recipe.layers)if(l.look!=='none'&&hasLight(l.look))request(l.look,true);
   return run(recipe,{...options,width:canvas.width,height:canvas.height,output:null});
  },
  /**
   * Draws one small square per Look into an atlas and hands back its pixels (rows top first): each Look as the
   * chosen layer would be, over the layers before it. Looks still compiling are left out (`missing`).
   */
  thumbnails(recipe,{source,crop,mirror,size,names,layer=0}){
   if(!sources.has(source)||gl.isContextLost())return null;
   const n=names.length,w=size*n,h=size,atlas=pair('atlas',w,h),missing=[];
   gl.bindFramebuffer(gl.FRAMEBUFFER,atlas.items[0].f);gl.viewport(0,0,w,h);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
   const before={...recipe,layers:recipe.layers.slice(0,layer)};
   // Two pictures to draw the tiles over: as the layers before leave it, and exposed for an ink Look, as choosing one
   // would expose it.
   const base=pair('thumb-base',size,size);
   if(!run(before,{source,crop,mirror,width:size,height:size,output:base.items[0].f,targetName:'thumb'}))return null;
   if(!run(before,{source,crop,mirror,width:size,height:size,output:base.items[1].f,targetName:'thumb',expose:true}))return null;
   // Without background compiling, a few new Looks are compiled per call, so the strip fills in without a long stall.
   let budget=parallel?Infinity:3;
   names.forEach((name,i)=>{
    if(name==='none'){const copy=fixed('copy',COPY);if(copy)pass(copy,base.items[0].t,atlas.items[0].f,[i*size,0,size,size]);return;}
    const e=programs.get(lookKey(name,false));
    if(!e&&budget<=0){missing.push(name);return;}
    if(!e)budget--;
    if(!ready(request(name))){missing.push(name);return;}
    const entry=look(name);if(!entry){missing.push(name);return;}
    pass(entry,base.items[INK_LOOKS.includes(name)?1:0].t,atlas.items[0].f,[i*size,0,size,size],lookUniforms(1,size,size,recipe.adjust.pattern,.35));
   });
   const pixels=new Uint8Array(w*h*4);
   gl.bindFramebuffer(gl.FRAMEBUFFER,atlas.items[0].f);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
   return {width:w,height:h,data:flipRows(pixels,w,h),missing};
  },
  /** The recipe at full quality and full size, as pixels (rows top first). */
  render(recipe,{source,crop,mirror,width,height}){
   if(gl.isContextLost())throw new Error('The graphics were lost');
   try{
    const result=run(recipe,{source,crop,mirror,width,height,output:'pair',targetName:'export',full:true,tile:1024});
    if(!result)throw new Error('The picture could not be drawn');
    const pixels=new Uint8Array(width*height*4);
    gl.bindFramebuffer(gl.FRAMEBUFFER,result);gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
    // A context lost while drawing reads back nothing: never hand that on as a black photo.
    if(gl.isContextLost())throw new Error('The graphics were lost');
    return {width,height,data:flipRows(pixels,width,height)};
   }finally{release('export');}
  },
  failed:name=>!!programs.get(lookKey(name,false))?.failed,
  lost:()=>gl.isContextLost(),
 };
}

/** WebGL reads rows bottom first; pictures want them top first. Turned over in place: a save is too big to copy. */
export function flipRows(pixels,w,h){
 const row=w*4,spare=new Uint8Array(row);
 for(let top=0,bottom=h-1;top<bottom;top++,bottom--){
  const a=pixels.subarray(top*row,(top+1)*row),b=pixels.subarray(bottom*row,(bottom+1)*row);
  spare.set(a);a.set(b);b.set(spare);
 }
 return new Uint8ClampedArray(pixels.buffer,pixels.byteOffset,pixels.length);
}
