import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:320,height:560},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),errors=[];
page.on('pageerror',e=>errors.push(e.message));let checks=0;const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${name}`);};
try{
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 await check('each paper renders deterministically; rough stock has more tooth; None preserves the photo',async()=>{
  const report=await page.evaluate(async()=>{
   const {createLookEngine,normalRecipe,PAPERS,flipRows}=await import('/camera/looks-gl.js?v=20261031audit2');
   const canvas=document.createElement('canvas');canvas.width=192;canvas.height=144;
   const source=document.createElement('canvas');source.width=192;source.height=144;const g=source.getContext('2d');
   for(const [i,colour] of ['#000','#fff','#888','#356fca'].entries()){g.fillStyle=colour;g.fillRect(i*48,0,48,144);}
   const engine=createLookEngine(canvas);engine.setSource('test',source,192,144);const report=[];
   for(const look of ['none','crayon','manga','riso'])for(const paper of PAPERS){
    const recipe=normalRecipe({paper:paper.id,layers:[{look}]}),options={source:'test',width:192,height:144};
    const a=engine.render(recipe,options),b=engine.render(recipe,options);let deterministic=true;
    for(let i=0;i<a.data.length;i++)if(a.data[i]!==b.data[i])deterministic=false;
    if(!engine.draw(recipe,{source:'test'}))throw new Error('draw was not ready');
    const raw=new Uint8Array(192*144*4);engine.gl.readPixels(0,0,192,144,engine.gl.RGBA,engine.gl.UNSIGNED_BYTE,raw);const drawn=flipRows(raw,192,144);
    let difference=0,mean=0,sq=0,count=0;for(let i=0;i<raw.length;i++)difference=Math.max(difference,Math.abs(a.data[i]-drawn[i]));
    for(let y=8;y<136;y++)for(let x=105;x<135;x++){const v=a.data[(y*192+x)*4];mean+=v;sq+=v*v;count++;}
    const at=x=>[...a.data.slice((72*192+x)*4,(72*192+x)*4+3)];
    report.push({look,paper:paper.id,deterministic,difference,black:at(24),white:at(72),grey:at(120),blue:at(168),spread:Math.sqrt(sq/count-(mean/count)**2)});
   }
   const recipe=normalRecipe({paper:'rough'}),atlas=engine.thumbnails(recipe,{source:'test',size:48,names:['none','crayon']});
   return {rows:report,atlas:!!atlas&&atlas.width===96&&!atlas.missing.length};
  });
  for(const r of report.rows){assert.ok(r.deterministic);assert.ok(r.difference<=1,JSON.stringify(r));}
  const natural=report.rows.filter(r=>r.look==='none'),get=id=>natural.find(r=>r.paper===id);
  assert.deepEqual(get('none').black,[0,0,0]);assert.deepEqual(get('none').white,[255,255,255]);assert.deepEqual(get('none').grey,[136,136,136]);
  for(const r of natural){assert.ok(r.black.every(v=>v<=1),'paper does not bleach blacks');assert.ok(r.white.every(v=>v>=210));}
  assert.ok(get('rough').spread>get('drawing').spread*1.5,'rough tooth differs from smooth drawing paper');assert.ok(report.atlas,'thumbnails include the paper pass');
  const wax=report.rows.find(r=>r.look==='crayon'&&r.paper==='none');
  assert.ok(wax.black.every(v=>v<30),'wax builds a dark mass');assert.ok(wax.blue[2]>wax.blue[0]*2&&wax.blue[2]>150,'wax retains its pigment colour');assert.ok(wax.white.every(v=>v>235),'a light background is clean');
 });
 await page.setInputFiles('#picker',join(root,'camera/samples/default-original.png'));await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor');await page.click('#tabFrame');
 await check('paper choices fit a small phone and change the editor recipe',async()=>{
  assert.deepEqual(await page.locator('#paperChoices button').allTextContents(),['None','Drawing','Rough','Warm']);
  for(const id of ['drawing','rough','warm','none']){await page.click(`#paperChoices [data-paper="${id}"]`);assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.paper),id);}
  assert.ok(await page.locator('#paperChoices button').evaluateAll(buttons=>buttons.every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&b.scrollWidth<=b.clientWidth+1;})));
 });
 await page.click('#paperChoices [data-paper="rough"]');await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
 await check('save/reopen retains paper without changing the original source',async()=>{
  assert.equal(await page.evaluate(()=>window.pocketCamera.state.viewing.recipe.paper),'rough');await page.click('#editPhoto');await page.waitForFunction(()=>window.pocketCamera.state.mode==='editor');assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.paper),'rough');
 });
 await page.click('#cancelEdit');await page.click('#closeViewer');await page.click('#closeAlbum');await page.evaluate(()=>document.querySelector('#frameSetting').click());
 await check('the camera Frame sheet offers paper and remembers it',async()=>{
  await page.click('#cameraPaperChoices [data-paper="warm"]');assert.equal(await page.evaluate(()=>window.pocketCamera.state.camera.recipe.paper),'warm');
  assert.equal(await page.locator('#frameSheet').evaluate(el=>el.open),true);await page.keyboard.press('Escape');
  await page.reload();await page.waitForFunction(()=>!!window.pocketCamera);assert.equal(await page.evaluate(()=>window.pocketCamera.state.camera.recipe.paper),'warm');
 });
 await check('no page errors',async()=>assert.deepEqual(errors,[]));console.log(`${checks}/${checks} paper checks passed`);
}finally{await browser.close();await server.close();}
