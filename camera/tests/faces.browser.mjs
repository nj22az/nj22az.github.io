// The Pocket faces round (the owner, 5 November 2026, from the Game Boy Camera study: "Build 1, 3 and 4"): the greeter
// dances and a tap or the arrow keys change its tempo; a refused camera is met by a face and its line; a failure's
// toast carries a face; Cancel after a change is "Who are you running from?" and Cancel without one is not; the
// Secret tab is locked with a hint until a Memory win opens it, with the secret face's toast, eight faces in the
// picker and a Memory deck of them; no page errors.
//   node camera/tests/faces.browser.mjs
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
const shots=process.env.CAMERA_SHOTS;
const shot=async(page,name)=>{if(shots)await page.screenshot({path:join(shots,`${name}.png`)});};
// The app's own picker clears its value before it opens, so the same photo can be chosen twice; a test must do the same.
const openPortrait=async page=>{await page.evaluate(()=>{document.getElementById('picker').value='';});await page.setInputFiles('#picker',join(root,'camera/tests/fixtures/portrait-braids.jpg'));await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===640);};
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>{
  localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},kept:true,printer:false,auto:false}));
  // The camera refused, as a browser setting would: the welcome stays, and the refusal is met by a face.
  navigator.mediaDevices.getUserMedia=()=>Promise.reject(Object.assign(new Error('refused'),{name:'NotAllowedError'}));
 });
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 await page.waitForSelector('#welcome:not([hidden])');
 const toast=()=>page.evaluate(()=>{const t=document.getElementById('toast'),img=t.querySelector('img');return {text:[...t.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(''),show:t.classList.contains('show'),face:t.classList.contains('has-face'),alt:img?.alt||null,src:img?.src||null};});
 const waitToastFace=text=>page.waitForFunction(text=>{const t=document.getElementById('toast');return t.classList.contains('show')&&t.textContent.includes(text)&&!!t.querySelector('img')?.complete;},text,{timeout:15000});

 await check('the greeter dances; a tap steps the tempo round, Up and Down step it',async()=>{
  await page.waitForFunction(()=>document.getElementById('welcomeSticker').classList.contains('dancing')&&!document.getElementById('welcomeSticker').hidden,null,{timeout:20000});
  const tempo=()=>page.evaluate(()=>({t:window.pocketCamera.danceTempo,v:document.getElementById('welcomeSticker').style.getPropertyValue('--dance'),anim:getComputedStyle(document.getElementById('welcomeSticker')).animationName}));
  let s=await tempo();assert.equal(s.t,0);assert.equal(s.anim,'welcome-dance');
  await page.click('.welcome-hero');s=await tempo();assert.equal(s.t,1);assert.equal(s.v,'0.72s');
  await page.keyboard.press('ArrowUp');s=await tempo();assert.equal(s.t,2);assert.equal(s.v,'0.46s');
  await page.keyboard.press('ArrowUp');s=await tempo();assert.equal(s.t,2,'no faster than the fastest');
  await page.keyboard.press('ArrowDown');s=await tempo();assert.equal(s.t,1);
  await page.click('.welcome-hero');await page.click('.welcome-hero');s=await tempo();assert.equal(s.t,0,'round again');
 });

 await check('a refused camera is met by a Pocket face with its line, before the explanation',async()=>{
  await page.click('#startCamera');
  await page.waitForFunction(()=>!document.getElementById('welcomeFace').hidden&&document.getElementById('welcomeFace').complete,null,{timeout:15000});
  const r=await page.evaluate(()=>({line:document.getElementById('welcomeFaceLine').textContent,note:document.getElementById('welcomeNote').textContent,alt:document.getElementById('welcomeFace').alt,src:document.getElementById('welcomeFace').src}));
  assert.equal(r.line,'“Who are you hiding from?”');assert.match(r.note,/not allowed/);assert.match(r.alt,/^Thao, shushing/);assert.match(r.src,/pocket-faces\/hide\.thumb\.png$/);
  await shot(page,'1-refused-camera');
 });

 await check('a failure\'s toast carries one of the faces',async()=>{
  // The picker's dialog only offers pictures (a stray file is left out quietly); a file handed over any other way is met
  // with the message and a face.
  await page.evaluate(()=>window.pocketCamera.editFile(new File(['not a picture'],'notes.txt',{type:'text/plain'})));
  await waitToastFace('That is not a picture');
  const t=await toast();assert.ok(t.face&&t.alt&&/pocket-faces\/(oops|nope|wait|silly)\.thumb\.png$/.test(t.src),JSON.stringify(t));
  await shot(page,'2-failure-face');
 });

 await check('Cancel after a change is "Who are you running from?"; Cancel without one is quiet',async()=>{
  await openPortrait(page);
  await page.click('#cancelEdit');await page.waitForTimeout(400);
  let t=await toast();assert.ok(!t.show||!t.text.includes('running'),'no face for an unchanged edit');
  await openPortrait(page);
  await page.click('#tabLooks');await page.click('#lookGroups button[data-group="photo"]');await page.click('#strip .tile[data-look="mono"]');
  await page.waitForFunction(()=>window.pocketCamera.state.edit.recipe.layers[0].look==='mono');
  await page.click('#cancelEdit');
  await waitToastFace('Who are you running from?');
  t=await toast();assert.equal(t.text,'Who are you running from?');assert.match(t.alt,/^Thuan, fuming/);
  assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit),null,'the editor closed all the same');
  await shot(page,'3-running-from');
 });

 await check('the secret sheet\'s tab is a lock with a hint, and holds no stickers yet',async()=>{
  await openPortrait(page);
  await page.click('#tabStickers');await page.click('#stickerSets button:text-is("Minato")');
  await page.waitForSelector('#stickerGroups button.locked');
  const r=await page.evaluate(()=>{const b=document.querySelector('#stickerGroups button.locked');return {text:b.textContent,lock:!!b.querySelector('svg use[href="#i-lock"]'),aria:b.getAttribute('aria-label'),fits:b.scrollWidth<=b.clientWidth+1};});
  assert.equal(r.text,'','the lock alone');assert.ok(r.lock&&r.fits);assert.match(r.aria,/^Faces sheet, locked\. Win a game of Memory or Solitaire to open this sheet\./);
  await page.click('#stickerGroups button.locked');
  await page.waitForSelector('.sticker-locked');
  const hint=await page.evaluate(()=>({how:document.querySelector('.sticker-locked-how').textContent,choices:document.querySelectorAll('#stickerGrid .sticker-choice').length,what:document.querySelector('.sticker-locked p').textContent}));
  assert.equal(hint.how,'Win a game of Memory or Solitaire to open this sheet.');assert.equal(hint.choices,0);assert.match(hint.what,/scribbled over/);
  await shot(page,'4-locked-tab');
  await page.click('#cancelEdit');
 });

 await check('a Memory win opens the sheet: the secret face\'s toast, eight faces in the picker, a Memory deck of them',async()=>{
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('office-pocket-camera')).unlocked),undefined);
  await page.evaluate(()=>window.pocketCamera.openMemory());
  await page.waitForSelector('.memory-deck[data-deck="set:Cartoon Thuan"]:not([disabled])',{timeout:20000});
  assert.equal(await page.locator('.memory-deck[data-deck="set:Pocket faces"]').count(),0,'no deck of the faces before the win');
  await page.click('.memory-deck[data-deck="set:Cartoon Thuan"]');await page.locator('.memory-pairs button',{hasText:/^6$/}).click();
  await page.click('.memory-play');await page.waitForSelector('.memory-card');await page.waitForTimeout(300);
  const pairs=await page.evaluate(()=>window.pocketCamera.memory.game.cards.map(c=>c.pair));
  for(const p of [...new Set(pairs)]){for(const i of pairs.map((v,i)=>v===p?i:-1).filter(i=>i>=0))await page.locator('.memory-card').nth(i).click();await page.waitForTimeout(60);}
  await page.waitForSelector('.memory-win:not([hidden])',{timeout:8000});
  await waitToastFace('The secret sheet is yours!');
  const t=await toast();assert.match(t.alt,/^Thao, ta-da/);
  await shot(page,'5-unlocked');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('office-pocket-camera')));
  assert.deepEqual(saved.unlocked,['pocket-faces']);assert.equal(saved.wins.memory,1);
  await page.locator('.memory-win button',{hasText:'Other cards'}).click();
  await page.waitForSelector('.memory-deck[data-deck="set:Pocket faces"]',{timeout:10000});
  await page.click('#closeMemory');
  await openPortrait(page);
  await page.click('#tabStickers');await page.waitForSelector('#stickerSets button');
  await page.click('#stickerSets button:text-is("Minato")');await page.waitForSelector('#stickerGroups button');
  assert.equal(await page.locator('#stickerGroups button.locked').count(),0,'no lock now');
  await page.locator('#stickerGroups button',{hasText:'Faces'}).click();
  await page.waitForSelector('#stickerGrid .sticker-choice[data-id^="pocket-faces/"]');
  const faces=await page.evaluate(()=>[...document.querySelectorAll('#stickerGrid .sticker-choice')].map(b=>b.dataset.id));
  assert.deepEqual(faces,['run','hide','oops','silly','full','secret','wait','nope'].map(k=>`pocket-faces/${k}`));
  await page.click('#stickerGrid .sticker-choice[data-id="pocket-faces/run"]');
  const placed=await page.evaluate(()=>window.pocketCamera.state.edit.recipe.stickers.map(s=>s.id));
  assert.deepEqual(placed,['pocket-faces/run'],'a face goes on the photo like any sticker');
  await shot(page,'6-faces-sheet');
 });

 await check('the error faces are three, with the rare fourth one time in eight',async()=>{
  const r=await page.evaluate(async()=>{const m=await import('/camera/pocket-faces.js?v=20261105fun1');return {a:m.errorFace(()=>.5),b:m.errorFace(()=>.99),c:m.errorFace(()=>0),kinds:m.FACE_KINDS};});
  assert.equal(r.a,'nope');assert.equal(r.b,'wait');assert.equal(r.c,'silly');assert.equal(r.kinds.length,8);
 });
 assert.deepEqual(errors,[],'no page errors');
 console.log(`faces: ${checks} checks passed`);
}finally{await browser.close();await server.close();}
