import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';

// Only explicitly marked, immobile factory meshes are eligible. Original anchors remain
// visible to interactions but move to an unrendered layer. Animated props are excluded.
export function batchStaticProps(root,cellSize=24){
 root.updateMatrixWorld(true);const inverse=new THREE.Matrix4().copy(root.matrixWorld).invert(),buckets=new Map(),sources=[];
 root.traverse(o=>{
  if(!o.isMesh||!o.userData.staticProp||o.isInstancedMesh||o.isSkinnedMesh||Array.isArray(o.material)||o.material.transparent)return;
  for(let p=o;p&&p!==root;p=p.parent)if(p.userData.dynamicProp)return;
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

/**
 * A few-mesh copy of everything visible under `root`, for looking at it from outside.
 *
 * Meshes sharing a look (material kind, texture, transparency, side) are merged into one,
 * with each piece's colour carried in its vertices and instanced meshes expanded. The
 * copy sits in root's own frame; `show(true)` moves the originals to an unrendered layer
 * and `show(false)` puts them back exactly as they were. Nothing animates in the copy, so
 * it is for a view through glass, not for a room you stand in.
 */
const MERGEABLE=new Set(['MeshStandardMaterial','MeshBasicMaterial','MeshToonMaterial','MeshPhysicalMaterial','MeshLambertMaterial']);
export function createStandIn(root,{name='stand-in'}={}){
 root.updateMatrixWorld(true);
 const inverse=new THREE.Matrix4().copy(root.matrixWorld).invert(),buckets=new Map(),sources=[];
 const visible=o=>{for(let p=o;p&&p!==root;p=p.parent)if(!p.visible)return false;return true;};
 // Moving things (dynamicProp: the shop's own front door) are not copied, since a merged copy would hold them still (a door
 // frozen shut in the doorway while the street's door slides open), and they are not drawn from outside either.
 const moves=o=>{for(let p=o;p&&p!==root;p=p.parent)if(p.userData.dynamicProp)return true;return false;},moving=[];
 root.traverse(o=>{
  if(o.isMesh&&visible(o)&&o.layers.isEnabled(0)&&moves(o)){moving.push(o);return;}
  if(!o.isMesh||o.isSkinnedMesh||Array.isArray(o.material)||!MERGEABLE.has(o.material.type)||!visible(o)||!o.layers.isEnabled(0))return;
  const m=o.material,r=v=>Math.round((v??0)*20)/20;
  const key=[m.type,m.map?.uuid,m.alphaMap?.uuid,m.transparent,r(m.opacity),m.side,m.alphaTest,m.depthWrite,m.depthTest,m.toneMapped,m.blending,r(m.roughness),r(m.metalness),m.fog,m.polygonOffset&&m.polygonOffsetFactor,o.renderOrder].join('/');
  if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);sources.push(o);
 });
 const group=new THREE.Group();group.name=name;
 const matrix=new THREE.Matrix4(),instance=new THREE.Matrix4(),tint=new THREE.Color(),scale=new THREE.Vector3();
 for(const objects of buckets.values()){
  const first=objects[0].material,textured=!!(first.map||first.alphaMap),pieces=[];
  for(const o of objects){
   const m=o.material,colour=m.color?m.color.clone():new THREE.Color(1,1,1);
   if(m.emissive&&!m.isMeshBasicMaterial)colour.add(m.emissive.clone().multiplyScalar(m.emissiveIntensity??1));
   const base=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
   for(const k of Object.keys(base.attributes))if(!['position','normal','uv','color'].includes(k))base.deleteAttribute(k);
   if(!base.attributes.normal)base.computeVertexNormals();
   const n=base.attributes.position.count;
   if(textured&&!base.attributes.uv)base.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(n*2),2));
   if(!textured)base.deleteAttribute('uv');
   const own=m.vertexColors&&base.attributes.color;
   const count=o.isInstancedMesh?o.count:1;
   for(let i=0;i<count;i++){
    matrix.multiplyMatrices(inverse,o.matrixWorld);
    if(o.isInstancedMesh){o.getMatrixAt(i,instance);if(instance.decompose(new THREE.Vector3(),new THREE.Quaternion(),scale)&&scale.lengthSq()<1e-10)continue;matrix.multiply(instance);}
    const g=base.clone().applyMatrix4(matrix),c=tint.copy(colour);
    // Shelf labels choose their flavour in the live instance shader. A street
    // copy is ordinary geometry, so keep that choice in its printed UVs.
    const shift=o.isInstancedMesh&&o.geometry.attributes.atlasShift,uv=g.attributes.uv;
    if(shift&&uv)for(let v=0;v<uv.count;v++)uv.setXY(v,uv.getX(v)+shift.getX(i),uv.getY(v)+shift.getY(i));
    if(o.isInstancedMesh&&o.instanceColor)c.multiply(new THREE.Color().fromBufferAttribute(o.instanceColor,i));
    const col=new Float32Array(n*3);
    for(let v=0;v<n;v++){if(own){col[v*3]=own.getX(v)*c.r;col[v*3+1]=own.getY(v)*c.g;col[v*3+2]=own.getZ(v)*c.b;}else c.toArray(col,v*3);}
    g.setAttribute('color',new THREE.BufferAttribute(col,3));g.clearGroups();pieces.push(g);
   }
   base.dispose();
  }
  const geometry=pieces.length&&mergeGeometries(pieces,false);pieces.forEach(g=>g.dispose());if(!geometry)continue;
  const material=first.clone();if(material.color)material.color.set(0xffffff);if(material.emissive&&!material.isMeshBasicMaterial)material.emissive.set(0);material.vertexColors=true;
  const mesh=new THREE.Mesh(geometry,material);mesh.renderOrder=objects[0].renderOrder;mesh.matrixAutoUpdate=false;group.add(mesh);
 }
 const masks=new Map();
 return {group,sources:sources.length,meshes:group.children.length,
  show(on){
   group.visible=on;
   if(on)for(const o of [...sources,...moving]){if(!masks.has(o))masks.set(o,o.layers.mask);o.layers.set(31);}
   else{for(const [o,mask] of masks)o.layers.mask=mask;masks.clear();}
  },
  dispose(){this.show(false);group.removeFromParent();group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}};
}
