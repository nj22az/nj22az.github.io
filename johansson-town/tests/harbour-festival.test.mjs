import {test} from 'node:test';import assert from 'node:assert/strict';
import {FESTIVAL_ALLIES,FESTIVAL_STAGES,canFestivalFight,restoreFestival,createFestivalBout,stepFestivalBout,completeFestivalStage,registerTournament,tournamentMatches,recordTournamentResult,recordFestivalWatch} from '../src/progression/harbour-festival.js';
test('Johansson and the three sisters cannot oppose one another in either order',()=>{
 for(const a of FESTIVAL_ALLIES)for(const b of FESTIVAL_ALLIES)assert.equal(canFestivalFight(a,b),false,a+' / '+b);
 assert.equal(canFestivalFight('Johansson','Thuận'),false);
 for(const hero of FESTIVAL_ALLIES)for(const stage of FESTIVAL_STAGES){assert.equal(canFestivalFight(hero,stage.opponent),true);assert.equal(createFestivalBout(hero,stage).fighters[1].name,stage.opponent);}
 assert.throws(()=>createFestivalBout('Thuan',{...FESTIVAL_STAGES[0],opponent:'Thao'}));
});
test('watching resolves a story chapter without a fighting reward',()=>{
 const state={yen:1200};assert.equal(recordFestivalWatch(state,FESTIVAL_STAGES[0].id),true);assert.equal(state.yen,1200);
 assert.equal(completeFestivalStage(state,FESTIVAL_STAGES[1].id),true);assert.equal(state.yen,1320);
 assert.equal(recordFestivalWatch(state,FESTIVAL_STAGES[0].id),false);
});
test('chapter order, save round trip and rewards cannot be farmed',()=>{
 const state={yen:1200};assert.equal(completeFestivalStage(state,FESTIVAL_STAGES[1].id),false);
 for(const stage of FESTIVAL_STAGES){assert.equal(completeFestivalStage(state,stage.id),true);assert.equal(completeFestivalStage(state,stage.id),false);}
 assert.equal(state.yen,1770);assert.deepEqual(restoreFestival(JSON.parse(JSON.stringify(state.harbourFestival))).completed,FESTIVAL_STAGES.map(s=>s.id));
});
test('fixed-step combat has startup, range and sustained frontal guard',()=>{
 let b=createFestivalBout('Thao',FESTIVAL_STAGES[0]);b.fighters[0].x=-.35;b.fighters[1].x=.35;
 stepFestivalBout(b,{punch:true},{});for(let i=0;i<4;i++)stepFestivalBout(b,{},{});assert.equal(b.fighters[1].hp,100);for(let i=0;i<8;i++)stepFestivalBout(b,{},{});assert.equal(b.fighters[1].hp,92);
 b=createFestivalBout('Thao',FESTIVAL_STAGES[0]);b.fighters[0].x=-.35;b.fighters[1].x=.35;for(let i=0;i<50;i++)stepFestivalBout(b,{punch:i===0},{guard:true});assert.equal(b.fighters[1].hp,100);
});

test('annual brackets persist, exclude family opposition and award once',()=>{
 const state={yen:0,harbourFestival:{hero:'Thuan'}};assert.equal(registerTournament(state,2026,'10-16'),null);
 let t=registerTournament(state,2026,'10-17');assert.equal(t.hero,'Thuan');assert.equal(recordTournamentResult(state,2026,2,'Thuan'),false);
 assert.equal(recordTournamentResult(state,2026,0,'Thuan'),true);assert.equal(recordTournamentResult(state,2026,1,'Fujita'),true);
 t=restoreFestival(JSON.parse(JSON.stringify(state.harbourFestival))).tournaments['2026'];assert.deepEqual(tournamentMatches(t)[2],{id:'final',a:'Thuan',b:'Fujita',stage:'shopping-ladle'});
 assert.equal(recordTournamentResult(state,2026,2,'Thuan'),true);assert.equal(recordTournamentResult(state,2026,2,'Thuan'),false);assert.equal(state.yen,400);
 assert.equal(registerTournament(state,2027,'10-17').winners[0],null);
 for(const match of tournamentMatches(t)){assert.equal(canFestivalFight(match.a,match.b),true);}
});
