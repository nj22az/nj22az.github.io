import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {BONES} from '../src/avatars/build.js';
import {EXPRESSION_NAMES} from '../src/avatars/face.js';
import {eyeShape,EYES_3D_STATES} from '../src/avatars/eyes3d.js';
import {featuresOf,MOUTH_KEYS,BROW_KEYS} from '../src/avatars/face-features.js';
import {actingOf,springOf} from '../src/avatars/face-acting.js';
import {PIXAR_BODIES,pixarWanted,pixarDressed,CLOTHES_PARTS} from '../src/avatars/pixar.js';

// Pixar Johansson in World (src/avatars/pixar.js; the owner, 26 October 2026: "Fix Johansson's blockers and bring him into
// the game"). His model and card come from the studio repo (jojo 3d/cast/game_johansson.py) into assets/avatars/pixar/.

const root=new URL('../assets/',import.meta.url),{path,version}=PIXAR_BODIES.Johansson;
const glb=readFileSync(new URL(path+'.glb',root)),card=JSON.parse(readFileSync(new URL(path+'.json',root),'utf8'));
function gltfJSON(bytes){
 assert.equal(bytes.toString('ascii',0,4),'glTF');
 const n=bytes.readUInt32LE(12);assert.equal(bytes.toString('ascii',16,20),'JSON');
 return JSON.parse(bytes.toString('utf8',20,20+n));
}

test('his model is the version the game asks for, light enough for a phone',()=>{
 assert.equal(createHash('sha256').update(glb).digest('hex').slice(0,version.length),version,'PIXAR_BODIES version is the GLB\'s hash');
 assert.ok(glb.length<2.6*1024*1024,`GLB ${glb.length} bytes`);
 const j=gltfJSON(glb);
 const tris={};for(const m of j.meshes)for(const p of m.primitives){const n=j.materials[p.material].name;tris[n]=(tris[n]||0)+j.accessors[p.indices].count/3;}
 const all=Object.values(tris).reduce((a,b)=>a+b,0),dressed=all-(tris.torso||0);
 // (dressed, the trunk under his clothes is not drawn: what the game draws of him is the rest)
 assert.ok(dressed<=26000,`${dressed} triangles drawn dressed`);
 assert.ok(all<=32000,`${all} triangles in all`);
 assert.equal(j.images.length,2,'two textures: his body\'s and his clothes\'');
 for(const want of ['body','torso','shirt','shorts','eyes','brows','mouth'])assert.ok(tris[want]>0,'a '+want+' primitive');
});

test('his clothes: a shirt and shorts on his own bones, over a body of his own in boxer briefs',()=>{
 // (the owner, 26 October 2026: "Make a nude rig with underwear for Johansson then rig the Hawaii shirt")
 assert.deepEqual(card.clothes.parts,CLOTHES_PARTS);assert.equal(card.clothes.hidden,'torso');assert.ok(card.clothes.underwear.startsWith('#'));
 const j=gltfJSON(glb),known=new Set([...BONES,'jaw','nose','cheekL','cheekR']);
 const prim=name=>j.meshes.flatMap(m=>m.primitives.map(p=>({m,p}))).find(({p})=>j.materials[p.material].name===name);
 const box=name=>{const a=j.accessors[prim(name).p.attributes.POSITION];return {min:a.min,max:a.max};};
 const image=name=>j.textures[j.materials[prim(name).p.material].pbrMetallicRoughness.baseColorTexture.index].source;
 assert.notEqual(image('shirt'),image('body'),'the clothes have their own texture (the body\'s is repainted under them)');
 assert.equal(image('shirt'),image('shorts'));assert.equal(image('torso'),image('body'));
 // each part skinned to World's bones; the shirt moves with his chest and arms, the shorts with his hips and legs
 const nodeOf=m=>j.nodes.find(n=>n.mesh===j.meshes.indexOf(m));
 const jointsOf=name=>{const {m,p}=prim(name);assert.ok(p.attributes.JOINTS_0&&p.attributes.WEIGHTS_0,name+' is skinned');
  return new Set(j.skins[nodeOf(m).skin].joints.map(i=>j.nodes[i].name));};
 for(const name of ['shirt','shorts','torso'])for(const b of jointsOf(name))assert.ok(known.has(b),name+': unknown bone '+b);
 // (the shirt and the shorts over the trunk under them: the trunk inside the clothes' outline)
 const t=box('torso'),sh=box('shirt'),so=box('shorts');
 const out={min:[0,1,2].map(i=>Math.min(sh.min[i],so.min[i])),max:[0,1,2].map(i=>Math.max(sh.max[i],so.max[i]))};
 for(const i of [0,2])assert.ok(t.min[i]>=out.min[i]-.005&&t.max[i]<=out.max[i]+.005,`the trunk inside the clothes (axis ${i})`);
 assert.ok(t.max[1]<=out.max[1]+.005&&t.min[1]>=out.min[1]-.005,'and under their top and above their hems');
 // a page shows him dressed unless it asks for the body under the clothes
 assert.equal(pixarDressed(''),true);assert.equal(pixarDressed('?pixarClothes=0'),false);
});

test('the body under his clothes has no face turned inside out (World leaves those out: a hole)',()=>{
 // (fitting his body under the shorts once crossed seven faces over between his legs: holes, undressed)
 const j=gltfJSON(glb),bin=20+glb.readUInt32LE(12)+8;
 const read=i=>{const a=j.accessors[i],v=j.bufferViews[a.bufferView],n=a.count*({SCALAR:1,VEC3:3}[a.type]);
  const at=bin+(v.byteOffset||0)+(a.byteOffset||0),T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array}[a.componentType];
  return new T(glb.buffer.slice(glb.byteOffset+at,glb.byteOffset+at+n*T.BYTES_PER_ELEMENT));};
 for(const m of j.meshes)for(const p of m.primitives){
  const name=j.materials[p.material].name;if(name!=='body'&&name!=='torso')continue;
  const P=read(p.attributes.POSITION),N=read(p.attributes.NORMAL),I=read(p.indices),out=[];let slight=0;
  for(let f=0;f<I.length;f+=3){
   const [a,b,c]=[I[f],I[f+1],I[f+2]],e=k=>[P[3*b+k]-P[3*a+k],P[3*c+k]-P[3*a+k]];
   const [ux,vx]=e(0),[uy,vy]=e(1),[uz,vz]=e(2),n=[uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx];
   // (the face's own facing against its corners' normals: below -0.25 it is turned over, a hole; just under 0, a crease)
   const area=Math.hypot(...n)/2,dot=[0,1,2].reduce((s,k)=>s+n[k]*(N[3*a+k]+N[3*b+k]+N[3*c+k]),0)/(6*area||1);
   if(area<4e-6||dot>=0)continue;
   if(dot<-.25)out.push([0,1,2].map(k=>((P[3*a+k]+P[3*b+k]+P[3*c+k])/3).toFixed(3)).join(','));else slight++;
  }
  assert.deepEqual(out,[],`${name}: faces inside out at ${out.slice(0,4).join(' ; ')}`);
  // (no more creases than the sculpt had before it was undressed, or Thuận's has: three)
  assert.ok(slight<=3,`${name}: ${slight} faces folded at creases`);
 }
});

test('he is skinned to World\'s own bones (and the face\'s), with no braids',()=>{
 const j=gltfJSON(glb),joints=new Set(j.skins.flatMap(s=>s.joints.map(i=>j.nodes[i].name)));
 const known=new Set([...BONES,'jaw','nose','cheekL','cheekR']);
 for(const n of joints)assert.ok(known.has(n),'unknown bone '+n);
 for(const n of ['hips','spine','chest','neck','head','shoulderL','elbowL','handL','thighR','kneeR','footR','jaw'])assert.ok(joints.has(n),'no '+n);
 for(const n of joints)assert.ok(!n.startsWith('braid'),'a braid bone: '+n);
 for(const n of [...joints])assert.ok(Array.isArray(card.rest[n])&&card.rest[n].every(Number.isFinite),'rest of '+n);
 assert.ok(Math.abs(card.measure.H-1.6768)<.01,'his height is World\'s Johansson\'s');
 assert.ok(card.rest.footL[1]>0&&card.rest.footL[1]<.15&&card.rest.head[1]>1.3,'feet low, head high');
 assert.equal(card.measure.hipY,card.rest.hips[1],'the hips bone is where World\'s animation puts it');
 // his elbow at his elbow (the film landmark was mid-forearm): the upper arm longer than the forearm, both a man's
 assert.ok(card.measure.upper>card.measure.fore*.9&&card.measure.upper>.2&&card.measure.fore>.18,`upper ${card.measure.upper} fore ${card.measure.fore}`);
});

test('every page draws him unless it asks for the cartoon',()=>{
 assert.equal(pixarWanted('Johansson',''),true);
 assert.equal(pixarWanted('Johansson','?pixar=0'),false);
 assert.equal(pixarWanted('Johansson','?pixar=johansson'),true);
 assert.equal(pixarWanted('Johansson','?pixar=thuan'),false);
});

test('his face: his own eyes, brows each his own, his mouth clear of his nose',()=>{
 const own={rx:card.eyes.rx,ry:card.eyes.ry,iris:card.eyes.iris,lash:card.eyes.lash,flick:card.eyes.flick,lashes:card.eyes.lashes};
 for(const eyes of EYES_3D_STATES)for(const v of Object.values(eyeShape('pixar',eyes,own)))assert.ok(Number.isFinite(v),eyes);
 assert.ok(card.eyes.centres.length===2&&card.eyes.colour.startsWith('#'));
 assert.notDeepEqual(card.brows.left.line,card.brows.right.line,'his brows are not mirrored');
 // his eyes the same distance either side of his sculpted nose (the concept's projection put the right one on its bridge)
 const [r,l]=card.eyes.centres;
 assert.ok(Math.abs(r[0]+l[0])<.004&&Math.abs(r[1]-l[1])<.004,'his eyes are set about his nose');
 // clean-shaven (the owner, 26 October 2026: "Remove the goatee"; "Remove moustache give him a mouth back")
 assert.equal(card.mouth.moustache,undefined,'no moustache');
 assert.ok(card.mouth.half>0&&[card.mouth.line,card.mouth.upper,card.mouth.lower].every(c=>c.length===5&&c.every(Number.isFinite)));
 // his mouth a third of the way from his nose to his chin, its middle under his nose ("Bring the mouth further down so
 // it's more visible"): the mouth's decal stays below the nose's underside (at 1.468 m)
 const j=gltfJSON(glb),prim=j.meshes.flatMap(m=>m.primitives).find(p=>j.materials[p.material].name==='mouth'),pos=j.accessors[prim.attributes.POSITION];
 assert.ok(pos.max[1]<1.462&&pos.min[1]>1.39,`the mouth's decal from ${pos.min[1]} to ${pos.max[1]} m`);
 assert.ok(Math.abs(pos.max[0]+pos.min[0])<.004,'centred under his nose');
 assert.equal(card.brows.colour,'#3d322c','his brows warm charcoal-brown (the owner\'s brief)');
});

test('he acts his feelings his own way, inside his decals, never as a mirror',()=>{
 const acting=actingOf('Johansson'),A=acting.feelings;
 for(const [expression,act] of Object.entries(A)){
  assert.ok(EXPRESSION_NAMES.includes(expression),expression);
  for(const k of Object.keys(act.mouth||{}))assert.ok(MOUTH_KEYS.includes(k),expression+' mouth '+k);
  const sp=springOf(acting,expression);assert.ok(sp.f>0&&sp.z>0);
  for(const talk of [0,1]){
   const f=featuresOf({expression,talk},A);
   const range=[[-3.2,11],[-9.5,24],[-1.6,3],[0,3.6],[-4,10],[0,1],[0,.8]];   // (pixar.js BROW_RANGE)
   for(const b of [f.brows.left,f.brows.right]){assert.equal(b.length,BROW_KEYS.length);range.forEach(([lo,hi],i)=>assert.ok(b[i]>=lo&&b[i]<=hi,expression+' brow '+BROW_KEYS[i]));}
   assert.ok(f.mouth.open>=0&&f.mouth.open<=14,expression);
  }
  if(expression!=='neutral'&&act.brows)assert.notDeepEqual(act.brows.left,act.brows.right,expression+' is not twinned');
 }
 // an older face's lines (the forehead's, crow's feet, smile lines) are his, not hers
 assert.ok(acting.lines>0&&!actingOf('Thuan').lines);
 // evil brows (the owner: "he should be able to do "evil " angry eyebrows"): his brows slope down to the outside at rest;
 // angry, the inner ends come down below the outer ends, a V (the shader's line, face-features.js browY)
 const poly=(c,x)=>c.reduce((a,k)=>a*x+k,0);
 const ends=(shape,b)=>{const [lift,tilt,arch,,outer,straight]=b;
  return [poly(shape.line,shape.x0)+lift-tilt,poly(shape.line,shape.x1)+lift+tilt*.3*(1-straight)+outer];};
 for(const side of ['left','right']){
  const [inner0,outer0]=ends(card.brows[side],featuresOf({expression:'neutral'},A).brows[side]);
  assert.ok(inner0>outer0+5,'at rest his '+side+' brow slopes down to the outside');
  for(const expression of ['angry','fuming','raging','scheme']){
   const [inner,outer]=ends(card.brows[side],featuresOf({expression},A).brows[side]);
   assert.ok(outer>inner+4,`${expression}: his ${side} brow a V (inner ${inner.toFixed(1)}, outer ${outer.toFixed(1)})`);
  }
 }
 // his own: a drier, slower take than hers
 const her=actingOf('Thuan');
 assert.ok(springOf(acting,'shock').f<springOf(her,'shock').f,'his shock is a beat slower');
 assert.notDeepEqual(A.angry,her.feelings.angry,'his anger is not hers');
});
