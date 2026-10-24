import * as THREE from '../../johansson-town/vendor/three.module.js';
import {buildAvatar} from '../../johansson-town/src/avatars/build.js';
import {createAvatarAnimator} from '../../johansson-town/src/avatars/animate.js';
import {recipeFor} from '../../johansson-town/src/avatars/cast.js';
import {applyCelShading} from '../../johansson-town/src/render/cel.js';
const TYPES={Float32Array,Uint32Array,Uint16Array,Uint8Array,Int8Array,Int16Array};
async function harbour(){
 const response=await fetch('/assets/office-port/harbour.scene.gz?v=1');if(!response.ok)throw Error('Harbour unavailable');
 if(!globalThis.DecompressionStream)throw Error('Scene decompression unavailable');
 const raw=await response.arrayBuffer();if(raw.byteLength>4500000)throw Error('Scene exceeds loading budget');const bytes=new Uint8Array(raw),zipped=bytes[0]===31&&bytes[1]===139;const buffer=zipped?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():raw,view=new DataView(buffer),length=view.getUint32(0,true),json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,4,length))),base=4+length+(4-length%4)%4;
 for(const g of json.geometries)for(const a of [...Object.values(g.data.attributes),g.data.index].filter(Boolean)){
  const v=a.bufferView;a.array=new TYPES[a.type](buffer.slice(base+v.offset,base+v.offset+v.length));if(a.quantization){const q=a.quantization;a.array=Float32Array.from(a.array,(value,i)=>q.min[i%3]+value/65535*q.range[i%3]);a.type='Float32Array';delete a.quantization;}delete a.bufferView;
 }
 const group=await new THREE.ObjectLoader().parseAsync(json);applyCelShading(group);return {group,views:json.officePort};
}
export async function createPortScene({host,onState,onError,person,place}){
 let disposed=false,playing=false,frame=0,time=0,last=0,finished=false,greeted=false,orbit=0,avatar,animator,actorRoot;
 const renderer=new THREE.WebGLRenderer({alpha:false,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
 let shaderFailed=false;renderer.debug.onShaderError=()=>{shaderFailed=true;};
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','3D Minato harbour. Drag or use left and right arrow keys to look around.');host.append(canvas);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#a6d9f0');scene.fog=new THREE.Fog('#a6d9f0',22,32);scene.add(new THREE.HemisphereLight(0xffffff,0x879783,2.1));const sun=new THREE.DirectionalLight(0xfff3dc,2.3);sun.position.set(-22,45,-40);scene.add(sun);
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;const shadowContext=shadowCanvas.getContext('2d'),gradient=shadowContext.createRadialGradient(32,32,3,32,32,32);gradient.addColorStop(0,'rgba(0,0,0,.3)');gradient.addColorStop(1,'rgba(0,0,0,0)');shadowContext.fillStyle=gradient;shadowContext.fillRect(0,0,64,64);const shadowTexture=new THREE.CanvasTexture(shadowCanvas),shadowGeometry=new THREE.PlaneGeometry(.9,.6),shadowMaterial=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
 const camera=new THREE.PerspectiveCamera(52,16/9,.1,160),from=new THREE.Vector3(),to=new THREE.Vector3(),target=new THREE.Vector3();
 const water=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.ShaderMaterial({uniforms:{time:{value:0},sky:{value:new THREE.Color('#a6d9f0')}},vertexShader:'varying vec3 p; void main(){ vec4 w=modelMatrix*vec4(position,1.); p=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',fragmentShader:'varying vec3 p; uniform float time; uniform vec3 sky; void main(){float wave=sin(p.x*2.1+time*.8)*sin(p.z*1.6-time*.6);vec3 c=mix(vec3(.06,.65,.72),vec3(.17,.80,.82),wave*.5+.5);c+=smoothstep(.91,1.,wave)*.15;float f=smoothstep(22.,32.,distance(p,cameraPosition));gl_FragColor=vec4(mix(c,sky,f),1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'}));water.rotation.x=-Math.PI/2;water.position.y=-.12;scene.add(water);
 let data;try{data=await harbour();}catch(error){renderer.dispose();renderer.forceContextLoss();canvas.remove();throw error;}
 if(disposed)return;scene.add(data.group);
 function resize(){const w=host.clientWidth||960,h=host.clientHeight||w*9/16,scale=Math.min(1,960/w);renderer.setSize(Math.round(w*scale),Math.round(h*scale),false);camera.aspect=w/h;camera.updateProjectionMatrix();render();}
 function state(){onState?.({playing,finished,time});}
 function setCamera(){const u=THREE.MathUtils.smoothstep(Math.min(time/6,1),0,1);camera.position.copy(from).lerp(to,u);const delta=camera.position.clone().sub(target);delta.applyAxisAngle(new THREE.Vector3(0,1,0),orbit);camera.position.copy(target).add(delta);camera.lookAt(target);camera.updateMatrixWorld();}
 function render(){if(disposed)return;setCamera();scene.updateMatrixWorld(true);avatar?.body.skeleton.update();renderer.render(scene,camera);if(shaderFailed)throw Error('3D scene failed to compile');}
 function tick(now){if(disposed||!playing)return;frame=requestAnimationFrame(tick);if(last&&now-last<1000/30)return;const dt=last?Math.min(.06,(now-last)/1000):1/30;last=now;time+=dt;
  if(!greeted&&time>3){greeted=true;animator.play(place.id==='bridge'?'LookAround':'Wave');}
  try{animator.update(dt,{speed:0,seated:false,expression:time>3&&time<6?'smile':'neutral'});avatar.springs?.update(dt);water.material.uniforms.time.value=time;render();}catch(error){playing=false;cancelAnimationFrame(frame);onError?.(error);return;}
  if(time>=8){playing=false;finished=true;cancelAnimationFrame(frame);}state();
 }
 function select(nextPerson,nextPlace){
  person=nextPerson;place=nextPlace;cancelAnimationFrame(frame);playing=false;finished=false;time=0;last=0;greeted=false;orbit=0;
  if(actorRoot){actorRoot.removeFromParent();avatar.dispose();}
  avatar=buildAvatar(recipeFor(person.id==='fujita'?'Mr Fujita':person.id==='thuan'?'Thuan':person.name),{shadows:false,faceSize:256});animator=createAvatarAnimator(avatar);actorRoot=new THREE.Group();actorRoot.add(avatar.root);scene.add(actorRoot);const contact=new THREE.Mesh(shadowGeometry,shadowMaterial);contact.rotation.x=-Math.PI/2;contact.position.y=.006;actorRoot.add(contact);
  const jitter=(Math.random()-.5)*.5;
  if(place.id==='bridge'){
   actorRoot.position.fromArray(data.views.bridge.actor);actorRoot.position.x+=jitter*.35;actorRoot.position.z+=jitter;actorRoot.rotation.y=Math.PI;
   from.fromArray(data.views.bridge.from);to.fromArray(data.views.bridge.to);target.fromArray(data.views.bridge.target);camera.fov=62;
  }else if(place.id==='pier'){
   actorRoot.position.set(-.4+jitter,.098,-86.4+jitter*.4);actorRoot.rotation.y=-.94;from.set(12,8,-91);to.set(3.4,2.8,-91);target.copy(actorRoot.position).y+=avatar.measure.headCentre;camera.fov=52;
  }else{
   actorRoot.position.set(1.2+jitter,.098,-66+jitter);actorRoot.rotation.y=Math.PI/2;from.set(11,8,-70);to.set(-1.5,2.6,-69.8);target.copy(actorRoot.position).y+=avatar.measure.headCentre;camera.fov=52;
  }
  camera.updateProjectionMatrix();animator.play('LookAround');animator.update(1/30,{speed:0,expression:'neutral'});render();state();
 }
 function pause(){playing=false;cancelAnimationFrame(frame);last=0;state();}
 function play(restart=false){if(disposed)return;if(restart||finished){time=0;finished=false;greeted=false;orbit=0;animator.stop();animator.play('LookAround');}if(!playing){playing=true;last=0;frame=requestAnimationFrame(tick);}state();}
 let pointer=null;
 canvas.addEventListener('pointerdown',event=>{pointer={id:event.pointerId,x:event.clientX,orbit};canvas.setPointerCapture(event.pointerId);});
 canvas.addEventListener('pointermove',event=>{if(pointer?.id!==event.pointerId)return;orbit=THREE.MathUtils.clamp(pointer.orbit+(event.clientX-pointer.x)/500,-.25,.25);render();});
 const release=()=>{pointer=null;};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
 canvas.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();orbit=THREE.MathUtils.clamp(orbit+(event.key==='ArrowLeft'?-.05:.05),-.25,.25);render();});
 canvas.addEventListener('webglcontextlost',event=>{if(disposed)return;event.preventDefault();pause();onError?.(new Error('3D context lost'));});
 const observer=new ResizeObserver(resize);observer.observe(host);
 try{select(person,place);resize();await renderer.compileAsync(scene,camera);render();if(shaderFailed)throw Error('3D scene failed to compile');}catch(error){observer.disconnect();avatar?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();throw error;}
 return {select,play,pause,capture({hideActor=false}={}){time=6;animator.stop();animator.update(1/30,{speed:0,expression:'neutral'});actorRoot.visible=!hideActor;render();const image=canvas.toDataURL('image/png');actorRoot.visible=true;return image;},get finished(){return finished;},dispose(){disposed=true;playing=false;cancelAnimationFrame(frame);observer.disconnect();avatar?.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){for(const key of ['map','normalMap','roughnessMap','metalnessMap','alphaMap','emissiveMap'])m[key]?.dispose();m.dispose();}});renderer.dispose();renderer.forceContextLoss();canvas.remove();}};
}
