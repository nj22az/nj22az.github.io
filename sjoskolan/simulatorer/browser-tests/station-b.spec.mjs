import {test,expect} from '@playwright/test';
const route='/sjoskolan/simulatorer/vaxelstrom/';
const mod='/sjoskolan/simulatorer/vaxelstrom/app.mjs?v=20261003-erik';
const inspect=page=>page.evaluate(async m=>(await import(m)).inspect(),mod);
async function fit(page){const r=await page.evaluate(()=>({w:document.documentElement.clientWidth,s:document.documentElement.scrollWidth}));expect(r.s).toBeLessThanOrEqual(r.w+1);}

test('Station B: Erik visar, eleven förutsäger, läser av och förklarar alla åtta uppgifter',async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('sj-elev-d','7');localStorage.setItem('sjoskolan-ac-grund-v3','{"orört":true}');});
  await page.goto(route);await expect(page.locator('#scene canvas')).toBeVisible();await expect(page.locator('#scene-status')).toBeHidden({timeout:60000});
  const s=(await inspect(page)).scene;expect(s.character).toBe('Erik');expect(s.student).toBe('Johansson');await fit(page);
  const svar={kalibrator:{trms:'10',avg:'10'},'grund-period':{T:'20'},'grund-topp':{peak:'28,28'},'grund-xl':{XL:'23,25'},'grund-z':{Z:'43,70'},'grund-strom':{I:'0,2746'},'grund-pf1':{I:'8,09'},'grund-pf05':{I:'16,17'}};
  for(const [id,values] of Object.entries(svar)){
    await page.locator('#task-pick').selectOption(id);
    for(const [k,v] of Object.entries(values))await page.locator(`#predict input[name=${k}]`).fill(v);
    await page.locator('#predict button[type=submit]').click();
    await expect(page.locator('.erik-lines li').first()).toBeVisible();
    await page.locator('#skip').click();
    await expect(page.locator('.verdict')).toContainText('Rätt!');
    const arms=(await inspect(page)).scene.handError;expect(arms.R).toBeLessThan(.1);expect(arms.L).toBeLessThan(.1);
    await page.locator('#explain').click();await page.locator('#expl textarea').fill(`Min förklaring för ${id}.`);await page.locator('#expl button[type=submit]').click();
    await expect(page.locator('.saved')).toBeVisible();
  }
  await expect(page.locator('#progress')).toContainText('8 av 8');
  await page.locator('#protocol-box summary').click();await expect(page.locator('#protocol tbody tr')).toHaveCount(9);
  expect(await page.evaluate(()=>localStorage.getItem('sjoskolan-ac-grund-v3'))).toBe('{"orört":true}');
  await page.screenshot({path:info.outputPath('station-b.png'),fullPage:true});
  expect(errors).toEqual([]);
});

test('Station B utan WebGL: Eriks steg som text, samma arbetsgång',async({page})=>{
  await page.addInitScript(()=>{localStorage.setItem('sj-elev-d','3');const orig=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return /webgl/.test(t)?null:orig.call(this,t,...a);};});
  await page.goto(route);await expect(page.locator('#scene-status')).toContainText('3D är inte tillgängligt',{timeout:60000});
  await page.locator('#predict input[name=trms]').fill('10');await page.locator('#predict input[name=avg]').fill('10');await page.locator('#predict button[type=submit]').click();
  await expect(page.locator('.erik-lines li')).toHaveCount(3);await page.locator('#skip').click();
  await expect(page.locator('.verdict')).toContainText('Rätt!');await fit(page);
});
