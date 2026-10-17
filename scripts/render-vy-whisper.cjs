// Run with Playwright installed and the site served at WORLD_PREVIEW (default localhost:5191).
// Renders the real Vy recipe with Johansson Studio's existing Shh! pose; no generated artwork.
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
(async () => {
  const browser = await chromium.launch({headless:true,channel:'chrome'});
  try {
    const page = await browser.newPage();
    await page.goto((process.env.WORLD_PREVIEW || 'http://127.0.0.1:5191')+'/avatar-creator/?agent');
    await page.waitForFunction(() => window.__JOHANSSON_STUDIO__?.ready);
    const png = await page.evaluate(async () => {
      const {recipeFor} = await import('/johansson-town/src/avatars/cast.js');
      const data = window.__JOHANSSON_STUDIO__.renderPortrait(recipeFor('Vy'), {pose:'Shush',expression:'wink',view:'front',size:1024,background:'transparent'});
      const img = new Image();img.src=data;await img.decode();
      const source=document.createElement('canvas');source.width=source.height=1024;
      const ctx=source.getContext('2d');ctx.drawImage(img,0,0);
      const pixels=ctx.getImageData(0,0,1024,1024).data;
      let minX=1024,minY=1024,maxX=0,maxY=0;
      for(let y=0;y<1024;y++)for(let x=0;x<1024;x++)if(pixels[(y*1024+x)*4+3]>8){minX=Math.min(x,minX);maxX=Math.max(x,maxX);minY=Math.min(y,minY);maxY=Math.max(y,maxY);}
      const out=document.createElement('canvas');out.width=264;out.height=400;
      const w=maxX-minX+1,h=maxY-minY+1,scale=Math.min(244/w,380/h);
      out.getContext('2d').drawImage(source,minX,minY,w,h,(264-w*scale)/2,(400-h*scale)/2,w*scale,h*scale);
      return out.toDataURL('image/png').split(',')[1];
    });
    const output=path.resolve(__dirname,'../assets/linux-port/vy-whisper.png');
    fs.writeFileSync(output,Buffer.from(png,'base64'));
    console.log('Studio export:',output);
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
