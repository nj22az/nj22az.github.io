import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export function validateGLB(bytes){
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==bytes.length)throw Error('Invalid GLB header');
 const size=view.getUint32(12,true),g=JSON.parse(bytes.subarray(20,20+size).toString()),bin=bytes.subarray(28+size);
 function values(index){
  const a=g.accessors[index],n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[a.type];
  const sizes={5121:1,5123:2,5125:4,5126:4},methods={5121:'getUint8',5123:'getUint16',5125:'getUint32',5126:'getFloat32'},dv=new DataView(bin.buffer,bin.byteOffset,bin.length);
  function read(bufferView,byteOffset,type,count,width){const v=g.bufferViews[bufferView],s=sizes[type],offset=(v.byteOffset||0)+(byteOffset||0);return Array.from({length:count},(_,i)=>Array.from({length:width},(_,j)=>dv[methods[type]](offset+i*(v.byteStride||width*s)+j*s,true)));}
  const result=a.bufferView===undefined?Array.from({length:a.count},()=>Array(n).fill(0)):read(a.bufferView,a.byteOffset,a.componentType,a.count,n);
  if(a.sparse){const sp=a.sparse,indices=read(sp.indices.bufferView,sp.indices.byteOffset,sp.indices.componentType,sp.count,1),data=read(sp.values.bufferView,sp.values.byteOffset,a.componentType,sp.count,n);indices.forEach(([i],j)=>result[i]=data[j]);}
  return result;
 }
 const weighted=new Set();let primitives=0,vertices=0;
 for(const node of g.nodes){if(node.mesh===undefined)continue;for(const p of g.meshes[node.mesh].primitives){primitives++;vertices+=g.accessors[p.attributes.POSITION].count;if(node.skin===undefined)continue;const joints=values(p.attributes.JOINTS_0),weights=values(p.attributes.WEIGHTS_0);joints.forEach((v,i)=>v.forEach((j,k)=>{if(weights[i][k]>0)weighted.add(g.nodes[g.skins[node.skin].joints[j]].name);}));}}
 const fingers=Array.from({length:2},(_,i)=>i?'R':'L').flatMap(side=>['thumb','index','middle','ring','pinky'].flatMap(f=>Array.from({length:f==='thumb'?2:3},(_,i)=>`finger.${f}.${side}.${i+1}`)));
 const missingFingerWeights=fingers.filter(f=>!weighted.has(f));
 const morphs={};for(const m of g.meshes)for(const [i,name] of (m.extras?.targetNames||[]).entries()){const targets=m.primitives.map(p=>p.targets?.[i]?.POSITION).filter(i=>i!==undefined);morphs[name]=(morphs[name]||false)||targets.some(i=>values(i).some(v=>v.some(x=>Math.abs(x)>1e-8)));}
 const missingMorphs=['Smile','Frown','JawOpen','Blink.L','Blink.R'].filter(k=>!morphs[k]);
 const animations=(g.animations||[]).map(a=>({name:a.name,channels:a.channels.length,duration:Math.max(...a.samplers.map(s=>values(s.input).at(-1)[0]))}));
 const missingClips=['Barfly_Drink_Loop','Barfly_Sleep_Loop'].filter(n=>!animations.some(a=>a.name===n&&a.duration>0));
 return {bytes:bytes.length,primitives,vertices,weightedFingerCount:fingers.length-missingFingerWeights.length,missingFingerWeights,missingMorphs,animations,passed:!missingFingerWeights.length&&!missingMorphs.length&&!missingClips.length,missingClips};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const report=validateGLB(await readFile(process.argv[2]));console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;}
