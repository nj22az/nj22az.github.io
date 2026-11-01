import * as THREE from '/johansson-town/vendor/three.module.js';
import {applyCelShading} from '/johansson-town/src/render/cel.js';

// Reuse the real Minato set, baked by tools/office-port/bake.mjs. The game never boots.
const TYPES={Float32Array,Uint32Array,Uint16Array,Uint8Array,Int8Array,Int16Array};
async function loadHarbour(signal){
 const response=await fetch('/assets/office-port/harbour.scene.gz?v=1',{signal});
 if(!response.ok)throw Error('Harbour unavailable');
 const raw=await response.arrayBuffer();if(signal.aborted)throw Error('Cancelled');
 if(raw.byteLength>4500000)throw Error('Scene exceeds loading budget');
 const bytes=new Uint8Array(raw),zipped=bytes[0]===31&&bytes[1]===139;
 const buffer=zipped?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():raw;
 const length=new DataView(buffer).getUint32(0,true),json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,4,length))),base=4+length+(4-length%4)%4;
 for(const geometry of json.geometries)for(const attribute of [...Object.values(geometry.data.attributes),geometry.data.index].filter(Boolean)){
  const view=attribute.bufferView;attribute.array=new TYPES[attribute.type](buffer.slice(base+view.offset,base+view.offset+view.length));
  if(attribute.quantization){const q=attribute.quantization;attribute.array=Float32Array.from(attribute.array,(v,i)=>q.min[i%3]+v/65535*q.range[i%3]);attribute.type='Float32Array';delete attribute.quantization;}
  delete attribute.bufferView;
 }
 return new THREE.ObjectLoader().parseAsync(json);
}

export async function createHarbourDiorama({host,signal,onError}){
 let renderer,group,frame=0,disposed=false,active=false,last=0,time=0,dirty=true;
 const scene=new THREE.Scene(),sky=new THREE.Color('#a6d9f0');scene.background=sky;scene.fog=new THREE.Fog('#a6d9f0',65,150);
 const camera=new THREE.PerspectiveCamera(48,16/9,.2,260),target=new THREE.Vector3();
 const views={quay:{target:[0,2,-57],radius:36,theta:1.12,phi:1.1},ferry:{target:[-7,4,-62],radius:43,theta:2.3,phi:1.02},port:{target:[0,1,-48],radius:48,theta:.65,phi:.65}};
 let view='quay',theta=0,phi=0,radius=0,pointer=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function dispose(){
  if(disposed)return;disposed=true;active=false;cancelAnimationFrame(frame);observer?.disconnect();
  reduced.removeEventListener('change',preferenceChanged);
  const geometries=new Set(),materials=new Set(),textures=new Set();
  scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const material of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){materials.add(material);for(const value of Object.values(material))if(value?.isTexture)textures.add(value);}});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
  renderer?.dispose();renderer?.forceContextLoss();renderer?.domElement.remove();
 }
 let observer;
 function preferenceChanged(){dirty=true;schedule();}
 function fail(){dispose();onError?.();}
 function render(){
  if(disposed)return;
  camera.position.setFromSphericalCoords(radius,phi,theta).add(target);camera.lookAt(target);
  renderer.render(scene,camera);dirty=false;
 }
 function tick(now){
  frame=0;if(!active||disposed)return;
  if(now-last>=1000/30){time+=Math.min(.1,(now-last)/1000);last=now;water.material.uniforms.time.value=time;
   try{if(dirty||!reduced.matches)render();}catch(_){fail();return;}
  }
  if(!reduced.matches||dirty)schedule();
 }
 function schedule(){if(active&&!disposed&&!frame)frame=requestAnimationFrame(tick);}
 function update(){dirty=true;schedule();}
 function setView(name){if(!views[name])return;view=name;const v=views[name];target.fromArray(v.target);theta=v.theta;phi=v.phi;radius=v.radius;update();}
 function control(action){
  if(action==='left')theta-=.12;if(action==='right')theta+=.12;
  if(action==='in')radius=Math.max(views[view].radius*.75,radius-3);
  if(action==='out')radius=Math.min(views[view].radius*1.3,radius+3);
  if(action==='reset')setView(view);theta=THREE.MathUtils.clamp(theta,views[view].theta-.65,views[view].theta+.65);update();
 }
 const water=new THREE.Mesh(new THREE.PlaneGeometry(450,450),new THREE.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:'varying vec3 p;void main(){vec4 w=modelMatrix*vec4(position,1.);p=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',fragmentShader:`
 varying vec3 p;uniform float time;
 void main(){float wave=sin(p.x*1.7+time*.65)*sin(p.z*1.1-time*.45);
 vec3 c=mix(vec3(.06,.53,.62),vec3(.075,.56,.65),wave*.5+.5);
 c+=smoothstep(.985,1.,wave)*.08;
 float fog=smoothstep(65.,150.,distance(p,cameraPosition));
 gl_FragColor=vec4(mix(c,vec3(.65,.85,.94),fog),1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`}));water.rotation.x=-Math.PI/2;water.position.y=-.12;
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
  let shaderFailed=false;renderer.debug.onShaderError=()=>{shaderFailed=true;};
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Minato harbour in 3D. Use arrow keys to look around, plus and minus to zoom.');canvas.setAttribute('aria-describedby','harbour-help');host.append(canvas);
  scene.add(water,new THREE.HemisphereLight(0xffffff,0x879783,2.1));const sun=new THREE.DirectionalLight(0xfff3dc,2.3);sun.position.set(-22,45,-40);scene.add(sun);
  group=await loadHarbour(signal);scene.add(group);if(signal.aborted){dispose();throw Error('Cancelled');}applyCelShading(group);
  function resize(){if(disposed)return;const width=host.clientWidth||960,height=host.clientHeight||540,scale=Math.min(1,960/width);renderer.setSize(Math.round(width*scale),Math.round(height*scale),false);camera.aspect=width/height;camera.updateProjectionMatrix();update();}
  observer=new ResizeObserver(resize);observer.observe(host);setView('quay');resize();
  await renderer.compileAsync(scene,camera);render();if(shaderFailed)throw Error('Harbour shader failed');
  canvas.addEventListener('pointerdown',event=>{if(!event.isPrimary)return;pointer={id:event.pointerId,x:event.clientX,y:event.clientY,theta,phi};canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener('pointermove',event=>{if(pointer?.id!==event.pointerId)return;theta=THREE.MathUtils.clamp(pointer.theta-(event.clientX-pointer.x)/400,views[view].theta-.65,views[view].theta+.65);phi=THREE.MathUtils.clamp(pointer.phi-(event.clientY-pointer.y)/500,.55,1.25);update();});
  canvas.addEventListener('pointerup',()=>{pointer=null;});canvas.addEventListener('pointercancel',()=>{pointer=null;});canvas.addEventListener('lostpointercapture',()=>{pointer=null;});
  canvas.addEventListener('keydown',event=>{const action={ArrowLeft:'left',ArrowRight:'right','+':'in','=':'in','-':'out',Home:'reset'}[event.key];if(action){event.preventDefault();control(action);}else if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();phi=THREE.MathUtils.clamp(phi+(event.key==='ArrowUp'?-.08:.08),.55,1.25);update();}});
  canvas.addEventListener('webglcontextlost',event=>{if(!disposed){event.preventDefault();fail();}});
  reduced.addEventListener('change',preferenceChanged);
  return {setView,control,setActive(value){active=value;if(active){last=performance.now();schedule();}else{cancelAnimationFrame(frame);frame=0;}},dispose};
 }catch(error){dispose();throw error;}
}
