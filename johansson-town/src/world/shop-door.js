import * as THREE from '../../vendor/three.module.js';
import {createMaterials} from '../render/materials.js?snappy=1';

// Metre-scale joinery. The handle, threshold and interaction share this doorway.
export function buildShopDoor(parent,{name='shop-door',width=1.45,glass=true,shadows=false}={}){
 const group=new THREE.Group();group.name=name;parent.add(group);
 const surfaces=createMaterials(),wood=surfaces.material('timber',0x74563b),dark=new THREE.MeshStandardMaterial({color:0x302c27,roughness:.85});
 const metal=new THREE.MeshStandardMaterial({color:0x9c8860,roughness:.35,metalness:.65});
 const pane=new THREE.MeshStandardMaterial({color:0x495c5d,roughness:.42,metalness:.05,emissive:0xe5ba77,emissiveIntensity:0});
 function part(size,position,material,label){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.position.set(...position);mesh.castShadow=shadows;mesh.receiveShadow=true;mesh.userData.staticProp=material!==pane;if(label)mesh.name=label;group.add(mesh);return mesh;}
 part([width+.28,2.6,.08],[0,1.3,.12],dark,'door-recess');
 for(const x of [-width/2-.06,width/2+.06])part([.12,2.58,.20],[x,1.29,.23],wood,'door-jamb');
 part([width+.24,.12,.20],[0,2.58,.23],wood,'door-lintel');
 const leaf=part([width,2.4,.10],[0,1.28,.23],wood,'door-leaf');
 let glazing=leaf;
 if(glass){
  glazing=part([width-.24,1.28,.035],[0,1.75,.30],pane,'door-glazing');
  for(const y of [1.08,1.75,2.42])part([width-.16,.055,.07],[0,y,.335],wood);
  part([.055,1.35,.07],[0,1.75,.335],wood);
 }
 for(const x of [-width*.29,0,width*.29])part([.024,.71,.025],[x,.63,.292],dark);
 part([.04,.30,.06],[width*.33,1.12,.37],metal,'door-handle');
 part([width+.32,.10,.50],[0,.05,.29],new THREE.MeshStandardMaterial({color:0x96958a,roughness:.96}),'door-threshold');
 return {group,leaf,pane:glazing,update(open,day){pane.emissiveIntensity=open?(1-day)*.16:0;}};
}

export function buildBookWindow(parent,{shadows=false}={}){
 const group=new THREE.Group();group.name='Front-Row book display';group.position.set(-2.35,0,.30);parent.add(group);
 const wood=new THREE.MeshStandardMaterial({color:0x6a4e35,roughness:.8}),back=new THREE.MeshStandardMaterial({color:0x263637,roughness:.7});
 const paper=new THREE.MeshStandardMaterial({color:0xd7d0b6,roughness:.95});
 const colours=[0x72423c,0x314f5a,0x968054,0x526449].map(color=>new THREE.MeshStandardMaterial({color,roughness:.88}));
 function box(size,position,material){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.position.set(...position);m.castShadow=shadows;m.receiveShadow=true;m.userData.staticProp=true;group.add(m);}
 box([2.30,1.80,.06],[0,1.52,0],back);
 for(const x of [-1.2,1.2])box([.10,1.96,.24],[x,1.52,.08],wood);
 for(const y of [.56,1.43,2.48])box([2.50,.10,.28],[0,y,.09],wood);
 for(let row=0;row<2;row++)for(let i=0;i<7;i++){
  const x=-.98+i*.30,y=.62+row*.87,h=.40+(i%3)*.07;
  box([.21,h,.11],[x,y+h/2,.15],colours[(i+row)%4]);
  box([.14,.024,.008],[x,y+h*.75,.210],paper);
 }
 return group;
}
