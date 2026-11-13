// What the pickers offer first (camera/picks.js): Looks picked for a photo, and the stickers' first page.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {lookPrior,lookPicks,lookCandidates,usedLately,stickerPicks,untilSeason} from '../picks.js';
import {LOOKS} from '../looks-gl.js';
const dir=fileURLToPath(new URL('../stickers/',import.meta.url));
const sheet=async name=>JSON.parse(await readFile(dir+name,'utf8'));

// ---- Looks ----
const plain=lookPrior();
for(const [name,v] of Object.entries(plain)){assert.ok(name in LOOKS,`${name} is a Look`);assert.ok(v>=0&&v<=1,`${name}: ${v}`);}
assert.ok(!('none' in plain),'the photo as it is is not a pick: it is always offered first');
const dark=lookPrior({median:.18,saturation:.2,edge:.06,red:.3,blue:.34}),bright=lookPrior({median:.7,saturation:.25,edge:.06,red:.6,blue:.55});
assert.ok(dark.nightVision>plain.nightVision+.2&&dark.neon>plain.neon,'a dark photo: night vision, neon');
assert.ok(dark.watercolour<plain.watercolour&&bright.watercolour>plain.watercolour,'watercolour wants light');
const pale=lookPrior({median:.5,saturation:.08,edge:.06,red:.5,blue:.5}),vivid=lookPrior({median:.5,saturation:.5,edge:.06,red:.5,blue:.5});
assert.ok(pale.mono>vivid.mono&&vivid.popArt>pale.popArt,'a pale photo: mono; a colourful one: pop art');
const busy=lookPrior({median:.5,saturation:.25,edge:.14,red:.5,blue:.5}),smooth=lookPrior({median:.5,saturation:.25,edge:.03,red:.5,blue:.5});
assert.ok(busy.lines>smooth.lines&&smooth.flat>busy.flat,'a busy photo: lines; a plain one: flat colour');
const face=lookPrior({},{face:true});
assert.ok(face.manga>plain.manga&&face.thermal<plain.thermal,'a face: manga, not a heat map');

const kinds={mono:'photo',sepia:'photo',instant:'photo',tilt:'photo',negative:'photo',nightVision:'photo',manga:'drawn',lines:'drawn',sketchbook:'drawn',adventureInk:'drawn',popArt:'pop',poster:'pop',watercolour:'painted',oil:'painted',pocket:'games'};
const kindOf=name=>kinds[name]||'other';
const picks=lookPicks({prior:plain,recent:['pocket','pocket','none','manga','sepia'],kindOf});
assert.equal(picks[0],'none');assert.deepEqual(picks.slice(1,3),['pocket','manga'],'two used lately, each once, never the photo as it is');
assert.equal(picks.length,9);assert.equal(new Set(picks).size,picks.length,'no Look twice');
const perKind=new Map();for(const name of picks.slice(3)){const k=kindOf(name);perKind.set(k,(perKind.get(k)||0)+1);}
for(const [k,n] of perKind)assert.ok(n<=2,`${k}: ${n} picks`);
assert.ok(picks.includes('instant')&&picks.includes('watercolour'),'the widest liked are among the picks');
assert.ok(!lookPicks({prior:plain,kindOf,available:name=>name!=='watercolour'}).includes('watercolour'),'a Look that cannot be drawn is not offered');
// How a candidate really comes out outweighs the guess.
const tried=lookPicks({prior:{a:.6,b:.5,c:.4},scores:{a:.1,b:.9,c:.8},kindOf:()=>'x',count:2});
assert.deepEqual(tried,['none','b','c']);
assert.deepEqual(lookPicks({prior:{a:.6,b:.5},count:6}),['none','a','b'],'fewer Looks than asked for is fine');
const candidates=lookCandidates(dark,{count:5});
assert.equal(candidates.length,5);assert.ok(candidates.includes('nightVision'));
assert.deepEqual(usedLately(['a','b','c'],'b',3),['b','a','c']);assert.deepEqual(usedLately(undefined,'a'),['a']);assert.deepEqual(usedLately(['a','b','c'],'d',3),['d','a','b']);

// ---- Stickers ----
const manifest=JSON.parse(await readFile(dir+'stickers.json','utf8')),list=JSON.parse(await readFile(dir+'sheets.json','utf8'));
const sets=[...manifest.sets,...await Promise.all(list.sheets.map(sheet))].filter(set=>set.kind!=='secret');
const titles=rows=>rows.map(r=>r.title),ids=rows=>rows.flatMap(r=>r.stickers.map(s=>s.id));
const nov=stickerPicks({sets,today:new Date(2026,10,13)});
assert.deepEqual(titles(nov),['Christmas','Today'],'nothing used yet, no face: the season to come and today\'s handful');
assert.ok(nov[0].stickers.every(s=>s.id.startsWith('christmas/')));
for(const r of nov)assert.ok(r.stickers.length>0&&r.stickers.length<=8,`${r.title}: ${r.stickers.length}`);
assert.equal(new Set(ids(nov)).size,ids(nov).length,'no sticker twice on the page');
const oct=stickerPicks({sets,today:new Date(2026,9,20)});
assert.equal(oct[0].title,'Halloween');
assert.ok(oct[0].stickers.some(s=>s.id.startsWith('halloween/'))&&oct[0].stickers.some(s=>s.id.startsWith('halloween-cute/')),'both Halloween sheets share the row');
assert.equal(stickerPicks({sets,today:new Date(2026,6,20)})[0].title,'Matsuri');
assert.equal(stickerPicks({sets,today:new Date(2027,0,20)})[0].title,'Tết');
const used=stickerPicks({sets,recent:['cute/frog-tea','gone/away','christmas/cat-tree'],face:true,today:new Date(2026,10,13)});
assert.deepEqual(titles(used),['Lately','Christmas','To wear','Today']);
assert.deepEqual(used[0].stickers.map(s=>s.id),['cute/frog-tea','christmas/cat-tree'],'a sticker that is gone is left out');
assert.ok(!used[1].stickers.some(s=>s.id==='christmas/cat-tree'),'what is shown under Lately is not shown again');
assert.deepEqual(used[2].stickers.map(s=>s.id).slice(0,3),['bits/crown','bits/shades','bits/bow']);
const today=stickerPicks({sets,today:new Date(2026,10,13)}).at(-1),again=stickerPicks({sets,today:new Date(2026,10,13)}).at(-1),tomorrow=stickerPicks({sets,today:new Date(2026,10,14)}).at(-1);
assert.deepEqual(today.stickers.map(s=>s.id),again.stickers.map(s=>s.id),'the same all day');
assert.notDeepEqual(today.stickers.map(s=>s.id),tomorrow.stickers.map(s=>s.id),'another handful tomorrow');
assert.ok(new Set(today.stickers.map(s=>s.id.split('/')[0])).size>=4,'from several sheets');
assert.ok(today.stickers.every(s=>!/^(marks|matsuri|showa|christmas|johansson-studios)\//.test(s.id)),'the friends and the residents, not things or marks');
assert.equal(untilSeason({when:[12]},new Date(2026,10,13)),1);assert.equal(untilSeason({when:[10]},new Date(2026,10,13)),11);assert.equal(untilSeason({},new Date()),12);
console.log(`picks: ${Object.keys(plain).length} Looks weighed; ${picks.length} offered first; the stickers' first page through the year`);
