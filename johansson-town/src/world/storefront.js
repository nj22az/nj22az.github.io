import {createMaterials} from '../render/materials.js?snappy=1';
import * as THREE from '../../vendor/three.module.js';
import {localToWorld} from './landmark-lots.js';
// Original Sakura shopfront: a lit glass frontage and real shelf silhouettes behind it.
export function buildStorefront({parent,site,register,enter,label,placement}){
 const x=placement?.x??site.side*7.55,z=placement?.z??site.z;
 const yaw=placement?.yaw??-site.side*Math.PI/2,scale=placement?.scale??1;
 const sx=scale.x??scale,sy=scale.y??scale,sz=scale.z??scale;
 const group=new THREE.Group();group.name='Sakura glass storefront';group.position.set(x,0,z);group.rotation.y=yaw;group.scale.set(sx,sy,sz);parent.add(group);
 const surfaces=createMaterials(),materials=new Map();function box(size,pos,color,kind=null){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.67}));const o=new THREE.Mesh(new THREE.BoxGeometry(...size),kind?surfaces.material(kind,color):materials.get(color));o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;o.userData.staticProp=true;group.add(o);return o;}
 box([10,.18,8.2],[0,.09,-4.1],0xdad9c8,'plaster');box([10,3.7,.18],[0,1.85,-8.1],0xeee7d1,'plaster');
 for(const wall of [-5,5])box([.18,3.8,8.2],[wall,1.9,-4.1],0xd9d7c9,'plaster');
 box([10.5,.22,8.7],[0,3.9,-4.1],0xd5d0bd);box([10.3,.8,.45],[0,3.25,.12],0xb84e45);
 for(const y of [2.88,3.61])box([10.32,.10,.49],[0,y,.13],0xf5d791);
 const logo=new THREE.Object3D();logo.position.set(0,3.24,.38);group.add(logo);group.updateMatrixWorld(true);site.streetFrontage={position:group.localToWorld(new THREE.Vector3(0,.12,.32)).toArray(),yaw};const wp=logo.getWorldPosition(new THREE.Vector3());label('桜商店','SAKURA · FOOD & DAILY GOODS',wp.toArray(),6.0*sx,.62*sy,yaw,'#f6e8bb','#a6333c');
 const glazing=new THREE.MeshStandardMaterial({color:0xd8efeb,transparent:true,opacity:.15,roughness:.12,depthWrite:false,side:THREE.DoubleSide});
 for(const [lx,width] of [[-4.2,1.5],[-2.5,1.7],[1.15,5.4]]){const pane=new THREE.Mesh(new THREE.PlaneGeometry(width,2.55),glazing);pane.position.set(lx,1.5,.02);group.add(pane);for(const edge of [-1,1])box([.065,2.75,.09],[lx+edge*width/2,1.47,.055],0x879692);box([width,.08,.09],[lx,.15,.055],0x879692);}
 box([10,.1,.1],[0,2.82,.05],0x84938d);for(const lx of [-2.9,-2.1])box([.035,.5,.12],[lx,1.4,.12],0x465854);
 const cylinder=new THREE.CylinderGeometry(1,1,1,10);
 function round(radius,height,pos,color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.55}));const m=new THREE.Mesh(cylinder,materials.get(color));m.scale.set(radius,height,radius);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;m.userData.staticProp=true;group.add(m);}
 // A few recognisable product groups read through the glazing at street distance.
 for(const [row,y] of [.48,1.22,1.96].entries()){
  box([5.8,.055,.65],[1.25,y,-2.0],0xdcdcc9);box([5.8,.07,.045],[1.25,y,-1.65],0xb84e45);
  for(let n=0;n<10;n++){
   const x=-1.2+n*.52,z=-1.82,color=[0x477454,0xb65241,0xd8b56e][row];
   if(row===0){round(.13,.30,[x,y+.18,z],color);for(const dy of [.035,.335])round(.134,.023,[x,y+dy,z],0xc9ccbf);round(.133,.10,[x,y+.19,z],0xf2e4c3);}
   else if(row===1){round(.115,.30,[x,y+.18,z],color);round(.057,.15,[x,y+.395,z],color);round(.060,.045,[x,y+.485,z],0xe7d4a8);round(.118,.11,[x,y+.19,z],0xf2e4c3);}
   else{box([.30,.36,.25],[x,y+.21,z],color);box([.27,.13,.01],[x,y+.23,z+.13],0xf2e4c3);box([.12,.04,.25],[x,y+.41,z],0xe7d4a8);}
  }
 }
 for(const lx of [-2.8,1.8]){const light=box([.45,.06,2.8],[lx,3.64,-2.3],0xfff6d4);light.material=light.material.clone();light.material.emissive.set(0xfff3c6);light.material.emissiveIntensity=.8;}
 box([2.0,1.0,.8],[-3.0,.5,-2.6],0xc4ac84,'bamboo');box([.55,.35,.45],[-3,1.18,-2.55],0xe1d8bb);
 const mat=box([1.7,.035,.8],[-2.5,.21,.55],0x777064);mat.userData.storeEntrance=true;
 const flag=box([.06,2.4,.42],[5.05,2.15,.22],0xb84e45);flag.userData.banner=true;
 hangNoren(group,-2.5,1.85,.07);
 const [ax,az]=localToWorld(x,z,yaw,scale,-2.5,.85);
 const anchor=new THREE.Object3D();anchor.position.set(ax,1.2,az);parent.add(anchor);register?.(anchor,'Enter '+site.title,()=>enter(site));
 return group;
}

function hangNoren(group,x,y,z){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=320;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#6f1f2c';ctx.fillRect(0,0,256,320);
 ctx.fillStyle='#f4e4c8';ctx.fillRect(6,0,116,300);ctx.fillRect(134,0,116,300);
 ctx.fillStyle='#6f1f2c';ctx.textAlign='center';ctx.font='700 64px sans-serif';
 ctx.fillText('桜',64,130);ctx.fillText('店',192,130);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.7,1.55),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,transparent:true}));
 mesh.position.set(x,y,z);mesh.userData.banner=true;group.add(mesh);
}
