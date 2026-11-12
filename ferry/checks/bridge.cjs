#!/usr/bin/env node
/**
 * Checks of the page for the navigation bridge and her systems register: that the page reads both, that every component of
 * the register is found where the model has it, that the walker gets into and about the wheelhouse as a person would, and
 * that each board, circuit, net and pipe can be shown.
 *
 *     python3 -m http.server 8765        (in the site's root)
 *     node ferry/checks/bridge.cjs [http://localhost:8765/ferry/]
 *
 * Needs Playwright with Chromium (software rendering is enough). Exits non-zero if a check fails.
 */
const { chromium } = require('playwright');
const url = process.argv[2] || process.env.CHISUM_URL || 'http://localhost:8765/ferry/';
// The bridge is measured in its own terms (metres from the first Chisum's transom, where it was designed: blender/bridge_place.py).
// SHIFT carries those aboard her, HALF is half her length, DECK the bridge deck over her waterline, TOP the compass deck,
// WING where the inner face of a wing's end bulwark stands off her centre line. All five are the file's own (its `ship`:
// length and bridge), read when the page has opened: a ship of another size needs no change here.
let SHIFT, HALF, DECK, TOP, WING;
const Z = yard => yard + SHIFT - HALF;     // the bridge's measure along her → the ship's z
const B = z => z + HALF - SHIFT;           // and back, for what is said
const fails = [];
const check = (ok, text) => { console.log((ok ? 'ok    ' : 'FAIL  ') + text); if (!ok) fails.push(text); };

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errors = [];
  const open = async viewport => {
    const page = await browser.newPage({ viewport });
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(url + '?check=' + Date.now());
    await page.waitForFunction(() => window.__ferry && document.body.classList.contains('ready') && window.__ferry.systems, null, { timeout: 180000 });
    return page;
  };
  const page = await open({ width: 1400, height: 900 });
  ({ SHIFT, HALF, DECK, TOP, WING } = await page.evaluate(() => { const s = window.__ferry.ship; return { SHIFT: s.bridge.shift, HALF: s.length / 2, DECK: s.bridge.deck, TOP: s.bridge.top, WING: s.bridge.wing }; }));
  check([SHIFT, HALF, DECK, TOP, WING].every(Number.isFinite), `the file says where her bridge stands: ${SHIFT} m forward of where it was designed, its deck ${DECK} m and the compass deck ${TOP} m over the waterline, the wings out to ${WING} m`);

  // ---- the register is read, and the model has its components
  const reg = await page.evaluate(() => {
    const d = window.__ferry.systems.data;
    return { n: d.components.length, boxed: d.components.filter(c => c.box).length, missing: d.components.filter(c => !c.box).map(c => c.id),
             boards: d.boards.length, ways: d.boards.reduce((n, b) => n + b.circuits.length, 0), nets: d.nets.length, pipes: d.pipes.length,
             over: d.boards.flatMap(b => b.circuits.filter(k => k.total > (b.kind === 'DC' ? 10 : 6)).map(k => `${b.id} ${k.no}`)) };
  });
  check(reg.n >= 140, `the register holds ${reg.n} components, ${reg.boards} boards with ${reg.ways} ways, ${reg.nets} nets, ${reg.pipes} pipes`);
  check(reg.missing.length <= 1, `${reg.boxed} of them have a place in the model (without one: ${reg.missing.join(', ') || 'none'})`);
  check(reg.over.length === 0, `no way loses more voltage than the rule allows (${reg.over.join(', ') || 'none over'})`);

  // ---- every component that answers a tap is found at the middle of its own box, or by something standing in front of it
  const found = await page.evaluate(() => {
    const s = window.__ferry.systems, bad = [];
    let n = 0;
    for (const c of s.data.components) {
      if (!c.pick || !c.box) continue;
      n++;
      const mid = { x: (c.box[0][0] + c.box[1][0]) / 2, y: (c.box[0][1] + c.box[1][1]) / 2, z: (c.box[0][2] + c.box[1][2]) / 2 };
      const got = s.pick(c.part || 'bridge', mid);
      if (!got) bad.push(c.id + ' (nothing)');
      else if (got.id !== c.id) {
        const vol = b => (b[1][0] - b[0][0]) * (b[1][1] - b[0][1]) * (b[1][2] - b[0][2]);
        if (vol(got.box) > vol(c.box)) bad.push(`${c.id} (found ${got.id}, a larger one)`);
      }
    }
    return { n, bad };
  });
  check(found.bad.length === 0, `${found.n} components answer at their own place (${found.bad.join('; ') || 'all'})`);

  // ---- each board, way, net, pipe and subsystem can be shown
  const shown = await page.evaluate(() => {
    const s = window.__ferry.systems, d = s.data, bad = [];
    let n = 0;
    const tryShow = (kind, id) => { n++; try { s.clear(); const got = s.show(kind, id, { fly: false }); if (!got) bad.push(`${kind} ${id}`); } catch (e) { bad.push(`${kind} ${id}: ${e.message}`); } };
    for (const b of d.boards) { tryShow('board', b.id); for (const k of b.circuits) tryShow('circuit', `${b.id}:${k.no}`); }
    for (const k of d.outside) tryShow('circuit', `${k.board}:${k.no}`);
    for (const x of d.nets) tryShow('net', x.id);
    for (const x of d.pipes) tryShow('pipe', x.id);
    for (const x of d.subsystems) tryShow('sub', x.id);
    s.clear();
    return { n, bad };
  });
  check(shown.bad.length === 0, `${shown.n} boards, ways, nets, pipes and subsystems are shown (${shown.bad.join('; ') || 'all'})`);

  // ---- a card says what feeds a component
  const card = await page.evaluate(() => { window.__ferry.systems.showComponent('NAV-01', { fly: false }); const t = document.querySelector('#card').innerText; window.__ferry.systems.clear(); return t; });
  check(/Radar display/.test(card) && /BD2 way 1/.test(card) && /230 V/.test(card) && /Navigation data/.test(card) && !/null|undefined/.test(card), 'the radar\'s card names its supply (BD2 way 1, 230 V) and its nets');

  // ---- on foot
  const walk = async (x, yard, yaw, seconds, key = 'KeyW') => page.evaluate(([x, z, yaw, seconds, key, DECK]) => {
    const f = window.__ferry;
    if (!f.state.walk) f.enterWalk();
    const y = f.walkTo(x, z, yaw, 0, DECK);
    f.hold(key, true);
    for (let t = 0; t < seconds; t += 0.1) { f.workAuto(0.1); f.walkFor(0.1); }
    f.hold(key, false);
    const w = f.state.walk;
    return { y0: y, x: w.x, y: w.y, z: w.z, room: f.whereOnFoot() };
  }, [x, Z(yard), yaw, seconds, key, DECK]);
  const AHEAD = Math.PI, PORT = -Math.PI / 2, STBD = Math.PI / 2, ASTERN = 0;

  let w = await walk(0, 18.0, AHEAD, 2.6);
  check(w.y0 !== null && w.z > Z(20.0) && /Wheelhouse/i.test(w.room), `from the chart room through its door into the wheelhouse (${B(w.z).toFixed(2)} m in the bridge's own measure, "${w.room}")`);
  w = await walk(0, 20.4, AHEAD, 3);
  check(w.z < Z(21.5) && w.z > Z(20.9), `the steering stand and its wheel stop one (${B(w.z).toFixed(2)} m)`);
  w = await walk(1.7, 21.6, AHEAD, 3);
  check(w.z < Z(22.30) - 0.1 && w.z > Z(21.9), `the console stops one (${B(w.z).toFixed(2)} m; its after face is at 22.30)`);
  w = await walk(1.5, 20.85, PORT, 3);
  check(w.x > 3.2 && w.x < WING && /wing|wheelhouse/i.test(w.room), `through the port door, over its sill, onto the wing (x ${w.x.toFixed(2)}, "${w.room}")`);
  w = await walk(WING - 0.94, 20.85, PORT, 2);
  check(w.x > WING - 0.54 && w.x < WING - 0.09, `the wing is carried to her side, and its bulwark holds one in (x ${w.x.toFixed(2)}; the bulwark's inner face is at ${WING})`);
  w = await walk(-1.5, 20.85, STBD, 3);
  check(w.x < -3.2 && w.x > -WING && /wing|wheelhouse/i.test(w.room), `through the starboard door onto the wing (x ${w.x.toFixed(2)}, "${w.room}")`);
  w = await walk(6.0, 20.2, ASTERN, 2);           // abaft the wing the bridge deck is open, each side of the house
  check(w.z < Z(19.4), `from the port wing aft, off it at its open end onto the bridge deck (${B(w.z).toFixed(2)} m)`);
  w = await walk(2.0, 21.7, PORT, 2);
  check(w.x < 2.6, `the port wall and the log desk stop one (x ${w.x.toFixed(2)})`);
  w = await walk(-2.5, 20.9, ASTERN, 3);
  check(w.y < DECK - 2.0 && w.z < Z(17.8), `through the gate at the head of the crew stair and down it to the deck below (${B(w.z).toFixed(2)} m, ${w.y.toFixed(2)} m up, "${w.room}")`);
  w = await walk(-1.5, 20.9, ASTERN, 3);
  check(w.z > Z(20.14), `the chart table stops one (${B(w.z).toFixed(2)} m; its front is at 20.15)`);
  w = await walk(0, 21.0, ASTERN, 2.5);
  check(w.z < Z(19.4) && /chart room/i.test(w.room), `and back out through the door into the chart room (${B(w.z).toFixed(2)} m, "${w.room}")`);

  // the house top and the compass deck are one level: from the house top forward onto the compass deck, between the two rails' ends
  const roof = await page.evaluate(([z, TOP]) => {
    const f = window.__ferry;
    if (!f.state.walk) f.enterWalk();
    const y0 = f.walkTo(1.8, z, Math.PI, 0, TOP);
    f.hold('KeyW', true);
    for (let t = 0; t < 2.0; t += 0.1) f.walkFor(0.1);
    f.hold('KeyW', false);
    const w = f.state.walk;
    return { y0, y: w.y, z: w.z, room: f.whereOnFoot() };
  }, [Z(18.4), TOP]);
  check(roof.y0 !== null && Math.abs(roof.y0 - TOP) < 0.03 && Math.abs(roof.y - TOP) < 0.03 && roof.z > Z(19.6),
    `from the house top forward onto the compass deck, level with it (${roof.y0 === null ? 'no floor' : roof.y0.toFixed(2)} to ${roof.y.toFixed(2)} m up, ${B(roof.z).toFixed(2)} m from the transom, "${roof.room}")`);

  // a tap on foot names what is tapped
  const named = await page.evaluate(([z, DECK]) => {
    const f = window.__ferry;
    f.walkTo(-1.05, z, Math.PI, -0.42, DECK);
    return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => {
      const c = document.querySelector('canvas').getBoundingClientRect();
      f.nameOnFoot(c.left + c.width / 2, c.top + c.height / 2);
      r({ id: f.systems.state.component, card: !document.querySelector('#card').hidden });
    })));
  }, [Z(21.9), DECK]);
  check(named.id && named.card, `on foot, a tap on what is ahead of the watch officer's chair names it (${named.id})`);
  await page.evaluate(() => { window.__ferry.systems.clear(); window.__ferry.leaveWalk(); });

  // ---- the levers: a tap moves one a notch, at the console and on both wings together; the wheel follows the rudder
  const lever = await page.evaluate(async ([z, zl, DECK]) => {
    const f = window.__ferry, L = f.look;
    f.enterWalk();
    f.walkTo(0.85, z, Math.PI, -0.6, DECK);          // beside the stand, where a walker can stand upright
    f.walkFor(0.5);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const grip = new L.camera.position.constructor(0.458, DECK + 1.17, zl).project(L.camera);
    const c = document.querySelector('canvas').getBoundingClientRect();
    f.nameOnFoot(c.left + (grip.x + 1) / 2 * c.width, c.top + (1 - grip.y) / 2 * c.height);
    const said = document.querySelector('#what').textContent;
    await new Promise(r => setTimeout(r, 1500));
    const deg = (m, a, b) => Math.atan2(m[a], m[b]) * 180 / Math.PI;
    const turned = f.movers().filter(m => m.input === 'lever-engine-p').map(m => [m.id, deg(m.matrix, 6, 5)]);
    f.setInput('rudder', 20);
    const wheel = deg(f.movers().find(m => m.id === 'wheel').matrix, 1, 0);
    f.setInput('rudder', 0);
    const all = f.movers();
    const worked = ['lever-engine-p', 'lever-engine-s', 'lever-thruster', 'tiller'].map(id => f.control(id)).filter(k => k && k.steps && k.fitting);
    return { said, card: f.systems.state.component, at: f.control('lever-engine-p').at, turned, wheel, n: all.length, worked: worked.length };
  }, [Z(22.0), Z(22.60), DECK]);
  const mark = 16.26;
  check(lever.said === 'Port engine lever: slow ahead' && lever.card === 'PRP-01' && lever.at === 4,
    `on foot, a tap on the port engine lever moves it a notch and shows its card ("${lever.said}", ${lever.card})`);
  check(lever.turned.length === 3 && lever.turned.every(([, a]) => Math.abs(a - mark) < 0.05),
    `the same lever at the console and on both wings has turned ${mark}° in its slot (${lever.turned.map(([id, a]) => `${id} ${a.toFixed(2)}`).join(', ')})`);
  check(Math.abs(lever.wheel - 80) < 0.05 && lever.worked === 4, `the wheel turns four degrees for one of rudder (${lever.wheel.toFixed(1)}° at 20°); ${lever.worked} controls are worked by a tap, ${lever.n} parts move`);
  await page.evaluate(() => { window.__ferry.systems.clear(); window.__ferry.leaveWalk(); });

  // ---- a phone
  const phone = await open({ width: 390, height: 844 });
  const small = await phone.evaluate(() => {
    const f = window.__ferry;
    f.setPanel(true); f.showTab('systems');
    f.systems.show('board', 'DC1', { fly: false });
    const wide = document.documentElement.scrollWidth > innerWidth + 1;
    const panel = document.querySelector('#panel').getBoundingClientRect(), tab = document.querySelector('#tab-systems').getBoundingClientRect();
    f.systems.showComponent('COM-01', { fly: false });
    return new Promise(r => setTimeout(() => {
      const card = document.querySelector('#card').getBoundingClientRect(), bar = document.querySelector('#bar').getBoundingClientRect();
      r({ wide, tabH: tab.height, panelW: panel.width, card: { left: card.left, right: card.right, bottom: card.bottom, top: card.top }, barTop: bar.top, ways: document.querySelectorAll('#systems .way').length });
    }, 700));
  });
  check(!small.wide && small.tabH >= 44, `on a phone the page is not wider than the screen and the tabs are ${Math.round(small.tabH)} px high`);
  check(small.card.left >= 0 && small.card.right <= 390 && small.card.bottom <= small.barTop + 1 && small.card.top >= 0, `on a phone the card stands over the bar, inside the screen (${Math.round(small.card.top)} to ${Math.round(small.card.bottom)} px, the bar at ${Math.round(small.barTop)})`);

  check(errors.length === 0, `no errors in the console (${errors.slice(0, 3).join(' | ') || 'none'})`);
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed');
  process.exit(fails.length ? 1 : 0);
})();
