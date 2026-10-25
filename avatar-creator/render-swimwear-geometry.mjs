/** Export actual CPU swimwear geometry for a fit diagnostic; not a game screenshot. */
import fs from 'node:fs';
import {installDOM} from '../johansson-town/tests/fixtures.mjs';
import {buildAvatar} from '../johansson-town/src/avatars/build.js';
import {recipeFor} from '../johansson-town/src/avatars/cast.js';
import * as THREE from '../johansson-town/vendor/three.module.js';
installDOM();const cases=[],p=new THREE.Vector3(),rest=new THREE.Vector3(),colour=new THREE.Color();
for(const name of ['Johansson','Mr Fujita','Daichi','Thuan','Vy','Mrs Sato']){
 const avatar=buildAvatar(recipeFor(name),{faceSize:32,shadows:false});avatar.wear('swim');avatar.root.updateMatrixWorld(true);
 const mesh=avatar.root.getObjectByName('Shimanchu swimwear'),g=mesh.geometry,P=g.attributes.position,C=g.attributes.color,F=g.attributes.towelFit,triangles=[];mesh.skeleton.update();mesh.towelFit?.refresh();
 for(let i=0;i<g.drawRange.count&&i<P.count;i+=3){
  // Omit hair/head triangles from this neckline-to-feet fit diagnostic.
  if([0,1,2].every(j=>[0,1,2,3].every(k=>{const weight=g.attributes.skinWeight.getComponent(i+j,k);const bone=mesh.skeleton.bones[g.attributes.skinIndex.getComponent(i+j,k)];return weight<.001||/head|hair|braid/i.test(bone?.name||'');})))continue;
  const v=[],rgb=[];for(let j=0;j<3;j++){mesh.getVertexPosition(i+j,p);if(F?.getX(i+j)>.5)mesh.towelFit.fitPoint(p,F.getX(i+j),rest.fromBufferAttribute(P,i+j));p.applyMatrix4(mesh.matrixWorld);v.push(p.toArray());colour.fromBufferAttribute(C,i+j).convertLinearToSRGB();rgb.push(colour.toArray());}
  if(v.some(a=>a[1]>avatar.measure.neckY+.015*avatar.measure.k))continue;
  triangles.push({v,c:[0,1,2].map(k=>Math.round(rgb.reduce((s,c)=>s+c[k],0)/3*255))});
 }
 cases.push({name,style:mesh.userData.swim.style,height:avatar.measure.H,neck:avatar.measure.neckY,triangles});avatar.dispose();
}
fs.writeFileSync(process.argv[2]||'/tmp/swimwear-geometry.json',JSON.stringify({kind:'CPU geometry and vertex colours, not WebGL appearance',cases}));console.log(JSON.stringify(cases.map(c=>({name:c.name,style:c.style,triangles:c.triangles.length}))));
