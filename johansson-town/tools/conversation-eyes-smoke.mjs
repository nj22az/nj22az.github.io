// Actual-game regression for Johansson's frozen conversation face. Run alone (software Chromium).
//   node tools/conversation-eyes-smoke.mjs [--source] [--baseline[=<commit>]] [--only=phone|desktop] [--site=/other/checkout] [out-dir]
// A baseline may fail the assertions; its screenshots and sampled report are still retained.
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const here=resolve(dirname(fileURLToPath(import.meta.url)),'..'),args=process.argv.slice(2);
const source=args.includes('--source'),site=resolve(args.find(a=>a.startsWith('--site='))?.slice(7)||resolve(here,'..'));
const root=resolve(site,'johansson-town'),out=resolve(args.find(a=>!a.startsWith('--'))||resolve(here,'output/conversation-eyes'));
const run=promisify(execFile),baselineFlag=args.find(a=>a==='--baseline'||a.startsWith('--baseline='));
const baseline=baselineFlag?(baselineFlag.includes('=')?baselineFlag.slice(11):(await run('git',['rev-parse','HEAD'],{cwd:site})).stdout.trim()):null;
const only=args.find(a=>a.startsWith('--only='))?.slice(7),oldFiles=new Map();
if(only&&!['phone','desktop'].includes(only))throw Error('--only must be phone or desktop');
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary','.svg':'image/svg+xml','.hdr':'application/octet-stream','.wasm':'application/wasm'};
const sourcePage=html=>html.replace(/<link rel="modulepreload" data-town-runtime[^>]*>\n?/g,'')
 .replace(/import\(['"]\.\/runtime\/boot-[^'"]+['"]\)/g,"import('./src/boot.js')")
 .replace(/from ['"]\.\/runtime\/audio-[^'"]+['"]/g,"from './src/audio/town-audio.js?snappy=1'")
 .replace(/window\.JOHANSSON_FEED_MODULE="[^"]+"/,'window.JOHANSSON_FEED_MODULE="./src/feed/mount.js"')
 .replace(/window\.JOHANSSON_PORTRAIT_MODULE="[^"]+"/,'window.JOHANSSON_PORTRAIT_MODULE="./src/avatars/guide-portraits.js"');
const server=createServer(async(req,res)=>{try{
 const path=decodeURIComponent(new URL(req.url,'http://x').pathname),file=resolve(site,'.'+(path.endsWith('/')?path+'index.html':path));
 if(file!==site&&!file.startsWith(site+sep))throw Error('Outside site');
 const relative=file.slice(site.length+1).split(sep).join('/');
 const old=baseline&&(relative==='johansson-town/index.html'||source&&['johansson-town/src/game.js','johansson-town/src/avatars/actors.js'].includes(relative));
 if(old&&!oldFiles.has(relative))oldFiles.set(relative,(await run('git',['show',baseline+':'+relative],{cwd:site,maxBuffer:10*1024*1024})).stdout);
 let body=old?oldFiles.get(relative):await readFile(file);if(source&&file===resolve(root,'index.html'))body=sourcePage(body.toString());
 res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(body);
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const report={site,source,baseline,softwareChromium:true,physicalDevice:false,views:[],errors:[],failures:[]};
let browser;
try{
 browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH||'/opt/pw-browsers/chromium',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
 await context.addInitScript(()=>{
  localStorage.setItem('johansson-town-clock',JSON.stringify({start:'10:40',speed:1}));
  localStorage.setItem('johansson-town-view','third');Element.prototype.requestFullscreen=async()=>{};
 });
 const page=await context.newPage();page.setDefaultTimeout(600000);
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/johansson-town/?audit&visual-audit`);
 await page.locator('#enter:not([disabled])').waitFor();console.log('Island ready');
 await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__JOHANSSON_RUNNING__&&window.__JOHANSSON_AUDIT__&&!window.__JOHANSSON_AUDIT__.blocked.catchingUp);
 await page.evaluate(async()=>{
  const a=window.__JOHANSSON_AUDIT__;a.renderFrozen=false;a.setTime(294*1440+640);await a.enter('market');
 });
 await page.waitForFunction(()=>!window.__JOHANSSON_AUDIT__.blocked.roomLoading);
 await page.evaluate(()=>{
  const a=window.__JOHANSSON_AUDIT__;a.activities.close();a.step(200);
  const actor=a.world.people.find(p=>p.profile.name==='Thuan')?.g;
  if(!actor?.visible)throw Error('Thuan must be visibly working in the actual Sakura interior');
  window.__conversationEyesChoosePlace=()=>{
   a.activities.close();a.camera=null;
   const p=actor.getWorldPosition(actor.position.clone()),attempts=[],render=a.render;
   // Thuan works behind Sakura's east counter. Start on its customer side, with room
   // behind Johansson for the real third-person boom; a walkable staff gap may hide him.
   const angles=[-Math.PI/4,-Math.PI/2,-3*Math.PI/8,-Math.PI/8,-5*Math.PI/8,-3*Math.PI/4];
   try{
    a.render=()=>true;
    for(const radius of [2.2,2.6,3,1.8])for(const angle of angles){
     const x=p.x+Math.sin(angle)*radius,z=p.z+Math.cos(angle)*radius,n=a.navigation(x,z);
     if(n.staticBlocked||n.residentBlocked)continue;
     const place={x,y:n.y,z,yaw:Math.atan2(x-p.x,z-p.z)};a.stand(x,n.y,z,place.yaw);a.step(600);
     const visible=a.johansson.root.visible,lensDistance=a.lens.distance;
     attempts.push({...place,visible,lensDistance});
     if(visible&&lensDistance>=.8)return {...place,lensDistance,attempts};
    }
    throw Error('No visible customer-side conversation place: '+JSON.stringify(attempts));
   }finally{a.render=render;a.render();}
  };
  window.__conversationEyesSample=()=>{
   const j=a.johansson,f=j.avatar.faceState;
   return {expression:j.expression,move:j.move,blink:f.blink,talk:f.talk,faceExpression:f.expression,position:a.player.position,
    rootPosition:j.root.position.toArray(),visible:j.root.visible,lensDistance:a.lens.distance,head:j.avatar.bones.head.rotation.toArray().slice(0,3),
    legs:['thighL','thighR','kneeL','kneeR'].map(k=>j.avatar.bones[k].rotation.toArray().slice(0,3)),paused:a.paused,conversation:a.conversation.name};
  };
  window.__conversationEyesCamera=()=>{
   const j=a.johansson,p=j.root.position,front=p.clone().set(0,0,-1).applyQuaternion(j.root.quaternion),right=p.clone().set(1,0,0).applyQuaternion(j.root.quaternion);
   if(!j.root.visible||a.lens.distance<.5)throw Error('Johansson is hidden by the ordinary camera; a portrait cannot pass');
   const eye=p.y+j.lens.head,at=p.clone().set(p.x,eye-.12,p.z);let selected=null;
   for(const distance of [1.65,1.35,1.1])for(const offset of [.3,-.3,0]){
    const pos=p.clone().addScaledVector(front,distance).addScaledVector(right,offset);pos.y=eye+.04;
    let clear=true;for(let t=.25;t<=1;t+=.05){const q=at.clone().lerp(pos,t);if(a.probe(q.x,q.y,q.z,.12).blocked){clear=false;break;}}
    if(clear&&!selected)selected={pos:pos.toArray(),at:at.toArray()};
   }
   if(!selected)throw Error('No clear front portrait camera at the actual conversation place');
   a.camera=selected;a.render();return a.camera;
  };
  window.__conversationEyesCollect=count=>{
   const render=a.render,rows=[];
   // Advance the real game for every sample; avoid redrawing an unseen full island 160 times.
   // Restore the normal renderer even on a failed sample, then draw the actual final state once.
   try{a.render=()=>true;for(let i=1;i<=count;i++){a.step(50);rows.push({seconds:i*.05,...window.__conversationEyesSample()});}}
   finally{a.render=render;a.render();}
   return rows;
  };
 });
 for(const [label,width,height] of [['phone',390,844],['desktop',1280,800]].filter(([label])=>!only||label===only)){
  await page.setViewportSize({width,height});
  const view={label,viewport:[width,height],samples:[],speech:[],checks:{}};report.views.push(view);
  view.placement=await page.evaluate(()=>window.__conversationEyesChoosePlace());
  // A real movement frame before the interaction catches stale walking speeds.
  await page.keyboard.down('KeyW');await page.evaluate(()=>window.__JOHANSSON_AUDIT__.step(100));await page.keyboard.up('KeyW');
  view.initial=await page.evaluate(()=>{
   const a=window.__JOHANSSON_AUDIT__;a.activities.action('resident','Thuan');a.step(100);
   if(a.conversation.name!=='Thuan'||!a.conversation.speaker)throw Error('Actual Thuan conversation failed to open');
   return window.__conversationEyesSample();
  });
  view.camera=await page.evaluate(()=>window.__conversationEyesCamera());
  await page.screenshot({path:resolve(out,label+'-greeting.jpg'),type:'jpeg',quality:85});
  view.samples=await page.evaluate(()=>window.__conversationEyesCollect(160));
  await page.evaluate(()=>window.__conversationEyesCamera());
  await page.screenshot({path:resolve(out,label+'-listening.jpg'),type:'jpeg',quality:85});
  // choose() is the same dialogue path as clicking a reply, including onDialoguePhase.
  view.speech=await page.evaluate(()=>{
   const a=window.__JOHANSSON_AUDIT__,dialogue=a.activities.dialogue;dialogue.skip();
   const buttons=[...document.querySelectorAll('#activityActions button')];
   const index=buttons.findIndex(b=>!b.disabled&&!/^(Close|Back|Go on|Look at|Read |Sell |Return)/.test(b.textContent.trim()));
   if(index<0)throw Error('No spoken reply in the real conversation');
   dialogue.choose(index);return window.__conversationEyesCollect(44);
  });
  view.inventory=await page.evaluate(()=>{
   const a=window.__JOHANSSON_AUDIT__;a.activities.close();a.activities.inventory();a.step(0);
   const before=window.__conversationEyesSample();a.step(2000);const after=window.__conversationEyesSample();a.activities.close();
   return {before,after};
  });
  const start=view.initial.position,distance=p=>Math.hypot(...p.map((v,i)=>v-start[i]));
  const closedAt=view.samples.findIndex(s=>s.blink>.5);
  view.checks={greetingEyesOpen:view.initial.faceExpression==='smile'&&[view.initial,...view.samples.filter(s=>s.seconds<=1)].some(s=>s.blink<=.5),
   greetingExpires:view.samples.at(-1).expression==='neutral'&&view.samples.at(-1).move===null,
   blinkClosesAndReopens:closedAt>=0&&view.samples.slice(closedAt+1).some(s=>s.blink<=.5),
   speechMoves:new Set(view.speech.map(s=>s.talk>.5)).size===2,
   playerStationary:[...view.samples,...view.speech].every(s=>distance(s.position)<1e-6),
   actorVisible:[view.initial,...view.samples].every(s=>s.visible&&s.lensDistance>=.5),
   noWalkingInPlace:view.samples.filter(s=>s.seconds>3).every(s=>Math.abs(s.legs[0][0]-s.legs[1][0])<.15),
   conversationRemainsPaused:view.samples.every(s=>s.paused&&s.conversation==='Thuan'),
   ordinaryInventoryFrozen:JSON.stringify(view.inventory.before)===JSON.stringify(view.inventory.after)};
  for(const [check,ok] of Object.entries(view.checks))if(!ok)report.failures.push(label+': '+check);
  console.log(label,JSON.stringify(view.checks));
 }
}catch(error){report.errors.push(error.stack||error.message);console.error(error.message);}
finally{await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser?.close();await new Promise(r=>server.close(r));}
console.log(JSON.stringify({out,failures:report.failures,errors:report.errors}));
if(report.failures.length||report.errors.length)process.exitCode=1;
