import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import {mkdir,writeFile,mkdtemp,cp,rm} from 'node:fs/promises';
import {resolve,basename} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||new URL('../../johansson-town/package.json',import.meta.url));
const {chromium}=require('playwright');
const out=resolve(process.env.IDENTITY_OUT||'avatar-creator/docs/qa/identity-v1/raw');await mkdir(out,{recursive:true});
const baselineRoot=await mkdtemp(resolve('.identity-review-baseline-'));
// Fetching missing archive blobs is git's normal partial-clone operation.
const frozen='9f7ccd4cf498eb266f5eec6b215332ff483ee9d4';
const archive=execFileSync('git',['archive',frozen,'johansson-town/src','johansson-town/vendor'],{maxBuffer:32*1024*1024});
execFileSync('tar',['-xf','-','-C',baselineRoot],{input:archive});
await mkdir(resolve(baselineRoot,'avatar-creator'));
for(const file of ['identity-review.html','identity-review.js'])await cp(resolve('avatar-creator',file),resolve(baselineRoot,'avatar-creator',file));
const baselineURL=`/${basename(baselineRoot)}/avatar-creator/identity-review.html?baseline=1`;
const server=spawn('python3',['-m','http.server','8768','--bind','127.0.0.1','--directory',resolve('.')],{stdio:'ignore'});
await new Promise(r=>setTimeout(r,800));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--single-process','--no-zygote','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const people=['Johansson','Thuan','Tetsuo','Grandmother Higa','Mai'],views=['front','quarter','profile','body'];
const errors=[],report={baseline:'9f7ccd4cf498eb266f5eec6b215332ff483ee9d4',renderer:'Chromium SwiftShader; software, not device performance',captures:[],errors};
try{
 const page=await browser.newPage({viewport:{width:1280,height:850}});page.on('pageerror',e=>errors.push(e.message));
 const run=async(kind,url)=>{
  await page.goto('http://127.0.0.1:8768'+url);await page.waitForFunction(()=>!!window.identityReview);
  for(const [i,person] of people.entries())for(const view of views){
   const state={person,view,action:'neutral',time:0};const data=await page.evaluate(s=>window.identityReview.capture(s),state);
   const file=`${kind}-${i}-${view}.png`;await page.locator('#stage').screenshot({path:resolve(out,file)});report.captures.push({file,...data});
  }
 };
 await run('baseline',baselineURL);
 await run('compare','/avatar-creator/identity-review.html');
 // Repeated exact-time requests must return identical pixels, including out-of-order seeks.
 const state={person:'Thuan',view:'body',action:'walk',time:1};
 await page.evaluate(s=>window.identityReview.capture(s),state);const a=await page.locator('canvas').screenshot();
 await page.evaluate(s=>window.identityReview.capture({...s,time:2.5}),state);
 await page.evaluate(s=>window.identityReview.capture(s),state);const b=await page.locator('canvas').screenshot();assert.ok(a.equals(b),'Exact-time replay must be deterministic');
 for(const [i,person] of people.entries()){
  for(const action of ['smile','surprise','sit','hold']){
   await page.evaluate(s=>window.identityReview.capture(s),{person,view:action==='smile'||action==='surprise'?'front':'body',action,time:1});
   await page.locator('#stage').screenshot({path:resolve(out,`${i}-${action}.png`)});
  }
  // 12 samples over the shared 2.4-second sip and over a walking cycle, for moving review.
  for(const action of ['walk','sip'])for(let f=0;f<12;f++){
   await page.evaluate(s=>window.identityReview.capture(s),{person,view:'body',action,time:f*.2});
   await page.locator('#stage').screenshot({path:resolve(out,`${i}-${action}-${String(f).padStart(2,'0')}.png`)});
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>window.identityReview.capture({person:'Thuan',view:'body'}));
 await page.screenshot({path:resolve(out,'review-phone.png'),fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Phone must not overflow horizontally');
 await page.getByLabel('Character',{exact:true}).focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
 assert.equal(await page.getByLabel('Character',{exact:true}).inputValue(),'Tetsuo');
 assert.deepEqual(errors,[]);report.deterministicReplay=true;report.phoneKeyboard=true;
 await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log('Identity baseline/comparisons, fixed-time motion samples, seek determinism and phone keyboard checks passed.');
}finally{await browser.close();server.kill();await rm(baselineRoot,{recursive:true,force:true});}
