import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {createCanvas}=require(process.env.TOWN_CANVAS_MODULE||'@napi-rs/canvas');
import {installDOM} from '../tests/fixtures.mjs';
import {buildAvatar} from '../src/avatars/build.js';
import {recipeFor} from '../src/avatars/cast.js';
import * as THREE from '../vendor/three.module.js';
installDOM();const original=document.createElement;
document.createElement=tag=>tag==='canvas'?createCanvas(256,256):original(tag);
const out=path.resolve(process.argv[2]||'johansson-town/docs/qa/thao-dress');fs.mkdirSync(out,{recursive:true});
const a=buildAvatar(recipeFor('Thao'),{faceSize:1024,shadows:false,eyes3d:false});a.root.rotation.set(0,0,0);a.setOpenHands(true);a.paintFace({expression:'neutral',blink:0,talk:0});a.root.updateMatrixWorld(true);a.body.skeleton.update();
const seen=new Map(),materials=[];
function material(m){if(seen.has(m))return seen.get(m);const i=materials.length;seen.set(m,i);let texture=null;
 if(m.map?.image?.toBuffer){texture='texture-'+i+'.png';fs.writeFileSync(path.join(out,texture),m.map.image.toBuffer('image/png'));}
 materials.push({name:m.name||'Material '+i,color:m.color?.toArray()||[1,1,1],vertexColors:m.vertexColors,texture,garment:!!m.userData.garment,transparent:m.transparent,opacity:m.opacity??1});return i;}
const meshes=[];
a.root.traverse(o=>{if(!o.isMesh||!o.visible||o.userData.outline||o.name.toLowerCase().includes('outline'))return;let p=o;while(p){if(!p.visible)return;p=p.parent;}
 const g=o.geometry,P=g.attributes.position,positions=[],v=new THREE.Vector3();
 for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);positions.push(...v.toArray());}
 const normals=g.attributes.normal?.array;const colors=g.attributes.color?.array,uv=g.attributes.uv?.array,I=g.attributes.skinIndex?.array,W=g.attributes.skinWeight?.array;
 let bone=null;p=o.parent;while(p){if(p.isBone){bone=p.name;break;}p=p.parent;}
 meshes.push({name:o.name||'Thao part '+meshes.length,positions,normals:normals?Array.from(normals):null,index:g.index?Array.from(g.index.array):Array.from({length:P.count},(_,i)=>i),colors:colors?Array.from(colors):null,uv:uv?Array.from(uv):null,skinIndex:I?Array.from(I):null,skinWeight:W?Array.from(W):null,bones:o.skeleton?.bones.map(b=>b.name),bone,material:material(Array.isArray(o.material)?o.material[0]:o.material)});
});
const bones=a.body.skeleton.bones.map(b=>({name:b.name,parent:b.parent?.isBone?b.parent.name:null,position:b.getWorldPosition(new THREE.Vector3()).toArray()}));
fs.writeFileSync(path.join(out,'thao-runtime.json'),JSON.stringify({recipe:a.recipe,measure:a.measure,meshes,materials,bones}));console.log(JSON.stringify({meshes:meshes.length,materials,bones:bones.length}));a.dispose();
