// Johansson Studio's agent API, loaded only when the page is opened with ?agent (by the johansson-studio MCP server's
// headless page, or by an agent in a browser). It draws with the Studio's own code -- World's avatar builder and the
// Build scene posing -- so a portrait an agent renders is what the creator sees on the iPad. Nothing here changes or
// saves anything; stage 4 adds the editing API and WebMCP on top (avatar-creator/docs/STUDIO-MCP.md).
import * as THREE from '../johansson-town/vendor/three.module.js';
import {buildAvatar} from '../johansson-town/src/avatars/build.js';
import {normalizeRecipe,seeded} from '../johansson-town/src/avatars/recipe.js';
import {poseSceneAvatar} from './scene-avatar.js?v=20261011-1';
import {KNOWN_POSES,KNOWN_EXPRESSIONS} from './scene-catalogue.mjs';

export const VERSION=1;
/** The view's turn, in degrees: a body at turn 0 faces the camera. */
export const VIEWS=Object.freeze({front:0,quarter:-35,left:-90,right:90,back:180});
const LIGHTS={warm:[0xffffff,0xc8a878,2.2,0xfff4e0,1.9,[2,4,5]]};

let renderer=null;
function canvasRenderer(size){
 if(!renderer){
  const canvas=document.createElement('canvas');
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
 }
 renderer.setSize(size,size,false);return renderer;
}

/**
 * A portrait of a recipe as a PNG data URL. view: front, quarter, left, right or back; expression and pose: any the
 * Build scene offers (KNOWN_EXPRESSIONS, KNOWN_POSES); framing: full (the whole body) or face; size: 128 to 1024
 * pixels square; background: #rrggbb or 'transparent'. The same recipe and options always give the same pixels
 * (the body's idle sway and blinks are drawn from a fixed seed).
 */
export function renderPortrait(recipe,{view='front',expression='smile',pose='Idle',framing='full',size=512,background='#f3ede2'}={}){
 if(!Object.hasOwn(VIEWS,view))throw Error(`Unknown view "${view}". Views: ${Object.keys(VIEWS).join(', ')}.`);
 if(!KNOWN_EXPRESSIONS.has(expression))throw Error(`Unknown expression "${expression}".`);
 if(!KNOWN_POSES.has(pose))throw Error(`Unknown pose "${pose}".`);
 if(!['full','face'].includes(framing))throw Error('Framing is full or face.');
 size=Math.round(Math.min(1024,Math.max(128,Number(size)||512)));
 const clear=background==='transparent'?null:/^#[0-9a-f]{6}$/i.test(background)?new THREE.Color(background):null;
 if(background!=='transparent'&&!clear)throw Error('Background is #rrggbb or transparent.');
 const random=Math.random;Math.random=seeded('johansson-studio-portrait');
 const scene=new THREE.Scene(),[sky,ground,fill,key,power,position]=LIGHTS.warm;
 scene.add(new THREE.HemisphereLight(sky,ground,fill));const sun=new THREE.DirectionalLight(key,power);sun.position.set(...position);scene.add(sun);
 let avatar=null;
 try{
  avatar=buildAvatar(normalizeRecipe(recipe),{shadows:false,faceSize:512});
  poseSceneAvatar(avatar,{pose,expression,turn:VIEWS[view]});scene.add(avatar.root);avatar.root.updateMatrixWorld(true);
  const box=new THREE.Box3();
  if(framing==='face'&&avatar.face?.head)box.setFromObject(avatar.face.head);else box.setFromObject(avatar.root);
  const centre=box.getCenter(new THREE.Vector3()),extent=box.getSize(new THREE.Vector3());
  const half=Math.max(extent.y,extent.x,extent.z)*(framing==='face'?.78:.56);
  const camera=new THREE.OrthographicCamera(-half,half,half,-half,.01,50);
  camera.position.set(centre.x,centre.y,centre.z+10);camera.lookAt(centre);camera.updateMatrixWorld(true);
  const r=canvasRenderer(size);
  if(clear)r.setClearColor(clear,1);else r.setClearColor(0x000000,0);
  r.clear();r.render(scene,camera);
  return r.domElement.toDataURL('image/png');
 }finally{
  Math.random=random;
  if(avatar){avatar.root.removeFromParent();avatar.body?.skeleton?.dispose();avatar.dispose();}
 }
}

window.__JOHANSSON_STUDIO__=Object.freeze({version:VERSION,ready:true,views:Object.keys(VIEWS),poses:[...KNOWN_POSES],expressions:[...KNOWN_EXPRESSIONS],renderPortrait});
