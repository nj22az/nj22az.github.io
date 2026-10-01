/** Real compiled-runtime counter acceptance. Serve the repository root first.
 * TOWN_REVIEW_URL defaults to http://127.0.0.1:8765/johansson-town/.
 * CHROME_EXECUTABLE can select Chromium; TOWN_CHROMIUM_ARGS is a JSON array.
 * TOWN_REVIEW_WIDTHS defaults to 390,1280. Each width gets a fresh browser/save.
 * TOWN_BEHAVIOUR_DPR is optional; screenshots restore the device drawing ratio.
 * Software rendering is behavioural evidence, not a hardware FPS benchmark.
 */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {mkdirSync} from 'node:fs';
const require=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?resolve(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'package.json'):import.meta.url);
const {chromium}=require('playwright');
const base=process.env.TOWN_REVIEW_URL||'http://127.0.0.1:8765/johansson-town/';
const output=process.env.TOWN_REVIEW_OUTPUT||tmpdir();mkdirSync(output,{recursive:true});
for(const width of (process.env.TOWN_REVIEW_WIDTHS||'390,1280').split(',').map(Number)){
 const browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE,args:process.env.TOWN_CHROMIUM_ARGS?JSON.parse(process.env.TOWN_CHROMIUM_ARGS):['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],headless:true});
 try{
const context=await browser.newContext({viewport:{width,height:width===390?844:800},hasTouch:width===390,isMobile:width===390});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{localStorage.setItem('johansson-town-clock',JSON.stringify({start:'12:00',speed:1}));sessionStorage.setItem('johansson-town-splash','1');});await page.goto(base+'?audit&spawn=ramen');await page.locator('[data-town-enter]').click();await page.waitForFunction(()=>window.__JOHANSSON_POSE__?.inside==='ramen'&&window.__JOHANSSON_AUDIT__?.seated&&!window.__JOHANSSON_AUDIT__.blocked.roomLoading,{timeout:120000});
// Optional smaller drawing buffer for software-rendered behavioural checks.
if(process.env.TOWN_BEHAVIOUR_DPR)await page.evaluate(dpr=>{const r=__JOHANSSON_AUDIT__.renderer;r.setPixelRatio(dpr);r.setSize(innerWidth,innerHeight,false);},Number(process.env.TOWN_BEHAVIOUR_DPR));console.log('started',width);
await page.evaluate(()=>{window.ev=[];document.addEventListener('pointerdown',e=>window.ev.push({type:e.pointerType,id:e.target.closest('button')?.id}),true);});
const interact=async()=>{if(width===390){await page.waitForFunction(()=>!document.querySelector('#act').classList.contains('control-off'));await page.locator('#act').tap();}else await page.keyboard.press('e');try{await page.locator('#activity').waitFor({state:'visible',timeout:6000});}catch(e){console.log('interaction failed',await page.evaluate(()=>({blocked:__JOHANSSON_AUDIT__.blocked,seated:__JOHANSSON_AUDIT__.seated,prompt:document.querySelector('#prompt').textContent,act:document.querySelector('#act').outerHTML,events:window.ev})));await page.screenshot({path:resolve(output,'ramen-interaction-failure-'+width+'.png')});throw e;}};
const button=text=>page.locator('#activityActions button').filter({hasText:text});
const yen=()=>page.evaluate(()=>__JOHANSSON_AUDIT__.activities.state.yen);
const bowl=()=>page.evaluate(()=>__JOHANSSON_AUDIT__.room.children.filter(o=>Math.abs(o.position.y-1.11)<.005&&o.position.z<-1).map(o=>({visible:o.visible,position:o.position.toArray(),meshes:(()=>{let n=0;o.traverse(c=>{if(c.isMesh)n++});return n;})()})));
// The opening supplies a complimentary bowl. Consume it before ordering.
await interact();await button('Eat Shoyu ramen').click();assert.equal(await yen(),1200);assert.ok((await bowl()).some(o=>!o.visible));
await interact();assert.equal(await button('Eat Shoyu ramen').count(),0);await button('Shoyu ramen · ¥450').click();const t0=Date.now();assert.match(await page.locator('#subtitle').textContent(),/Mrs Sato takes your order/);assert.equal(await yen(),1200);
await page.waitForTimeout(3000);assert.equal(await yen(),1200);assert.ok((await bowl()).every(o=>!o.visible));await page.waitForFunction(()=>__JOHANSSON_AUDIT__.activities.state.yen===750,null,{timeout:120000});const elapsed=Date.now()-t0;assert.ok(elapsed>=4800&&elapsed<120000,'delivery '+elapsed);assert.ok((await bowl()).some(o=>o.visible));console.log('delivered',width,elapsed);await page.evaluate(()=>{const r=__JOHANSSON_AUDIT__.renderer;r.setPixelRatio(devicePixelRatio);r.setSize(innerWidth,innerHeight,false);});await page.screenshot({path:resolve(output,`ramen-delivered-${width}.png`)});
await page.waitForTimeout(1100);assert.equal(await yen(),750);await interact();await button('Eat Shoyu ramen').click();assert.equal(await yen(),750);assert.ok((await bowl()).every(o=>!o.visible));await interact();assert.equal(await button('Eat Shoyu ramen').count(),0);await button('Shoyu ramen · ¥450').click();await page.waitForTimeout(600);await interact();await button('Stand up').click();await page.waitForTimeout(6000);assert.equal(await yen(),750);assert.equal(await page.evaluate(()=>__JOHANSSON_AUDIT__.seated),false);
await page.evaluate(()=>__JOHANSSON_AUDIT__.leave());assert.equal(await page.evaluate(()=>__JOHANSSON_POSE__.inside),null);await page.evaluate(()=>__JOHANSSON_AUDIT__.enter('ramen'));await page.waitForFunction(()=>__JOHANSSON_POSE__.inside==='ramen'&&!__JOHANSSON_AUDIT__.blocked.roomLoading,null,{timeout:120000});await page.evaluate(()=>__JOHANSSON_AUDIT__.teleport(8.1,-.72,0));await page.waitForTimeout(300);await page.evaluate(()=>__JOHANSSON_AUDIT__.interact());await page.waitForTimeout(250);if(!await page.evaluate(()=>__JOHANSSON_AUDIT__.seated))throw Error('cannot re-seat');
await page.evaluate(()=>{__JOHANSSON_AUDIT__.activities.state.yen=0;});await interact();await button('Shoyu ramen · ¥450').click();assert.match(await page.locator('#subtitle').textContent(),/not have enough yen/);assert.equal(await yen(),0);await button('Keep sitting').click();await page.waitForTimeout(5500);assert.equal(await yen(),0);await interact();assert.equal(await button('Eat Shoyu ramen').count(),0);await button('Stand up').click();
await page.evaluate(()=>__JOHANSSON_AUDIT__.activities.state.yen=750);await page.evaluate(()=>__JOHANSSON_AUDIT__.teleport(8.1,-.72,0));await page.waitForTimeout(300);await page.evaluate(()=>__JOHANSSON_AUDIT__.interact());await interact();await button('Shoyu ramen · ¥450').click();await page.waitForTimeout(500);await page.evaluate(()=>__JOHANSSON_AUDIT__.leave());await page.waitForTimeout(5500);assert.equal(await yen(),750);await page.evaluate(()=>__JOHANSSON_AUDIT__.enter('ramen'));await page.waitForFunction(()=>__JOHANSSON_POSE__.inside==='ramen'&&!__JOHANSSON_AUDIT__.blocked.roomLoading,null,{timeout:120000});const before=await page.evaluate(()=>({...__JOHANSSON_POSE__}));
if(width===390){
 const pad=await page.locator('#stick').boundingBox();assert.ok(pad,'touch movement pad exists');const cdp=await context.newCDPSession(page);const x=pad.x+pad.width/2,y=pad.y+pad.height/2;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-45}]});await page.waitForTimeout(1000);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
}else{await page.keyboard.down('w');await page.waitForTimeout(700);await page.keyboard.up('w');}
const after=await page.evaluate(()=>({x:__JOHANSSON_POSE__.x,z:__JOHANSSON_POSE__.z}));assert.ok(Math.hypot(after.x-before.x,after.z-before.z)>.05);assert.deepEqual(errors,[]);console.log(JSON.stringify({width,deliveryMs:elapsed,checks:'cooking,visible bowl,delivery-only payment,single eating,stand cancel,exit cancel,insufficient yen,re-entry,movement',errors}));await context.close();
 }finally{await browser.close();}
}
