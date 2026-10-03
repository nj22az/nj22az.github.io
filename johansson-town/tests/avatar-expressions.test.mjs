import {test} from 'node:test';
import assert from 'node:assert/strict';
import {drawFace,EXPRESSION_NAMES} from '../src/avatars/face.js';
import {normalizeRecipe,PARTS} from '../src/avatars/recipe.js';
import {buildAvatar,measure} from '../src/avatars/build.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
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
 // Adults wear the big-headed life-sim proportions: 1.12 of the original head.
 assert.equal(m.Rh,(.19+recipe.head.size*.055)*m.k*1.12,'existing head radius');
 assert.equal(m.H,1.36+recipe.body.height*.44,'existing body height');
 assert.equal(avatar.paintFace({expression:'happy'}),true);
 assert.equal(avatar.paintFace({expression:'happy'}),false,'idle expressions do not re-upload the texture');
 assert.equal(avatar.paintFace({expression:'surprised'}),true);
 assert.equal(avatar.paintFace({talk:1}),true);
 assert.equal(avatar.paintFace({talk:1}),false);
 let draws=0,lines=0;avatar.root.traverse(o=>{if(o.isMesh&&o.visible)(o.userData.outline?lines++:draws++);});assert.equal(draws,2);assert.equal(lines,2,"body and head each carry one ink shell");
 avatar.dispose();
});


test('surprise raises both hands once and leaves walking and seated actions in control',()=>{
 installDOM();const a=buildAvatar(normalizeRecipe()),anim=createAvatarAnimator(a);
 anim.update(.35,{expression:'surprised'});assert.ok(a.bones.elbowL.rotation.x<-.5&&a.bones.elbowR.rotation.x<-.5,'both hands rise for a startled reaction');
 for(let i=0;i<120;i++)anim.update(1/60,{expression:'surprised'});assert.equal(anim.gesture,null,'a held emotion does not repeat the gesture endlessly');
 anim.stop();anim.update(.1,{expression:'neutral'});anim.update(.1,{expression:'surprised',speed:1});assert.equal(anim.gesture,null,'walking keeps its stride');
 anim.update(.1,{expression:'neutral'});anim.update(.1,{expression:'surprised',seated:true});assert.equal(anim.gesture,null,'seated activities keep their pose');a.dispose();
});
