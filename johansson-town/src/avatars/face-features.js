import * as THREE from '../../vendor/three.module.js';
import {celFrom} from '../render/cel.js';
import {moodOf} from './face.js';

/**
 * Brows and a mouth that move, for a modelled face (pixar.js; the creator, 26 October 2026: "I think you need to rig the
 * nose and eyebrows and mouth too"). The studio paints a face's own brows and mouth out of its texture and lays a shallow
 * decal over each place (jojo `3d/cast/game_thuan.py`); these shaders draw them there, in the feature's own units (her
 * eye's: x outward, y up), from her own measures (the card), shaped by the feeling World's painter uses for every face
 * (face.js moodOf): brows that rise, pinch and drop, a mouth that smiles, frowns, opens, rounds into an O and talks.
 * Drawn on the town's ramp (cel.js), blended onto the skin, writing no depth, as the rigged eyes are (eyes3d.js).
 */

const HEAD='attribute vec3 featureLocal;\nvarying vec3 vFeature;\n';

const BROWS=`varying vec3 vFeature;
uniform float uBrowShapeL[8],uBrowShapeR[8];
uniform vec4 uBrowL,uBrowR;
uniform vec3 uBrowInk;
float B[8];
float browLine(float x){return B[2]*x*x+B[3]*x+B[4];}
float browHalf(float x){return max(.25,B[5]*x*x+B[6]*x+B[7]);}
// A brow: its own painted arc (x0 inner .. x1 outer, its middle line and half thickness: each side its own, not mirrored),
// lifted (lift), turned at the inner end (tilt: + down, a frown; - up, a worry), arched and pinched toward the nose, as
// uBrowL/R say for each side.
vec4 browsPaint(){
 vec2 p=vFeature.xy;bool left=vFeature.z>0.;vec4 e=left?uBrowL:uBrowR;
 for(int i=0;i<8;i++)B[i]=left?uBrowShapeL[i]:uBrowShapeR[i];
 float x0=B[0],x1=B[1],w=.8*max(length(fwidth(p)),1e-3),inner=x0-e.w;
 float s=clamp((p.x-inner)/(x1-inner),0.,1.),xr=x0+s*(x1-x0);
 float y=browLine(xr)+e.x-e.y*(1.-s)*(1.-s)+e.y*.3*s*s+e.z*4.*s*(1.-s);
 float d=browHalf(xr)-abs(p.y-y);
 // round ends
 if(p.x<inner)d=browHalf(x0)-length(p-vec2(inner,browLine(x0)+e.x-e.y));
 else if(p.x>x1)d=browHalf(x1)-length(p-vec2(x1,browLine(x1)+e.x+e.y*.3));
 return vec4(uBrowInk,.96*smoothstep(-w,w,d));
}
`;

const MOUTH=`varying vec3 vFeature;
uniform float uMouthRest[16];
uniform float uMouth[10];
uniform vec3 uLip,uLipLow,uLipInk,uMouthIn,uTeeth,uTongue;
float mouthPoly(int o,float x){return (((uMouthRest[o]*x+uMouthRest[o+1])*x+uMouthRest[o+2])*x+uMouthRest[o+3])*x+uMouthRest[o+4];}
void mouthOver(inout vec4 acc,vec3 c,float k){acc=vec4(c*k+acc.rgb*(1.-k),k+acc.a*(1.-k));}
// Her mouth as painted (the line between the lips and their thickness across it, from the card), then the feeling's
// shape: the corners up (smile) or down, wider or narrower, open (the gap between the lips, with the upper teeth and
// the tongue), rounded into an O, one corner up (a smirk), puckered, or wobbling.
vec4 mouthPaint(){
 vec2 p=vFeature.xy-vec2(uMouth[9],0.);float w=.8*max(length(fwidth(p)),1e-3);
 float smile=uMouth[0],width=uMouth[1],open=uMouth[2],roundness=uMouth[3],teeth=uMouth[4],tongue=uMouth[5],asym=uMouth[6],pucker=uMouth[7],wob=uMouth[8];
 float half0=uMouthRest[0],W=half0*width*(1.-.42*roundness)*(1.-.4*pucker);
 float t=clamp(p.x/W,-1.,1.),xr=t*half0,edge=1.-t*t;
 float line=mouthPoly(1,xr)+smile*t*t+asym*max(t,0.)*max(t,0.)+wob*.6*sin(t*9.)*edge;
 float g=open*pow(max(edge,0.),mix(.7,.5,roundness));
 float top=line+g*.3,bot=line-g*.7;
 float up=max(mouthPoly(6,xr),0.)*(1.-.2*clamp(smile/3.,0.,1.))*(1.+.35*pucker)*mix(1.,sqrt(max(edge,0.)),roundness);
 float lo=max(mouthPoly(11,xr),0.)*(1.+.3*pucker)*(1.-.12*clamp(open/10.,0.,1.))*mix(1.,sqrt(max(edge,0.)),roundness);
 float ends=W-abs(p.x);
 vec4 col=vec4(0.);
 // the lips: the upper a shade darker, the lower fuller with a little light on it
 float k=smoothstep(-w,w,min(min(top+up-p.y,p.y-top+.2),ends));
 mouthOver(col,uLip*.92,k);
 float lowLight=smoothstep(.2,.8,(p.y-(bot-lo))/max(lo,.01))*(1.-smoothstep(.5,1.,(p.y-(bot-lo))/max(lo,.01)));
 k=smoothstep(-w,w,min(min(p.y-(bot-lo),bot-p.y+.2),ends));
 mouthOver(col,mix(uLipLow,uLipLow*1.12+.04,lowLight*.6),k);
 // the open mouth: deep and dark at the back, warmer toward the lips; the upper teeth, each its own, along the top;
 // the tongue low in it, lighter in the middle
 if(g>.05){
  float gap=min(min(top-p.y,p.y-bot),ends);
  float back=smoothstep(0.,max(g*.45,.5),gap);
  vec3 c=mix(uMouthIn*1.45,uMouthIn*.55,back);
  float tg=(g*.55)-length((p-vec2(0.,bot+g*.12))/vec2(W*.55,1.));
  c=mix(c,mix(uTongue*.8,uTongue*1.08,smoothstep(0.,g*.4,tg)),tongue*smoothstep(-w,w,tg));
  float tooth=p.y-(top-g*.32*teeth),gaps=abs(fract(p.x/(W*.27)+.5)-.5)*W*.27;
  vec3 enamel=mix(uTeeth*.82,uTeeth,smoothstep(0.,g*.18,tooth));
  enamel=mix(uTeeth*.7,enamel,smoothstep(.05,.3,gaps));
  c=mix(c,enamel,step(.01,teeth)*smoothstep(-w,w,tooth));
  mouthOver(col,c,smoothstep(-w,w,gap));
 }
 // the line between the lips, closed or nearly, and a crease past each corner when she smiles
 float closed=1.-smoothstep(.4,2.,g);
 mouthOver(col,uLipInk,.85*closed*smoothstep(-w,w,min(.42-abs(p.y-line),ends+.6)));
 // the creases at the corners when she smiles: a short tapered stroke up and out from each corner
 if(smile>.3){
  float cornerY=mouthPoly(1,half0)+smile,k2=clamp(smile/2.6,0.,1.);
  for(int i=0;i<2;i++){
   float sx=i==0?-1.:1.;vec2 a=vec2(sx*(W-.3),cornerY),b=a+vec2(sx*1.1,1.3*k2+.2);
   vec2 ab=b-a;float h=clamp(dot(p-a,ab)/dot(ab,ab),0.,1.),r=mix(.34,.12,h)-length(p-a-ab*h);
   mouthOver(col,uLipInk,.6*k2*smoothstep(-w,w,r));
  }
 }
 return vec4(col.rgb/max(col.a,1e-4),col.a);
}
`;

/** The material for one decal: the town's ramp, see-through round the feature, writing no depth (eyes3d.js rigEyes). */
function featureMaterial(name,shaderHead,paint,uniforms){
 const source=new THREE.MeshStandardMaterial({roughness:.75,emissive:0xffffff,emissiveIntensity:.05,transparent:true,depthWrite:false});
 const material=celFrom(source,{bands:'soft3'}),base=material.onBeforeCompile,baseKey=material.customProgramCacheKey.bind(material);
 material.name=name;
 material.onBeforeCompile=(shader,renderer)=>{base.call(material,shader,renderer);Object.assign(shader.uniforms,uniforms);
  shader.vertexShader=HEAD+shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n vFeature = featureLocal;');
  shader.fragmentShader=shaderHead+shader.fragmentShader
   .replace('#include <color_fragment>',`#include <color_fragment>\n diffuseColor = ${paint}();\n if ( diffuseColor.a < 0.004 ) discard;`)
   .replace('#include <emissivemap_fragment>','totalEmissiveRadiance *= diffuseColor.rgb;')
   .replace('#include <opaque_fragment>','outgoingLight = max( outgoingLight, diffuseColor.rgb * 0.5 );\n#include <opaque_fragment>');};
 material.customProgramCacheKey=()=>baseKey()+':'+name+'-v1';
 return {material,dispose(){material.dispose();source.dispose();}};
}

const colour=hex=>new THREE.Color(hex);

/** Brows on their decal, each its own ({left, right}: x0, x1, line, half; colour). `make(geometry, material)` makes the mesh
 *  (a skinned one for a skinned face). */
export function rigBrows(geometry,brows,{make=(g,m)=>new THREE.Mesh(g,m)}={}){
 const shape=b=>new Float32Array([b.x0,b.x1,...b.line,...b.half]);
 const uniforms={uBrowShapeL:{value:shape(brows.left)},uBrowShapeR:{value:shape(brows.right)},uBrowL:{value:new THREE.Vector4()},uBrowR:{value:new THREE.Vector4()},uBrowInk:{value:colour(brows.colour)}};
 const {material,dispose}=featureMaterial('Shimanchu brows',BROWS,'browsPaint',uniforms);
 const mesh=make(geometry,material);mesh.name='Shimanchu brows';mesh.castShadow=false;mesh.receiveShadow=true;mesh.renderOrder=-1;
 return {mesh,uniforms,
  /** Each side's [lift, tilt, arch, pinch] in the brow's units. */
  set(left,right){uniforms.uBrowL.value.set(...left);uniforms.uBrowR.value.set(...right);},
  dispose};
}

/** A mouth on its decal. */
export function rigMouth(geometry,mouth,{make=(g,m)=>new THREE.Mesh(g,m)}={}){
 const rest=new Float32Array([mouth.half,...mouth.line,...mouth.upper,...mouth.lower]),params=new Float32Array(10);
 const uniforms={uMouthRest:{value:rest},uMouth:{value:params},uLip:{value:colour(mouth.lip)},uLipLow:{value:colour(mouth.lowerLip)},
  uLipInk:{value:colour(mouth.ink).multiplyScalar(.62)},uMouthIn:{value:colour('#5b1e26')},uTeeth:{value:colour('#f4efe6')},uTongue:{value:colour('#d0676f')}};
 const {material,dispose}=featureMaterial('Shimanchu mouth',MOUTH,'mouthPaint',uniforms);
 const mesh=make(geometry,material);mesh.name='Shimanchu mouth';mesh.castShadow=false;mesh.receiveShadow=true;mesh.renderOrder=-1;
 return {mesh,uniforms,
  /** {smile, width, open, round, teeth, tongue, asym, pucker, wobble}, in the mouth's units (open: the gap's height). */
  set(m){params.set([m.smile,m.width,m.open,m.round,m.teeth,m.tongue,m.asym,m.pucker,m.wobble,m.shift]);},
  dispose};
}

// Each of the painter's mouths (face.js MOOD) as her mouth: corners (smile, + up), width, open (units), round (an O),
// teeth, tongue, asym (her left corner up: a smirk), pucker, wobble.
const MOUTHS=Object.freeze({
 rest:{},
 smile:{smile:1.6,width:1.05},soft:{smile:.7},
 grin:{smile:2.6,width:1.12,open:3.6,teeth:1},laugh:{smile:2.6,width:1.1,open:8,teeth:1,tongue:1},wide:{smile:2.2,width:1.16,open:1.6,teeth:.6},
 frown:{smile:-3.2,width:.92,pucker:.15},flat:{smile:-1.2,width:.96},wobble:{smile:-1.3,width:.92,wobble:1},
 small:{smile:.4,width:.72},hmm:{smile:-.4,width:.82,asym:1.4},smirk:{smile:.6,asym:2.6},
 snarl:{smile:-2.8,open:1.8,teeth:1,asym:1.4},teeth:{smile:-1.4,width:1.12,open:2.6,teeth:1},gritted:{smile:-1.4,width:1.12,open:2.2,teeth:1},
 o:{open:7,round:1,width:.62},jawdrop:{open:12,round:.6,width:.8},wail:{smile:-1.6,width:.92,open:10,round:.45,tongue:.6},yawn:{open:10,round:.75,width:.72},
 pucker:{pucker:1,round:.85,width:.55,open:.4},kiss:{pucker:1,round:.85,width:.55},bleh:{smile:1,open:3,tongue:1},drool:{smile:.8,open:1},
});
const DEFAULT_MOUTH={smile:0,width:1,open:0,round:0,teeth:0,tongue:0,asym:0,pucker:0,wobble:0,shift:0};
// Never twins (the creator's critique, 26 October 2026): each feeling's own lean, one side against the other. brow: added
// to [lift, tilt] of her left and her right brow; mouth: added to the mouth (shift: the mouth drawn to one side).
const LEAN=Object.freeze({
 angry:{left:[.2,-.15],right:[-.5,.3],mouth:{asym:.4}},grumpy:{left:[0,0],right:[-.6,.35],mouth:{asym:.6,shift:.8}},
 fuming:{right:[-.5,.3],mouth:{asym:.5}},raging:{right:[-.4,.3]},focus:{right:[-.4,.2]},scheme:{left:[.8,0],mouth:{asym:.8}},
 sad:{left:[.3,0],mouth:{shift:-.6}},worried:{left:[.5,-.2],mouth:{shift:-1,asym:-.3}},shy:{right:[.4,0],mouth:{shift:1.1}},
 embarrassed:{left:[.4,0],mouth:{shift:.9}},dismay:{left:[.4,0],mouth:{shift:-.8}},
 surprised:{left:[.7,0]},shock:{left:[.6,0],mouth:{shift:.4}},scared:{left:[.6,-.2],mouth:{shift:-.5}},excited:{left:[.5,0]},
 thinking:{left:[2.2,0],right:[-.6,.3],mouth:{shift:1.4}},hmm:{left:[2.2,0]},smile:{left:[.25,0],mouth:{asym:.25}},
 happy:{right:[.3,0],mouth:{asym:.3}},laugh:{left:[.4,0],mouth:{shift:.5}},
});

/**
 * What the face's features do in a face state ({expression, talk, blinkLeft, blinkRight}): the brows' [lift, tilt, arch,
 * pinch] each side, the mouth, and how far the cheeks rise, the nose scrunches and the jaw drops (pixar.js moves those
 * bones). Pure, for tests.
 */
export function featuresOf(state={}){
 const mood=moodOf(state.expression),talk=THREE.MathUtils.clamp(+state.talk||0,0,1);
 const mouth={...DEFAULT_MOUTH,...(MOUTHS[mood.mouth||'rest']||MOUTHS.rest)};
 // Talking opens a vowel over whatever the mouth is doing (the jaw comes with it), a little narrower.
 mouth.open=Math.min(13,mouth.open+talk*4.2);mouth.width*=1-.08*talk;mouth.teeth=Math.max(mouth.teeth,.45*talk);
 // The brows: the painter's lift and angle (its canvas units) in hers; a smug brow up on her left; the wink's side down.
 const lift=(mood.browLift||0)*.32,tilt=(mood.brow||0)*2.1,pinch=Math.max(0,mood.brow||0)*1.4;
 const winkL=mood.eyes==='wink'||state.blinkLeft>.5&&!(state.blinkRight>.5),winkR=state.blinkRight>.5&&!(state.blinkLeft>.5);
 const left=[lift+(mood.oneBrow?mood.oneBrow*.32:0)-(winkL?1.6:0),tilt+(winkL?.8:0),(mood.browLift||0)>8?.6:0,pinch];
 const right=[lift-(winkR?1.6:0),tilt+(winkR?.8:0),(mood.browLift||0)>8?.6:0,pinch];
 // Pain: the brows knitted down and together, the nose wrinkled, the cheeks pushed up under squeezed eyes, teeth clenched.
 const pain=mood.eyes==='pain';
 if(pain)for(const b of [left,right]){b[0]=-1;b[1]=2.8;b[3]=2.4;}
 const lean=LEAN[state.expression];
 if(lean){for(const [b,d] of [[left,lean.left],[right,lean.right]])if(d){b[0]+=d[0];b[1]+=d[1];}
  for(const [k,v] of Object.entries(lean.mouth||{}))mouth[k]+=v;}
 // The cheeks rise with a smile (and on a wink's side, and in pain), the nose scrunches with anger, pain and a big laugh.
 const smile=THREE.MathUtils.clamp(mouth.smile/2.6,0,1),happyEyes=['happy','smiling','content'].includes(mood.eyes)?.6:0;
 const cheeks=[Math.max(smile,happyEyes,pain?.8:0)+(winkL?.7:0),Math.max(smile,happyEyes,pain?.8:0)+(winkR?.7:0)].map(v=>Math.min(1,v));
 const scrunch=Math.min(1,Math.max(0,(mood.brow||0)/1.6)+(pain?.9:0)+(['laugh','gritted','teeth','snarl'].includes(mood.mouth)?.5:0));
 // The jaw drops with the mouth: the chin comes down and back, lengthening the face.
 const jaw=Math.min(1,mouth.open/10);
 return {brows:{left,right},mouth,cheeks,scrunch,jaw};
}
