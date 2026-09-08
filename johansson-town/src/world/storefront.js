import * as THREE from '../../vendor/three.module.js';
// Original Sakura shopfront: a lit glass frontage and real shelf silhouettes behind it.
export function buildStorefront({parent,site,register,enter,label}){
 const group=new THREE.Group();group.name='Sakura glass storefront';group.position.set(site.side*7.55,0,site.z);group.rotation.y=-site.side*Math.PI/2;parent.add(group);
 const materials=new Map();function box(size,pos,color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.67}));const o=new THREE.Mesh(new THREE.BoxGeometry(...size),materials.get(color));o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
 box([10,.18,8.2],[0,.09,-4.1],0xdad9c8);box([10,3.7,.18],[0,1.85,-8.1],0xeee7d1);
 for(const x of [-5,5])box([.18,3.8,8.2],[x,1.9,-4.1],0xd9d7c9);
 box([10.5,.22,8.7],[0,3.9,-4.1],0xd5d0bd);box([10.3,.8,.45],[0,3.25,.12],0xb84e45);
 for(const y of [2.88,3.61])box([10.32,.10,.49],[0,y,.13],0xf5d791);
 const logo=new THREE.Object3D();logo.position.set(0,3.24,.38);group.add(logo);group.updateMatrixWorld(true);const wp=logo.getWorldPosition(new THREE.Vector3());label('桜商店','SAKURA · FOOD & DAILY GOODS',wp.toArray(),6.0,.62,group.rotation.y,'#f6e8bb','#a6333c');
 const glazing=new THREE.MeshStandardMaterial({color:0xd8efeb,transparent:true,opacity:.15,roughness:.12,depthWrite:false,side:THREE.DoubleSide});
 for(const [x,width] of [[-4.2,1.5],[-2.5,1.7],[1.15,5.4]]){const pane=new THREE.Mesh(new THREE.PlaneGeometry(width,2.55),glazing);pane.position.set(x,1.5,.02);group.add(pane);for(const edge of [-1,1])box([.065,2.75,.09],[x+edge*width/2,1.47,.055],0x879692);box([width,.08,.09],[x,.15,.055],0x879692);}
 box([10,.1,.1],[0,2.82,.05],0x84938d);for(const x of [-2.9,-2.1])box([.035,.5,.12],[x,1.4,.12],0x465854);
 for(const y of [.5,1.0,1.5,2.0]){box([5.8,.05,.65],[1.25,y,-2.0],0xdcdcc9);for(let n=0;n<18;n++)box([.20,.30,.15],[-1.4+n*.31,y+.18,-1.76],[0x649875,0xc68660,0xd1b65e,0xb9748f][n%4]);}
 for(const x of [-2.8,1.8]){const light=box([.45,.06,2.8],[x,3.64,-2.3],0xfff6d4);light.material=light.material.clone();light.material.emissive.set(0xfff3c6);light.material.emissiveIntensity=.8;}
 box([2.0,1.0,.8],[-3.0,.5,-2.6],0xb59472);box([.55,.35,.45],[-3,1.18,-2.55],0xe1d8bb);
 const mat=box([1.7,.035,.8],[-2.5,.21,.55],0x777064);mat.userData.storeEntrance=true;
 const anchor=new THREE.Object3D();anchor.position.set(site.side*6.8,1.2,site.z+2.5);parent.add(anchor);register?.(anchor,'Enter '+site.title,()=>enter(site));
 return group;
}
