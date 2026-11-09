// Johansson World's brand on Pocket Camera (the owner, 9 November 2026: "I would like the branding from Johansson World
// to be more clear and sophisticated"): the page, the manifest and the browser's theme colour name the World and take
// the bars' ink; the title card carries the World's wordmark and the camera's Japanese name, and nothing else on that
// screen repeats them; the running camera's bar carries the lockup; the settings foot says whose camera it is, its
// version and the way to the World; the Game Room's kicker is the same eyebrow on one line; every brand word keeps
// 4.5:1 in both themes; the Film frame's edge print and the share card carry the World's name; no page errors.
//   node camera/tests/brand.browser.mjs
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const root=fileURLToPath(new URL('../../',import.meta.url));
const server=await serveGame({root,mounts:['camera','johansson-town','assets']});
// Two browsers: one with no camera, so the title card shows; one with a fake camera granted, so the camera runs.
const gl=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'];
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:gl});
const camBrowser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:[...gl,'--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
let checks=0;const check=async(name,fn)=>{await fn();checks++;console.log(`ok  ${name}`);};
const INK='rgb(20, 45, 55)';
// WCAG contrast of an element's text against the first painted background behind it (as theme.browser.mjs measures).
const contrast=(page,selector)=>page.evaluate(sel=>{
 const el=document.querySelector(sel);if(!el)return null;
 const rgb=s=>{const m=s.match(/[\d.]+/g).map(Number);return {r:m[0],g:m[1],b:m[2],a:m.length>3?m[3]:1};};
 const lum=({r,g,b})=>{const f=c=>{c/=255;return c<=.03928?c/12.92:((c+.055)/1.055)**2.4;};return .2126*f(r)+.7152*f(g)+.0722*f(b);};
 let bg=null;for(let e=el;e;e=e.parentElement){const c=rgb(getComputedStyle(e).backgroundColor);if(c.a>0){if(!bg)bg=c;else{bg={r:bg.r*bg.a+c.r*(1-bg.a),g:bg.g*bg.a+c.g*(1-bg.a),b:bg.b*bg.a+c.b*(1-bg.a),a:1};}if(bg.a>=1)break;}}
 const fg=rgb(getComputedStyle(el).color),L1=lum(fg),L2=lum(bg||{r:255,g:255,b:255});
 return +((Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05)).toFixed(2);
},selector);
const errors=[];const watch=page=>{page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});};
// Under reduced motion every change is a 1 ms transition, and headless Chromium leaves those pending: finish them, so the
// computed colours are the theme's own.
const bothThemes=async(page,fn)=>{for(const scheme of ['dark','light']){await page.emulateMedia({colorScheme:scheme});await page.waitForFunction(s=>document.documentElement.dataset.theme===s,scheme);await page.evaluate(()=>document.getAnimations().forEach(a=>{try{a.finish();}catch{}}));await fn(scheme);}};
try{
 // The title card, with no camera granted.
 const idle=await browser.newContext({viewport:{width:390,height:844},colorScheme:'dark',reducedMotion:'reduce'});
 const page=await idle.newPage();watch(page);
 await page.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false})));
 await page.goto(server.url+'camera/');await page.waitForFunction(()=>!!window.pocketCamera?.engine);
 await page.waitForFunction(()=>!document.getElementById('welcome').hidden);

 await check('the page, the manifest and the browser’s theme colour name the World and take the bars’ ink',async()=>{
  const out=await page.evaluate(async()=>{
   const link=document.querySelector('link[rel="manifest"]').href,manifest=await (await fetch(link)).json();
   return {title:document.title,og:document.querySelector('meta[property="og:title"]').content,description:document.querySelector('meta[name="description"]').content,manifest:{name:manifest.name,short:manifest.short_name,theme:manifest.theme_color},appTitle:document.querySelector('meta[name="apple-mobile-web-app-title"]').content};
  });
  assert.equal(out.title,'Pocket Camera · Johansson World');assert.equal(out.og,'Pocket Camera · Johansson World');
  assert.match(out.description,/Minato Machi, Johansson World/);
  assert.deepEqual(out.manifest,{name:'Pocket Camera · Johansson World',short:'Pocket Camera',theme:'#142d37'});
  assert.equal(out.appTitle,'Pocket Camera','the Home Screen keeps the short name');
  await bothThemes(page,async scheme=>{
   const {meta,bar}=await page.evaluate(()=>({meta:document.querySelector('meta[name="theme-color"]').content,bar:getComputedStyle(document.querySelector('.camera-bar')).backgroundColor}));
   const hex=c=>'#'+c.match(/\d+/g).slice(0,3).map(n=>(+n).toString(16).padStart(2,'0')).join('');
   assert.equal(hex(bar),meta,`${scheme}: the status bar is the bar’s own colour`);
   if(scheme==='dark')assert.equal(bar,INK,'dark bars are the World’s ink');
  });
 });

 await check('the title card: the World’s wordmark and the camera’s Japanese name once, then the camera’s own words; the bar’s lockup waits',async()=>{
  const out=await page.evaluate(()=>{
   const mark=document.querySelector('#welcome .world-mark'),jp=document.querySelector('#welcome .world-mark-jp'),copy=document.querySelector('#welcome .welcome-copy');
   const letters=[...mark.querySelectorAll('.world-mark-main span')].map(s=>s.textContent).join('')+' '+[...mark.querySelectorAll('.world-mark-town span')].map(s=>s.textContent).join('');
   return {role:mark.getAttribute('role'),label:mark.getAttribute('aria-label'),letters,jp:jp.textContent,lang:jp.getAttribute('lang'),jpColour:getComputedStyle(jp).color,h2:copy.querySelector('h2').textContent,p:copy.querySelector('p').textContent,
    markVisible:document.querySelector('.camera-mark').getBoundingClientRect().width>0&&getComputedStyle(document.querySelector('.camera-mark')).visibility,
    marks:document.querySelectorAll('#welcome .world-mark').length,inView:mark.getBoundingClientRect().top>=0&&jp.getBoundingClientRect().bottom<=innerHeight};
  });
  assert.equal(out.role,'img');assert.equal(out.label,'Johansson World');assert.equal(out.letters,'JOHANSSON WORLD');
  assert.equal(out.jp,'ポケットカメラ');assert.equal(out.lang,'ja');assert.equal(out.jpColour,'rgb(215, 38, 61)','the pill’s red, not the welcome’s paragraph grey');
  assert.equal(out.h2,'Pocket Camera');assert.match(out.p,/^A little camera from Minato Machi\./);
  assert.equal(out.marks,1,'the toy wordmark appears once');assert.equal(out.markVisible,'hidden','the bar’s lockup is hidden while the title card carries the brand');
  assert.ok(out.inView,'the wordmark and the pill are on the first screen of a phone');
  await bothThemes(page,async scheme=>{
   const pill=await contrast(page,'#welcome .world-mark-jp');assert.ok(pill>=4.5,`${scheme}: the pill’s name reads (${pill})`);
   const copy=await contrast(page,'#welcome .welcome-copy p');assert.ok(copy>=4.5,`${scheme}: the tag line reads (${copy})`);
  });
 });
 await idle.close();

 // The running camera, the settings foot, the editor's Film frame, the Game Room and the share card, with the camera granted.
 const granted=await camBrowser.newContext({viewport:{width:390,height:844},colorScheme:'dark',reducedMotion:'reduce',permissions:['camera']});
 const cam=await granted.newPage();watch(cam);
 await cam.addInitScript(()=>localStorage.setItem('office-pocket-camera',JSON.stringify({recipe:{layers:[{look:'none',amount:1}]},printer:false,cameraAllowed:true})));
 await cam.goto(server.url+'camera/');await cam.waitForFunction(()=>!!window.pocketCamera?.engine);
 await cam.waitForFunction(()=>window.pocketCamera.state.camera.running,null,{timeout:30000});

 await check('the running camera’s bar carries the lockup, in the World’s type, readable in both themes',async()=>{
  const out=await cam.evaluate(()=>{const h=document.querySelector('h1.camera-mark');return {eyebrow:h.querySelector('.brand-eyebrow').textContent,name:h.querySelector('.brand-name').textContent,visible:getComputedStyle(h).visibility,font:getComputedStyle(h.querySelector('.brand-eyebrow')).fontFamily,caps:getComputedStyle(h.querySelector('.brand-eyebrow')).textTransform,height:h.getBoundingClientRect().height,bar:document.querySelector('.camera-bar').getBoundingClientRect().height};});
  assert.equal(out.eyebrow,'Johansson World');assert.equal(out.name,'Pocket Camera');assert.equal(out.visible,'visible');
  assert.match(out.font,/Avenir Next/);assert.equal(out.caps,'uppercase');
  assert.ok(out.height<=out.bar,'the two lines fit the bar');
  await bothThemes(cam,async scheme=>{
   const eyebrow=await contrast(cam,'h1.camera-mark .brand-eyebrow'),name=await contrast(cam,'h1.camera-mark .brand-name');
   assert.ok(eyebrow>=4.5,`${scheme}: the eyebrow reads (${eyebrow})`);assert.ok(name>=4.5,`${scheme}: the name reads (${name})`);
  });
 });

 await check('the settings foot: whose camera, its version, and a finger-sized way to the World',async()=>{
  await cam.evaluate(()=>document.getElementById('settingsToggle').click());await cam.waitForSelector('#settings:not([hidden])');
  const out=await cam.evaluate(()=>{const f=document.querySelector('.settings-footer');const a=f.querySelector('.settings-world');return {eyebrow:f.querySelector('.brand-eyebrow').textContent,version:f.querySelector('.camera-version').textContent,href:a.getAttribute('href'),text:a.textContent,height:a.getBoundingClientRect().height};});
  assert.equal(out.eyebrow,'Johansson World · Minato Machi');assert.match(out.version,/^v\d{4}\.\d\d\.\d\d\.\d+$/,'the version stays a bare version (the backup and the update toast read it)');
  assert.equal(out.href,'/johansson-town/');assert.match(out.text,/Visit the World/);assert.ok(out.height>=44,`a 44-point link (${out.height})`);
  await bothThemes(cam,async scheme=>{
   for(const sel of ['.settings-footer .brand-eyebrow','.settings-footer .settings-world','.settings-footer .camera-version']){const c=await contrast(cam,sel);assert.ok(c>=4.5,`${scheme}: ${sel} reads (${c})`);}
  });
  await cam.evaluate(()=>document.getElementById('settingsDone').click());
 });

 await check('the Film frame’s edge print carries the stock and the World’s name',async()=>{
  const texts=await cam.evaluate(async()=>{
   const m=await import('./frames.js?v=20261109brand1');const c=document.createElement('canvas');c.width=1200;c.height=900;const g=c.getContext('2d');
   const seen=[];const orig=g.fillText.bind(g);g.fillText=(t,...a)=>{seen.push(t);return orig(t,...a);};
   m.drawFrame(g,'film',1200,900);return seen;
  });
  assert.ok(texts.includes('MINATO 400')&&texts.includes('JOHANSSON WORLD'),JSON.stringify(texts));
  const print=await cam.evaluate(async()=>{const m=await import('./frames.js?v=20261109brand1');const c=document.createElement('canvas');c.width=1200;c.height=900;const g=c.getContext('2d');const seen=[];g.fillText=t=>seen.push(t);m.drawFrame(g,'print',1200,900);return seen;});
  assert.deepEqual(print,[],'the instant print stays plain');
 });

 await check('the Game Room’s kicker is the eyebrow, on one line, readable on its paper and in the dark; the bar names the town',async()=>{
  await cam.evaluate(()=>document.getElementById('roll').click());await cam.waitForSelector('#album:not([hidden])');
  await cam.evaluate(()=>document.getElementById('openGames').click());await cam.waitForSelector('#cardsHub:not([hidden])');
  const out=await cam.evaluate(()=>{const k=document.querySelector('.game-room-intro .cards-kicker');const r=k.getBoundingClientRect();return {text:k.textContent,lines:Math.round(r.height/parseFloat(getComputedStyle(k).lineHeight)),font:getComputedStyle(k).fontFamily,bar:document.querySelector('#cardsHub .bar h2').textContent,h1:document.querySelector('.game-room-intro h1').textContent};});
  assert.equal(out.text,'Johansson World');assert.equal(out.lines,1,'one line beside the greeter');assert.match(out.font,/Avenir Next/);
  assert.equal(out.bar,'Minato Machi');assert.equal(out.h1,'Game Room');
  await bothThemes(cam,async scheme=>{const c=await contrast(cam,'.game-room-intro .cards-kicker');assert.ok(c>=4.5,`${scheme}: the kicker reads (${c})`);});
 });

 await check('the share card is the World’s: ink header with the lockup, the camera’s name at the foot, the text signed by both',async()=>{
  const out=await cam.evaluate(async()=>{
   const m=await import('./social-share.js?v=20261109brand1');
   let canvas=null;const orig=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(...a){canvas=this;return orig.apply(this,a);};
   const el=m.createResultShare({game:'Ball',headline:'520 points!',detail:'52 catches'});document.body.append(el);
   await new Promise(r=>{const t=setInterval(()=>{if(!el.querySelectorAll('button')[1].disabled){clearInterval(t);r();}},20);});
   HTMLCanvasElement.prototype.toBlob=orig;
   const g=canvas.getContext('2d'),px=(x,y)=>[...g.getImageData(x,y,1,1).data].slice(0,3).join(',');
   el.remove();
   return {size:[canvas.width,canvas.height],header:px(100,100),paper:px(10,10),cream:px(540,1000),text:m.resultText({game:'Ball',headline:'520 points!',detail:'52 catches'})};
  });
  assert.deepEqual(out.size,[1080,1080]);assert.equal(out.header,'20,45,55','the header band is the World’s ink');assert.equal(out.paper,'236,227,201','the card sits on the World’s paper');
  assert.equal(out.text,'Ball · 520 points! · 52 catches — Pocket Camera · Johansson World');
 });

 await check('the Home Screen icons were redrawn on the World’s ink with the gold ring',async()=>{
  const px=await cam.evaluate(async()=>{
   const img=new Image();img.src='icons/icon-512.png';await img.decode();const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.drawImage(img,0,0);
   const at=(x,y)=>[...g.getImageData(x,y,1,1).data].slice(0,3);return {corner:at(8,500),ring:at(256,362)};
  });
  // The ground deepens from the World's ink to the camera's night; the lens ring is the World's gold, a little lit.
  assert.ok(px.corner[2]>px.corner[0]&&px.corner[1]>px.corner[0]&&px.corner[0]<40,`an ink ground (${px.corner})`);
  assert.ok(px.ring[0]>200&&px.ring[1]>160&&px.ring[1]<200&&px.ring[2]<130,`a gold ring (${px.ring})`);
 });
 await granted.close();
 assert.deepEqual(errors,[]);
 console.log(`${checks}/${checks} brand browser checks passed`);
}finally{await browser.close();await camBrowser.close();await server.close();}
