import {test} from 'node:test';
import assert from 'node:assert/strict';
import {drawFace,EXPRESSION_NAMES} from '../src/avatars/face.js';
import {normalizeRecipe,PARTS} from '../src/avatars/recipe.js';
import {buildAvatar,measure} from '../src/avatars/build.js';
import {installDOM} from './fixtures.mjs';

function drawing(recipe,state={}){
 const commands=[],canvas={};
 const ctx=new Proxy({canvas},{
  get(target,key){
   if(key in target)return target[key];
   if(key==='createRadialGradient')return (...args)=>{commands.push([key,...args]);return {addColorStop:(...stop)=>commands.push(['stop',...stop])};};
   return (...args)=>commands.push([key,...args]);
  },
  set(target,key,value){target[key]=value;commands.push(['set',key,value]);return true;},
 });
 drawFace(ctx,recipe,state);return JSON.stringify(commands);
}

test('every eye style renders distinct moods, speech and blinks without changing identity',()=>{
 for(const style of PARTS.eyes){
  const recipe=normalizeRecipe({eyes:{style}}),before=JSON.stringify(recipe);
  const images=EXPRESSION_NAMES.map(expression=>drawing(recipe,{expression}));
  assert.equal(new Set(images).size,EXPRESSION_NAMES.length,style+' has distinct expressions');
  assert.equal(drawing(recipe,{expression:'unknown'}),drawing(recipe,{expression:'neutral'}));
  assert.notEqual(drawing(recipe,{expression:'neutral',blink:1}),drawing(recipe,{expression:'neutral'}));
  assert.notEqual(drawing(recipe,{expression:'smile',talk:1}),drawing(recipe,{expression:'smile'}));
  assert.equal(drawing(recipe,{expression:'happy',blink:1}),drawing(recipe,{expression:'happy'}),'happy eye curves survive a blink');
  assert.equal(JSON.stringify(recipe),before,'painting does not rewrite saved recipes');
 }
});

test('face repainting stays cached and preserves the two-draw avatar and current proportions',()=>{
 installDOM();
 const recipe=normalizeRecipe(),m=measure(recipe),avatar=buildAvatar(recipe,{shadows:false});
 assert.equal(m.Rh,(.19+recipe.head.size*.055)*m.k,'existing head radius');
 assert.equal(m.H,1.36+recipe.body.height*.44,'existing body height');
 assert.equal(avatar.paintFace({expression:'happy'}),true);
 assert.equal(avatar.paintFace({expression:'happy'}),false,'idle expressions do not re-upload the texture');
 assert.equal(avatar.paintFace({expression:'surprised'}),true);
 assert.equal(avatar.paintFace({talk:1}),true);
 assert.equal(avatar.paintFace({talk:1}),false);
 let draws=0;avatar.root.traverse(o=>{if(o.isMesh&&o.visible)draws++;});assert.equal(draws,2);
 avatar.dispose();
});
