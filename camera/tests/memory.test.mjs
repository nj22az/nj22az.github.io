// Memory's board: the grid that gives the cards the most room, full rows only (node --test camera/tests/memory.test.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import {fitBoard,PAIRS} from '../memory.js';

test('every board size fills whole rows and fits inside the screen it is given',()=>{
 for(const [w,h] of [[366,560],[351,460],[1256,700],[700,900]])for(const p of PAIRS){
  const n=p*2,fit=fitBoard(n,w,h,.8,8);
  assert.equal(fit.cols*fit.rows,n,`${n} cards in ${fit.cols}×${fit.rows}`);
  assert.ok(fit.cols*fit.w+(fit.cols-1)*8<=w+1e-6&&fit.rows*fit.h+(fit.rows-1)*8<=h+1e-6,`${n} cards fit ${w}×${h}`);
 }
});
test('a tall phone gets more rows than columns, a wide window more columns',()=>{
 const phone=fitBoard(16,366,560),desk=fitBoard(16,1256,700);
 assert.ok(phone.rows>=phone.cols);assert.ok(desk.cols>desk.rows);
 // And no other grid would give bigger cards.
 for(let cols=1;cols<=16;cols++)if(16%cols===0){const rows=16/cols,w=Math.min((366-8*(cols-1))/cols,(560-8*(rows-1))/rows*.8);assert.ok(w<=phone.w+1e-9);}
});
