import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {DINING_FOOTPRINTS} from './dining-footprints.js';

// Seal the open rear of each authored facade with solid masonry. Sample its
// roof from inside the footprint so sloping roofs keep their original outline.
// The eight closures share one mesh/material and remain inside existing collision.
export function closeDiningBacks(model,{shadows=false}={}){
 model.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,-1,0),0,20),parts=[];
 for(const b of DINING_FOOTPRINTS.filter(b=>b.id.length===1)){
  const left=b.max[0]<0,x=left?b.min[0]+.16:b.max[0]-.16,n=24,z0=b.min[2]+.02,z1=b.max[2]-.02;
  const heights=Array.from({length:n+1},(_,i)=>{
   ray.ray.origin.set(x,15,z0+(z1-z0)*i/n);
   const hit=ray.intersectObjects(model.children,true).find(h=>h.point.y>2);
   return hit?Math.min(b.max[1],hit.point.y):null;
  });
  for(let i=0;i<heights.length;i++)if(heights[i]===null){
   let nearest=-1;for(let j=0;j<heights.length;j++)if(heights[j]!==null&&(nearest<0||Math.abs(j-i)<Math.abs(nearest-i)))nearest=j;
   heights[i]=nearest<0?b.max[1]-.12:heights[nearest];
  }
  for(let i=0;i<n;i++){
   const a=z0+(z1-z0)*i/n,c=z0+(z1-z0)*(i+1)/n,h0=heights[i],h1=heights[i+1],lo=-.02;
   const g=new THREE.BufferGeometry();
   g.setAttribute('position',new THREE.Float32BufferAttribute([
    x-.08,lo,a,x+.08,lo,a,x+.08,lo,c,x-.08,lo,c,
    x-.08,h0,a,x+.08,h0,a,x+.08,h1,c,x-.08,h1,c
   ],3));
   g.setIndex([0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,3,7,6,3,6,2,0,4,7,0,7,3,1,2,6,1,6,5]);g.computeVertexNormals();parts.push(g);
  }
 }
 const geometry=mergeGeometries(parts);parts.forEach(g=>g.dispose());
 const wall=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0xb1ab9d,roughness:.96,flatShading:true,side:THREE.DoubleSide}));
 wall.name='sealed-alley-building-backs';wall.castShadow=shadows;wall.receiveShadow=true;model.add(wall);return wall;
}
