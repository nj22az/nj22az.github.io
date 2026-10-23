import {normalizeScene} from '../scene-model.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
import {normalCapture,normalLayer,normalEffects} from '../comic-effects-model.mjs';
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
const matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
const capture={version:1,encoding:'rgb24-depth',width:1,height:1,depth:png,normal:png,near:.1,far:100,projectionInverse:matrix,cameraWorld:matrix,focusDistance:2,focusRange:.7,focusMode:'depth',skyDepth:120};
test('lossless capture survives project layers and rejects corrupt encodings, size and camera data',()=>{
 const layer=normalLayer({plate:png,capture,baseLook:'flat'});assert.deepEqual(layer.capture,capture);assert.equal(layer.baseLook,'flat');
 for(const bad of [{encoding:'jpeg'},{width:999999},{near:0},{near:'0.1'},{far:.01},{projectionInverse:[NaN]},{normal:png.replace('image/png','image/jpeg')}])assert.equal(normalCapture({...capture,...bad}),null);
 assert.equal(normalLayer({plate:png,capture:{...capture,width:999999}}),null);assert.ok(normalLayer({plate:png}));
 const p=normalEffects({look:'tilt',focus:{distance:-10,range:99999}});assert.deepEqual(p.focus,{mode:'depth',distance:.1,range:1000});
});

test('retired preset projects retain their baked marker and migrate editable effects',()=>{for(const [old,next] of Object.entries({storybook:'flat',sunday:'flat',gouache:'oil'})){assert.equal(normalizeScene({version:2,look:old,actors:[]}).look,next);const layer=normalLayer({plate:png,baseLook:old,post:{look:old}});assert.equal(layer.baseLook,old);assert.equal(layer.post.look,next);}});
