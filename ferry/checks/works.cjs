#!/usr/bin/env node
/**
 * Checks that what is worked on the navigation bridge works (the owner, 11 November 2026: "Every lever everything needs to be
 * interactive"; "I want everything to be interactive in the bridge"; "a transparent coffe can we can animate with coffee").
 *
 *     python3 -m http.server 8765        (in the site's root)
 *     node ferry/checks/works.cjs [http://localhost:8765/ferry/]
 *
 * Each thing is worked as a tap works it and must do what it is for: the wipers sweep and park, by a tap and by their
 * switches; the clear-view screens spin and stop; each pilot chair runs on its rail and turns on its pedestal; every drawer
 * runs out; every cabinet door, locker door and lid opens; the handsets lift; the sun blinds are drawn down and their film
 * with them; the whistle pull is drawn and the valve's lever goes over; the dimmers put the night lights and the chart lamp
 * on and out and darken the displays; and the coffee: the jug fills while the machine is on and empties while it is poured.
 * Then on foot: a tap on a cabinet door, on the telephone and on a clear-view screen works each.
 *
 * Needs Playwright with Chromium (software rendering is enough). Exits non-zero if a check fails.
 */
const { chromium } = require('playwright');
const url = process.argv[2] || process.env.CHISUM_URL || 'http://localhost:8765/ferry/';
let SHIFT, DECK;                      // where the bridge stands in the ship: the file says (ship.bridge), as bridge.cjs reads it
const fails = [];
const check = (ok, text) => { console.log((ok ? 'ok    ' : 'FAIL  ') + text); if (!ok) fails.push(text); };

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(url + '?works=' + Date.now());
  await page.waitForFunction(() => window.__ferry && document.body.classList.contains('ready') && window.__ferry.systems, null, { timeout: 180000 });
  ({ SHIFT, DECK } = await page.evaluate(() => ({ SHIFT: window.__ferry.ship.bridge.shift, DECK: window.__ferry.ship.bridge.deck })));
  // The helpers every check below uses, in the page: a mover's matrix, how far it is from where it rests, the angle it has turned.
  await page.evaluate(() => {
    const f = window.__ferry;
    window.T = {
      m: id => f.movers().find(m => m.id === id),
      off: id => { const m = f.movers().find(m => m.id === id); return m ? m.matrix.reduce((s, v, i) => s + Math.abs(v - (i % 5 === 0 ? 1 : 0)), 0) : null; },
      turned: id => { const m = f.movers().find(m => m.id === id).matrix; return Math.acos(Math.max(-1, Math.min(1, (m[0] + m[5] + m[10] - 1) / 2))) * 180 / Math.PI; },
      moved: id => { const m = f.movers().find(m => m.id === id).matrix; return [m[12], m[13], m[14]]; },
      run: s => { for (let t = 0; t < s - 1e-9; t += 0.1) { f.workAuto(0.1); f.workSteps(0.1); } },
      work: (id, open, s = 1.2) => { f.work(id, open); for (let t = 0; t < s - 1e-9; t += 0.1) { f.workAuto(0.1); f.workSteps(0.1); } },
    };
  });
  const header = await page.evaluate(async () => {
    const r = await fetch('data/ferry.bin.gz'); const ds = new DecompressionStream('gzip');
    const buf = await new Response(r.body.pipeThrough(ds)).arrayBuffer(); const n = new DataView(buf).getUint32(4, true);
    const h = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, n)));
    return { inputs: h.inputs, movers: h.movers };
  });
  const bridge = header.inputs.filter(i => /^(console-door|locker-door|chart-drawer|table-drawer|handset|blind|wiper|clear-view|chair|whistle|binocular|coffee|dimmer|pantry|cooler)/.test(i.id));
  const taps = bridge.filter(i => i.auto === 'tap'), steps = bridge.filter(i => i.steps), levels = bridge.filter(i => i.level);
  check(taps.length >= 40 && steps.length === 6 && levels.length === 1,
    `the bridge has ${taps.length} things worked by a tap, ${steps.length} rotary switches and ${levels.length} thing that fills and empties (besides her levers, doors and gate)`);

  // ---- every door, drawer, lid and handset of the bridge opens to a tap and shuts again
  const opened = await page.evaluate(ids => ids.map(id => { T.work(id, true); const open = T.off(id); T.work(id, false); return { id, open, shut: T.off(id) }; }),
    taps.filter(i => !i.run && !/^coffee/.test(i.id)).map(i => i.id));
  const stuck = opened.filter(d => !(d.open > 0.05) || !(d.shut < 1e-6));
  const count = re => opened.filter(d => re.test(d.id)).length;
  check(stuck.length === 0, `each of them moves when it is worked and comes back: ${count(/^console-door/)} console doors, ${count(/^locker-door/)} locker doors, ` +
    `${count(/drawer/)} drawers, ${count(/^handset/)} handsets, ${count(/^blind-\d$/)} blinds, the binocular box, the whistle pull, the pantry (${stuck.map(d => d.id).join(', ') || 'none stuck'})`);

  // ---- the wipers: a tap starts one sweeping, another parks it; its switch on the console does the same
  const wiper = await page.evaluate(async () => {
    const f = window.__ferry, a = [];
    f.work('wiper-centre', true);
    for (let k = 0; k < 6; k++) { T.run(0.3); a.push(T.turned('wiper-centre')); }
    T.work('wiper-centre', false, 1.5);
    const parked = T.off('wiper-centre');
    const said = f.step('wiper-switch-port');                     // the port wiper's switch, a step: intermittent
    T.run(0.5);
    const bySwitch = T.turned('wiper-port'), other = T.off('wiper-starboard');
    f.step('wiper-switch-port'); f.step('wiper-switch-port'); f.step('wiper-switch-port');      // on, back to intermittent, off
    T.run(1.5);
    return { a, parked, said: said && said.say, bySwitch, other, off: T.off('wiper-port'), at: f.control('wiper-switch-port').at };
  });
  check(Math.max(...wiper.a) > 40 && Math.max(...wiper.a) <= 62.01 && new Set(wiper.a.map(v => v.toFixed(1))).size > 3 && wiper.parked < 1e-6,
    `the centre wiper sweeps to and fro when it is tapped (${wiper.a.map(v => v.toFixed(0)).join(', ')}° in turn; never past 62°) and parks when it is tapped again`);
  check(wiper.said === 'intermittent' && wiper.bySwitch > 1 && wiper.other < 1e-6 && wiper.off < 1e-6 && wiper.at === 0,
    `the port wiper's switch on the console starts the port wiper and no other ("${wiper.said}": ${wiper.bySwitch.toFixed(0)}°), and parks it when it is turned off`);

  // ---- the clear-view screens spin while they are on
  const cvs = await page.evaluate(() => {
    const f = window.__ferry, a = [];
    f.work('clear-view-port', true);
    for (let k = 0; k < 5; k++) { T.run(0.1); a.push(T.turned('clear-view-port')); }
    const other = T.off('clear-view-starboard');
    T.work('clear-view-port', false, 1.0);
    return { a, other, stopped: T.off('clear-view-port') };
  });
  check(new Set(cvs.a.map(v => v.toFixed(0))).size >= 4 && cvs.other < 1e-6 && cvs.stopped < 1e-6,
    `the port clear-view screen spins when it is tapped (${cvs.a.map(v => v.toFixed(0)).join(', ')}° at five moments) and stops where it began; the starboard one stands still meanwhile`);

  // ---- the pilot chairs: on the rail, on the pedestal, and the seat goes with the carriage
  const chair = await page.evaluate(() => {
    T.work('chair-master-slide', true);
    const slid = T.moved('chair-master-slide'), seat = T.moved('chair-master-turn');
    T.work('chair-master-turn', true);
    const turned = T.turned('chair-master-turn');
    T.work('chair-master-turn', false); T.work('chair-master-slide', false);
    T.work('chair-officer-turn', true);
    const other = T.turned('chair-officer-turn');
    T.work('chair-officer-turn', false);
    return { slid, seat, turned, other, back: T.off('chair-master-slide') + T.off('chair-master-turn') };
  });
  check(Math.abs(chair.slid[2] + 0.42) < 1e-3 && Math.abs(chair.seat[2] + 0.42) < 1e-3 && Math.abs(chair.turned - 70) < 0.1 && Math.abs(chair.other - 70) < 0.1 && chair.back < 1e-6,
    `the master's chair runs ${(-chair.slid[2]).toFixed(2)} m aft on its rail and its seat goes with it; it turns ${chair.turned.toFixed(0)}° on its pedestal; so does the watch officer's; both come back`);

  // ---- drawers run out; a blind is drawn down and its film is drawn out with it; the whistle
  const more = await page.evaluate(() => {
    const out = {};
    T.work('chart-drawer-2', true); out.chart = T.moved('chart-drawer-2'); T.work('chart-drawer-2', false);
    T.work('table-drawer', true); out.table = T.moved('table-drawer'); T.work('table-drawer', false);
    T.work('blind-3', true);
    const m = T.m('blind-3-film').matrix;
    out.blind = T.moved('blind-3');
    out.film = m[0] * (m[5] * m[10] - m[6] * m[9]) - m[4] * (m[1] * m[10] - m[2] * m[9]) + m[8] * (m[1] * m[6] - m[2] * m[5]);      // how many times its own length
    T.work('blind-3', false);
    out.filmBack = T.off('blind-3-film');
    T.work('whistle-pull', true); out.pull = T.moved('whistle-pull'); out.lever = T.turned('whistle-lever'); T.work('whistle-pull', false);
    T.work('handset-telephone', true); out.handset = T.turned('handset-telephone'); T.work('handset-telephone', false);
    T.work('binocular-box-lid', true); out.lid = T.turned('binocular-box-lid'); T.work('binocular-box-lid', false);
    return out;
  });
  const len = v => Math.hypot(v[0], v[1], v[2]);
  check(Math.abs(more.chart[2] - 0.36) < 1e-3 && Math.abs(more.table[0] - 0.26) < 1e-3, `a chart drawer runs out ${more.chart[2].toFixed(2)} m forward and the table's drawer ${more.table[0].toFixed(2)} m inboard`);
  check(Math.abs(len(more.blind) - 1.03) < 1e-3 && more.blind[1] < -0.9 && more.film > 50 && more.film < 65 && more.filmBack < 1e-6,
    `a sun blind's bar is drawn ${len(more.blind).toFixed(2)} m down the glass and its film is drawn out with it (${more.film.toFixed(0)} times the strip that shows when it is rolled up), and it rolls up again`);
  check(Math.abs(more.pull[1] + 0.07) < 1e-3 && Math.abs(more.lever - 21) < 0.1, `the whistle pull is drawn ${(-more.pull[1] * 100).toFixed(0)} cm down and the valve's lever goes over ${more.lever.toFixed(0)}°`);
  check(Math.abs(more.handset - 38) < 0.1 && Math.abs(more.lid - 100) < 0.1, `the telephone's handset lifts ${more.handset.toFixed(0)}° off its cradle and the binocular box's lid opens ${more.lid.toFixed(0)}°`);

  // ---- the dimmers: a tap turns one a step; the night lights and the chart lamp come on and go out, the displays darken
  const dim = await page.evaluate(async () => {
    const f = window.__ferry, wait = () => T.run(1.5);
    const shown = id => T.m(id).shown;
    const out = { home: { night: shown('night-lights-lit'), chart: shown('chart-lamp-lit'), dark: shown('instruments-dimmed') }, said: [] };
    out.said.push(f.step('dimmer-console').say); wait();
    out.night = shown('night-lights-lit'); out.knob = T.turned('dimmer-console');
    f.step('dimmer-chart'); f.step('dimmer-chart'); out.said.push(f.step('dimmer-chart').say); wait();      // full, half, off
    out.chart = shown('chart-lamp-lit');
    f.step('dimmer-instruments'); out.said.push(f.step('dimmer-instruments').say); wait();                  // half, turned down
    out.dark = shown('instruments-dimmed');
    f.step('dimmer-console'); f.step('dimmer-console'); f.step('dimmer-console'); f.step('dimmer-chart'); f.step('dimmer-instruments'); f.step('dimmer-instruments');
    wait();
    out.again = { night: shown('night-lights-lit'), chart: shown('chart-lamp-lit'), dark: shown('instruments-dimmed') };
    return out;
  });
  check(dim.home.night === false && dim.home.chart === true && dim.home.dark === false, 'by day the night lights are out, the chart lamp is lit and the displays are bright');
  check(dim.night === true && Math.abs(dim.knob - 135) < 0.5 && dim.chart === false && dim.dark === true,
    `a step of the console's dimmer lights the night lights (its knob turned ${dim.knob.toFixed(0)}°: "${dim.said[0]}"); the chart lamp's dimmer turned to "${dim.said[1]}" puts the chart lamp out; the instruments' dimmer "${dim.said[2].split(':')[0]}" darkens the displays`);
  check(dim.again.night === false && dim.again.chart === true && dim.again.dark === false, 'and each is as it was when its dimmer is turned back');

  // ---- the coffee: the jug fills while the machine is on, and empties while it is poured
  const coffee = await page.evaluate(() => {
    const f = window.__ferry, level = () => f.state.inputs.coffee, tall = () => T.m('coffee').matrix[5];
    f.setInput('coffee', 55);                                    // as she is found: a little over half a pot
    const out = { start: level(), lamp0: T.m('coffee-lamp-lit').shown, tall0: tall() };
    T.run(2); out.idle = level();
    T.work('coffee-machine', true, 3.0);
    out.filling = level(); out.lamp = T.m('coffee-lamp-lit').shown; out.tall1 = tall();
    T.run(12); out.full = level(); out.tall2 = tall();
    T.work('coffee-machine', false);
    T.work('coffee-jug', true, 2.0);
    out.pouring = level(); out.tilt = T.turned('coffee-jug'); out.rides = Math.abs(T.m('coffee').matrix[1]);
    T.run(8); out.empty = level(); out.tall3 = tall();
    T.work('coffee-jug', false);
    T.run(2); out.after = level(); out.back = T.off('coffee-jug');
    T.work('coffee-machine', true, 5.0); out.again = level(); T.work('coffee-machine', false);
    return out;
  });
  check(coffee.start === 55 && coffee.idle === 55 && coffee.lamp0 === false, `the jug is a little over half full (${coffee.start} %) and stays so while nothing is worked; the machine's lamp is out`);
  check(coffee.filling > coffee.start && coffee.lamp === true && coffee.full === 100 && coffee.tall2 > coffee.tall1 && coffee.tall1 > coffee.tall0,
    `with the machine on its lamp is lit and the jug fills (${coffee.filling.toFixed(0)} % after 3 s, then ${coffee.full} %): the coffee stands ${(coffee.tall2 / coffee.tall0).toFixed(1)} times as high as at first`);
  check(coffee.pouring < 100 && Math.abs(coffee.tilt - 52) < 0.1 && coffee.rides > 0.7 && coffee.empty === 0 && coffee.after === 0 && coffee.back < 1e-6,
    `lifted and poured (${coffee.tilt.toFixed(0)}°, the coffee tipping with it) the jug empties (${coffee.pouring.toFixed(0)} % after 2 s, then ${coffee.empty} %), and put back it stays empty`);
  check(coffee.again > 20, `and the machine fills it again (${coffee.again.toFixed(0)} % after 5 s)`);

  // ---- on foot: a tap works what it is on
  const tap = async (stand, aim, pitch, yaw = Math.PI) => page.evaluate(async ([stand, aim, pitch, yaw, SHIFT, DECK]) => {
    const f = window.__ferry, L = f.look, half = f.ship.length / 2, Z = yard => yard + SHIFT - half;
    if (!f.state.walk) f.enterWalk();
    f.walkTo(stand[0], Z(stand[1]), yaw, pitch, DECK);
    f.walkFor(0.3);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const at = new L.camera.position.constructor(aim[0], DECK + aim[2], Z(aim[1])).project(L.camera);
    const c = document.querySelector('canvas').getBoundingClientRect();
    f.nameOnFoot(c.left + (at.x + 1) / 2 * c.width, c.top + (1 - at.y) / 2 * c.height);
    for (let t = 0; t < 1.2; t += 0.1) f.workAuto(0.1);
    return { said: document.querySelector('#what').textContent, card: f.systems.state.component, inputs: f.state.inputs };
  }, [stand, aim, pitch, yaw, SHIFT, DECK]);
  let t = await tap([-0.75, 21.6], [-0.565, 22.196, 0.36], -1.0);
  check(/Console door, bay 4 .*port leaf: open/.test(t.said) && t.inputs['console-door-4p'] > 100,
    `on foot, a tap on a cabinet door of the console opens it ("${t.said}")`);
  t = await tap([1.15, 21.75], [1.19, 22.225, 0.955], -0.95);
  check(t.card === 'INT-04' && t.inputs['handset-telephone'] > 30, `on foot, a tap on the telephone shows its card and lifts its handset (${t.card}, "${t.said}")`);
  t = await tap([-1.05, 21.9], [-1.164, 22.99, 1.512], -0.08);
  const spin = await page.evaluate(() => { const a = T.turned('clear-view-starboard'); T.run(0.1); return [a, T.turned('clear-view-starboard')]; });
  check(t.card === 'NLT-18' && /spinning/.test(t.said) && spin[0] !== spin[1], `on foot, a tap on the starboard clear-view screen's motor starts it ("${t.said}")`);
  await page.evaluate(() => { const f = window.__ferry; for (const id of ['console-door-4p', 'handset-telephone', 'clear-view-starboard']) f.work(id, false); T.run(1.5); f.systems.clear(); f.leaveWalk(); });

  check(errors.length === 0, `no errors in the console (${errors.slice(0, 3).join(' | ') || 'none'})`);
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed');
  process.exit(fails.length ? 1 : 0);
})();
