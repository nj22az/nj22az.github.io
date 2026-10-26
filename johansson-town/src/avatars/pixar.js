import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {rigEyes} from './eyes3d.js';
import {rigBrows,rigMouth,featuresOf} from './face-features.js';
import {celFrom} from '../render/cel.js';

/**
 * Pixar bodies: a resident drawn as the studio's film model instead of the cartoon (the creator, 26 October 2026:
 * "see if you can implement Pixar Thuận into the game"; "Her eyes need to be rigged too"), and then, the same day, "Replace
 * her in the live game and studio now": on every World and Studio page, Thuan is her Pixar body. `?pixar=0` shows the
 * cartoon (to compare); `?pixar=thuan` names the bodies wanted. Everyone else stays the cartoon (AGENTS.md, the owner's
 * workflow of 24 October 2026: main keeps the cartoon until the Pixar world is complete; this resident by his word).
 *
 * The body is made in the studio repo (jojo `3d/cast/game_thuan.py`): her film model posed into World's rest (arms and
 * legs straight down), her weights on World's own bones, her painted eyes painted out, lightened for a phone. Here it is
 * worn by the avatar World builds anyway: the same bones, so every walk, sit, reach and gesture moves her; her card's
 * joints and measures replace the cartoon's (build.js), so feet, seats, hands and braids meet her own body; the cartoon's
 * meshes stay built and hidden. Her face is rigged: her eyes are World's rigged eyes (eyes3d.js) on discs laid over the
 * painted-out place, in her own size (they look about, blink, the lids follow the gaze, the iris lies under the cornea);
 * her brows and mouth are drawn on decals of their own (face-features.js), shaped by every feeling and by talking; her
 * jaw, nose and cheeks are bones that move her skin (the jaw opens with the mouth, the cheeks rise with a smile, the nose
 * scrunches in anger). Not drawn: the cartoon's other outfits (swimwear, the bath towel, the sailor and shopping outfits).
 */

/** The Pixar bodies there are: resident name → their files under assets/ (the GLB and its card) and the GLB's version
 *  (the first characters of its SHA-256: a new export is fetched fresh, never an old one from a cache). */
export const PIXAR_BODIES=Object.freeze({Thuan:Object.freeze({path:'avatars/pixar/thuan',version:'bde294af7c'})});

/** Which residents this page draws as Pixar bodies: all there are, unless it asks for the cartoon (`?pixar=0`) or names them. */
export function pixarWanted(name,search=globalThis.location?.search||''){
 let q;try{q=new URLSearchParams(search).get('pixar');}catch{return true;}
 if(q==='0')return false;
 return q===null||q===''||q==='1'||q.toLowerCase().split(',').includes(String(name).toLowerCase());
}

const loaded=new Map();

/** The parsed body of one resident: its card and its meshes (geometry shared by every avatar that wears it). */
export function preparePixarBody(card,scene){
 const parts=[],features={};
 scene.updateMatrixWorld(true);
 scene.traverse(o=>{
  if(!o.isSkinnedMesh)return;
  const joints=o.skeleton.bones.map(b=>b.name),name=o.material?.name||'';
  if(['eyes','brows','mouth'].includes(name))features[name]={geometry:o.geometry,joints};
  else parts.push({geometry:o.geometry,joints,kind:name.startsWith('hands')?'hands':'body',map:o.material?.map||null});
 });
 if(!parts.length||!features.eyes)throw new Error('Pixar body: expected a body and eyes in the model');
 const rest=Object.fromEntries(Object.entries(card.rest).map(([k,v])=>[k,v.slice()]));
 // World's measures for her (build.js measure()), and her braids as the springs hang them (springs.js springRest).
 const measure={...card.measure,braids:Object.fromEntries(['L','R'].map(s=>[s,[rest['braid'+s+'1'],rest['braid'+s+'2'],rest['braid'+s+'Tip']]]))};
 return {name:card.name,card,rest,measure,parts,features,remapped:new Map()};
}

/**
 * Fetch and parse every Pixar body this page asks for, before the town builds its people. Never rejects, and never holds
 * the town up for long: a body not in hand after `timeout` ms is drawn as the cartoon (and the page carries on).
 */
export async function loadPixarBodies({search,timeout=20000}={}){
 const loader=new GLTFLoader(),names=Object.keys(PIXAR_BODIES).filter(n=>pixarWanted(n,search));
 const load=async name=>{
  if(loaded.has(name))return;
  try{
   const {path,version}=PIXAR_BODIES[name],v='?v='+version,card=await (await fetch(assetURL(path+'.json'+v))).json(),gltf=await loader.loadAsync(assetURL(path+'.glb'+v));
   loaded.set(name,preparePixarBody(card,gltf.scene));
  }catch(error){console.warn('Pixar body unavailable: '+name,error);}
 };
 let timer;
 await Promise.race([Promise.all(names.map(load)),new Promise(resolve=>{timer=setTimeout(()=>{console.warn('Pixar bodies: not in hand after',timeout,'ms; drawing the cartoon');resolve();},timeout);})]);
 clearTimeout(timer);
 return [...loaded.keys()];
}

/** The Pixar body this recipe is drawn with on this page, or null (the cartoon). */
export function pixarBody(recipe){
 const name=recipe?.name;
 return name&&loaded.has(name)&&pixarWanted(name)?loaded.get(name):null;
}

/** For tests and tools: wear a body prepared elsewhere (node has no fetch of the assets). */
export function providePixarBody(body){loaded.set(body.name,body);}

// A geometry's skin indices in this skeleton's order (the model's joints are World's bone names), made once a body.
function inOrder(body,part,order){
 const key=order.join(',');
 if(!body.remapped.has(part))body.remapped.set(part,new Map());
 const cache=body.remapped.get(part);
 if(cache.has(key))return cache.get(key);
 const map=part.joints.map(n=>{const i=order.indexOf(n);if(i<0)throw new Error('Pixar body: no bone '+n);return i;});
 const g=part.geometry.clone(),src=part.geometry.attributes.skinIndex,idx=new Uint16Array(src.count*4);
 for(let i=0;i<src.count;i++)for(let c=0;c<4;c++)idx[i*4+c]=map[src.getComponent(i,c)];
 g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(idx,4));
 cache.set(key,g);return g;
}

// The town's high-key skin ramp (cel.js 'soft3': 172, 214, 255) blended rather than stepped: her face is modelled, not a
// ball, and stepped bands broke it into patches.
let ramp=null;
function smoothRamp(){
 if(ramp)return ramp;
 ramp=new THREE.DataTexture(new Uint8Array([172,172,172,255,214,214,214,255,255,255,255,255]),3,1,THREE.RGBAFormat);
 ramp.minFilter=ramp.magFilter=THREE.LinearFilter;ramp.generateMipmaps=false;ramp.needsUpdate=true;return ramp;
}

/** The face's own bones (children of the head): the jaw (talking, an open mouth), the nose and the cheeks. */
const FACE_BONES=Object.freeze(['jaw','nose','cheekL','cheekR']);
/** How far each moves at full: the jaw's drop (radians), a cheek's rise (up, forward and out: the mid-face widens) and the
 *  nose's scrunch (metres, up and back). */
const FACE_REACH=Object.freeze({jaw:.22,cheek:[.005,.0016,.0012],nose:[.0018,-.0008]});
// Eyes only the painter draws, and what a face without painted eyes shows instead (eyes3d.js rigEyes `stand`).
const STAND_IN=Object.freeze({star:'wide',heart:'happy',spiral:'daze',pain:'happy',smug:'shy',droop:'shy',dreamy:'content',bawl:'sad',blank:'wide'});

// A decal's own units, as the studio wrote them into its first UV (x/100, y/100; glTF turns v over), and its side (hers).
function withLocal(g,name){
 const P=g.attributes.position,UV=g.attributes.uv,n=P.count,local=new Float32Array(n*3);
 for(let i=0;i<n;i++){local[i*3]=UV.getX(i)*100;local[i*3+1]=(1-UV.getY(i))*100;local[i*3+2]=Math.sign(P.getX(i));}
 g.setAttribute(name,new THREE.BufferAttribute(local,3));return g;
}

export function dressPixar(body,{root,bones,order,shadows=true}){
 const rest=body.rest,face={};
 for(const name of FACE_BONES){if(!rest[name])continue;const b=new THREE.Bone();b.name=name;b.position.set(...rest[name]).sub(new THREE.Vector3(...rest.head));bones.head.add(b);face[name]=b;}
 const restOf=Object.fromEntries(Object.entries(face).map(([k,b])=>[k,b.position.clone()]));
 root.updateMatrixWorld(true);
 const names=[...order,...Object.keys(face)],skeleton=new THREE.Skeleton(names.map(n=>bones[n]||face[n]));
 const skinned=(g,m)=>{const mesh=new THREE.SkinnedMesh(g,m);mesh.frustumCulled=false;root.add(mesh);mesh.bind(skeleton);return mesh;};
 // Shaded as every resident's face is (build.js buildHead): the town's high-key ramp, a little self-lit, so her pale skin
 // stays the pale skin of her film model and does not go brown in a shadow.
 const materials=[],meshes=body.parts.map(part=>{
  const source=part.kind==='hands'?new THREE.MeshStandardMaterial({vertexColors:true,roughness:.82,emissive:0xffffff,emissiveIntensity:.05})
   :new THREE.MeshStandardMaterial({map:part.map,roughness:.82,emissive:0xffffff,emissiveMap:part.map,emissiveIntensity:.05});
  const material=celFrom(source,{bands:'soft3'});source.dispose();material.gradientMap=smoothRamp();
  material.name='Pixar '+body.name+' · '+part.kind;materials.push(material);
  const mesh=skinned(inOrder(body,part,names),material);
  mesh.name='Pixar '+body.name+' · '+part.kind;mesh.castShadow=shadows;mesh.receiveShadow=true;return mesh;
 });
 // Her eye (the studio's measures of the painted one, her lashes) drawn as World draws every rigged eye, on the town's ramp.
 const F=body.features,E=body.card.eyes;
 const eyes=rigEyes(withLocal(inOrder(body,F.eyes,names).clone(),'eyeLocal'),{iris:E.colour,style:'pixar',own:{rx:E.rx,ry:E.ry,iris:E.iris,lash:E.lash,flick:E.flick,lashes:E.lashes},make:skinned,stand:STAND_IN});
 const brows=F.brows&&body.card.brows?rigBrows(withLocal(inOrder(body,F.brows,names).clone(),'featureLocal'),body.card.brows,{make:skinned}):null;
 const mouth=F.mouth&&body.card.mouth?rigMouth(withLocal(inOrder(body,F.mouth,names).clone(),'featureLocal'),body.card.mouth,{make:skinned}):null;
 // The features ease from one feeling to the next (a tenth of a second), not jump: a wall clock, as paintFace has no step.
 let eased=null,last=0;
 const ease=(to,k)=>{if(!eased){eased=structuredClone(to);return eased;}
  const mix=(a,b)=>typeof b==='number'?a+(b-a)*k:Array.isArray(b)?b.map((v,i)=>mix(a[i],v)):Object.fromEntries(Object.entries(b).map(([n,v])=>[n,mix(a[n],v)]));
  eased=mix(eased,to);return eased;};
 const api={meshes:[...meshes,eyes.mesh,brows?.mesh,mouth?.mesh].filter(Boolean),eyes,brows,mouth,bones:face,smooth:true,
  /** Follow the face: the eyes (gaze, blink, the feeling's lids), the brows, the mouth and the face's bones. */
  update(state){
   eyes.update(state);
   const now=globalThis.performance?.now?.()??0,dt=last?Math.min(.25,(now-last)/1000):1;last=now;
   const f=ease(featuresOf(state),api.smooth?1-Math.exp(-dt/.08):1);
   brows?.set(f.brows.left,f.brows.right);mouth?.set(f.mouth);
   if(face.jaw)face.jaw.rotation.x=f.jaw*FACE_REACH.jaw;
   for(const [i,s,x] of [[0,'L',1],[1,'R',-1]])if(face['cheek'+s])face['cheek'+s].position.copy(restOf['cheek'+s]).add(new THREE.Vector3(x*FACE_REACH.cheek[2]*f.cheeks[i],FACE_REACH.cheek[0]*f.cheeks[i],FACE_REACH.cheek[1]*f.cheeks[i]));
   if(face.nose)face.nose.position.copy(restOf.nose).add(new THREE.Vector3(0,FACE_REACH.nose[0]*f.scrunch,FACE_REACH.nose[1]*f.scrunch));
  },
  set visible(on){for(const m of meshes)m.visible=on;},
  dispose(){for(const m of materials)m.dispose();eyes.dispose();brows?.dispose();mouth?.dispose();},
 };
 return api;
}
