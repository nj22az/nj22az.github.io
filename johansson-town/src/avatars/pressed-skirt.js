import * as THREE from '../../vendor/three.module.js';
import {skirtSpec} from './skirt-shape.js';

/** Optional sewn-down box pleats. Independent waist/hip/hem rows, twelve broad
 * panels, recessed returns and a narrow integral waistband. The front and seat
 * have different depth shaping. Existing spring/cloth fitting supplies motion. */
export function pressedSkirtGeometry(m){
 const s=skirtSpec(m,'pleatedskirt'),length=s.length,t=.003*m.k,n=96;
 // At the waist the pleats are sewn flat; they open below the fitted hip.
 const rows=[[0,0],[.055,0],[.065,0],[.15,.05],[.28,.38],[.43,.8],[.63,1],[.83,1],[1,1]];
 // Short inner returns finish the two open edges without a hidden full lining.
 const rings=[{f:.045,fold:0,inset:t},{f:0,fold:0,inset:t},...rows.map(([f,fold])=>({f,fold,inset:0})),{f:1,fold:1,inset:t},{f:.965,fold:1,inset:t}];
 const positions=[],uv=[],indices=[];
 const folds=[0,0,0,-.7,-.7,-.7,-.7,0];
 for(let j=0;j<rings.length;j++){
  const {f,fold,inset}=rings[j],hip=THREE.MathUtils.smoothstep(f,0,.28),open=THREE.MathUtils.smoothstep(f,.22,1);
  const radius=THREE.MathUtils.lerp(s.waistR,s.hipR,hip)+(s.hemR-s.hipR)*open;
  for(let i=0;i<=n;i++){
   const a=i/n*Math.PI*2,depth=1+(.018*Math.max(0,-Math.cos(a))-.009*Math.max(0,Math.cos(a)))*Math.sin(f*Math.PI);
   const r=radius+folds[i%8]*.016*m.k*fold-inset;
   positions.push(Math.sin(a)*r,s.waist-f*length,Math.cos(a)*r*m.depth/m.width*depth);
   uv.push(i/n,1-f);
   if(j<rings.length-1&&i<n){const p=j*(n+1)+i,q=p+n+1;indices.push(p,q,p+1,p+1,q,q+1);}
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
 // Weld only the UV seam's normals. Pleat recesses keep their deliberately folded form.
 const N=g.attributes.normal;
 for(let j=0;j<rings.length;j++){const a=j*(n+1),b=a+n,v=new THREE.Vector3().fromBufferAttribute(N,a).add(new THREE.Vector3().fromBufferAttribute(N,b)).normalize();N.setXYZ(a,v.x,v.y,v.z);N.setXYZ(b,v.x,v.y,v.z);}
 g.userData.keepUV=true;g.userData.skirtSpec=s;return g;
}
