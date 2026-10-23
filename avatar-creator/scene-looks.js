// The same look shaders as World, applied to the 3D picture before speech and captions.
import * as THREE from '../johansson-town/vendor/three.module.js';
import {lookFragment} from '../johansson-town/src/render/looks.js';
const vertex='varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
const colour=`vec4 studioColour(vec2 uv){vec4 c=texture2D(tDiffuse,uv);vec3 lo=c.rgb*12.92;vec3 hi=1.055*pow(max(c.rgb,vec3(0.0)),vec3(1.0/2.4))-0.055;return vec4(mix(hi,lo,lessThanEqual(c.rgb,vec3(0.0031308))),c.a);}\n`;
export function createSceneLooks(renderer){
 let target;const materials=new Map(),screen=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));screen.add(quad);
 return {
  render(scene,view,name='none'){
   const fragment=lookFragment(name,{light:true});if(!fragment){renderer.render(scene,view);return;}
   const size=renderer.getDrawingBufferSize(new THREE.Vector2());
   if(!target){target=new THREE.WebGLRenderTarget(size.x,size.y,{type:renderer.extensions.has('EXT_color_buffer_float')?THREE.HalfFloatType:THREE.UnsignedByteType,colorSpace:THREE.NoColorSpace,samples:2,stencilBuffer:false});target.depthTexture=new THREE.DepthTexture(size.x,size.y,THREE.UnsignedIntType);}
   if(target.width!==size.x||target.height!==size.y)target.setSize(size.x,size.y);
   let material=materials.get(name);
   if(!material){material=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment.replaceAll('texture2D(tDiffuse,','studioColour(').replace('float luma',colour+'float luma'),depthTest:false,depthWrite:false,toneMapped:false,uniforms:{tDiffuse:{value:target.texture},tDepth:{value:target.depthTexture},uTexel:{value:new THREE.Vector2()},uResolution:{value:new THREE.Vector2()},uNear:{value:view.near},uFar:{value:view.far},uSkyDepth:{value:120}}});materials.set(name,material);}
   const u=material.uniforms;u.uTexel.value.set(1/size.x,1/size.y);u.uResolution.value.copy(size);u.uNear.value=view.near;u.uFar.value=view.far;quad.material=material;
   const previous=renderer.getRenderTarget();try{renderer.setRenderTarget(target);renderer.render(scene,view);renderer.setRenderTarget(previous);renderer.render(screen,camera);}finally{renderer.setRenderTarget(previous);}
  },
  dispose(){target?.dispose();for(const m of materials.values())m.dispose();quad.geometry.dispose();}
 };
}
