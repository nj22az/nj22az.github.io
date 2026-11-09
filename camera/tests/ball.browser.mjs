// Ball in the Game Room (the owner, 5 November 2026: "I would like 2 also"; 6 November: "The ball game should have
// four frames and the ball game doesn't quite work as you made it"): the hub's fourth game; the setup offers a Pocket
// face, the booth and the album's photos with a face found; the LCD shows the juggler and the hands swing together to
// the side tapped, pressed or clicked; played perfectly (the game stepped by hand) the score climbs to five hundred,
// which opens the secret sheet and makes the juggler a sticker under Mine; a drop ends the game with the score kept as
// the best; the booth takes four faces from the (fake) front camera and the juggler's head changes between them while
// playing; a chosen face from the album is cut out and worn; no page errors.
//   node camera/tests/ball.browser.mjs
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url));
const server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
let checks=0;const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${name}`);};
const shots=process.env.CAMERA_SHOTS;
const shot=async(page,name)=>{if(shots)await page.screenshot({path:join(shots,`${name}.png`)});};
try{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,reducedMotion:'reduce',permissions:['camera']});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},kept:true,printer:false,auto:false})));
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 await page.waitForFunction(()=>window.pocketCamera.state.shots.length>=2);
 const game=()=>page.evaluate(()=>{const g=window.pocketCamera.cardGame?.game;return g?{...g.state,balls:g.state.balls.map(b=>({...b}))}:null;});
 // Perfect play, stepping the game by hand: the hands swing to the side of the ball about to come down.
 const playPerfect=async n=>page.evaluate(n=>{const c=window.pocketCamera.cardGame,g=c.game,STEPS=7;
  for(let t=0;t<n&&!g.state.over;t++){const b=g.state.balls.find(b=>Math.abs(b.pos-(b.from==='left'?STEPS-1:0))===1);if(b)g.moveHands(b.from==='left'?'right':'left');c.step();}
  return g.state.score;},n);
 const headPixels=()=>page.evaluate(()=>{const c=document.querySelector('canvas.ball-lcd'),g=c.getContext('2d'),W=c.width,H=c.height;return [...g.getImageData(W/2-W*.04,H*.24,W*.08,H*.12).data];});   // the middle of the head

 await check('the Game Room offers Ball; its setup shows a Pocket face, the booth and Play',async()=>{
  await page.evaluate(()=>window.pocketCamera.openMemory());await page.click('#closeMemory').catch(()=>{});
  await page.click('#openCardGames');await page.waitForSelector('#cardsHub:not([hidden])');
  assert.deepEqual(await page.$$eval('#cardsHub .game-choice strong',e=>e.map(x=>x.textContent)),['Memory','Blackjack','Solitaire','Ball']);
  await page.click('#chooseBall');await page.waitForSelector('#cardGame:not([hidden]) .ball-game');
  assert.equal(await page.textContent('#cardGameTitle'),'Ball');
  await page.waitForSelector('.ball-face[data-face="own"] img[src*="pocket-faces/"]',{timeout:20000});
  const r=await page.evaluate(()=>({faces:[...document.querySelectorAll('.ball-face')].map(b=>b.dataset.face),checked:document.querySelector('.ball-face[aria-checked="true"]')?.dataset.face,best:document.querySelector('.ball-best').textContent}));
  assert.equal(r.checked,'own');assert.deepEqual(r.faces,['own','take','pick']);assert.equal(r.best,'No game yet');
  await shot(page,'1-setup');
 });

 await check('Play shows the LCD; a tap on a half, the arrow keys and the buttons swing the hands to that side',async()=>{
  await page.click('.ball-play');await page.waitForSelector('.ball-stage:not([hidden]) canvas.ball-lcd');
  await page.evaluate(()=>window.pocketCamera.cardGame.step());
  let g=await game();assert.equal(g.balls.length,1);assert.equal(g.hands,'left');
  const box=await page.locator('canvas.ball-lcd').boundingBox();
  await page.mouse.click(box.x+box.width*.75,box.y+box.height/2);g=await game();assert.equal(g.hands,'right','a tap on the right half');
  await page.mouse.click(box.x+box.width*.25,box.y+box.height/2);g=await game();assert.equal(g.hands,'left','a tap on the left half');
  await page.keyboard.press('ArrowRight');g=await game();assert.equal(g.hands,'right','the right arrow');
  await page.click('.ball-hand[data-side="left"]');g=await game();assert.equal(g.hands,'left','the Left button');
  const px=await page.evaluate(()=>{const c=document.querySelector('canvas.ball-lcd'),g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data;let ink=0,paper=0;for(let i=0;i<d.length;i+=16){if(d[i]<80&&d[i+1]<90)ink++;else if(d[i]>150&&d[i+1]>160)paper++;}return {ink,paper};});
  assert.ok(px.ink>200&&px.paper>px.ink,JSON.stringify(px));
  await shot(page,'2-lcd');
 });

 await check('played perfectly the score climbs to five hundred: the secret sheet opens and the juggler becomes a sticker',async()=>{
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('office-pocket-camera')).unlocked),undefined);
  const score=await playPerfect(400);
  assert.ok(score>=500,`five hundred reached: ${score}`);
  const g=await game();assert.equal(g.over,false);assert.equal(g.balls.length,3,'a third ball after a hundred');assert.equal(g.won,true);
  await page.waitForFunction(()=>{const t=document.getElementById('toast');return t.classList.contains('show')&&t.textContent.includes('secret sheet')&&!!t.querySelector('img');},null,{timeout:15000});
  await page.waitForFunction(()=>(JSON.parse(localStorage.getItem('office-pocket-camera')).jugglerStickers||[]).length===1,null,{timeout:15000});
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('office-pocket-camera')));
  assert.deepEqual(saved.unlocked,['pocket-faces']);assert.equal(saved.wins.ball,1);assert.deepEqual(saved.jugglerStickers,['pocket']);
  await page.waitForFunction(()=>{const t=document.getElementById('toast');return t.classList.contains('show')&&t.textContent.includes('juggler is a sticker');},null,{timeout:15000});
  await shot(page,'3-five-hundred');
 });

 await check('a drop ends the game: the score and the catches, the best kept, Play again and Other games, a result to share',async()=>{
  const before=await game();
  await page.evaluate(()=>{const c=window.pocketCamera.cardGame,g=c.game;for(let t=0;t<20&&!g.state.over;t++){const b=g.state.balls.find(b=>Math.abs(b.pos-(b.from==='left'?6:0))===1);if(b)g.moveHands(b.from==='left'?'left':'right');c.step();}});
  const g=await game();assert.equal(g.over,true);assert.ok(g.score>=before.score);
  await page.waitForSelector('.ball-over:not([hidden])',{timeout:10000});
  const r=await page.evaluate(()=>({h:document.querySelector('.ball-over h3').textContent,p:document.querySelector('.ball-over p').textContent,buttons:[...document.querySelectorAll('.ball-over .button')].map(b=>b.textContent),share:document.querySelectorAll('.ball-over .result-share-button').length,best:JSON.parse(localStorage.getItem('office-pocket-camera')).ballBest,status:document.querySelector('.ball-status').textContent}));
  assert.equal(r.h,'Five hundred!');assert.match(r.p,/^\d+ points · \d+ catches$/);assert.deepEqual(r.buttons,['Play again','Other games']);assert.equal(r.share,2);assert.equal(r.best,g.score);assert.match(r.status,/^Dropped\. \d+ points$/);
  await shot(page,'4-dropped');
  await page.click('.ball-over .button:not(.primary)');await page.waitForSelector('#cardsHub:not([hidden])');
 });

 await check('the booth takes four faces from the front camera, and the head changes between them while playing',async()=>{
  await page.click('#chooseBall');await page.waitForSelector('.ball-face[data-face="take"]',{timeout:20000});
  await page.click('.ball-face[data-face="take"]');await page.waitForSelector('.ball-booth:not([hidden]) video');
  await page.waitForFunction(()=>document.querySelector('.ball-video').videoWidth>0,null,{timeout:20000});
  assert.equal(await page.textContent('.ball-booth-count'),'1 of 4');
  for(let i=0;i<4;i++){await page.click('.ball-booth-take');await page.waitForFunction(n=>document.querySelectorAll('.ball-booth-frames img').length===n,i+1,{timeout:10000});await page.waitForTimeout(250);}
  assert.equal(await page.textContent('.ball-booth-count'),'Four faces');
  assert.ok(await page.isHidden('.ball-booth-take')&&await page.isVisible('.ball-booth-use'));
  await shot(page,'5-booth');
  await page.click('.ball-booth-use');await page.waitForSelector('.ball-setup:not([hidden])');
  // The list is redrawn for the choice as it is made: the booth's entry is there, chosen.
  await page.waitForSelector('.ball-face[data-face="booth"][aria-checked="true"]',{timeout:5000});
  const f=await page.evaluate(()=>{const f=window.pocketCamera.cardGame.face,s=JSON.parse(localStorage.getItem('office-pocket-camera')).gameFace;return {from:f.from,n:f.frames.length,kept:s.from==='booth'&&s.frames.length===4,distinct:new Set(f.frames).size,checked:document.querySelector('.ball-face[aria-checked="true"]').dataset.face,bytes:f.frames.reduce((n,u)=>n+u.length,0)};});
  assert.equal(f.from,'booth');assert.equal(f.n,4);assert.ok(f.kept);assert.equal(f.distinct,4,'four different pictures');assert.equal(f.checked,'booth');assert.ok(f.bytes<600000,`kept small: ${f.bytes}`);
  // Each frame: a PNG, opaque in the middle, clear at the corners.
  const cut=await page.evaluate(async()=>{const out=[];for(const url of window.pocketCamera.cardGame.face.frames){const img=new Image();img.src=url;await img.decode();const c=document.createElement('canvas');c.width=c.height=img.width;const g=c.getContext('2d');g.drawImage(img,0,0);out.push({size:img.width,mid:g.getImageData(img.width/2|0,img.height/2|0,1,1).data[3],corner:g.getImageData(2,2,1,1).data[3]});}return out;});
  for(const c of cut){assert.equal(c.size,160);assert.equal(c.mid,255);assert.equal(c.corner,0);}
  await page.click('.ball-play');await page.waitForSelector('.ball-stage:not([hidden])');
  // The head goes through the four faces as the game ticks. The fake camera's picture turns slowly, so two faces taken
  // a quarter of a second apart can be nearly the same on the LCD's few tones (0.19 of a level, under load): the head
  // is read at every frame over two rounds, each frame must come up, and the two most different must differ.
  const heads=new Map();
  for(let i=0;i<16;i++){await page.evaluate(()=>window.pocketCamera.cardGame.step());const frame=await page.evaluate(()=>window.pocketCamera.cardGame.frame);if(!heads.has(frame))heads.set(frame,await headPixels());}
  assert.deepEqual([...heads.keys()].sort(),[0,1,2,3],'the head showed each of the four faces');
  let most=0;const seen=[...heads.values()];
  for(let i=0;i<seen.length;i++)for(let j=i+1;j<seen.length;j++){let diff=0;for(let k=0;k<seen[i].length;k++)diff+=Math.abs(seen[i][k]-seen[j][k]);most=Math.max(most,diff/seen[i].length);}
  assert.ok(most>1,`the head changed between faces: ${most.toFixed(2)}`);
  await shot(page,'6-four-faces');
  await page.click('.ball-hand[data-side="right"]');
  await page.evaluate(()=>{const c=window.pocketCamera.cardGame,g=c.game;for(let t=0;t<20&&!g.state.over;t++){const b=g.state.balls.find(b=>Math.abs(b.pos-(b.from==='left'?6:0))===1);if(b)g.moveHands(b.from==='left'?'left':'right');c.step();}});
  await page.waitForSelector('.ball-over:not([hidden])',{timeout:10000});await page.click('.ball-over .button:not(.primary)');await page.waitForSelector('#cardsHub:not([hidden])');
 });

 await check('a photo from the album with a face found is offered, cut out and worn by the juggler',async()=>{
  await page.evaluate(()=>{document.getElementById('picker').value='';});
  await page.setInputFiles('#picker',join(root,'camera/tests/fixtures/portrait-braids.jpg'));
  await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===640);
  await page.waitForFunction(()=>window.pocketCamera.state.edit.recipe.faces?.length>0,null,{timeout:90000});
  await page.click('#saveEdit');await page.waitForSelector('#viewer:not([hidden])',{timeout:60000});await page.click('#closeViewer');await page.waitForSelector('#album:not([hidden])');
  await page.click('#openGames');await page.waitForSelector('#cardsHub:not([hidden])');await page.click('#chooseBall');
  await page.waitForSelector('.ball-face[data-face]:not([data-face="own"]):not([data-face="take"]):not([data-face="pick"]):not([data-face="booth"])',{timeout:20000});
  const albumFace='.ball-face[data-face]:not([data-face="own"]):not([data-face="take"]):not([data-face="pick"]):not([data-face="booth"])';
  const offered=await page.$$eval(albumFace,b=>b.map(x=>x.querySelector('span:last-child').textContent));
  assert.equal(offered.length,1,'the one photo with a face');assert.match(offered[0],/Your photo of/);
  await page.click(albumFace);
  await page.waitForFunction(()=>window.pocketCamera.cardGame.face?.frames?.[0]?.startsWith('data:image/png')&&window.pocketCamera.cardGame.face.from!=='booth',null,{timeout:20000});
  const face=await page.evaluate(()=>{const f=window.pocketCamera.cardGame.face;return {from:f.from,n:f.frames.length,checked:document.querySelector('.ball-face[aria-checked="true"]').dataset.face};});
  assert.equal(face.n,1);assert.equal(face.checked,face.from);
  const cut=await page.evaluate(async()=>{const img=new Image();img.src=window.pocketCamera.cardGame.face.frames[0];await img.decode();const c=document.createElement('canvas');c.width=c.height=img.width;const g=c.getContext('2d');g.drawImage(img,0,0);
   const at=(x,y)=>g.getImageData(x,y,1,1).data;const mid=at(img.width/2|0,img.height/2|0),corner=at(2,2);return {midAlpha:mid[3],midWarm:mid[0]>mid[2],cornerAlpha:corner[3]};});
  assert.equal(cut.midAlpha,255);assert.ok(cut.midWarm,'skin in the middle');assert.equal(cut.cornerAlpha,0);
  await page.click('.ball-play');await page.waitForSelector('.ball-stage:not([hidden])');await page.evaluate(()=>window.pocketCamera.cardGame.step());
  const head=await page.evaluate(()=>{const c=document.querySelector('canvas.ball-lcd'),g=c.getContext('2d'),W=c.width,H=c.height;const d=g.getImageData(W/2-W*.03,H*.17,W*.06,H*.1).data;let warm=0;for(let i=0;i<d.length;i+=4)if(d[i]>d[i+2]+20&&d[i]>120)warm++;return warm/(d.length/4);});
  assert.ok(head>.3,`the head is the photograph: ${head.toFixed(2)} warm`);
  await shot(page,'7-your-face');
 });
 assert.deepEqual(errors,[],'no page errors');
 console.log(`ball: ${checks} checks passed`);
}finally{await browser.close();await server.close();}
