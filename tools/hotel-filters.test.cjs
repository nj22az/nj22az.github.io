/* Execute the actual filter script against generated row attributes; no browser/layout claim. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'hotels/index.html'), 'utf8');
const decode = s => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const node = (dataset = {}) => ({dataset, hidden:false, textContent:'', addEventListener(){}, setAttribute(){}, querySelector(){return null;}, querySelectorAll(){return [];}});
const rows = [...html.matchAll(/<tr role="row" data-hotel-row=[^>]+>/g)].map(([tag]) => {
  const dataset = {};
  for(const [,k,v] of tag.matchAll(/data-([a-z-]+)="([^"]*)"/g)) dataset[k.replace(/-([a-z])/g, (_,c)=>c.toUpperCase())] = decode(v);
  return node(dataset);
});
const posts = rows.map(row => node({hotelNote:row.dataset.hotelRow}));
const fields = Object.fromEntries(['search','country','chain','parking','receipt','cardhold'].map(k=>[k,{value:k==='parking'?'free':''}]));
const events = {};
const form = {...node(), elements:{namedItem:k=>fields[k]}, addEventListener:(name,fn)=>events[name]=fn};
const badges = ['free','registered','easy','avoid','all','saved'].map(parkingCount=>node({parkingCount}));
const count = node(); const empty = node(); const feed = node(); const table = node(); let visibleIds=[];
const document = {
 querySelector: selector=>({'[data-hotel-filters]':form,'[data-hotel-notes]':feed,'[data-hotel-count]':count,'[data-hotel-empty]':empty,'[data-hotel-table]':table}[selector]||null),
 querySelectorAll: selector=>({'[data-hotel-row]':rows,'[data-hotel-note]':posts,'[data-parking-count]':badges}[selector]||[]),
 addEventListener(){},dispatchEvent:event=>{if(event.type==='hotel-filter-change')visibleIds=event.detail.visibleIds;}
};
vm.runInNewContext(fs.readFileSync(path.join(root,'hotels/hotels.js'),'utf8'),{document,window:{addEventListener(){},setTimeout:fn=>fn()},localStorage:{getItem:()=>null},navigator:{},location:{hash:''},CustomEvent:class{constructor(type,data){this.type=type;Object.assign(this,data);}},Set,Map});
let checks=0;
function check(expected){
 const shown=rows.filter(r=>!r.hidden).map(r=>r.dataset.hotelRow);
 assert.equal(shown.length,expected);checks++;
 assert.equal(posts.filter(p=>!p.hidden).length,expected);checks++;
 assert.deepEqual([...visibleIds],shown);checks++;
}
function filter(values){Object.entries(values).forEach(([k,v])=>fields[k].value=v);events.change();}
check(57);
filter({country:'NO',chain:'Scandic'});check(18);
filter({parking:'registered'});check(1);
assert.ok(visibleIds[0].startsWith('scandic-sunnfjord-hotel-spa-'));checks++;
assert.equal(badges.find(b=>b.dataset.parkingCount==='registered').textContent,1);checks++;
filter({parking:'avoid'});check(59);
filter({search:'Alta'});check(1);
filter({receipt:'true'});check(0);
filter({search:'',receipt:'unknown'});check(59);
filter({parking:'',receipt:''});check(78);
for(const search of ['Holberg','Sarpsborg']){filter({search});check(0);}
filter({country:'',chain:'',parking:'registered',search:''});check(4);
assert.equal(count.textContent,'4 hotels with free parking requiring registration');checks++;
filter({parking:'',country:'NO',chain:''});check(81); // 78 Scandics plus three pre-existing Thons.
filter({country:'',parking:'free'});check(57);
assert.equal(rows.find(r=>r.dataset.hotelRow.startsWith('scandic-vasteras-')).hidden,true);checks++;
console.log(`PASS: ${checks} filter assertions against generated HTML; map visibility event agrees with rows/cards. Layout and browser APIs not tested.`);
