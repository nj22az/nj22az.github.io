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
    rest[d+side+'1']=[x-sx*h*.64,y-h*.42,h*.15];rest[d+side+'2']=[x-sx*h*.94,y-h*.76,h*.22];
   }else{
    const length=[.85,.95,.87,.68][i],baseX=x+sx*(i-1.5)*h*.38,baseY=y-h*(i===3?.93:1.02);
    for(let j=0;j<3;j++)rest[d+side+(j+1)]=[baseX,baseY-h*length*[0,.43,.76][j],0];
   }
  }
 }
 return rest;
}
/** Rounded skin-coloured digits merged into the existing skinned body draw call. */
export function addBareHand(list,recipe,m,side,{part,ball}){
 const sx=side==='L'?1:-1,x=sx*(m.shoulderX+.015),y=m.shoulderY-m.upper-m.fore,h=m.hand,rest=handRest(m),skin=recipe.body.skin;
 const palmStart=list.length;ball(list,h,[x,y-h*.57,0],'hand'+side,skin,[.77,.69,.40],12,10);for(const g of list.slice(palmStart))g.attributes.ink.array.fill(.28);
 // Continuous finger surfaces with blended weights avoid separate capsule seams.
 for(const [i,d] of DIGITS.entries()){
  const count=d==='thumb'?2:3,names=Array.from({length:count},(_,j)=>d+side+(j+1)),points=names.map(n=>new THREE.Vector3(...rest[n]));
  const last=points.at(-1).clone().add(new THREE.Vector3(d==='thumb'?-sx*h*.02:0,-h*(d==='thumb'?.36:[.85,.95,.87,.68][i]*.24),d==='thumb'?h*.02:0));points.push(last);
  const start=points[0],direction=last.clone().sub(start),lengthSq=direction.lengthSq(),radius=h*(d==='thumb'?.22:i===3?.155:.17);
  const stops=points.slice(0,-1).map(p=>p.clone().sub(start).dot(direction)/lengthSq);
  const share=p=>{const t=p.clone().sub(start).dot(direction)/lengthSq;
   for(let j=1;j<count;j++)if(t<stops[j]){const u=THREE.MathUtils.smoothstep(t,stops[j-1],stops[j]);return [[names[j-1],1-u],[names[j],u]];}
   return [[names.at(-1),1]];
  };
  const curve=new THREE.CatmullRomCurve3(points,false,'centripetal'),piece=part(list,new THREE.TubeGeometry(curve,12,radius,8,false),share,skin);piece.attributes.ink.array.fill(.12);
  for(const [point,bone] of [[start,names[0]],[last,names.at(-1)]]){const cap=ball(list,radius,point.toArray(),bone,skin,[1,1,1],8,4);cap.attributes.ink.array.fill(.12);}
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
   bone.rotation.set(-curl*(d==='thumb'?1.05:1.45)*[1,1,.85][j-1],0,
    j===1?(d==='thumb'?sx*(curl*.9-(1-curl)*state.spread*.35):sx*(i-1.5)*state.spread*.32):0);
  }
 }
}
