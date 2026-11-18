import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(process.env.OFFICE_TEST_RUNTIME+'/package.json'),{chromium}=require('playwright');
const root=resolve(process.env.OFFICE_SOURCE_ROOT),baseline=resolve(process.env.OFFICE_BASELINE_ROOT),out=resolve(process.env.OFFICE_OUTPUT);await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.png':'image/png','.mp4':'video/mp4','.woff2':'font/woff2'};
function serve(before=false){const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),relative=path.endsWith('/')?path+'index.html':path,file=resolve(root,'.'+relative);if(!file.startsWith(root+sep))throw Error();let b;if(before)try{b=await readFile(resolve(baseline,'.'+relative));}catch{}b??=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end();}});return new Promise(r=>server.listen(0,'127.0.0.1',()=>r({server,url:'http://127.0.0.1:'+server.address().port})));}
const old=await serve(true),current=await serve(),browser=await chromium.launch({headless:true,executablePath:process.env.OFFICE_CHROMIUM_PATH || undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const results=[];
async function pageFor(context,url){const page=await context.newPage();await page.route('**/*',r=>r.request().url().startsWith(url)?r.continue():r.abort());return page;}
async function journalGeometry(page) {
  await page.evaluate(() => document.fonts.ready);
  return page.locator('.hotel-journal-nav, .journal-masthead').evaluateAll(nodes=>nodes.map(node=>{
    const {x,y,width,height}=node.getBoundingClientRect();
    return [x,y,width,height].map(Math.round);
  }));
}
async function reviewFooter(page, profile) {
  const footer = page.locator('#site-footer');
  const nav = footer.getByRole('navigation', {name: 'Footer navigation'});
  assert.deepEqual(await nav.locator('p').allTextContents(), ['Office', 'Explore', 'Resources']);
  assert.equal(await nav.getByRole('link', {name: 'About Nils Johansson'}).getAttribute('href'), '/#about');
  assert.equal(await nav.getByRole('link', {name: 'Digital downloads'}).getAttribute('href'), '/animation-studio/#digital-downloads');
  assert(await footer.locator('a').evaluateAll(links => links.every(link => {
    const rect = link.getBoundingClientRect();
    return rect.width >= 44 && rect.height >= 44 && rect.left >= 0 && rect.right <= innerWidth;
  })), 'Footer targets fit and meet the 44px minimum: '+profile);
  await footer.getByRole('link', {name: 'Back to top'}).click();
  await page.waitForFunction(() => scrollY === 0);
}
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await pageFor(context,old.url);await page.goto(old.url);await page.locator('.px-card').first().waitFor();const beforeHeight=await page.locator('#project-grid').evaluate(el=>el.getBoundingClientRect().height);await context.close();
 for(const [profile,width,height,zoom] of [['desktop',1440,1000,1],['ipad-portrait',768,1024,1],['ipad-landscape',1024,768,1],['phone',390,844,1],['small-phone',320,844,1],['desktop-200pct',720,500,2]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:zoom,reducedMotion:'reduce',colorScheme:'light',hasTouch:profile!=='desktop'&&zoom===1}),page=await pageFor(context,current.url),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  await page.goto(current.url);await page.locator('.px-card').first().waitFor();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'clarity');
  await page.evaluate(()=>localStorage.setItem('nj-theme','popwave'));await page.reload();await page.locator('.px-card').first().waitFor();assert.equal(await page.locator('html').getAttribute('data-theme'),'clarity','Homepage remains stable despite a saved alternate theme');assert.equal(await page.evaluate(()=>localStorage.getItem('nj-theme')),'popwave','Homepage preserves other-page preference');
  const appearance=page.locator('.office-appearance-toggle');
  assert.equal(await page.locator('html').getAttribute('data-office-mode'),'light');
  await appearance.focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('html').getAttribute('data-office-mode'),'dark');
  assert.equal(await appearance.getAttribute('aria-pressed'),'true');
  await page.reload();await page.locator('.px-card').first().waitFor();
  assert.equal(await page.locator('html').getAttribute('data-office-mode'),'dark','Explicit mode persists');
  await appearance.waitFor();
  assert.equal(await page.evaluate(()=>localStorage.getItem('nj-theme')),'popwave');
  assert.equal(await page.locator('meta[name="theme-color"]').getAttribute('content'),'#000000');
  await page.waitForFunction(()=>{const still=document.querySelector('#office-port > img');return still.complete&&still.naturalWidth>0&&still.src.endsWith('/quay-opening.webp');});
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:resolve(out,profile+'-dark-home.png')});
  await page.evaluate(()=>document.querySelector('#projects').scrollIntoView({block:'start',behavior:'instant'}));await page.screenshot({path:resolve(out,profile+'-dark-projects.png')});
  const contrasts=await page.evaluate(()=>{
    function lum(c){const v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*v[0]+.7152*v[1]+.0722*v[2];}
    return [['.px-summary','.px-card'],['.px-mini-window .px-preview-note','.px-mini-window'],['.nav-hamburger','.nav-hamburger']].map(([fg,bg])=>{const a=lum(getComputedStyle(document.querySelector(fg)).color),b=lum(getComputedStyle(document.querySelector(bg)).backgroundColor);return {selector:fg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
  });assert(contrasts.every(x=>x.ratio>=4.5),JSON.stringify(contrasts));
  const darkLayout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,background:getComputedStyle(document.body).backgroundColor,button:document.querySelector('.office-appearance-toggle').getBoundingClientRect().width}));
  assert.equal(darkLayout.background,'rgb(0, 0, 0)');assert(!darkLayout.overflow);assert(darkLayout.button>=44);
  const header=await page.locator('.nav-actions').evaluate(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right}));assert(header.left>=0&&header.right<=width,'Header controls fit');
  assert(await page.evaluate(()=>window.scrollY+document.querySelector('.office-eyebrow').getBoundingClientRect().top>=document.querySelector('#site-nav').getBoundingClientRect().bottom),'Header does not cover the introduction: '+profile);
  await page.locator('.office-calendar-toggle').click();assert(await page.locator('.office-calendar-panel').isVisible());await page.locator('.office-calendar-toggle').click();
  await page.locator('#nav-hamburger').click();assert.equal(await page.locator('#menu-overlay').getAttribute('aria-hidden'),'false');await page.keyboard.press('Escape');
  await page.locator('[data-project-filter="create"]').click();assert.equal(await page.locator('.px-card:visible').count(),2);await page.locator('[data-project-filter="all"]').click();
  await appearance.click();assert.equal(await page.locator('html').getAttribute('data-office-mode'),'light');
  await page.emulateMedia({colorScheme:'dark'});assert.equal(await page.locator('html').getAttribute('data-office-mode'),'light','Explicit choice overrides system');
  await page.evaluate(()=>localStorage.removeItem('nj-office-appearance'));await page.reload();await page.locator('.px-card').first().waitFor();
  assert.equal(await page.locator('html').getAttribute('data-office-mode'),'dark','System dark on first visit');
  await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.officeMode==='light'&&getComputedStyle(document.querySelector('.office-heading')).color===getComputedStyle(document.querySelector('#project-heading')).color);
  assert.equal(await page.locator('.px-card').count(),4);assert.equal(await page.locator('.px-card-stepwise').count(),0);assert(!requests.some(u=>/harbour.scene.gz|three.module|\/johansson-town\/runtime\//.test(u)),'Apps and 3D remain deferred');
  // 200% desktop zoom equivalent: half the CSS viewport, double device pixel density.
  // Unlike CSS zoom, this also exercises the responsive media queries used by browser zoom.
  assert.equal(await page.locator('.px-card-sakura,.px-card-world,.px-card-ferry').count(),0);
  assert.equal(await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name:'Animation Studio'}).getAttribute('href'),'/animation-studio/');
  const headings=await page.locator('.office-heading,#project-heading').evaluateAll(els=>els.map(e=>getComputedStyle(e).color));assert.equal(headings[0],headings[1]);
  for(const [filter,count] of [['create',2],['learn',2],['all',4]]){await page.locator('[data-project-filter="'+filter+'"]').click();assert.equal(await page.locator('.px-card:visible').count(),count);assert.equal(await page.locator('[data-project-filter="'+filter+'"] span').innerText(),String(count));assert.equal(await page.locator('[data-project-filter="'+filter+'"]').getAttribute('aria-pressed'),'true');}
  const task=page.locator('#px-complete-preview');await task.click();assert.equal(await task.getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#px-preview-due').innerText(),'01');await task.click();assert.equal(await page.locator('#px-preview-due').innerText(),'02');
  const details=page.locator('.px-card-camera summary');await details.focus();await page.keyboard.press('Enter');assert(await page.locator('.px-card-camera details').getAttribute('open')!==null);await page.keyboard.press('Enter');
  assert.equal(await page.locator('.px-private-course').getAttribute('href'),'https://sjoskolan-course-review.nils-johansson.chatgpt.site');assert.equal(await page.locator('.px-card-camera .px-mascot').getAttribute('src'),'/assets/mascots/tetsuo-teach.webp');
  for(const card of await page.locator('.px-card').all()){await card.scrollIntoViewIfNeeded();}
  await page.waitForFunction(()=>[...document.querySelectorAll('#project-grid img')].every(i=>i.complete&&i.naturalWidth>0),null,{timeout:15000});
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,gridHeight:document.querySelector('#project-grid').getBoundingClientRect().height,cards:[...document.querySelectorAll('.px-card')].map(c=>({title:c.querySelector('h3').textContent,height:c.getBoundingClientRect().height})),targets:[...document.querySelectorAll('#projects button,#projects summary,.px-open,.px-private-course')].filter(e=>e.getBoundingClientRect().width).map(e=>({label:e.textContent.trim().slice(0,45),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))}));
  assert(!layout.overflow,'No horizontal overflow: '+profile);assert(layout.targets.every(t=>t.width>=44&&t.height>=44),'44px controls: '+profile);
  if(profile==='desktop'){assert(layout.gridHeight<beforeHeight*.8,'Substantially shorter project grid');}
  await page.locator('#office-port > img').evaluate(img=>img.decode());
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:resolve(out,profile+'-home.png')});await page.evaluate(()=>document.querySelector('#projects').scrollIntoView({block:'start',behavior:'instant'}));await page.screenshot({path:resolve(out,profile+'-projects.png')});
  await reviewFooter(page, profile);
  const toolsLink=page.locator('.office-actions').getByRole('link',{name:'Tools & Learning',exact:true});
  assert.equal(await toolsLink.getAttribute('href'),'#projects');
  await page.getByRole('link',{name:'Visit the studio'}).click();
  await page.waitForURL('**/animation-studio/');
  assert.deepEqual(await page.locator('.studio-project h3').allTextContents(),['Chisum','Johansson World','Sakura Shōten']);
  assert.deepEqual(await page.locator('.studio-actions a').evaluateAll(links=>links.map(link=>link.getAttribute('href'))),['/ferry/','/johansson-world/','/johansson-town/','/johansson-world/#downloads','/johansson-world/sakura/play/','/johansson-world/sakura/']);
  for(const img of await page.locator('main img').all()) await img.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>[...document.querySelectorAll('main img')].every(img=>img.complete&&img.naturalWidth>0));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Studio page fits the viewport: '+profile);
  assert(await page.locator('.studio-actions a').evaluateAll(links=>links.every(link=>link.getBoundingClientRect().height>=44)),'Studio links have 44px targets: '+profile);
  await reviewFooter(page, profile);
  await page.locator('.studio-intro').getByRole('link',{name:'Digital downloads'}).click();
  await page.waitForURL('**/animation-studio/#digital-downloads');
  const downloads=page.locator('.studio-product a[download]');
  assert.equal(await downloads.count(),3);
  assert.equal(await page.locator('.studio-product-size').count(),3);
  assert.equal(await page.locator('.site-shortcuts [aria-current=page]').getAttribute('href'),'/animation-studio/');
  assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(0, 0, 0)');
  for(const preview of await page.getByRole('link',{name:/^Preview /}).all()){
    await preview.click();
    const gallery=page.locator('.pswp--open');
    await gallery.waitFor();
    await gallery.locator('.pswp__img').first().waitFor();
    await page.waitForFunction(()=>document.querySelector('.pswp--open .pswp__img')?.naturalWidth>0);
    assert.equal(await gallery.locator('.pswp__counter').textContent(),'1 / 3');
    if(profile==='desktop'){
      await gallery.getByRole('button',{name:'Next'}).click();
      await page.waitForFunction(()=>document.querySelector('.pswp__counter')?.textContent==='2 / 3');
      assert(await gallery.locator('.pswp__sample-caption').textContent());
    }
    await page.keyboard.press('Escape');
    await gallery.waitFor({state:'hidden'});
  }
  const projectPreview = page.getByRole('link',{name:'Enlarge Chisum at sea'});
  await projectPreview.click();
  await page.locator('.pswp--open').waitFor();
  await page.keyboard.press('Escape');
  await page.locator('.pswp--open').waitFor({state:'hidden'});
  await page.locator('.studio-intro').getByRole('link',{name:'Digital downloads'}).click();
  assert(await downloads.evaluateAll(links=>links.every(link=>link.getBoundingClientRect().height>=44)),'Downloads have 44px targets: '+profile);
  if(profile==='desktop'){
   for(const link of await downloads.all()){
    const href=await link.getAttribute('href');
    const downloaded=page.waitForEvent('download');
    await link.click();
    const file=await downloaded;
    assert.equal(file.suggestedFilename(),href.split('/').pop());
    assert((await readFile(await file.path())).equals(await readFile(resolve(root,'animation-studio',href))), 'Download bytes match archive');
   }
  }
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:resolve(out,profile+'-studio.png'),fullPage:true});
  let journalLayout;
  for(const section of ['/blog/','/hotels/']){
    const journal = section==='/blog/';
    const nav = journal ? 'Primary navigation' : 'Hotel journal';
    await page.getByRole('navigation',{name:nav}).getByRole('link',{name:journal?'Field Notes':'Hotel finder',exact:true}).click();
    await page.waitForURL('**'+section);
    assert.equal(await page.locator('.site-shortcuts [aria-current]').getAttribute('href'),'/blog/');
    assert.equal(await page.locator('.site-shortcuts a').count(),3);
    assert.equal(await page.locator('.hotel-journal-nav [aria-current=page]').getAttribute('href'),section);
    assert.equal(await page.locator('body').evaluate(body=>getComputedStyle(body).backgroundColor),'rgb(248, 247, 242)');
    const geometry=await journalGeometry(page);
    if(journal) journalLayout=geometry;
    else assert.deepEqual(geometry,journalLayout,'Journal tabs and masthead stay in place: '+profile);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Content page fits the viewport: '+section+' '+profile);
    assert(await page.locator('.site-shortcuts a').evaluateAll(links=>links.every(link=>link.getBoundingClientRect().height>=44)));
    if(journal){
      assert.equal(await page.locator('html').getAttribute('data-theme'),'clarity');
      assert.equal(await page.evaluate(()=>localStorage.getItem('nj-theme')),'popwave','Blog preserves the saved theme for other pages');
      const filters=page.getByRole('group',{name:'Filter posts'});
      assert.equal(await page.locator('.blog-feed-topic').first().textContent(),'Hotel review');
      await filters.getByRole('button',{name:'Hotel reviews'}).click();
      assert.equal(await page.locator('.blog-parking').count(),5);
      assert.equal(await page.locator('.blog-logistics').count(),5);
      assert((await page.locator('.blog-feed-topic').allTextContents()).every(topic=>topic==='Hotel review'));
      await filters.getByRole('button',{name:'Other articles'}).focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('.blog-parking').count(),0);
      assert(await page.getByRole('heading',{name:'The Torn Poster'}).isVisible());
      await filters.getByRole('button',{name:'Latest'}).click();
    }
    await reviewFooter(page, profile);
    if(profile==='desktop'||profile==='small-phone'){
      await page.screenshot({path:resolve(out,profile+(section==='/blog/'?'-blog.png':'-hotels.png'))});
    }
  }
  if(profile==='desktop'){
    await page.getByRole('navigation',{name:'Hotel journal'}).getByRole('link',{name:'Reviews & stories'}).click();
    await page.getByRole('link',{name:'Parking details for Scandic Rosendahl, Tampere'}).click();
    await page.waitForURL('**/hotels/#review-scandic-rosendahl-2026-10-25');
    const record=page.locator('#review-scandic-rosendahl-2026-10-25');
    assert(await record.isVisible());
    assert(await record.locator('.hotel-post-more').evaluate(notes=>!notes.inert));
    await record.getByRole('link',{name:'Scandic Rosendahl, Tampere: paid parking on one bill'}).click();
    await page.waitForURL('**/blog/scandic-rosendahl-tampere/');
    assert.deepEqual((await journalGeometry(page))[0],journalLayout[0],'The review uses the same journal navigation');
    assert.equal(await page.locator('.site-shortcuts [aria-current]').getAttribute('href'),'/blog/');
    await reviewFooter(page, profile);
    await page.getByRole('link',{name:/Back to the Blog/}).click();
    await page.waitForURL('**/blog/');
  }
  assert.deepEqual(errors,[]);results.push({profile,width,height,zoom,result:'passed',layout});await context.close();
 }
 const blocked=await browser.newContext({viewport:{width:390,height:844},colorScheme:'dark',reducedMotion:'reduce'});
 await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage unavailable');}}));
 const blockedPage=await pageFor(blocked,current.url);await blockedPage.goto(current.url);await blockedPage.locator('.office-appearance-toggle').click();assert.equal(await blockedPage.locator('html').getAttribute('data-office-mode'),'light','Toggle works when storage is unavailable');await blocked.close();
 const plain=await browser.newContext({javaScriptEnabled:false});
 const plainPage=await pageFor(plain,current.url);
 await plainPage.goto(current.url+'/');
 const homeOrder=await plainPage.locator('main > section').evaluateAll(sections=>sections.slice(0,4).map(s=>s.id||s.getAttribute('aria-labelledby')));
 assert.deepEqual(homeOrder,['home','about','projects','studio-home-heading']);
 assert(await plainPage.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name:'Field Notes'}).isVisible());
 assert(await plainPage.getByText('I commission and calibrate precision materials-testing systems',{exact:false}).isVisible());
 assert.equal(await plainPage.locator('.office-specs dt').count(),4);
 assert.equal(await plainPage.locator('#project-grid .px-card').count(),4);
 assert.equal(await plainPage.locator('#project-grid a[href="/camera/"]').count(),1);
 assert.equal(await plainPage.locator('#project-grid a[href="/elteknik/"]').count(),1);
 assert(await plainPage.getByRole('navigation',{name:'Professional contact'}).getByRole('link',{name:'Contact on LinkedIn'}).isVisible());
 assert.equal(await plainPage.locator('link[rel="stylesheet"]').count(),1);
 assert.equal(await plainPage.locator('#harbour-diorama a[href="/camera/"], #harbour-diorama a[href="/elteknik/"]').count(),0);
 await plainPage.goto(current.url+'/blog/');
 assert.equal(await plainPage.locator('.blog-parking').count(),5,'Parking links remain in the static feed');
 assert.equal(await plainPage.locator('.blog-logistics').count(),5,'Vehicle and receipt metadata remain in the static feed');
 assert(await plainPage.getByRole('heading',{name:'The Torn Poster'}).isVisible());
 assert.equal(await plainPage.getByRole('navigation',{name:'Hotel journal'}).getByRole('link',{name:'Hotel finder'}).getAttribute('href'),'/hotels/');
 await plainPage.getByRole('navigation',{name:'Hotel journal'}).getByRole('link',{name:'Hotel finder'}).click();
 assert(await plainPage.getByRole('heading',{name:'Hotel finder',exact:true}).isVisible());
 assert(await plainPage.getByRole('navigation',{name:'Hotel journal'}).getByRole('link',{name:'Reviews & stories'}).isVisible());
 await plain.close();
 await writeFile(resolve(out,'results.json'),JSON.stringify({result:'passed',baselineDesktopGridHeight:beforeHeight,profiles:results},null,2));console.log(JSON.stringify({beforeHeight,profiles:results.map(x=>({profile:x.profile,gridHeight:x.layout.gridHeight}))}));
}finally{await browser.close();for(const s of [old.server,current.server]){s.closeAllConnections();await new Promise(r=>s.close(r));}}
