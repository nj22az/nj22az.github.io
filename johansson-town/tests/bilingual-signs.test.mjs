import test from 'node:test';
import assert from 'node:assert/strict';
import {japaneseSign,signText} from '../src/world/okinawa/signs.js';
import {readFileSync} from 'node:fs';
import {roomExitVisible} from '../src/interact/control-visibility.js';
test('physical shop names use Japanese and clarification fits its panel',()=>{
 assert.equal(japaneseSign('Port warehouse'),'港倉庫');assert.equal(japaneseSign('Big catch'),'大漁');
 let drawn;const ctx={font:'',measureText(text){return {width:parseFloat(this.font.match(/([\d.]+)px/)[1])*text.length*.62}},fillText(...args){drawn=args}};
 const text='MINATO HARBOUR WAREHOUSE · STORES & ICE';const size=signText(ctx,text,384,201,700,96);
 assert.ok(size<96);assert.ok(ctx.measureText(text).width<=700);assert.equal(drawn[0],text);assert.equal(drawn[3],700);
});
test('Exit to street is there anywhere inside, and steps aside for menus, seats and the street',()=>{
 const input={playing:true,inside:true,paused:false,seated:false};
 assert.equal(roomExitVisible(input),true);
 for(const override of [{paused:true},{seated:true},{playing:false},{inside:false}])assert.equal(roomExitVisible({...input,...override}),false);
});
test('shopfront, quay and cave boards are painted in Japanese, never the English key',()=>{
 const keys=['world/okinawa/quarters.js','world/okinawa/old-town.js'].flatMap(f=>[...readFileSync(new URL('../src/'+f,import.meta.url),'utf8').matchAll(/\b(?:jp|mark|upright):"([^"]+)"/g)].map(m=>m[1]));
 for(const key of [...keys,'Old Cave'])assert.doesNotMatch(japaneseSign(key),/[A-Za-z]/,key);
 assert.equal(japaneseSign('Laundry'),'コインランドリー');
 const source=readFileSync(new URL('../src/world/okinawa/signs.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/chars\.forEach\(\(c,i\)=>ctx\.fillText\(c,/,'upright boards draw each character through uprightChar, so ー runs down the board');
});
