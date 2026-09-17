import * as THREE from '../../vendor/three.module.js';
import {MAIN_ROAD} from './main-road.js';

// The public road ends at a dense tree line. The Harbour Line still continues
// beyond the trees. Pedestrians may walk the woods around the trunks; only the
// trunks themselves block.
export const FOREST_EDGE=Object.freeze({
 id:'forest-edge',
 roadX:MAIN_ROAD.x,
 wallZ:33.8,
 roadEndZ:36.6,
 minX:-15.5,
 maxX:8.5,
 busOnly:false,
});

function signTexture(title,sub){
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#e2d8b7';ctx.fillRect(0,0,768,192);ctx.strokeStyle='#3d5149';ctx.lineWidth=8;ctx.strokeRect(10,10,748,172);ctx.fillStyle='#304b43';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 70px "Yu Gothic",system-ui';ctx.fillText(title,384,70,700);ctx.font='600 27px system-ui';ctx.fillText(sub,384,139,700);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

export function buildForestEdge({parent,colliders,register=()=>{},onAction=()=>{},shadows=false}={}){
 const group=new THREE.Group();group.name='Forest wall and bus-only road';parent.add(group);
 const road=new THREE.Mesh(new THREE.BoxGeometry(MAIN_ROAD.width,.09,FOREST_EDGE.roadEndZ-MAIN_ROAD.maxZ),new THREE.MeshStandardMaterial({color:0x60645d,roughness:.94}));
 road.name='bus-only forest road';road.position.set(FOREST_EDGE.roadX,.005,(FOREST_EDGE.roadEndZ+MAIN_ROAD.maxZ)/2);road.receiveShadow=!!shadows;group.add(road);
 const vergeMat=new THREE.MeshStandardMaterial({color:0x798062,roughness:1});
 for(const side of [-1,1]){
  const verge=new THREE.Mesh(new THREE.BoxGeometry(2.1,.055,FOREST_EDGE.roadEndZ-MAIN_ROAD.maxZ+.4),vergeMat);verge.position.set(FOREST_EDGE.roadX+side*(MAIN_ROAD.width/2+1.05),.002,(FOREST_EDGE.roadEndZ+MAIN_ROAD.maxZ)/2);verge.receiveShadow=!!shadows;group.add(verge);
 }
 const trunkMat=new THREE.MeshStandardMaterial({color:0x4f4031,roughness:1});
 const leafMats=[0x42634b,0x4f7650,0x5b7f53].map(color=>new THREE.MeshStandardMaterial({color,roughness:1}));
 const treeXs=[];
 for(let i=0;i<15;i++)treeXs.push(FOREST_EDGE.minX+.65+i*(FOREST_EDGE.maxX-FOREST_EDGE.minX-1.3)/14);
 for(const [row,zOffset] of [[0,-.18],[1,.72]])for(const [i,x] of treeXs.entries()){
  const z=FOREST_EDGE.wallZ+zOffset+(i%3-.9)*.18,height=2.5+(i%4)*.35,radius=.72+(i%3)*.12;
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,height*.75,7),trunkMat);trunk.position.set(x,height*.375,z);trunk.castShadow=!!shadows;group.add(trunk);
  const crown=new THREE.Mesh(new THREE.ConeGeometry(radius,height*.82,7),leafMats[(i+row)%leafMats.length]);crown.position.set(x,height*.76,z);crown.scale.y=1.18;crown.castShadow=!!shadows;group.add(crown);
  colliders.push({id:'forest-trunk',x,z,w:.42,d:.42,height:height});
 }
 for(let i=0;i<18;i++){
  const x=FOREST_EDGE.minX+.5+(i%9)*(FOREST_EDGE.maxX-FOREST_EDGE.minX-1)/8,z=FOREST_EDGE.wallZ-1.05+(i%2)*.55;
  const shrub=new THREE.Mesh(new THREE.IcosahedronGeometry(.55+(i%3)*.12,0),leafMats[i%leafMats.length]);shrub.position.set(x,.43,z);shrub.scale.y=.75;shrub.castShadow=!!shadows;group.add(shrub);
 }
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.7,.82),new THREE.MeshBasicMaterial({map:signTexture('林道','FOREST ROAD · WALK THE WOODS'),side:THREE.DoubleSide}));sign.position.set(FOREST_EDGE.roadX,2.15,FOREST_EDGE.wallZ-.5);group.add(sign);
 const postMat=new THREE.MeshStandardMaterial({color:0x594938,roughness:1});
 for(const x of [FOREST_EDGE.roadX-1.8,FOREST_EDGE.roadX+1.8]){const post=new THREE.Mesh(new THREE.BoxGeometry(.1,2.1,.1),postMat);post.position.set(x,1.05,FOREST_EDGE.wallZ-.48);group.add(post);}
 const marker=new THREE.Object3D();marker.name='forest-road-waypoint';marker.position.set(FOREST_EDGE.roadX,1,FOREST_EDGE.wallZ-.9);group.add(marker);register(marker,'Read the forest road notice',()=>onAction('read','Forest road notice','The sealed bus lane continues through the trees. Walk around the trunks: the northern woods and the rest of the headland are open ground.'));
 return {group,road,wall:null,marker,busRoute:{id:'bus-forest-road',width:MAIN_ROAD.width,surface:'asphalt',points:[[MAIN_ROAD.x,MAIN_ROAD.maxZ],[MAIN_ROAD.x,FOREST_EDGE.roadEndZ]]}};
}
