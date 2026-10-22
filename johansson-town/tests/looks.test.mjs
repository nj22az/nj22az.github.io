import test from 'node:test';
import assert from 'node:assert/strict';
import {createInkPipeline} from '../src/render/ink-pipeline.js';
import {LOOKS,LOOK_KEY,readLook,writeLook,lookCSS,lookNeedsPipeline,lookFragment} from '../src/render/looks.js';

function fakeRenderer(){
 const calls=[];
 return {
  calls,
  capabilities:{isWebGL2:true},
  getDrawingBufferSize(target){target.set(1280,720);return target;},
  getRenderTarget(){return this._target??null;},
  setRenderTarget(target){this._target=target;calls.push(['target',target]);},
  clear(){},
  render(){calls.push(['render',this._target]);}
 };
}
const renders=renderer=>renderer.calls.filter(([kind])=>kind==='render');

test('every look but Natural has a shader of its own, and the menu offers the requested set',()=>{
 assert.deepEqual(Object.keys(LOOKS),['none','mono','sepia','pocket','snes','lines','crt','manga','crayon']);
 assert.equal(lookFragment('none'),null);
 for(const name of Object.keys(LOOKS).filter(n=>n!=='none')){
  const source=lookFragment(name);
  assert.match(source,/void main\(\)\{/,name);
  assert.match(source,/gl_FragColor=vec4\(/,name);
  // Nothing in a look moves on its own: a still camera gives a still picture.
  assert.doesNotMatch(source,/uTime/,name);
 }
});

test('Natural adds no pass; a look adds exactly one, and the chain still ends on the screen',()=>{
 const renderer=fakeRenderer(),pipeline=createInkPipeline(renderer,{superScale:1});
 pipeline.render(r=>r.render());
 const natural=renders(renderer).length;
 assert.equal(renders(renderer).at(-1)[1],null);
 for(const name of ['manga','crayon','crt']){
  renderer.calls.length=0;pipeline.setLook(name);pipeline.render(r=>r.render());
  assert.equal(renders(renderer).length,natural+1,name);
  assert.equal(renders(renderer).filter(([,t])=>t===null).length,1,name+' draws the screen once');
  assert.equal(renders(renderer).at(-1)[1],null,name+' is the last pass');
 }
 renderer.calls.length=0;pipeline.state.fxaa=false;pipeline.render(r=>r.render());
 assert.equal(renders(renderer).filter(([,t])=>t===null).length,1,'without FXAA the look still finishes on the screen');
 pipeline.setLook('nonsense');assert.equal(pipeline.state.look,'none');
 pipeline.dispose();
});

test('the choice is remembered, and junk or a blocked store reads as Natural',()=>{
 const store=new Map(),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
 assert.equal(readLook(storage),'none');
 assert.equal(writeLook(storage,'manga'),'manga');
 assert.equal(store.get(LOOK_KEY),'manga');
 assert.equal(readLook(storage),'manga');
 store.set(LOOK_KEY,'__proto__');assert.equal(readLook(storage),'none');
 assert.equal(readLook({getItem(){throw new Error('blocked');}}),'none');
 assert.equal(readLook(null),'none');
});

test('reduced graphics keep the colour looks as a CSS filter and offer nothing they cannot draw',()=>{
 assert.equal(lookCSS('none'),'none');
 assert.match(lookCSS('mono'),/grayscale/);
 assert.match(lookCSS('sepia'),/sepia/);
 for(const name of ['pocket','snes','lines','crt','manga','crayon'])assert.ok(lookNeedsPipeline(name),name);
 assert.ok(!lookNeedsPipeline('none')&&!lookNeedsPipeline('mono'));
});
