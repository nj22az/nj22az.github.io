import * as THREE from '../../johansson-town/vendor/three.module.js';
import {buildAvatar} from '../../johansson-town/src/avatars/build.js';
import {recipeFor} from '../../johansson-town/src/avatars/cast.js';
import {normalizeRecipe} from '../../johansson-town/src/avatars/recipe.js';
import {createAvatarMaterialStudy} from '../../johansson-town/src/avatars/material-presets.js';
import {applyMaterialLighting} from '../../johansson-town/src/render/studio-lighting.js';
import {createInkPipeline} from '../../johansson-town/src/render/ink-pipeline.js';
const renderer=new THREE.WebGLRenderer({canvas:document.querySelector('canvas'),antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.setSize(512,640);renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color('#eee9df');
const fill=new THREE.HemisphereLight(),sun=new THREE.DirectionalLight();scene.add(fill,sun);
const camera=new THREE.PerspectiveCamera(28,512/640,.01,50);
let avatar,study,pipeline,look='none',character='Thuan',view='full',lighting='neutral',mode='legacy',cloth='cotton',angle=0;
function dispose(){study?.dispose();study=null;if(avatar){avatar.root.removeFromParent();avatar.dispose();avatar=null;}}
function create(name='Thuan',recipe=null){dispose();character=name;avatar=buildAvatar(recipe||recipeFor(name),{shadows:false,faceSize:512,materialStudy:true});scene.add(avatar.root);avatar.paintFace({expression:'neutral',blink:0,talk:0,look:[0,0]});if(avatar.body.userData.materialRegions)study=createAvatarMaterialStudy(avatar);return avatar.recipe;}
function frame(){
 const m=avatar.measure;avatar.root.rotation.y=angle;avatar.root.updateMatrixWorld(true);
 let at=new THREE.Vector3(0,m.H*.5,0),distance=m.H*2.65;
 if(view==='face'){at.set(0,m.headCentre,0);distance=m.Rh*8.2;}
 if(view==='hand'){at=avatar.bones.handR.getWorldPosition(new THREE.Vector3());at.y-=m.hand*.6;distance=m.hand*11.5;}
 camera.position.copy(at).add(new THREE.Vector3(0,view==='full'?.04:0,distance));camera.lookAt(at);camera.updateProjectionMatrix();
}
function render(options={}){
 ({view=view,lighting=lighting,mode=mode,cloth=cloth,angle=angle,look=look}=options);
 applyMaterialLighting(lighting,fill,sun);study?.set({mode,cloth});frame();renderer.info.reset();
 if(look!=='none'){
  pipeline??=createInkPipeline(renderer,{superScale:1,samples:0,fxaa:true,preferHalfFloat:true});pipeline.setLook(look);pipeline.setCamera(camera);pipeline.setExposure(1);pipeline.render(r=>r.render(scene,camera));
 }else renderer.render(scene,camera);
 return snapshot();
}
function snapshot(){
 const info=renderer.info,materials=new Set();scene.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])materials.add(m.uuid);});
 return {character,recipe:avatar.recipe,view,lighting,mode,cloth,angle,look,presetVersion:study?.state.version,threeRevision:THREE.REVISION,camera:{position:camera.position.toArray(),quaternion:camera.quaternion.toArray(),fov:camera.fov,near:camera.near,far:camera.far},exposure:renderer.toneMappingExposure,toneMapping:renderer.toneMapping,outputColorSpace:renderer.outputColorSpace,resolution:[512,640],drawCalls:info.render.calls,triangles:info.render.triangles,materials:materials.size,programs:info.programs.length,memory:{...info.memory},study:study?.state};
}
function finish(){const gl=renderer.getContext();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(4));gl.finish();}
async function measure(options={},n=30){
 render(options);const gl=renderer.getContext(),warm=[];for(let i=0;i<6;i++){const t=performance.now();render(options);finish();warm.push(performance.now()-t);}
 const samples=[];for(let i=0;i<n;i++){const t=performance.now();render(options);finish();samples.push(performance.now()-t);}
 const sorted=samples.slice().sort((a,b)=>a-b),t=performance.now();renderer.domElement.toDataURL('image/png');const exportMs=performance.now()-t;
 const ext=gl.getExtension('WEBGL_debug_renderer_info');
 return {...snapshot(),warmupMs:warm,medianMs:sorted[Math.floor(n*.5)],p95Ms:sorted[Math.ceil(n*.95)-1],samples,exportMs,environment:{userAgent:navigator.userAgent,hardwareConcurrency:navigator.hardwareConcurrency,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),method:'Synchronous wall time around render + 1-pixel readPixels + gl.finish; includes JavaScript, driver, readback and software rasterisation, not GPU timer queries.'}};
}
async function lifecycle(){
 render({mode:'enhanced',look:'none'});finish();const before=snapshot();
 for(let i=0;i<10;i++){create(i%2?'Thuan':'Johansson');render({mode:'enhanced',cloth:i%2?'cotton':'satin'});finish();}
 create('Thuan');render({mode:'enhanced',cloth:'cotton'});finish();const after=snapshot();return {before,after};
}
function invariants(){
 const recipe=JSON.stringify(avatar.recipe),geometry=avatar.body.geometry,P=geometry.attributes.position.array.slice(),W=geometry.attributes.skinWeight.array.slice(),I=geometry.attributes.skinIndex.array.slice(),material=avatar.body.material,groups=JSON.stringify(geometry.groups);
 study.set({mode:'enhanced',cloth:'satin'});study.set({mode:'legacy'});
 const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 const first=avatar,other=buildAvatar(normalizeRecipe({...avatar.recipe,name:'Other'}),{shadows:false,materialStudy:true}),otherMaterial=other.body.material,otherColour=other.face.head.material.color.clone();
 study.set({mode:'enhanced'});const proposed=avatar.body.material[1];proposed.color.set('#edb081');const independent=other.body.material===otherMaterial&&other.face.head.material.color.equals(otherColour)&&other.body.material!==proposed;
 proposed.color.set('#ffffff');study.set({mode:'legacy'});other.dispose();
 return {recipeUnchanged:JSON.stringify(first.recipe)===recipe,positionsUnchanged:same(P,geometry.attributes.position.array),weightsUnchanged:same(W,geometry.attributes.skinWeight.array),indicesUnchanged:same(I,geometry.attributes.skinIndex.array),materialRestored:material===first.body.material,groupsRestored:groups===JSON.stringify(geometry.groups),independent};
}
create();render();window.review={coldSwitch(options){const t=performance.now();render(options);finish();return {ms:performance.now()-t,...snapshot()};},create,render,snapshot,measure,lifecycle,invariants,dispose,renderer,scene,camera,get avatar(){return avatar;}};
