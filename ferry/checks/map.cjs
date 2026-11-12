#!/usr/bin/env node
/**
 * Checks the deck plan on foot (ferry/map.js; the owner, 12 November 2026: "I miss a mini map sort of so I don't get lost
 * maybe based on the GA").
 *
 *     python3 -m http.server 8765        (in the site's root)
 *     node ferry/checks/map.cjs [http://localhost:8765/ferry/]
 *
 * The plans beside the model (data/plans.json, from blender/ga.py) hold every room the page has; on foot the small panel
 * is there, shows the plan of the deck one is on and lights its lamp, and follows one from deck to deck and as one turns;
 * pressed, or with M, the whole plan opens with a key for each deck; a room pressed is named, and "Go there" puts one in
 * it; Esc puts the plan away and does not leave the walk, and nobody walks under an open plan. On a phone the panel
 * stands clear of her name and of the bar, and a long deck is drawn large and moved along.
 *
 * Needs Playwright with Chromium (software rendering is enough). Exits non-zero if a check fails.
 */
const { chromium } = require('playwright');
const url = process.argv[2] || process.env.CHISUM_URL || 'http://localhost:8765/ferry/';
const fails = [];
const check = (ok, text) => { console.log((ok ? 'ok    ' : 'FAIL  ') + text); if (!ok) fails.push(text); };

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errors = [];
  const open = async (viewport, phone = false) => {
    const context = await browser.newContext({ viewport, hasTouch: phone, isMobile: phone });
    const page = await context.newPage();
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(url + '?map=' + Date.now());
    await page.waitForFunction(() => window.__ferry && document.body.classList.contains('ready') && window.__ferry.systems, null, { timeout: 180000 });
    return page;
  };
  const page = await open({ width: 1280, height: 800 });
  const frames = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  // how much of the small panel is lamp (amber) and how much is the room one is in (the accent over the deck), and a sum of all of it
  const panel = () => page.evaluate(() => {
    const c = document.querySelector('#map-mini canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let lamp = 0, lit = 0, sum = 0;
    for (let i = 0; i < d.length; i += 4) {
      sum = (sum * 31 + d[i] + 3 * d[i + 1] + 7 * d[i + 2]) % 1000000007;
      if (d[i] > 235 && d[i + 1] > 170 && d[i + 1] < 215 && d[i + 2] < 110) lamp++;
      if (d[i] < 70 && d[i + 1] > 95 && d[i + 1] < 135 && d[i + 2] > 90 && d[i + 2] < 130) lit++;
    }
    return { lamp, lit, sum };
  });

  // ---- the plans beside the model
  const data = await page.evaluate(async () => {
    const plans = await (await fetch('data/plans.json')).json(), f = window.__ferry;
    const rooms = new Set(f.spaces.map(s => s.deck + ':' + s.id)), drawn = new Set(plans.plans.flatMap(p => p.spaces.map(s => p.deck + ':' + s.id)));
    return { n: plans.plans.length, arrangement: plans.arrangement, rooms: rooms.size, drawn: drawn.size, missing: [...rooms].filter(r => !drawn.has(r)), plans: plans.plans.map(p => ({ id: p.id, deck: p.deck, name: p.name, yard: p.yard, spaces: p.spaces })), half: f.ship.length / 2 };
  });
  check(data.n === 7 && data.rooms > 100 && data.missing.length === 0 && data.drawn === data.rooms,
    `the arrangement beside the model (revision ${data.arrangement}) has ${data.n} plans, and each of the page's ${data.rooms} rooms is on one (${data.missing.slice(0, 3).join(', ') || 'all'})`);

  // ---- on foot in the wheelhouse
  await page.evaluate(() => { const f = window.__ferry; f.enterWalk(); f.travelTo('room:bridge:wheelhouse'); });
  await frames();
  let m = await page.evaluate(() => { const f = window.__ferry, b = document.querySelector('#map-mini').getBoundingClientRect(), bar = document.querySelector('#bar').getBoundingClientRect(); return { map: f.map, walk: f.state.walk, box: [b.left, b.top, b.right, b.bottom], bar: [bar.left, bar.top, bar.right, bar.bottom], w: innerWidth, h: innerHeight }; });
  let seen = await panel();
  check(m.map && m.map.plan === 'bridge' && m.map.room === 'wheelhouse' && Math.abs(m.map.yard - (m.walk.z + data.half)) < 1e-6 && Math.abs(m.map.x - m.walk.x) < 1e-6,
    `on foot in the wheelhouse the plan is the bridge deck's, the room the wheelhouse, and its lamp where one stands (${m.map && m.map.plan}, ${m.map && m.map.room}, ${m.map && m.map.yard.toFixed(1)} m from the transom)`);
  check(m.box[0] > m.w / 2 && m.box[1] >= 0 && m.box[2] <= m.w && m.box[3] < m.bar[1] && m.map.size[0] >= 150 && seen.lamp > 20 && seen.lit > 200,
    `the small panel stands top right, clear of the bar, ${m.map.size[0]} px wide, with its lamp lit and the room one is in lit (${seen.lamp} and ${seen.lit} points of the picture)`);
  const before = seen.sum;
  await page.evaluate(() => { const f = window.__ferry, w = f.state.walk; f.walkTo(w.x, w.z, Math.PI / 2, 0, w.y); });
  await frames();
  seen = await panel();
  check(seen.sum !== before, 'turning round turns the wedge the lamp throws (the panel is drawn again)');

  // ---- it follows from deck to deck
  const followed = await page.evaluate(async () => {
    const f = window.__ferry, out = [];
    for (const t of f.travels.filter(t => t.value.startsWith('deck:'))) {
      f.travelTo(t.value);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      out.push({ deck: t.value.slice(5), map: f.map.deck });
    }
    return out;
  });
  check(followed.length === 7 && followed.every(d => d.deck === d.map), `gone to each of her ${followed.length} decks, the panel shows that deck's plan (${followed.filter(d => d.deck !== d.map).map(d => d.deck + ' shown as ' + d.map).join(', ') || 'all'})`);

  // ---- the whole plan: opened by the panel, a room named and gone to
  await page.evaluate(() => window.__ferry.travelTo('room:bridge:wheelhouse'));
  await frames();
  await page.click('#map-mini');
  await frames();
  const sheet = () => page.evaluate(() => ({ hidden: document.querySelector('#chart').hidden, title: document.querySelector('#chart h2').textContent, said: document.querySelector('#chart .said').textContent,
    go: !document.querySelector('#chart footer .btn').hidden, keys: [...document.querySelectorAll('#chart .deck-key')].map(k => ({ name: k.textContent, on: k.getAttribute('aria-pressed') === 'true', here: k.classList.contains('here') })),
    map: window.__ferry.map, where: window.__ferry.whereOnFoot(), walking: !!window.__ferry.state.walk }));
  let s = await sheet();
  check(!s.hidden && s.title === 'Bridge deck' && s.keys.length === 7 && s.keys.filter(k => k.on).map(k => k.name).join() === 'Bridge deck' && s.keys.filter(k => k.here).map(k => k.name).join() === 'Bridge deck' && /Wheelhouse/.test(s.said),
    `pressed, the panel opens the whole plan of the deck one is on, with a key for each of her ${s.keys.length} decks ("${s.title}"; "${s.said}")`);
  // a press on a room of the plan drawn: its middle, by the plan's own place on its canvas
  const press = async (plan, room) => {
    const sp = data.plans.find(p => p.id === plan).spaces.find(q => q.id === room), f = (await sheet()).map.frame;
    const box = await page.locator('#chart .plan canvas').boundingBox();
    await page.mouse.click(box.x + f.x0 + ((sp.yard[0] + sp.yard[1]) / 2 - f.a) * f.k, box.y + f.H / 2 - (sp.x[0] + sp.x[1]) / 2 * f.k);
    await frames();
  };
  await press('bridge', 'chart-room');
  s = await sheet();
  check(s.map.picked === 'chart-room' && s.said === 'Chart room' && s.go, `a room pressed on the plan is named and can be gone to ("${s.said}")`);
  await page.click('#chart footer .btn');
  await frames();
  s = await sheet();
  check(s.hidden && /Chart room/.test(s.where) && s.map.room === 'chart-room', `"Go there" puts one in it and puts the plan away (${s.where})`);
  // another deck's plan, and a room of it
  await page.keyboard.press('m');
  await frames();
  await page.click('#chart .deck-key:text-is("Main deck")');
  await frames();
  s = await sheet();
  const shown = s.map.shown, hereKey = s.keys.filter(k => k.here).map(k => k.name).join();
  await press('main', 'vehicle-deck');
  await page.click('#chart footer .btn');
  await frames();
  s = await sheet();
  check(shown === 'main' && hereKey === 'Bridge deck' && s.hidden && /^Main deck/.test(s.where) && s.map.plan === 'main',
    `the key M opens it; another deck's key shows that deck while the lamp stays on one's own; a room of it is gone to (${s.where})`);
  // Esc puts it away and does not leave the walk; nobody walks under it
  await page.keyboard.press('m');
  await frames();
  const at0 = await page.evaluate(() => { const w = window.__ferry.state.walk; return [w.x, w.z]; });
  await page.keyboard.down('w'); await page.waitForTimeout(400); await page.keyboard.up('w');
  const at1 = await page.evaluate(() => { const w = window.__ferry.state.walk; return [w.x, w.z]; });
  await page.keyboard.press('Escape');
  await frames();
  s = await sheet();
  check(s.hidden && s.walking && Math.hypot(at1[0] - at0[0], at1[1] - at0[1]) < 1e-6, 'under the open plan nobody walks; Esc puts the plan away and one is still aboard');
  await page.close();

  // ---- on a phone
  const phone = await open({ width: 390, height: 844 }, true);
  await phone.evaluate(() => { const f = window.__ferry; f.enterWalk(); f.travelTo('deck:main'); });
  await phone.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const p1 = await phone.evaluate(() => {
    const r = q => { const b = document.querySelector(q).getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom]; };
    return { map: r('#map-mini'), title: r('header.title'), bar: r('#bar'), stick: r('#stick'), w: innerWidth };
  });
  const apart = (a, b) => a[2] <= b[0] || b[2] <= a[0] || a[3] <= b[1] || b[3] <= a[1];
  check(p1.map[2] <= p1.w && p1.map[0] >= p1.w * 0.4 && apart(p1.map, p1.title) && apart(p1.map, p1.bar) && apart(p1.map, p1.stick),
    `on a phone the panel stands in the right half of the screen, clear of her name, of the bar and of the thumb-stick (${Math.round(p1.map[2] - p1.map[0])} px wide)`);
  await phone.tap('#map-mini');
  await phone.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const p2 = await phone.evaluate(() => {
    const sheet = document.querySelector('#chart .sheet').getBoundingClientRect(), plan = document.querySelector('#chart .plan'), f = window.__ferry.map.frame, key = document.querySelector('#chart .deck-key[aria-pressed=true]').getBoundingClientRect();
    const lamp = f.x0 + (window.__ferry.map.yard - f.a) * f.k - plan.scrollLeft;
    return { sheet: [sheet.left, sheet.top, sheet.right, sheet.bottom], wide: plan.scrollWidth, shown: plan.clientWidth, k: f.k, lamp, key: [key.left, key.right], w: innerWidth, h: innerHeight };
  });
  check(p2.sheet[0] >= 0 && p2.sheet[2] <= p2.w && p2.sheet[3] <= p2.h && p2.wide > p2.shown * 2 && p2.k >= 7 && p2.lamp > 0 && p2.lamp < p2.shown && p2.key[0] >= 0 && p2.key[1] <= p2.w,
    `on a phone the whole plan fits the screen; a long deck is drawn ${p2.k.toFixed(0)} pixels to a metre and moved along (${p2.wide} px of plan in ${p2.shown}), beginning where one stands, with its deck's key in sight`);
  await phone.close();

  check(errors.length === 0, `no errors in the console (${errors.slice(0, 3).join(' | ') || 'none'})`);
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
