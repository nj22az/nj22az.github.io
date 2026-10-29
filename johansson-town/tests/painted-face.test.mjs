import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {frameFor,rigPaintedFace,paintedFaceWanted} from '../src/avatars/painted-face.js';

// Thuận 2.0's painted face in World (src/avatars/painted-face.js; the owner, 29 October 2026: "How to bring Thuan 2.0 To
// the game ?", "Try and show me progress"): a prototype behind ?face=painted.

test('asked for only with ?face=painted',()=>{
 assert.equal(paintedFaceWanted('?face=painted'),true);
 assert.equal(paintedFaceWanted('?audit&face=painted'),true);
 assert.equal(paintedFaceWanted(''),false);
 assert.equal(paintedFaceWanted('?face=rig'),false);
});

test('a frame for every face state: shut in a blink, happy when the feeling smiles, else neutral',()=>{
 assert.equal(frameFor({blink:1}),'blink');
 assert.equal(frameFor({blinkLeft:1,blinkRight:1}),'blink');
 assert.equal(frameFor({blinkLeft:1,blinkRight:0}),'neutral','a wink is not a blink');
 assert.equal(frameFor({expression:'happy'}),'happy');
 assert.equal(frameFor({},{mouth:{smile:.8}}),'happy');
 assert.equal(frameFor({},{mouth:{smile:.2}}),'neutral');
 assert.equal(frameFor({expression:'happy',blink:1}),'blink','a blink shuts a happy face too');
 assert.equal(frameFor({expression:'happy'},null,['neutral']),'neutral','only the frames it has');
});

test('the grid\'s UVs land on the frame painted for them',()=>{
 const aspect=.907407,card={aspect,frames:['neutral','happy','blink']};
 const g=new THREE.PlaneGeometry(1,1);
 const tex=new THREE.Texture();
 const face=rigPaintedFace(g,card,tex);
 const map=face.mesh.material.map;
 const at=(u,v)=>{map.updateMatrix();return new THREE.Vector2(u,v).applyMatrix3(map.matrix);};
 // (glTF's v from the window's top over its width: the window's bottom-left corner is (0, 1), its top-right (1, 1 - aspect))
 let p=at(0,1);assert.ok(Math.abs(p.x)<1e-6&&Math.abs(p.y)<1e-6,`bottom-left ${p.x},${p.y}`);
 p=at(1,1-aspect);assert.ok(Math.abs(p.x-1/3)<1e-6&&Math.abs(p.y-1)<1e-6,`top-right ${p.x},${p.y}`);
 face.set('happy');assert.equal(face.frame,'happy');
 p=at(0,1);assert.ok(Math.abs(p.x-1/3)<1e-6,`happy starts a third along: ${p.x}`);
 face.set('blink');p=at(1,1);assert.ok(Math.abs(p.x-1)<1e-6,`blink ends at the strip's end: ${p.x}`);
 face.set('nonsense');assert.equal(face.frame,'blink','an unknown frame leaves the face as it is');
 assert.equal(face.mesh.material.transparent,true);assert.equal(face.mesh.material.depthWrite,false);
 face.dispose();
});
