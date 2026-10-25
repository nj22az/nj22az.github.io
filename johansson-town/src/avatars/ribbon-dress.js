import * as THREE from '../../vendor/three.module.js';
import {RIBBON_DRESS} from './ribbon-dress-data.js';
import {skirtSpec,skirtRadiusAt} from './skirt-shape.js';

/** Blender-authored topology; fitted to the existing avatar, never a second rig. */
export function ribbonBodicePieces(m,volume){
 const radius=t=>{const p=volume.prof;for(let i=1;i<p.length;i++)if(t<=p[i][1]){const [a,y]=p[i-1],[b,z]=p[i];return a+(b-a)*(t-y)/(z-y);}return p.at(-1)[0];};
 return RIBBON_DRESS.filter(p=>p.mode!=='skirt').map(piece=>{
  const positions=[];
  for(let i=0;i<piece.position.length;i+=3){
   const [x,y,z]=piece.position.slice(i,i+3),r=radius(y);let p;
   if(piece.mode==='radial')p=new THREE.Vector3(x*m.width/2*r,m.hipY+y*m.torso,z*m.depth/2*r);
   else if(piece.mode==='front')p=new THREE.Vector3(x*m.width/2,m.hipY+y*m.torso,Math.sqrt(Math.max(0,r*r-x*x))*m.depth/2+(z-1)*m.depth/2+.003*m.k);
   else{
    p=new THREE.Vector3(x*m.width/2,m.hipY+y*m.torso,z*m.depth/2);
    const n=new THREE.Vector3(0,Math.max(.05,1-Math.abs(z)/.83),z).normalize();
    p=volume.layOn(p,n,.004*m.k,.14*m.k);
   }
   positions.push(p.x,p.y,p.z);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(piece.index);geometry.computeVertexNormals();
  // These strips have real reverse faces. They stay readable from inside the neckline too.
  if(piece.mode!=='radial'){const ids=Array.from(geometry.index.array);for(let i=0;i<piece.index.length;i+=3)ids.push(piece.index[i+2],piece.index[i+1],piece.index[i]);geometry.setIndex(ids);}
  return {name:piece.name,tone:piece.tone,geometry};
 });
}

export function ribbonSkirtGeometry(m){
 const piece=RIBBON_DRESS.find(p=>p.mode==='skirt'),s=skirtSpec(m),positions=[];
 for(let i=0;i<piece.position.length;i+=3){const [x,f,z]=piece.position.slice(i,i+3),r=skirtRadiusAt(s,f);positions.push(x*r,s.length/2-f*s.length,z*r);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(piece.index);geometry.computeVertexNormals();geometry.userData.skirtSpec=s;return geometry;
}
