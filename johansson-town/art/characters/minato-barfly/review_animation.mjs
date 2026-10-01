/** Acceptance measurements on exported skinning and morph animation, without live registration. */
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import * as T from '../../../vendor/three.module.js';
import {GLTFLoader} from '../../../vendor/GLTFLoader.js';
const out=resolve(process.argv[2]),bytes=await readFile(resolve(out,'minato-barfly.glb'));
const asset=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const meshes=[];asset.scene.traverse(o=>{if(o.isSkinnedMesh)meshes.push(o);});
const mouth=meshes.find(o=>o.name.includes('Mouth_')),glass=meshes.find(o=>o.name.includes('amber_beer'));
function points(o){o.skeleton.update();return Array.from({length:o.geometry.attributes.position.count},(_,i)=>{const v=new T.Vector3();o.getVertexPosition(i,v);return v.applyMatrix4(o.matrixWorld);});}
const samples=[];
for(const clip of asset.animations){
 const mixer=new T.AnimationMixer(asset.scene),action=mixer.clipAction(clip);action.play();
 for(const time of [0,1.5,2,2.5,3,clip.duration-.001,clip.duration+.01,clip.duration*2+.01]){
  mixer.setTime(time);asset.scene.updateMatrixWorld(true);
  const mp=points(mouth),gp=points(glass),center=mp.reduce((a,v)=>a.add(v),new T.Vector3()).divideScalar(mp.length);
  const eyes=meshes.filter(o=>/^Eye_white|^Iris/.test(o.name));
  const head=meshes.find(o=>o.name==='Barfly_Head');
  const hp=points(head),headCenter=hp.reduce((a,v)=>a.add(v),new T.Vector3()).divideScalar(hp.length);
  samples.push({clip:clip.name,time,mouthToGlassM:Math.min(...gp.map(v=>v.distanceTo(center))),headCenterY:headCenter.y,eyeMorphs:eyes.map(o=>o.morphTargetInfluences[0]),finite:[...mp,...gp,...hp].every(v=>[v.x,v.y,v.z].every(Number.isFinite))});
 }
 mixer.stopAllAction();
}
const drink=samples.filter(s=>s.clip==='Barfly_Drink_Loop'),sleep=samples.filter(s=>s.clip==='Barfly_Sleep_Loop');
const result={samples,drinkContactPassed:Math.min(...drink.map(s=>s.mouthToGlassM))<.025,sleepClosedThroughout:sleep.every(s=>s.eyeMorphs.every(v=>v>.99)),sleepHeadExcursionM:Math.max(...sleep.map(s=>s.headCenterY))-Math.min(...sleep.map(s=>s.headCenterY)),primitiveBudgetPassed:meshes.length<=16};
result.passed=result.drinkContactPassed&&result.sleepClosedThroughout&&result.sleepHeadExcursionM<.015&&result.primitiveBudgetPassed&&samples.every(s=>s.finite);
await writeFile(resolve(out,'animation-review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(!result.passed)process.exitCode=1;
