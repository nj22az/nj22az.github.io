import {diningPoint,diningRow} from './dining-layout.js';

// The packed file shares its textures and material batches across both sides.
// Transform each half once when it loads, keeping those batches and original UVs.
export function unfoldDiningStreet(model){
 if(model.userData.unfoldedDining)return model;
 const remove=[];
 model.traverse(mesh=>{
  if(!mesh.isMesh)return;
  // Spanning light wires and the wide alley floor cannot follow separate rows.
  // Main Street supplies the pavement; the shop signs retain their own glow.
  if(['pole','ground'].includes(mesh.material.name)){remove.push(mesh);return;}
  const geometry=mesh.geometry.clone(),p=geometry.attributes.position,n=geometry.attributes.normal;
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),[wx,wz]=diningPoint(x,p.getZ(i));p.setXYZ(i,wx,p.getY(i),wz);
   if(n){const sign=Math.cos(diningRow(x).yaw);n.setXYZ(i,sign*n.getX(i),n.getY(i),sign*n.getZ(i));}
  }
  p.needsUpdate=true;if(n)n.needsUpdate=true;
  geometry.computeBoundingBox();geometry.computeBoundingSphere();mesh.geometry=geometry;
 });
 remove.forEach(mesh=>mesh.removeFromParent());model.userData.unfoldedDining=true;return model;
}
