// Real local model + synthetic same-colour silhouette, including source changes and coordinate transforms.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const server=await serveGame({root:fileURLToPath(new URL('../../',import.meta.url)),mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('request',r=>requests.push(r.url()));
 await page.goto(server.url+'camera/looks-gl.js');
 const out=await page.evaluate(async()=>{
  const {createLookEngine,normalRecipe}=await import('/camera/looks-gl.js');
  const {createPersonMasker}=await import('/camera/person-mask.js');
  const art=document.createElement('canvas');art.width=256;art.height=192;art.getContext('2d').fillStyle='#888';art.getContext('2d').fillRect(0,0,256,192);
  const c=document.createElement('canvas');c.width=256;c.height=192;const e=createLookEngine(c),revision=e.setSource('test',art,256,192);
  const pixels=new Uint8Array(64*48);for(let y=8;y<40;y++)for(let x=8;x<24;x++)pixels[y*64+x]=255;
  const render=(opts={})=>e.render(normalRecipe({layers:[{look:'lines'}],...opts}),{source:'test',width:256,height:192,...opts}).data;
  const at=(px,x,y)=>px[(y*256+x)*4];
  const before=render();e.setPersonMask('test',{width:64,height:48,pixels},revision);const after=render(),mirror=render({mirror:true}),twin=render({trick:'twin'}),crop=render({crop:{x:.25,y:0,w:.75,h:1}});
  const check={plain:at(before,32,90),outlined:at(after,32,90),inside:at(after,60,90),mirror:at(mirror,224,90),mirrorOld:at(mirror,32,90),twin:at(twin,224,90),crop:Math.min(...[41,42,43,44].map(x=>at(crop,x,90)))};
  const thumbs=e.thumbnails(normalRecipe({layers:[{look:'lines'}]}),{source:'test',size:192,names:['lines']});
  check.thumb=Math.min(...[23,24,25].map(x=>thumbs.data[(90*192+x)*4]));
  e.setSource('test',art,256,192);check.stale=e.setPersonMask('test',{width:64,height:48,pixels},revision);check.cleared=at(render(),32,90);
  const masker=createPersonMasker(),image=new Image();
  image.src='/assets/images/nils-lake-hero.jpg';await image.decode();
  const t=performance.now(),mask=await masker.mask(image);check.modelMs=performance.now()-t;check.modelEmpty=mask===null;check.modelReady=masker.ready;
  masker.close();return check;
 });
 assert.ok(out.plain>220&&out.outlined<120&&out.inside>220,'same-colour person acquires only a boundary');
 assert.ok(out.mirror<120&&out.mirrorOld>220&&out.twin<120&&out.crop<120,'mask follows mirror, Twin and crop');
 assert.ok(out.thumb<120,'thumbnail uses the mask');
 assert.equal(out.stale,false);assert.ok(out.cleared>220,'source replacement clears old outline');
 assert.equal(out.modelEmpty,true,'garden has no substantial person');
 assert.equal(out.modelReady,true,'null mask is successful inference, not a hidden load failure');
 assert.ok(requests.some(u=>u.endsWith('/selfie_segmenter.tflite')),'real model fetched locally');
 assert.ok(requests.every(u=>u.startsWith(server.url)),'no external service sees the picture');
 assert.deepEqual(errors,[]);
 console.log('person-mask browser: local inference, same-colour outline, crop/mirror/Twin, thumbnail and stale-mask checks pass',JSON.stringify(out));
}finally{await browser.close();await server.close();}
