import * as THREE from '../../vendor/three.module.js';
/** A bounded harbour view. It never changes the player, clock preference or save. */
export function createTitleCamera({camera,element,target=[0,3,-28],reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches}){
 const look=new THREE.Vector3(...target),desired=new THREE.Vector3();
 const state={angle:.7,elevation:.42,radius:47,tour:!reducedMotion,speed:1,minutes:1110,sound:false};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 let pointer=null;
 function position(){desired.set(look.x+Math.sin(state.angle)*Math.cos(state.elevation)*state.radius,look.y+Math.sin(state.elevation)*state.radius,look.z-Math.cos(state.angle)*Math.cos(state.elevation)*state.radius);}
 function reset(){Object.assign(state,{angle:.7,elevation:.42,radius:47,tour:!reducedMotion});position();camera.position.copy(desired);camera.lookAt(look);}
 const blocked=e=>e.target.closest('button,a,input,select,summary,dialog,.title-center,.title-tools');
 element.addEventListener('pointerdown',e=>{if(blocked(e)||pointer||e.button!==0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY};element.setPointerCapture(e.pointerId);});
 element.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;state.tour=false;state.angle=clamp(state.angle-dx*.004,-.95,.95);state.elevation=clamp(state.elevation+dy*.003,.25,.75);pointer.x=e.clientX;pointer.y=e.clientY;});
 const release=e=>{if(pointer?.id===e.pointerId){pointer=null;if(element.hasPointerCapture(e.pointerId))element.releasePointerCapture(e.pointerId);}};
 element.addEventListener('pointerup',release);element.addEventListener('pointercancel',release);element.addEventListener('lostpointercapture',()=>{pointer=null;});
 element.addEventListener('wheel',e=>{if(blocked(e))return;e.preventDefault();state.radius=clamp(state.radius+e.deltaY*.035,30,65);},{passive:false});
 reset();let elapsed=0;
 return {state,target:look,reducedMotion,reset,
  get minutes(){return state.minutes;},get sound(){return state.sound;},
  update(dt){dt=clamp(dt,0,.05);elapsed+=dt;if(state.tour&&!reducedMotion){state.angle=.7+Math.sin(elapsed*.035*state.speed)*.16;}position();camera.position.lerp(desired,reducedMotion?1:1-Math.exp(-5*dt));camera.lookAt(look);}
 };
}
