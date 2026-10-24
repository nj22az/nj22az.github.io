// Start a static server at repository root, then run with Playwright installed.
// BASE_URL defaults to http://127.0.0.1:8040. CHROMIUM_EXECUTABLE is optional.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? `${process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES}/playwright` : 'playwright'));
const base = process.env.BASE_URL || 'http://127.0.0.1:8040';
const week = '/sjoskolan/vecka-40/aktuell/';
const launch = () => chromium.launch({headless:true,
  ...(process.env.CHROMIUM_EXECUTABLE ? {executablePath:process.env.CHROMIUM_EXECUTABLE} : {}),
  args:process.env.CHROMIUM_SINGLE_PROCESS ? ['--no-sandbox','--no-zygote','--single-process'] : []});
const out = process.env.EVIDENCE_DIR || '/tmp/week40-student-path';
await mkdir(out,{recursive:true});
for (const [name,viewport,touch] of [['phone',{width:390,height:844},true],['desktop',{width:1440,height:1000},false]]) {
  const browser = await launch();
  try {
  const context = await browser.newContext({viewport,hasTouch:touch,isMobile:touch});
  const page = await context.newPage(), errors=[], failures=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
  const click = async locator => { await page.waitForTimeout(650); await locator.click(); };
  const checkWidth = async () => assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name}: horizontal overflow at ${page.url()}`);
  await page.goto(base+week);
  assert.match(await page.locator('#inlamning').innerText(),/söndag 4 oktober/);
  for(let i=1;i<=3;i++) {
    await click(page.locator(`a[href="Del_${i}.html"]`).first());
    await page.locator('[id^="teori-"]').first().waitFor();
    await checkWidth();
    await page.goto(base+week);
  }
  await page.goto(base+week+'Genomgang.html?del=sinus&uppgift=v40_01-q1');
  await page.locator('#answer-0').fill('0,020');
  await page.locator('#answer-1').fill('20');
  await click(page.locator('#answer-form button[type="submit"]'));
  assert.equal(await page.locator('#exercise-status').innerText(),'Rätt svar');
  await page.reload();
  assert.equal(await page.locator('#answer-0').inputValue(),'0,020');
  await page.goto(base+week);
  await click(page.locator('a[href="Inlamning.html"]').first());
  await page.locator('.mina-svar input').first().waitFor();
  const D=await page.evaluate(()=>Number(localStorage.getItem('sj-elev-d')));
  assert.ok(D>=1&&D<=31);
  const student=D===19?'Erik Johansson':'Anna Svensson';
  const values={u1_top:(10+D)*Math.sqrt(2),u1_upp:2*(10+D)*Math.sqrt(2),u1_T:1000/(D%2?50:60)};
  values.u1_topL=values.u1_top; values.u1_TL=values.u1_T;
  values.u2_XL=2*Math.PI*50*.1;values.u2_Z=Math.hypot(20+D,values.u2_XL);
  values.u2_I=230/values.u2_Z;values.u2_fi=Math.atan(values.u2_XL/(20+D))*180/Math.PI;
  values.u2_I100=230/Math.hypot(20+D,2*values.u2_XL);
  const P=1+D/10;
  values.u3_S=P/.7;values.u3_Q=Math.sqrt(values.u3_S**2-P**2);values.u3_I=values.u3_S*1000/230;
  values.u3_QC=values.u3_Q-Math.sqrt((P/.95)**2-P**2);values.u3_Iny=P*1000/(.95*230);
  values.u3_forl=100*(values.u3_Iny/values.u3_I)**2;
  for(const [k,v] of Object.entries(values)) await page.locator(`.mina-svar input[name="${k}"]`).fill(v.toFixed(4).replace('.',','));
  await page.reload();
  assert.equal(await page.locator('.mina-svar input').count(),16);
  for(const [k,v] of Object.entries(values)) assert.ok(Math.abs(Number((await page.locator(`input[name="${k}"]`).inputValue()).replace(',','.'))-v)<.0001,k+' reload');
  await checkWidth();
  const number=async(k,v)=>page.locator(`#ctl-${k}-n`).fill(String(v));
  const reading=async(label)=>Number((await page.locator('#readouts > div').filter({has:page.locator('dt',{hasText:new RegExp(`^${label}$`)})}).locator('strong').innerText()).replace(/\s/g,'').replace(',','.').replace(/[^0-9.-].*$/,''));
  const checkReading=async(label,expected)=>{
    const actual=await reading(label);
    // The simulator displays three significant figures, capped at four decimals.
    const tolerance=.5*10**Math.max(-4,Math.floor(Math.log10(Math.abs(expected)))-2)+1e-9;
    assert.ok(Math.abs(actual-expected)<=tolerance,`${label}: ${actual}, expected ${expected} within display precision ${tolerance}`);
  };
  for(const [task,tab] of [[1,'sinus'],[2,'impedans'],[3,'effekt']]) {
    await click(page.locator(`#uppgift-${task} a[href*="lage=fri"]`));
    await page.locator('#controls input').first().waitFor();
    if(tab==='sinus') {
      await page.locator('#ctl-shape').selectOption('sinus');await number('urms',10+D);await number('f',D%2?50:60);
      assert.ok((await page.locator('#readouts').innerText()).includes(values.u1_top.toFixed(2).replace('.',',')));
    } else if(tab==='impedans') {
      await page.locator('#ctl-kind').selectOption('RL');
      for(const [k,v] of Object.entries({U:230,f:50,R:20+D,L:100})) await number(k,v);
      await checkReading('I',values.u2_I);
      await number('f',100);
      await checkReading('I',values.u2_I100);
    } else {
      for(const [k,v] of Object.entries({U:230,P:P*1000,pf:.7,Qc:values.u3_QC*1000})) await number(k,v);
      assert.match(await page.locator('#readouts').innerText(),/0,950/);
      await checkReading('I efter',values.u3_Iny);
    }
    await checkWidth();await page.goto(base+week+'Inlamning.html');
    await page.locator('.mina-svar input').first().waitFor();
  }
  await page.goto(base+week);
  await click(page.locator('a[href="../../vecka-38/aktuell/Inlamning.html"]').first());
  await page.locator('#elevnamn').fill(student);
  const nameD=await page.evaluate(async student=> (await import('/sjoskolan/gemensamt/elevtal.mjs?v=20260930')).elevtal(student),student);
  assert.notEqual(nameD,D);
  assert.match(await page.locator('.week-note').innerText(),/ett annat tal/);
  assert.match(await page.locator('#elevtal').innerText(),new RegExp(`D = ${nameD}`));
  assert.equal(await page.evaluate(()=>Number(localStorage.getItem('sj-elev-d'))),D);
  await page.reload();
  assert.equal(await page.locator('#elevnamn').inputValue(),student);
  await page.goto(base+week);
  await click(page.locator('#labb a'));
  await page.locator('#guide-predict').waitFor();
  const tasks=await page.evaluate(async D=>{const m=await import('/sjoskolan/vaxelstromslabbet/guided-lessons.mjs?v=20260930');return m.GUIDE_TASKS.map(t=>{t=m.personligUppgift(t,D);return {id:t.id,lesson:t.lesson,fields:t.fields,values:m.guideValues(t)};});},D);
  assert.equal(tasks.length,8);
  for(const [i,t] of tasks.entries()) {
    assert.equal(await page.locator('#guide-task').inputValue(),t.id);
    // Open the student's actual theory reference and verify its target exists.
    const ref=await page.locator('.guide-support a').getAttribute('href');
    const theory=await context.newPage(); await theory.goto(new URL(ref,page.url()).href);
    assert.equal(await theory.locator(new URL(theory.url()).hash).count(),1,t.id+' theory target'); await theory.close();
    for(const [k] of t.fields) await page.locator(`#guide-predict input[name="${k}"]`).fill((i===2?1:t.values[k]).toFixed(2).replace('.',','));
    await click(page.locator('#guide-predict button[type="submit"]'));
    if(i===2) {
      assert.match(await page.locator('.guide-verdict').innerText(),/skiljer/);
      await click(page.locator('#guide-revise'));
      for(const [k] of t.fields) await page.locator(`#guide-predict input[name="${k}"]`).fill(t.values[k].toFixed(2).replace('.',','));
      await click(page.locator('#guide-predict button[type="submit"]'));
    }
    assert.match(await page.locator('.guide-verdict').innerText(),/Rätt!/);
    await click(page.locator('#guide-explain'));
    await page.locator('textarea[name="explanation"]').fill(`Provanteckning för ${t.id}: jämför beräkning och simulerad avläsning.`);
    await click(page.locator('#guide-save'));
    await checkWidth();
    await page.reload();
    assert.match(await page.locator('textarea[name="explanation"]').inputValue(),/Provanteckning/);
    assert.match(await page.locator('.guide-d').innerText(),new RegExp(`D = ${D}`));
    await click(page.locator('#guide-next'));
  }
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('sjoskolan-ac-grund-v3')));
  assert.equal(stored.D,D); assert.equal(Object.keys(stored.rows).length,8);
  assert.equal(stored.rows[tasks[2].id].attempts,2);assert.equal(stored.rows[tasks[2].id].first.peak,1);
  await click(page.locator('.guide-skicka'));
  await page.locator('#res-lage').waitFor();
  assert.match(await page.locator('#res-lage').innerText(),/16 av 16/);
  assert.match(await page.locator('#res-lage').innerText(),/8 av 8/);
  assert.equal(await page.locator('#res-namn').inputValue(),student);
  await page.locator('#res-namn').fill(student);
  await page.evaluate(()=>{const original=window.qrcode;window.qrcode=(...args)=>{const q=original(...args),add=q.addData.bind(q);q.addData=(text,...rest)=>{window.__resultQR=text;return add(text,...rest);};return q;};});
  await click(page.locator('#res-form button'));
  await page.locator('#res-ut svg').waitFor();
  const result=await page.evaluate(async()=>{const m=await import('./resultat.mjs?v=20260928-nr');return {decoded:await m.avkoda(window.__resultQR.split('#r=')[1])};});
  assert.equal(result.decoded.d,D);assert.equal(result.decoded.g.length,8);
  assert.equal(result.decoded.n,student);assert.equal(result.decoded.o[0]&1,1);
  assert.equal(result.decoded.g.filter(r=>r[2]&&r[3]).length,8);
  assert.equal(Object.keys(result.decoded.s).length,16);assert.ok(!('gd' in result.decoded));
  for(const [key,v] of Object.entries(values)) assert.equal(result.decoded.s[key],Number(Number(v.toFixed(4)).toPrecision(5)),key+' QR value');
  tasks.forEach((t,i)=>{
    assert.equal(result.decoded.g[i][0],stored.rows[t.id].attempts);
    assert.deepEqual(result.decoded.g[i][1],t.fields.map(([k])=>Number(Number(stored.rows[t.id].first[k]).toPrecision(5))));
    assert.equal(result.decoded.g[i][3],stored.rows[t.id].explanation);
  });
  await checkWidth(); await page.screenshot({path:`${out}/${name}-result.png`,fullPage:true});
  await page.reload(); await click(page.locator('#res-form button')); await page.locator('#res-ut svg').waitFor();
  assert.match(await page.locator('.vem').innerText(),new RegExp(`D = ${D}`));
  assert.deepEqual(errors,[],`${name}: script errors`);assert.deepEqual(failures,[],`${name}: failed responses`);
  console.log(`PASS ${name}: theory targets, theory exercise, own-value sinus/RL/power measurements, eight tasks, corrected prediction, 16 submission answers, distinct name D, actual QR payload, reloads, width; D=${D}, name D=${nameD}`);
  await context.close();
  } finally {await browser.close();}
}
