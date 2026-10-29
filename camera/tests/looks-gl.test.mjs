// Node checks for Pocket Camera's shader conversion: every World Look converts, and the one change to World's
// source (unit() follows the picture's height) is really made. Run: node camera/tests/looks-gl.test.mjs
import assert from 'node:assert/strict';
import {LOOK_NAMES,photoFragment,normalRecipe,exportSize,flipRows,lookDrawsLines} from '../looks-gl.js';

assert.equal(LOOK_NAMES[0],'none');
assert.ok(LOOK_NAMES.length>=19,'every World Look is offered');
assert.equal(photoFragment('none'),null);
for(const name of LOOK_NAMES.filter(n=>n!=='none'))for(const light of [false,true]){
 const f=photoFragment(name,{light});
 assert.ok(f.startsWith('#version 300 es\n'),name);
 assert.ok(!f.includes('#include'),`${name}: three.js includes removed`);
 assert.ok(f.includes('return max(uUnitFloor,uResolution.y/uLines);'),`${name}: patterns follow the picture's height`);
 assert.ok(!f.includes('max(1.0,uResolution.y/1080.0)'),`${name}: World's screen-sized unit replaced`);
 assert.equal((f.match(/void main\(\)/g)||[]).length,1,`${name}: one entry point`);
 assert.ok(f.includes('void lookMain()'),name);
 assert.ok(!/#define HAS_DEPTH|#define HAS_NORMALS/.test(f),`${name}: picture-only`);
 assert.equal(f.includes('#define LIGHT'),light,`${name}: light only when asked`);
}
assert.ok(lookDrawsLines('manga')&&!lookDrawsLines('mono')&&!lookDrawsLines('none'));

const r=normalRecipe({layers:[{look:'manga',amount:2},{look:'nope'},{look:'crt'},{look:'oil'}],adjust:{light:5,pattern:'x'}});
assert.deepEqual(r.layers,[{look:'manga',amount:1},{look:'none',amount:1},{look:'crt',amount:1}]);
assert.equal(r.adjust.light,1);assert.equal(r.adjust.pattern,0);assert.equal(r.stamp,false);
assert.deepEqual(normalRecipe().layers,[{look:'none',amount:1}]);
assert.deepEqual(normalRecipe().stickers,[]);
assert.deepEqual(normalRecipe({stickers:[{id:'fuji/Wave',x:2,size:0,angle:12,flip:1},{x:.5},null]}).stickers,[{id:'fuji/Wave',x:1.2,y:.5,size:.06,angle:12,flip:true}]);

assert.deepEqual(exportSize(1920,1440),{width:1920,height:1440});
const big=exportSize(8064,6048);assert.ok(big.width<=4096&&big.width*big.height<=16e6);

const px=new Uint8Array([1,1,1,1, 2,2,2,2]);assert.deepEqual([...flipRows(px,1,2)],[2,2,2,2,1,1,1,1]);
console.log(`looks-gl: ${LOOK_NAMES.length-1} Looks convert; recipe, size and row checks pass`);
