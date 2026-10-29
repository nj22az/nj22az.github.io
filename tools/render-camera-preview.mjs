// Pocket Camera's preview pictures: one photo (the owner's riverside café, IMG_2855.jpeg) cut into five upright
// slices, each in another of World's Looks through the app's own engine, with Fuji's die-cut wave on top.
// Writes camera/preview.jpg (1200×630, the link preview), camera/card.webp and card-narrow.webp (the homepage project
// card, wide and on a phone).
// Run from the repository root: node tools/render-camera-preview.mjs
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {serveGame} from '../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const repo=fileURLToPath(new URL('../',import.meta.url));
const server=await serveGame({root:repo,mounts:['camera','johansson-town']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage();
 page.on('pageerror',e=>{throw e;});
 await page.goto(`${server.url}camera/looks-gl.js`);
 const photo=`data:image/jpeg;base64,${(await readFile(new URL('../IMG_2855.jpeg',import.meta.url))).toString('base64')}`;
 const out=await page.evaluate(async photo=>{
  const {createLookEngine,normalRecipe,LOOKS}=await import('/camera/looks-gl.js');
  const {loadStickerSets,drawStickers}=await import('/camera/stickers.js');
  const img=new Image();img.src=photo;await img.decode();
  const iw=img.naturalWidth,ih=img.naturalHeight;
  const gl=document.createElement('canvas');const engine=createLookEngine(gl);engine.setSource('photo',img,iw,ih);
  await loadStickerSets();
  async function compose(W,H,looks,cw,sticker){
   // The right of the café, at the picture's shape: the chairs, the tables and the river, and none of the people.
   const ch=Math.min(.88,cw*iw*H/W/ih),crop={x:1-cw,y:.12,w:cw,h:ch};
   gl.width=W;gl.height=H;
   const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
   const slice=W/looks.length;
   looks.forEach((look,i)=>{
    const px=engine.render(normalRecipe({layers:[{look}]}),{source:'photo',crop,width:W,height:H});
    const t=document.createElement('canvas');t.width=W;t.height=H;t.getContext('2d').putImageData(new ImageData(px.data,W,H),0,0);
    g.drawImage(t,i*slice,0,slice,H,i*slice,0,slice,H);
   });
   g.fillStyle='rgba(255,255,255,.9)';for(let i=1;i<looks.length;i++)g.fillRect(Math.round(i*slice)-1,0,2,H);
   await drawStickers(g,W,H,[sticker]);
   g.font='600 22px -apple-system,"Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';
   looks.forEach((look,i)=>{
    const label=LOOKS[look].short,x=(i+.5)*slice,w=g.measureText(label).width+28;
    g.fillStyle='rgba(0,0,0,.58)';g.beginPath();g.roundRect(x-w/2,H-62,w,38,19);g.fill();g.fillStyle='#fff';g.fillText(label,x,H-43);
   });
   return c;
  }
  const wide=await compose(1200,630,['none','pocket','manga','print','watercolour'],.8,{id:'fuji/Wave',x:.9,y:.6,size:.6,angle:6,flip:false});
  const narrow=await compose(720,660,['pocket','manga','print'],.62,{id:'fuji/Wave',x:.84,y:.6,size:.62,angle:6,flip:false});
  return {jpg:wide.toDataURL('image/jpeg',.86),webp:wide.toDataURL('image/webp',.82),narrow:narrow.toDataURL('image/webp',.82)};
 },photo);
 await writeFile(new URL('../camera/preview.jpg',import.meta.url),Buffer.from(out.jpg.split(',')[1],'base64'));
 await writeFile(new URL('../camera/card.webp',import.meta.url),Buffer.from(out.webp.split(',')[1],'base64'));
 await writeFile(new URL('../camera/card-narrow.webp',import.meta.url),Buffer.from(out.narrow.split(',')[1],'base64'));
 console.log('camera/preview.jpg, card.webp and card-narrow.webp written');
}finally{await browser.close();await server.close();}
