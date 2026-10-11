// Erik visar: maskinrummets elektriker som demonstratör. Spelar en följd av takter där Erik går till en plats,
// når punkter med händerna (det riktiga skelettet, CCD som i Station A) och säger en replik. Bara presentation:
// modulen räknar aldrig ett elektriskt värde och vet inget om uppgiften. Stationens manus bestämmer takterna.
import * as THREE from '../../johansson-town/vendor/three.module.js';
import {reach} from './scene.mjs?v=20261003-erik';

const ease=t=>t<.5?2*t*t:1-(-2*t+2)**2/2;
const lerpAngle=(a,b,w)=>a+(((b-a+Math.PI*3)%(Math.PI*2))-Math.PI)*w;

/**
 * avatar: buildAvatar(...). home: {at:[x,z], face}. Takt: {d, at, face, R, L, say, cam, start()}.
 * R och L är världspunkter (Vector3) eller null (handen hänger).
 */
export function createDemonstrator(avatar,home){
  const B=avatar.bones,m=avatar.measure;
  let beats=[],i=-1,t=0,playing=false,phase=0,done=null,onBeat=null;
  let from={at:[...home.at],face:home.face,R:null,L:null},cur={...from},want={...from};
  const hand={R:new THREE.Vector3(),L:new THREE.Vector3()},error={R:0,L:0};
  function rest(side){
    const s=B['shoulder'+side].getWorldPosition(new THREE.Vector3());
    return s.add(new THREE.Vector3(0,-(m.upper+m.fore)*.95,0));
  }
  function place(at,face){avatar.root.position.set(at[0],0,at[1]);avatar.root.rotation.y=face;avatar.root.updateMatrixWorld(true);}
  function begin(k){
    i=k;t=0;from={...cur,R:cur.R?.clone()||null,L:cur.L?.clone()||null};
    const b=beats[i];want={at:b.at||cur.at,face:b.face??cur.face,R:b.R??null,L:b.L??null};
    b.start?.();onBeat?.(b,i);
  }
  function pose(dt){
    const b=beats[i]||{d:1},w=ease(Math.min(1,t/Math.min(b.d*.6,1.1)));
    const dx=want.at[0]-from.at[0],dz=want.at[1]-from.at[1],far=Math.hypot(dx,dz)>.05;
    const at=[from.at[0]+dx*w,from.at[1]+dz*w];
    let face=lerpAngle(from.face,want.face,w);
    for(const k of ['thighL','thighR','kneeL','kneeR'])B[k]?.quaternion.identity();
    if(far&&w<1){
      face=lerpAngle(from.face,Math.atan2(dx,dz),Math.min(1,w*4));
      if(w>.8)face=lerpAngle(face,want.face,(w-.8)/.2);
      phase+=dt*9;const s=Math.sin(Math.PI*w)**.5;
      B.thighL.rotation.x=Math.sin(phase)*.4*s;B.thighR.rotation.x=-Math.sin(phase)*.4*s;
      if(B.kneeL)B.kneeL.rotation.x=Math.max(0,-Math.sin(phase))*.6*s;if(B.kneeR)B.kneeR.rotation.x=Math.max(0,Math.sin(phase))*.6*s;
    }
    place(at,face);cur={at,face,R:null,L:null};
    for(const side of ['R','L']){
      const a=from[side]||rest(side),z=want[side]||rest(side);
      const target=a.clone().lerp(z,w);
      error[side]=reach(avatar,side,target);
      B['hand'+side].getWorldPosition(hand[side]);
      cur[side]=want[side]?target:null;
      if(!want[side]&&w>=1)cur[side]=null;
    }
  }
  place(home.at,home.face);
  return {
    get playing(){return playing;},get beat(){return beats[i]||null;},get index(){return i;},hand,error,
    get position(){return avatar.root.position.toArray();},
    /** Spela takterna. onBeat(takt, nr) vid varje ny takt, onDone() när sista är klar. */
    play(list,{onBeat:ob=null,onDone=null}={}){beats=list.filter(Boolean);onBeat=ob;done=onDone;playing=beats.length>0;if(playing)begin(0);},
    /** Hoppa till slutet: alla takters start() körs, Erik står där sista takten slutar. */
    finish(){if(!playing)return;for(let k=i+1;k<beats.length;k++)begin(k);t=beats[i].d;pose(0);playing=false;done?.();},
    stop(){playing=false;},
    goHome(){beats=[{d:1.4,at:home.at,face:home.face,R:null,L:null}];playing=true;done=null;onBeat=null;begin(0);},
    update(dt){
      if(!playing){pose(0);return false;}
      t+=dt;pose(dt);
      if(t>=beats[i].d){if(i<beats.length-1)begin(i+1);else{playing=false;done?.();}}
      return true;
    },
  };
}
