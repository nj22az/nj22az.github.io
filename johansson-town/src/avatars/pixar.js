import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {rigEyes,EYE_PARAMS} from './eyes3d.js';
import {pixarSkin} from './pixar-skin.js';
import {rigBrows,rigMouth,featuresOf} from './face-features.js';
import {actingOf,springOf} from './face-acting.js';
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
 *
 * Each body acts its feelings its own way (face-acting.js; the creator, 26 October 2026: "Thuans expressions need some work
 * too, she needs more personality when she is shocked and the different expressions, now she comes off as Generic"), and
 * its face gets from one feeling to the next on springs of the feeling's own timing (a shock pops and settles, sadness
 * sinks in). The same day, "Fix Johansson's blockers and bring him into the game": Pixar Johansson (jojo
 * `3d/cast/game_johansson.py`), the player's own body in the third person: clean-shaven and bald, his mouth drawn as hers
 * is, and an older face's lines (face-acting.js `lines`). Both are lit as skin (pixar-skin.js: the creator's rendering
 * brief of 26 October 2026).
 */

/** The Pixar bodies there are: resident name → their files under assets/ (the GLB and its card) and the GLB's version
 *  (the first characters of its SHA-256: a new export is fetched fresh, never an old one from a cache). */
export const PIXAR_BODIES=Object.freeze({Thuan:Object.freeze({path:'avatars/pixar/thuan',version:'bde294af7c'}),
 Johansson:Object.freeze({path:'avatars/pixar/johansson',version:'a9b404b7e3'}),
 Thao:Object.freeze({path:'avatars/pixar/thao',version:'1ec248fabf'})});

/** Which residents this page draws as Pixar bodies: all there are, unless it asks for the cartoon (`?pixar=0`) or names them. */
export function pixarWanted(name,search=globalThis.location?.search||''){
 let q;try{q=new URLSearchParams(search).get('pixar');}catch{return true;}
 if(q==='0')return false;
 return q===null||q===''||q==='1'||q.toLowerCase().split(',').includes(String(name).toLowerCase());
}

const loaded=new Map();

/**
 * A body's clothes, each its own mesh over a body of its own (jojo `3d/cast/clothes_apart.py`; the creator, 26 October
 * 2026: "Make a nude rig with underwear for Johansson then rig the Hawaii shirt"): the shirt and the shorts on the body's
 * own bones and weights, and the trunk under them (`torso`) left out while they are worn, so nothing of him shows through
 * them. `?pixarClothes=0` on a page undresses every Pixar body (his boxer briefs), to look at the body under them.
 */
export const CLOTHES_PARTS=Object.freeze(['shirt','shorts']);
export function pixarDressed(search=globalThis.location?.search||''){return new URLSearchParams(search).get('pixarClothes')!=='0';}

/** The parsed body of one resident: its card and its meshes (geometry shared by every avatar that wears it). */
export function preparePixarBody(card,scene){
 const parts=[],features={};
 scene.updateMatrixWorld(true);
 scene.traverse(o=>{
  if(!o.isSkinnedMesh)return;
  const joints=o.skeleton.bones.map(b=>b.name),name=o.material?.name||'';
  if(['eyes','brows','mouth'].includes(name))features[name]={geometry:o.geometry,joints};
  else parts.push({geometry:o.geometry,joints,kind:name.startsWith('hands')?'hands':CLOTHES_PARTS.includes(name)||name==='torso'?name:'body',map:o.material?.map||null});
 });
 if(!parts.length||!features.eyes)throw new Error('Pixar body: expected a body and eyes in the model');
 const rest=Object.fromEntries(Object.entries(card.rest).map(([k,v])=>[k,v.slice()]));
 // World's measures for the body (build.js measure()), and its braids as the springs hang them (springs.js springRest).
 const measure={...card.measure};
 if(rest.braidL1)measure.braids=Object.fromEntries(['L','R'].map(s=>[s,[rest['braid'+s+'1'],rest['braid'+s+'2'],rest['braid'+s+'Tip']]]));
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

const EYE_AT=Object.freeze(Object.fromEntries(EYE_PARAMS.map((n,i)=>[n,i])));
// What a body's acting does to the eye as drawn (face-acting.js eyes): scales of its size and iris, its lids.
const EYE_SCALE=Object.freeze({rx:'rx',ry:'ry',topAmp:'ry',botAmp:'ry',irx:'iris',iry:'iris'}),EYE_SET=Object.freeze(['pupil','cut','slant','smile','squeeze']);
// Where the face's numbers may go, a spring's overshoot included: the brows' [lift, tilt, arch, pinch] and the mouth.
// (face-features.js BROW_KEYS: lift, tilt, arch, pinch, outer, straight, bunch.) This is what Thuận's brow decal holds; a
// body whose decal the studio made wider gives its own (face-acting.js browRange: his evil brow's inner end comes down a
// long way). Shared, his wider range let her springs' overshoot cut her brows' inner ends flat.
export const BROW_RANGE=Object.freeze([[-3.2,11],[-9.5,10.6],[-1.6,3],[0,3.2],[-4,10],[0,1],[0,.8]]);
const FEATURE_RANGE=Object.freeze({open:[0,15],width:[.3,1.5],round:[0,1.2],box:[0,1.2],upper:[.05,.95],teeth:[0,1.2],lowTeeth:[0,1.2],
 tongue:[0,1.2],pucker:[0,1.2],thin:[0,1.2],pout:[0,1.5]});

/**
 * Springs for a face: every number of it moves toward its feeling's as a damped spring of the feeling's own timing
 * (face-acting.js: {f Hz, z}); under critical damping it overshoots and settles (a take), over it sinks in. A tree of
 * numbers (arrays and objects) in, the same tree out. `sp` null: there at once.
 */
function faceSprings(){
 const state=new Map();
 const step=(key,target,dt,sp)=>{
  let s=state.get(key);
  if(!s||!sp||dt>=.5){state.set(key,{x:target,v:0});return target;}
  const w=2*Math.PI*sp.f,n=Math.max(1,Math.ceil(dt*240)),h=dt/n;
  for(let i=0;i<n;i++){s.v+=(w*w*(target-s.x)-2*sp.z*w*s.v)*h;s.x+=s.v*h;}
  return s.x;
 };
 const walk=(key,value,dt,sp)=>typeof value==='number'?step(key,value,dt,sp)
  :Array.isArray(value)?value.map((v,i)=>walk(key+'.'+i,v,dt,sp))
  :Object.fromEntries(Object.entries(value).map(([k,v])=>[k,walk(key+'.'+k,v,dt,sp)]));
 return {settle:walk,forget(prefix){for(const k of [...state.keys()])if(k.startsWith(prefix))state.delete(k);}};
}

// A decal's own units, as the studio wrote them into its first UV (x/100, y/100; glTF turns v over), and its side: of the
// face's middle `mid` (between the eyes: a face is not always centred on the body's own middle).
function withLocal(g,name,mid=0){
 const P=g.attributes.position,UV=g.attributes.uv,n=P.count,local=new Float32Array(n*3);
 for(let i=0;i<n;i++){local[i*3]=UV.getX(i)*100;local[i*3+1]=(1-UV.getY(i))*100;local[i*3+2]=Math.sign(P.getX(i)-mid)||1;}
 g.setAttribute(name,new THREE.BufferAttribute(local,3));return g;
}

// The mouth's decal rides the jaw below the line between the lips and the head above it, smoothly by its own height (in
// its units): the export copies each point's jaw weight from the skin's nearest vertex, which is noisy, and an opening
// jaw then kinks the drawn lips at every vertex of the decal.
function smoothJaw(g,names){
 const head=names.indexOf('head'),jaw=names.indexOf('jaw'),UV=g.attributes.uv,n=UV.count;
 if(head<0||jaw<0)return g;
 const idx=new Uint16Array(n*4),w=new Float32Array(n*4);
 for(let i=0;i<n;i++){const y=(1-UV.getY(i))*100,k=THREE.MathUtils.smoothstep(-y,-1.5,3.5);idx[i*4]=head;idx[i*4+1]=jaw;w[i*4]=1-k;w[i*4+1]=k;}
 g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(idx,4));g.setAttribute('skinWeight',new THREE.BufferAttribute(w,4));
 return g;
}

export function dressPixar(body,{root,bones,order,shadows=true}){
 const rest=body.rest,face={};
 for(const name of FACE_BONES){if(!rest[name])continue;const b=new THREE.Bone();b.name=name;b.position.set(...rest[name]).sub(new THREE.Vector3(...rest.head));bones.head.add(b);face[name]=b;}
 const restOf=Object.fromEntries(Object.entries(face).map(([k,b])=>[k,b.position.clone()]));
 // The pose his skin was bound in (the card's `bind`: a turn per bone, Euler radians; the studio bakes his arms out
 // 35 degrees, the owner, 27 October 2026): the skeleton takes its inverses with those turns on, so a raised arm
 // stretches the armpit from there and not from arms-down; the bones then rest as World has them.
 const bind=body.card.bind||null;
 for(const [n,e] of Object.entries(bind||{}))bones[n]?.rotation.set(e[0],e[1],e[2]);
 root.updateMatrixWorld(true);
 const names=[...order,...Object.keys(face)],skeleton=new THREE.Skeleton(names.map(n=>bones[n]||face[n]));
 if(bind){for(const n of Object.keys(bind))bones[n]?.rotation.set(0,0,0);root.updateMatrixWorld(true);}
 // (bound with its own matrix given: three.js's bind() without one recalculates the skeleton's inverses from the bones as
 // they stand now, at rest, and would undo the bind pose above)
 const skinned=(g,m)=>{const mesh=new THREE.SkinnedMesh(g,m);mesh.frustumCulled=false;root.add(mesh);mesh.updateMatrixWorld(true);mesh.bind(skeleton,mesh.matrixWorld);return mesh;};
 // Shaded as every resident's face is (build.js buildHead): the town's high-key ramp, a little self-lit, so her pale skin
 // stays the pale skin of her film model and does not go brown in a shadow.
 const materials=[],meshes=body.parts.map(part=>{
  const source=part.kind==='hands'?new THREE.MeshStandardMaterial({vertexColors:true,roughness:.82,emissive:0xffffff,emissiveIntensity:.05})
   :new THREE.MeshStandardMaterial({map:part.map,roughness:.82,emissive:0xffffff,emissiveMap:part.map,emissiveIntensity:.05});
  const material=pixarSkin(celFrom(source,{bands:'soft3'}),{head:{y:body.card.measure.neckY,x:rest.head[0],z:rest.head[2],r:body.card.measure.Rh}});source.dispose();material.gradientMap=smoothRamp();
  // (the clothes are one surface of cloth: their insides show, at the sleeves, the collar and the hems)
  if(CLOTHES_PARTS.includes(part.kind))material.side=THREE.DoubleSide;
  material.name='Pixar '+body.name+' · '+part.kind;materials.push(material);
  const mesh=skinned(inOrder(body,part,names),material);
  mesh.name='Pixar '+body.name+' · '+part.kind;mesh.castShadow=shadows;mesh.receiveShadow=true;mesh.userData.pixarPart=part.kind;return mesh;
 });
 const clothes=meshes.filter(m=>CLOTHES_PARTS.includes(m.userData.pixarPart)),torso=meshes.filter(m=>m.userData.pixarPart==='torso');
 // Dressed: the clothes drawn and the trunk under them not; undressed, the other way round (a body without clothes
 // drawn dressed is itself).
 const dress=on=>{const wear=!!on&&clothes.length>0;for(const m of clothes)m.visible=wear;for(const m of torso)m.visible=!wear||!clothes.length;return wear;};
 let dressed=dress(pixarDressed());
 // Her eye (the studio's measures of the painted one, her lashes) drawn as World draws every rigged eye, on the town's ramp.
 const F=body.features,E=body.card.eyes,mid=E.centres?(E.centres[0][0]+E.centres[1][0])/2:0;
 const eyes=rigEyes(withLocal(inOrder(body,F.eyes,names).clone(),'eyeLocal',mid),{iris:E.colour,style:'pixar',own:{rx:E.rx,ry:E.ry,iris:E.iris,lash:E.lash,flick:E.flick,lashes:E.lashes},make:skinned,stand:STAND_IN,nearer:.0018});
 const brows=F.brows&&body.card.brows?rigBrows(withLocal(inOrder(body,F.brows,names).clone(),'featureLocal',mid),body.card.brows,{make:skinned,lines:actingOf(body.name)?.lines||0,taper:actingOf(body.name)?.browTaper||0}):null;
 const mouth=F.mouth&&body.card.mouth?rigMouth(smoothJaw(withLocal(inOrder(body,F.mouth,names).clone(),'featureLocal',mid),names),body.card.mouth,{make:skinned,lines:actingOf(body.name)?.lines||0}):null;
 // (the features shaded on the same blended ramp as her skin: stepped bands cut a lip or an eye into two tones)
 for(const m of [eyes.mesh,brows?.mesh,mouth?.mesh])if(m?.material?.isMeshToonMaterial)m.material.gradientMap=smoothRamp();
 // Each body acts its feelings its own way (face-acting.js), and gets from one to the next on springs of the feeling's own
 // timing: a wall clock, as paintFace has no step.
 const acting=actingOf(body.name),feelings=acting?.feelings||null,springs=faceSprings();
 let last=0,kind=-1;
 // The eye as the feeling draws it, then as she acts it: its size and iris scaled, the lids set (and squeezed), where she
 // looks (unless she is made to look somewhere: gaze), and in fright the irises shivering.
 const actEyes=(state,act,dt,sp,now,cheeks)=>{
  const P=eyes.params,e=act?.eyes||{};
  if(P[EYE_AT.kind]!==kind){kind=P[EYE_AT.kind];springs.forget('eye.');}
  const want={};
  for(const [k,by] of Object.entries(EYE_SCALE))want[k]=P[EYE_AT[k]]*(e[by]??1);
  for(const k of EYE_SET)want[k]=e[k]??P[EYE_AT[k]];
  if(Number.isFinite(e.tear))want.tear=e.tear;
  const got=springs.settle('eye',want,dt,sp);
  // (the overshoot of a take stays inside the eye's disc: the studio laid it 21 units below the eye's middle and 24
  // above, room for the lid and lash lines round the widest eye)
  for(const [k,v] of Object.entries(got))P[EYE_AT[k]]=k==='irx'||k==='iry'?Math.max(1,v):k==='pupil'?THREE.MathUtils.clamp(v,.1,1)
   :k==='ry'||k==='botAmp'?Math.min(v,14.5):k==='topAmp'?Math.min(v,16.5):k==='rx'?Math.min(v,14.5):v;
  // (an older face's crow's feet as the cheeks rise: a body's acting says it has the lines)
  if(acting?.lines)P[EYE_AT.crow]=acting.lines*THREE.MathUtils.smoothstep((cheeks[0]+cheeks[1])/2,.35,.9);
  if(e.look&&!state.gaze){P[EYE_AT.lookX]=e.look[0];P[EYE_AT.lookY]=e.look[1];}
  if(e.tremble&&api.smooth){const t=now/1000;P[EYE_AT.lookX]+=e.tremble*Math.sin(t*69.1);P[EYE_AT.lookY]+=e.tremble*.6*Math.sin(t*81.7+1);}
 };
 // The lips, for a glass or a morsel brought to them (table-drink.js avatarMouth, consume.js): the mouth decal's centre
 // at the bind, kept in the head's frame (the cartoon's mouth is a point on its drawn head; his is where his mouth is)
 const lips=mouth?.mesh?(()=>{const g=mouth.mesh.geometry;g.computeBoundingBox();const c=g.boundingBox.getCenter(new THREE.Vector3());
  mouth.mesh.updateWorldMatrix(true,false);mouth.mesh.localToWorld(c);bones.head.updateWorldMatrix(true,false);return bones.head.worldToLocal(c);})():null;
 const api={meshes:[...meshes,eyes.mesh,brows?.mesh,mouth?.mesh].filter(Boolean),eyes,brows,mouth,bones:face,smooth:true,acting,card:body.card,
  /** Where his lips are now (world), or null for a body without a rigged mouth. */
  mouthPoint(){if(!lips)return null;bones.head.updateWorldMatrix(true,false);return bones.head.localToWorld(lips.clone());},
  /** The same lips in the head bone's own frame (consume.js poses a drink or a morsel against them). */
  get lipsLocal(){return lips?lips.clone():null;},
  /** Dress or undress the body (its clothes on, the trunk under them left out; or the body in its underwear). */
  dress(on){dressed=dress(on);return dressed;},
  get dressed(){return dressed;},
  get clothes(){return clothes.map(m=>m.userData.pixarPart);},
  /** Follow the face: the eyes (gaze, blink, the feeling's lids), the brows, the mouth and the face's bones. */
  update(state){
   const act=feelings?.[state.expression]||null;
   eyes.update(act?.eyes?.as?{...state,eyesAs:act.eyes.as}:state);
   const now=globalThis.performance?.now?.()??0,dt=last?Math.min(.25,(now-last)/1000):1;last=now;
   const sp=api.smooth?springOf(acting,state.expression):null,target=featuresOf(state,feelings,acting?.mouth);
   // while she talks her brows rise and fall with it, one side a beat behind the other
   const talk=+state.talk||0;
   if(acting?.talkBrows&&talk>0&&api.smooth){const t=now/1000,a=acting.talkBrows*talk;
    target.brows.left[0]+=a*(.5+.5*Math.sin(t*10.7));target.brows.right[0]+=.8*a*(.5+.5*Math.sin(t*10.7-.6));}
   const f=springs.settle('face',target,dt,sp);
   for(const [k,[lo,hi]] of Object.entries(FEATURE_RANGE))f.mouth[k]=THREE.MathUtils.clamp(f.mouth[k],lo,hi);
   // (a brow stays on its decal, the spring's overshoot included: the studio left it room to rise, drop and pinch)
   for(const b of [f.brows.left,f.brows.right])(acting?.browRange||BROW_RANGE).forEach(([lo,hi],i)=>{b[i]=THREE.MathUtils.clamp(b[i],lo,hi);});
   f.jaw=THREE.MathUtils.clamp(f.jaw,0,1.15);f.cheeks=f.cheeks.map(v=>THREE.MathUtils.clamp(v,0,1.2));f.scrunch=THREE.MathUtils.clamp(f.scrunch,0,1.2);
   if(eyes.showing)actEyes(state,act,dt,sp,now,f.cheeks);
   brows?.set(f.brows.left,f.brows.right);mouth?.set(f.mouth);
   if(face.jaw)face.jaw.rotation.x=f.jaw*FACE_REACH.jaw;
   for(const [i,s,x] of [[0,'L',1],[1,'R',-1]])if(face['cheek'+s])face['cheek'+s].position.copy(restOf['cheek'+s]).add(new THREE.Vector3(x*FACE_REACH.cheek[2]*f.cheeks[i],FACE_REACH.cheek[0]*f.cheeks[i],FACE_REACH.cheek[1]*f.cheeks[i]));
   if(face.nose)face.nose.position.copy(restOf.nose).add(new THREE.Vector3(0,FACE_REACH.nose[0]*f.scrunch,FACE_REACH.nose[1]*f.scrunch));
  },
  // (shown again, dressed as he was: the trunk under his clothes stays out while he wears them)
  set visible(on){for(const m of meshes)m.visible=on;if(on)dress(dressed);},
  dispose(){for(const m of materials)m.dispose();eyes.dispose();brows?.dispose();mouth?.dispose();},
 };
 return api;
}
