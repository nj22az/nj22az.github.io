import test from 'node:test';
import assert from 'node:assert/strict';
import {recipeFor} from '../src/avatars/cast.js';
import {THUAN_STUDIO_DESIGN} from '../src/avatars/thuan-studio-design.js';
test('World and Studio retain the exact creator-approved Thuận appearance and her own identity',()=>{
 const r=recipeFor('Thuan');
 for(const [group,value] of Object.entries(THUAN_STUDIO_DESIGN)){
  if(value&&typeof value==='object')for(const [key,want] of Object.entries(value))assert.deepEqual(r[group][key],want,group+'.'+key);
  else assert.deepEqual(r[group],value,group);
 }
 assert.equal(r.body.silhouette,'neutral');assert.equal(r.profile.month,3);assert.equal(r.profile.day,15);
});
