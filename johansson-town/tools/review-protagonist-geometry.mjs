import {readFile,writeFile} from 'node:fs/promises';
import * as T from '../vendor/three.module.js';import {GLTFLoader} from '../vendor/GLTFLoader.js';import {prepareProtagonistAnimations} from '../src/people/protagonist-animation.js';
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
const bytes=await readFile(new URL('../assets/characters/protagonist/johansson.glb',import.meta.url));const g=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');g.animations=prepareProtagonistAnimations(g);const mixer=new T.AnimationMixer(g.scene);const frames=[];
for(const [name,time] of [['Idle_Neutral',0],['Wave',.6],['Walk',.3],['Run',.2]]){
 mixer.stopAllAction();mixer.clipAction(g.animations.find(c=>c.name===name)).play();mixer.setTime(time);g.scene.updateMatrixWorld(true);
 g.scene.traverse(o=>{if(!o.isSkinnedMesh)return;o.skeleton.update();const p=new T.Vector3(),positions=[];for(let i=0;i<o.geometry.attributes.position.count;i++){o.getVertexPosition(i,p);p.applyMatrix4(o.matrixWorld);positions.push(...p.toArray());}frames.push({name,positions,uv:Array.from(o.geometry.attributes.uv.array),indices:Array.from(o.geometry.index.array)});});
}
await writeFile(process.argv[2]||'protagonist-geometry.json',JSON.stringify(frames));
