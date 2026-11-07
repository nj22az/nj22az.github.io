// Appearance (the owner, 3 November 2026: "I need Dark and Light mode"): Auto follows the device, Light and Dark are
// pinned from the camera settings and remembered; a stored choice is on the page before app.js runs (no flash of the
// other theme); the browser's theme colour follows; every chosen chip and label keeps 4.5:1 against what it sits on in
// both themes; the games keep their paper in light and go black in dark; no page errors.
//   node camera/tests/theme.browser.mjs
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url));
const server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let checks=0;const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${name}`);};
const theme=page=>page.evaluate(()=>({attr:document.documentElement.dataset.theme,meta:document.querySelector('meta[name="theme-color"]').content,setting:document.getElementById('themeSetting').querySelector('span').textContent,stored:JSON.parse(localStorage.getItem('office-pocket-camera')).theme??null}));
// WCAG contrast of an element's text against the first painted background behind it.
const contrast=(page,selector)=>page.evaluate(sel=>{
 const el=document.querySelector(sel);if(!el)return null;
 const rgb=s=>{const m=s.match(/[\d.]+/g).map(Number);return {r:m[0],g:m[1],b:m[2],a:m.length>3?m[3]:1};};
 const lum=({r,g,b})=>{const f=c=>{c/=255;return c<=.03928?c/12.92:((c+.055)/1.055)**2.4;};return .2126*f(r)+.7152*f(g)+.0722*f(b);};
 let bg=null;for(let e=el;e;e=e.parentElement){const c=rgb(getComputedStyle(e).backgroundColor);if(c.a>0){if(!bg)bg=c;else{bg={r:bg.r*bg.a+c.r*(1-bg.a),g:bg.g*bg.a+c.g*(1-bg.a),b:bg.b*bg.a+c.b*(1-bg.a),a:1};}if(bg.a>=1)break;}}
 const fg=rgb(getComputedStyle(el).color),L1=lum(fg),L2=lum(bg||{r:255,g:255,b:255});
 return {ratio:+((Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05)).toFixed(2),fg:getComputedStyle(el).color,bg:bg&&`rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`};
},selector);
try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce',colorScheme:'light'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false})));
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);

 await check('Auto follows the device: a light device opens the camera light, with the browser’s theme colour to match',async()=>{
  assert.deepEqual(await theme(page),{attr:'light',meta:'#fbfaf7',setting:'Auto',stored:'auto'});
  assert.equal(await page.evaluate(()=>getComputedStyle(document.body).colorScheme),'light');
  await page.emulateMedia({colorScheme:'dark'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
  assert.equal((await theme(page)).meta,'#0d0e10','the device turned dark: so did the camera');
  await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');
 });

 await check('the Appearance setting pins Light or Dark and is remembered; Auto follows the device again',async()=>{
  const tap=()=>page.evaluate(()=>document.getElementById('themeSetting').click());
  await tap();assert.deepEqual(await theme(page),{attr:'light',meta:'#fbfaf7',setting:'Light',stored:'light'});
  await tap();assert.deepEqual(await theme(page),{attr:'dark',meta:'#0d0e10',setting:'Dark',stored:'dark'});
  await page.emulateMedia({colorScheme:'light'});await new Promise(r=>setTimeout(r,80));assert.equal((await theme(page)).attr,'dark','pinned: the device does not move it');
  await tap();assert.deepEqual(await theme(page),{attr:'light',meta:'#fbfaf7',setting:'Auto',stored:'auto'});
  assert.ok((await page.getAttribute('#themeSetting','aria-label')).startsWith('Appearance: Auto'));
 });

 await check('a stored choice is on the page before the app runs: no flash of the other theme',async()=>{
  const fresh=await browser.newPage({viewport:{width:390,height:844},colorScheme:'light'});
  await fresh.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false,theme:'dark'})));
  await fresh.goto(server.url+'camera/',{waitUntil:'domcontentloaded'});
  assert.equal(await fresh.evaluate(()=>document.documentElement.dataset.theme),'dark','set by the head script');
  await fresh.waitForFunction(()=>!!window.pocketCamera?.engine);
  assert.deepEqual(await theme(fresh),{attr:'dark',meta:'#0d0e10',setting:'Dark',stored:'dark'});
  await fresh.close();
 });

 await check('what is chosen reads in both themes: 4.5:1 or better for the chosen tab, the chosen crop shape, the labels and the hints',async()=>{
  await page.setInputFiles('#picker',join(root,'camera/samples/default-original.png'));
  await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===512);
  const pairs=['.segmented button[aria-selected=true]','.segmented button:not([aria-selected=true])','#autoValue','#autoHint','#makeupSummary','.crop-shapes button[aria-checked=true]','.crop-shapes button:not([aria-checked=true])','#cropZoomValue','.look-groups button[aria-selected=true]','.tile[aria-checked=true] .name','#saveEdit','#cancelEdit','.rail-look[aria-pressed=true] span','#compareOriginal'];
  for(const t of ['light','dark']){
   await page.evaluate(t=>{window.pocketCamera.state.theme=t;document.getElementById('themeSetting').click();},t==='light'?'auto':'light');
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),t);
   await page.click('#tabCrop');await page.click('#tabAdjust');await page.click('#tabLooks');await new Promise(r=>setTimeout(r,120));
   for(const sel of pairs){const c=await contrast(page,sel);if(c==null)continue;assert.ok(c.ratio>=4.5,`${t}: ${sel} reads at ${c.ratio}:1 (${c.fg} on ${c.bg})`);}
   await page.click('#tabCrop');for(const sel of ['.crop-shapes button[aria-checked=true]','.crop-shapes button:not([aria-checked=true])']){const c=await contrast(page,sel);assert.ok(c.ratio>=4.5,`${t}: ${sel} reads at ${c.ratio}:1 (${c.fg} on ${c.bg})`);}
   await page.click('#tabLooks');
  }
 });

 await check('the games keep their paper in light and go black in dark; the album’s entries follow',async()=>{
  await page.click('#cancelEdit');await page.evaluate(()=>document.getElementById('roll').click());await page.waitForSelector('#album:not([hidden])');
  await page.click('#openCardGames');await page.waitForSelector('#cardsHub:not([hidden])');
  // (the games' surfaces carry a transition; under reduced motion it is a millisecond long, but a headless frame can
  // take a while to tick, so the colour is waited for rather than read at once)
  const black='rgb(5, 5, 5)',settles=want=>page.waitForFunction(([b,w])=>(getComputedStyle(document.getElementById('cardsHub')).backgroundColor===b)===w,[black,want],{timeout:5000});
  await page.evaluate(()=>{window.pocketCamera.state.theme='dark';document.getElementById('themeSetting').click();});// Auto, on a light device
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'light');await settles(false);// paper
  await page.evaluate(()=>{window.pocketCamera.state.theme='light';document.getElementById('themeSetting').click();});
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');await settles(true);// black
  await page.click('#closeCardsHub');
 });

 assert.deepEqual(errors,[],errors.join('\n'));
 console.log(`theme: ${checks} checks passed`);
}finally{await browser.close();await server.close();}
