import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const root=new URL('..',import.meta.url).pathname.replace(/\/$/,''),out=root+'/docs/qa/harbour-visitor';await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{let path=new URL(req.url,'http://localhost').pathname;if(path==='/'){res.setHeader('Content-Type','text/html');res.end('<html><body>Town entry</body></html>');return;}if(path.endsWith('/'))path+='index.html';const body=await readFile(root+path);res.setHeader('Content-Type',path.endsWith('.html')?'text/html':path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.json')?'application/json':'application/octet-stream');res.end(body);}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(5173,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CREATOR_CHROME,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],env:process.env});const results=[];
try{
for(const [width,height] of [[1280,800],[390,844]]){
const context=await browser.newContext({viewport:{width,height},hasTouch:width===390,isMobile:width===390});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',route=>route.abort());
await page.goto('http://127.0.0.1:5173/creator/?preset=harbour-visitor');await page.getByRole('textbox',{name:'Name',exact:true}).waitFor();assert.equal(await page.getByRole('textbox',{name:'Name',exact:true}).inputValue(),'Harbour visitor');
await page.waitForTimeout(1000);await page.screenshot({path:out+'/creator-'+width+'.png'});
// Save and play uses the real standalone creator callback.
const buttons=await page.getByRole('button').allTextContents();console.log(width,buttons.filter(x=>/Next|Save|town|Hello|look|Start|person/i.test(x)));
const save=page.getByRole('button',{name:'Walk the town as them',exact:true});
for(let i=0;i<5 && !await save.isVisible();i++){const next=page.locator('.shm-next');await next.click();await page.waitForTimeout(200);}
await save.click();
const saved=await page.evaluate(async()=>{const {playerRecipe}=await import('/src/avatars/actors.js');return playerRecipe();});assert.equal(saved.name,'Harbour visitor');assert.equal(saved.outfit.bottom,'pleatedskirt');
await page.goto('http://127.0.0.1:5173/creator/');await page.reload();await page.getByRole('textbox',{name:'Name',exact:true}).waitFor();const restored=await page.evaluate(async()=>{const {playerRecipe}=await import('/src/avatars/actors.js');return playerRecipe();});assert.equal(restored.outfit.top,'contrastpolo');assert.equal(restored.outfit.bottom,'pleatedskirt');
await page.goto('http://127.0.0.1:5173/tools/avatar-preview.html?who=Harbour%20visitor');await page.waitForFunction(()=>window.__READY__);await page.waitForTimeout(300);await page.screenshot({path:out+'/front-'+width+'.png'});
for(const pose of ['walk','sit','wave']){await page.goto('http://127.0.0.1:5173/tools/avatar-preview.html?who=Harbour%20visitor&pose='+pose);await page.waitForFunction(()=>window.__READY__);await page.waitForTimeout(500);await page.screenshot({path:out+'/'+pose+'-'+width+'.png'});}
await page.goto('http://127.0.0.1:5173/tools/avatar-preview.html?who=Harbour%20visitor&turn=3.14159');await page.waitForFunction(()=>window.__READY__);await page.waitForTimeout(300);await page.screenshot({path:out+'/rear-'+width+'.png'});
// The hairstyle is a real creator part, independently assignable to Thuan.
const thuan=await page.evaluate(async()=>{const {recipeFor}=await import('/src/avatars/cast.js'),{encodeRecipe}=await import('/src/avatars/recipe.js');const r=recipeFor('Thuan');return {r,code:encodeRecipe(r)};});
await page.goto('http://127.0.0.1:5173/creator/?r='+thuan.code);await page.locator('.shm-dots button').nth(1).click();if(width===390)await page.getByRole('combobox',{name:'Appearance category',exact:true}).selectOption('hair');else await page.getByRole('tab',{name:'Hair',exact:true}).click();console.log('hair-menu',width);await page.getByRole('button',{name:'Swept low ponytail',exact:true}).click();console.log('hair-selected',width);await page.locator('.shm-dots button').nth(3).click();await page.getByRole('button',{name:'Walk the town as them',exact:true}).click();
const hairSaved=await page.evaluate(async()=>{const {playerRecipe}=await import('/src/avatars/actors.js');return playerRecipe();});assert.equal(hairSaved.hair.style,'sweptponytail');assert.deepEqual(hairSaved.head,thuan.r.head);assert.deepEqual(hairSaved.outfit,thuan.r.outfit);
// Any resident can use the outfit without losing her own head and hair.
const other=await page.evaluate(async()=>{const {recipeFor}=await import('/src/avatars/cast.js'),{HARBOUR_POLO_OUTFIT}=await import('/src/avatars/outfits.js'),{saveResidentRecipe,residentRecipe}=await import('/src/avatars/wardrobe.js');const original=recipeFor('Thuan');saveResidentRecipe('Thuan',{...original,outfit:{...original.outfit,...HARBOUR_POLO_OUTFIT}});return {original,saved:residentRecipe('Thuan')};});assert.deepEqual(other.saved.hair,other.original.hair);assert.equal(other.saved.outfit.top,'contrastpolo');
assert.deepEqual(errors,[]);results.push({width,height,touch:width===390,saveReload:true,wardrobeReuse:true,hairSelection:true,poses:['idle','walk','sit','wave','rear'],pageErrors:errors});await context.close();
}
await writeFile(out+'/results.json',JSON.stringify({results},null,2)+'\n');console.log('PASS',JSON.stringify(results));
}finally{await browser.close();server.close();}
