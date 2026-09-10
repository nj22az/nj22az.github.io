// Bake original movement onto the supplied skeleton, retaining its skin weights.
// Usage: node tools/animate-nozomi.mjs assets/characters/realistic/nozomi.glb
import {readFile,writeFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';

const path=process.argv[2];if(!path)throw Error('Pass the prepared Nozomi GLB');
const bytes=await readFile(path),length=bytes.readUInt32LE(12),doc=JSON.parse(bytes.subarray(20,20+length));
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:512,height:512,close(){}});
const asset=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const scene=asset.scene;scene.updateMatrixWorld(true);
const bones=new Map(),rest=new Map(),meshes=[];
scene.traverse(o=>{if(o.isBone){bones.set(o.name,o);rest.set(o,{p:o.position.clone(),q:o.quaternion.clone()});}if(o.isSkinnedMesh)meshes.push(o);});
const point=name=>bones.get(name).getWorldPosition(new THREE.Vector3());
const feet=Object.fromEntries(['Left','Right'].map(side=>[side,{p:point(side+'Foot'),q:bones.get(side+'Foot').getWorldQuaternion(new THREE.Quaternion()),thigh:point(side+'UpLeg').distanceTo(point(side+'Leg')),calf:point(side+'Leg').distanceTo(point(side+'Foot'))}]));
const originalFloor=new THREE.Box3().setFromObject(scene,true).min.y;
const names=['Hips','Spine','Spine1','Spine2','Neck','Head',...['Left','Right'].flatMap(s=>['Arm','ForeArm','Hand','UpLeg','Leg','Foot'].map(n=>s+n))];
function rotate(name,x=0,y=0,z=0){
 const b=bones.get(name),parent=b.parent.getWorldQuaternion(new THREE.Quaternion());
 const delta=new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z));
 b.quaternion.premultiply(parent.clone().invert().multiply(delta).multiply(parent)).normalize();b.updateWorldMatrix(false,true);
}
function orient(name,world){
 const b=bones.get(name);b.quaternion.copy(b.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));b.updateWorldMatrix(false,true);
}
function aim(name,end,target){
 const from=point(name),direction=point(end).sub(from).normalize(),desired=target.clone().sub(from).normalize();
 const b=bones.get(name),parent=b.parent.getWorldQuaternion(new THREE.Quaternion()),delta=new THREE.Quaternion().setFromUnitVectors(direction,desired);
 b.quaternion.premultiply(parent.clone().invert().multiply(delta).multiply(parent)).normalize();b.updateWorldMatrix(false,true);
}
function leg(side,target){
 const hip=point(side+'UpLeg'),f=feet[side],direction=target.clone().sub(hip),distance=Math.min(direction.length(),(f.thigh+f.calf)*.999);
 direction.normalize();target=hip.clone().addScaledVector(direction,distance);
 const along=(f.thigh*f.thigh-f.calf*f.calf+distance*distance)/(2*distance);
 const bend=new THREE.Vector3(0,0,1).addScaledVector(direction,-direction.z).normalize();
 const knee=hip.clone().addScaledVector(direction,along).addScaledVector(bend,Math.sqrt(Math.max(0,f.thigh*f.thigh-along*along)));
 aim(side+'UpLeg',side+'Leg',knee);aim(side+'Leg',side+'Foot',target);orient(side+'Foot',f.q);
}
function floor(){
 scene.updateMatrixWorld(true);let low=Infinity;const p=new THREE.Vector3();
 for(const m of meshes){m.skeleton.update();for(let i=0;i<m.geometry.attributes.position.count;i++){m.getVertexPosition(i,p).applyMatrix4(m.matrixWorld);low=Math.min(low,p.y);}}
 return low;
}
const definitions=[['Idle_Neutral',4],['Walk',1.1],['Run',.75],['Wave',1.6],['Sit',4],['Eat',4],['Drink',4]],clips=[];
for(const [name,duration] of definitions){
 const times=Array.from({length:65},(_,i)=>i*duration/64),tracks=new Map(names.flatMap(n=>[[n+'.quaternion',[]],[n+'.position',[]]]));
 for(const t of times){
  for(const [bone,r] of rest){bone.position.copy(r.p);bone.quaternion.copy(r.q);}scene.updateMatrixWorld(true);
  const phase=t/duration*Math.PI*2,seated=['Sit','Eat','Drink'].includes(name),walking=['Walk','Run'].includes(name);
  rotate('Head',.012*Math.sin(phase),0,.01*Math.sin(phase));rotate('Spine2',.008*Math.sin(phase));
  if(walking){
   const stride=name==='Run'?.27:.18,lift=name==='Run'?.12:.065;
   for(const [i,side] of ['Left','Right'].entries()){
    const p=phase+i*Math.PI,target=feet[side].p.clone();target.z+=Math.sin(p)*stride;target.y+=Math.max(0,Math.cos(p))**2*lift;
    leg(side,target);rotate(side+'Arm',Math.sin(p)*(name==='Run'?.24:.15));rotate(side+'ForeArm',-.10-Math.max(0,-Math.sin(p))*.12);
   }
  }else if(seated){
   for(const side of ['Left','Right']){
    const hip=point(side+'UpLeg'),f=feet[side],knee=hip.clone().add(new THREE.Vector3(0,-.35,Math.sqrt(1-.35**2)).multiplyScalar(f.thigh));
    aim(side+'UpLeg',side+'Leg',knee);aim(side+'Leg',side+'Foot',knee.clone().add(new THREE.Vector3(0,-f.calf,0)));orient(side+'Foot',f.q);
    rotate(side+'Arm',-.20);rotate(side+'ForeArm',-.70);
   }
   if(name!=='Sit'){const lift=(1-Math.cos(phase))*.5;rotate('RightArm',-.20*lift);rotate('RightForeArm',-.85*lift);}
  }else if(name==='Wave'){
   const envelope=Math.sin(Math.PI*t/duration)**2;
   rotate('RightArm',-.18*envelope,0,-.30*envelope);rotate('RightForeArm',-2.05*envelope);rotate('RightHand',0,0,Math.sin(phase*3)*.15*envelope);
  }
  if(!seated){const h=bones.get('Hips');h.position.y+=originalFloor-floor();scene.updateMatrixWorld(true);}
  for(const n of names){tracks.get(n+'.quaternion').push(...bones.get(n).quaternion.toArray());tracks.get(n+'.position').push(...bones.get(n).position.toArray());}
 }
 clips.push({name,times,tracks});
}
const chunks=[bytes.subarray(28+length,28+length+doc.buffers[0].byteLength)];let offset=chunks[0].length;
function accessor(values,type){
 const padding=(4-offset%4)%4;if(padding){chunks.push(Buffer.alloc(padding));offset+=padding;}
 const array=new Float32Array(values),b=Buffer.from(array.buffer);doc.bufferViews.push({buffer:0,byteOffset:offset,byteLength:b.length});chunks.push(b);offset+=b.length;
 const width=type==='VEC4'?4:type==='VEC3'?3:1,a={bufferView:doc.bufferViews.length-1,componentType:5126,count:values.length/width,type};
 if(type==='SCALAR'){a.min=[values[0]];a.max=[values.at(-1)];}doc.accessors.push(a);return doc.accessors.length-1;
}
doc.animations=[];
for(const clip of clips){
 const input=accessor(clip.times,'SCALAR'),animation={name:clip.name,samplers:[],channels:[]};
 for(const [key,values] of clip.tracks){
  const [bone,property]=key.split('.'),path=property==='quaternion'?'rotation':'translation';
  animation.channels.push({sampler:animation.samplers.length,target:{node:doc.nodes.findIndex(n=>n.name===bone),path}});
  animation.samplers.push({input,output:accessor(values,property==='quaternion'?'VEC4':'VEC3'),interpolation:'LINEAR'});
 }doc.animations.push(animation);
}
doc.extras={...doc.extras,walkSpeed:1.2,runSpeed:3.3,headBone:'Head',hipsBone:'Hips',clips:definitions.map(([name])=>name)};
doc.extras.changes.push('Added seven original clips with foot targets and seated poses; retained the supplied skeleton');
doc.buffers=[{byteLength:offset}];let json=Buffer.from(JSON.stringify(doc)),data=Buffer.concat(chunks);json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);data=Buffer.concat([data,Buffer.alloc((4-data.length%4)%4)]);
const header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+data.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);
const binHeader=Buffer.alloc(8);binHeader.writeUInt32LE(data.length);binHeader.writeUInt32LE(0x004e4942,4);
await writeFile(path,Buffer.concat([header,json,binHeader,data]));
console.log(JSON.stringify({bytes:28+json.length+data.length,triangles:doc.extras.triangles,draws:doc.extras.draws,clips:doc.extras.clips}));
