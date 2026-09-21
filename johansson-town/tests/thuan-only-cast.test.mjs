import test from 'node:test';
import assert from 'node:assert/strict';
import {RESIDENTS,STREET_CAST,STREET_CAST_NAMES} from '../src/people/residents.js';

test('the published town isolates Thuan while retaining neighbours for later reintroduction',()=>{
 assert.deepEqual(STREET_CAST_NAMES,['Thuan']);
 assert.deepEqual(STREET_CAST.map(person=>person.name),['Thuan']);
 assert.ok(RESIDENTS.length>1,'resident definitions were deleted instead of being held back');
 assert.ok(RESIDENTS.some(person=>person.name==='Nao'),'Nao must remain available for staged reintroduction');
});
