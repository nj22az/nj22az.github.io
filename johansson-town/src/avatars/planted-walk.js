import * as THREE from '../../vendor/three.module.js';
import {footSupports} from './foot-ground.js';

const smooth=x=>{x=THREE.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
const UP=new THREE.Vector3(0,1,0),DOWN=new THREE.Vector3(0,-1,0),ACROSS=new THREE.Vector3(1,0,0);
const DUTY=.55,ROLL=.17;

/** Locomotion contacts only. The animator still owns the hips, arms, head and all other poses.
 * Targets live in world space: neither hip sway nor joint easing can move a supporting shoe.
 * All scratch storage is owned by this animator, including the two-bone solver's vectors. */
export function createPlantedWalk(avatar){
 const {root,bones,measure:m}=avatar;
 const legs=['L','R'].map((side,i)=>({side,thigh:bones['thigh'+side],knee:bones['knee'+side],foot:bones['foot'+side],
  upper:bones['knee'+side].position.length(),lower:bones['foot'+side].position.length(),
  anchor:new THREE.Vector3(),from:new THREE.Vector3(),end:new THREE.Vector3(),at:new THREE.Vector3(),
  flat:new THREE.Quaternion(),rotation:new THREE.Quaternion(),fromRotation:new THREE.Quaternion(),samples:[],previous:-1,swing:false,pitch:0,start:DUTY,known:false,early:false,index:i}));
 const reach=Math.min(...legs.map(l=>l.upper+l.lower)),sole=m.foot*.62-m.foot-m.legR*.75,toe=m.legR*(.55+2.3*.85);
 const supports=footSupports(avatar)();
 for(const l of legs){
  const samples=supports.find(s=>s.bone===l.foot)?.samples||[];
  // Only the lower silhouette can support the shoe. Cache its vertices, plus the film checker's heel and toe.
  const points=new Set();for(let i=0;i<=16;i++){const angle=ROLL*i/16;let best=null,low=Infinity;
   for(const p of samples){const y=p.y*Math.cos(angle)-p.z*Math.sin(angle);if(y<low){low=y;best=p;}}if(best)points.add(best);}
  l.samples=[...points,new THREE.Vector3(0,sole,m.legR*.55-m.legR*2.3*.85),new THREE.Vector3(0,sole,toe)];
 }
 const lastOrigin=new THREE.Vector3(),facing=new THREE.Vector3();let observed=false;
 const origin=new THREE.Vector3(),forward=new THREE.Vector3(),sideways=new THREE.Vector3(),virtual=new THREE.Vector3();
 const v=new THREE.Vector3(),a=new THREE.Vector3(),b=new THREE.Vector3(),dir=new THREE.Vector3(),pole=new THREE.Vector3(),hip=new THREE.Vector3();
 const q=new THREE.Quaternion(),yaw=new THREE.Quaternion(),inverse=new THREE.Quaternion(),pitch=new THREE.Quaternion();
 let kickSide=-1,kickWeight=0;
 let active=false,phase=0,step=0,span=0,lift=0,reserve=0,toeOut=0,backwards=false,stopping=false,stopLeg=0,stopTime=0,stopIndex=0,settled=false;
 function frame(){
  root.updateWorldMatrix(true,false);root.getWorldQuaternion(yaw);
  facing.set(0,0,1).applyQuaternion(yaw);facing.y=0;facing.normalize();
  sideways.crossVectors(UP,facing).normalize();origin.setFromMatrixPosition(root.matrixWorld).add(virtual);
  v.copy(origin).sub(lastOrigin);v.y=0;
  // Counter work includes side steps and backing away while still facing the shelf. Place steps along travel,
  // independently of where the torso looks; the knees continue to bend towards the body's front.
  if(observed&&v.lengthSq()>1e-10&&v.lengthSq()<1)forward.copy(v).normalize();else if(!observed)forward.copy(facing);
  lastOrigin.copy(origin);observed=true;
 }
 function flat(l){l.flat.copy(yaw).multiply(q.setFromAxisAngle(UP,l.index===0?toeOut:-toeOut));}
 function rest(l,out){
  out.copy(origin).addScaledVector(sideways,l.thigh.position.x);out.y=origin.y-root.position.y-sole;return out;
 }
 function ankle(l,angle){
  l.pitch=angle;l.rotation.copy(l.flat).multiply(pitch.setFromAxisAngle(ACROSS,angle));
  // Terminal stance pivots about the toe, rather than sliding a pitched heel along the floor.
  v.set(0,sole,toe);l.at.copy(l.anchor).add(a.copy(v).applyQuaternion(l.flat)).sub(v.applyQuaternion(l.rotation));
 }
 function low(l){let y=Infinity;for(const p of l.samples)y=Math.min(y,v.copy(p).applyQuaternion(l.rotation).y);return y;}
 function swing(l,s,height,floor){
  const h=smooth((s-.1)/.8);l.at.lerpVectors(l.from,l.end,h);
  l.rotation.slerpQuaternions(l.fromRotation,l.flat,h);
  const start=l.from.y+lowAtStart(l)-floor;
  l.at.y=floor+Math.max(start*(1-h),height*Math.sin(Math.PI*s))-low(l);
 }
 function lowAtStart(l){let y=Infinity;for(const p of l.samples)y=Math.min(y,v.copy(p).applyQuaternion(l.fromRotation).y);return y;}
 function recovery(l,floor){l.from.copy(l.at);l.fromRotation.copy(l.rotation);rest(l,l.end);l.end.y=floor-sole;}
 function solve(l){
  // Work in the hips' frame; this also cancels their existing roll and swagger.
  bones.hips.updateWorldMatrix(true,false);bones.hips.getWorldQuaternion(q);inverse.copy(q).invert();
  l.thigh.getWorldPosition(hip).add(virtual);dir.copy(l.at).sub(hip).applyQuaternion(inverse);
  const d=THREE.MathUtils.clamp(dir.length(),1e-5,l.upper+l.lower-1e-6);dir.normalize();
  pole.copy(facing).applyQuaternion(inverse);pole.addScaledVector(dir,-pole.dot(dir)).normalize();
  const along=(l.upper*l.upper-l.lower*l.lower+d*d)/(2*d),out=Math.sqrt(Math.max(0,l.upper*l.upper-along*along));
  a.copy(dir).multiplyScalar(along).addScaledVector(pole,out);
  l.thigh.quaternion.setFromUnitVectors(DOWN,b.copy(a).normalize());l.thigh.updateWorldMatrix(false,false);
  b.copy(dir).multiplyScalar(d).sub(a).normalize().applyQuaternion(q.copy(l.thigh.quaternion).invert());
  l.knee.quaternion.setFromUnitVectors(DOWN,b);l.knee.updateWorldMatrix(false,false);
  l.knee.getWorldQuaternion(q);l.foot.quaternion.copy(q.invert()).multiply(l.rotation);
 }
 return {
  /** Distance advances the clock; the upper-body animation uses exactly this same phase. */
  advance(dt,speed,A,gait,strideStyle,backing=false){
   backwards=backing;toeOut=gait.toe;kickWeight=0;
   const wanted=reach*Math.sin(A)*strideStyle;
   span=active?span+(wanted-span)*(1-Math.exp(-dt*3)):wanted;step=span/DUTY;
   lift=Math.max(.04,m.k*(.035+.02*gait.lift));reserve=.01*m.k+(speed>2.6?.055:.025)*m.k*gait.bounce;
   const starting=!active||stopping;
   if(!active){phase=.25;active=true;stopping=false;settled=false;for(const l of legs)l.previous=-1;}
   if(stopping){phase=stopLeg===0?.65:.15;stopping=false;settled=false;for(const l of legs)l.previous=-1;}
   if(!starting)phase+=speed/(step*2)*dt;
   if(!root.parent)virtual.addScaledVector(forward,speed*dt);
   return phase*Math.PI*2;
  },
  kick(side,weight){kickSide=side;kickWeight=weight;},
  reset(){active=false;stopping=false;settled=false;virtual.set(0,0,0);observed=false;for(const l of legs)l.known=false;},
  apply(dt,moving,floor=0){
   if(!active){
    frame();root.updateWorldMatrix(true,true);
    for(const l of legs){l.foot.getWorldPosition(l.at);l.foot.getWorldQuaternion(l.rotation);l.known=true;}
    return false;
   }
   frame();if(backwards)forward.negate();
   const ground=origin.y-root.position.y+floor;
   if(stopping)reserve*=Math.exp(-dt*8);
   if(!moving&&!stopping){
    stopping=true;stopTime=0;stopIndex=0;settled=false;
    // Finish the airborne foot, then lift the other into its standing place. Never blend a sole across the floor.
    stopLeg=legs[1].swing?1:0;recovery(legs[stopLeg],ground);
   }
   for(const l of legs){
    if(stopping){
     if(!settled&&l.index===stopLeg){
      stopTime+=dt;const s=Math.min(1,stopTime/.3);swing(l,s,lift,ground);l.swing=s<1;
     }else if(!l.swing)ankle(l,l.pitch);
    }else{
     const f=(phase+l.index*.5)%1;
     if(l.previous<0){
      if(l.known){l.anchor.copy(l.at);l.flat.copy(l.rotation);l.anchor.y=ground-low(l);}
      else{l.foot.getWorldPosition(l.at);l.foot.getWorldQuaternion(l.rotation);l.anchor.copy(l.at);l.flat.copy(l.rotation);l.anchor.y=ground-low(l);}
      l.swing=false;l.early=false;l.start=f>=DUTY?f:DUTY;
     }
     if(l.swing&&f<l.previous){l.anchor.copy(l.end);l.swing=false;l.early=false;l.start=DUTY;}
     if(!l.swing&&f<DUTY){
      l.thigh.getWorldPosition(hip).add(virtual);
      if((l.at.x-hip.x)*forward.x+(l.at.z-hip.z)*forward.z<0&&Math.hypot(l.at.x-hip.x,l.at.z-hip.z)>(l.upper+l.lower)*.8){l.early=true;l.start=f;}
     }
     if(f<DUTY&&!l.early){
      ankle(l,ROLL*smooth((f/DUTY-.6)/.4));
     }else{
      if(!l.swing){
       l.from.copy(l.at);l.fromRotation.copy(l.rotation);flat(l);l.end.copy(origin).addScaledVector(sideways,l.thigh.position.x).addScaledVector(forward,span+step*2*(1-f));
       l.end.y=origin.y-root.position.y+floor-sole;l.swing=true;
      }
      const s=(f-l.start)/(1-l.start);
      // A change of pace may revise an airborne landing, while there is still clearance to do so.
      // Freeze it before the final descent so neither a slowing body nor smoothing can drag a sole in.
      if(s<.8){a.copy(origin).addScaledVector(sideways,l.thigh.position.x).addScaledVector(forward,span+step*2*(1-f));a.y=l.end.y;l.end.lerp(a,1-Math.exp(-dt*12));}
      swing(l,s,lift,ground);
      if(l.index===kickSide&&kickWeight>0){const e=kickWeight*Math.sin(Math.PI*s);l.at.addScaledVector(forward,.06*m.k*e);l.at.y+=.02*m.k*e;}
     }
     l.previous=f;
    }
   }
   for(const l of legs)l.at.y=Math.max(l.at.y,ground-low(l));
   if(stopping&&!settled&&stopTime>=.3){
    const l=legs[stopLeg];l.anchor.copy(l.end);l.pitch=0;
    if(stopIndex++===0){stopLeg=1-stopLeg;stopTime=0;recovery(legs[stopLeg],ground);}else settled=true;
   }
   // The support's reach sets the body's height. Toe-off raises the trailing ankle before the next foot lands.
   // Keep a little flex at full extension, and retain the animator's own hip bounce beneath this ceiling.
   root.updateWorldMatrix(true,true);let ceiling=Infinity;
   for(const l of legs){l.thigh.getWorldPosition(hip).add(virtual);const dx=l.at.x-hip.x,dz=l.at.z-hip.z;
    ceiling=Math.min(ceiling,l.at.y+Math.sqrt(Math.max(.0001,(l.upper+l.lower-.002)**2-dx*dx-dz*dz))-hip.y);}
   root.position.y+=ceiling-Math.max(0,reserve-(bones.hips.position.y-m.hipY));root.updateWorldMatrix(true,true);
   for(const l of legs)solve(l);
   return true;
  }
 };
}
