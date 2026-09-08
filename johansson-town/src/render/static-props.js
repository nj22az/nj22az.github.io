import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';

// Only explicitly marked, immobile factory meshes are eligible. Original anchors remain
// visible to interactions but move to an unrendered layer. Animated props are excluded.
export function batchStaticProps(root,cellSize=24){
 root.updateMatrixWorld(true);const inverse=new THREE.Matrix4().copy(root.matrixWorld).invert(),buckets=new Map(),sources=[];
 root.traverse(o=>{
  if(!o.isMesh||!o.userData.staticProp||o.isInstancedMesh||o.isSkinnedMesh||Array.isArray(o.material)||o.material.transparent)return;
  for(let p=o;p&&p!==root;p=p.parent)if(p.name==='prop:delivery-trolley'||p.userData.dynamicProp)return;
  const mat=o.material,world=o.getWorldPosition(new THREE.Vector3()),key=[Math.floor(world.x/cellSize),Math.floor(world.z/cellSize),mat.type,mat.map?.uuid,mat.normalMap?.uuid,mat.roughness,mat.metalness,mat.emissive?.getHex(),mat.emissiveIntensity,mat.side,o.castShadow,o.receiveShadow,o.renderOrder].join('/');
  if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);
 });
 let batches=0,drawsSaved=0,triangles=0;
 for(const [key,objects] of buckets){if(objects.length<3)continue;const pieces=[];
  for(const o of objects){
   const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld));g.clearGroups();
   const colours=new Float32Array(g.attributes.position.count*3);for(let i=0;i<g.attributes.position.count;i++){colours[i*3]=o.material.color.r;colours[i*3+1]=o.material.color.g;colours[i*3+2]=o.material.color.b;}
   g.setAttribute('color',new THREE.BufferAttribute(colours,3));pieces.push(g);
  }
  const geometry=mergeGeometries(pieces,false);if(!geometry){pieces.forEach(g=>g.dispose());continue;}
  const material=objects[0].material.clone();material.color.set(0xffffff);material.vertexColors=true;
  const mesh=new THREE.Mesh(geometry,material);mesh.name='static-props:'+key;mesh.castShadow=objects[0].castShadow;mesh.receiveShadow=objects[0].receiveShadow;mesh.renderOrder=objects[0].renderOrder;root.add(mesh);
  geometry.computeBoundingSphere();geometry.computeBoundingBox();
  for(const o of objects){o.layers.set(31);o.userData.renderBatch=mesh.uuid;sources.push(o);}
  pieces.forEach(g=>g.dispose());batches++;drawsSaved+=objects.length-1;triangles+=geometry.attributes.position.count/3;
 }
 return {batches,sourceMeshes:sources.length,drawsSaved,triangles,cellSize};
}
