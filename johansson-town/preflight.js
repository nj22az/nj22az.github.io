import * as THREE from '../the-front-row-seat/pelican/vendor/three.module.min.js';

// Johansson Town display preflight. It runs before main.js so the existing renderer
// keeps its stable game logic while using a sharper touch-device presentation.
const coarse=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
const tabletLike=coarse&&Math.min(innerWidth,innerHeight)>=700;
const dpr=Math.max(1,window.devicePixelRatio||1);
const targetDpr=Math.min(dpr,coarse?(tabletLike?1.6:1.35):2);

if(!THREE.WebGLRenderer.prototype.__johanssonSharpPixelRatio){
  const setPixelRatio=THREE.WebGLRenderer.prototype.setPixelRatio;
  THREE.WebGLRenderer.prototype.setPixelRatio=function(value){
    return setPixelRatio.call(this,Math.max(value||1,targetDpr));
  };
  Object.defineProperty(THREE.WebGLRenderer.prototype,'__johanssonSharpPixelRatio',{value:true});
}

if(!HTMLCanvasElement.prototype.__johanssonAntialias){
  const getContext=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,attributes){
    if((type==='webgl2'||type==='webgl'||type==='experimental-webgl')&&attributes){
      attributes={...attributes,antialias:true,powerPreference:'high-performance'};
    }
    return getContext.call(this,type,attributes);
  };
  Object.defineProperty(HTMLCanvasElement.prototype,'__johanssonAntialias',{value:true});
}

window.__JOHANSSON_RENDER_QUALITY__={pixelRatio:targetDpr,antialias:true,mode:tabletLike?'tablet':coarse?'touch':'desktop'};
