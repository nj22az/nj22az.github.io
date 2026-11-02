// Pop (looks-gl.js popped) in a real browser: off is the photo exactly; on adds local contrast and colour, keeps skin's
// hue and a dark background dark, looks the same at any size; the Adjust row switches it, and a save keeps it.
//   node camera/tests/pop.browser.mjs        (CAMERA_SHOTS=<folder> also saves screenshots)
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import {join} from 'node:path';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),shots=process.env.CAMERA_SHOTS;if(shots)fs.mkdirSync(shots,{recursive:true});
const server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let checks=0;const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${name}`);};
try{
 const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false})));
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 // Measures on a photo rendered by the camera's own engine at a size, with Pop at a strength.
 const measure=(src,pop,width,regions)=>page.evaluate(async({src,pop,width,regions})=>{
  const key=new URL(document.querySelector('script[src*="app.js"]').src).search,{createLookEngine,normalRecipe}=await import('/camera/looks-gl.js'+key);
  const img=await createImageBitmap(await (await fetch(src)).blob()),W=width,H=Math.round(img.height*W/img.width);
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const engine=createLookEngine(canvas);engine.setSource('s',img,img.width,img.height);
  const d=engine.render(normalRecipe({pop}),{source:'s',width:W,height:H}).data;
  const at=(x,y)=>{const i=(y*W+x)*4;return [d[i],d[i+1],d[i+2]];},Y=([r,g,b])=>.2126*r+.7152*g+.0722*b;
  const sat=([r,g,b])=>Math.max(r,g,b)-Math.min(r,g,b),hue=([r,g,b])=>{const M=Math.max(r,g,b),m=Math.min(r,g,b),c=M-m;if(!c)return 0;let h=M===r?((g-b)/c)%6:M===g?(b-r)/c+2:(r-g)/c+4;return (h*60+360)%360;};
  // local contrast: luminance against its 5-pixel box neighbourhood, over the whole picture
  let lc=0,n=0,s=0;for(let y=3;y<H-3;y+=2)for(let x=3;x<W-3;x+=2){let m=0;for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++)m+=Y(at(x+i,y+j));lc+=Math.abs(Y(at(x,y))-m/25);s+=sat(at(x,y));n++;}
  const box=([x0,y0,x1,y1])=>{let r=0,g=0,b=0,k=0;for(let y=Math.round(y0*H);y<Math.round(y1*H);y++)for(let x=Math.round(x0*W);x<Math.round(x1*W);x++){const p=at(x,y);r+=p[0];g+=p[1];b+=p[2];k++;}const p=[r/k,g/k,b/k];return {y:Y(p),sat:sat(p),hue:hue(p)};};
  // a small copy of the whole picture, 64 wide, for comparing sizes
  const small=document.createElement('canvas');small.width=64;small.height=Math.round(64*H/W);const c2=document.createElement('canvas');c2.width=W;c2.height=H;
  c2.getContext('2d').putImageData(new ImageData(d,W,H),0,0);small.getContext('2d').drawImage(c2,0,0,small.width,small.height);
  return {local:lc/n,sat:s/n,regions:Object.fromEntries(Object.entries(regions).map(([k,r])=>[k,box(r)])),small:[...small.getContext('2d').getImageData(0,0,small.width,small.height).data],hash:[...new Uint8Array(await crypto.subtle.digest('SHA-256',d))].join()};
 },{src,pop,width,regions});
 const PORTRAIT='/camera/tests/fixtures/portrait-braids.jpg',HARBOUR='/camera/samples/default-original.png';
 // the portrait's cheek (skin) and its dark, quiet background top left
 const R={cheek:[.5,.31,.56,.35],dark:[.02,.02,.14,.12]};

 await check('off is the photo exactly: Pop 0 renders the same bytes as a recipe without it',async()=>{
  const a=await measure(HARBOUR,0,320,{}),b=await page.evaluate(async()=>{
   const key=new URL(document.querySelector('script[src*="app.js"]').src).search,{normalRecipe}=await import('/camera/looks-gl.js'+key);
   return [normalRecipe({}).pop,normalRecipe({pop:7}).pop,normalRecipe({pop:-1}).pop,normalRecipe({pop:'x'}).pop];});
  assert.deepEqual(b,[0,1,0,0],'the recipe keeps Pop between 0 and 1');
  const again=await measure(HARBOUR,0,320,{});assert.equal(a.hash,again.hash);
 });

 await check('on, it adds local contrast and colour to a dull scene',async()=>{
  const off=await measure(HARBOUR,0,480,{}),on=await measure(HARBOUR,.6,480,{});
  assert.ok(on.local>off.local*1.12,`local contrast ${off.local.toFixed(2)} → ${on.local.toFixed(2)}`);
  assert.ok(on.sat>off.sat*1.06,`colour ${off.sat.toFixed(1)} → ${on.sat.toFixed(1)}`);
 });

 await check('a portrait keeps its skin’s hue and its dark background dark; skin gains less colour than the rest',async()=>{
  const off=await measure(PORTRAIT,0,320,R),on=await measure(PORTRAIT,1,320,R);
  const dh=Math.abs(on.regions.cheek.hue-off.regions.cheek.hue);assert.ok(dh<4,`skin hue moved ${dh.toFixed(1)}°`);
  assert.ok(Math.abs(on.regions.dark.y-off.regions.dark.y)<8,`the dark background ${off.regions.dark.y.toFixed(1)} → ${on.regions.dark.y.toFixed(1)}`);
  const skinGain=on.regions.cheek.sat/off.regions.cheek.sat,allGain=on.sat/off.sat;
  assert.ok(skinGain<allGain,`skin’s colour ×${skinGain.toFixed(3)} against the picture’s ×${allGain.toFixed(3)}`);
 });

 await check('the same at any size: a 1,280-wide save looks like the 320-wide preview',async()=>{
  const small=await measure(HARBOUR,.8,320,{}),large=await measure(HARBOUR,.8,1280,{}),plain=await measure(HARBOUR,0,1280,{});
  let diff=0,effect=0;for(let i=0;i<small.small.length;i+=4)for(let c=0;c<3;c++){diff+=Math.abs(small.small[i+c]-large.small[i+c]);effect+=Math.abs(large.small[i+c]-plain.small[i+c]);}
  const n=small.small.length/4*3;diff/=n;effect/=n;
  assert.ok(diff<effect*.35,`size changes it by ${diff.toFixed(2)}, Pop itself by ${effect.toFixed(2)} (per channel)`);
 });

 await check('the Adjust row switches it on at 50%, sets its strength, and the save and re-edit keep it',async()=>{
  await page.setInputFiles('#picker',join(root,'camera/tests/fixtures/portrait-braids.jpg'));
  await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===640);
  await page.click('#tabAdjust');assert.equal(await page.textContent('#popValue'),'Off');
  await page.click('#popPhoto');assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.pop),.5);
  assert.equal(await page.getAttribute('#popPhoto','aria-checked'),'true');
  await page.click('#popAmount');assert.ok(await page.locator('#popStrengthRow').isVisible());assert.ok(await page.locator('#enhanceStrengthRow').isHidden(),'one strength at a time');
  await page.fill('#popStrength','80');assert.equal(await page.textContent('#popValue'),'80%');
  if(shots)await page.screenshot({path:join(shots,'pop-panel.png')});
  await page.click('#saveEdit');await page.waitForSelector('#viewer:not([hidden])',{timeout:30000});
  const saved=await page.evaluate(async()=>{const {listShots}=await import('/camera/album.js?v=20261102fun1');return (await listShots())[0].recipe.pop;});
  assert.equal(saved,.8);
  await page.click('#editPhoto');await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===640);await page.click('#tabAdjust');
  assert.equal(await page.textContent('#popValue'),'80%');
  await page.click('#popPhoto');assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.pop),0,'off restores the photo');
  await page.click('#popPhoto');assert.equal(await page.evaluate(()=>window.pocketCamera.state.edit.recipe.pop),.8,'on again: the last strength');
 });
 assert.deepEqual(errors,[],'no page errors');
 console.log(`pop: ${checks} checks passed`);
}finally{await browser.close();await server.close();}
