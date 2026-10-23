import * as THREE from '../johansson-town/vendor/three.module.js';
import {lookFragment,LOOKS} from '../johansson-town/src/render/looks.js';
export function createComicLook(){let renderer,failed=false,texture,quad;const scene=new THREE.Scene(),camera=new THREE.Camera(),materials=new Map(),depth=new THREE.DataTexture(new Uint8Array([254,254,254,255]),1,1);depth.needsUpdate=true;
 return {draw(input,ctx,name){const w=input.width,h=input.height;if(name==='none'){ctx.drawImage(input,0,0);return;}
  if(!renderer&&!failed)try{renderer=new THREE.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));scene.add(quad);}catch{failed=true;}
  if(failed){const filter=LOOKS[name]?.css;if(!filter||filter==='none'){ctx.drawImage(input,0,0);return 'This look needs graphics support; Original is shown here. Text and assets are still editable.';}ctx.save();ctx.filter=filter;ctx.drawImage(input,0,0);ctx.restore();return;}
  renderer.setSize(w,h,false);texture?.dispose();texture=new THREE.CanvasTexture(input);texture.colorSpace=THREE.NoColorSpace;
  let m=materials.get(name);if(!m){m=new THREE.ShaderMaterial({vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:lookFragment(name,{light:true}),depthTest:false,depthWrite:false,toneMapped:false,uniforms:{tDiffuse:{value:null},tDepth:{value:depth},uTexel:{value:new THREE.Vector2()},uResolution:{value:new THREE.Vector2()},uNear:{value:.05},uFar:{value:60},uSkyDepth:{value:120}}});materials.set(name,m);}m.uniforms.tDiffuse.value=texture;m.uniforms.uTexel.value.set(1/w,1/h);m.uniforms.uResolution.value.set(w,h);quad.material=m;renderer.render(scene,camera);ctx.drawImage(renderer.domElement,0,0);
 },dispose(){texture?.dispose();depth.dispose();quad?.geometry.dispose();for(const m of materials.values())m.dispose();renderer?.dispose();renderer?.forceContextLoss();}};
}
