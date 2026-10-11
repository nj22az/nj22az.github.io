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
 async close(){
  this.closed=true;const started=this.starting;this.starting=null;
  if(!started)return;
  try{const self=await started;await self.browser?.close();await self.preview?.close();}catch{}
 }
}
