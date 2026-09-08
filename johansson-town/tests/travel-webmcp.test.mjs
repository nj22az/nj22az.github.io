import {test} from 'node:test';
import assert from 'node:assert/strict';
import {installDOM,Element} from './fixtures.mjs';

test('WebMCP reports locked walking directions and only travels after unlock',async()=>{
 installDOM();globalThis.CSS={escape:s=>s};window.__JOHANSSON_RUNNING__=true;document.querySelector('#hud').classList.remove('hidden');
 document.modelContext={registerTool(){}};
 const button=new Element(),label=new Element();button.dataset={id:'izakaya',travel:'locked'};label.textContent='Minato Izakaya';button.querySelector=()=>label;
 let marked=0,moved=0;button.click=()=>{if(button.dataset.travel==='ready')moved++;else marked++;};
 const query=document.querySelector;document.querySelector=s=>s.includes('[data-id=')?button:query(s);
 document.querySelectorAll=s=>s.includes('#directoryGrid')?[button]:[];
 document.querySelector('#directoryButton').click=()=>document.querySelector('#directory').classList.remove('hidden');
 await import('../webmcp.js');const api=window.__JOHANSSON_AGENT_API__;
 let result=JSON.parse(await api.travel({destination:'izakaya'}));assert.equal(result.ok,false);assert.match(result.error,/locked/);assert.equal(marked,1);assert.equal(moved,0);
 button.dataset.travel='ready';result=JSON.parse(await api.travel({destination:'izakaya'}));assert.equal(result.ok,true);assert.equal(moved,1);
});
