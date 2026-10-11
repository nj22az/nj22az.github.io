import test from 'node:test';
import assert from 'node:assert/strict';
import {BIRTHDAYS,birthdayOn,birthdaysOn} from '../src/people/birthdays.js';
import {greetingFor} from '../src/people/greetings.js';
import {realTownMinutes} from '../src/town-clock.js';
import {RESIDENTS} from '../src/people/residents.js';
import {recipeFor} from '../src/avatars/cast.js';

const on=(month,day)=>realTownMinutes(new Date(2026,month-1,day,12,0));

test('no birthday is claimed until the creator sets a real one',()=>{
 // Every maker profile still shows the maker's starting value, so none of them is a real birthday.
 for(const r of RESIDENTS){const p=recipeFor(r.name)?.profile||{};if(!BIRTHDAYS[r.name])assert.deepEqual([p.month,p.day],[7,1],r.name+' has only the placeholder');}
 for(const [name,date] of Object.entries(BIRTHDAYS)){assert.ok(RESIDENTS.some(r=>r.name===name),name);assert.match(date,/^\d\d-\d\d$/);}
 assert.equal(birthdaysOn(on(7,1)).length,Object.values(BIRTHDAYS).filter(d=>d==='07-01').length,'1 July is nobody’s birthday by default');
});

test('a real birthday is greeted on the day, and only then',()=>{
 const table={Nhung:'03-14'};
 assert.equal(birthdayOn('Nhung',on(3,14),table),true);assert.equal(birthdayOn('Nhung',on(3,15),table),false);
 assert.equal(birthdayOn('Nhung',on(3,14),{Nhung:'13-40'}),false,'a malformed date is no birthday');
 assert.deepEqual(birthdaysOn(on(3,14),table),['Nhung']);
 const g=greetingFor({speaker:'Nhung',temper:'sunny',situation:{theirBirthday:birthdayOn('Nhung',on(3,14),table)}});
 assert.equal(g.id,'birthday');assert.match(g.text,/birthday|older/i);
 assert.notEqual(greetingFor({speaker:'Nhung',temper:'sunny',situation:{theirBirthday:false}}).id,'birthday');
});
