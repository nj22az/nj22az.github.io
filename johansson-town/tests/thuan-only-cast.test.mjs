import test from 'node:test';
import assert from 'node:assert/strict';
import {RESIDENTS,STREET_CAST,STREET_CAST_NAMES} from '../src/people/residents.js';

test('the published town has Thuan, Nao, the Front-Row staff, the harbour master and Officer Mori, and nobody else yet',()=>{
 assert.deepEqual(STREET_CAST_NAMES,['Thuan','Nao','Aya','Reiko','Kenji','Tetsuo','Harbour master','Officer Mori']);
 assert.deepEqual(STREET_CAST.map(person=>person.name).sort(),['Aya','Harbour master','Kenji','Nao','Officer Mori','Reiko','Tetsuo','Thuan']);
 assert.ok(RESIDENTS.length>1,'resident definitions were deleted instead of being held back');
 assert.ok(RESIDENTS.some(person=>person.name==='Nao'),'Nao must remain available in the resident roster');
});
