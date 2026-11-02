// Face stickers (face-stamps.js): the recipe, World's own parts and the geometry that lays them on a face.
//   node camera/tests/face-stamps.test.mjs
import assert from 'node:assert/strict';
import {normaliseStamps,stampsActive,stampsSummary,faceSpace,moodLabel,browY,FACE,BROW_STYLES,BROW_LABELS,EYE_STYLES,EYE_COLOURS} from '../face-stamps.js';
import {PARTS,PALETTE} from '../../johansson-town/src/avatars/recipe.js';
import * as face from '../../johansson-town/src/avatars/face.js';
import {normalRecipe} from '../looks-gl.js';

let passed=0;const check=(name,fn)=>{fn();passed++;console.log('ok',name);};

check('the brows are every brow style the avatar creator has, and the eyes its own colours',()=>{
 assert.deepEqual([...BROW_STYLES,'none'],[...PARTS.brows]);
 for(const id of BROW_STYLES)assert.ok(BROW_LABELS[id],id);
 for(const c of EYE_COLOURS)assert.ok(PALETTE.eyes.includes(c.colour),c.id);
 for(const e of EYE_STYLES)assert.ok(PARTS.eyes.includes(e.style),e.style);
});

check('World draws them: the face painter exports its brow and eye, and the layout is its default face',()=>{
 assert.equal(typeof face.drawBrow,'function');assert.equal(typeof face.drawEye,'function');
 assert.equal(FACE.eyeY,104);assert.equal(FACE.spread,38);assert.equal(FACE.browY,70);assert.equal(FACE.browSpread,38);
});

check('a recipe without stickers is off, and odd values are kept within their ranges',()=>{
 const off=normaliseStamps(undefined);
 assert.deepEqual(off,{brows:{style:'none',mood:1.7,colour:'ink',size:1,height:0},eyes:{style:'none',colour:'brown',size:1},shine:0,
  hat:{id:'none',size:1,height:0},finish:'drawn'});
 assert.equal(stampsActive(off),false);assert.equal(stampsSummary(off),'Off');
 const odd=normaliseStamps({brows:{style:'monobrow',mood:9,colour:'#f00',size:-1,height:5},eyes:{style:'laser',size:9},shine:3,
  hat:{id:'../../etc/passwd',size:0},finish:'paint'});
 assert.equal(odd.brows.style,'none');assert.equal(odd.brows.mood,1.9);assert.equal(odd.brows.colour,'ink');assert.equal(odd.brows.size,.5);assert.equal(odd.brows.height,1);
 assert.equal(odd.eyes.style,'none');assert.equal(odd.eyes.size,1.6);assert.equal(odd.shine,1);
 assert.equal(odd.hat.id,'none','a hat is a sticker id, never a path');assert.equal(odd.hat.size,.6);assert.equal(odd.finish,'drawn');
 const on=normaliseStamps({brows:{style:'angled'},shine:.4,hat:{id:'halloween/witch-hat'},finish:'sticker'});
 assert.equal(stampsSummary(on),'Brows · Shine · Hat');assert.equal(on.finish,'sticker');
});

check('the renderer keeps the face stickers with the photo, so it re-edits as it was left',()=>{
 const r=normalRecipe({stamps:{brows:{style:'thick',mood:-1},eyes:{style:'heart'}}});
 assert.equal(r.stamps.brows.style,'thick');assert.equal(r.stamps.brows.mood,-1);assert.equal(r.stamps.eyes.style,'heart');
 assert.deepEqual(normalRecipe({}).stamps,normaliseStamps());
});

check('moods read as the avatar creator names them; cross brows come down and worried ones go up',()=>{
 assert.equal(moodLabel(-1),'Worried');assert.equal(moodLabel(0),'Calm');assert.equal(moodLabel(1.4),'Cross');assert.equal(moodLabel(1.9),'Evil');
 const at=mood=>browY(normaliseStamps({brows:{style:'thin',mood}}).brows);
 assert.ok(at(1.9)>at(0)&&at(0)>at(-1.5),'canvas y grows downward');
 assert.ok(browY(normaliseStamps({brows:{style:'thin',mood:0,height:1}}).brows)<at(0),'Height raises them');
});

check('the residents’ face is laid on the photo’s two eyes, and a hat above them, at any tilt',()=>{
 // A 1000 × 1000 photo, the face box in the middle, eyes level at 40% of its height.
 const level=faceSpace({x:.3,y:.3,w:.4,h:.4,angle:0,eyes:[{x:.3,y:.4},{x:.7,y:.4}]},1000,1000);
 assert.deepEqual(level.left.map(Math.round),[420,460]);assert.deepEqual(level.right.map(Math.round),[580,460]);
 assert.equal(Math.round(level.dist),160);assert.equal(level.angle,0);
 assert.ok(level.crown[1]<level.mid[1]-200&&Math.abs(level.crown[0]-500)<1e-9,'the crown is above the eyes');
 assert.equal(Math.round(level.headWidth),384);
 // Tilted 20 degrees: the eye line turns with it, and up turns too.
 const tilt=faceSpace({x:.3,y:.3,w:.4,h:.4,angle:20,eyes:[{x:.3,y:.4},{x:.7,y:.4}]},1000,1000);
 assert.ok(Math.abs(tilt.angle-20*Math.PI/180)<1e-9);assert.ok(tilt.crown[0]>tilt.mid[0],'a head tilted clockwise has its crown to the right');
 // Eyes dragged past each other are still read left to right as seen.
 const swapped=faceSpace({x:.3,y:.3,w:.4,h:.4,angle:0,eyes:[{x:.7,y:.4},{x:.3,y:.4}]},1000,1000);
 assert.deepEqual(swapped.left,level.left);
 assert.equal(faceSpace(null,1000,1000),null);assert.equal(faceSpace({x:.3,y:.3,w:.4,h:.4},0,10),null);
});

console.log(`face-stamps: ${passed} checks passed`);
