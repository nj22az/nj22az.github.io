// Renders photos through Pocket Camera's own engine in chosen Looks, one PNG per photo and Look, so a change to a Look
// can be judged on real photographs before it reaches the camera (before and after: run once into one folder, change
// the Look, run again into another, then lay the two side by side).
// Run from the repository root:
//   node tools/render-camera-looks.mjs --looks crayon,stamp --out <dir> [--lines 1080] [--light] photo.jpg ...
// Each picture is drawn at its own shape, `--lines` tall (the camera sizes every pattern to the picture's height, so
// 1080 lines stands for the viewfinder and a save alike). `--light` draws the phone's light builds instead of the full;
// `--focus 0.3` places Miniature's plane of focus as a tap would (a height from the foot).
// `--person` runs the local person model first, as the still-photo editor does. With --light this models the phone's
// editor, not its live viewfinder (live video does not use a mask). An unavailable model fails this test render.
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {basename,extname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {serveGame} from '../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');

const args=process.argv.slice(2),photos=[],opt={looks:'crayon,stamp',out:'camera-looks',lines:'1080',light:false,person:false,focus:'-1'};
for(let i=0;i<args.length;i++){const a=args[i];if(a==='--light'||a==='--person')opt[a.slice(2)]=true;else if(a.startsWith('--'))opt[a.slice(2)]=args[++i];else photos.push(a);}
if(!photos.length){console.error('Usage: node tools/render-camera-looks.mjs --looks crayon,stamp --out <dir> photo.jpg ...');process.exit(2);}
const looks=opt.looks.split(','),lines=Number(opt.lines),focus=Number(opt.focus),out=resolve(opt.out);
await mkdir(out,{recursive:true});

const repo=fileURLToPath(new URL('../',import.meta.url));
const server=await serveGame({root:repo,mounts:['camera','johansson-town']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage();
 page.on('pageerror',e=>{throw e;});
 page.on('console',m=>{if(m.type()==='error')console.error(m.text());});
 await page.goto(`${server.url}camera/looks-gl.js`);
 for(const file of photos){
  const photo=`data:image/jpeg;base64,${(await readFile(file)).toString('base64')}`;
  const shots=await page.evaluate(async({photo,looks,lines,light,focus,person})=>{
   const {createLookEngine,normalRecipe}=await import('/camera/looks-gl.js');
   const img=new Image();img.src=photo;await img.decode();
   const iw=img.naturalWidth,ih=img.naturalHeight,H=lines,W=Math.round(lines*iw/ih);
   const gl=document.createElement('canvas');gl.width=W;gl.height=H;
   const engine=createLookEngine(gl,{light});await engine.loadLuts();const revision=engine.setSource('photo',img,iw,ih);
   if(person){
    const {createPersonMasker}=await import('/camera/person-mask.js');
    const masker=createPersonMasker(),mask=await masker.mask(img);
    if(!masker.ready)throw new Error('Person model unavailable: do not judge this as a masked render');
    masker.close();
    engine.setPersonMask('photo',mask,revision);
   }
   const shots=[];
   for(const look of looks){
    const t0=performance.now();
    let px;
    if(light){
     // The light build as the viewfinder draws it: compile, then draw onto the canvas and read it back.
     engine.warm([look]);
     const recipe=normalRecipe({layers:[{look}],focus});
     for(let i=0;i<400&&!engine.draw(recipe,{source:'photo'});i++)await new Promise(r=>setTimeout(r,25));
     const c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').drawImage(gl,0,0);
     shots.push({look,url:c.toDataURL('image/png'),ms:performance.now()-t0});continue;
    }
    px=engine.render(normalRecipe({layers:[{look}],focus}),{source:'photo',width:W,height:H});
    const c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').putImageData(new ImageData(px.data,W,H),0,0);
    shots.push({look,url:c.toDataURL('image/png'),ms:performance.now()-t0});
   }
   return shots;
  },{photo,looks,lines,light:opt.light,focus,person:opt.person});
  const name=basename(file,extname(file));
  for(const s of shots){
   await writeFile(join(out,`${name}--${s.look}.png`),Buffer.from(s.url.split(',')[1],'base64'));
   console.log(`${name} ${s.look} ${Math.round(s.ms)} ms`);
  }
 }
}finally{await browser.close();await server.close();}
