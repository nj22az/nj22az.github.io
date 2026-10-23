// The same look shaders as World, applied to the 3D picture before speech and captions.
import * as THREE from '../johansson-town/vendor/three.module.js';
import {createLookBuffers} from '../johansson-town/src/render/look-buffers.js';
import {withLookMaterials} from '../johansson-town/src/render/look-materials.js';
import {lookFragment,lookNormals,lookSurfaceStrokes} from '../johansson-town/src/render/looks.js?v=20261023-hybrids';
const vertex='varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
const colour=`vec4 studioColour(vec2 uv){vec4 c=texture2D(tDiffuse,uv);vec3 lo=c.rgb*12.92;vec3 hi=1.055*pow(max(c.rgb,vec3(0.0)),vec3(1.0/2.4))-0.055;return vec4(mix(hi,lo,lessThanEqual(c.rgb,vec3(0.0031308))),c.a);}\n`;
export function createSceneLooks(renderer){
 let target,lastView,lastFocus;const auxiliary=createLookBuffers(renderer);const materials=new Map(),screen=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));screen.add(quad);
 return {
  render(scene,view,name='none',{capture=false,quality='preview',focusDistance=6,focusRange=3,focusMode='depth',skyDepth=120}={}){
   lastView=view;lastFocus={focusDistance,focusRange,focusMode,skyDepth};
   const normals=lookNormals(name);
   if(capture||normals)auxiliary.render(()=>renderer.render(scene,view),...renderer.getDrawingBufferSize(new THREE.Vector2()).toArray());
   const key=name+':'+quality+':'+normals;
   const fragment=lookFragment(name,{light:quality!=='export',depth:true,normals,surfaceStrokes:lookSurfaceStrokes(name)});if(!fragment){withLookMaterials(scene,name,()=>renderer.render(scene,view));return;}
   const size=renderer.getDrawingBufferSize(new THREE.Vector2());
   if(!target){target=new THREE.WebGLRenderTarget(size.x,size.y,{type:renderer.extensions.has('EXT_color_buffer_float')?THREE.HalfFloatType:THREE.UnsignedByteType,colorSpace:THREE.NoColorSpace,samples:2,stencilBuffer:false});target.depthTexture=new THREE.DepthTexture(size.x,size.y,THREE.UnsignedIntType);}
   if(target.width!==size.x||target.height!==size.y)target.setSize(size.x,size.y);
   let material=materials.get(key);
   if(!material){material=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment.replaceAll('texture2D(tDiffuse,','studioColour(').replace('float luma',colour+'float luma'),depthTest:false,depthWrite:false,toneMapped:false,uniforms:{tDiffuse:{value:target.texture},tDepth:{value:target.depthTexture},tNormal:{value:null},uDepthPacked:{value:0},uProjectionInverse:{value:new THREE.Matrix4()},uCameraWorld:{value:new THREE.Matrix4()},uFocusMode:{value:0},uFocusDistance:{value:focusDistance},uFocusRange:{value:focusRange},uTexel:{value:new THREE.Vector2()},uResolution:{value:new THREE.Vector2()},uNear:{value:view.near},uFar:{value:view.far},uSkyDepth:{value:120}}});materials.set(key,material);}
   const u=material.uniforms;u.tNormal.value=normals?auxiliary.target.texture:null;u.uProjectionInverse.value.copy(view.projectionMatrixInverse);u.uCameraWorld.value.copy(view.matrixWorld);u.uFocusMode.value=focusMode==='tilt'?1:0;u.uFocusDistance.value=focusDistance;u.uFocusRange.value=focusRange;u.uSkyDepth.value=skyDepth;u.uTexel.value.set(1/size.x,1/size.y);u.uResolution.value.copy(size);u.uNear.value=view.near;u.uFar.value=view.far;quad.material=material;
   const previous=renderer.getRenderTarget();try{renderer.setRenderTarget(target);withLookMaterials(scene,name,()=>renderer.render(scene,view));renderer.setRenderTarget(previous);renderer.render(screen,camera);}finally{renderer.setRenderTarget(previous);}
  },
  capture(){return auxiliary.export(lastView,lastFocus);},
  dispose(){auxiliary.dispose();target?.dispose();for(const m of materials.values())m.dispose();quad.geometry.dispose();}
 };
}
