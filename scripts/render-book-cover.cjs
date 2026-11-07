// Render the editable 7:10 SVG cover at 2100 × 3000 pixels (7 × 10 inches at 300 dpi).
const path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1400,height:2000},deviceScaleFactor:1.5});
  await page.goto((process.env.WORLD_PREVIEW||'http://127.0.0.1:5191')+'/elteknik/art/cover.svg');
  await page.locator('svg').screenshot({path:path.resolve(__dirname,'../elteknik/files/omslag.jpg'),type:'jpeg',quality:92});
  console.log('Cover exported: 2100 × 3000');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
