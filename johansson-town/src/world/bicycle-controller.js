import * as THREE from '../../vendor/three.module.js';

export function createBicycleController({x=0,z=0,yaw=0}={}){
 const state={x,z,yaw,speed:0,distance:0};
 function update(dt,{throttle=0,steer=0,fast=false,blocked=()=>false}={}){
  dt=THREE.MathUtils.clamp(Number(dt)||0,0,.1);
  throttle=THREE.MathUtils.clamp(Number(throttle)||0,-1,1);
  steer=THREE.MathUtils.clamp(Number(steer)||0,-1,1);
  const maxForward=fast?7.2:5.2,maxReverse=1.4;
  const target=throttle>=0?throttle*maxForward:throttle*maxReverse;
  const rate=Math.abs(target)>Math.abs(state.speed)?2.4:6.8;
  state.speed=THREE.MathUtils.damp(state.speed,target,rate,dt);
  const speedFactor=THREE.MathUtils.clamp(Math.abs(state.speed)/1.4,0,1);
  state.yaw-=steer*(.18+1.12*speedFactor)*dt;
  const dx=-Math.sin(state.yaw)*state.speed*dt,dz=-Math.cos(state.yaw)*state.speed*dt;
  let moved=false;
  if(!blocked(state.x+dx,state.z+dz)){
   state.x+=dx;state.z+=dz;state.distance+=Math.hypot(dx,dz);moved=true;
  }else state.speed=0;
  return {state,moved,dx:moved?dx:0,dz:moved?dz:0};
 }
 return {state,update};
}
