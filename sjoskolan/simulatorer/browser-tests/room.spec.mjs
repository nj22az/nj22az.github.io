import {test,expect} from '@playwright/test';
const route='/sjoskolan/simulatorer/';
const modulePath='/sjoskolan/simulatorer/app.mjs?v=20260930-room1';
async function inspect(page){return page.evaluate(async path=>(await import(path)).inspect(),modulePath);}
async function probe(page,name){await page.locator('#scene canvas').scrollIntoViewIfNeeded();const point=await page.evaluate(async ([path,name])=>(await import(path)).contactScreen(name),[modulePath,name]);await page.mouse.click(point.x,point.y);}
async function fit(page){const r=await page.evaluate(()=>({w:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));expect(r.scroll).toBeLessThanOrEqual(r.w+1);}
test('Johansson, real 3D probe contacts, complete Station A, movement and independent saves',async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('sjoskolan-multimeter-v1','{"done":["voltage"],"records":[]}');localStorage.setItem('johansson-town-avatar','unchanged');});
 await page.goto(route);await expect(page.locator('#scene canvas')).toBeVisible();await expect(page.locator('#scene-status')).toBeHidden();
 expect((await inspect(page)).scene.character).toBe('Johansson');await fit(page);
 const mode=v=>page.locator('#mode').selectOption(v),probes=async(r,b)=>{await page.locator('#red').selectOption(r);await page.locator('#black').selectOption(b);};
 const pass=async n=>{await expect(page.locator('#step-heading')).toHaveText(`Steg ${n} av 9`);await page.locator('#check').click();if(n<9){await expect(page.locator('#next')).toBeVisible();await page.locator('#next').click();}};
 await mode('dc');await probes('Ref+','Ref−');await pass(1);
 await page.locator('#link').click();await probes('A','B');await pass(2);await mode('ohm');
 await expect(page.locator('#reading')).toHaveText('961,8');
 // Set both contacts through actual WebGL ray picking, independent of the selects.
 await page.locator('#disconnect').click();await page.locator('#choose-red').click();await probe(page,'A');await page.locator('#choose-black').click();await probe(page,'B');
 await expect(page.locator('#red')).toHaveValue('A');await expect(page.locator('#black')).toHaveValue('B');
 const pose=(await inspect(page)).scene;expect(pose.handError.L).toBeLessThan(.025);expect(pose.handError.R).toBeLessThan(.025);expect(pose.drawCalls).toBeLessThan(180);
 await page.screenshot({path:info.outputPath('bench.png'),fullPage:true});
 for(const [r,b] of [['P','N'],['N','P'],['Ref+','Ref−'],['Ref−','Ref+'],['B','A']]){await probes(r,b);const arms=(await inspect(page)).scene.handError;expect(arms.L).toBeLessThan(.025);expect(arms.R).toBeLessThan(.025);}await probes('A','B');
 await pass(3);await probes('N','B');await pass(4);
 await mode('dc');await page.locator('#link').click();await probes('P','N');await page.locator('#power').click();await pass(5);
 await probes('A','B');await pass(6);await probes('B','N');await pass(7);
 await page.locator('#power').click();await page.locator('#link').click();await probes('P','A');await page.locator('#jack').selectOption('ma');await mode('current');await page.locator('#power').click();await pass(8);
 await page.locator('#power').click();await page.locator('#jack').selectOption('v');await page.locator('#link').click();await mode('dc');await probes('Ref+','Ref−');await pass(9);
 await expect(page.locator('#step-heading')).toHaveText('Station A klar');
 await page.locator('#overview').click();const before=(await inspect(page)).scene.position;await page.locator('#scene canvas').focus();await page.keyboard.down('ArrowUp');await page.waitForTimeout(400);await page.keyboard.up('ArrowUp');const after=(await inspect(page)).scene.position;expect(after[2]).toBeLessThan(before[2]);
 await page.screenshot({path:info.outputPath('engine-room.png')});
 await page.locator('#bench').click();await page.reload();await expect(page.locator('#step-heading')).toHaveText('Station A klar');
 expect(await page.evaluate(()=>localStorage.getItem('johansson-town-avatar'))).toBe('unchanged');expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('sjoskolan-multimeter-v1')).done)).toEqual(['voltage']);expect(errors).toEqual([]);
});
test('WebGL unavailable: full 2D controls, touch/keyboard contacts and blocked storage',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:original.call(this,type,...args);};Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});});
 await page.goto(route);await expect(page.locator('#flat-diagram')).toBeVisible();await expect(page.locator('#scene-status')).toContainText('3D är inte tillgängligt');
 await page.locator('#mode').selectOption('dc');await page.locator('#choose-red').click();await page.locator('[data-node="Ref+"]').click();await page.locator('#choose-black').click();await page.locator('[data-node="Ref−"]').focus();await page.keyboard.press('Enter');await expect(page.locator('#reading')).toHaveText('5,01');await page.locator('#check').click();await expect(page.locator('#next')).toBeVisible();await page.locator('#next').click();await expect(page.locator('#step-heading')).toHaveText('Steg 2 av 9');await expect(page.locator('#storage-status')).toContainText('kan inte spara');await fit(page);
});
test('touch navigation and alternate camera keep hand contacts reachable',async({page,isMobile})=>{
 test.skip(!isMobile,'Touch projects only');await page.goto(route);await expect(page.locator('#scene-status')).toBeHidden();
 await page.locator('#overview').tap();const before=(await inspect(page)).scene.position;
 const control=page.locator('[data-move="right"]');await control.scrollIntoViewIfNeeded();const rect=await control.boundingBox();const cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rect.x+rect.width/2,y:rect.y+rect.height/2}]});await page.waitForTimeout(350);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});expect((await inspect(page)).scene.position[0]).toBeGreaterThan(before[0]);await cdp.detach();
 // Real touch on WebGL picks a contact after returning to the bench.
 await page.locator('#bench').tap();await page.locator('#camera').tap();await page.locator('#choose-red').tap();await page.locator('#scene canvas').scrollIntoViewIfNeeded();const point=await page.evaluate(async p=>(await import(p)).contactScreen('A'),modulePath);await page.touchscreen.tap(point.x,point.y);await expect(page.locator('#red')).toHaveValue('A');
 expect((await inspect(page)).scene.handError.R).toBeLessThan(.025);await fit(page);
});

test('protocol requires prediction and matching wiring, exports CSV and persists separately',async({page})=>{
 await page.goto(route);await page.locator('#mode').selectOption('dc');await page.locator('#red').selectOption('Ref+');await page.locator('#black').selectOption('Ref−');
 await page.locator('.protocol > summary').click();const row0=page.locator('[data-p="rows.0.forv"]');const fetch=page.locator('.lp-fetch[data-row="0"]');await fetch.click();await expect(page.locator('.lp-row-msg').first()).toContainText('Räkna först');await row0.fill('5,00 V');await fetch.click();await expect(page.locator('[data-p="rows.0.uppm"]')).toHaveValue('5,01 V ⎓');
 await page.locator('[data-p="rows.1.forv"]').fill('1000 Ω');await page.locator('.lp-fetch[data-row="1"]').click();await expect(page.locator('.lp-row-msg').nth(1)).toContainText('annan koppling');
 const download=page.waitForEvent('download');await page.locator('.lp-csv').click();expect((await download).suggestedFilename()).toBe('maskinrum-stationA-v1-protokoll.csv');await page.reload();await page.locator('.protocol > summary').click();await expect(page.locator('[data-p="rows.0.uppm"]')).toHaveValue('5,01 V ⎓');expect(await page.evaluate(()=>localStorage.getItem('sjoskolan-protokoll-stationA'))).toBeNull();
});
