/** Regenerate portraits using the same buildAvatar(recipeFor(name)) as the game.
 * Requires Playwright and Chromium as authoring tools, never visitor dependencies.
 * node tools/render-resident-guide.mjs
 */
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const root=resolve(new URL('..',import.meta.url).pathname),require=createRequire(import.meta.url);
let playwright;
try { playwright=require('playwright'); }
catch(error) { if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw error; playwright=require(resolve(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright')); }
const catalogue=JSON.parse(await readFile(resolve(root,'guide/residents.json'),'utf8'));
const server=createServer(async(req,res)=>{
 try {
  const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!path.startsWith(root+'/')){res.writeHead(403).end();return;}
  const data=await readFile(path);
  res.setHeader('Content-Type',({'.js':'text/javascript','.json':'application/json','.html':'text/html'})[extname(path)]||'application/octet-stream');res.end(data);
 }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try {
 browser=await playwright.chromium.launch({channel:'chromium',executablePath:process.env.TOWN_CHROMIUM_PATH || undefined,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:480,height:480}});
 await page.goto('http://127.0.0.1:'+server.address().port+'/guide/residents.json');
 const portraits=await page.evaluate(async catalogue=>{
  const THREE=await import('/vendor/three.module.js');
  const {buildAvatar}=await import('/src/avatars/build.js');
  const {recipeFor}=await import('/src/avatars/cast.js');
  const canvas=document.createElement('canvas');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
  renderer.setSize(480,480);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor('#e9eff2',1);
  const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x71828a,2));
  const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,5,-4);scene.add(key);
  const result=[];
  for(const resident of catalogue){
   const avatar=buildAvatar(recipeFor(resident.name),{shadows:false,faceSize:512});
   scene.add(avatar.root);const h=avatar.height;
   const frame=h*1.12,camera=new THREE.OrthographicCamera(-frame/2,frame/2,frame/2,-frame/2,.1,20);
   camera.position.set(.3,h*.58,-4);camera.lookAt(0,h*.51,0);
   scene.updateMatrixWorld(true);avatar.body.skeleton.update();renderer.render(scene,camera);
   result.push({path:resident.portrait,data:canvas.toDataURL('image/webp',.9).split(',')[1]});
   scene.remove(avatar.root);avatar.dispose();renderer.renderLists.dispose();
  }
  renderer.dispose();renderer.forceContextLoss();return result;
 },catalogue);
 for(const portrait of portraits){await mkdir(resolve(root,portrait.path,'..'),{recursive:true});await writeFile(resolve(root,portrait.path),Buffer.from(portrait.data,'base64'));}
 await writeFile(resolve(root,'resident-guide.js'),'// Generated from guide/residents.json by tools/render-resident-guide.mjs.\nwindow.JOHANSSON_RESIDENT_GUIDE = '+JSON.stringify(catalogue)+';\n');
 const sourceFiles=['guide/residents.json','src/avatars/build.js','src/avatars/cast.js','src/avatars/recipe.js','src/avatars/face.js','src/avatars/head-profile.js','src/people/resident-personalities.js','src/render/cel.js'];
 const hash=createHash('sha256');for(const path of sourceFiles)hash.update(path+'\0').update(await readFile(resolve(root,path))).update('\0');
 await writeFile(resolve(root,'guide/portraits.json'),JSON.stringify({sourceFiles,sha256:hash.digest('hex'),count:portraits.length},null,2)+'\n');
 console.log('Rendered',portraits.length,'resident portraits from the live avatar pipeline.');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
