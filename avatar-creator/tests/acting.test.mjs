import test from 'node:test';
import assert from 'node:assert/strict';
import {actorFrame,normalizeTake,sampleTake,readTakes,writeTakes} from '../acting/takes.mjs';
import {FacePose,readFace,mapFace} from '../acting/tracking.mjs';
import {normalizeScene,emptyScene,addCharacter} from '../scene-model.mjs';
import {applyActorFrame} from '../../johansson-town/src/avatars/acting.js';
import {CAST_RECIPES} from '../../johansson-town/src/avatars/cast.js';
const take=()=>normalizeTake({format:'johansson-actor-take',version:1,name:'Greeting',frames:[actorFrame({},0),actorFrame({head:[.2,.4,-.1],talk:1,expression:'happy'},1)]});
test('takes reject malformed clocks and oversized recordings and bound all numeric parameters',()=>{
 const t=take();assert.equal(t.duration,1);for(const bad of [-1,0,61,NaN])assert.throws(()=>normalizeTake({...t,frames:[t.frames[0],{...t.frames[1],t:bad}]}));
 assert.throws(()=>normalizeTake({...t,frames:new Array(1802).fill(t.frames[0])}));
 const f=actorFrame({head:[Infinity,40,-40],look:[NaN,4],talk:2,strength:NaN});assert.deepEqual(f.head,[0,.6,-.6]);assert.deepEqual(f.look,[0,1]);assert.equal(f.talk,1);assert.equal(f.strength,1);
});
test('playback interpolates, holds its last frame and blends the loop seam continuously',()=>{
 const t=take();assert.equal(sampleTake(t,.5).talk,.5);assert.equal(sampleTake(t,.5).head[1],.2);assert.equal(sampleTake(t,7).talk,1);assert.equal(sampleTake(t,-1).talk,0);assert.ok(sampleTake(t,.99999,{loop:true}).talk<.001);assert.equal(sampleTake(t,1,{loop:true}).talk,0);
});
test('scene projects preserve independent actor takes and report unavailable browser storage',()=>{
 const t=take(),s=emptyScene(),a=addCharacter(s,CAST_RECIPES.Johansson);a.take=t;a.takeLoop=true;const restored=normalizeScene(JSON.parse(JSON.stringify(s)));assert.deepEqual(restored.actors[0].take,t);assert.equal(restored.actors[0].takeLoop,true);a.take.frames[0].head[0]=.4;assert.equal(restored.actors[0].take.frames[0].head[0],0);
 const unavailable={getItem(){throw Error();},setItem(){throw Error();}};assert.deepEqual(readTakes(unavailable),[]);assert.equal(writeTakes([t],unavailable),false);assert.equal(normalizeScene({...s,actors:[{...a,take:{frames:[]}}]}).actors[0].take,null);
});
test('calibration and mirroring work; stale camera tracking fades to neutral',()=>{
 const yaw=.2,c=Math.cos(yaw),s=Math.sin(yaw),r={faceLandmarks:[[]],faceBlendshapes:[{categories:[{categoryName:'jawOpen',score:.7}]}],facialTransformationMatrixes:[{data:[c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]}]};
 const raw=readFace(r);assert.ok(raw.yaw>0);assert.ok(mapFace(raw,null,{mirror:true,sensitivity:1,smoothing:0}).angleX<0);const p=new FacePose();p.update(r,0);assert.equal(p.sample(0,.04,{mirror:false,sensitivity:1,smoothing:0}).weight,1);assert.equal(p.calibrate(0),true);assert.equal(p.sample(0,.04,{mirror:false,sensitivity:1,smoothing:0}).params.angleX,0);assert.ok(p.sample(1000,.1,{mirror:false,sensitivity:1,smoothing:0}).weight<1);assert.equal(p.calibrate(1000),false);
});
test('head capture layers onto a body pose and keeps eyelids independent',()=>{
 let face;const a={bones:{head:{rotation:{x:.1,y:.2,z:0}}},faceState:{expression:'shy'},paintFace:s=>face=s,root:{updateMatrixWorld(){}}};applyActorFrame(a,actorFrame({head:[.1,.3,-.2],blinkL:1,blinkR:0,talk:.8}));assert.equal(a.bones.head.rotation.x,.2);assert.equal(a.bones.head.rotation.y,.5);assert.equal(face.blinkLeft,1);assert.equal(face.blinkRight,0);assert.equal(face.talk,.8);
});
