import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {frameFor,rigPaintedFace,paintedFaceWanted,FRAME_OF} from '../src/avatars/painted-face.js';
import {EXPRESSION_NAMES} from '../src/avatars/face.js';
import {PIXAR_BODIES} from '../src/avatars/pixar.js';

// Thuận 2.0's painted face in World (src/avatars/painted-face.js; the owner, 29 October 2026: "How to bring Thuan 2.0 To
// the game ?", "Try and show me progress", "Do all"): a prototype behind ?face=painted. Its frames and irises come from
// the studio (jojo 3d/cast/thuan_paint.py game-frames) into assets/avatars/pixar/.

const dir=new URL('../assets/avatars/pixar/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('thuan-face.json',dir),'utf8')),card=JSON.parse(readFileSync(new URL('thuan.json',dir),'utf8'));
function pngSize(file){const b=readFileSync(new URL(file,dir));assert.equal(b.toString('ascii',1,4),'PNG');return [b.readUInt32BE(16),b.readUInt32BE(20)];}

test('asked for only with ?face=painted',()=>{
 assert.equal(paintedFaceWanted('?face=painted'),true);
 assert.equal(paintedFaceWanted('?audit&face=painted'),true);
 assert.equal(paintedFaceWanted(''),false);
 assert.equal(paintedFaceWanted('?face=rig'),false);
});

test('her card points at the frames, and the frames fit a phone',()=>{
 assert.equal(card.facePaint?.manifest,'thuan-face.json');
 for(const key of ['over','under']){
  const m=manifest[key],[w,h]=pngSize(m.file);
  assert.equal(w,m.cols*m.slot[0],key+' width');assert.equal(h,m.rows*m.slot[1],key+' height');
  assert.ok(w<=4096&&h<=4096,`${key} ${w}x${h} within a phone's texture size`);
 }
 assert.ok(manifest.frames.length<=manifest.over.cols*manifest.over.rows,'every frame has an over slot');
 assert.ok(manifest.under.iris<manifest.under.cols*manifest.under.rows,'the irises have an under slot');
 const bytes=statSync(new URL(manifest.over.file,dir)).size+statSync(new URL(manifest.under.file,dir)).size;
 assert.ok(bytes<2*1024*1024,`${bytes} bytes of paint`);
});

test('the face\'s version is its files\' hash (new expressions are fetched fresh)',()=>{
 const h=createHash('sha256');for(const f of ['thuan-face.json',manifest.over.file,manifest.under.file])h.update(readFileSync(new URL(f,dir)));
 const face=PIXAR_BODIES.Thuan.face;assert.equal(h.digest('hex').slice(0,face.length),face,'PIXAR_BODIES.Thuan.face');
});

test('every feeling World knows has a painted frame',()=>{
 for(const want of new Set(Object.values(FRAME_OF)))assert.ok(manifest.frames.includes(want),'no frame '+want);
 for(const expression of EXPRESSION_NAMES){
  const f=frameFor({expression},manifest.frames);
  assert.ok(manifest.frames.includes(f),expression+' draws '+f);
 }
 assert.equal(frameFor({expression:'laugh'},manifest.frames),'laugh');
 assert.equal(frameFor({expression:'surprised'},manifest.frames),'surprised');
 assert.equal(frameFor({expression:'nonsense'},manifest.frames),'neutral');
});

test('shut in a blink, a wink when one eye shuts',()=>{
 const F=manifest.frames;
 assert.equal(frameFor({blink:1},F),'blink');
 assert.equal(frameFor({blinkLeft:1,blinkRight:1,expression:'happy'},F),'blink','a blink shuts a happy face too');
 assert.equal(frameFor({blinkLeft:0,blinkRight:1},F),'wink');
 assert.equal(frameFor({blink:.3,expression:'sad'},F),'sad');
 assert.equal(frameFor({expression:'happy'},['neutral']),'neutral','only the frames it has');
});

test('a frame and a gaze set the shader\'s slots and irises; a held frame stays',()=>{
 const g=new THREE.PlaneGeometry(1,1),face=rigPaintedFace(g,card.facePaint,{manifest,over:new THREE.Texture(),under:new THREE.Texture()});
 const slot=n=>{const i=manifest.frames.indexOf(n);return [i%manifest.over.cols,Math.floor(i/manifest.over.cols),i%manifest.under.cols,Math.floor(i/manifest.under.cols)];};
 assert.equal(face.frame,'neutral');assert.deepEqual(face.slots.toArray(),slot('neutral'));
 face.set('angry');assert.equal(face.frame,'angry');assert.deepEqual(face.slots.toArray(),slot('angry'));
 face.set('nonsense');assert.equal(face.frame,'angry','an unknown frame leaves the face as it is');
 // (World's gaze: x toward her left, y down; the irises move in metres on the face, up is +z)
 const [rx,rz]=manifest.irisRange;
 face.look(1,0);assert.ok(Math.abs(face.gaze.x-rx)<1e-9&&Math.abs(face.gaze.y)<1e-9);
 face.look(0,1);assert.ok(Math.abs(face.gaze.y+rz)<1e-9,'looking down moves the irises down');
 face.look(5,-5);assert.ok(Math.abs(face.gaze.x-rx)<1e-9&&Math.abs(face.gaze.y-rz)<1e-9,'the gaze is kept in range');
 face.hold('happy',[-.5,0]);face.set('sad');face.look(1,1);
 assert.equal(face.frame,'happy','held');assert.ok(Math.abs(face.gaze.x+.5*rx)<1e-9,'the held gaze');
 face.hold(null);face.set('sad');assert.equal(face.frame,'sad','let go');
 // (where World's gaze is near ahead, the frame's own: sad looks down)
 face.look(0,0);assert.ok(face.gaze.y<0,'sad looks down of its own');
 face.look(.8,0);assert.ok(face.gaze.x>0,'World\'s gaze, where it has one, wins');
 assert.equal(face.mesh.material.transparent,true);assert.equal(face.mesh.material.depthWrite,false);
 assert.equal(face.mesh.userData.paintedFace,face,'reachable from the mesh, for photographs');
 face.dispose();
});
