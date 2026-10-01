import test from 'node:test';
import assert from 'node:assert/strict';
import {restoreSakura} from '../src/commerce/sakura-economy.js';
import {SHOP_STOCK,closingStockPending,shelvesNeedRestock,applyStorageRestock,consumeStorageWonHandshake,STORAGE_WON_KEY,STORAGE_GOODS,stockSpec} from '../src/commerce/shop-stock.js';

function depletedState(){
  const sakura=restoreSakura();
  for(const item of SHOP_STOCK){
    sakura.stock[item.id]={shelf:Math.max(0,item.capacity-4),reserve:item.capacity*2};
  }
  sakura.restockedDay=-1;
  sakura.journal=[];
  return {sakura,minutes:1210};
}

test('applyStorageRestock fills shelves from reserve and marks the closing day',()=>{
  const state=depletedState();
  assert.equal(closingStockPending(state,state.minutes),true);
  assert.equal(shelvesNeedRestock(state),true);
  const first=applyStorageRestock(state,state.minutes);
  assert.ok(first.moved>0);
  assert.equal(first.dayMarked,true);
  for(const item of SHOP_STOCK){
    assert.equal(state.sakura.stock[item.id].shelf,item.capacity);
  }
  assert.equal(state.sakura.restockedDay,0);
  assert.equal(closingStockPending(state,state.minutes),false);
  assert.equal(shelvesNeedRestock(state),false);
});

test('applyStorageRestock is idempotent',()=>{
  const state=depletedState();
  const first=applyStorageRestock(state,state.minutes);
  const snapshot=JSON.stringify(state.sakura.stock);
  const journalLength=state.sakura.journal.length;
  const second=applyStorageRestock(state,state.minutes);
  assert.equal(second.moved,0);
  assert.equal(second.dayMarked,false);
  assert.equal(JSON.stringify(state.sakura.stock),snapshot);
  assert.equal(state.sakura.journal.length,journalLength);
  assert.equal(state.sakura.restockedDay,0);
  assert.ok(first.moved>0);
});

test('consumeStorageWonHandshake clears the localStorage key once',()=>{
  const storage=new Map();
  globalThis.localStorage={
    getItem:k=>storage.has(k)?storage.get(k):null,
    setItem:(k,v)=>storage.set(k,String(v)),
    removeItem:k=>storage.delete(k),
  };
  localStorage.setItem(STORAGE_WON_KEY,JSON.stringify({day:2,assisted:true,t:123}));
  const once=consumeStorageWonHandshake();
  assert.deepEqual(once,{day:2,assisted:true,lost:[],shooed:0,yen:0,t:123},'an older handshake reads as a night with nothing lost');
  assert.equal(localStorage.getItem(STORAGE_WON_KEY),null);
  assert.equal(consumeStorageWonHandshake(),null);
});

test('what Bizarro Minato carried down the hole stays off the shelf, and is remembered for the sea cave',()=>{
  const state=depletedState();
  const result=applyStorageRestock(state,state.minutes,{lost:['biscuits','onigiri']});
  assert.deepEqual(result.short.sort(),[stockSpec('biscuit').name,stockSpec('rice').name].sort());
  assert.equal(state.sakura.stock.biscuit.shelf,stockSpec('biscuit').capacity-4,'the biscuits were not restocked');
  assert.equal(state.sakura.stock.tea.shelf,stockSpec('tea').capacity,'everything else was');
  assert.ok(state.sakura.journal.some(r=>r.kind==='Lost'&&r.buyer==='Bizarro Minato'));
  state.sakura.caveCartons=['biscuit','rice','nonsense'];
  assert.deepEqual(restoreSakura(state.sakura).caveCartons,['biscuit','rice'],'a save keeps the cartons waiting in the cave');
  for(const good of Object.values(STORAGE_GOODS))assert.ok(stockSpec(good),good+' is a Sakura good');
});

test('the handshake keeps only real goods and no more coins than three visitors could drop',()=>{
  const storage=new Map();
  globalThis.localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
  localStorage.setItem(STORAGE_WON_KEY,JSON.stringify({day:3,lost:['tea','gold bars'],shooed:40,yen:99999,t:1}));
  const read=consumeStorageWonHandshake();
  assert.deepEqual(read.lost,['tea']);assert.equal(read.shooed,3);assert.equal(read.yen,150);
});
