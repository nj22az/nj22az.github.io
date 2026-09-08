// Preserve authored skinning and animation, consolidate solid finishes into one draw per resident.
import {readFile,writeFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {GLTFExporter} from './vendor/GLTFExporter.js';
import {mergeGeometries,mergeVertices} from '../vendor/BufferGeometryUtils.js';
import {PROFILES} from '../src/people/profiles.js';
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(b=>{this.result=b;this.onloadend?.();});}readAsDataURL(blob){blob.arrayBuffer().then(b=>{this.result='data:'+blob.type+';base64,'+Buffer.from(b).toString('base64');this.onloadend?.();});}};
const loader=new GLTFLoader(),report=[];
for(const profile of PROFILES){
 const path=new URL('../assets/characters/living/'+profile.model+'.glb',import.meta.url),bytes=await readFile(path);const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');gltf.scene.updateMatrixWorld(true);
 const meshes=[];gltf.scene.traverse(o=>{if(o.isSkinnedMesh)meshes.push(o);});const first=meshes[0];if(!first)throw Error(profile.name+' missing skin');
 const parts=[];
 for(const mesh of meshes){
  if(!mesh.matrixWorld.equals(first.matrixWorld)||!mesh.skeleton.bones.every((b,i)=>b===first.skeleton.bones[i]))throw Error('Incompatible skin');
  const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone(),c=mesh.material.color,array=new Float32Array(g.attributes.position.count*3);
  for(let i=0;i<array.length;i+=3){array[i]=c.r;array[i+1]=c.g;array[i+2]=c.b;}
  g.setAttribute('color',new THREE.Float32BufferAttribute(array,3));g.deleteAttribute('uv');g.clearGroups();parts.push(g);
 }
 const geometry=mergeVertices(mergeGeometries(parts,false),1e-6),body=new THREE.SkinnedMesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.65}));body.name='LivingResident';body.position.copy(first.position);body.quaternion.copy(first.quaternion);body.scale.copy(first.scale);first.parent.add(body);body.bind(first.skeleton,first.bindMatrix);
 const run=gltf.animations.find(c=>c.name==='Walk')?.clone();if(run){run.name='Run';for(const track of run.tracks)track.times=Float32Array.from(track.times,t=>t*.7);run.resetDuration();gltf.animations.push(run);}
 for(const mesh of meshes)mesh.removeFromParent();
 const binary=await new GLTFExporter().parseAsync(gltf.scene,{binary:true,animations:gltf.animations});await writeFile(path,Buffer.from(binary));
 report.push({name:profile.name,bytes:binary.byteLength,draws:1,triangles:geometry.index.count/3,clips:gltf.animations.map(c=>c.name)});
}
await writeFile(new URL('../art/living-cast/runtime-report.json',import.meta.url),JSON.stringify(report,null,2));console.log('Compacted '+report.length+' residents');
