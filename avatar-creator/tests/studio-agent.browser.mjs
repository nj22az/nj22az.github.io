// The Studio's agent page and resident pickers, in Chromium at the iPad's viewport (1024x1366, twice the pixels) and a
// phone's (390x844): node avatar-creator/tests/studio-agent.browser.mjs (optional CHROMIUM_EXECUTABLE).
// - ?agent adds window.__JOHANSSON_STUDIO__, and its portraits are real PNGs that repeat pixel for pixel;
// - without ?agent there is no agent API;
// - the template picker and Build scene's resident picker list every resident of World, drawn by recipeFor, and the
//   characters made in Studio (served here from a seeded copy of the generated characters-data.js);
// - Build scene's Thuan is World's Thuan (recipeFor), and the original Thuận design is its own entry.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':fileURLToPath(new URL('../../johansson-town/node_modules/playwright/index.js',import.meta.url)));
const {serveGame}=await import('../../johansson-town/tools/mcp/static-server.mjs');
const {RESIDENT_NAMES,recipeFor}=await import('../../johansson-town/src/avatars/cast.js');
const {normalizeRecipe}=await import('../../johansson-town/src/avatars/recipe.js');
const {charactersModule}=await import('../../johansson-town/tools/studio/build-data.mjs');
// One Studio character, as publishing the draft would write it: the pickers must offer her.
const sora={name:'Sora',recipe:normalizeRecipe({...recipeFor('Thao'),name:'Sora',hair:{...recipeFor('Thao').hair,style:'bob'}}),card:{role:'Visiting cousin',why:'Thao\'s cousin from Naha, for the summer festival stories.'},made:'2026-10-12T09:14:00Z'};
const seeded=charactersModule(JSON.stringify({format:'johansson-looks',version:1,looks:{},characters:{sora}}));
const root=fileURLToPath(new URL('../../',import.meta.url));
const server=await serveGame({root,mounts:['johansson-town','avatar-creator']});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const pngSize=url=>{const b=Buffer.from(url.split(',')[1],'base64');assert.equal(b.subarray(1,4).toString(),'PNG');return [b.readUInt32BE(16),b.readUInt32BE(20)];};
try{
 for(const [width,height,scale,touch] of [[1024,1366,2,true],[390,844,3,true]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:scale,hasTouch:touch,isMobile:width<500});
  await context.route('**/*',route=>route.request().url().startsWith(server.url)?route.continue():route.abort());
  await context.route('**/johansson-town/src/studio/characters-data.js*',route=>route.fulfill({contentType:'text/javascript',body:seeded}));
  const page=await context.newPage(),errors=[];page.setDefaultTimeout(240000);page.on('pageerror',e=>errors.push(e.message));
  await page.goto(server.url+'avatar-creator/');await page.locator('.studio-tools').waitFor();
  assert.equal(await page.evaluate(()=>'__JOHANSSON_STUDIO__' in window),false,'no agent API without ?agent');
  await page.goto(server.url+'avatar-creator/?agent');await page.locator('.studio-tools').waitFor();
  await page.waitForFunction(()=>window.__JOHANSSON_STUDIO__?.ready===true,null,{timeout:120000});
  const api=await page.evaluate(()=>({version:window.__JOHANSSON_STUDIO__.version,views:window.__JOHANSSON_STUDIO__.views,frozen:Object.isFrozen(window.__JOHANSSON_STUDIO__)}));
  assert.deepEqual(api,{version:1,views:['front','quarter','left','right','back'],frozen:true});
  const shots=await page.evaluate(async()=>{const {recipeFor}=await import('/johansson-town/src/avatars/cast.js');const s=window.__JOHANSSON_STUDIO__,r=recipeFor('Mr Fujita');
   return [s.renderPortrait(r,{size:256}),s.renderPortrait(r,{size:256}),s.renderPortrait(r,{view:'back',framing:'face',size:200,background:'transparent'})];});
  assert.deepEqual(pngSize(shots[0]),[256,256]);assert.equal(shots[0],shots[1],'the same portrait twice is the same pixels');
  assert.deepEqual(pngSize(shots[2]),[200,200]);assert.notEqual(shots[0],shots[2]);
  assert.match(await page.evaluate(()=>{try{window.__JOHANSSON_STUDIO__.renderPortrait({}, {pose:'Moonwalk'});}catch(e){return e.message;}}),/Unknown pose/);
  // Templates: the original Thuận design, every resident of World (Johansson once), then the Studio characters.
  await page.locator('.studio-files summary').click();
  const templates=page.locator('select[aria-label="Starting template"]'),group=templates.locator('optgroup[label="Residents of Johansson World"] option');
  assert.deepEqual(await group.allTextContents(),[...RESIDENT_NAMES]);
  assert.deepEqual(await templates.locator('option').allTextContents(),['Choose…','Thuận · original',...RESIDENT_NAMES,'Sora']);
  assert.deepEqual(await templates.locator('optgroup[label="Studio characters"] option').allTextContents(),['Sora']);
  const fujita=await group.filter({hasText:/^Mr Fujita$/}).getAttribute('value');
  await page.getByLabel('Starting template').selectOption(fujita);
  assert.equal(await page.getByRole('textbox',{name:'Name',exact:true}).inputValue(),'Mr Fujita');
  await page.locator('.studio-files summary').click();
  await page.getByLabel('Starting template').selectOption(await templates.locator('optgroup[label="Studio characters"] option').getAttribute('value'));
  assert.equal(await page.getByRole('textbox',{name:'Name',exact:true}).inputValue(),'Sora');
  await page.locator('.studio-files summary').click();
  await page.getByLabel('Starting template').selectOption(fujita);
  // Build scene: every resident can be added, Mr Fujita among them.
  await page.getByRole('button',{name:'Use in scene',exact:true}).click();await page.locator('.scene-workspace').waitFor();
  await page.getByRole('button',{name:'1. Choose location',exact:true}).click();
  await page.getByRole('button',{name:'Sakura Shōten',exact:true}).click();
  await page.getByRole('button',{name:'Next: Add characters',exact:true}).click();
  const picker=page.getByLabel('Town resident',{exact:true});
  assert.deepEqual(await picker.locator('optgroup[label="Residents of Johansson World"] option').evaluateAll(o=>o.map(x=>x.value)),[...RESIDENT_NAMES]);
  assert.deepEqual(await picker.locator('optgroup[label="Studio characters"] option').evaluateAll(o=>o.map(x=>[x.value,x.textContent])),[['studio:sora','Sora']]);
  assert.deepEqual(await picker.locator('optgroup[label="Other designs"] option').evaluateAll(o=>o.map(x=>x.textContent)),['Thuận · original']);
  const actors=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nj-studio-scene-v1')||'{}').actors||[]);
  for(const [value,name] of [['Mr Fujita','Mr Fujita'],['studio:sora','Sora'],['Thuan','Thuận']]){
   await picker.selectOption(value);await page.getByRole('button',{name:'Add resident',exact:true}).click();
   await page.waitForFunction(n=>JSON.parse(localStorage.getItem('nj-studio-scene-v1')||'{}').actors?.some(a=>a.name===n),name,{timeout:60000});
  }
  const added=await actors();
  assert.equal(added.find(a=>a.name==='Sora').recipe.hair.style,'bob','a Studio character can be posed in a scene');
  const thuan=added.find(a=>a.name==='Thuận').recipe;
  assert.equal(JSON.stringify(thuan),await page.evaluate(async()=>{const [{recipeFor},{normalizeRecipe}]=await Promise.all([import('/johansson-town/src/avatars/cast.js'),import('/johansson-town/src/avatars/recipe.js')]);return JSON.stringify(normalizeRecipe(recipeFor('Thuan')));}),
   'Build scene\'s Thuan is World\'s Thuan, with any published look');
  assert.deepEqual(errors,[],`page errors at ${width}x${height}`);
  console.log(`ok ${width}x${height}: agent API, ${RESIDENT_NAMES.length} residents and a Studio character in both pickers, World's Thuan in Build scene`);
  await context.close();
 }
}finally{await browser.close();await server.close();}
