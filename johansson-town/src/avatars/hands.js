import * as THREE from '../../vendor/three.module.js';

export const DIGITS=Object.freeze(['index','middle','ring','pinky','thumb']);
export const HAND_BONES=Object.freeze(['L','R'].flatMap(s=>DIGITS.flatMap(d=>Array.from({length:d==='thumb'?2:3},(_,i)=>d+s+(i+1)))));
export const HAND_PARENTS=Object.freeze(Object.fromEntries(['L','R'].flatMap(s=>DIGITS.flatMap(d=>Array.from({length:d==='thumb'?2:3},(_,i)=>[d+s+(i+1),i?d+s+i:'hand'+s])))));
export const HAND_PRESETS=Object.freeze({
 relaxed:{curl:[.18,.22,.27,.32,.20],spread:.12},
 open:{curl:[0,0,0,0,.05],spread:.65},
 fist:{curl:[1,1,1,1,.9],spread:0},
 point:{curl:[0,.95,.95,.95,.7],spread:.12},
 peace:{curl:[0,0,1,1,.8],spread:.65},
 thumbsUp:{curl:[1,1,1,1,0],spread:.1}
});
export function normalizeHands(raw){
 const out={enabled:raw?.enabled===true};
 for(const side of ['L','R']){
  const hand=raw?.[side],preset=hand?.preset||'relaxed',base=HAND_PRESETS[preset];
  if(!base)throw Error('Unknown hand gesture.');
  const curl=hand?.curl??base.curl,spread=hand?.spread??base.spread;
  if(!Array.isArray(curl)||curl.length!==5||!curl.every(Number.isFinite)||!Number.isFinite(spread))throw Error('Invalid hand pose.');
  out[side]={preset,curl:curl.map(v=>Math.max(0,Math.min(1,v))),spread:Math.max(0,Math.min(1,spread))};
 }
 return out;
}
/** Model-space rest points; the first 28 legacy bone indices stay untouched. */
export function handRest(m){
 const rest={};
 for(const side of ['L','R']){
  const sx=side==='L'?1:-1,x=sx*(m.shoulderX+.015),y=m.shoulderY-m.upper-m.fore,h=m.hand;
  for(const [i,d] of DIGITS.entries()){
   if(d==='thumb'){
    rest[d+side+'1']=[x-sx*h*.49,y-h*.47,h*.10];rest[d+side+'2']=[x-sx*h*.80,y-h*.83,h*.16];
   }else{
    const length=[.96,1.07,.99,.76][i],baseX=x+sx*(i-1.5)*h*.32,baseY=y-h*[.98,1.04,1.01,.91][i];
    for(let j=0;j<3;j++)rest[d+side+(j+1)]=[baseX,baseY-h*length*[0,.43,.76][j],0];
   }
  }
 }
 return rest;
}
/** Rounded skin-coloured digits merged into the existing skinned body draw call. */
export function addBareHand(list,recipe,m,side,{part,ball}){
 const sx=side==='L'?1:-1,x=sx*(m.shoulderX+.015),y=m.shoulderY-m.upper-m.fore,h=m.hand,rest=handRest(m),skin=recipe.body.skin;
 // A tapered, flattened palm: a narrow wrist opens into the knuckles.
 // The former spherical palm read as a circular pad with separate sticks attached.
 const rings=[[-.08,.38,.27],[.10,.42,.26],[.32,.49,.24],[.57,.60,.25],[.81,.63,.24],[1.00,.59,.20],[1.10,.49,.11]],vertices=[],indices=[],radial=12;
 for(const [v,w,depth] of rings)for(let k=0;k<=radial;k++){
  const angle=k/radial*Math.PI*2,c=Math.cos(angle),z=Math.sin(angle);
  // Rounded rectangular cross section keeps the back broad and the edge soft.
  vertices.push(x+sx*h*w*Math.sign(c)*Math.abs(c)**.65,y-v*h,h*depth*Math.sign(z)*Math.abs(z)**.8);
 }
 for(let j=0;j<rings.length-1;j++)for(let k=0;k<radial;k++){
  const a=j*(radial+1)+k,b=a+radial+1;
  indices.push(a,b,a+1,b,b+1,a+1);
 }
 for(const [j,reverse] of [[0,false],[rings.length-1,true]]){
  const centre=vertices.length/3;vertices.push(x,y-rings[j][0]*h,0);
  for(let k=0;k<radial;k++){const a=j*(radial+1)+k;indices.push(centre,a+(reverse?1:0),a+(reverse?0:1));}
 }
 // Both sides use the same outward winding, despite their mirrored coordinates.
 if(sx>0)for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
 const palm=new THREE.BufferGeometry();palm.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));palm.setIndex(indices);palm.computeVertexNormals();
 part(list,palm,'hand'+side,skin).attributes.ink.array.fill(.12);
 // Flesh at the thumb's base overlaps the palm, rather than an exposed ball joint.
 ball(list,h,[x-sx*h*.42,y-h*.51,h*.04],'hand'+side,skin,[.28,.40,.23],12,8).attributes.ink.array.fill(0);
 for(const [i,d] of DIGITS.entries()){
  const count=d==='thumb'?2:3,names=Array.from({length:count},(_,j)=>d+side+(j+1)),points=names.map(n=>new THREE.Vector3(...rest[n]));
  const last=points.at(-1).clone().add(new THREE.Vector3(d==='thumb'?-sx*h*.10:0,-h*(d==='thumb'?.36:[.96,1.07,.99,.76][i]*.24),0));points.push(last);
  const start=points[0],direction=last.clone().sub(start),lengthSq=direction.lengthSq(),radius=h*(d==='thumb'?.19:[.158,.165,.153,.135][i]);
  const stops=points.slice(0,-1).map(p=>p.clone().sub(start).dot(direction)/lengthSq);
  const share=p=>{const t=p.clone().sub(start).dot(direction)/lengthSq;
   // Blend into the palm at each knuckle, so opening the hand cannot detach it.
   if(t<.14){const u=THREE.MathUtils.smoothstep(t,-.08,.14);return [['hand'+side,1-u],[names[0],u]];}
   for(let j=1;j<count;j++)if(t<stops[j]){const u=THREE.MathUtils.smoothstep(t,stops[j-1],stops[j]);return [[names[j-1],1-u],[names[j],u]];}
   return [[names.at(-1),1]];
  };
  const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');
  const geo=new THREE.TubeGeometry(curve,12,radius,10,false),P=geo.attributes.position;
  // Taper the shaft and close it with one continuous rounded fingertip.
  for(let j=0;j<=12;j++){
   const t=[0,.10,.20,.30,.40,.50,.60,.70,.80,.87,.94,.98,1][j],centre=curve.getPointAt(t),taper=1-.23*t,cap=t>.80?Math.sqrt(Math.max(0,1-((t-.80)/.20)**2)):1;
   for(let k=0;k<=10;k++){
    const at=j*11+k,p=new THREE.Vector3().fromBufferAttribute(P,at).sub(curve.getPointAt(j/12)).multiplyScalar(taper*cap).add(centre);P.setXYZ(at,p.x,p.y,p.z);
   }
  }
  geo.computeVertexNormals();part(list,geo,share,skin).attributes.ink.array.fill(.08);
 }

}
/** Pose only finger bones. Wrists remain owned by the body pose / imported motion. */
export function applyHands(avatar,raw){
 if(!avatar.articulatedHands)return;
 const hands=normalizeHands(raw);avatar.handPose=hands;
 for(const side of ['L','R'])for(const [i,d] of DIGITS.entries()){
  const state=hands[side],sx=side==='L'?1:-1,count=d==='thumb'?2:3;
  for(let j=1;j<=count;j++){
   const bone=avatar.bones[d+side+j];if(!bone)continue;
   const curl=state.curl[i];
   bone.rotation.set(-curl*(d==='thumb'?(j===1?.40:.75):1.45*[1,1,.85][j-1]),0,
    j===1?(d==='thumb'?sx*(curl*1.8-(1-curl)*state.spread*.35):sx*(i-1.5)*state.spread*.32):0);
  }
 }
}
