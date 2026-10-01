import test from 'node:test';import assert from 'node:assert/strict';
import {restoreSakura} from '../src/commerce/sakura-economy.js';
import {applyStorageRestock,applyStorageOutcome,recoverStorageCarton,restockItem,consumeStorageWonHandshake,STORAGE_WON_KEY} from '../src/commerce/shop-stock.js';
test('stolen tea is sold out and a later automatic restock cannot resurrect it',()=>{
 const state={sakura:restoreSakura()};const initial=state.sakura.stock.tea.shelf+state.sakura.stock.tea.reserve;
 applyStorageRestock(state,1210,{lost:['tea']});assert.equal(state.sakura.stock.tea.shelf,0);
 assert.equal(state.sakura.stock.tea.shelf+state.sakura.stock.tea.reserve,initial-12);
 applyStorageRestock(state,2650);assert.equal(state.sakura.stock.tea.shelf,0);
});
test('night outcome, reward, and cave return survive save/reload exactly once across another cycle',()=>{
 let state={yen:100,sakura:restoreSakura()};const outcome={day:0,lost:['tea','tea','biscuits'],shooed:1,yen:150};
 const beforeTea=state.sakura.stock.tea.shelf+state.sakura.stock.tea.reserve;
 const beforeCoffee={...state.sakura.stock.coffee};
 assert.equal(applyStorageOutcome(state,1210,outcome).yen,50);
 assert.equal(state.yen,150);assert.deepEqual(state.sakura.caveCartons.sort(),['biscuit','tea']);
 const once=JSON.stringify(state);
 assert.equal(applyStorageOutcome(state,1210,outcome).applied,false);assert.equal(JSON.stringify(state),once);
 state={yen:state.yen,sakura:restoreSakura(JSON.parse(JSON.stringify(state.sakura)))};
 assert.equal(applyStorageOutcome(state,1210,outcome).applied,false);
 assert.equal(restockItem(state,'tea',12),0);
 assert.equal(recoverStorageCarton(state,'tea'),12);assert.equal(recoverStorageCarton(state,'tea'),0);
 assert.equal(state.sakura.stock.tea.shelf+state.sakura.stock.tea.reserve,beforeTea);
 assert.deepEqual(state.sakura.stock.coffee,beforeCoffee);assert.equal(state.sakura.stock.biscuit.shelf,0);
 assert.equal(applyStorageOutcome(state,2650,{day:1,lost:[],shooed:2,yen:100}).yen,100);
 assert.equal(state.yen,250);assert.equal(state.sakura.stock.biscuit.shelf,0);
 assert.equal(recoverStorageCarton(state,'biscuit'),12);
 assert.equal(applyStorageOutcome(state,4090,{day:2,lost:['tea'],shooed:0,yen:0}).applied,true);
 assert.equal(state.sakura.stock.tea.shelf,0);assert.equal(recoverStorageCarton(state,'tea'),12);
});
test('failed handshake removal and prototype names cannot issue coins or goods',()=>{
 globalThis.localStorage={getItem:()=>JSON.stringify({day:1,lost:['constructor','tea'],shooed:0,yen:150}),removeItem(){throw Error('blocked');}};
 assert.equal(consumeStorageWonHandshake(),null);localStorage.removeItem=()=>{};
 const h=consumeStorageWonHandshake();assert.deepEqual(h.lost,['tea']);assert.equal(h.yen,0);
});
test('a different local player cannot consume the pending result',()=>{
 const data=new Map([[STORAGE_WON_KEY,JSON.stringify({player:'player-2',day:1,shooed:1,yen:50})]]);
 globalThis.localStorage={getItem:k=>data.get(k),removeItem:k=>data.delete(k)};
 assert.equal(consumeStorageWonHandshake('player-1'),null);assert.ok(data.has(STORAGE_WON_KEY));
 assert.equal(consumeStorageWonHandshake('player-2').yen,50);assert.equal(data.size,0);
});
