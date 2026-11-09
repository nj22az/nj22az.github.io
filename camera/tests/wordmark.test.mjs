// Johansson World's wordmark on the camera's title card is the outlines tools/draw-camera-wordmark.py drew from the
// World's own typeface, set into the page by tools/apply-camera-wordmark.mjs: the page's block is exactly those
// outlines, the wordmark is JOHANSSON over WORLD at the World's proportions, the brand's typeface is the camera's own
// files with their licence, and nothing of the first cut's toy wordmark is left.
//   node camera/tests/wordmark.test.mjs
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {wordmarkBlock} from '../../tools/apply-camera-wordmark.mjs';
const root=new URL('../../',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');
const page=await read('camera/index.html'),css=await read('camera/camera-brand.css'),data=JSON.parse(await read('camera/brand/wordmark.json'));
assert.ok(page.includes(await wordmarkBlock()),'camera/index.html carries the outlines of camera/brand/wordmark.json (node tools/apply-camera-wordmark.mjs)');
assert.equal((page.match(/class="world-mark"/g)||[]).length,1,'the wordmark is on the page once');
// The World's setting (johansson-town/title-screen.css on a phone): 28 px over 24 px, .035em and .18em of air, 4 px apart.
assert.deepEqual(data.setting.main,{text:'JOHANSSON',size:28,spacing:.035,line:1.12});
assert.deepEqual(data.setting.town,{text:'WORLD',size:24,spacing:.18,line:1.1});assert.equal(data.setting.gap,4);
assert.equal(data.setting.kana.text,'ポケットカメラ');
const w=data.wordmark;
assert.ok(w.mainWidth>w.townWidth&&w.townWidth/w.mainWidth>.5&&w.townWidth/w.mainWidth<.7,`WORLD is a little over half of JOHANSSON’s width (${w.townWidth} of ${w.mainWidth})`);
assert.ok(Math.abs(w.width/w.height-3.79)<.05,`the wordmark’s box is ${w.width} × ${w.height}`);
assert.ok(w.main.length>2000&&w.town.length>1000&&/^M[\d.]/.test(w.main),'outlines, not text');
assert.match(await read('camera/brand/world-wordmark.svg'),/fill="#263d39"[^>]*d="M[^"]+"\/><path fill="#16815e"/,'the standalone mark is in the World’s ink and green');
// The typeface: two files of the camera's own, declared once each, with the licence beside them.
for(const weight of [700,800]){
 assert.match(css,new RegExp(`@font-face\\{font-family:"LINE Seed JP";font-style:normal;font-weight:${weight};font-display:swap;src:url\\("fonts/line-seed-jp-latin-${weight}\\.woff2"\\) format\\("woff2"\\)\\}`));
 const size=(await stat(new URL(`camera/fonts/line-seed-jp-latin-${weight}.woff2`,root))).size;assert.ok(size>3000&&size<20000,`the ${weight} file is a Latin cut (${size} bytes)`);
}
assert.match(await read('camera/fonts/OFL-LINESeedJP.txt'),/SIL Open Font License, Version 1\.1/);
assert.match(await read('camera/camera.css'),/--font-brand:"LINE Seed JP",/);
assert.doesNotMatch(page+css,/fonts\.googleapis|fonts\.gstatic/,'the camera loads no font from another host (it works offline)');
// The first cut (9 November 2026, from stylesheets the World no longer shows) is gone.
assert.doesNotMatch(page+css,/world-mark-main|world-mark-town|world-mark-jp|--wm-sun|#ffd54a|#d7263d/,'nothing of the toy wordmark is left');
assert.doesNotMatch(css+await read('camera/camera.css'),/#142d37|#ece3c9|#b65940/,'nor the navy, paper and rust a first reading took for the World’s');
console.log('wordmark: the page carries the World’s outlines; the brand type is the camera’s own files');
