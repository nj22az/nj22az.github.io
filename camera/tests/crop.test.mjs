import assert from 'node:assert/strict';
import {normalCrop,cropAtAspect,cropZoom} from '../crop.js';
import {normalRecipe} from '../looks-gl.js';

assert.deepEqual(normalRecipe().crop,{x:0,y:0,w:1,h:1},'existing albums show the whole source');
assert.deepEqual(normalCrop({x:2,y:-1,w:.5,h:.25}),{x:.5,y:0,w:.5,h:.25});
assert.deepEqual(normalCrop({x:NaN,y:Infinity,w:'bad',h:null}),{x:0,y:0,w:1,h:1});
const stored={x:.12,y:.21,w:.4,h:.5};
assert.deepEqual(normalRecipe(JSON.parse(JSON.stringify({crop:stored}))).crop,stored,'album recipe keeps the source rectangle');
for(const [width,height] of [[4000,3000],[3000,4000],[640,480]])for(const aspect of [1,4/3,3/4,16/9,9/16,width/height])for(const zoom of [1,2,4]){
 const c=cropAtAspect(width,height,aspect,zoom,.9,.1);
 assert.ok(Math.abs(c.w*width/(c.h*height)-aspect)<1e-9,'shape keeps its proportions');
 assert.ok(c.x>=0&&c.y>=0&&c.x+c.w<=1.000001&&c.y+c.h<=1.000001,'crop stays inside the source');
 assert.ok(Math.abs(cropZoom(width,height,c)-zoom)<1e-9,'zoom survives a saved recipe');
}
console.log('crop: existing recipes, bounds, aspect ratios and zoom round trips pass');
