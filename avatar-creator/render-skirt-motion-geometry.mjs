/** Actual posed/fitted CPU triangles for a neutral geometry diagnostic.
 * Not a WebGL screenshot or shader/device acceptance. Run from repository root:
 * node avatar-creator/render-skirt-motion-geometry.mjs /tmp/after.json [baseline-repository-root]
 */
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=path.resolve(process.argv[3]||fileURLToPath(new URL('../',import.meta.url))),load=p=>import(pathToFileURL(path.join(root,p)).href);
const {installDOM}=await load('johansson-town/tests/fixtures.mjs');installDOM();
const {buildAvatar}=await load('johansson-town/src/avatars/build.js'),{normalizeRecipe}=await load('johansson-town/src/avatars/recipe.js'),{createAvatarAnimator}=await load('johansson-town/src/avatars/animate.js'),THREE=await load('johansson-town/vendor/three.module.js');
const random=Math.random;let seed=19;Math.random=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
const recipe=normalizeRecipe({name:'Skirt motion review',age:'adult',body:{silhouette:'feminine'},hair:{style:'bald'},outfit:{top:'tee',bottom:'pleatedskirt',bottomColour:'#27304d'}});
const avatar=buildAvatar(recipe,{faceSize:32,shadows:false}),anim=createAvatarAnimator(avatar);anim.play('Walk');
const frames=[],p=new THREE.Vector3(),rest=new THREE.Vector3();
for(let frame=0;frame<120;frame++){
 anim.update(1/60,{speed:1.4});avatar.springs?.update(1/60);if(frame%10)continue;
 avatar.root.updateMatrixWorld(true);avatar.body.skeleton.update();const cloth=[],body=[];
 for(const mesh of avatar.root.children.filter(o=>o.isSkinnedMesh&&o.visible&&!o.userData.outline&&!o.name.toLowerCase().includes('outline'))){
  const g=mesh.geometry,P=g.attributes.position,F=g.attributes.towelFit,fit=mesh.towelFit;fit?.refresh();const vertices=[];
  for(let i=0;i<P.count;i++){mesh.getVertexPosition(i,p);if(F&&F.getX(i)>.5)fit?.fitPoint(p,F.getX(i),rest.fromBufferAttribute(P,i));p.applyMatrix4(mesh.matrixWorld);vertices.push(p.toArray().map(v=>Math.round(v*100000)/100000));}
  const count=g.index?.count||P.count;
  for(let i=0;i<count;i+=3){const ids=[0,1,2].map(j=>g.index?g.index.getX(i+j):i+j),tri=ids.map(j=>vertices[j]);if(tri.every(v=>v[1]>avatar.measure.hipY+avatar.measure.torso*.1))continue;const isCloth=ids.some(j=>F&&F.getX(j)===2);(isCloth?cloth:body).push(tri);}
 }
 frames.push({frame,seconds:(frame+1)/60,cloth,body});
}
fs.writeFileSync(process.argv[2]||'/tmp/skirt-motion.json',JSON.stringify({kind:'CPU fitted geometry diagnostic; not a game screenshot',height:avatar.measure.H,frames}));avatar.dispose();Math.random=random;
console.log(JSON.stringify({frames:frames.length,clothTriangles:frames[0].cloth.length,bodyTriangles:frames[0].body.length}));
