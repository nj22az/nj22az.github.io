import {gradientMap} from './cel.js';
function pencilMaterial(m){
 if(m.userData.illustrationPencil)return m.userData.illustrationPencil;
 const enabled={value:0},compile=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);Object.defineProperty(m.userData,'illustrationPencil',{value:enabled,enumerable:false,configurable:true});
 m.onBeforeCompile=function(shader,renderer){compile.call(this,shader,renderer);shader.uniforms.uIllustrationPencil=enabled;
  shader.vertexShader='varying vec3 inkRest;varying vec3 inkRestNormal;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ninkRest=position;inkRestNormal=normal;');
  shader.fragmentShader=`uniform float uIllustrationPencil;varying vec3 inkRest;varying vec3 inkRestNormal;
float restStroke(vec2 p){float line=abs(fract(dot(p,vec2(.63,.78))*28.0)-.5);float pressure=.65+.35*sin(dot(p,vec2(13.1,19.7)));return (1.0-smoothstep(.055,.13,line))*pressure;}
`+shader.fragmentShader.replace('#include <opaque_fragment>',`if(uIllustrationPencil>.5){vec3 weights=pow(abs(normalize(inkRestNormal)),vec3(4.0));weights/=max(.0001,weights.x+weights.y+weights.z);float stroke=dot(weights,vec3(restStroke(inkRest.yz),restStroke(inkRest.xz),restStroke(inkRest.xy)));float light=dot(outgoingLight,vec3(.2126,.7152,.0722));outgoingLight*=mix(1.08,.61,stroke*(1.0-smoothstep(.35,.85,light)));}
#include <opaque_fragment>`);
 };
 m.customProgramCacheKey=()=>key()+':stable-pencil-v1';m.needsUpdate=true;return enabled;
}
/** Look material treatment BEFORE filtering. Rest coordinates stay attached to moving/skinned geometry. */
export function withLookMaterials(scene,name,draw){
 if(!['flat','crayon'].includes(name)||typeof scene?.traverse!=='function')return draw();
 const materials=new Set(),restore=[];
 scene.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m?.isMeshToonMaterial)materials.add(m);});
 for(const m of materials){if(name==='flat'){const before=m.gradientMap;m.gradientMap=gradientMap(2);restore.push(()=>m.gradientMap=before);const f=m.userData.flatten;if(f){const value=f.value;f.value=0;restore.push(()=>f.value=value);}}else{const u=pencilMaterial(m),before=u.value;u.value=1;restore.push(()=>u.value=before);}}
 try{return draw();}finally{for(const f of restore)f();}
}
export function drawWithLookMaterials(renderer,name,draw){if(!['flat','crayon'].includes(name))return draw(renderer);const render=renderer.render;
 renderer.render=function(scene,camera){return withLookMaterials(scene,name,()=>render.call(renderer,scene,camera));};
 try{return draw(renderer);}finally{renderer.render=render;}
}
