import * as THREE from '../../vendor/three.module.js';
import {createMaterials} from '../render/materials.js';
import {BOARDWALK} from './layout.js';

export function buildBoardwalk(parent,options={}){
 const library=createMaterials({mobile:options.mobile,anisotropy:options.maxAnisotropy||4});
 const mat=library.material('timber',0xb69a75).clone();
 // Independent repeats keep nearby boards detailed without stretching the shared maps.
 for(const name of ['map','normalMap','roughnessMap','aoMap'])if(mat[name]){mat[name]=mat[name].clone();mat[name].repeat.set(5,20);}
 mat.normalScale.set(.32,.32);mat.roughness=.88;mat.aoMapIntensity=.3;
 const length=BOARDWALK.maxZ-BOARDWALK.minZ;
 const deck=new THREE.Mesh(new THREE.BoxGeometry(23,.20,length),mat);deck.name='harbour-boardwalk-deck';deck.position.set(0,-.10,(BOARDWALK.minZ+BOARDWALK.maxZ)/2);deck.receiveShadow=true;parent.add(deck);
 // Shallow board joints are batched, with a flush walking surface.
 const seamMaterial=new THREE.MeshStandardMaterial({color:0x493e31,roughness:.96});
 const count=Math.ceil(length/.36),joints=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),seamMaterial,count),dummy=new THREE.Object3D();
 joints.name='harbour-boardwalk-joints';joints.receiveShadow=true;
 for(let i=0;i<count;i++){dummy.position.set(0,.001,BOARDWALK.minZ+i*.36);dummy.scale.set(14.8,.003,.013);dummy.updateMatrix();joints.setMatrixAt(i,dummy.matrix);}
 joints.instanceMatrix.needsUpdate=true;joints.computeBoundingSphere();parent.add(joints);
 const edgeMaterial=new THREE.MeshStandardMaterial({color:0x6d5840,roughness:.9});
 const edges=new THREE.InstancedMesh(new THREE.BoxGeometry(.14,.025,length),edgeMaterial,2);edges.name='harbour-boardwalk-edge';
 for(const [i,side] of [-1,1].entries()){dummy.position.set(side*7.30,-.014,(BOARDWALK.minZ+BOARDWALK.maxZ)/2);dummy.scale.set(1,1,1);dummy.updateMatrix();edges.setMatrixAt(i,dummy.matrix);}
 edges.instanceMatrix.needsUpdate=true;edges.computeBoundingSphere();edges.receiveShadow=true;parent.add(edges);
 return {deck,joints,edges,setRain(wet){mat.roughness=wet?.65:.88;}};
}
