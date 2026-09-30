import test from 'node:test';
import assert from 'node:assert/strict';
import {RESIDENTS,STREET_CAST,STREET_CAST_NAMES} from '../src/people/residents.js';

test('the published town has Thuan, Nao and the Front-Row staff, and nobody else yet',()=>{
 assert.deepEqual(STREET_CAST_NAMES,['Thuan','Nao','Aya','Reiko','Kenji','Tetsuo']);
 assert.deepEqual(STREET_CAST.map(person=>person.name).sort(),['Aya','Kenji','Nao','Reiko','Tetsuo','Thuan']);
 assert.ok(RESIDENTS.length>1,'resident definitions were deleted instead of being held back');
 assert.ok(RESIDENTS.some(person=>person.name==='Nao'),'Nao must remain available in the resident roster');
});
