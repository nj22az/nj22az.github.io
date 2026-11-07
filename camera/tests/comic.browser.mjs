// The Pop and Comic Looks (the owner, 4 November 2026: "more shaders … that might make the images really funny or pop,
// or look like a real manga or a cartoon or a comic book"): each of the eight draws the test portrait as its own
// picture; Funhouse mirror swells the found face and leaves the rest alone; Action manga's speed lines stay outside the
// subject's zone; Heat camera runs hottest on the face; the nine kinds sit in one row that scrolls on a narrow phone
// with the open kind in view; no page errors.
//   node camera/tests/comic.browser.mjs
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {writeFile} from 'node:fs/promises';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url));
const server=await serveGame({root,mounts:['camera','johansson-town','assets']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let checks=0;const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${name}`);};
const shots=process.env.CAMERA_SHOTS;
const NEW=['popArt','poster','neon','thermal','funhouse','goldenAge','actionManga','oldCartoon'];
// A face record the engine accepts, as an oval at a centre with half-sizes, in the picture's own coordinates.
const faceAt=`(cx,cy,rx,ry)=>{const ring=(x,y,w,h,n=8)=>Array.from({length:n},(_,i)=>[x+w*Math.cos(i/n*2*Math.PI),y+h*Math.sin(i/n*2*Math.PI)]);
 const f={oval:ring(cx,cy,rx,ry,12),lipsOuter:ring(cx,cy+ry*.5,rx*.3,ry*.12),lipsInner:ring(cx,cy+ry*.5,rx*.2,ry*.05),
  eyeL:ring(cx-rx*.4,cy-ry*.2,rx*.2,ry*.08),eyeR:ring(cx+rx*.4,cy-ry*.2,rx*.2,ry*.08),browL:ring(cx-rx*.4,cy-ry*.4,rx*.25,ry*.04),browR:ring(cx+rx*.4,cy-ry*.4,rx*.25,ry*.04),
  eyes:[{x:cx-rx*.4,y:cy-ry*.2,r:rx*.08},{x:cx+rx*.4,y:cy-ry*.2,r:rx*.08}],noseTip:[cx,cy+ry*.15],noseBridge:[cx,cy-ry*.1],chin:[cx,cy+ry],forehead:[cx,cy-ry],
  cheekL:[cx-rx*.6,cy+ry*.2],cheekR:[cx+rx*.6,cy+ry*.2],noseWingL:[cx-rx*.12,cy+ry*.15],noseWingR:[cx+rx*.12,cy+ry*.15],open:0,smile:0,blinkL:0,blinkR:0};return f;}`;
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},kept:true,printer:false})));
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 await page.setInputFiles('#picker',join(root,'camera/tests/fixtures/portrait-braids.jpg'));
 await page.waitForFunction(()=>window.pocketCamera.state.edit?.width===640);
 await page.waitForFunction(()=>window.pocketCamera.state.edit.recipe.faces?.length>0,null,{timeout:90000});

 await check('the eight new Looks each draw the portrait as a picture of their own, full and LIGHT',async()=>{
  const r=await page.evaluate(async NEW=>{
   const m=await import('/camera/looks-gl.js');const e=window.pocketCamera.state.edit,faces=e.recipe.faces;
   const W=160,H=240,out={};
   for(const light of [false,true]){
    const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
    const engine=m.createLookEngine(canvas,{light});engine.setSource('p',e.picture,e.width,e.height);
    const pixels={};
    for(const look of ['none',...NEW]){
     const recipe=m.normalRecipe({layers:[{look}],faces});
     let ready=false;for(let i=0;i<400&&!ready;i++){ready=engine.draw(recipe,{source:'p'});if(!ready)await new Promise(r=>setTimeout(r,10));}
     if(!ready||engine.failed(look))throw new Error(`${look} ${light?'LIGHT':'full'} failed`);
     const raw=new Uint8Array(W*H*4);engine.gl.readPixels(0,0,W,H,engine.gl.RGBA,engine.gl.UNSIGNED_BYTE,raw);pixels[look]=raw;
    }
    const diff=(a,b)=>{let s=0;for(let i=0;i<a.length;i+=4)s+=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);return s/(a.length/4)/3;};
    const names=Object.keys(pixels),table={};
    for(const a of names)for(const b of names)if(a<b)table[`${a}|${b}`]=Math.round(diff(pixels[a],pixels[b])*10)/10;
    out[light?'light':'full']=table;
    engine.gl.getExtension('WEBGL_lose_context')?.loseContext();
   }
   return out;
  },NEW);
  for(const build of ['full','light'])for(const [pair,d] of Object.entries(r[build]))assert.ok(d>8,`${build} ${pair} differ by only ${d}`);
  console.log(`    ${Object.keys(r.full).length} pairs per build, every pair differs by more than 8 levels per channel`);
 });

 await check('Funhouse mirror swells the found face and leaves the rest of the picture untouched',async()=>{
  const r=await page.evaluate(async faceAt=>{
   const m=await import('/camera/looks-gl.js');const make=eval(faceAt);
   // A grid of thin black lines every 16 pixels on white, the face an oval in the middle.
   const S=400,g=document.createElement('canvas');g.width=g.height=S;const c=g.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,S,S);c.fillStyle='#000';
   for(let x=8;x<S;x+=16){c.fillRect(x,0,2,S);c.fillRect(0,x,S,2);}
   const canvas=document.createElement('canvas');canvas.width=canvas.height=S;const engine=m.createLookEngine(canvas);engine.setSource('g',g,S,S);
   const faces=[make(.5,.5,.15,.2)];
   const draw=look=>{const px=engine.render(m.normalRecipe({layers:[{look}],faces}),{source:'g',width:S,height:S}).data;return px;};
   const plain=draw('none'),bulged=draw('funhouse');
   // Line crossings along the row through the middle, in a window round the middle and in one at the left edge.
   const crossings=(px,y,x0,x1)=>{let n=0,dark=false;for(let x=x0;x<x1;x++){const d=px[(y*S+x)*4]<128;if(d&&!dark)n++;dark=d;}return n;};
   const y=204;   // between two of the grid's horizontal lines
   return {middlePlain:crossings(plain,y,160,240),middleBulged:crossings(bulged,y,160,240),edgePlain:crossings(plain,y,0,60),edgeBulged:crossings(bulged,y,0,60),
    same:(()=>{let d=0;for(let yy=0;yy<S;yy+=3)for(let x=0;x<40;x+=1){const i=(yy*S+x)*4;d=Math.max(d,Math.abs(plain[i]-bulged[i]));}return d;})()};
  },faceAt);
  assert.ok(r.middleBulged<=r.middlePlain*.6,`the grid in the middle is wider through the mirror: ${r.middleBulged} crossings against ${r.middlePlain}`);
  assert.equal(r.edgeBulged,r.edgePlain,'the grid at the edge is as it was');assert.ok(r.same<=2,`the left edge is untouched (max difference ${r.same})`);
  console.log(`    middle ${r.middlePlain} -> ${r.middleBulged} crossings; edge ${r.edgePlain} -> ${r.edgeBulged}`);
 });

 await check('Action manga rules speed lines outside the subject only; Heat camera runs hottest on the face',async()=>{
  const r=await page.evaluate(async faceAt=>{
   const m=await import('/camera/looks-gl.js');const make=eval(faceAt);
   const S=400,g=document.createElement('canvas');g.width=g.height=S;const c=g.getContext('2d');c.fillStyle='#808080';c.fillRect(0,0,S,S);
   const canvas=document.createElement('canvas');canvas.width=canvas.height=S;const engine=m.createLookEngine(canvas);engine.setSource('g',g,S,S);
   const faces=[make(.5,.5,.12,.16)];
   const draw=look=>engine.render(m.normalRecipe({layers:[{look}],faces}),{source:'g',width:S,height:S}).data;
   const manga=draw('manga'),action=draw('actionManga'),heat=draw('thermal');
   // Spokes: pixels Action manga inks that Manga's screens leave white, counted in a corner and in the middle.
   const spokes=(x0,y0)=>{let n=0;for(let y=y0;y<y0+60;y++)for(let x=x0;x<x0+60;x++){const i=(y*S+x)*4;if(action[i]<100&&manga[i]>160)n++;}return n/3600;};
   const warmth=(x0,y0)=>{let s=0;for(let y=y0;y<y0+20;y++)for(let x=x0;x<x0+20;x++){const i=(y*S+x)*4;s+=heat[i]+heat[i+1];}return s/400;};
   return {corner:spokes(0,0),corner2:spokes(340,340),middle:spokes(170,170),face:warmth(190,190),far:warmth(10,10)};
  },faceAt);
  assert.ok(r.corner>.01&&r.corner2>.01,`spokes in the corners: ${r.corner}, ${r.corner2}`);assert.equal(r.middle,0,'no spoke crosses the face');
  assert.ok(r.face>r.far+40,`the face is warmer: ${r.face} against ${r.far}`);
  console.log(`    spokes ${(r.corner*100).toFixed(1)}% / ${(r.corner2*100).toFixed(1)}% of the corners, none in the middle; heat ${r.face.toFixed(0)} on the face, ${r.far.toFixed(0)} far from it`);
 });

 await check('nine kinds in one row: Pop after Photo, Comic after Drawn; the row scrolls on a narrow phone with the open kind in view',async()=>{
  await page.click('#tabLooks');
  const row=()=>page.evaluate(()=>{const r=document.getElementById('lookGroups'),rr=r.getBoundingClientRect();return {kinds:[...r.children].map(b=>b.dataset.group),tops:[...new Set([...r.children].map(b=>Math.round(b.getBoundingClientRect().top)))].length,
   overflow:r.scrollWidth-r.clientWidth,open:[...r.children].find(b=>b.getAttribute('aria-selected')==='true')?.dataset.group,
   openVisible:(()=>{const b=[...r.children].find(b=>b.getAttribute('aria-selected')==='true');if(!b)return false;const br=b.getBoundingClientRect();return br.left>=rr.left-1&&br.right<=rr.right+1;})()};});
  let r=await row();
  assert.deepEqual(r.kinds,['photo','pop','games','80s','drawn','comic','painted','print','riso']);assert.equal(r.tops,1,'one row');assert.ok(r.overflow<=0,`fits a 390 phone (overflow ${r.overflow})`);
  await page.setViewportSize({width:320,height:700});await page.click('#lookGroups button[data-group="riso"]');await page.waitForTimeout(150);
  r=await row();assert.equal(r.tops,1,'still one row');assert.ok(r.overflow>0,'the row scrolls on a 320 phone');assert.equal(r.open,'riso');assert.ok(r.openVisible,'the open kind is in view');
  await page.click('#lookGroups button[data-group="photo"]');await page.waitForTimeout(150);r=await row();assert.equal(r.open,'photo');assert.ok(r.openVisible,'scrolled back to the first');
  if(shots){await page.setViewportSize({width:390,height:844});await page.click('#lookGroups button[data-group="comic"]');await page.waitForTimeout(200);await page.screenshot({path:join(shots,'comic-kinds.png')});}
 });
 assert.deepEqual(errors,[],'no page errors');
 console.log(`comic: ${checks} checks passed`);
}finally{await browser.close();await server.close();}
