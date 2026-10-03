// Street-facing canal-quarter lots. Original kit buildings here are hidden
// and replaced with Sakura, Sato Ramen and Thuan's house so enterable places read at a glance.
export const LANDMARK_LOTS=Object.freeze([
 {id:'sakura',site:'market',
  minX:3.95,maxX:10.0,minY:.35,maxY:8.3,minZ:2.25,maxZ:8.05,
  x:7.02,z:2.66,yaw:Math.PI,scale:{x:.56,y:.95,z:.58}},
 {id:'ramen',site:'ramen',
  minX:-13.0,maxX:-7.2,minY:.35,maxY:8.3,minZ:3.55,maxZ:8.55,
  x:-10.08,z:6.14,yaw:Math.PI,scale:{x:1.12,y:1,z:.645}},
 {id:'yuri-home',site:'yuri-home',
  minX:-9.55,maxX:-4.78,minY:.35,maxY:8.3,minZ:9.35,maxZ:15.20,
  x:-6.91,z:11.60,yaw:Math.PI/2,scale:{x:.84,y:.92,z:.533}},
].map(Object.freeze));

export function localToWorld(x,z,yaw,scale,lx,lz){
 const sx=scale.x??scale,sz=scale.z??scale,c=Math.cos(yaw),s=Math.sin(yaw);
 return [x+lx*sx*c+lz*sz*s,z-lx*sx*s+lz*sz*c];
}
