import test from 'node:test';
import assert from 'node:assert/strict';
import {drawStatement} from '../scene-lettering.js';
// Deterministic text metrics isolate fitting from browser-specific font selection.
const context=()=>new Proxy({font:'',measureText(text){return {width:Array.from(text).length*parseFloat(this.font.split(' ')[1])*.8};}},{get(o,k){return k in o?o[k]:()=>{};}});
test('Japanese speech without spaces wraps above the speaker at readable size',()=>{
 const text='人生、まだまだできることがあるでしょ。外に出て、何かやってみたら？';
 const result=drawStatement(context(),1000,750,text,.3,.5);
 assert.ok(result.lines.length>1);assert.equal(result.lines.join(''),text);
 assert.ok(result.fontSize>30);assert.ok(result.bottom<result.headTop);
});
test('Vietnamese accents survive bubble fitting',()=>{
 const text='Anh còn có thể làm được bao điều trong đời. Ra ngoài làm gì đó có ý nghĩa đi!';
 const result=drawStatement(context(),1000,750,text,.3,.5);
 assert.equal(result.lines.join(' '),text);assert.ok(result.bottom<result.headTop);
});
