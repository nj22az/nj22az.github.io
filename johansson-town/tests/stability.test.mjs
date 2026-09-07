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
  for(const ref of refs){
    if(!ref.startsWith('.'))continue;
    const clean=ref.split('?')[0];
    await access(resolve(root,clean));
  }
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

const aaa=await readFile(resolve(root,'characters-aaa.js'),'utf8');
assert.match(aaa,/MakeHuman \/ MPFB2/,'high-detail cast must retain its CC0 source declaration');
assert.match(aaa,/new THREE\.AnimationMixer/,'high-detail cast must use skeletal animation mixers');
for(const clip of ['idle','walk','run','wave'])assert.match(aaa,new RegExp(`['"]${clip}['"]`),`character cast must retain ${clip} animation support`);
for(const name of ['player','Aiko','Kenji','Mrs Sato','Harbour master'])assert.match(aaa,new RegExp(name.replace(' ','\\s')),`high-detail cast must retain unique ${name} profile`);
assert.match(aaa,/createFallbackCharacters/,'high-detail characters must retain a deterministic local fallback');
assert.match(aaa,/suited\.glb/,'player must use the authored suited MakeHuman source');
assert.match(aaa,/human\.glb/,'female MakeHuman source must remain available');
assert.match(aaa,/man\.glb/,'male MakeHuman source must remain available');
assert.match(aaa,/speaker\.glb/,'alternate MakeHuman source must remain available');
assert.match(aaa,/sanitiseClip/,'character locomotion must sanitise authored root motion');
assert.match(aaa,/locomotionSpeed/,'character locomotion must time gait against authored travel speed');
assert.match(aaa,/desiredState/,'character locomotion must use stable state selection');
assert.match(aaa,/jumpVelocity/,'Johansson must retain deterministic jump physics');
assert.match(aaa,/__JOHANSSON_JUMP__/,'Johansson jump must remain externally callable by the touch control');
assert.doesNotMatch(aaa,/satchel:true/,'Johansson must not restore the intersecting curved satchel strap');

const index=await readFile(resolve(root,'index.html'),'utf8');
assert.match(index,/characters-aaa\.js\?v=18/,'boot import map must select the current high-detail cast');
assert.match(index,/preloadCharacters/,'high-detail cast must preload before gameplay');
assert.ok(index.indexOf('preloadCharacters')<index.indexOf("import('./main.js?v=15')"),'cast preload must complete before the gameplay module starts');
assert.match(index,/25000/,'boot watchdog must allow the high-detail mobile preload window');
assert.match(index,/id="jump"/,'touch HUD must expose a dedicated Johansson jump button');
assert.match(index,/character-controls\.css/,'jump control styling must be loaded');

console.log('Johansson Town stability regression tests: PASS');