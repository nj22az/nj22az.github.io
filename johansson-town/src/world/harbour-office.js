import * as THREE from '../../vendor/three.module.js';
import {createMaterials} from '../render/materials.js';
import {buildShopDoor} from './shop-door.js';
import {HARBOUR_OFFICE as O} from './business-layout.js';
// A single quay office replaces the old cold-store box and both office addresses.
export function buildHarbourOffice({parent,site,register,enter,label,shadows}){
 const group=new THREE.Group();group.name='Consolidated harbour office';group.position.set(O.x,0,O.frontZ);parent.add(group);
 const surfaces=createMaterials(),wood=surfaces.material('timber',0xd0c9ac),trim=surfaces.material('timber',0x435b57),roof=surfaces.material('roof',0x545e5b),concrete=surfaces.worldMaterial('concrete',0x9e9e8d,2);
 const box=(size,pos,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);m.position.set(...pos);m.castShadow=!!shadows;m.receiveShadow=true;group.add(m);return m;};
 box([7.2,.16,7.2],[0,0,-3.6],concrete);
 box([7.2,3.25,.15],[0,1.625,-7.1],wood);for(const x of [-3.55,3.55])box([.15,3.25,7.2],[x,1.625,-3.6],wood);
 for(const x of [-2.17,2.17])box([2.85,3.25,.15],[x,1.625,0],wood);
 box([1.5,.65,.15],[0,2.925,0],wood);
 for(const x of [-3.55,-.78,.78,3.55])box([.1,3.25,.12],[x,1.625,.10],trim);
 for(const y of [.18,.88,2.7,3.25])box([7.3,.1,.16],[0,y,.12],trim);
 const shape=new THREE.Shape();shape.moveTo(-3.9,0);shape.lineTo(0,1.05);shape.lineTo(3.9,0);shape.closePath();
 const top=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:7.8,bevelEnabled:false}),roof);top.position.set(0,3.3,-7.5);top.castShadow=!!shadows;group.add(top);
 const glass=new THREE.MeshStandardMaterial({color:0x425755,roughness:.35,emissive:0xd5b475,emissiveIntensity:.12});
 for(const x of [-2.2,2.2]){box([1.72,1.35,.06],[x,1.9,.11],glass);for(const dx of [-.88,0,.88])box([.06,1.45,.12],[x+dx,1.9,.16],trim);for(const y of [1.18,2.62])box([1.86,.07,.16],[x,y,.16],trim);}
 const door=buildShopDoor(group,{name:'office-quay-door',width:1.4,shadows});door.group.position.z=.13;
 box([1.9,.13,1.1],[0,2.75,.4],roof);
 label(site.jp,'HARBOUR OFFICE · MARINE SERVICE',[O.x,3.04,O.frontZ+.2],4.6,.45,0,'#e7dcc0','#3e463f',true);
 const entrance=new THREE.Object3D();entrance.name='office-quay-entrance';entrance.position.set(O.x,1.25,O.frontZ+.65);parent.add(entrance);register(entrance,'Enter '+site.title,()=>enter(site));
 Object.assign(site,{x:O.x,z:O.z,door:[...O.door],exitPosition:[...O.door],entryFacing:0,streetFrontage:{position:[O.x,0,O.frontZ],yaw:0}});
 return {id:site.id,lod:group,entrance,shutter:door.pane,source:'Quay office',nearTriangles:0,farTriangles:0,collider:{x:O.x,z:O.z,w:O.width,d:O.depth,height:4.5},update:door.update};
}
