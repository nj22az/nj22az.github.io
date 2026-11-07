import test from 'node:test';
import assert from 'node:assert/strict';
import {normalCreatorMark,projectCreatorMark,drawCreatorMark} from '../creator-mark.mjs';
import {sceneLink,readSceneLink} from '../scene-links.mjs';
test('new comics get the wordmark; legacy projects stay unmarked and explicit settings survive links',async()=>{
 assert.equal(normalCreatorMark().enabled,true);assert.equal(projectCreatorMark({}).enabled,false);
 const creatorMark=normalCreatorMark({text:'NJ',enabled:false,corner:'left',opacity:.4});
 const doc={format:'johansson-studio-scenes',version:1,layout:'strip',scenes:[{version:2,actors:[]}],creatorMark};
 assert.deepEqual((await readSceneLink(new URL(await sceneLink(doc,'https://example.test/')).hash)).creatorMark,creatorMark);
 assert.equal(normalCreatorMark({text:'x'.repeat(80),opacity:20}).text.length,40);assert.equal(normalCreatorMark({opacity:20}).opacity,.9);
});
test('creator wordmark clears captions, respects the chosen corner and can be removed',()=>{
 const calls=[],ctx=new Proxy({measureText:t=>({width:t.length*12}),fillText:(...a)=>calls.push(a)},{get:(o,k)=>k in o?o[k]:()=>{}}),rect={x:20,y:30,w:1000,h:750};
 const r=drawCreatorMark(ctx,rect,{}, {caption:true});assert.ok(r.y<rect.y+rect.h*.83);assert.ok(r.x<rect.x+rect.w);assert.equal(calls.length,1);
 const l=drawCreatorMark(ctx,rect,{corner:'left'});assert.ok(l.x<rect.x+rect.w*.1);
 assert.equal(drawCreatorMark(ctx,rect,{enabled:false}),undefined);assert.equal(calls.length,2);
});
