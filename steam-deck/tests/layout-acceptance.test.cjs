const test=require('node:test'),assert=require('node:assert/strict');
const {rectanglesSeparated}=require('../tools/layout-acceptance.cjs');
const caption={left:24,top:610,right:704,bottom:689};
test('caption acceptance allows separation on either axis, in either order',()=>{
 for(const action of [
  {left:439,top:705,right:841,bottom:776}, // quiet HUD: shared x range, clear vertical gap
  {left:720,top:610,right:1000,bottom:689},
  {left:24,top:500,right:704,bottom:600},
  {left:0,top:610,right:20,bottom:689},
 ]){assert.equal(rectanglesSeparated(caption,action),true);assert.equal(rectanglesSeparated(action,caption),true);}
});
test('caption acceptance rejects partial overlap, containment and identical rectangles',()=>{
 for(const action of [
  {left:439,top:680,right:841,bottom:750},
  {left:30,top:620,right:50,bottom:640},
  {left:0,top:600,right:800,bottom:700},caption,
 ]){assert.equal(rectanglesSeparated(caption,action),false);assert.equal(rectanglesSeparated(action,caption),false);}
});
