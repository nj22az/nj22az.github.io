import * as THREE from '../../vendor/three.module.js';
import {createMaterials} from '../render/materials.js?snappy=1';
import {BOARDWALK} from './layout.js?snappy=1';

export function buildBoardwalk(parent,options={}){
 const library=createMaterials({mobile:options.mobile,anisotropy:options.maxAnisotropy||4});
 const mat=library.material('timber',0xb69a75).clone();
 // Independent repeats keep nearby boards detailed without stretching the shared maps.
 for(const name of ['map','normalMap','roughnessMap','aoMap'])if(mat[name]){mat[name]=mat[name].clone();mat[name].repeat.set(5,20);}
 mat.normalScale.set(.32,.32);mat.roughness=.88;mat.aoMapIntensity=.3;
 const length=BOARDWALK.maxZ-BOARDWALK.minZ;
 const deck=new THREE.Mesh(new THREE.BoxGeometry(BOARDWALK.width,.20,length),mat);deck.name='harbour-boardwalk-deck';deck.position.set(BOARDWALK.x,-.10,(BOARDWALK.minZ+BOARDWALK.maxZ)/2);deck.receiveShadow=true;parent.add(deck);
 // Shallow board joints are batched, with a flush walking surface.
 //
 // A seam lies in the deck's own plane, so it cannot win the depth test on its height:
 // two millimetres of daylight resolves on a desktop card and flickers on a phone. It
 // wins on a polygon offset instead -- the same decal treatment the painted road lines
 // use -- and can then sit exactly flush, which is what a seam in a deck should do.
 const decal=()=>({depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const seamMaterial=new THREE.MeshStandardMaterial({color:0x493e31,roughness:.96,...decal()});
 const count=Math.ceil(length/.36),joints=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),seamMaterial,count),dummy=new THREE.Object3D();
 joints.name='harbour-boardwalk-joints';joints.receiveShadow=true;joints.renderOrder=1;
 for(let i=0;i<count;i++){dummy.position.set(BOARDWALK.x,0,BOARDWALK.minZ+i*.36);dummy.scale.set(BOARDWALK.width-.12,.003,.013);dummy.updateMatrix();joints.setMatrixAt(i,dummy.matrix);}
 joints.instanceMatrix.needsUpdate=true;joints.computeBoundingSphere();parent.add(joints);
 // The edging was buried a millimetre and a half under the deck: nothing to see from
 // above and a flicker the length of the harbour wherever the depth test could not
 // separate them. As a decal it reads as the darker outside board it was meant to be.
 const edgeMaterial=new THREE.MeshStandardMaterial({color:0x6d5840,roughness:.9,...decal()});
 const edges=new THREE.InstancedMesh(new THREE.BoxGeometry(.14,.003,length),edgeMaterial,2);edges.name='harbour-boardwalk-edge';edges.renderOrder=1;
 for(const [i,side] of [-1,1].entries()){dummy.position.set(BOARDWALK.x+side*(BOARDWALK.width/2-.07),0,(BOARDWALK.minZ+BOARDWALK.maxZ)/2);dummy.scale.set(1,1,1);dummy.updateMatrix();edges.setMatrixAt(i,dummy.matrix);}
 edges.instanceMatrix.needsUpdate=true;edges.computeBoundingSphere();edges.receiveShadow=true;parent.add(edges);
 return {deck,joints,edges,setRain(wet){mat.roughness=wet?.65:.88;}};
}
