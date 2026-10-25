import test from 'node:test';
import assert from 'node:assert/strict';
import {buildAvatar} from '../src/avatars/build.js';
import {recipeFor} from '../src/avatars/cast.js';
import {normalizeRecipe,PARTS} from '../src/avatars/recipe.js';
import {drawFace,EXPRESSION_NAMES} from '../src/avatars/face.js';
import {COSY,cosyFaceOn,cosyBrowInk,browRibbon} from '../src/avatars/cosy-face.js';
import {installDOM} from './fixtures.mjs';

// The cosy face (src/avatars/cosy-face.js; jojo 3d/cast/avatars-cad/HANDOFF.md, after step 1): off unless a page asks ?cosy=1.
const SIX=['Thuan','Johansson','Tetsuo','Thao','Fujita','Vy'];

/** Paint a face on a recording context: every fill and stroke with the colour it used, and every fillRect's size. */
function paint(recipe,state){
 const log=[];let fill='',stroke='';
 const ctx=new Proxy({canvas:{}},{get(t,k){
  if(k in t)return t[k];
  if(k==='fill')return ()=>log.push(['fill',fill]);
  if(k==='stroke')return ()=>log.push(['stroke',stroke]);
  if(k==='fillRect')return (x,y,w,h)=>log.push(['rect',fill,w,h]);
  if(typeof k==='string'&&k.startsWith('create'))return ()=>({addColorStop(){}});
  return ()=>{};
 },set(t,k,v){if(k==='fillStyle')fill=String(v);if(k==='strokeStyle')stroke=String(v);t[k]=v;return true;}});
 drawFace(ctx,recipe,state);return log;
}

test('the cosy face is off unless the page asks for it, and off is exactly today',()=>{
 installDOM();
 assert.equal(cosyFaceOn(),false);
 const today=buildAvatar(recipeFor('Johansson'),{shadows:false}),plain=buildAvatar(recipeFor('Johansson'),{shadows:false,cosy:false});
 assert.equal(today.cosy,false);
 assert.deepEqual(Array.from(today.body.geometry.attributes.position.array),Array.from(plain.body.geometry.attributes.position.array));
 assert.ok(today.root.getObjectByName('Sculpted beard'),'today his stubble is raised bristles');
 today.dispose();plain.dispose();
 globalThis.location.search='?cosy=1';
 try{assert.equal(cosyFaceOn(),true);const cosy=buildAvatar(recipeFor('Johansson'),{shadows:false});assert.equal(cosy.cosy,true);cosy.dispose();}
 finally{delete globalThis.location.search;}
 // and the painter, given nothing, paints today's face
 for(const name of SIX){const r=normalizeRecipe(recipeFor(name));assert.deepEqual(paint(r,{expression:'smile'}),paint(r,{expression:'smile',cosy:false}),name);}
});

test('cosy brows are filled tapered arcs in a warm taupe, thickest toward the nose',()=>{
 for(const style of PARTS.brows){
  if(style==='none')continue;
  const r=normalizeRecipe({...recipeFor('Thao'),brows:{...recipeFor('Thao').brows,style,colour:'#1c1714'}});
  const ink=cosyBrowInk('#1c1714'),log=paint(r,{expression:'neutral',cosy:true});
  assert.equal(log.filter(([k,c])=>k==='stroke'&&c===ink).length,0,style+': no stroked brow lines');
  assert.ok(log.filter(([k,c])=>k==='fill'&&c===ink).length>=2,style+': both brows filled in the taupe');
 }
 // warmer than the hair: red above blue, and lighter than near-black
 const [r,,b]=[1,3,5].map(i=>parseInt(cosyBrowInk('#1c1714').slice(i,i+2),16));assert.ok(r>b+10&&r>40);
 // the ribbon: thin at both ends, fullest inside, thicker at the inner end than the outer
 const pts=browRibbon([-13,1],[0,-3],[13,1],6,-1,18),half=pts.length/2,width=i=>Math.hypot(pts[i][0]-pts[pts.length-1-i][0],pts[i][1]-pts[pts.length-1-i][1]);
 assert.ok(width(0)<width(9)*.5&&width(18)<width(9)*.5);
 assert.ok(width(3)>width(15),'inner (−x for inner −1) fuller than outer');assert.equal(half,19);
});

test('cosy mouth lines are warm brown, lipstick keeps its colour, and the stubble is a tint without dots',()=>{
 const black='#2b2623';
 for(const name of SIX){
  const r=normalizeRecipe(recipeFor(name));
  for(const expression of EXPRESSION_NAMES){
   const log=paint(r,{expression,cosy:true,objects:true,skipEyes:true});   // (the eyes are ink by design)
   assert.equal(log.filter(([k,c])=>k==='stroke'&&c===black).length,0,name+' '+expression+': no black line on the face but the eyes');
  }
 }
 const j=normalizeRecipe(recipeFor('Johansson'));
 assert.ok(paint(j,{expression:'smile',cosy:true}).some(([k,c])=>k==='stroke'&&c===COSY.mouthLine));
 assert.ok(paint(j,{expression:'smile'}).filter(([k,,w])=>k==='rect'&&w<2).length>100,'today: dotted stubble');
 assert.equal(paint(j,{expression:'smile',cosy:true}).filter(([k,,w])=>k==='rect'&&w<2).length,0,'cosy: no dots');
 const t=normalizeRecipe(recipeFor('Thuan'));
 assert.ok(paint(t,{expression:'smile',cosy:true}).some(([k,c])=>k==='stroke'&&c===t.mouth.colour),'her lipstick stays');
});

test('in 3D: no bristles, ball noses become a rise of the face, ears flared; the ink noses are untouched',()=>{
 installDOM();
 for(const name of SIX){
  const recipe=recipeFor(name),today=buildAvatar(recipe,{shadows:false,cosy:false}),cosy=buildAvatar(recipe,{shadows:false,cosy:true});
  assert.equal(cosy.root.getObjectByName('Sculpted beard'),undefined,name);
  const noseT=today.face.head.getObjectByName('Shimanchu nose'),noseC=cosy.face.head.getObjectByName('Shimanchu nose');
  assert.ok(noseC,name+': the cosy nose is on the head, wearing the face');
  assert.equal(noseC.material,cosy.face.head.material,name);
  if(noseT)assert.deepEqual(Array.from(noseC.geometry.attributes.position.array),Array.from(noseT.geometry.attributes.position.array),name+': an ink nose is as it was');
  else assert.ok(today.body.geometry.attributes.position.count>cosy.body.geometry.attributes.position.count,name+': the ball nose leaves the body');
  // the foot of the cosy nose lies on the face: its rim no further out than a small fraction of its height
  if(!noseT){
   const p=noseC.geometry.attributes.position,c=cosy.face.head.position.clone().set(0,0,0);let lo=Infinity,hi=-Infinity;
   for(let i=0;i<p.count;i++){const d=Math.hypot(p.getX(i)-c.x,p.getY(i)-c.y,p.getZ(i)-c.z);lo=Math.min(lo,d);hi=Math.max(hi,d);}
   assert.ok(hi-lo>.005,name+': it rises');
  }
  for(const v of cosy.body.geometry.attributes.position.array)assert.ok(Number.isFinite(v));
  today.dispose();cosy.dispose();
 }
});
