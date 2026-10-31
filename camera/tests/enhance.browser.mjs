// Non-destructive enhancement, GPU output, cropped saves and narrow-phone controls.
// CHROMIUM_EXECUTABLE=<path> CAMERA_SHOTS=<folder> node camera/tests/enhance.browser.mjs
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),shots=process.env.CAMERA_SHOTS;
if(shots)await mkdir(shots,{recursive:true});
const server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let checks=0;
try{
 for(const [label,width,height,mobile] of [['phone',390,664,true],['small-phone',320,560,true],['tablet',768,1024,true],['desktop',1280,800,false]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false})));
  const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${label}: ${name}`);};
  try{
   if(process.env.CAMERA_BASELINE)await page.route('**/camera/looks-gl-baseline.js',async route=>route.fulfill({contentType:'text/javascript',body:await readFile(process.env.CAMERA_BASELINE,'utf8')}));
   await page.goto(`${server.url}camera/`);await page.waitForFunction(()=>!!window.pocketCamera?.engine);
   await page.evaluate(async()=>{
    const c=document.createElement('canvas');c.width=960;c.height=720;const g=c.getContext('2d');
    const gradient=g.createLinearGradient(0,0,960,720);gradient.addColorStop(0,'#182b32');gradient.addColorStop(1,'#9caaa3');g.fillStyle=gradient;g.fillRect(0,0,960,720);
    g.fillStyle='#b18a71';g.fillRect(200,140,250,270);g.fillStyle='#f8f8f8';g.fillRect(650,110,150,170);
    g.fillStyle='#050505';g.fillRect(650,420,150,170);g.fillStyle='#d8b176';g.font='44px sans-serif';g.fillText('MINATO 1998',180,540);
    const p=g.getImageData(0,0,960,720);let seed=719;
    for(let i=0;i<p.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=(seed/2**32-.5)*8;for(let j=0;j<3;j++)p.data[i+j]+=n;}
    g.putImageData(p,0,0);const blob=await new Promise(r=>c.toBlob(r));
    window.enhanceFixture=c;window.enhanceSourceHash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))];
    await window.pocketCamera.editFile(new File([blob],'minato-test.png',{type:'image/png'}));
   });
   await page.click('#tabAdjust');
   await check('enhancement starts off and controls fit',async()=>{
    assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.enhance),0);
    assert.equal(await page.getAttribute('#enhancePhoto','aria-checked'),'false');
    const clipped=await page.evaluate(()=>[...document.querySelectorAll('#enhancePhoto,#enhanceStrength,#enhanceValue,#adjustSlider,#editDock [role=tab]')].filter(el=>{const r=el.getBoundingClientRect();return r.left<0||r.right>innerWidth+.5||r.top<0||r.bottom>innerHeight+.5;}).map(el=>el.id));
    assert.deepEqual(clipped,[]);
    assert.ok((await page.locator('#editFrame').boundingBox()).height>100,'the photo remains large enough to judge');
   });
   await page.click('#enhancePhoto');
   await check('switch and strength change the saved recipe independently of manual adjustments',async()=>{
    assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.enhance),.65);
    await page.click('#enhanceAmount');await page.fill('#enhanceStrength','42');assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.enhance),.42);
    await page.click('#enhancePhoto');assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.enhance),0);
    await page.click('#enhancePhoto');assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.enhance),.42);
    assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.adjust.light),0);
   });
   await check('hold compares with the original and releases without changing the recipe',async()=>{
    const r=await page.locator('#editFrame').boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();
    await page.waitForFunction(()=>window.pocketCamera.state.edit.comparing);assert.equal(await page.isVisible('#original'),true);
    assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.enhance),.42);await page.mouse.up();
    assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.comparing),false);
   });
   if(shots)await page.screenshot({path:join(shots,`${label}-enhance.png`)});
   if(label==='desktop')await check('GPU correction is visible and deterministic; switching off restores the original output',async()=>{
    const result=await page.evaluate(async withBaseline=>{
     const {engine}=window.pocketCamera,m=await import('/camera/looks-gl.js?v=20261031audit1'),c=window.enhanceFixture;
     engine.setSource('bench',c,c.width,c.height);const options={source:'bench',width:480,height:360};
     const raw=m.normalRecipe(),off=engine.render(raw,options),on=engine.render({...raw,enhance:1},options),again=engine.render({...raw,enhance:1},options),restored=engine.render({...raw,enhance:0},options);
     let changed=0,same=true,repeat=true,sum=0,delta=0;
     for(let i=0;i<on.data.length;i+=4){for(let j=0;j<3;j++){const d=Math.abs(on.data[i+j]-off.data[i+j]);sum+=d;if(d>1)changed++;same&&=off.data[i+j]===restored.data[i+j];repeat&&=on.data[i+j]===again.data[i+j];}delta+=on.data[i]-off.data[i];}
     let baseline=true;
     if(withBaseline){const old=await import('/camera/looks-gl-baseline.js'),e=old.createLookEngine(document.createElement('canvas'));e.setSource('bench',c,c.width,c.height);const before=e.render(old.normalRecipe(),options);baseline=off.data.every((v,i)=>v===before.data[i]);e.gl.getExtension('WEBGL_lose_context')?.loseContext();}
     // All Looks must compile with enhancement too, including the phone variants.
     const failed=[];for(const look of m.LOOK_NAMES)try{engine.render(m.normalRecipe({layers:[{look}],enhance:.65}),{source:'bench',width:96,height:72});if(engine.failed(look))failed.push(look);}catch{failed.push(look);}
     // Solid black and white are not greyed by tone correction or outlined by sharpening.
     const sample=(p,x,y)=>[...p.data.slice((y*p.width+x)*4,(y*p.width+x)*4+3)];
     return {changed,same,repeat,baselineCompared:withBaseline,baseline,meanDifference:sum/(480*360*3),redLift:delta/(480*360),failed,white:sample(on,360,100),black:sample(on,360,250)};
    },!!process.env.CAMERA_BASELINE);
    assert.ok(result.changed>10000);assert.ok(result.meanDifference>.5&&result.meanDifference<20,JSON.stringify(result));
    assert.equal(result.same,true);assert.equal(result.repeat,true);assert.equal(result.baseline,true);assert.deepEqual(result.failed,[]);
    assert.ok(result.white.every(v=>v>230));assert.ok(result.black.every(v=>v<15));console.log('    '+JSON.stringify(result));
   });
   if(label==='desktop'&&shots)await check('real photographs render at preview and export sizes',async()=>{
    for(const [name,url] of [['harbour','/camera/samples/default-original.png'],['garden','/assets/images/nils-lake-hero-optimized.jpg']]){
     const result=await page.evaluate(async({url})=>{
      const img=await createImageBitmap(await(await fetch(url)).blob()),{engine}=window.pocketCamera,m=await import('/camera/looks-gl.js?v=20261031audit1');
      engine.setSource('photograph',img,img.width,img.height);const w=720,h=Math.round(w*img.height/img.width),c=document.createElement('canvas');c.width=w*2;c.height=h+32;const g=c.getContext('2d');
      const r=m.normalRecipe(),off=engine.render(r,{source:'photograph',width:w,height:h}),on=engine.render({...r,enhance:.65},{source:'photograph',width:w,height:h});
      g.fillStyle='#202020';g.fillRect(0,0,c.width,c.height);g.fillStyle='#fff';g.font='16px sans-serif';g.fillText('Original',12,22);g.fillText('Enhance 65%',w+12,22);
      g.putImageData(new ImageData(off.data,w,h),0,32);g.putImageData(new ImageData(on.data,w,h),w,32);
      const full=engine.render({...r,enhance:.65},{source:'photograph',width:Math.min(2560,img.width),height:Math.round(Math.min(2560,img.width)*img.height/img.width)});
      let mean=0;for(let i=0;i<full.data.length;i+=4)mean+=(full.data[i]+full.data[i+1]+full.data[i+2])/3;
      engine.dropSource('photograph');img.close();return {url:c.toDataURL(),mean:mean/(full.width*full.height)};
     },{url});
     assert.ok(result.mean>10&&result.mean<245,`${name}: a photograph, not a blank render`);
     await writeFile(join(shots,`${name}-comparison.png`),Buffer.from(result.url.split(',')[1],'base64'));
    }
   });
   await page.click('#tabCrop');await page.click('#cropShapes [data-shape="1:1"]');await page.fill('#cropZoom','140');
   await page.click('#saveEdit');await page.waitForFunction(()=>window.pocketCamera.state.mode==='viewer');
   await check('cropped JPEG contains the enhancement and retains the exact source',async()=>{
    const result=await page.evaluate(async()=>{
     const {state,engine}=window.pocketCamera,s=state.viewing,m=await import('/camera/looks-gl.js?v=20261031audit1');
     const source=await createImageBitmap(s.source);engine.setSource('check',source,source.width,source.height);
     const pixels=engine.render(m.normalRecipe(s.recipe),{source:'check',crop:s.recipe.crop,width:s.width,height:s.height});
     const img=await createImageBitmap(s.photo),c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);const jpg=g.getImageData(0,0,c.width,c.height).data;
     let difference=0;for(let i=0;i<jpg.length;i++)if(i%4!==3)difference+=Math.abs(jpg[i]-pixels.data[i]);
     const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await s.source.arrayBuffer()))];source.close();img.close();engine.dropSource('check');
     return {strength:s.recipe.enhance,width:s.width,height:s.height,type:s.photo.type,difference:difference/(c.width*c.height*3),original:JSON.stringify(hash)===JSON.stringify(window.enhanceSourceHash)};
    });
    assert.equal(result.strength,.42);assert.equal(result.width,result.height);assert.equal(result.type,'image/jpeg');assert.ok(result.difference<3,JSON.stringify(result));assert.equal(result.original,true);
   });
   await page.click('#editPhoto');await page.click('#tabAdjust');
   await check('re-edit restores strength without baking or accumulating it',async()=>{
    assert.equal(await page.inputValue('#enhanceStrength'),'42');await page.click('#enhancePhoto');await page.click('#enhancePhoto');
    assert.equal(await page.inputValue('#enhanceStrength'),'42');assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.enhance),.42);
    await page.reload();await page.waitForFunction(()=>window.pocketCamera?.state.shots.some(s=>s.recipe.enhance===.42));
    assert.deepEqual(errors,[]);
   });
  }finally{await context.close();}
 }
 console.log(`enhance: ${checks}/${checks} browser checks passed`);
}finally{await browser.close();await server.close();}
