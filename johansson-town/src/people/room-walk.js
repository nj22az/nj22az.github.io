import {createNavigation} from './navmesh.js?snappy=1';

// Routes share the player's furniture collision geometry. No timeout teleports.
export function createRoomWalk(blocked=()=>false,{bounds={minX:-8,maxX:8,minZ:-8,maxZ:8}}={}){
 const nav=createNavigation(blocked,{step:.2,heightAt:()=>0,bounds}),routes=new Map();
 return {move(person,target,dt){
  const g=person.g,tag=target.join(',');
  if(Math.hypot(g.position.x-target[0],g.position.z-target[2])<.12)return true;
  let route=routes.get(person);
  if(!route||route.tag!==tag){route={tag,points:nav.path(g.position,{x:target[0],z:target[2]})};routes.set(person,route);}
  while(route.points.length&&Math.hypot(g.position.x-route.points[0][0],g.position.z-route.points[0][1])<.08)route.points.shift();
  const next=route.points[0];if(!next)return false;
  const dx=next[0]-g.position.x,dz=next[1]-g.position.z,d=Math.hypot(dx,dz),step=Math.min(d,dt*(person.profile.age>65?.7:1));
  const x=g.position.x+dx/d*step,z=g.position.z+dz/d*step;
  if(!blocked(x,z,.3)){g.position.set(x,0,z);const yaw=Math.atan2(-dx,-dz);g.rotation.y+=Math.atan2(Math.sin(yaw-g.rotation.y),Math.cos(yaw-g.rotation.y))*Math.min(1,dt*8);}
  return false;
 },clear(){routes.clear();nav.clearCache();}};
}

export function atDestination(person,place,target){
 const g=person.g;
 if(g.userData.inHome||g.userData.inMarket||g.userData.inRamen||g.userData.inIzakaya||g.userData.inWorkplace)return false;
 return g.userData.indoors===place||!g.userData.indoors&&Math.hypot(g.position.x-target[0],g.position.z-target[1])<.85;
}
