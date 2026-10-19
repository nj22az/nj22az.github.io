import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {releaseAfterUpload,paintBack,redrawReleasedCanvases} from '../src/render/canvas-release.js';

const canvas=(width,height)=>({width,height,painted:0,getContext(){return {canvas:this};}});
const draw=ctx=>{ctx.canvas.painted++;};

test('a static canvas gives its backing store back after upload and is painted again for a restored context',()=>{
 const c=canvas(512,128),texture=releaseAfterUpload(new THREE.Texture(c),draw);
 assert.equal(c.width,512);
 texture.onUpdate(texture);
 assert.deepEqual([c.width,c.height],[1,1],'released once the GPU has it');
 const version=texture.version;redrawReleasedCanvases();
 assert.deepEqual([c.width,c.height,c.painted],[512,128,1],'repainted at its own size');
 assert.ok(texture.version>version,'and uploaded again');
 texture.onUpdate(texture);assert.equal(c.width,1);
});

test('a deferred picture is not painted until it is about to be uploaded, and a restore leaves it waiting',()=>{
 const c=canvas(384,384),texture=releaseAfterUpload(new THREE.Texture(c),draw,{width:384,height:384,deferred:true});
 assert.deepEqual([c.width,c.painted],[1,0]);
 redrawReleasedCanvases();assert.deepEqual([c.width,c.painted],[1,0],'a restore does not paint what nobody sees');
 paintBack(texture);assert.deepEqual([c.width,c.height,c.painted],[384,384,1]);
 texture.onUpdate(texture);assert.equal(c.width,1);
 paintBack(texture);assert.equal(c.painted,2);
});
