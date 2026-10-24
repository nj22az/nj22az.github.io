import test from 'node:test';
import assert from 'node:assert/strict';
import {recordMoment,diaryPage,diaryDays,restoreDiary} from '../src/progression/diary.js';
import {realTownMinutes} from '../src/town-clock.js';

const at=(month,day,h=12)=>realTownMinutes(new Date(2026,month-1,day,h));

test('a day is remembered by its most significant moment',()=>{
 const state={},m=at(8,17,20);state.minutes=m;
 recordMoment(state,m,{text:'Bought a can of coffee.',kind:'note'});
 recordMoment(state,m,{text:'Ukui: the last night of Obon, and the eisa. Thao said: “Stand back.”',kind:'happening'});
 recordMoment(state,m,{text:'Gave Thao a plum rice ball.',kind:'gift'});
 const page=diaryPage(state,m);
 assert.match(page,/^Sunday 17 August 1997/);
 assert.ok(page.indexOf('eisa')<page.indexOf('plum rice ball'),'the happening leads the page');
});

test('a quiet day still gets a page, never one used before, and it stays put',()=>{
 const state={},pages=new Set();
 for(let d=0;d<8;d++){const m=at(10,1+d);state.minutes=m+1440;const page=diaryPage(state,m);const body=page.split('\n\n')[1];assert.ok(!pages.has(body),'page '+d+' repeats');pages.add(body);}
 const m=at(10,20);state.minutes=m;const first=diaryPage(state,m);assert.equal(diaryPage(state,m),first,'reopening does not rewrite a quiet day');
});

test('pages are kept, listed newest first, and survive a save',()=>{
 const state={},a=at(10,3),b=at(10,5);state.minutes=b;
 recordMoment(state,a,{text:'Saw the fish auction.',kind:'happening'});diaryPage(state,a);
 recordMoment(state,b,{text:'Played jan-ken-pon with nobody in particular.'});
 const days=diaryDays(state,b);assert.ok(days[0]>days[1]);
 const back=restoreDiary(JSON.parse(JSON.stringify(state.diary)));
 assert.deepEqual(back.pages,state.diary.pages);
 assert.deepEqual(restoreDiary({moments:{x:[{}]},pages:{3:5},quiet:'no'}),{moments:{},pages:{},quiet:[]});
});
