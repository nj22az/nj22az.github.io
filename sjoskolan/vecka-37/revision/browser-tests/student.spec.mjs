import {createRequire} from 'node:module';
const require=createRequire(new URL('../../../multimetersimulator/package.json',import.meta.url));
const {test,expect}=require('@playwright/test');
const path='/sjoskolan/vecka-37/revision/';
const predictions=['12 V','0 V','12 V','0 V','2 A','6,2 Ω'];
test('a beginner completes all six exercises using visible next actions',async({page},testInfo)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(path);await page.getByRole('link',{name:'3. Simulator',exact:true}).click();
 const work=page.locator('#dc-workspace');await expect(work).toBeVisible();
 // Rendering and fallback are recorded separately: a fallback is never called a 3D visual pass.
 await expect(page.locator('#lab-viewport')).not.toContainText('Förbereder');
 await testInfo.attach('3d-state',{body:await page.locator('#lab-viewport').innerText()+`\nCanvas count: ${await page.locator('#lab-viewport canvas').count()}`,contentType:'text/plain'});
 if(await page.locator('#lab-viewport canvas').count())await testInfo.attach('rendered-3d-bench',{body:await page.locator('#lab-viewport').screenshot(),contentType:'image/png'});
 for(let i=0;i<6;i++){
  await expect(work.locator('[data-setting="exercise"]')).toHaveValue(String(i));
  for(let n=0;await work.locator('[data-action="guided-step"]').count();n++){
   expect(n).toBeLessThan(20);await work.locator('[data-action="guided-step"]').click();
  }
  await work.locator('[data-action="go-measure"]').click();
  await page.getByLabel('Din förutsägelse, med enhet').fill(predictions[i]);
  await page.getByLabel('Varför väljer du denna mätning?').fill('Jag följer hela strömvägen och jämför de två mätpunkterna.');
  await page.getByRole('button',{name:'Avläs och spara mätningen',exact:true}).click();
  await expect(page.locator('#dc-result')).toContainText('Kontrollerat');
  await expect(page.locator('#dc-task')).toContainText(`${i+1} av 6`);
  await testInfo.attach(`exercise-${i+1}-instrument`,{body:await page.locator('.dc-instrument').screenshot(),contentType:'image/png'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  if(i<5)await work.locator('[data-action="next-exercise"]').click();
 }
 await expect(page.locator('#dc-continue')).toContainText('Övning 6');
 await expect(page.locator('#dc-log article')).toHaveCount(6);
 await page.locator('#dc-task').scrollIntoViewIfNeeded();
 await testInfo.attach('completed-workspace',{body:await page.screenshot(),contentType:'image/png'});
 await page.reload();await page.getByRole('link',{name:'3. Simulator',exact:true}).click();
 await expect(page.locator('#dc-task')).toContainText('6 av 6');
 await expect(page.locator('#dc-log article')).toHaveCount(6);
 expect(errors).toEqual([]);
});
test('probe lists, wrong units, protection recovery and original-week link remain usable',async({page})=>{
 await page.goto(path);await page.getByRole('link',{name:'3. Simulator',exact:true}).click();
 await page.getByLabel('Röd prob – mätpunkt').selectOption('loadPlus');await page.getByLabel('Svart prob – mätpunkt').selectOption('loadMinus');
 for(let n=0;await page.locator('[data-action="guided-step"]').count();n++){expect(n).toBeLessThan(20);await page.locator('[data-action="guided-step"]').click();}
 await page.getByLabel('Din förutsägelse, med enhet').fill('12 A');await page.getByLabel('Varför väljer du denna mätning?').fill('Jag provar enheten och rättar mitt misstag.');await page.getByRole('button',{name:'Avläs och spara mätningen',exact:true}).click();
 await expect(page.locator('#dc-result')).toContainText('rätt enhet');await expect(page.locator('[data-action="next-exercise"]')).toHaveCount(0);
 await page.getByLabel('Din förutsägelse, med enhet').fill('12 V');await page.getByRole('button',{name:'Avläs och spara mätningen',exact:true}).click();await expect(page.locator('#dc-result')).toContainText('Kontrollerat');
 await page.getByRole('button',{name:'Bryt matningen',exact:true}).click();await page.locator('[data-jack="a"]').click();await page.getByLabel('Röd prob – mätpunkt').selectOption('sourcePlus');await page.getByLabel('Svart prob – mätpunkt').selectOption('sourceMinus');await page.getByRole('button',{name:'Slå till matningen',exact:true}).click();
 await expect(page.locator('#dc-display')).toContainText('STOPP');await expect(page.locator('[data-action="guided-step"]')).toContainText('Lossa båda');await page.locator('[data-action="guided-step"]').click();await page.locator('[data-action="guided-step"]').click();await expect(page.locator('#dc-circuit-status')).not.toContainText('löst ut');
 await expect(page.locator('#dc-log article')).toHaveCount(2);
 await page.getByRole('link',{name:'Till första kursveckan',exact:true}).click();await expect(page).toHaveURL(/vecka-37\/aktuell\//);await expect(page.getByRole('link',{name:'Öppna den utökade genomgången och simulatorn',exact:true})).toBeVisible();
});
