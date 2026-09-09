// Two street-facing canal-quarter lots. The original kit buildings here are
// hidden and replaced with Sakura and Sato Ramen so enterable shops read at a glance.
export const LANDMARK_LOTS=Object.freeze([
 {id:'sakura',site:'market',
  minX:3.95,maxX:10.0,minY:.35,maxY:8.3,minZ:2.25,maxZ:8.05,
  x:7.02,z:2.66,yaw:Math.PI,scale:{x:.56,y:.95,z:.58}},
 {id:'ramen',site:'ramen',
  minX:-13.0,maxX:-7.2,minY:.35,maxY:8.3,minZ:3.55,maxZ:8.55,
  x:-10.08,z:6.14,yaw:Math.PI,scale:{x:1.12,y:1,z:.645}},
].map(Object.freeze));

export function lotContains(lot,x,z,y=1){
 return x>=lot.minX&&x<=lot.maxX&&z>=lot.minZ&&z<=lot.maxZ&&y>=lot.minY&&y<=lot.maxY;
}

export function colliderInLandmarkLot(c){
 if((c.height??0)<1.8)return false;
 return LANDMARK_LOTS.some(lot=>lotContains(lot,c.x,c.z,(c.minY??0)+(c.height??0)/2));
}

export function localToWorld(x,z,yaw,scale,lx,lz){
 const sx=scale.x??scale,sz=scale.z??scale,c=Math.cos(yaw),s=Math.sin(yaw);
 return [x+lx*sx*c+lz*sz*s,z-lx*sx*s+lz*sz*c];
}

export function hideLandmarkLots(scene){
 let removed=0;
 scene.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.geometry?.index)return;
  const p=mesh.geometry.attributes.position,idx=mesh.geometry.index,kept=[];
  for(let i=0;i<idx.count;i+=3){
   const a=idx.getX(i),b=idx.getX(i+1),c=idx.getX(i+2);
   const x=(p.getX(a)+p.getX(b)+p.getX(c))/3,y=(p.getY(a)+p.getY(b)+p.getY(c))/3,z=(p.getZ(a)+p.getZ(b)+p.getZ(c))/3;
   if(LANDMARK_LOTS.some(lot=>lotContains(lot,x,z,y))){removed++;continue;}
   kept.push(a,b,c);
  }
  if(kept.length<idx.count)mesh.geometry.setIndex(kept);
 });
 return removed;
}

export function landmarkLotColliders(offsetX=0){
 return [
  {x:7.02+offsetX,z:5.0,w:5.4,d:4.5,height:3.4},
  {x:-10.08+offsetX,z:6.15,w:5.15,d:4.25,height:3.1},
 ];
}
