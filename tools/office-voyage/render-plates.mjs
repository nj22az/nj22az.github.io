// The homepage voyage's pictures: the Chisum photographed in her own viewer (/ferry/, with her own model, light, sky and
// sea), from the places below, at 1920×1080. Run from the repository root with the site served:
//   python3 -m http.server 8000 &
//   node tools/office-voyage/render-plates.mjs [--only bridge,wing] <out-dir>
//   python3 tools/office-voyage/build.py <out-dir>      (WebP at 1920 and 960 into assets/office-voyage/)
// The viewer's hooks (window.__ferry) are handed to a browser a program drives; reduced motion keeps her sea still, and
// each picture is read off her canvas in the task that drew it. In software rendering a picture takes about a minute.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
// [name, eye, look-at, vertical field of view]. Her z runs from the stern (−62.4) to the bow; y is up from the waterline.
export const PLATES=[
 ['hero',[-30,2,84],[-30,10,44],48],         // her bow coming on, low over the water, open sea to her left for the words
 ['explore',[-55,6,60],[-12,11,10],34],       // her port side: JOHANSSON LINE, the house, the lifeboat
 ['create',[-38,24,-100],[0,8,-45],40],       // from astern and above: the stern ramp, the helicopter deck, the funnels
 ['learn',[-30,21,14],[0,17,24],42],          // over the house: the lifeboat in its davits, the decks, the mast
 ['bulb',[-13,-5,84],[0,-2.6,64],52],         // under the bow: her bulb
 ['screws',[-12,-5,-72],[0,-3,-62],50],       // under the stern: her two screws and rudders
 ['bridge',[0,17.6,38.0],[0,17.0,70],62],     // in the wheelhouse, looking ahead over the wheel
];
const args=process.argv.slice(2),only=args.includes('--only')?args[args.indexOf('--only')+1].split(','):null;
const out=resolve(args.filter((a,i)=>!a.startsWith('--')&&args[i-1]!=='--only')[0]||'output/office-voyage');
await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
 page.on('pageerror',e=>{throw e;});
 await page.goto(process.env.CHISUM_URL||'http://localhost:8000/ferry/?hooks');
 await page.waitForFunction(()=>window.__ferry&&document.body.classList.contains('ready'),null,{timeout:600000});
 for(const [name,eye,at,fov] of PLATES){
  if(only&&!only.includes(name))continue;
  const data=await page.evaluate(([eye,at,fov])=>{const L=window.__ferry.look,c=L.camera;c.fov=fov;c.updateProjectionMatrix();
   c.position.set(...eye);L.controls.target.set(...at);c.lookAt(...at);L.controls.update?.();
   // Indoors the eye opens to the room's light, as it does on foot.
   for(let i=0;i<40;i++)L.drawing.expose?.(.25,c.position);
   L.draw();return L.renderer.domElement.toDataURL('image/png');},[eye,at,fov]);
  await writeFile(resolve(out,name+'.png'),Buffer.from(data.split(',')[1],'base64'));
  console.log('photographed',name);
 }
}finally{await browser.close();}
