import * as THREE from '../../vendor/three.module.js';
import {createWalkingRoute} from '../navigation/walking-route.js';
import {routeAt,groundHeight} from '../world/layout.js';
import {airportWorld,airportSurface} from '../world/airport-ground.js';
import {PORT_SHED} from '../world/port-shed.js';
import {standingHitsRect} from '../../physics.js';

const R=.18,SPEED=1.15,vec=new THREE.Vector3();
const point=g=>g.getWorldPosition(new THREE.Vector3()).toArray();
const setPoint=(g,p)=>{g.parent.updateWorldMatrix(true,false);g.position.copy(g.parent.worldToLocal(vec.set(...p)));};
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);

/** One real shore body at each berth. Fujita keeps his existing avatar, prompt and home. */
export function createFerryShoreCrew({portShed,shoreParent,shoreColliders=[],characters,register,onAction}){
 const bodies=new Map(),bins=new Map();let indexed=-1;
 function nearby(x,z){
  if(indexed!==shoreColliders.length){
   bins.clear();indexed=shoreColliders.length;
   for(const c of shoreColliders){
    if(c.moving||![c.x,c.z,c.w,c.d].every(Number.isFinite))continue;
    const reach=Math.hypot(c.w,c.d)/2+R;
    for(let i=Math.floor((c.x-reach)/4);i<=Math.floor((c.x+reach)/4);i++)for(let j=Math.floor((c.z-reach)/4);j<=Math.floor((c.z+reach)/4);j++){
     const key=i+','+j;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(c);
    }
   }
  }
  return [...(bins.get(Math.floor(x/4)+','+Math.floor(z/4))||[]),...shoreColliders.filter(c=>c.moving)];
 }
 function body(port){
  if(bodies.has(port))return bodies.get(port);
  let g,actor,home;
  if(port==='town'){
   g=portShed?.fujita;if(!g)return null;actor=portShed.actor;home=point(g);
  }else{
   if(!shoreParent)return null;
   g=new THREE.Group();g.name='Kitano line hand';g.userData.name='Kitano line hand';g.userData.ferryShoreRole=true;shoreParent.add(g);
   const [x,z]=airportWorld(-50.1,32.5);home=[x,airportSurface(x,z,R)?.y??.1,z];setPoint(g,home);
   actor=characters?.attach(g,'Kitano line hand');
   const a=new THREE.Object3D();a.position.y=1.2;g.add(a);
   register?.(a,'Talk to Kitano line hand',()=>onAction?.('inspect','Kitano line hand',g.userData.activity||'Standing by for the ferry’s shore lines.'));
  }
  const b={port,g,actor,name:g.userData.name,home,route:[],index:0,task:null,search:null,blocked:null,state:'standing by',elapsed:0,returning:false};bodies.set(port,b);return b;
 }
 function sample(b,x,z){
  const y=groundHeight(x,z),ground=routeAt(x,z,R);
  const blocked=!ground||nearby(x,z).some(c=>{
   if(c.disabled||c.walk===false||c.walkSolid===false)return false;
   // A seated person's own chair is crossed only by his getting-up/sitting-down
   // movement; its exemption is local to Fujita, never a public walking opening.
   if(b.port==='town'&&c.portShed&&Math.abs(c.x-PORT_SHED.chair[0])<.01&&Math.abs(c.z-PORT_SHED.chair[1])<.01)return false;
   return standingHitsRect(x,z,R,y,c);
  });
  return {y,blocked};
 }
 function route(b,target){
  const p=point(b.g);b.goal=[...target];b.route=[];b.index=0;b.blocked=null;
  if(distance(p,target)<.08){b.state='at station';return;}
  b.state='finding a walking route';
  b.search=createWalkingRoute({start:{x:p[0],z:p[2]},goal:{x:target[0],z:target[2]},cell:.35,maxVisited:50000,
   margin:b.port==='town'?24:5,sample:(x,z)=>sample(b,x,z)});
 }
 function assign(task){
  const port=task.station==='shore-airport'?'airport':'town',b=body(port);if(!b)return null;
  if(b.task?.id===task.id)return b;
  const t=task.target;if(!t||![t.x,t.y,t.z].every(Number.isFinite)){b.blocked='The shore task has no landing target';b.task=task;return b;}
  if(!b.g.userData.ferryShoreTask)b.home=point(b.g);
  b.task=task;b.elapsed=0;b.returning=false;
  const u=b.g.userData;u.ferryShoreTask=true;u.sleeping=false;u.sleepBlend=0;u.tipsy=0;u.socialPose='Idle';u.walking=true;
  delete u.seatHeight;delete u.heldItem;delete u.heldPortion;delete u.chairBlend;
  route(b,[t.x,t.y,t.z]);return b;
 }
 function update(dt,tasks,workReady=true){
  const active=new Set(tasks.map(t=>t.id));
  for(const task of tasks)assign(task);
  for(const b of bodies.values()){
   if(b.task&&!active.has(b.task.id)){
    b.task=null;b.elapsed=0;b.returning=true;route(b,b.home);
   }
   if(!b.task&&!b.returning)continue;
   if(b.search){
    b.search.step(1000);
    if(b.search.status==='found'){
     if(b.search.reason!=='goal-reached'){b.blocked='The assigned shore bitt is obstructed';b.state='blocked';}
     else{b.route=b.search.path.map(p=>[p.x,p.y,p.z]);b.index=1;b.state='walking';}
     b.search=null;
    }else if(b.search.status==='unreachable'){b.blocked=b.search.reason;b.search=null;b.state='blocked';}
   }
   let remaining=Math.min(Math.max(dt,0),.5)*SPEED;
   while(!b.blocked&&b.index<b.route.length&&remaining>0){
    const p=point(b.g),to=b.route[b.index],d=distance(p,to),step=Math.min(d,remaining),t=d>1e-6?step/d:1;
    const next=p.map((v,i)=>v+(to[i]-v)*t),s=sample(b,next[0],next[2]);
    if(s.blocked||Math.abs(s.y-p[1])>.24){b.blocked='The shore walking route is obstructed';b.state='blocked';break;}
    next[1]=s.y;setPoint(b.g,next);if(d>.002)b.g.rotation.y=Math.atan2(to[0]-p[0],to[2]-p[2])+Math.PI;
    remaining-=step;if(d<=step+.002)b.index++;else break;
   }
   const arrived=!b.search&&!b.blocked&&b.index>=b.route.length&&b.goal&&distance(point(b.g),b.goal)<.18;
   const u=b.g.userData;u.walking=!arrived;u.socialPose=arrived&&b.task&&workReady?'Interact':'Idle';
   if(arrived&&b.task){
    if(workReady){b.elapsed=Math.min(b.task.seconds||0,b.elapsed+Math.min(Math.max(dt,0),.5));b.state=b.elapsed>=(b.task.seconds||0)?'reported complete':'working the line';}
    else b.state='waiting for ship crew';
   }
   else if(arrived&&b.returning){
    b.returning=false;b.state='standing by';u.ferryShoreTask=false;u.walking=false;u.socialPose='Idle';
   }
   u.activity=b.blocked?'Waiting for a clear shore route':b.state==='waiting for ship crew'?'At the shore bitt; waiting for the ship’s line hand':b.task?b.task.action:b.returning?'Returning from the ferry’s shore lines':'Standing by at the ferry pier';
  }
 }
 const taskAtStation=id=>[...bodies.values()].some(b=>b.task?.id===id&&!b.blocked&&!b.search&&b.index>=b.route.length&&b.goal&&distance(point(b.g),b.goal)<.18);
 const taskReady=id=>[...bodies.values()].some(b=>b.task?.id===id&&taskAtStation(id)&&b.elapsed>=(b.task.seconds||0));
 return {update,taskAtStation,taskReady,bodies,
  snapshot:()=>[...bodies.values()].map(b=>({name:b.name,post:'shore',where:'shore-'+b.port,pos:point(b.g),space:'world',task:b.task?.id??null,state:b.state,action:b.task?.action??null,progress:b.task?Math.min(1,b.elapsed/Math.max(.01,b.task.seconds||0)):0,blocked:b.blocked,existingResident:b.port==='town'}))};
}
