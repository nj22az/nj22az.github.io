// Actual software-browser renders of the shared avatar/preview code. Run alone.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=resolve(new URL('../../',import.meta.url).pathname),out=resolve(root,process.env.MATERIAL_QA_OUT||'avatar-creator/docs/qa/material-study');await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.glb':'model/gltf-binary'};
const baseline=process.env.MATERIAL_BASELINE_REF?execFileSync('git',['show',process.env.MATERIAL_BASELINE_REF+':johansson-town/src/avatars/build.js'],{cwd:root,encoding:'utf8'}):null;
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://local').pathname,file=resolve(root,'.'+(path.endsWith('/')?path+'index.html':path));if(!file.startsWith(root+'/'))throw Error();res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],report={physicalDevice:false,hardwareGPU:false,captures:[],measurements:[]};
try{
 const context=await browser.newContext({viewport:{width:512,height:640},deviceScaleFactor:1});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.setDefaultTimeout(180000);
 const url=`http://127.0.0.1:${server.address().port}`;
 await page.goto(url+'/avatar-creator/tests/material-review.html');await page.waitForFunction(()=>window.review);
 if(baseline){
  const main=await context.newPage();await main.route('**/src/avatars/build.js',r=>r.fulfill({body:baseline,contentType:'text/javascript'}));await main.goto(url+'/avatar-creator/tests/material-review.html');await main.waitForFunction(()=>window.review);
  for(const name of ['Thuan','Johansson']){await page.evaluate(name=>{review.create(name);review.render({mode:'legacy',view:'full'});},name);await main.evaluate(name=>{review.create(name);review.render({mode:'legacy',view:'full'});},name);assert.deepEqual(await page.locator('canvas').screenshot(),await main.locator('canvas').screenshot(),'legacy pixels unchanged from main: '+name);}await main.close();report.legacyMatchesMain=true;
 }
 report.firstEnhancedSwitch=await page.evaluate(()=>review.coldSwitch({mode:'enhanced',view:'full',lighting:'neutral'}));
 await page.evaluate(()=>review.render({mode:'legacy'}));
 report.invariants=await page.evaluate(()=>review.invariants());assert.ok(Object.values(report.invariants).every(Boolean));
 for(const name of ['Thuan','Johansson']){
  await page.evaluate(n=>review.create(n),name);
  for(const lighting of ['neutral','daylight','interior'])for(const view of ['face','full','hand'])for(const mode of ['legacy','enhanced']){
   const settings={lighting,view,mode,cloth:'cotton',angle:view==='face'?-.25:0,look:'none'};
   const snapshot=await page.evaluate(s=>review.render(s),settings),file=`${name.toLowerCase()}-${lighting}-${view}-${mode}.png`;
   await page.locator('canvas').screenshot({path:resolve(out,file)});report.captures.push({file,...snapshot});
  }
  for(const mode of ['legacy','enhanced'])report.measurements.push(await page.evaluate(s=>review.measure(s),{mode,view:'full',lighting:'neutral',look:'none',angle:0,cloth:'cotton'}));
 }
 // Same geometry/colour and lighting, meaningful cotton/satin finish comparison.
 await page.evaluate(()=>review.create('Thuan'));
 report.finishes=[];for(const cloth of ['cotton','satin']){const snapshot=await page.evaluate(cloth=>review.render({mode:'enhanced',cloth,view:'full',lighting:'neutral',look:'none'}),cloth),file=`thuan-finish-${cloth}.png`;await page.locator('canvas').screenshot({path:resolve(out,file)});report.finishes.push({file,...snapshot});}
 report.looks=[];for(const look of ['manga','crayon','oil'])for(const mode of ['legacy','enhanced']){const snapshot=await page.evaluate(s=>review.render(s),{look,mode,view:'face',cloth:'cotton',lighting:'neutral'}),file=`thuan-${look}-${mode}.png`;await page.locator('canvas').screenshot({path:resolve(out,file)});report.looks.push({file,...snapshot});}
 report.lifecycle=await page.evaluate(()=>review.lifecycle());assert.deepEqual(report.lifecycle.after.memory,report.lifecycle.before.memory,'geometry/texture counts stable after cycling');assert.ok(report.lifecycle.after.programs<=report.lifecycle.before.programs,'shader programs do not accumulate after cycling');
 report.turntable=[];
 if(!process.env.MATERIAL_SKIP_TURNTABLE){await page.evaluate(()=>review.create('Thuan'));for(let i=0;i<24;i++)for(const mode of ['legacy','enhanced']){const settings={mode,lighting:'neutral',look:'none',view:'full',angle:i/24*Math.PI*2};await page.evaluate(s=>review.render(s),settings);const file=`turntable-${mode}-${String(i).padStart(2,'0')}.png`;await page.locator('canvas').screenshot({path:resolve(out,file)});report.turntable.push({file,...settings});}}
 report.errors=errors;assert.deepEqual(errors,[]);console.log('Material render checks passed:',report.captures.length,'comparison stills');
}finally{report.errors=errors;await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();server.close();}
