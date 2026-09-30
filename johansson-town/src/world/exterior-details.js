import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {RESIDENTIAL_ENTRIES} from './residential-layout.js';

/** Small architectural fittings, batched by material instead of one draw per fitting. */
function detailKit(parent,name,{shadows=false}={}){
 const group=new THREE.Group();group.name=name;parent.add(group);
 const parts=new Map();
 const add=(size,position,colour,rotation=0)=>{
  const g=new THREE.BoxGeometry(...size);g.rotateY(rotation);g.translate(...position);
  if(!parts.has(colour))parts.set(colour,[]);parts.get(colour).push(g);
 };
 const finish=()=>{
  for(const [colour,list] of parts){
   const material=new THREE.MeshStandardMaterial({color:colour,roughness:.82,metalness:.08});
   material.userData.keepPhysical=true;
   const mesh=new THREE.Mesh(mergeGeometries(list,false),material);list.forEach(g=>g.dispose());
   mesh.name=name+' fittings';mesh.castShadow=shadows;mesh.receiveShadow=true;
   mesh.userData.staticProp=true;group.add(mesh);
  }
  return group;
 };
 return {add,finish};
}

/** Measured entrance positions, leaving the authored door panels and approaches clear. */
export function buildResidentialDetails(parent,options={}){
 const {add,finish}=detailKit(parent,'Main Street entrance details',options);
 for(const entry of Object.values(RESIDENTIAL_ENTRIES)){
  const [x,z]=entry.facade;
  // A shallow reveal and sill bring the existing panel into a constructed opening.
  for(const side of [-1,1])add([.12,2.32,.065],[x+.06,1.18,z+side*.55],0x65675f);
  add([.14,.075,1.17],[x+.07,2.37,z],0x65675f);
  add([.30,.055,1.17],[x+.15,.048,z],0x8b887a);
  // Mailbox and service conduit sit beside the opening, rather than across it.
  add([.16,.32,.27],[x+.08,1.35,z+.81],0x65675f);
  add([.18,.035,.23],[x+.09,1.4,z+.81],0x333e3c);
  add([.07,2.85,.07],[x+.035,1.45,z-.83],0x65675f);
 }
 return finish();
}

export function buildSakuraDetails(parent,{width,depth,doorX,shadows=true}){
 const {add,finish}=detailKit(parent,'Sakura exterior details',{shadows});
 const half=width/2;
 // Roof drip edge and rainwater fittings. All remain against the building envelope.
 add([width+.38,.10,.16],[0,3.80,.20],0x586660);
 for(const side of [-1,1]){
  add([.10,3.65,.10],[side*(half+.15),1.84,-.18],0x586660);
  add([.18,.07,.16],[side*(half+.15),.17,-.13],0x586660);
  add([.22,.20,depth],[side*(half+.04),.12,-depth/2],0x8d897c);
 }
 // Window sill runs stop at the doorway so the shop's sliding leaves remain clear.
 const lo=-half+.12,hi=half-.12;
 for(const [a,b] of [[lo,doorX-.98],[doorX+.98,hi]])if(b>a){
  add([b-a,.12,.23],[(a+b)/2,.14,.075],0x8d897c);
 }
 add([2.05,.055,.36],[doorX,.20,.07],0x8d897c);
 // Low maintenance paving at each corner, clear of the customer entrance.
 for(const side of [-1,1])add([.55,.05,.55],[side*(half-.35),.04,.37],0x8d897c);
 return finish();
}
