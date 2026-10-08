import * as THREE from '../../vendor/three.module.js';

/**
 * Keeps the bath wrap (build.js, addTowel) outside the body in every pose.
 *
 * The wrap is skinned like a skirt: the torso's weights above the hips, a drape onto each
 * thigh below. That is right standing still, but a jointed body bends where cloth cannot
 * follow by weights alone: a stride scissors the thighs through the middle of the cloth, and
 * on a seat or a bath step the thighs swing up through the lap. So after skinning, each
 * vertex of the wrap is pushed out of the body, the way the swing bones (springs.js) push a
 * hem out of the legs:
 *  - out of the pelvis (an elliptic cylinder, the torso lathe's own outline at the hips);
 *  - out of each thigh and shin (the capsules addBody makes the legs from);
 *  - and, first, when seated, not below the thighs' underside, where the seat is: the cloth
 *    is sat on, so it lies on the seat instead of hanging down into it.
 * It runs in the vertex shader, on the bones' pose this frame, so it costs nothing on the
 * CPU and never lags a frame behind. `fitPoint` is the same sum in JavaScript, for tests.
 */
const GLSL=`
attribute float towelFit;
uniform vec3 uLegA[4];
uniform vec3 uLegB[4];
uniform vec2 uLegR[4];
uniform mat4 uHips;
uniform mat4 uHipsInv;
uniform vec3 uTorso;
uniform vec3 uTorsoY;
uniform float uSeat;
vec3 towelCapsule(vec3 p,vec3 a,vec3 b,vec2 r){
 vec3 ab=b-a;float u=clamp(dot(p-a,ab)/max(dot(ab,ab),1e-8),0.,1.);
 vec3 q=a+ab*u,d=p-q;float l=length(d),rad=mix(r.x,r.y,u);
 return l<rad&&l>1e-6?q+d*(rad/l):p;
}
vec3 towelFitPoint(vec3 p){
 vec3 h=(uHips*vec4(p,1.)).xyz;
 if(h.y>=uTorsoY.x&&h.y<=uTorsoY.z){
  float f=mix(.86,1.,clamp((h.y-uTorsoY.x)/max(uTorsoY.y-uTorsoY.x,1e-6),0.,1.));
  float q=length(vec2(h.x/(uTorso.x*f+uTorso.z),h.z/(uTorso.y*f+uTorso.z)));
  if(q<1.&&q>1e-6){h.xz/=q;p=(uHipsInv*vec4(h,1.)).xyz;}
 }
 p.y=max(p.y,uSeat);
 for(int i=0;i<4;i++)p=towelCapsule(p,uLegA[i],uLegB[i],uLegR[i]);
 return p;
}
`;
const NO_SEAT=-1e6;

/** The fit for one avatar: its uniforms, refreshed from the bones, the shader patch and the JS twin. */
export function createTowelFit(avatar,mesh){
 const m=avatar.measure,clear=.004*m.k,bones=avatar.bones;
 // The legs as addBody makes them: radius legR*1.02 at the hip tapering to .86 at the ankle.
 const legLength=m.hipY-m.foot,legR=down=>m.legR*(1.02-.16*down/legLength)+clear;
 const hipRatio=m.hips/m.width;
 const uniforms={
  uLegA:{value:Array.from({length:4},()=>new THREE.Vector3())},
  uLegB:{value:Array.from({length:4},()=>new THREE.Vector3())},
  uLegR:{value:[new THREE.Vector2(legR(0),legR(m.thigh)),new THREE.Vector2(legR(0),legR(m.thigh)),new THREE.Vector2(legR(m.thigh),legR(legLength)),new THREE.Vector2(legR(m.thigh),legR(legLength))]},
  uHips:{value:new THREE.Matrix4()},uHipsInv:{value:new THREE.Matrix4()},
  // The pelvis: the lathe's hip radius, narrowing to .86 of it at the seat of the torso
  // (torsoProfile), from there up to where the torso's skin starts to go with the chest.
  uTorso:{value:new THREE.Vector3(m.width/2*hipRatio,m.depth/2*hipRatio,clear)},
  uTorsoY:{value:new THREE.Vector3(m.hipY-m.torso*.08,m.hipY+m.torso*.05,m.hipY+m.torso*.15)},
  uSeat:{value:NO_SEAT},
 };
 const hipsIndex=mesh.skeleton.bones.indexOf(bones.hips),inverse=new THREE.Matrix4(),a=new THREE.Vector3(),b=new THREE.Vector3(),down=new THREE.Vector3();
 const legs=[['thighL','kneeL'],['thighR','kneeR'],['kneeL','footL'],['kneeR','footR']];
 /** Read this frame's pose (world matrices must be current, as they are when drawing). */
 function refresh(){
  inverse.copy(mesh.matrixWorld).invert();
  legs.forEach(([from,to],i)=>{uniforms.uLegA.value[i].setFromMatrixPosition(bones[from].matrixWorld).applyMatrix4(inverse);uniforms.uLegB.value[i].setFromMatrixPosition(bones[to].matrixWorld).applyMatrix4(inverse);});
  const posed=uniforms.uHipsInv.value.multiplyMatrices(inverse,bones.hips.matrixWorld).multiply(mesh.skeleton.boneInverses[hipsIndex]);
  uniforms.uHips.value.copy(posed).invert();
  // Seated (on a chair, a wash stool or a bath step) when both thighs are raised well
  // forward of the hips: the cloth under them rests on the seat, level with their underside.
  let seated=true,lowest=Infinity;
  for(let i=0;i<2;i++){
   a.copy(uniforms.uLegA.value[i]).applyMatrix4(uniforms.uHips.value);b.copy(uniforms.uLegB.value[i]).applyMatrix4(uniforms.uHips.value);
   if(down.subVectors(b,a).normalize().y<-Math.cos(1.1))seated=false;
   lowest=Math.min(lowest,uniforms.uLegA.value[i].y);
  }
  uniforms.uSeat.value=seated?lowest-legR(0):NO_SEAT;
  return uniforms;
 }
 const h=new THREE.Vector3(),q=new THREE.Vector3(),ab=new THREE.Vector3(),d=new THREE.Vector3();
 /** The shader's towelFitPoint, in JavaScript: a posed point (mesh space) out of the body. */
 function fitPoint(p){
  const u=uniforms;
  h.copy(p).applyMatrix4(u.uHips.value);
  const [yMin,yHip,yMax]=u.uTorsoY.value.toArray();
  if(h.y>=yMin&&h.y<=yMax){
   const f=THREE.MathUtils.lerp(.86,1,THREE.MathUtils.clamp((h.y-yMin)/Math.max(yHip-yMin,1e-6),0,1)),T=u.uTorso.value;
   const s=Math.hypot(h.x/(T.x*f+T.z),h.z/(T.y*f+T.z));
   if(s<1&&s>1e-6){h.x/=s;h.z/=s;p.copy(h).applyMatrix4(u.uHipsInv.value);}
  }
  p.y=Math.max(p.y,u.uSeat.value);
  for(let i=0;i<4;i++){
   const A=u.uLegA.value[i],B=u.uLegB.value[i],r=u.uLegR.value[i];
   ab.subVectors(B,A);const t=THREE.MathUtils.clamp(d.subVectors(p,A).dot(ab)/Math.max(ab.lengthSq(),1e-8),0,1);
   q.copy(A).addScaledVector(ab,t);d.subVectors(p,q);const l=d.length(),rad=THREE.MathUtils.lerp(r.x,r.y,t);
   if(l<rad&&l>1e-6)p.copy(q).addScaledVector(d,rad/l);
  }
  return p;
 }
 /** Adds the fit to a material's vertex shader, after skinning, for the wrap's vertices only. */
 function patch(shader){
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader=GLSL+shader.vertexShader.replace('#include <skinning_vertex>','#include <skinning_vertex>\n if( towelFit > 0.5 ) transformed = towelFitPoint( transformed );');
 }
 /** A material that draws `material` with the fit (its own compile hook kept). */
 function fitted(material,key){
  const base=material.onBeforeCompile,baseKey=material.customProgramCacheKey?.bind(material);
  material.onBeforeCompile=(shader,renderer)=>{base?.call(material,shader,renderer);patch(shader);};
  material.customProgramCacheKey=()=>'towel-fit-'+key+(baseKey?baseKey():'');
  return material;
 }
 return {uniforms,refresh,fitPoint,patch,fitted};
}
