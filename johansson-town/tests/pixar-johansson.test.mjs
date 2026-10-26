import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {BONES} from '../src/avatars/build.js';
import {EXPRESSION_NAMES} from '../src/avatars/face.js';
import {eyeShape,EYES_3D_STATES} from '../src/avatars/eyes3d.js';
import {featuresOf,MOUTH_KEYS} from '../src/avatars/face-features.js';
import {actingOf,springOf} from '../src/avatars/face-acting.js';
import {PIXAR_BODIES,pixarWanted} from '../src/avatars/pixar.js';

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
 assert.ok(glb.length<2.2*1024*1024,`GLB ${glb.length} bytes`);
 const j=gltfJSON(glb);
 let triangles=0;for(const m of j.meshes)for(const p of m.primitives)triangles+=j.accessors[p.indices].count/3;
 assert.ok(triangles<=24000,`${triangles} triangles`);
 assert.equal(j.images.length,1,'one texture');
 const names=j.meshes.flatMap(m=>m.primitives.map(p=>j.materials[p.material].name));
 for(const want of ['body','eyes','brows','mouth'])assert.ok(names.includes(want),'a '+want+' primitive');
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
   for(const b of [f.brows.left,f.brows.right])assert.ok(b[0]>=-3.2&&b[0]<=11&&b[1]>=-9.5&&b[1]<=10.6&&b[2]>=-1.6&&b[2]<=3&&b[3]>=0&&b[3]<=3.2,expression+' brow');
   assert.ok(f.mouth.open>=0&&f.mouth.open<=14,expression);
  }
  if(expression!=='neutral'&&act.brows)assert.notDeepEqual(act.brows.left,act.brows.right,expression+' is not twinned');
 }
 // an older face's lines (the forehead's, crow's feet, smile lines) are his, not hers
 assert.ok(acting.lines>0&&!actingOf('Thuan').lines);
 // his own: a drier, slower take than hers
 const her=actingOf('Thuan');
 assert.ok(springOf(acting,'shock').f<springOf(her,'shock').f,'his shock is a beat slower');
 assert.notDeepEqual(A.angry,her.feelings.angry,'his anger is not hers');
});
