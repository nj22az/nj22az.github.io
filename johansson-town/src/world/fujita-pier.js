import * as THREE from '../../vendor/three.module.js';

// One straight landing, ending at the shed; the old empty L-return is open water.
export const FUJITA_PIER=Object.freeze({minX:-38.3,maxX:-33.7,minZ:-64.3,maxZ:-49.7});
export const fujitaPierAt=(x,z,r=0)=>x>=FUJITA_PIER.minX+r&&x<=FUJITA_PIER.maxX-r&&z>=FUJITA_PIER.minZ+r&&z<=FUJITA_PIER.maxZ+r;
export function buildFujitaPier({parent,colliders=[],shadows=false}={}){
 const P=FUJITA_PIER,g=new THREE.Group();g.name='Fujita timber boardwalk';parent.add(g);
 const timber=new THREE.MeshStandardMaterial({color:0x8e7960,roughness:.94});
 const dark=new THREE.MeshStandardMaterial({color:0x53483b,roughness:.92});
 const iron=new THREE.MeshStandardMaterial({color:0x515b59,roughness:.72,metalness:.25});
 const box=(name,size,pos,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);m.name=name;m.position.set(...pos);m.castShadow=shadows;m.receiveShadow=true;g.add(m);return m;};
 const length=P.maxZ-P.minZ,count=Math.ceil(length/.3),pitch=length/count;
 const planks=new THREE.InstancedMesh(new THREE.BoxGeometry(P.maxX-P.minX,.12,pitch-.012),timber,count),o=new THREE.Object3D();
 planks.name='Weathered transverse pier planks';planks.receiveShadow=true;
 for(let i=0;i<count;i++){o.position.set(-36,-.06,P.minZ+(i+.5)*pitch);o.updateMatrix();planks.setMatrixAt(i,o.matrix);planks.setColorAt(i,new THREE.Color(i%4===0?0x9e896e:i%3===0?0x81705b:0x958069));}
 planks.computeBoundingSphere();g.add(planks);
 for(const x of [P.minX+.12,P.maxX-.12])box('Continuous pier edge beam',[.22,.26,length],[x,-.20,(P.minZ+P.maxZ)/2],dark);
 for(let z=P.maxZ-.7;z>P.minZ;z-=2.4){
  box('Pier cross bearer',[4.6,.20,.18],[-36,-.3,z],dark);
  for(const x of [P.minX+.15,P.maxX-.15]){const pile=new THREE.Mesh(new THREE.CylinderGeometry(.16,.19,1.9,8),dark);pile.position.set(x,-1,z);pile.castShadow=shadows;g.add(pile);box('Galvanised pile strap',[.39,.08,.39],[x,-.32,z],iron);}
 }
 // A slender rail on the water side; the west stays open for Shiosai's gangway.
 const east=P.maxX-.12,start=-50.3,end=P.minZ+.2;
 const spans=Math.ceil((start-end)/2);
 for(let i=0;i<=spans;i++){const z=start+(end-start)*i/spans;box('Water-side rail post',[.09,.96,.09],[east,.48,z],dark);colliders.push({id:'fujita-pier-rail',x:east,z,w:.12,d:.12,height:.98});}
 for(const y of [.48,.94])box('Water-side timber rail',[.08,.065,start-end],[east,y,(start+end)/2],dark);
 box('Pier end fascia',[4.6,.24,.18],[-36,-.12,P.minZ+.02],dark);
 return {group:g,planks};
}
