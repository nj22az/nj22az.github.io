// "Make model" in Chromium at the iPad's viewport (1024x1366) and a phone's (390x844), by taps:
// node avatar-creator/tests/model.browser.mjs [output folder] (optional CHROMIUM_EXECUTABLE).
// - the library lists every catalogue asset and registry prop in kind groups, and search narrows it;
// - an asset opens in World's look, its checks are shown, and its GLB, STL, PNG and card are ready before the tap and
//   save in one tap each, named by id and version; they are opened again here: the GLB with World's GLTFLoader (its
//   asset node, its size, its triangles), the STL (millimetres, z up, its watertight report), the PNG (1200 square,
//   with alpha), the card (every check);
// - the Lathe maker: three presets, a profile point dragged, the card filled in, every check passing, and its files
//   and its hand-off package for World's draft, which the johansson-studio tools then accept (asset_draft, a dry run).
// Screenshots go to the output folder (default output/studio-model/, which git ignores).
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {mkdir,readFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':fileURLToPath(new URL('../../johansson-town/node_modules/playwright/index.js',import.meta.url)));
const {serveGame}=await import('../../johansson-town/tools/mcp/static-server.mjs');
const THREE=await import('../../johansson-town/vendor/three.module.js'),{GLTFLoader}=await import('../../johansson-town/vendor/GLTFLoader.js');
const {readStl,meshReport}=await import('../../johansson-town/src/studio/modeller/stl.js');
const {catalogIds}=await import('../../johansson-town/src/catalog/catalog-cards.js');
const {PROP_REGISTRY}=await import('../../johansson-town/src/studio/prop-registry.js');
const root=fileURLToPath(new URL('../../',import.meta.url)),OUT=process.argv[2]||root+'output/studio-model';
await mkdir(OUT,{recursive:true});

async function glb(path){
 const b=await readFile(path),loader=new GLTFLoader();loader.register(()=>({name:'stand-in',loadTexture:()=>Promise.resolve(new THREE.Texture())}));
 const g=await loader.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');let asset=null,triangles=0;const box=new THREE.Box3();g.scene.updateMatrixWorld(true);
 g.scene.traverse(o=>{if(!asset&&o.userData?.asset)asset=o.userData.asset;if(o.isMesh){triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;box.expandByObject(o);}});
 return {asset,triangles,size:box.getSize(new THREE.Vector3()).toArray(),minY:box.min.y};
}
async function stl(path){const s=readStl(new Uint8Array(await readFile(path)));return meshReport(s.triangles,{weld:.01});}
async function png(path){const b=await readFile(path);assert.equal(b.subarray(1,4).toString(),'PNG');return {w:b.readUInt32BE(16),h:b.readUInt32BE(20),alpha:b[25]===6};}

const server=await serveGame({root,mounts:['johansson-town','avatar-creator']});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results={};
try{
 for(const [label,width,height,scale] of [['ipad',1024,1366,1],['phone',390,844,2]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:scale,hasTouch:true,isMobile:width<500,acceptDownloads:true});
  await context.route('**/*',r=>r.request().url().startsWith(server.url)?r.continue():r.abort());
  const page=await context.newPage(),errors=[];page.setDefaultTimeout(300000);page.on('pageerror',e=>errors.push(e.message));
  const state=()=>page.evaluate(()=>window.__studioModel.state);
  const ready=key=>page.waitForFunction(k=>{const s=window.__studioModel?.state;return (!k||s?.open===k)&&s?.checks.length&&s.ready.glb&&s.ready.stl&&s.ready.png&&s.ready.card;},key);
  const save=async kind=>{const [d]=await Promise.all([page.waitForEvent('download'),page.locator(`[data-save="${kind}"]`).tap()]);const p=`${OUT}/${label}-${d.suggestedFilename()}`;await d.saveAs(p);return {name:d.suggestedFilename(),path:p};};
  await page.goto(server.url+'avatar-creator/');await page.locator('.studio-tools').waitFor();
  await page.locator('[data-mode="model"]').tap();await page.locator('.model-tile').first().waitFor();
  // The library: every asset once, grouped by kind; search narrows it.
  assert.equal(await page.locator('.model-tile').count(),catalogIds().length+PROP_REGISTRY.length);
  assert.deepEqual(await page.locator('.model-group h2').evaluateAll(h=>h.map(x=>x.firstChild.textContent.trim())),['Props','Furniture','Fixtures','Signs','Vehicles and their parts']);
  await page.waitForFunction(()=>[...document.querySelectorAll('.model-tile-picture')].every(p=>p.querySelector('img')),null,{timeout:300000});
  await page.screenshot({path:`${OUT}/${label}-library.png`});
  await page.locator('[data-search]').fill('lantern');
  assert.deepEqual(await page.locator('.model-tile-name').allTextContents(),['Paper pumpkin lantern','Plastic jack-o’-lantern pail']);
  await page.locator('[data-search]').fill('');
  // An asset opened, checked and saved in each format.
  await page.locator('.model-tile[data-key="registry:vending-machine"]').tap();await ready('registry:vending-machine');
  const vending=await state();assert.ok(vending.checks.every(c=>c.ok),JSON.stringify(vending.checks.filter(c=>!c.ok)));
  await page.locator('[data-action="resident"]').tap();await page.waitForTimeout(500);
  await page.screenshot({path:`${OUT}/${label}-vending-resident.png`});
  const files={};for(const k of ['glb','stl','png','card'])files[k]=await save(k);
  assert.deepEqual(Object.values(files).map(f=>f.name),['vending-machine.v1.glb','vending-machine.v1.stl','vending-machine.v1.png','vending-machine.v1.asset.json']);
  const g=await glb(files.glb.path);assert.equal(g.asset,'Drinks machine (Johansson Vending JV-16C)');assert.deepEqual(g.size.map(v=>Math.round(v*100)),[104,183,83]);assert.ok(Math.abs(g.minY)<1e-4);
  const s=await stl(files.stl.path);assert.equal(s.triangles,g.triangles);assert.deepEqual(s.max.map((v,i)=>Math.round(v-s.min[i])),[1042,826,1830],'millimetres, z up');
  assert.match(await page.locator('[data-print]').textContent(),/^3D printing: (Watertight|Not watertight)/);
  assert.deepEqual(await png(files.png.path),{w:1200,h:1200,alpha:true});
  const card=JSON.parse(await readFile(files.card.path,'utf8'));assert.equal(card.id,'vending-machine');assert.equal(card.checks.length,12);
  results[label]={vending:{glb:g,stl:{triangles:s.triangles,watertight:s.watertight,shells:s.shells}}};
  // The Lathe maker: three presets of the chōchin, a point dragged, the card, its files and its package.
  await page.locator('[data-action="library"]').tap();
  await page.locator('[data-action="lathe"]').tap();await ready(null);
  for(const preset of ['festival','porch','akachochin']){
   await page.locator(`[data-preset="${preset}"]`).tap();await ready(null);await page.waitForTimeout(400);
   if(label==='ipad')await page.screenshot({path:`${OUT}/${label}-lathe-${preset}.png`});
  }
  const profile=page.locator('[data-profile]'),b=await profile.boundingBox();await profile.scrollIntoViewIfNeeded();
  const before=(await state()).params.profile[2][1],box=await profile.boundingBox(),{params}=await state();
  // the middle point is on the right of the axis at half height
  const pt=await profile.evaluate((c,p)=>{const w=c.clientWidth,h=Math.round(Math.min(260,w*.8)),m=22,rmax=Math.max(...p.profile.map(q=>q[1]))+Math.abs(p.bulge)+.01,s=Math.min((w-2*m)/(2*rmax*1.25),(h-2*m)/p.height);return [w/2+p.profile[2][1]*s,h-m-p.profile[2][0]*p.height*s];},params);
  await page.mouse.move(box.x+pt[0],box.y+pt[1]);await page.mouse.down();await page.mouse.move(box.x+pt[0]+12,box.y+pt[1],{steps:4});await page.mouse.up();void b;
  const after=(await state()).params.profile[2][1];assert.ok(after>before,`dragging the point widens the lantern (${before} → ${after})`);
  await page.locator('[data-field="name"]').fill('Minato akachōchin');
  await page.locator('[data-field="for"]').fill('The regulars of Minato izakaya, and anyone on the lane after dark looking for a drink.');
  await page.locator('[data-field="why"]').fill('A red paper lantern lit at the door says the izakaya is open; it is how the lane knows where to go.');
  await page.locator('[data-field="where"]').fill('Hung under the eave beside Minato’s noren, its top 2.2 m up, lit from opening time.');
  await page.locator('[data-field="tags"]').fill('chōchin, izakaya, lantern, Minato');
  await page.waitForFunction(()=>{const s=window.__studioModel.state;return s.id==='minato-akachochin'&&s.checks.length&&s.checks.every(c=>c.ok)&&s.ready.glb&&s.ready.stl&&s.ready.png&&s.ready.card&&s.ready.package;});
  await page.locator('[data-action="resident"]').tap();await page.waitForTimeout(500);
  await page.locator('.model-canvas').scrollIntoViewIfNeeded();
  await page.screenshot({path:`${OUT}/${label}-lantern-resident.png`});
  const made={};for(const k of ['glb','stl','png','card','package'])made[k]=await save(k);
  assert.deepEqual(Object.values(made).map(f=>f.name),['minato-akachochin.v1.glb','minato-akachochin.v1.stl','minato-akachochin.v1.png','minato-akachochin.v1.asset.json','minato-akachochin.v1.studio-asset.json']);
  const lg=await glb(made.glb.path),ls=await stl(made.stl.path),lc=JSON.parse(await readFile(made.card.path,'utf8'));
  assert.equal(lg.asset,'Minato akachōchin');assert.equal(ls.triangles,lg.triangles);assert.equal(ls.watertight,false,'a paper lantern is an open sheet');
  assert.match(await page.locator('[data-print]').textContent(),/Not watertight: \d+ open edges/);
  assert.equal(lc.maker.maker,'lathe');assert.deepEqual(lc.anchors.hang,[0,lc.maker.height,0]);assert.ok(lc.checks.every(c=>c.ok));
  assert.deepEqual(await png(made.png.path),{w:1200,h:1200,alpha:true});
  const pkg=JSON.parse(await readFile(made.package.path,'utf8'));assert.equal(pkg.format,'johansson-studio-asset');assert.deepEqual(Object.keys(pkg.files),['model.glb','hero.png']);
  results[label].lantern={glb:lg,stl:{triangles:ls.triangles,watertight:ls.watertight,openEdges:ls.openEdges},package:made.package.path,card:made.card.path};
  // Saved in this browser, it is in the library; its card opens it again in the maker.
  await page.locator('[data-action="save-design"]').tap();
  await page.locator('[data-action="library"]').tap();
  assert.equal(await page.locator('.model-tile[data-key="made:minato-akachochin"]').count(),1);
  await page.locator('[data-file]').setInputFiles(made.card.path);await ready(null);
  assert.equal((await state()).id,'minato-akachochin');assert.deepEqual((await state()).params,lc.maker);
  assert.deepEqual(errors,[]);
  await context.close();
 }
 console.log(JSON.stringify(results,null,1));
 console.log('Make model: library, export and Lathe maker checks passed at iPad and phone size.');
}finally{await browser.close();await server.close();}
