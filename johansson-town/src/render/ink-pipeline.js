import * as THREE from '../../vendor/three.module.js';

/**
 * The 3D-to-2D pass: what turns a lit 3D town into a drawn one.
 *
 *   scene -> rtScene (colour + depth)  ->  ink  ->  grade  ->  fxaa  ->  screen
 *
 * Ported from Sakura Crossing by Kenton-GMI (MIT). The shading maths is theirs; the
 * plumbing is not, because this town does not render in one call. Outdoors goes
 * through the section culler, the market draws the street through the shop glazing
 * and then composites the interior over it with autoClear off, and the inspector has
 * its own pass entirely. So the pipeline takes a *callback*: it binds the target,
 * hands the renderer back to whichever path is in charge, and only then runs the
 * chain. Every path gets the look without any of them knowing about it.
 *
 * Lines come from the second difference of linearised depth. A first difference
 * smears ink across the road wherever a surface grazes the camera; a second
 * difference is flat across any plane however oblique, so it fires only on real
 * silhouettes and real creases. Positive curvature (the near side of a silhouette, a
 * roof ridge) inks strongly, negative curvature (inside corners) faintly — which is
 * how an animator draws contact lines.
 */

export const INK_DEFAULTS={
 thickness:1.35,
 sensitivity:0.0042,
 concave:0.026,
 concaveAmount:0.42,
 fadeStart:40,
 fadeEnd:98,
 strength:1,
 // Past this the picture is sky or far horizon; inking it makes the distance busy.
 skyDepth:180
};

export const GRADE_DEFAULTS={
 shadowTint:0xada8d0,
 lightTint:0xfff7e8,
 saturation:1.12,
 lift:0.032,
 vignette:0.15,
 warmth:0.05
};

const QUAD_VERTEX=`
varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}
`;

const INK_FRAGMENT=`
#include <packing>
uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform vec2 uTexel;
uniform float uNear,uFar;
uniform vec3 uInk;
uniform float uThickness,uSens,uConcave,uConcaveAmount;
uniform float uFadeStart,uFadeEnd,uStrength,uSkyDepth;
varying vec2 vUv;

float linearDepth(vec2 uv){
 float d=texture2D(tDepth,uv).x;
 return -perspectiveDepthToViewZ(d,uNear,uFar);
}

void main(){
 vec3 col=texture2D(tDiffuse,vUv).rgb;
 vec2 t=uTexel*uThickness;
 float dc=linearDepth(vUv);
 if(dc>uSkyDepth){gl_FragColor=vec4(col,1.0);return;}

 float dl=linearDepth(vUv-vec2(t.x,0.0));
 float dr=linearDepth(vUv+vec2(t.x,0.0));
 float du=linearDepth(vUv+vec2(0.0,t.y));
 float dd=linearDepth(vUv-vec2(0.0,t.y));

 float sx=(dl+dr-2.0*dc)/dc;
 float sy=(du+dd-2.0*dc)/dc;

 float convex=max(0.0,sx)+max(0.0,sy);
 float concave=max(0.0,-sx)+max(0.0,-sy);

 float edge=smoothstep(uSens*0.32,uSens,convex);
 edge=max(edge,smoothstep(uConcave,uConcave*3.4,concave)*uConcaveAmount);
 edge*=1.0-smoothstep(uFadeStart,uFadeEnd,dc);
 edge*=uStrength;

 // The line keeps a whisper of the colour under it, so it never looks pasted on.
 vec3 line=mix(uInk,col*0.42,0.22);
 gl_FragColor=vec4(mix(col,line,clamp(edge,0.0,1.0)),1.0);
}
`;

const GRADE_FRAGMENT=`
uniform sampler2D tDiffuse;
uniform vec3 uShadowTint,uLightTint;
uniform float uSaturation,uLift,uVignette,uWarmth,uAmount,uExposure;
varying vec2 vUv;

vec3 linearToSRGB(vec3 c){
 return mix(c*12.92,1.055*pow(max(c,vec3(0.0031308)),vec3(1.0/2.4))-0.055,step(0.0031308,c));
}

void main(){
 vec3 raw=texture2D(tDiffuse,vUv).rgb*uExposure;
 vec3 c=raw;
 float l=dot(c,vec3(0.2126,0.7152,0.0722));

 // Split tone: cool violet in the darks, warm paper white in the lights.
 float k=smoothstep(0.02,0.55,l);
 c*=mix(uShadowTint,uLightTint,k);

 c+=vec3(uWarmth,uWarmth*0.45,0.0)*l*0.35;
 // Shadows stay readable. An anime background never crushes to black.
 c=c+uLift*(1.0-k);
 c=mix(vec3(l),c,uSaturation);

 float r=length(vUv-0.5)*1.42;
 c*=1.0-uVignette*pow(clamp(r,0.0,1.0),2.6);

 // uAmount 0 leaves a plain linear->sRGB blit, so the grade can be compared away
 // without the pass dropping out of the chain and taking the picture with it.
 c=mix(raw,c,uAmount);

 gl_FragColor=vec4(linearToSRGB(max(c,vec3(0.0))),1.0);
}
`;

const FXAA_FRAGMENT=`
uniform sampler2D tDiffuse;
uniform vec2 uTexel;
varying vec2 vUv;
float luma(vec3 c){return dot(c,vec3(0.299,0.587,0.114));}
void main(){
 vec3 cM=texture2D(tDiffuse,vUv).rgb;
 vec3 cNW=texture2D(tDiffuse,vUv+vec2(-uTexel.x,-uTexel.y)).rgb;
 vec3 cNE=texture2D(tDiffuse,vUv+vec2( uTexel.x,-uTexel.y)).rgb;
 vec3 cSW=texture2D(tDiffuse,vUv+vec2(-uTexel.x, uTexel.y)).rgb;
 vec3 cSE=texture2D(tDiffuse,vUv+vec2( uTexel.x, uTexel.y)).rgb;
 float lM=luma(cM),lNW=luma(cNW),lNE=luma(cNE),lSW=luma(cSW),lSE=luma(cSE);
 float lMin=min(lM,min(min(lNW,lNE),min(lSW,lSE)));
 float lMax=max(lM,max(max(lNW,lNE),max(lSW,lSE)));
 vec2 dir=vec2(-((lNW+lNE)-(lSW+lSE)),((lNW+lSW)-(lNE+lSE)));
 float reduce=max((lNW+lNE+lSW+lSE)*0.25*0.18,1.0/128.0);
 float rcp=1.0/(min(abs(dir.x),abs(dir.y))+reduce);
 dir=clamp(dir*rcp,vec2(-8.0),vec2(8.0))*uTexel;
 vec3 rgbA=0.5*(texture2D(tDiffuse,vUv+dir*(1.0/3.0-0.5)).rgb+texture2D(tDiffuse,vUv+dir*(2.0/3.0-0.5)).rgb);
 vec3 rgbB=rgbA*0.5+0.25*(texture2D(tDiffuse,vUv-dir*0.5).rgb+texture2D(tDiffuse,vUv+dir*0.5).rgb);
 float lB=luma(rgbB);
 gl_FragColor=vec4((lB<lMin||lB>lMax)?rgbA:rgbB,1.0);
}
`;

/**
 * A screen-filling triangle-pair. three's own FullScreenQuad lives in the addons,
 * which are not vendored here, and it is four lines.
 */
function makeQuad(fragmentShader,uniforms){
 const material=new THREE.ShaderMaterial({
  uniforms,vertexShader:QUAD_VERTEX,fragmentShader,
  depthTest:false,depthWrite:false
 });
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);
 mesh.frustumCulled=false;
 const scene=new THREE.Scene();scene.add(mesh);
 // The vertex shader writes clip space directly, so the camera is never read.
 const camera=new THREE.Camera();
 return {
  material,
  render(renderer){renderer.render(scene,camera);},
  dispose(){mesh.geometry.dispose();material.dispose();}
 };
}

/**
 * @param {THREE.WebGLRenderer} renderer
 * @param {object} [options]
 * @param {number} [options.superScale] render-target scale; >1 supersamples for cleaner ink
 * @param {number} [options.pixelBudget] hard ceiling on render-target pixels
 * @param {boolean} [options.fxaa]
 * @param {number} [options.ink] ink colour
 */
export function createInkPipeline(renderer,{superScale=1.5,pixelBudget=4.6e6,fxaa=true,ink=0x2b2a33,inkOptions={},gradeOptions={}}={}){
 const capabilities=renderer.capabilities||{};
 // Half-float keeps the grade from banding. Where it is not available the chain
 // still runs, just on eight bits.
 const halfFloat=capabilities.isWebGL2!==false;
 const targetOptions={
  type:halfFloat?THREE.HalfFloatType:THREE.UnsignedByteType,
  minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,
  stencilBuffer:false,
  colorSpace:THREE.NoColorSpace
 };
 const rtScene=new THREE.WebGLRenderTarget(2,2,{...targetOptions,depthBuffer:true});
 rtScene.depthTexture=new THREE.DepthTexture(2,2);
 rtScene.depthTexture.format=THREE.DepthFormat;
 rtScene.depthTexture.type=THREE.UnsignedIntType;
 rtScene.depthTexture.minFilter=rtScene.depthTexture.magFilter=THREE.NearestFilter;
 const rtA=new THREE.WebGLRenderTarget(2,2,{...targetOptions,depthBuffer:false});
 const rtB=new THREE.WebGLRenderTarget(2,2,{...targetOptions,type:THREE.UnsignedByteType,depthBuffer:false});

 const settings={...INK_DEFAULTS,...inkOptions};
 const grading={...GRADE_DEFAULTS,...gradeOptions};

 const inkPass=makeQuad(INK_FRAGMENT,{
  tDiffuse:{value:null},tDepth:{value:rtScene.depthTexture},
  uTexel:{value:new THREE.Vector2(1,1)},
  uNear:{value:0.1},uFar:{value:220},
  uInk:{value:new THREE.Color(ink)},
  uThickness:{value:settings.thickness},
  uSens:{value:settings.sensitivity},
  uConcave:{value:settings.concave},
  uConcaveAmount:{value:settings.concaveAmount},
  uFadeStart:{value:settings.fadeStart},
  uFadeEnd:{value:settings.fadeEnd},
  uStrength:{value:settings.strength},
  uSkyDepth:{value:settings.skyDepth}
 });
 const gradePass=makeQuad(GRADE_FRAGMENT,{
  tDiffuse:{value:null},
  uShadowTint:{value:new THREE.Color(grading.shadowTint)},
  uLightTint:{value:new THREE.Color(grading.lightTint)},
  uSaturation:{value:grading.saturation},
  uLift:{value:grading.lift},
  uVignette:{value:grading.vignette},
  uWarmth:{value:grading.warmth},
  uAmount:{value:1},
  uExposure:{value:1}
 });
 const fxaaPass=makeQuad(FXAA_FRAGMENT,{tDiffuse:{value:null},uTexel:{value:new THREE.Vector2(1,1)}});

 const size=new THREE.Vector2(0,0);
 const state={ink:true,grade:true,fxaa,scale:superScale};
 let width=0,height=0;

 /** Sizes the targets to whatever the renderer is currently drawing into. */
 function resize(){
  const buffer=renderer.getDrawingBufferSize(new THREE.Vector2());
  const w=Math.max(2,Math.floor(buffer.x)),h=Math.max(2,Math.floor(buffer.y));
  let scale=state.scale;
  if(w*h*scale*scale>pixelBudget)scale=Math.max(1,Math.sqrt(pixelBudget/(w*h)));
  const rw=Math.max(2,Math.floor(w*scale)),rh=Math.max(2,Math.floor(h*scale));
  if(rw===width&&rh===height)return false;
  width=rw;height=rh;size.set(rw,rh);
  rtScene.setSize(rw,rh);rtA.setSize(rw,rh);rtB.setSize(rw,rh);
  const texel=new THREE.Vector2(1/rw,1/rh);
  inkPass.material.uniforms.uTexel.value.copy(texel);
  fxaaPass.material.uniforms.uTexel.value.copy(texel);
  // Keep the line roughly two device pixels wide whatever we are rendering at.
  inkPass.material.uniforms.uThickness.value=(settings.thickness/1.35)*(1.05+0.55*scale);
  return true;
 }

 return {
  size,state,
  get width(){return width;},
  get height(){return height;},
  resize,
  /**
   * Sets ink/grade uniforms by name, for tuning the look against the actual town
   * rather than against the numbers. Colours are accepted as hex.
   * @param {Record<string,number>} values
   */
  tune(values={}){
   for(const [name,value] of Object.entries(values)){
    const uniform=inkPass.material.uniforms[name]||gradePass.material.uniforms[name];
    if(!uniform)continue;
    if(uniform.value&&uniform.value.isColor)uniform.value.set(value);
    else uniform.value=value;
   }
  },
  /** Time of day still lifts the picture; with tone mapping off the grade carries it. */
  setExposure(value){gradePass.material.uniforms.uExposure.value=value;},
  /** Camera clip planes feed the depth linearisation; re-read them each frame. */
  setCamera(camera){
   if(!camera)return;
   inkPass.material.uniforms.uNear.value=camera.near;
   inkPass.material.uniforms.uFar.value=camera.far;
  },
  /**
   * Runs `draw(renderer)` into the offscreen target, then the chain onto the screen.
   * `draw` may render as many times as it likes; multi-pass compositing with
   * autoClear off behaves exactly as it does against the default framebuffer.
   */
  render(draw){
   resize();
   const previousTarget=renderer.getRenderTarget();
   renderer.setRenderTarget(rtScene);
   renderer.clear();
   try{draw(renderer);}
   finally{renderer.setRenderTarget(previousTarget);}

   let source=rtScene.texture;
   if(state.ink){
    inkPass.material.uniforms.tDiffuse.value=source;
    renderer.setRenderTarget(rtA);
    inkPass.render(renderer);
    source=rtA.texture;
   }

   // The grade is not optional as a *pass*: everything upstream is linear and it is
   // what converts to sRGB, so skipping it would put a washed-out image on screen.
   // Turning the grade "off" zeroes its look and leaves the conversion.
   gradePass.material.uniforms.uAmount.value=state.grade?1:0;
   gradePass.material.uniforms.tDiffuse.value=source;
   renderer.setRenderTarget(state.fxaa?rtB:null);
   gradePass.render(renderer);

   if(state.fxaa){
    fxaaPass.material.uniforms.tDiffuse.value=rtB.texture;
    renderer.setRenderTarget(null);
    fxaaPass.render(renderer);
   }
   renderer.setRenderTarget(null);
  },
  dispose(){
   [rtScene,rtA,rtB].forEach(rt=>rt.dispose());
   [inkPass,gradePass,fxaaPass].forEach(p=>p.dispose());
  }
 };
}
