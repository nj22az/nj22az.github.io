// Observe colour/bit-depth/sorting contracts through the real renderer, rather than asserting shader text.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const server=await serveGame({root:fileURLToPath(new URL('../../',import.meta.url)),mounts:['camera','johansson-town']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const identity=await readFile(new URL('../luts/identity.png',import.meta.url));
 await page.route('**/luts/*.png*',route=>route.fulfill({contentType:'image/png',headers:{'cache-control':'no-store'},body:identity}));
 await page.goto(server.url+'camera/looks-gl.js');
 const identityError=await page.evaluate(async()=>{
  const {createLookEngine,normalRecipe}=await import('/camera/looks-gl.js');
  const src=document.createElement('canvas');src.width=128;src.height=64;const g=src.getContext('2d'),im=g.createImageData(128,64);
  for(let y=0;y<64;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4;im.data.set([x*255/127,y*255/63,((x*13+y*7)%128)*255/127,255],i);}g.putImageData(im,0,0);
  const e=createLookEngine(document.createElement('canvas'));await e.loadLuts();e.setSource('test',src,128,64);
  const draw=look=>e.render(normalRecipe({layers:[{look}]}),{source:'test',width:128,height:64}).data;
  const a=draw('none'),b=draw('warmSlide');let error=0;for(let i=0;i<a.length;i++)error=Math.max(error,Math.abs(a[i]-b[i]));return error;
 });
 assert.ok(identityError<=2,`sampler3D preserves RGB axes, interpolation and endpoints (${identityError})`);
 await page.unroute('**/luts/*.png*');
 await page.reload();
 const out=await page.evaluate(async()=>{
  const {createLookEngine,normalRecipe}=await import('/camera/looks-gl.js');
  const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const e=createLookEngine(canvas(64,16));await e.loadLuts();
  const draw=(source,look,amount=1)=>e.render(normalRecipe({layers:[{look,amount}]}),{source,width:e.sourceSize(source).width,height:e.sourceSize(source).height}).data;
  const grey=canvas(8,8);grey.getContext('2d').fillStyle='#808080';grey.getContext('2d').fillRect(0,0,8,8);e.setSource('grey',grey,8,8);
  const mac=draw('grey','macOneBit'),colours=new Set();let white=0;
  for(let i=0;i<mac.length;i+=4){colours.add(mac.slice(i,i+3).join(','));if(mac[i]===255)white++;}
  const gradient=canvas(128,96),gg=gradient.getContext('2d'),image=gg.createImageData(128,96);
  for(let y=0;y<96;y++)for(let x=0;x<128;x++)image.data.set([x*2,y*2.5,(x*9+y*5)%256,255],(y*128+x)*4);gg.putImageData(image,0,0);e.setSource('gradient',gradient,128,96);
  const vga=draw('gradient','vgaAdventure'),palette=new Set();for(let i=0;i<vga.length;i+=4)palette.add(vga.slice(i,i+3).join(','));
  const a=draw('gradient','warmSlide'),b=draw('gradient','softNegative');let gradeDifference=0;for(let i=0;i<a.length;i++)gradeDifference+=Math.abs(a[i]-b[i]);
  const ramp=[150,80,175,65,110,190,95,160,75,130,180,60,170,100,145,120],sort=canvas(64,16),sg=sort.getContext('2d');
  for(let i=0;i<32;i++){const value=i===20?0:ramp[i%16];sg.fillStyle=`rgb(${value},${value},${value})`;sg.fillRect(i*2,0,2,16);}
  e.setSource('sort',sort,64,16);const original=draw('sort','none'),sorted=draw('sort','glitch'),mixed=draw('sort','glitch',.5);
  const row=px=>Array.from({length:16},(_,i)=>px[(8*64+i*2)*4]);
  let mixError=0,barrierError=0;for(let i=0;i<sorted.length;i++){mixError=Math.max(mixError,Math.abs(mixed[i]-(original[i]+sorted[i])*.5));if(i%256>=128)barrierError=Math.max(barrierError,Math.abs(original[i]-sorted[i]));}
  const phone=createLookEngine(canvas(64,16),{light:true});phone.setSource('sort',sort,64,16);const recipe=normalRecipe({layers:[{look:'glitch'}]});
  for(let i=0;i<300&&!phone.draw(recipe,{source:'sort'});i++)await new Promise(r=>setTimeout(r,10));
  const preview=new Uint8Array(64*16*4);phone.gl.readPixels(0,0,64,16,phone.gl.RGBA,phone.gl.UNSIGNED_BYTE,preview);
  const saved=phone.render(recipe,{source:'sort',width:64,height:16}).data;
  const hot=canvas(256,192),hg=hot.getContext('2d');hg.fillStyle='black';hg.fillRect(0,0,256,192);hg.fillStyle='white';hg.fillRect(124,92,8,8);e.setSource('hot',hot,256,192);
  const film=draw('hot','colourFilm'),at=(x,y)=>Array.from(film.slice((y*256+x)*4,(y*256+x)*4+3));
  const paint=canvas(64,48),pg=paint.getContext('2d'),pi=pg.createImageData(64,48);
  for(let y=0;y<48;y++)for(let x=0;x<64;x++){const n=((x*17+y*11)%19)-9,c=x<32?[170,50,50]:[50,70,170];pi.data.set([...c.map(v=>v+n),255],(y*64+x)*4);}pg.putImageData(pi,0,0);e.setSource('paint',paint,64,48);
  const painted=draw('paint','oil');let rawNoise=0,paintNoise=0;const sample=(px,x,y)=>px[(y*64+x)*4];
  for(let y=10;y<38;y++)for(let x=10;x<22;x++){rawNoise+=Math.abs(sample(pi.data,x,y)-sample(pi.data,x+1,y));paintNoise+=Math.abs(sample(painted,x,y)-sample(painted,x+1,y));}
  return {macColours:[...colours],white,vgaColours:palette.size,gradeDifference,original:row(original),sorted:row(sorted),mixError,barrierError,
   phonePreview:row(preview),phoneSaved:row(saved),halo:at(138,96),far:at(15,15),rawNoise,paintNoise};
 });
 assert.deepEqual(new Set(out.macColours),new Set(['0,0,0','255,255,255']));assert.equal(out.white,32,'half grey has exactly half white coverage in an 8×8 screen');
 assert.ok(out.vgaColours>32&&out.vgaColours<=256,`${out.vgaColours} colours stay inside the VGA palette`);
 assert.ok(out.gradeDifference>10000,'two authored LUTs make distinct grades');
 assert.deepEqual(out.sorted,[...out.original].sort((a,b)=>a-b),'Glitch really sorts a qualifying run and preserves its values');
 assert.ok(out.mixError<=1,'amount mixes against the original layer input');assert.equal(out.barrierError,0,'a run with a black barrier is left intact');
 assert.deepEqual(out.phonePreview,out.original,'phone live view skips sorting');assert.deepEqual(out.phoneSaved,out.sorted,'phone save uses full sorting');
 assert.ok(out.halo[0]>out.far[0]+1&&out.halo[0]-out.far[0]>out.halo[2]-out.far[2],'halation spreads a warm halo outside a highlight');
 assert.ok(out.paintNoise<out.rawNoise*.7,'anisotropic paint simplifies texture inside a material');
 assert.deepEqual(errors,[]);console.log('photo-pipeline browser: identity 3D LUT, authored grades, 1-bit/VGA bounds, real sorting/mix/barriers/phone save, halation and paint checks pass',JSON.stringify(out));
}finally{await browser.close();await server.close();}
