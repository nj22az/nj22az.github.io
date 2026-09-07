import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'..');
const physicsSource=await readFile(resolve(root,'physics.js'),'utf8');
const physics=await import(`data:text/javascript;base64,${Buffer.from(physicsSource).toString('base64')}`);
const {circleHitsRect,circleHitsCircle,roomBoundsBlocked,townBoundsBlocked,sweepFraction}=physics;

assert.equal(circleHitsRect(0,0,.28,{x:1,z:0,w:1,d:1}),false,'clear space must remain clear');
assert.equal(circleHitsRect(.3,0,.28,{x:1,z:0,w:1,d:1}),true,'inflated prop collision must stop the player');
assert.equal(circleHitsCircle(0,0,.28,.7,0,.35),false,'separated residents must not collide');
assert.equal(circleHitsCircle(0,0,.28,.5,0,.35),true,'resident overlap must be blocked');
assert.equal(roomBoundsBlocked(0,0,.28),false);
assert.equal(roomBoundsBlocked(5.5,0,.28),true,'room wall radius must be respected');
assert.equal(townBoundsBlocked(0,0,.28),false);
assert.equal(townBoundsBlocked(6.9,0,.28),true,'shopping-street edge must be solid');
assert.equal(townBoundsBlocked(10,-56,.28),false,'harbour apron must remain accessible');
assert.equal(townBoundsBlocked(0,-75,.28),false,'outer harbour pier must be walkable');
assert.equal(townBoundsBlocked(3.7,-75,.28),false,'pier usable width must remain accessible');
assert.equal(townBoundsBlocked(4.0,-75,.28),true,'pier side must stop the player before the water');
assert.equal(townBoundsBlocked(0,-79,.28),true,'pier end must stop the player before open water');
const sweep=sweepFraction({x:0,z:0},{x:5,z:0},x=>x>=2,.1);
assert.ok(sweep>.35&&sweep<.4,`camera sweep stopped at unexpected fraction ${sweep}`);

for(const file of ['main.js','main-professional.js','world.js','world-professional.js','characters.js','characters-cel.js','characters-aaa.js','activities.js']){
  const source=await readFile(resolve(root,file),'utf8');
  const refs=[...source.matchAll(/(?:from\s+|import\()['"]([^'"]+)["']/g)].map(m=>m[1]);
  for(const ref of refs){if(!ref.startsWith('.'))continue;const clean=ref.split('?')[0];await access(resolve(root,clean));}
}

const main=await readFile(resolve(root,'main.js'),'utf8');
assert.match(main,/sweepFraction/,'third-person camera must use swept collision');
assert.match(main,/residentBlocked/,'NPCs must participate in player collision');
assert.doesNotMatch(main,/import\('\.\/characters\.js/,'characters must not stream asynchronously after play begins');

const professional=await readFile(resolve(root,'world-professional.js'),'utf8');
assert.match(professional,/replaceCableLines/,'professional layer must replace raster-thin utility lines');
assert.match(professional,/InstancedMesh/,'replacement cables must be batched');
assert.doesNotMatch(professional,/new THREE\.Line\(/,'professional layer must not introduce new raster line primitives');
assert.doesNotMatch(professional,/LineBasicMaterial/,'professional layer must not use one-pixel line materials');
assert.match(professional,/walkableOuterPier:true/,'professional layer must report walkable pier support');
assert.match(professional,/computeVertexNormals/,'animated cel water must refresh normals');

const boot=await readFile(resolve(root,'main-professional.js'),'utf8');
assert.match(boot,/newMin=-82,newSpan=144/,'minimap projection must include the outer pier');
assert.match(boot,/paintedHarbour=false/,'minimap harbour overlay must reset each frame');
assert.match(boot,/main\.js\?v=13-base/,'professional wrapper must load the stable gameplay module exactly once');

const local=await readFile(resolve(root,'characters.js'),'utf8');
for(const name of ['player','Aiko','Kenji','Mrs Sato','Harbour master'])assert.match(local,new RegExp(name.replace(' ','\\s')),`local cast must retain ${name}`);
assert.match(local,/hero:true/,'Johansson must have a dedicated hero body/wardrobe branch');
assert.match(local,/blouse:true/,'Aiko must have dedicated blouse geometry');
assert.match(local,/workwear:true/,'Kenji must have dedicated workwear geometry');
assert.match(local,/cardigan:true/,'Mrs Sato must have dedicated cardigan geometry');
assert.match(local,/apron:true/,'Mrs Sato must have dedicated apron geometry');
assert.match(local,/coat:true/,'harbour master must have dedicated coat geometry');
assert.match(local,/peakedCap:true/,'harbour master must have dedicated cap geometry');
assert.match(local,/moustache:true/,'harbour master must have distinct facial geometry');
assert.match(local,/hairStyle:'ponytail'/,'Aiko must keep her own hair silhouette');
assert.match(local,/hairStyle:'crop'/,'Kenji must keep his own hair silhouette');
assert.match(local,/hairStyle:'bun'/,'Mrs Sato must keep her own hair silhouette');
assert.match(local,/hairStyle:'receding'/,'harbour master must keep his own hair silhouette');
assert.doesNotMatch(local,/satchel:true|suitcase:true/,'Johansson must not carry a suitcase or satchel');
assert.match(local,/head:\[/,'cast identities must include distinct head proportions, not palette swaps');
assert.match(local,/stride:/,'cast identities must include distinct movement cadence, not palette swaps');

const aaa=await readFile(resolve(root,'characters-aaa.js'),'utf8');
assert.match(aaa,/stable-local-authored/,'runtime must use the stable individually authored cast');
assert.match(aaa,/createStableCharacters/,'runtime must delegate to stable local character rigs');
assert.doesNotMatch(aaa,/GLTFLoader|AnimationMixer|raw\.githubusercontent/,'unstable remote skinned actors must not be active at runtime');
assert.match(aaa,/stageConversation/,'dialogue must stage spacing and facing explicitly');
assert.match(aaa,/targetDistance=1\.34/,'dialogue must maintain a deliberate conversational gap');
assert.match(aaa,/jumpVelocity/,'Johansson must retain deterministic jump physics');
assert.match(aaa,/__JOHANSSON_JUMP__/,'Johansson jump must remain externally callable by the touch control');

const index=await readFile(resolve(root,'index.html'),'utf8');
assert.match(index,/characters-aaa\.js\?v=20/,'boot import map must select the current stable individual cast');
assert.match(index,/preloadCharacters/,'character system must initialise before gameplay');
assert.ok(index.indexOf('preloadCharacters')<index.indexOf("import('./main.js?v=15')"),'cast initialisation must complete before gameplay starts');
assert.match(index,/id="jump"/,'touch HUD must expose a dedicated Johansson jump button');
assert.match(index,/character-controls\.css/,'jump control styling must be loaded');

console.log('Johansson Town stability regression tests: PASS');
