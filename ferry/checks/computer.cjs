// The chief engineer's computer: the maintenance program, on the Chisum's own page.
//
//   node ferry/checks/computer.cjs          (the site served on port 8765, or CHISUM_URL; the repository's root, not ferry/ alone:
//                                            the program is in maintenance-demo/, beside her)
//
// The owner, 12 November 2026: "Build a functional Maintenance PC and add it to the chief engineers cabin"; "Which has all parts
// and equipment onboard"; "It needs to have an ui, we are not going to a website we are still on the chisum , accessing the
// maintenance program is on the computer"; "We can have full screen but needs a clear button to leave and go back to the chisum";
// "We don't need the demo data , we have chisums data". Design record: ferry/yard/design/maintenance-computer.md.
//
// What is tried: a fitting's card offers its maintenance; the program opens over her, in her own page (the address does not
// change); it is the ship's program (everything of her list is in it, nothing of a sample workshop); one button, in sight and
// large enough for a thumb, goes back to her, and so does Escape, from the page and from inside the program; "Show on board"
// puts the program away and brings up the thing; and nobody walks while they sit at it.
const { chromium } = require('playwright');
const fails = [];
const check = (ok, text) => { console.log((ok ? 'ok    ' : 'FAIL  ') + text); if (!ok) fails.push(text); };
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  const url = (process.env.CHISUM_URL || 'http://localhost:8765/ferry/') + '?t=' + Date.now();
  await page.goto(url);
  await page.waitForFunction(() => window.__ferry && document.body.classList.contains('ready'), null, { timeout: 120000 });
  const list = await page.evaluate(async () => (await fetch('data/equipment.json')).json());
  check(list.format === 'chisum-equipment-1' && list.items.length >= 313 && new Set(list.items.map(i => i.id)).size === list.items.length,
    `her list of everything aboard is beside the model: ${list.items.length} items in ${list.systems.length} systems, each once`);

  // From a fitting's card to the program, at that fitting.
  const TAG = 'HYD-01';
  const before = await page.evaluate(tag => { const f = window.__ferry; f.systems.showComponent(tag); const b = document.querySelector('#card .maintain'); return { address: location.href, offered: b ? b.textContent : null, shut: !f.computerOpen }; }, TAG);
  check(before.offered === 'Maintenance' && before.shut, 'a fitting\'s card offers its maintenance, and the computer is not in the way until it is asked for');
  await page.click('#card .maintain');
  const frame = page.frameLocator('#computer-screen');
  await frame.locator('.v-strip').waitFor({ timeout: 30000 });
  const open = await page.evaluate(() => {
    const f = window.__ferry, back = document.querySelector('#computer-back'), box = back.getBoundingClientRect(), all = document.querySelector('#computer').getBoundingClientRect();
    const top = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return { open: f.computerOpen, address: location.href, text: back.textContent.trim(), box: [box.left, box.top, box.width, box.height], covers: all.width >= innerWidth && all.height >= innerHeight, onTop: top === back || back.contains(top), focus: document.activeElement === back };
  });
  check(open.open && open.address === before.address, 'the program opens over her in her own page: the address has not changed');
  check(open.covers && open.text === 'Back to the Chisum' && open.onTop && open.box[3] >= 44 && open.box[2] >= 150 && open.box[0] < 40 && open.box[1] < 40 && open.focus,
    `it fills the page, and one button is in sight at its top left, "${open.text}", ${Math.round(open.box[2])} by ${Math.round(open.box[3])} px, with the keys on it`);
  const item = await frame.locator('body').evaluate(() => ({ title: document.title, h1: document.querySelector('h1')?.textContent, strip: document.querySelector('.v-strip')?.innerText.replace(/\s+/g, ' '), brand: [...document.querySelectorAll('.app-brand-copy > *')].map(n => n.textContent), ways: [...document.querySelectorAll('.main-page-button,.office-return')].filter(n => getComputedStyle(n).display !== 'none').length }));
  check(item.h1 === list.items.find(i => i.id === TAG).name && /Hydraulic pump room/.test(item.strip) && /from the transom/.test(item.strip),
    `it is open at that fitting, and says where it is aboard ("${item.h1}": ${item.strip ? item.strip.replace(' Show on board', '') : '?'})`);
  check(/Johansson Co/.test(item.title) && /Johansson Co program/.test(item.brand[1] || '') && /Chisum/.test(item.brand[1] || '') && item.ways === 0,
    `it is a Johansson Co program, installed aboard her ("${item.brand.join(' / ')}"), and offers no way out of its own to the site`);

  // It is the ship's: everything aboard, and no sample workshop.
  await frame.locator('#nav a[href="#assets"]').click();
  await frame.locator('#v-results table').waitFor({ timeout: 15000 });                                // (the register's own rows: an item's card of papers is a table of the same kind)
  const reg = await frame.locator('body').evaluate(() => {
    const db = JSON.parse(localStorage.getItem('johansson-maintenance-vessel-chisum-v1'));
    return { rows: document.querySelectorAll('#v-results tbody tr:not(.v-group)').length, groups: document.querySelectorAll('#v-results tr.v-group').length, drawn: document.querySelectorAll('#v-results tbody svg.v-icon').length,
      assets: db.assets.length, sample: db.assets.filter(a => a.demo).length + db.tasks.filter(t => t.demo).length, tasks: db.tasks.length, offered: /Load demo|sample programme/i.test(document.body.innerText), workshop: localStorage.getItem('johansson-maintenance-public-demo-v1') };
  });
  check(reg.rows === list.items.length && reg.assets === list.items.length && reg.groups === list.systems.length && reg.drawn === reg.rows + reg.groups,
    `its register is her list: ${reg.rows} items in ${reg.groups} systems, each with its drawing`);
  check(reg.sample === 0 && !reg.offered && reg.workshop === null && reg.tasks > reg.assets * 0.8, `nothing of a sample workshop is in it or offered; ${reg.tasks} jobs are planned for what is aboard`);
  // Whose it is aboard (the owner: "We should be able to filter by department , deck, engine , galley").
  const want = list.departments.find(d => d.id === 'engine');
  await frame.locator('.v-dept[data-department="engine"]').click();
  const dept = await frame.locator('body').evaluate(() => ({ offered: [...document.querySelectorAll('.v-dept')].map(b => b.innerText.replace(/\s+/g, ' ').trim()), rows: document.querySelectorAll('#v-results tbody tr:not(.v-group)').length,
    systems: document.querySelectorAll('#v-systems .v-chip').length - 1, pressed: document.querySelector('.v-dept[aria-pressed="true"]')?.dataset.department, drawn: document.querySelectorAll('.v-dept svg.v-icon').length }));
  await frame.locator('.v-dept[data-department="all"]').click();
  const whole = await frame.locator('#v-results tbody tr:not(.v-group)').count();
  check(dept.offered.length === list.departments.length + 1 && dept.drawn === dept.offered.length && dept.rows === want.count && dept.pressed === 'engine' && dept.systems > 0 && dept.systems < list.systems.length && whole === list.items.length,
    `it is narrowed by department (${dept.offered.join(', ')}): Engine shows ${dept.rows} items in ${dept.systems} systems, and all departments ${whole} again`);
  await frame.locator('#v-search').fill('winch');
  const found = await frame.locator('.v-count').innerText();
  check(/^\d+ of \d+ items/.test(found), `a word finds what is aboard ("winch": ${found})`);

  // Her papers (the owner: "I want to be able to access drawings and installation instructions in the maintenance desk"): the
  // yard's sheets and instructions are in the program, a sheet is looked at inside it, and an item has the ones that are about it.
  await frame.locator('#nav a[href="#documents"]').click();
  await frame.locator('.v-register a[href^="#document/"]').first().waitFor({ timeout: 15000 });      // (the papers' own rows: the register's table is of the same kind, and was read for them)
  const lib = await frame.locator('body').evaluate(() => ({ rows: document.querySelectorAll('.v-register tbody tr:not(.v-group)').length, said: document.querySelector('.page-head p')?.textContent }));
  check(lib.rows === list.documents.length && lib.rows >= 20, `her papers are in it: ${lib.rows} sheets and papers (${lib.said})`);
  const sheet = list.documents.find(d => d.format === 'svg' && d.number === 'JS3-304' && d.sheet === '4');
  await frame.locator(`.v-register a[href="#document/${sheet.id}"]`).click();
  await frame.locator('#v-sheet img').waitFor({ timeout: 15000 });
  const seen = await frame.locator('#v-sheet img').evaluate(async img => { if (!img.complete) await new Promise(r => { img.onload = img.onerror = r; }); return { wide: img.naturalWidth, src: img.getAttribute('src'), title: document.querySelector('h1')?.textContent }; });
  const stay = await page.evaluate(() => ({ address: location.href, open: window.__ferry.computerOpen }));
  check(seen.wide > 800 && seen.src === sheet.file && stay.open && stay.address === before.address, `a sheet is looked at inside the program, still aboard (${sheet.number} sheet ${sheet.sheet}, "${seen.title}", ${seen.wide} px wide)`);
  const paper = list.documents.find(d => d.kind === 'Instruction');
  await frame.locator('a[href="#documents"]').first().click();
  await frame.locator(`.v-register a[href="#document/${paper.id}"]`).click();
  await frame.locator('#v-paper h3').first().waitFor({ timeout: 15000 });
  const read = await frame.locator('#v-paper').evaluate(el => ({ parts: el.querySelectorAll('h3').length, ways: el.querySelectorAll('a,script,img,iframe').length, words: el.innerText.length }));
  check(read.parts >= 10 && read.ways === 0 && read.words > 5000, `an instruction is read inside it as a page (${paper.id}: ${read.parts} sections), and nothing in it leads out`);
  await frame.locator('#nav a[href="#assets"]').click();
  await frame.locator('#v-results').waitFor({ timeout: 15000 });
  await frame.locator('#v-search').fill(TAG);
  await frame.locator(`.v-register a[href="#detail/v-${TAG}"]`).click();
  await frame.locator('.v-strip').waitFor({ timeout: 15000 });
  const own = await frame.locator('body').evaluate(() => { const c = [...document.querySelectorAll('.card')].find(x => x.querySelector('h2')?.textContent === 'Drawings and instructions'); return c ? [...c.querySelectorAll('tbody tr a')].map(a => a.getAttribute('href').replace('#document/', '')) : null; });
  const mine = list.items.find(i => i.id === TAG).docs;
  check(own && own.length === mine.length && own.every((id, n) => id === mine[n]) && own.length >= 5, `an item has the papers that are about it (${TAG}: ${own ? own.length : 0}, the ramp's four sheets and the power pack's instruction)`);

  // "Show on board": the program is put away and she brings the thing up.
  await frame.locator('#nav a[href="#assets"]').click();
  await frame.locator('#v-results').waitFor({ timeout: 15000 });
  await frame.locator('#v-search').fill(TAG);
  await frame.locator(`.v-register a[href="#detail/v-${TAG}"]`).click();
  await frame.locator('.v-strip button').click();
  await page.waitForFunction(() => !window.__ferry.computerOpen, null, { timeout: 5000 });
  const shown = await page.evaluate(() => ({ card: !document.querySelector('#card').hidden, tag: document.querySelector('#card .tag')?.textContent, address: location.href }));
  check(shown.card && shown.tag.startsWith(TAG) && shown.address === before.address, `"Show on board" puts the program away and brings up the fitting's card aboard (${shown.tag})`);

  // Escape goes back to her: from her page, and from inside the program; a dialog of the program's own keeps its Escape.
  await page.evaluate(() => window.__ferry.openComputer());
  await page.keyboard.press('Escape');
  const esc1 = await page.evaluate(() => window.__ferry.computerOpen);
  await page.evaluate(() => window.__ferry.openComputer());
  await frame.locator('#nav a[href="#overview"]').click();
  await frame.locator('.page-head h1', { hasText: 'Overview' }).waitFor({ timeout: 15000 });      // (its first page itself, not the page that was open before it)
  // (the owner: "we are not going to a website we are still on the chisum": what is in sight on its first page stays in the program)
  const outs = await frame.locator('body').evaluate(() => [...document.querySelectorAll('a[href]')].filter(a => !a.getAttribute('href').startsWith('#') && a.getClientRects().length).map(a => a.getAttribute('href')));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const esc2 = await page.evaluate(() => window.__ferry.computerOpen);
  check(esc1 === false && esc2 === false, 'Escape goes back to her, pressed on her page or inside the program');
  check(outs.length === 0, `on its overview nothing in sight leads out of the program to the site (${outs.length ? outs.join(', ') : 'no such link'})`);

  // Nobody walks while they sit at it, and they stand where they stood afterwards.
  const walk = await page.evaluate(async () => {
    const f = window.__ferry, half = f.ship.length / 2;
    f.enterWalk();
    f.walkTo(2.0, 20 - half, 0, 0, f.ship.decks.main);
    const at = { ...f.state.walk };
    f.openComputer();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w', bubbles: true }));
    for (let t = 0; t < 2; t += 0.1) f.walkFor(0.1);
    const sat = { ...f.state.walk };
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', key: 'w', bubbles: true }));
    document.querySelector('#computer-back').click();
    const after = { ...f.state.walk, open: f.computerOpen };
    f.leaveWalk();
    return { at, sat, after };
  });
  const same = (a, b) => Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.z - b.z) < 1e-6 && Math.abs(a.y - b.y) < 1e-6;
  check(same(walk.at, walk.sat) && same(walk.at, walk.after) && walk.after.open === false, 'nobody walks while they sit at it, and its button puts them back where they stood');

  // The computer itself, in the chief engineer's cabin: a tap on it sits one down at it.
  const pc = await page.evaluate(async () => {
    const f = window.__ferry;
    const r = await fetch('data/ferry.bin.gz'); const ds = new DecompressionStream('gzip');
    const buf = await new Response(r.body.pipeThrough(ds)).arrayBuffer(); const n = new DataView(buf).getUint32(4, true);
    const header = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, n)));
    const def = header.inputs.find(i => i.opens === 'maintenance');
    if (!def) return null;
    const space = f.spaces.find(sp => sp.id === 'chief-engineer');
    const inside = space && def.at[0] > space.min[0] && def.at[0] < space.max[0] && def.at[2] > space.min[2] && def.at[2] < space.max[2];
    const tapped = f.tap(def.id), open = f.computerOpen;
    document.querySelector('#computer-back').click();
    return { id: def.id, name: def.name, inside, tapped, open, fitting: def.fitting, known: !!(def.fitting && f.systems.comps.has(def.fitting)) };
  });
  check(pc && pc.inside && pc.tapped && pc.open && pc.known,
    pc ? `the computer stands in the chief engineer's suite (${pc.name}, the register's ${pc.fitting}), and a tap on it opens the program` : 'the computer stands in the chief engineer\'s suite, and a tap on it opens the program (the file names nothing that opens it: it is not built)');
  check(errors.length === 0, `no errors on the page (${errors.length ? errors.join('; ') : 'none'})`);
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed');
  await browser.close();
  process.exit(fails.length ? 1 : 0);
})();
