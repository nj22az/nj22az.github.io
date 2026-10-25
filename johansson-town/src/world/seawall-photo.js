import * as THREE from '../../vendor/three.module.js';
import {SEAWALL_PHOTO_ENABLED,seawallPhotoSolids,SEAWALL_PHOTO} from './seawall-photo-plan.js';
// Only the opt-in prototype imports the Blender mesh payload; default game does not decode or construct it.
const data=SEAWALL_PHOTO_ENABLED?(await import('./seawall-photo-mesh.js')).SEAWALL_MESH:null;
const floats=s=>new Float32Array(Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer);
export function buildSeawallPhoto(world,{register,onAction,shadows=false}={}){
 if(!SEAWALL_PHOTO_ENABLED)return null;
 const group=new THREE.Group();group.name='Nishi seawall photo overlook - Blender JW-PH-001 C';
 for(const part of data){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(floats(part.positions),3));geometry.setAttribute('normal',new THREE.BufferAttribute(floats(part.normals),3));geometry.computeBoundingBox();geometry.computeBoundingSphere();
  const color=new THREE.Color().setRGB(...part.color);const material=new THREE.MeshStandardMaterial({color,roughness:part.material==='iron'?.55:.92,side:THREE.FrontSide});material.name='Nishi overlook '+part.material;
  const mesh=new THREE.Mesh(geometry,material);mesh.name='Blender overlook '+part.material;mesh.castShadow=shadows&&part.material!=='foam';mesh.receiveShadow=part.material!=='foam';mesh.userData.walkSurface=false;group.add(mesh);
 }
 world.group.add(group);world.colliders.push(...seawallPhotoSolids());
 const marker=new THREE.Object3D();marker.position.set(-35.3,1,-6.65);marker.userData.seawallPhoto=true;group.add(marker);
 register?.(marker,'Take a seawall portrait',()=>onAction?.('seawall-photo'));
 return {group,photo:SEAWALL_PHOTO.photo,triangles:data.reduce((sum,p)=>sum+p.vertices/3,0)};
}
