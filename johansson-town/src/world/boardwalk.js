import * as THREE from '../../vendor/three.module.js';
import {GROUND} from '../render/ground-palette.js';
import {paintedAsphalt} from '../render/toy-surfaces.js';
import {BOARDWALK} from './layout.js?snappy=1';

/**
 * The main street's carriageway, from the shopping arcade down to the quay.
 *
 * This used to be a timber boardwalk the width of the road. A 1997 Okinawan shotengai
 * is asphalt: painted white edge lines a hand's width in from the kerb, a gutter, and
 * round cast-iron manhole covers. The name and the returned shape are kept (deck,
 * joints, edges) so the dining street, its colliders and the tests are unchanged;
 * the joints are now the dashed white edge lines and the edges the gutters.
 * Everything here is painted, not photographed (docs/AMPLIFY-AUDIT.md, §4).
 */
export function buildBoardwalk(parent,options={}){
 const map=paintedAsphalt().clone();map.userData.sharedAsset=true;
 const length=BOARDWALK.maxZ-BOARDWALK.minZ;
 map.repeat.set(BOARDWALK.width/4,length/4);map.needsUpdate=true;
 const mat=new THREE.MeshStandardMaterial({color:GROUND.asphalt,map,roughness:.9});mat.name='main-street-asphalt';
 const deck=new THREE.Mesh(new THREE.BoxGeometry(BOARDWALK.width,.20,length),mat);deck.name='harbour-boardwalk-deck';deck.position.set(BOARDWALK.x,-.10,(BOARDWALK.minZ+BOARDWALK.maxZ)/2);deck.receiveShadow=true;parent.add(deck);
 // Paint and iron lie in the road's own plane, so they win the depth test on a polygon
 // offset rather than on height: two millimetres of daylight flickers on a phone.
 const decal=()=>({depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const dummy=new THREE.Object3D();
 // White edge lines, dashed: 2 m of paint, 1 m gap, each side.
 const paint=new THREE.MeshStandardMaterial({color:0xf2efe6,roughness:.8,...decal()});
 const dashes=Math.floor(length/3),joints=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),paint,dashes*2);
 joints.name='main-street-edge-lines';joints.receiveShadow=true;joints.renderOrder=1;
 let n=0;for(const side of [-1,1])for(let i=0;i<dashes;i++){
  dummy.position.set(BOARDWALK.x+side*(BOARDWALK.width/2-.32),0,BOARDWALK.minZ+1.5+i*3);dummy.scale.set(.12,.003,2);dummy.updateMatrix();joints.setMatrixAt(n++,dummy.matrix);}
 joints.instanceMatrix.needsUpdate=true;joints.computeBoundingSphere();parent.add(joints);
 // Gutters: a darker concrete strip against each kerb.
 const edgeMaterial=new THREE.MeshStandardMaterial({color:0x8d918f,roughness:.95,...decal()});
 const edges=new THREE.InstancedMesh(new THREE.BoxGeometry(.22,.003,length),edgeMaterial,2);edges.name='main-street-gutters';edges.renderOrder=1;
 for(const [i,side] of [-1,1].entries()){dummy.position.set(BOARDWALK.x+side*(BOARDWALK.width/2-.11),0,(BOARDWALK.minZ+BOARDWALK.maxZ)/2);dummy.scale.set(1,1,1);dummy.updateMatrix();edges.setMatrixAt(i,dummy.matrix);}
 edges.instanceMatrix.needsUpdate=true;edges.computeBoundingSphere();edges.receiveShadow=true;parent.add(edges);
 // Manhole covers down the crown, every twelve metres or so.
 const iron=new THREE.MeshStandardMaterial({color:0x5d6265,roughness:.7,...decal()});
 const covers=Math.floor(length/12),manholes=new THREE.InstancedMesh(new THREE.CylinderGeometry(.32,.32,.004,20),iron,covers);
 manholes.name='main-street-manholes';manholes.renderOrder=1;manholes.receiveShadow=true;
 for(let i=0;i<covers;i++){dummy.position.set(BOARDWALK.x+(i%2?.6:-.4),0,BOARDWALK.minZ+6+i*12);dummy.scale.set(1,1,1);dummy.updateMatrix();manholes.setMatrixAt(i,dummy.matrix);}
 manholes.instanceMatrix.needsUpdate=true;manholes.computeBoundingSphere();parent.add(manholes);
 return {deck,joints,edges,setRain(wet){mat.roughness=wet?.4:.9;}};
}
