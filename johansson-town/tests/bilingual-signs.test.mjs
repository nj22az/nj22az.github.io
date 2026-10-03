import test from 'node:test';
import assert from 'node:assert/strict';
import {japaneseSign,signText} from '../src/world/okinawa/signs.js';
import {roomExitVisible} from '../src/interact/control-visibility.js';
test('physical shop names use Japanese and clarification fits its panel',()=>{
 assert.equal(japaneseSign('Port warehouse'),'港倉庫');assert.equal(japaneseSign('Big catch'),'大漁');
 let drawn;const ctx={font:'',measureText(text){return {width:parseFloat(this.font.match(/([\d.]+)px/)[1])*text.length*.62}},fillText(...args){drawn=args}};
 const text='MINATO HARBOUR WAREHOUSE · STORES & ICE';const size=signText(ctx,text,384,201,700,96);
 assert.ok(size<96);assert.ok(ctx.measureText(text).width<=700);assert.equal(drawn[0],text);assert.equal(drawn[3],700);
});
test('exit appears at a doorway, stays away from menus and never occupies outdoor view',()=>{
 const input={playing:true,inside:true,paused:false,seated:false,position:{x:0,z:5.4},exit:[0,1.1,6.2]};
 assert.equal(roomExitVisible(input),true);
 for(const override of [{paused:true},{seated:true},{playing:false},{inside:false},{position:{x:8,z:-4}},{exit:null}])assert.equal(roomExitVisible({...input,...override}),false);
 assert.equal(roomExitVisible({...input,exit:{x:0,z:6.2}}),true);
});
