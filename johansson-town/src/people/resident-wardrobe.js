import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';

// Accessories follow the native bones. Each attachment is a single coloured mesh,
// without texture requests or extra actors; the body retains its shared skin buffers.
export function addResidentAccessories(model,style){
 if(!style?.accessory)return;
 model.updateMatrixWorld(true);
 const head=model.getObjectByName('Head'),chest=model.getObjectByName('Chest');
 if(!head)return;
 const bounds=new THREE.Box3(),torsoBounds=new THREE.Box3(),point=new THREE.Vector3();
 model.traverse(mesh=>{if(!mesh.isSkinnedMesh)return;const a=mesh.geometry.attributes;
  for(let i=0;i<a.position.count;i++){let weight=0;for(let j=0;j<4;j++)if(mesh.skeleton.bones[a.skinIndex.getComponent(i,j)]===head)weight+=a.skinWeight.getComponent(i,j);
   point.fromBufferAttribute(a.position,i).applyMatrix4(mesh.matrixWorld);
   if(weight>.5)bounds.expandByPoint(point);
   let torsoWeight=0;for(let j=0;j<4;j++)if(/Chest|Torso|Abdomen/.test(mesh.skeleton.bones[a.skinIndex.getComponent(i,j)]?.name||''))torsoWeight+=a.skinWeight.getComponent(i,j);
   if(torsoWeight>.5)torsoBounds.expandByPoint(point);
  }
 });
 if(bounds.isEmpty())return;
 const size=bounds.getSize(new THREE.Vector3()),centre=bounds.getCenter(new THREE.Vector3()),parts=[];
 function coloured(geometry,color){
  const c=new THREE.Color(color),rgb=new Float32Array(geometry.attributes.position.count*3);
  for(let i=0;i<rgb.length;i+=3)rgb.set([c.r,c.g,c.b],i);
  geometry.setAttribute('color',new THREE.BufferAttribute(rgb,3));parts.push(geometry);
 }
 function box(w,h,d,x,y,z,color){coloured(new THREE.BoxGeometry(w,h,d).translate(x,y,z),color);}
 function mount(bone,label){
  if(!parts.length||!bone)return;const geometry=mergeGeometries(parts);parts.forEach(g=>g.dispose());parts.length=0;
  const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,flatShading:true}));mesh.name='resident-'+label;
  // Geometry was measured in the asset's world space, before height/width fitting.
  bone.updateWorldMatrix(true,false);geometry.applyMatrix4(bone.matrixWorld.clone().invert());bone.add(mesh);
 }
 const type=style.accessory,front=bounds.max.z+.006,eyeY=bounds.min.y+size.y*.53;
 if(type.includes('ponytail')){
  const hair=new THREE.SphereGeometry(1,7,5).scale(size.x*.21,size.y*.47,size.z*.25).rotateX(-.22).translate(centre.x,bounds.max.y-size.y*.42,bounds.min.z-size.z*.18);
  coloured(hair,style.hair);
  box(size.x*.23,size.y*.09,size.z*.15,centre.x,bounds.max.y-size.y*.20,bounds.min.z-size.z*.08,style.accent);
 }
 if(type.includes('bun'))coloured(new THREE.SphereGeometry(1,7,5).scale(size.x*.24,size.y*.22,size.z*.25).translate(centre.x,bounds.max.y-size.y*.15,bounds.min.z),style.hair);
 if(type.includes('headband')){
  for(const side of [-1,1])box(size.x*.055,size.y*.29,size.z*.16,centre.x+side*size.x*.44,bounds.max.y-size.y*.17,centre.z,style.accent);
  box(size.x*.90,size.y*.055,size.z*.16,centre.x,bounds.max.y-size.y*.035,centre.z,style.accent);
 }
 if(type==='ribbon-apron'){
  for(const side of [-1,1])box(size.x*.20,size.y*.13,.035,centre.x+size.x*.39+side*size.x*.085,bounds.max.y-size.y*.22,centre.z,0xe7acc2);
  box(size.x*.065,size.y*.09,.043,centre.x+size.x*.39,bounds.max.y-size.y*.22,centre.z,0xf6d9dc);
 }
 if(['glasses','driver'].includes(type)){
  for(const side of [-1,1]){const x=centre.x+side*size.x*.22;
   for(const y of [-1,1])box(size.x*.33,.009,.012,x,eyeY+y*size.y*.08,front,0x393633);
   for(const dx of [-1,1])box(.008,size.y*.16,.012,x+dx*size.x*.165,eyeY,front,0x393633);
  }box(size.x*.12,.009,.014,centre.x,eyeY,front,0x393633);
 }
 if(['captain','police','driver'].includes(type)){
  const colour=type==='captain'?0x333d4b:type==='police'?0x293e60:0x415d55;
  coloured(new THREE.CylinderGeometry(1,.98,1,10).scale(size.x*.55,size.y*.18,size.z*.53).translate(centre.x,bounds.max.y-size.y*.06,centre.z),colour);
  box(size.x*.94,.018,size.z*.55,centre.x,bounds.max.y-size.y*.15,front-size.z*.05,colour);
  box(size.x*.16,size.y*.1,.012,centre.x,bounds.max.y-size.y*.085,front,0xcbac60);
  if(type!=='police')box(size.x*.32,size.y*.065,.016,centre.x,bounds.min.y+size.y*.28,front,style.hair);
 }
 mount(head,type);
 if(chest&&(type==='police'||type.includes('apron')||type==='tool-pouch'||type.includes('satchel')||type.includes('scarf'))){
  const chestPoint=chest.getWorldPosition(new THREE.Vector3()),h=size.y;
  if(type.includes('apron')){
   const front=torsoBounds.max.z+.014,top=torsoBounds.max.y-.055,bottom=torsoBounds.min.y+.06;
   box(size.x*.95,(top-bottom)*.8,.018,chestPoint.x,(top+bottom)/2,front,0xe4d1a3);
   for(const side of [-1,1])box(.025,.15,.020,chestPoint.x+side*size.x*.34,top+.02,front,0xe4d1a3);
  }else if(type.includes('scarf')){
   const front=torsoBounds.max.z+.022,top=torsoBounds.max.y;
   box(size.x*.65,.048,.045,chestPoint.x,top-.035,front,style.accent);
   box(.045,.16,.035,chestPoint.x-size.x*.16,top-.12,front,style.accent);
  }else if(type.includes('satchel')){
   const front=torsoBounds.max.z+.025,top=torsoBounds.max.y-.02,bottom=torsoBounds.min.y+.02;
   coloured(new THREE.BoxGeometry(.025,top-bottom,.018).rotateZ(-.23).translate(chestPoint.x,(top+bottom)/2,front),style.accent);
   box(.13,.13,.07,chestPoint.x-size.x*.46,bottom,front,style.accent);
   box(.025,.025,.012,chestPoint.x-size.x*.46,bottom,front+.04,0xc1ac73);
  }else if(type==='police')box(.045,.062,.026,chestPoint.x+size.x*.35,chestPoint.y,centre.z+size.z*.36,0xd5b865);
  else box(.085,.11,.055,chestPoint.x-size.x*.58,chestPoint.y-h*.65,centre.z+size.z*.24,0x84674c);
  mount(chest,type+'-uniform');
 }
}

// The supplied PSX faces have no morph targets. These fitted lids cover the
// painted open eyes only during sleep, using the resident's own skin tone.
export function addSleepEyes(model,style){
 model.updateMatrixWorld(true);
 const head=model.getObjectByName('Head');if(!head)return null;
 const bounds=new THREE.Box3(),point=new THREE.Vector3();
 model.traverse(mesh=>{if(!mesh.isSkinnedMesh)return;const a=mesh.geometry.attributes;
  for(let i=0;i<a.position.count;i++){
   let weight=0;for(let j=0;j<4;j++)if(mesh.skeleton.bones[a.skinIndex.getComponent(i,j)]===head)weight+=a.skinWeight.getComponent(i,j);
   if(weight>.5){point.fromBufferAttribute(a.position,i).applyMatrix4(mesh.matrixWorld);bounds.expandByPoint(point);}
  }
 });
 if(bounds.isEmpty())return null;
 const size=bounds.getSize(new THREE.Vector3()),centre=bounds.getCenter(new THREE.Vector3()),front=bounds.max.z+.009,eyeY=bounds.min.y+size.y*.53;
 const parts=[];
 const coloured=(geometry,colour)=>{const c=new THREE.Color(colour),rgb=new Float32Array(geometry.attributes.position.count*3);for(let i=0;i<rgb.length;i+=3)rgb.set([c.r,c.g,c.b],i);geometry.setAttribute('color',new THREE.BufferAttribute(rgb,3));parts.push(geometry);};
 for(const side of [-1,1]){
  const x=centre.x+side*size.x*.22;
  coloured(new THREE.BoxGeometry(size.x*.32,size.y*.135,.012).translate(x,eyeY,front),style?.skin||0xcba27e);
  coloured(new THREE.BoxGeometry(size.x*.25,size.y*.014,.010).rotateZ(-side*.055).translate(x,eyeY-size.y*.004,front+.009),style?.hair||0x302820);
 }
 const inverse=head.matrixWorld.clone().invert(),group=new THREE.Group();group.name='resident-sleep-eyes';group.userData.sleepEyes=true;
 const geometry=mergeGeometries(parts);parts.forEach(g=>g.dispose());geometry.applyMatrix4(inverse);
 const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.86,flatShading:true}));mesh.name='closed-eye-covers';mesh.renderOrder=4;group.add(mesh);
 group.visible=false;head.add(group);return group;
}
