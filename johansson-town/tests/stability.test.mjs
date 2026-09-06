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
assert.equal(townBoundsBlocked(10,-56,.28),false,'harbour promenade must remain accessible');
const sweep=sweepFraction({x:0,z:0},{x:5,z:0},x=>x>=2,.1);
assert.ok(sweep>.35&&sweep<.4,`camera sweep stopped at unexpected fraction ${sweep}`);

for(const file of ['main.js','world.js','characters.js','activities.js']){
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

console.log('Johansson Town stability regression tests: PASS');
