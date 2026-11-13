// Johansson World's brand on Pocket Camera (the owner, 9 November 2026: "I would like the branding from Johansson World
// to be more clear and sophisticated", then, of a first cut drawn from stylesheets the World no longer shows, "the
// landing page … doesn't look quite right"). The World's own look is read from its drawn title: JOHANSSON in its ink
// (#263d39) over WORLD in its green (#16815e), LINE Seed JP ExtraBold, on its cream (#f5f5ec).
// Held here: the page and the manifest name the World and the browser's theme colour is the bar's own; the title card
// carries the World's wordmark as outlines in those colours on that cream, once, with the camera's Japanese name as a
// stamp, the greeter clear of both whichever resident greets, the whole card on a phone's first screen, the bar quiet
// above it; the running camera's bar carries the lockup in the World's typeface (loaded, not a fallback); the settings
// foot says whose camera it is, its version and the way to the World; the Game Room's kicker is the same eyebrow on
// one line; every brand word keeps 4.5:1 in both themes; the Film frame's edge print and the share card carry the
// World's name and colours; the title screen has two doors, the album and the Game Room, and the room's Back leaves
// by the door one came in through; what is chosen and the one main button are the World's green (the owner,
// 10 November 2026: "Proceed according to your recommendation"); the Home Screen icon is the World's ink and green;
// no page errors.
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
const WORLD={ink:'rgb(38, 61, 57)',green:'rgb(22, 129, 94)',cream:'rgb(245, 245, 236)'};
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

 await check('the page and the manifest name the World; the browser’s theme colour is the bar’s own, the page’s dark again',async()=>{
  const out=await page.evaluate(async()=>{
   const link=document.querySelector('link[rel="manifest"]').href,manifest=await (await fetch(link)).json();
   return {title:document.title,og:document.querySelector('meta[property="og:title"]').content,description:document.querySelector('meta[name="description"]').content,manifest:{name:manifest.name,short:manifest.short_name,theme:manifest.theme_color},appTitle:document.querySelector('meta[name="apple-mobile-web-app-title"]').content};
  });
  assert.equal(out.title,'Pocket Camera · Johansson World');assert.equal(out.og,'Pocket Camera · Johansson World');
  assert.match(out.description,/Minato Machi, Johansson World/);
  assert.deepEqual(out.manifest,{name:'Pocket Camera · Johansson World',short:'Pocket Camera',theme:'#0d0e10'});
  assert.equal(out.appTitle,'Pocket Camera','the Home Screen keeps the short name');
  await bothThemes(page,async scheme=>{
   const {meta,bar}=await page.evaluate(()=>({meta:document.querySelector('meta[name="theme-color"]').content,bar:getComputedStyle(document.querySelector('.camera-bar')).backgroundColor}));
   const hex=c=>'#'+c.match(/\d+/g).slice(0,3).map(n=>(+n).toString(16).padStart(2,'0')).join('');
   assert.equal(hex(bar),meta,`${scheme}: the status bar is the bar’s own colour`);
   if(scheme==='dark')assert.equal(meta,'#0d0e10','dark bars are the page’s own dark, not the navy a first reading called the World’s ink');
  });
 });

 await check('the title card: the World’s wordmark as its title draws it, on its cream, once, with the camera’s Japanese name as a stamp; the bar is quiet above it',async()=>{
  const out=await page.evaluate(()=>{
   const hero=document.querySelector('#welcome .welcome-hero'),mark=hero.querySelector('svg.world-mark'),stamp=hero.querySelector('.world-stamp'),copy=document.querySelector('#welcome .welcome-copy'),bar=document.querySelector('.camera-bar');
   const box=mark.getBoundingClientRect(),view=mark.viewBox.baseVal;
   return {role:mark.getAttribute('role'),label:mark.getAttribute('aria-label'),paths:[...mark.querySelectorAll('path')].map(p=>({cls:p.getAttribute('class'),fill:getComputedStyle(p).fill,stroke:getComputedStyle(p).stroke,long:p.getAttribute('d').length>800})),
    ratio:+(box.width/box.height).toFixed(2),view:+(view.width/view.height).toFixed(2),width:Math.round(box.width),
    hero:getComputedStyle(hero).backgroundColor,stamp:{label:stamp.getAttribute('aria-label'),lang:stamp.getAttribute('lang'),role:stamp.getAttribute('role'),fill:getComputedStyle(stamp.querySelector('path')).fill,ground:getComputedStyle(stamp).backgroundColor,height:Math.round(stamp.querySelector('svg').getBoundingClientRect().height),under:stamp.getBoundingClientRect().top>=box.bottom},
    h2:copy.querySelector('h2').textContent,p:copy.querySelector('p').textContent,start:getComputedStyle(document.getElementById('startCamera')).backgroundColor,
    lockup:getComputedStyle(document.querySelector('.camera-mark')).visibility,barRule:getComputedStyle(bar).boxShadow,
    marks:document.querySelectorAll('#welcome svg.world-mark').length,old:document.querySelectorAll('.world-mark-main,.world-mark-town,.world-mark-jp').length};
  });
  assert.equal(out.role,'img');assert.equal(out.label,'Johansson World');
  assert.deepEqual(out.paths.map(p=>[p.cls,p.fill,p.stroke,p.long]),[['wm-main',WORLD.ink,'none',true],['wm-town',WORLD.green,'none',true]],'JOHANSSON in the World’s ink over WORLD in its green: outlines, unstroked');
  assert.ok(Math.abs(out.ratio-out.view)<=.03,`the wordmark is drawn at its own proportions (${out.ratio} against ${out.view})`);assert.ok(out.width>=150,`large enough to read (${out.width} px)`);
  assert.equal(out.hero,WORLD.cream,'on the World’s cream, in dark as in light');
  assert.deepEqual([out.stamp.label,out.stamp.lang,out.stamp.role],['ポケットカメラ','ja','img']);assert.ok(out.stamp.under,'the stamp sits under the wordmark');assert.ok(out.stamp.height>=8,`the kana are legible (${out.stamp.height} px)`);
  assert.equal(out.h2,'Pocket Camera');assert.match(out.p,/^A little camera from Minato Machi\./);
  assert.equal(out.start,WORLD.green,'the title card’s button is the World’s green, as Start Exploring is');
  assert.equal(out.marks,1,'the wordmark appears once');assert.equal(out.old,0,'nothing of the toy wordmark is left');
  assert.equal(out.lockup,'hidden','the bar’s lockup is hidden while the title card carries the brand');assert.equal(out.barRule,'none','and the bar has no rule under it there');
  // The stamp's kana against its own ground, and the words, in both themes (the card itself does not change).
  const lum=c=>{const [r,g,b]=c.match(/[\d.]+/g).map(Number).map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4;});return .2126*r+.7152*g+.0722*b;};
  const ratio=(a,b)=>{const [x,y]=[lum(a),lum(b)].sort((m,n)=>n-m);return +((x+.05)/(y+.05)).toFixed(2);};
  assert.ok(ratio(out.stamp.fill,out.stamp.ground)>=4.5,`the stamp’s kana read (${ratio(out.stamp.fill,out.stamp.ground)})`);
  assert.ok(ratio(WORLD.green,WORLD.cream)>=4,`WORLD on the cream (${ratio(WORLD.green,WORLD.cream)})`);
  await bothThemes(page,async scheme=>{
   assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('#welcome .welcome-hero')).backgroundColor),WORLD.cream,`${scheme}: the card is the World’s cream`);
   const copy=await contrast(page,'#welcome .welcome-copy p');assert.ok(copy>=4.5,`${scheme}: the tag line reads (${copy})`);
   const start=await contrast(page,'#startCamera');assert.ok(start>=4.5,`${scheme}: Start camera reads on the green (${start})`);
  });
 });

 await check('the greeter stands clear of the wordmark and the stamp, whoever greets, and the card is whole on a phone’s first screen',async()=>{
  // The three widest and the two narrowest of the residents' stickers (by their own measures in the sheet): each is set
  // as the greeter in turn.
  const greeters=await page.evaluate(async()=>{
   const m=await import(`./stickers.js?v=${document.querySelector('script[src^="app.js"]').src.split('v=')[1]}`),sheet=await m.loadStickerSets();
   // (a greeter is a figure standing, taller than wide: app.js)
   const all=sheet.sets.filter(set=>set.who!==undefined&&!set.kind).flatMap(set=>set.stickers).filter(x=>x.width&&x.height&&x.height>=x.width*1.1).sort((x,y)=>y.width/y.height-x.width/x.height);
   return [...all.slice(0,3),...all.slice(-2)].map(x=>x.id);
  });
  assert.equal(greeters.length,5,JSON.stringify(greeters));
  for(const size of [{width:390,height:664},{width:375,height:560},{width:390,height:844}]){
   await page.setViewportSize(size);
   for(const id of greeters){
    const r=await page.evaluate(async id=>{
     const m=await import(`./stickers.js?v=${document.querySelector('script[src^="app.js"]').src.split('v=')[1]}`);await m.loadStickerSets();
     const s=m.stickerById(id),img=document.getElementById('welcomeSticker');if(!s)return {missing:id};img.hidden=false;img.src=s.url;await img.decode();
     // The picture's own box inside the element (object-fit: contain, standing on the bottom edge).
     const e=img.getBoundingClientRect(),k=Math.min(e.width/img.naturalWidth,e.height/img.naturalHeight),w=img.naturalWidth*k,h=img.naturalHeight*k,left=e.left+(e.width-w)/2,top=e.bottom-h;
     const brand=document.querySelector('.welcome-brand').getBoundingClientRect(),hero=document.querySelector('.welcome-hero').getBoundingClientRect(),stage=document.querySelector('#cameraStage').getBoundingClientRect();
     const stamp=document.querySelector('.world-stamp').getBoundingClientRect();
     return {gap:Math.round(left-Math.max(brand.right,stamp.right)),greeter:[Math.round(w),Math.round(h)],inside:left>=hero.left&&left+w<=hero.right+.5&&top>=hero.top-.5,brandInside:brand.top>=hero.top&&stamp.bottom<=hero.bottom&&brand.left>=hero.left,
      whole:[...document.querySelectorAll('#welcome > *')].filter(el=>el.getBoundingClientRect().width).every(el=>{const b=el.getBoundingClientRect();return b.top>=stage.top-.5&&b.bottom<=stage.bottom+.5;})};
    },id);
    assert.ok(!r.missing,`${id} is a sticker`);
    assert.ok(r.gap>=2,`${size.width}×${size.height} ${id}: ${r.gap} px between the wordmark and the greeter`);
    assert.ok(r.inside&&r.brandInside,`${size.width}×${size.height} ${id}: the greeter, the wordmark and the stamp are inside the card`);
    assert.ok(r.greeter[1]>=60,`${size.width}×${size.height} ${id}: the greeter is not tiny (${r.greeter[1]} px)`);
    assert.ok(r.whole,`${size.width}×${size.height} ${id}: the whole greeting is on the first screen`);
   }
  }
  await page.setViewportSize({width:390,height:844});
 });

 await check('the title screen’s two doors, the album and the Game Room: side by side, a finger high, each label on one line; the room’s Back leaves by the door one came in through',async()=>{
  for(const size of [{width:375,height:560},{width:360,height:640},{width:390,height:844}]){
   // Two frames after the resize: the browser re-reads its media queries when it next draws, not when it is measured.
   await page.setViewportSize(size);await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
   const out=await page.evaluate(()=>{
    const box=id=>document.getElementById(id).getBoundingClientRect(),a=box('welcomeAlbum'),g=box('welcomeGames'),stage=document.getElementById('cameraStage').getBoundingClientRect();
    const lines=[...document.querySelectorAll('.welcome-doors strong,.welcome-doors small')].map(el=>({text:el.textContent,lines:Math.round(el.getBoundingClientRect().height/parseFloat(getComputedStyle(el).lineHeight)),cut:el.scrollWidth>el.clientWidth+1}));
    return {level:Math.abs(a.top-g.top)<1&&Math.abs(a.height-g.height)<1,beside:a.right<g.left&&Math.abs(a.width-g.width)<1,finger:Math.min(a.height,g.height),inside:g.bottom<=stage.bottom+.5&&g.right<=stage.right+.5,lines};
   });
   const at=`${size.width}×${size.height}`;
   assert.ok(out.level&&out.beside,`${at}: two doors of one size, side by side`);assert.ok(out.finger>=44,`${at}: a finger high (${out.finger})`);assert.ok(out.inside,`${at}: on the first screen`);
   for(const l of out.lines)assert.ok(l.lines===1&&!l.cut,`${at}: “${l.text}” on one line`);
  }
  await page.setViewportSize({width:390,height:844});
  assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('.welcome-doors strong')].map(e=>e.textContent)),['Your album','Game Room']);
  // By the title screen's door: Back says Camera, and still does after a game, and leads back to the title screen.
  await page.click('#welcomeGames');await page.waitForSelector('#cardsHub:not([hidden])');
  assert.equal(await page.textContent('#closeCardsHub span'),'Camera');
  await page.click('#chooseBlackjack');await page.waitForSelector('#cardGame:not([hidden])');await page.click('#closeCardGame');await page.waitForSelector('#cardsHub:not([hidden])');
  assert.equal(await page.textContent('#closeCardsHub span'),'Camera');
  await page.click('#closeCardsHub');await page.waitForFunction(()=>window.pocketCamera.state.mode==='camera'&&!document.getElementById('welcome').hidden);
  // By the album's door: Back says Album, and leads there.
  await page.click('#welcomeAlbum');await page.waitForSelector('#album:not([hidden])');await page.click('#openGames');await page.waitForSelector('#cardsHub:not([hidden])');
  assert.equal(await page.textContent('#closeCardsHub span'),'Album');
  await page.click('#closeCardsHub');await page.waitForSelector('#album:not([hidden])');
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
  assert.match(out.font,/^"?LINE Seed JP/,'the World’s typeface first');assert.equal(out.caps,'uppercase');
  // And it is that typeface that draws the words, not a fallback: the browser's own account of the glyphs.
  await cam.evaluate(()=>Promise.all(['700','800'].map(w=>document.fonts.load(`${w} 16px "LINE Seed JP"`,'JOHANSSON WORLD Pocket Camera'))));
  const cdp=await granted.newCDPSession(cam);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const {root:doc}=await cdp.send('DOM.getDocument');
  for(const sel of ['h1.camera-mark .brand-eyebrow','h1.camera-mark .brand-name']){
   const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.nodeId,selector:sel}),{fonts}=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});
   assert.ok(fonts.length===1&&/^LINE Seed JP/.test(fonts[0].familyName)&&fonts[0].isCustomFont,`${sel} is drawn by ${fonts.map(f=>f.familyName).join(' and ')}`);
  }
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
   const m=await import('./frames.js?v=20261113picks1');const c=document.createElement('canvas');c.width=1200;c.height=900;const g=c.getContext('2d');
   const seen=[];const orig=g.fillText.bind(g);g.fillText=(t,...a)=>{seen.push(t);return orig(t,...a);};
   m.drawFrame(g,'film',1200,900);return seen;
  });
  assert.ok(texts.includes('MINATO 400')&&texts.includes('JOHANSSON WORLD'),JSON.stringify(texts));
  const print=await cam.evaluate(async()=>{const m=await import('./frames.js?v=20261113picks1');const c=document.createElement('canvas');c.width=1200;c.height=900;const g=c.getContext('2d');const seen=[];g.fillText=t=>seen.push(t);m.drawFrame(g,'print',1200,900);return seen;});
  assert.deepEqual(print,[],'the instant print stays plain');
 });

 await check('the Game Room’s kicker is the eyebrow, on one line, readable on its paper and in the dark; the bar names the town',async()=>{
  await cam.evaluate(()=>document.getElementById('roll').click());await cam.waitForSelector('#album:not([hidden])');
  await cam.evaluate(()=>document.getElementById('openGames').click());await cam.waitForSelector('#cardsHub:not([hidden])');
  const out=await cam.evaluate(()=>{const k=document.querySelector('.game-room-intro .cards-kicker');const r=k.getBoundingClientRect();return {text:k.textContent,lines:Math.round(r.height/parseFloat(getComputedStyle(k).lineHeight)),font:getComputedStyle(k).fontFamily,bar:document.querySelector('#cardsHub .bar h2').textContent,h1:document.querySelector('.game-room-intro h1').textContent};});
  assert.equal(out.text,'Johansson World');assert.equal(out.lines,1,'one line beside the greeter');assert.match(out.font,/LINE Seed JP/);
  assert.equal(out.bar,'Minato Machi');assert.equal(out.h1,'Game Room');
  await bothThemes(cam,async scheme=>{const c=await contrast(cam,'.game-room-intro .cards-kicker');assert.ok(c>=4.5,`${scheme}: the kicker reads (${c})`);});
 });

 await check('what is chosen and the one main button are the World’s green: the tokens in both themes, the games’ Play and Hit',async()=>{
  // WCAG contrast of two #rgb or #rrggbb colours.
  const lum=hex=>{const h=hex.replace('#',''),v=(h.length===3?[...h].map(c=>c+c):h.match(/../g)).map(x=>parseInt(x,16)/255).map(c=>c<=.03928?c/12.92:((c+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2];};
  const ratio=(x,y)=>{const a=lum(x),b=lum(y);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
  await bothThemes(cam,async scheme=>{
   const t=await cam.evaluate(()=>{const s=getComputedStyle(document.documentElement),v=n=>s.getPropertyValue(n).trim();return {fill:v('--accent-fill'),on:v('--on-accent'),accent:v('--accent'),soft:v('--accent-soft'),bg:v('--bg'),surface:v('--surface')};});
   assert.equal(t.fill,'#16815e',`${scheme}: the main button’s fill is the World’s green`);
   assert.ok(ratio(t.on,t.fill)>=4.5,`${scheme}: the words on it read (${ratio(t.on,t.fill).toFixed(2)})`);
   for(const ground of ['bg','surface','soft'])assert.ok(ratio(t.accent,t[ground])>=4.5,`${scheme}: what is chosen reads on ${ground} (${ratio(t.accent,t[ground]).toFixed(2)})`);
   // A green, not the gold it was: green the strongest channel.
   const [r,g,b]=(t.accent.replace('#','').match(/../g)).map(x=>parseInt(x,16));assert.ok(g>r&&g>b,`${scheme}: what is chosen is a green (${t.accent})`);
  });
  // The games' own main buttons, in the room's toy shape, are the same green: Blackjack's Hit, Memory's Play.
  const paint=sel=>cam.evaluate(sel=>{const s=getComputedStyle(document.querySelector(sel));return [s.backgroundColor,s.color];},sel);
  await cam.click('#chooseBlackjack');await cam.waitForSelector('.blackjack-actions .primary');
  assert.deepEqual(await paint('.blackjack-actions .primary'),[WORLD.green,'rgb(255, 255, 255)'],'Hit');
  await cam.click('#closeCardGame');await cam.waitForSelector('#cardsHub:not([hidden])');
  await cam.click('#chooseMemory');await cam.waitForSelector('#memory:not([hidden]) .memory-play');
  await bothThemes(cam,async scheme=>{
   assert.deepEqual(await paint('.memory-play'),[WORLD.green,'rgb(255, 255, 255)'],`${scheme}: Play`);
   const ring=await cam.evaluate(()=>getComputedStyle(document.querySelector('.memory-deck[aria-checked="true"]')).borderTopColor);
   assert.equal(ring,scheme==='dark'?'rgb(95, 214, 162)':WORLD.green,`${scheme}: the chosen deck is ringed in green`);
   assert.deepEqual(await paint('.memory-pairs button[aria-checked="true"]'),[WORLD.green,'rgb(255, 255, 255)'],`${scheme}: the chosen number of pairs`);
  });
  await cam.click('#closeMemory');await cam.waitForSelector('#cardsHub:not([hidden])');
 });

 await check('the share card is the World’s: ink header with the lockup, the camera’s name at the foot, the text signed by both',async()=>{
  const out=await cam.evaluate(async()=>{
   const m=await import('./social-share.js?v=20261113picks1');
   let canvas=null;const orig=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(...a){canvas=this;return orig.apply(this,a);};
   const el=m.createResultShare({game:'Memory',headline:'All 8 pairs!',detail:'14 turns'});document.body.append(el);
   await new Promise(r=>{const t=setInterval(()=>{if(!el.querySelectorAll('button')[1].disabled){clearInterval(t);r();}},20);});
   HTMLCanvasElement.prototype.toBlob=orig;
   const g=canvas.getContext('2d'),px=(x,y)=>[...g.getImageData(x,y,1,1).data].slice(0,3).join(',');
   el.remove();
   return {size:[canvas.width,canvas.height],header:px(100,100),paper:px(10,10),cream:px(540,1000),text:m.resultText({game:'Memory',headline:'All 8 pairs!',detail:'14 turns'})};
  });
  assert.deepEqual(out.size,[1080,1080]);assert.equal(out.header,'38,61,57','the header band is the World’s ink');assert.equal(out.paper,'245,245,236','the card sits on the World’s cream');
  assert.equal(out.text,'Memory · All 8 pairs! · 14 turns — Pocket Camera · Johansson World');
 });

 await check('the Home Screen icons: the World’s ink for a ground and its green for the lens ring',async()=>{
  const px=await cam.evaluate(async()=>{
   const img=new Image();img.src='icons/icon-512.png';await img.decode();const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.drawImage(img,0,0);
   const at=(x,y)=>[...g.getImageData(x,y,1,1).data].slice(0,3);return {corner:at(8,500),ring:at(256,362),flash:at(377,211)};
  });
  // The ground deepens from the World's ink (38,61,57) to the camera's night: green over blue over red, and dark.
  assert.ok(px.corner[1]>px.corner[2]&&px.corner[2]>=px.corner[0]&&px.corner[1]<60,`an ink ground (${px.corner})`);
  // The ring and the flash are the World's green, #16815e, the colour of everything chosen in the app.
  for(const part of ['ring','flash'])assert.deepEqual(px[part],[22,129,94],`the ${part} in the World's green (${px[part]})`);
 });
 await granted.close();
 assert.deepEqual(errors,[]);
 console.log(`${checks}/${checks} brand browser checks passed`);
}finally{await browser.close();await camBrowser.close();await server.close();}
