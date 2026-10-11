/**
 * Headless Johansson Studio for the tools: the real Studio page, served from this checkout on a private loopback
 * address (only /johansson-town/ and /avatar-creator/), opened with ?agent at the iPad's viewport (1024x1366, at
 * twice the pixels), so a render is what the creator sees. Nothing outside the loopback address is fetched.
 * Playwright and Chromium load only here, and only when a render is asked for.
 */
import {serveGame} from '../mcp/static-server.mjs';
import {CODE_ROOT} from './repo.mjs';

export const IPAD=Object.freeze({width:1024,height:1366,deviceScaleFactor:2});

export class StudioPage{
 constructor(){this.starting=null;this.closed=false;}
 async start(){
  this.starting??=(async()=>{
   const {chromium}=await import('playwright');
   const preview=await serveGame({root:CODE_ROOT,mounts:['johansson-town','avatar-creator']});
   let browser;
   try{
    browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    const context=await browser.newContext({viewport:{width:IPAD.width,height:IPAD.height},deviceScaleFactor:IPAD.deviceScaleFactor,hasTouch:true,serviceWorkers:'block'});
    const local=new URL(preview.url).origin;
    await context.route('**/*',route=>route.request().url().startsWith(local+'/')?route.continue():route.abort());
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(new URL('avatar-creator/?agent',preview.url).href);
    await page.waitForFunction(()=>window.__JOHANSSON_STUDIO__?.ready===true,null,{timeout:120000}).catch(e=>{throw Error(`Johansson Studio did not start in the headless page${errors.length?': '+errors.join('; '):''} (${e.message.split('\n')[0]})`);});
    Object.assign(this,{preview,browser,context,page,errors});
    return this;
   }catch(e){await browser?.close().catch(()=>{});await preview.close();this.starting=null;throw e;}
  })();
  return this.starting;
 }
 /** A portrait as PNG bytes (studio-api.js renderPortrait). */
 async renderPortrait(recipe,options){
  await this.start();
  const url=await this.page.evaluate(([r,o])=>window.__JOHANSSON_STUDIO__.renderPortrait(r,o),[recipe,options]);
  return Buffer.from(url.slice(url.indexOf(',')+1),'base64');
 }
 /**
  * A picture made safe to keep: decoded in Chromium and drawn again as WebP, so only its pixels survive (no EXIF,
  * so no camera or GPS location, and nothing else hidden in the file). Orientation is applied first; the longest
  * side is at most maxSide. Returns {bytes, width, height}. Used by apply.mjs for label pictures (stage 2).
  */
 async reencodeWebp(bytes,{maxSide=2048,quality=.92}={}){
  await this.start();
  const [data,width,height]=await this.page.evaluate(async([b64,maxSide,quality])=>{
   const raw=atob(b64),input=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)input[i]=raw.charCodeAt(i);
   const bitmap=await createImageBitmap(new Blob([input]),{imageOrientation:'from-image'});
   const scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height)),canvas=new OffscreenCanvas(Math.max(1,Math.round(bitmap.width*scale)),Math.max(1,Math.round(bitmap.height*scale)));
   canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
   const out=new Uint8Array(await (await canvas.convertToBlob({type:'image/webp',quality})).arrayBuffer());
   let text='';for(let i=0;i<out.length;i+=0x8000)text+=String.fromCharCode(...out.subarray(i,i+0x8000));
   return [btoa(text),canvas.width,canvas.height];
  },[Buffer.from(bytes).toString('base64'),maxSide,quality]);
  const out=Buffer.from(data,'base64');
  if(out.subarray(0,4).toString()!=='RIFF'||out.subarray(8,12).toString()!=='WEBP')throw Error('Chromium did not make a WebP picture.');
  return {bytes:out,width,height};
 }
 async close(){
  this.closed=true;const started=this.starting;this.starting=null;
  if(!started)return;
  try{const self=await started;await self.browser?.close();await self.preview?.close();}catch{}
 }
}
