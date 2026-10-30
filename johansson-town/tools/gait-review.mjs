// Reproducible owner review, inside the real source game (not a substitute avatar viewer).
// node tools/gait-review.mjs OUT [BASE_REF] [--stills]
// Needs TOWN_CHROMIUM_PATH; software Chromium is supported. The before module is read from git, never checked out.
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const town=resolve(dirname(fileURLToPath(import.meta.url)),'..'),site=resolve(town,'..');
const out=resolve(process.argv[2]||'output/gait-review'),base=process.argv[3]&&!process.argv[3].startsWith('--')?process.argv[3]:'37befc31';
await mkdir(out,{recursive:true});for(const variant of ['before','after'])await mkdir(resolve(out,variant),{recursive:true});
const before=execFileSync('git',['show',base+':johansson-town/src/avatars/animate.js'],{cwd:site,encoding:'utf8'});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary','.svg':'image/svg+xml'};
const sourcePage=html=>html.replace(/<link rel="modulepreload" data-town-runtime[^>]*>\n?/g,'')
 .replace(/import\(['"]\.\/runtime\/boot-[^'"]+['"]\)/g,"import('./src/boot.js')")
 .replace(/from ['"]\.\/runtime\/audio-[^'"]+['"]/g,"from './src/audio/town-audio.js?snappy=1'")
 .replace(/window\.JOHANSSON_FEED_MODULE="[^"]+"/,'window.JOHANSSON_FEED_MODULE="./src/feed/mount.js"')
 .replace(/window\.JOHANSSON_PORTRAIT_MODULE="[^"]+"/,'window.JOHANSSON_PORTRAIT_MODULE="./src/avatars/guide-portraits.js"');
const server=createServer(async(req,res)=>{try{
 const path=decodeURIComponent(new URL(req.url,'http://x').pathname),file=resolve(site,'.'+(path.endsWith('/')?path+'index.html':path));
 if(!file.startsWith(site+'/'))throw Error('outside');
 let body=path==='/johansson-town/src/avatars/animate-before.js'?before:await readFile(file);
 if(file===resolve(town,'index.html'))body=sourcePage(body.toString());
 res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(body);
 }catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH||'/opt/pw-browsers/chromium',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const report={base,source:true,physicalDevice:false,renderer:'software Chromium',fps:24,seconds:6.5,names:['Thuan','Harbour master','Vy','Grandmother Higa'],errors:[],views:[]};
try{
 const context=await browser.newContext({viewport:{width:960,height:540},serviceWorkers:'block'});
 await context.addInitScript(()=>{localStorage.setItem('johansson-town-clock',JSON.stringify({start:'12:20',speed:1}));localStorage.setItem('johansson-town-view','third');Element.prototype.requestFullscreen=async()=>{};});
 const page=await context.newPage();page.setDefaultTimeout(600000);page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/johansson-town/?audit&visual-audit`);
 await page.locator('#enter:not([disabled])').waitFor();console.log('Island ready');await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_AUDIT__&&!window.__JOHANSSON_AUDIT__.blocked.catchingUp);
 await page.addStyleTag({content:'body>*:not(#game){visibility:hidden!important}#game{visibility:visible!important}'});
 report.bodies=await page.evaluate(async(names)=>{
  const T=await import('/johansson-town/vendor/three.module.js'),{buildAvatar}=await import('/johansson-town/src/avatars/build.js'),{recipeFor}=await import('/johansson-town/src/avatars/cast.js');
  const {createAvatarAnimator:after}=await import('/johansson-town/src/avatars/animate.js'),{createAvatarAnimator:before}=await import('/johansson-town/src/avatars/animate-before.js');
  const audit=window.__JOHANSSON_AUDIT__;audit.renderFrozen=false;audit.teleport(-2.75,14,0);audit.setTime(10002*1440+12*60);
  const ground=audit.player.position[1];
  const player=window.__JOHANSSON_MODEL__;player.root.visible=false;let scene=player.root;while(scene.parent)scene=scene.parent;
  const variants={};for(const [key,create] of Object.entries({before,after})){
   const group=new T.Group();scene.add(group);const cast=names.map((name,i)=>{
    const avatar=buildAvatar(recipeFor(name),{shadows:true}),holder=new T.Group();holder.add(avatar.root);holder.position.set(-4.4+i*1.1,ground,14);group.add(holder);
    return {avatar,holder,anim:create(avatar,{random:()=>.5,initialTime:0})};});variants[key]={group,cast};
  }
  let time=0,travel=0;
  window.__GAIT_REVIEW__={
   at(target){
    while(time<target-1e-9){const dt=Math.min(1/60,target-time),speed=time<.5?0:time<3?1.3:time<5.5?3.5:0;travel+=speed*dt;
     for(const v of Object.values(variants))for(const actor of v.cast){actor.holder.position.z=14-travel;actor.anim.update(dt,{speed,expression:'neutral'});actor.avatar.springs?.update(dt);}
     time+=dt;
    }
    return {time,travel,z:14-travel,speed:time<.5?0:time<3?1.3:time<5.5?3.5:0};
   },
   show(variant,view='pedestrian'){
    for(const [key,v] of Object.entries(variants))v.group.visible=key===variant;
    const z=14-travel;const cameras={pedestrian:{pos:[-6,1.4,z-4.5],at:[-2.75,.6,z]},overhead:{pos:[-2.75,7,z-3],at:[-2.75,.3,z]},phone:{pos:[-2.75,1.2,z-7.5],at:[-2.75,.6,z]}};
    audit.camera=cameras[view];audit.render();
   }
  };
  return variants.after.cast.map((a,i)=>({name:names[i],body:a.avatar.pixar?'Pixar':'cartoon'}));
 },report.names);
 const take=async(variant,view,path)=>{await page.evaluate(({variant,view})=>window.__GAIT_REVIEW__.show(variant,view),{variant,view});await page.locator('#game').screenshot({path});};
 const stills=process.argv.includes('--stills');
 const views=async()=>{
  for(const view of ['pedestrian','overhead']){await take('after',view,resolve(out,view+'.png'));report.views.push({view,width:960,height:540});}
  await page.setViewportSize({width:390,height:844});await page.evaluate(async()=>{await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});await take('after','phone',resolve(out,'phone.png'));report.views.push({view:'phone',width:390,height:844});
  await page.setViewportSize({width:960,height:540});await page.evaluate(async()=>{await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});
 };
 if(!stills){
  for(let frame=0;frame<report.seconds*report.fps;frame++){
   await page.evaluate(t=>window.__GAIT_REVIEW__.at(t),frame/report.fps);
   for(const variant of ['before','after'])await take(variant,'pedestrian',resolve(out,variant,String(frame).padStart(4,'0')+'.png'));
   if(frame===53)await views();
   if(frame%24===0)console.log('Captured second '+frame/24);
  }
 }else {await page.evaluate(()=>window.__GAIT_REVIEW__.at(4.25));await views();}
}finally{await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();server.close();}
if(report.errors.length)throw Error(report.errors.join('\n'));
console.log('Review complete');
