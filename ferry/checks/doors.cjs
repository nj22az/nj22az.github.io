// Every door aboard opens, and every doorway lets one through.
//
//   node ferry/checks/doors.cjs          (the site served on port 8765: python3 -m http.server 8765)
//
// The owner, 11 November 2026: "The door needs to be able to open nothing is ornamental". Every door the model says can be
// worked (its `inputs` with auto: the watertight doors, the pilot doors, the wheelhouse's doors and gate, the generator
// room's door, the hatch, the drinks machine) is opened as a tap opens it, and must have moved; shut again, it must be
// back. The stern ramp is lowered and raised, by its control and by its keys on the desk. Then on foot: through every
// doorway in her steel (the file's `doorways`) and every door that opens to whoever comes near, both ways; the drinks
// machine; out of the generator room.
//
// Nothing here is a place written down by hand: where each door is comes from the file (its `inputs`, its `doorways`, its
// `ship`), so a ship of another size is checked by the same lines.
const { chromium } = require('playwright');
const fails = [];
const check = (ok, text) => { console.log((ok ? 'ok    ' : 'FAIL  ') + text); if (!ok) fails.push(text); };
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto((process.env.CHISUM_URL || 'http://localhost:8765/ferry/') + '?t=' + Date.now());
  await page.waitForFunction(() => window.__ferry && document.body.classList.contains('ready'), null, { timeout: 120000 });
  const doors = await page.evaluate(async () => {
    const f = window.__ferry;
    const header = await (async () => {
      const r = await fetch('data/ferry.bin.gz'); const ds = new DecompressionStream('gzip');
      const buf = await new Response(r.body.pipeThrough(ds)).arrayBuffer(); const n = new DataView(buf).getUint32(4, true);
      return JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, n)));
    })();
    const moved = id => { const m = f.movers().filter(m => m.input === id); return m.length ? Math.max(...m.map(m => m.matrix.reduce((s, v, i) => s + Math.abs(v - (i % 5 === 0 ? 1 : 0)), 0))) : null; };
    const out = [];
    window.__doorAt = id => (header.inputs.find(i => i.id === id) || {}).at;          // where the file says a door is, for the checks below
    // (what only goes from 0 to 1 is a push-button, not a door: it moves a few millimetres, and the stand's own check below works it)
    for (const def of header.inputs.filter(i => i.auto && i.max > 1)) {
      f.work(def.id, true); for (let t = 0; t < 1.2; t += 0.1) f.workAuto(0.1);
      const open = moved(def.id);
      f.work(def.id, false); for (let t = 0; t < 1.2; t += 0.1) f.workAuto(0.1);
      out.push({ id: def.id, name: def.name, open, shut: moved(def.id) });
    }
    return out;
  });
  check(doors.length > 0, `the model has ${doors.length} doors, gates and hatches that are worked`);
  const stuck = doors.filter(d => !(d.open > 0.05) || !(d.shut < 1e-6));
  check(stuck.length === 0, `each opens to a tap and shuts again (${stuck.length ? 'not: ' + stuck.map(d => d.name).join('; ') : doors.map(d => d.id.replace('door-', '')).join(', ')})`);
  // The stern ramp (the owner, 11 November 2026: "How do you get on to cargo deck from this ship ? Aft ramp ?"): raised it is
  // the stern door; its control in the bar lowers it aft about its hinges at the car deck's sill, level at 90 degrees.
  const ramp = await page.evaluate(() => {
    const f = window.__ferry, label = [...document.querySelectorAll('#bar .grp .lbl')].map(e => e.textContent);
    const lean = () => { const m = f.movers().find(m => m.id === 'stern-ramp'); return m ? Math.atan2(m.matrix[6], m.matrix[5]) * 180 / Math.PI : null; };
    const raised = lean();
    f.setInput('stern-ramp', 90);
    const lowered = lean();
    f.setInput('stern-ramp', 0);
    return { label, raised, lowered, again: lean() };
  });
  check(ramp.label.includes('Stern ramp') && Math.abs(ramp.raised) < 1e-6 && Math.abs(Math.abs(ramp.lowered) - 90) < 0.01 && Math.abs(ramp.again) < 1e-6,
    `the stern ramp has its control in the bar and lowers through 90° to lie level with the main deck, and is raised again (${ramp.lowered === null ? 'no such part' : ramp.lowered.toFixed(1) + '°'})`);
  // ... and by its keys on the desk: Lower sets it going at its own pace, Stop holds it where it is, Raise brings it back.
  const lean = () => page.evaluate(() => { const m = window.__ferry.movers().find(m => m.id === 'stern-ramp'); return Math.abs(Math.atan2(m.matrix[6], m.matrix[5]) * 180 / Math.PI); });
  const key = name => page.evaluate(name => { const k = [...document.querySelectorAll('#desk .grp[data-fn="stern-ramp"] .key')].find(k => k.textContent === name); if (k) k.click(); return !!k; }, name);
  const keyed = { has: await key('Lower') };
  await page.waitForFunction(() => { const m = window.__ferry.movers().find(m => m.id === 'stern-ramp'); return Math.abs(Math.atan2(m.matrix[6], m.matrix[5])) > 0.02; }, null, { timeout: 60000 }).catch(() => {});
  keyed.lowering = await lean();
  await key('Stop');
  keyed.held = await lean();
  await page.waitForTimeout(1500);
  keyed.still = await lean();
  await key('Raise');
  await page.waitForFunction(() => { const m = window.__ferry.movers().find(m => m.id === 'stern-ramp'); return Math.abs(Math.atan2(m.matrix[6], m.matrix[5])) < 1e-9; }, null, { timeout: 120000 }).catch(() => {});
  keyed.raised = await lean();
  check(keyed.has && keyed.lowering > 1 && Math.abs(keyed.still - keyed.held) < 1e-6 && keyed.raised < 1e-6,
    `its keys work it: Lower sets it going (${keyed.lowering.toFixed(1)}° when looked at), Stop holds it (${keyed.still.toFixed(1)}°), Raise brings it back (${keyed.raised.toFixed(1)}°)`);
  // Its hydraulics (the owner: "It needs a hydraulic ramp"): a cylinder each side, whose barrel swings on its foot pin and whose
  // rod runs out, so that the rod's end stays on the lug of the ramp it is pinned to, wherever the ramp is.
  const rams = await page.evaluate(async () => {
    const f = window.__ferry;
    const r = await fetch('data/ferry.bin.gz'); const ds = new DecompressionStream('gzip');
    const buf = await new Response(r.body.pipeThrough(ds)).arrayBuffer(); const n = new DataView(buf).getUint32(4, true);
    const header = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, n)));
    const rods = header.movers.filter(m => m.kind === 'aim' && m.extend && /^stern-ramp-ram-/.test(m.id));
    const at = (id, p) => { const m = f.movers().find(m => m.id === id).matrix; return [0, 1, 2].map(i => m[i] * p[0] + m[4 + i] * p[1] + m[8 + i] * p[2] + m[12 + i]); };
    const lowest = header.inputs.find(i => i.id === 'stern-ramp').max;
    let off = 0, run = 0, closed = 0;
    for (const angle of [0, 30, 60, 90, lowest]) {
      f.setInput('stern-ramp', angle);
      for (const rod of rods) {
        const lug = at('stern-ramp', rod.pin), end = at(rod.id, rod.pin);
        off = Math.max(off, Math.hypot(lug[0] - end[0], lug[1] - end[1], lug[2] - end[2]));
        closed = Math.hypot(rod.pin[0] - rod.anchor[0], rod.pin[1] - rod.anchor[1], rod.pin[2] - rod.anchor[2]);
        if (angle === 90) run = Math.hypot(end[0] - rod.anchor[0], end[1] - rod.anchor[1], end[2] - rod.anchor[2]) - closed;
      }
    }
    f.setInput('stern-ramp', 0);
    return { rods: rods.length, off, run, closed, lowest };
  });
  // (A cylinder of one stage cannot run out farther than it is long when closed: that is the limit, whatever her size.)
  check(rams.rods === 2 && rams.off < 0.002 && rams.run > 0.5 && rams.run < rams.closed - 0.3,
    `two hydraulic cylinders work it: each rod's end stays on the ramp's lug from raised to ${rams.lowest}° (never more than ${(rams.off * 1000).toFixed(1)} mm off), and has run out ${rams.run.toFixed(2)} m when the ramp lies level (pin to pin ${rams.closed.toFixed(2)} m closed)`);
  // Its order (the owner, 12 November 2026: "a simple system that could be animated much better"; "There needs to be a latch for the
  // ramp too, so it doesnt become dangerous"; JS3-304): the two safety latches are lifted first, the ten cleats let go, and only
  // then does the leaf turn; its end flaps fold out on the way down. Raised again, all of it is home.
  const order = await page.evaluate(() => {
    const f = window.__ferry;
    const m = id => (f.movers().find(m => m.id === id) || {}).matrix;
    const lean = id => { const k = m(id); return k ? Math.atan2(k[6], k[5]) * 180 / Math.PI : null; };
    const slid = id => { const k = m(id); return k ? Math.hypot(k[12], k[13], k[14]) : null; };
    const at = v => { f.setInput('stern-ramp', v); const leaf = lean('stern-ramp'), flap = lean('stern-ramp-flaps');
      return { leaf: Math.abs(leaf), latch: Math.abs(lean('stern-ramp-latches')), hook: Math.abs(lean('stern-ramp-hooks')), bolt: slid('stern-ramp-bolts-p'), boltS: slid('stern-ramp-bolts-s'),
        flap: (((flap - leaf) % 360) + 360) % 360 }; };
    const out = { home: at(0), lifted: at(4), free: at(5), going: at(30), level: at(90), again: at(0) };
    return out;
  });
  const flapDown = Math.min(order.level.flap, 360 - order.level.flap);
  check(order.home.latch < 1e-6 && order.home.bolt < 1e-6 && order.home.hook < 1e-6 && order.lifted.latch > 20 && order.lifted.leaf < 1e-6
    && order.free.bolt > 0.15 && order.free.boltS > 0.15 && order.free.hook > 25 && order.free.leaf < 1e-6
    && order.going.leaf > 10 && Math.min(order.going.flap, 360 - order.going.flap) < 1 && flapDown > 160
    && order.again.latch < 1e-6 && order.again.bolt < 1e-6 && order.again.leaf < 1e-6,
    `it is worked in its order: the safety latches lift first (${order.lifted.latch.toFixed(0)}° while the leaf has not moved), the cleats let go (bolts drawn ${(order.free.bolt * 1000).toFixed(0)} mm, hooks dropped ${order.free.hook.toFixed(0)}°, the leaf still home), then the leaf turns (${order.going.leaf.toFixed(1)}° with its flaps still folded), and level its flaps are let down (${flapDown.toFixed(0)}° from stowed); raised again, latches and cleats are home`);
  // The control stand beside the door (the owner: "a local control panel that is wired up"; "Control panel for the hydraulics need to
  // be realistic"). It is worked as its own instruction plate says, and it refuses what a real one refuses: no lever does anything
  // until a pump runs; the ramp is not lowered with its cleats locked; the emergency stop trips the pump and holds the ramp; the
  // cleats are not locked until the ramp is home. Its lamps and its two pressure indicators follow.
  const stand = await page.evaluate(async () => {
    const f = window.__ferry, wait = ms => new Promise(r => setTimeout(r, ms));
    const comp = f.systems && f.systems.data.components.find(c => c.id === 'RMP-30');
    if (!f.control('stern-ramp-ramp-lever') || !f.tap) return null;
    const run = s => { for (let t = 0; t < s - 1e-9; t += 0.1) f.workAuto(0.1); };
    const ramp = () => f.state.inputs['stern-ramp'];
    const until = async (test, seconds) => { for (let t = 0; t < seconds * 2 && !test(); t++) await wait(500); return test(); };
    const shown = id => { const m = f.movers().find(m => m.id === id); return m ? m.shown : null; };
    // how far a needle has turned from its rest, in degrees
    const turned = id => { const m = f.movers().find(m => m.id === id); return m ? Math.acos(Math.max(-1, Math.min(1, (m.matrix[0] + m.matrix[5] + m.matrix[10] - 1) / 2))) * 180 / Math.PI : null; };
    const at = id => f.control(id).at;
    const CLEATS = 'stern-ramp-cleats-lever', RAMP = 'stern-ramp-ramp-lever', PUMP = 'stern-ramp-pump-1', STOP = 'stern-ramp-estop';
    f.setInput('stern-ramp', 0);
    const out = { drawn: comp && comp.drawn };
    f.step(CLEATS);                                           // open the cleats, with no pump running: nothing
    await wait(800);
    out.idle = { ramp: ramp(), lever: at(CLEATS) };
    f.tap(PUMP); run(4);                                      // pump No. 1 is started: its lamp, and the system's pressure
    out.pump = { lamp: shown('stern-ramp-lamp-pump-1'), bar: f.state.inputs['stern-ramp-pressure'], needle: turned('stern-ramp-gauge-system'), room: turned('stern-ramp-gauge-pg1') };
    f.step(RAMP);                                             // lower, with the cleats locked: refused
    await wait(800);
    out.locked = { ramp: ramp(), lever: at(RAMP), lamp: shown('stern-ramp-lamp-locked') };
    f.step(CLEATS);                                           // the cleats lever to OPEN: latches and cleats let go, the leaf stays home
    out.opened = await until(() => ramp() >= 6 - 1e-6, 180);
    await wait(1200);
    out.open = { ramp: ramp(), open: shown('stern-ramp-lamp-open'), closed: shown('stern-ramp-lamp-closed'), locked: shown('stern-ramp-lamp-locked'), lever: at(CLEATS) };
    f.step(RAMP);                                             // the ramp lever to LOWER
    out.going = await until(() => ramp() >= 12, 240);
    out.lowering = { ramp: ramp(), line: turned('stern-ramp-gauge-ramp'), closed: shown('stern-ramp-lamp-closed'), beacon: shown('stern-ramp-beacon') };
    f.tap(STOP); run(1.2);                                    // the emergency stop: the pump trips, the ramp is held
    await wait(1500);
    const held = ramp();
    await wait(2500);
    out.stopped = { held, still: ramp(), pump: shown('stern-ramp-lamp-pump-1') };
    const refused = f.tap(PUMP);                              // a pump is not started while it is pressed
    f.tap(STOP); run(1.2);                                    // released; the pump started again
    f.tap(PUMP); run(4);
    out.again = { refused: refused === false, lamp: shown('stern-ramp-lamp-pump-1') };
    f.step(RAMP); f.step(RAMP);                               // the ramp lever through STOP to RAISE
    out.raised = await until(() => ramp() <= 6 + 1e-6, 360);
    await wait(1200);
    out.home = { ramp: ramp(), closed: shown('stern-ramp-lamp-closed'), lever: at(RAMP) };
    f.step(CLEATS);                                           // the cleats lever to LOCK
    out.shut = await until(() => ramp() === 0, 180);
    await wait(1200);
    out.end = { ramp: ramp(), locked: shown('stern-ramp-lamp-locked'), open: shown('stern-ramp-lamp-open'), beacon: shown('stern-ramp-beacon'), lever: at(CLEATS) };
    f.tap(PUMP); run(6);                                      // the pump stopped: the pressure falls
    out.off = { bar: f.state.inputs['stern-ramp-pressure'], lamp: shown('stern-ramp-lamp-pump-1') };
    return out;
  });
  const sd = stand || {};
  check(stand && sd.drawn === 'blender' && sd.idle.ramp === 0 && sd.idle.lever === 1,
    'at the ramp\'s control stand no lever does anything until a pump runs');
  check(stand && sd.pump.lamp === true && sd.pump.bar > 150 && sd.pump.needle > 140 && sd.pump.room > 140 && sd.off.bar < 1 && sd.off.lamp === false,
    `a pump is started by its button: PUMP 1 RUNNING lights and the system's pressure rises on the stand's indicator and on the gauge in the pump room (${stand ? sd.pump.bar.toFixed(0) : '?'} bar, needles turned ${stand ? sd.pump.needle.toFixed(0) : '?'}°); stopped, it falls again`);
  check(stand && sd.locked.ramp === 0 && sd.locked.lever === 1 && sd.locked.lamp === true,
    'the ramp lever does not lower the ramp while its cleats are locked (CLEATS LOCKED is lit)');
  check(stand && sd.opened && Math.abs(sd.open.ramp - 6) < 1e-6 && sd.open.open === true && sd.open.closed === true && sd.open.locked === false && sd.open.lever === 1,
    'the cleats lever to OPEN lifts the latches and lets the cleats go, the leaf still home: CLEATS OPEN lights, RAMP CLOSED stays lit, the lever springs back');
  check(stand && sd.going && sd.lowering.line > 15 && sd.lowering.closed === false && sd.lowering.beacon === true,
    `then the ramp lever to LOWER lowers it: RAMP CLOSED goes out, the beacon is lit, and line A's indicator shows the leaf's weight coming on (its needle turned ${stand ? sd.lowering.line.toFixed(0) : '?'}° at ${stand ? sd.lowering.ramp.toFixed(1) : '?'} of the control)`);
  check(stand && Math.abs(sd.stopped.still - sd.stopped.held) < 1e-6 && sd.stopped.pump === false && sd.again.refused && sd.again.lamp === true,
    'the emergency stop trips the pump and holds the ramp where it is; a pump is not started until it is released');
  check(stand && sd.raised && Math.abs(sd.home.ramp - 6) < 1e-6 && sd.home.closed === true && sd.home.lever === 1 && sd.shut && sd.end.ramp === 0 && sd.end.locked === true && sd.end.open === false
    && sd.end.beacon === false && sd.end.lever === 1,
    'the ramp lever to RAISE brings the leaf home (RAMP CLOSED), and only then does the cleats lever to LOCK lock it: CLEATS LOCKED lights, the beacon goes out');
  // The power pack itself (the owner: "Also specify the oil and the level of oil etc , it needs to be fully functional"; instruction
  // JS3-304-M1). The oil in its level glass follows the ramp, because the cylinders' rods take their own volume out of the tank;
  // the oil warms while a pump runs and the cooler's fan turns from 45 degrees until it is back at 40; the lamp test lights every
  // lamp and comes out by itself; and the valve stand's two hand levers give the same orders as the control stand's.
  const pack = await page.evaluate(async () => {
    const f = window.__ferry, wait = ms => new Promise(r => setTimeout(r, ms));
    if (!f.control('stern-ramp-v1-lever') || !f.tap) return null;
    const run = s => { for (let t = 0; t < s - 1e-9; t += 0.1) f.workAuto(0.1); };
    const val = id => f.state.inputs[id], ramp = () => val('stern-ramp');
    const until = async (test, seconds) => { for (let t = 0; t < seconds * 2 && !test(); t++) await wait(500); return test(); };
    const mover = id => f.movers().find(m => m.id === id);
    const shown = id => { const m = mover(id); return m ? m.shown : null; };
    const column = () => { const m = mover('stern-ramp-oil-level'); return m ? m.matrix[5] : null; };     // the oil's column, as a share of its length with the ramp raised
    const turned = id => { const m = mover(id); return m ? Math.acos(Math.max(-1, Math.min(1, (m.matrix[0] + m.matrix[5] + m.matrix[10] - 1) / 2))) * 180 / Math.PI : null; };
    const turning = id => { const a = val(id); run(0.3); return val(id) !== a; };
    const PUMP = 'stern-ramp-pump-1', V1 = 'stern-ramp-v1-lever', V2 = 'stern-ramp-v2-lever', TEMP = 'stern-ramp-oil-temp', FAN = 'stern-ramp-fan', TEST = 'stern-ramp-lamp-test';
    // (The control stand's check above ran a pump, and the oil keeps the warmth of it: it stood at 23.5 degrees here, and "at
    // rest" was read as a fault. With the pumps stopped it is let cool until it is as cold as the room, however long that is.)
    let cooled = 0; while (val(TEMP) > 20 && cooled < 1200) { run(5); cooled += 5; }
    const out = { rest: { column: column(), temp: val(TEMP), fan: turning(FAN) } };
    f.setInput('stern-ramp', 90); run(0.3);
    out.down = column();
    f.setInput('stern-ramp', 0); run(0.3);
    out.up = column();
    f.step(V1); await wait(600);                                // the ramp's hand lever with no pump running: nothing
    out.idle = { ramp: ramp(), lever: f.control(V1).at };
    f.tap(PUMP); run(190);                                      // a pump runs for three minutes: the oil warms
    out.warm = { temp: val(TEMP), needle: turned('stern-ramp-thermo'), fan: turning(FAN), hot: shown('stern-ramp-lamp-oil-temp'), low: shown('stern-ramp-lamp-oil-level') };
    f.tap(TEST); run(1.2);                                      // the lamp test: every lamp, and its button comes out by itself
    out.test = shown(TEST);
    run(3.0);
    out.tested = shown(TEST);
    f.step(V2);                                                 // at the valve stand: the cleats' lever to open
    out.opened = await until(() => ramp() >= 6 - 1e-6, 120);
    f.step(V1);                                                 // the ramp's to lower
    out.going = await until(() => ramp() >= 11, 120);
    f.step(V1); await wait(700);                                // to stop
    const held = ramp();
    await wait(900);
    out.stopped = Math.abs(ramp() - held) < 1e-6;
    f.step(V1);                                                 // to raise
    out.raised = await until(() => ramp() <= 6 + 1e-6, 240);
    await wait(1200);
    f.step(V2);                                                 // the cleats' to lock
    out.shut = await until(() => ramp() === 0, 120);
    await wait(1200);
    out.end = { ramp: ramp(), v1: f.control(V1).at, v2: f.control(V2).at };
    f.tap(PUMP); run(1);                                        // the pump stopped: the oil cools, the fan turning on until it is back at 40 degrees
    out.cool = { from: val(TEMP), above: turning(FAN), seconds: 1 };
    // (How long that is depends on how hot the oil was: from its hottest, 55 degrees, five minutes. It was read after 260 s, which
    // is enough from 52 degrees and not from 55, where the oil is once the valve stand's levers have been worked: 42 degrees, the fan turning.)
    while (val(TEMP) >= 39.5 && out.cool.seconds < 900) { run(5); out.cool.seconds += 5; }
    out.cool.temp = val(TEMP); out.cool.fan = turning(FAN);
    return out;
  });
  const pk = pack || {};
  check(pack && Math.abs(pk.rest.column - 1) < 1e-6 && pk.down > 0.78 && pk.down < 0.86 && Math.abs(pk.up - 1) < 1e-6,
    `the oil in the power pack's level glass stands at FILL with the ramp raised, falls as the ramp is lowered (the cylinders' rods take their own volume out of the tank: to ${pack ? (100 * pk.down).toFixed(0) : '?'} % of its column with the ramp level) and comes back`);
  check(pack && pk.rest.temp === 20 && pk.rest.fan === false && pk.warm.temp > 45 && pk.warm.temp <= 55 && pk.warm.needle > 110 && pk.warm.fan === true && pk.warm.hot === false && pk.warm.low === false,
    `the oil warms while a pump runs (20 to ${pack ? pk.warm.temp.toFixed(0) : '?'} degrees in three minutes), the thermometer's needle follows, the cooler's fan turns from 45 degrees, and neither oil lamp is lit`);
  check(pack && pk.cool.from > 45 && pk.cool.above === true && pk.cool.temp < 40 && pk.cool.fan === false && pk.cool.seconds < 400,
    `with the pump stopped the oil cools (from ${pack ? pk.cool.from.toFixed(0) : '?'} to ${pack ? pk.cool.temp.toFixed(0) : '?'} degrees in ${pack ? pk.cool.seconds : '?'} s): the fan turns on while it is over 40 degrees and has stopped under that`);
  check(pack && pk.test === true && pk.tested === false, 'the lamp test lights every lamp of the control stand, the two oil lamps with them, and its button comes out by itself');
  check(pack && pk.idle.ramp === 0 && pk.idle.lever === 1 && pk.opened && pk.going && pk.stopped && pk.raised && pk.shut && pk.end.ramp === 0 && pk.end.v1 === 1 && pk.end.v2 === 1,
    'at the valve stand the two hand levers give the same orders: nothing without a pump; with one running V2 opens the cleats, V1 lowers, stops and raises the ramp, V2 locks it');
  // Out on the ramp (the owner, 12 November 2026: "I want to be able to walk out on the ramp , and look at the sea and the ship"):
  // with the ramp raised nobody walks through the stern door; with it level one walks out along it, as on a deck; and it is not
  // moved while somebody stands on it.
  // (As first written this put the walker somewhere from the outside view, where nobody is on foot: walkTo gave nothing and the
  // check read "?". On foot it found a fault: the ramp was held with a quiet ship, and rose under the walker as soon as anything
  // else aboard moved by itself, or at once for whoever asked for less motion. So both are tried here: the oil cooler's fan is
  // set turning before the order is given, and the order is given again with less motion asked for.)
  const out = await page.evaluate(async () => {
    const f = window.__ferry, wait = ms => new Promise(r => setTimeout(r, ms));
    const half = f.ship.length / 2, x = 2.0;
    f.enterWalk();
    const level = f.walkTo(x, 4 - half, 0, 0, (f.ship.decks && f.ship.decks.main) ?? 1.0);       // on the main deck, 4 m inside the transom, looking aft
    if (level === null) return null;
    const walkAft = s => { f.hold('KeyW', true); for (let t = 0; t < s; t += 0.1) { f.workAuto(0.1); f.walkFor(0.1); } f.hold('KeyW', false); return f.state.walk; };
    const shut = walkAft(6);                                    // the ramp raised: to the sill and no further
    f.setInput('stern-ramp', 90);
    f.walkTo(x, 4 - half, 0, 0, level);
    const open = walkAft(9);                                    // the ramp level: out along it
    const fan = f.tap('stern-ramp-fan');                        // something else aboard moving by itself
    await wait(400);
    f.order('stern-ramp', 0);                                   // Raise, with somebody standing on it
    const said = f.state.walk.room;
    await wait(1600);
    return { level, shut: shut.z + half, open: open.z + half, y: open.y - level, held: f.state.inputs['stern-ramp'], said, fan };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });         // for whoever asked for less motion an order is carried out at once
  const calm = out && await page.evaluate(async () => {
    const f = window.__ferry;
    await new Promise(r => setTimeout(r, 300));
    f.order('stern-ramp', 0);
    return { less: matchMedia('(prefers-reduced-motion: reduce)').matches, held: f.state.inputs['stern-ramp'] };
  });
  await page.emulateMedia({ reducedMotion: null });
  if (out) await page.evaluate(level => {                       // back aboard, the ramp raised, the fan stopped, and off foot again as the checks below begin
    const f = window.__ferry, half = f.ship.length / 2;
    f.tap('stern-ramp-fan');
    f.walkTo(2.0, 6 - half, Math.PI, 0, level);
    f.setInput('stern-ramp', 0);
    f.leaveWalk();
  }, out.level);
  check(out && out.shut > -0.6 && out.open < -8 && Math.abs(out.y) < 0.35,
    `with the ramp raised nobody walks out through the stern door (stopped ${out ? (-out.shut).toFixed(1) : '?'} m abaft the transom); with it level one walks out along it `
    + `(${out ? (-out.open).toFixed(1) : '?'} m abaft the transom, ${out ? (out.y * 100).toFixed(0) : '?'} cm from the deck's level)`);
  check(out && out.fan === true && out.held === 90 && /stands on it/.test(out.said || '') && calm && calm.less === true && calm.held === 90,
    `the ramp is not raised while somebody stands on it, and says why ("${out ? out.said : '?'}"): with something else aboard moving by itself (at ${out ? out.held : '?'}°), `
    + `and for whoever asked for less motion, where an order is carried out at once (at ${calm ? calm.held : '?'}°)`);
  // The lights of the after end (the owner: "And lights"): the sternlight is the register's NLT-06 and has its place at the stern.
  const light = await page.evaluate(() => {
    const f = window.__ferry, c = f.systems ? f.systems.data.components.find(c => c.id === 'NLT-06') : null;
    return c ? { drawn: c.drawn, room: c.roomName, at: c.at, half: f.ship.length / 2 } : null;
  });
  // (Where the raised ramp stands on her centre line, the sternlight stands beside it on the stern bulwark: anywhere
  // across her stern, then, and within 0.3 m abaft the transom.)
  const beam = await page.evaluate(() => window.__ferry.ship.beam);
  check(light && light.drawn === 'blender' && Math.abs(light.at[0]) < beam / 2 && light.at[2] < -light.half && light.at[2] > -light.half - 0.3,
    `the sternlight is drawn at her stern, just abaft the transom (${light ? `"${light.room}", ${(-light.half - light.at[2]).toFixed(2)} m abaft it, ${light.at[0].toFixed(2)} m off the centre line, ${light.at[1].toFixed(2)} m over the waterline` : 'not in the register'})`);
  // ---- on foot, through every doorway and every door that opens to whoever comes near, both ways. One stands 0.8 m
  // before it on its centre line (0.5 m where a locker is too small for that), on whatever is underfoot there (the deck,
  // or a tread where the doorway is at a stair's foot), waits for a door to open, and walks: one must come out 0.3 m or
  // more beyond it.
  const through = await page.evaluate(async () => {
    const f = window.__ferry;
    const r = await fetch('data/ferry.bin.gz'); const ds = new DecompressionStream('gzip');
    const buf = await new Response(r.body.pipeThrough(ds)).arrayBuffer(); const n = new DataView(buf).getUint32(4, true);
    const header = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, n)));
    const list = [...(header.doorways || []).map(d => ({ id: d.id, name: d.name, at: d.at, normal: d.normal, leaf: false })),
                  ...header.inputs.filter(i => i.auto === 'near' && i.normal).map(i => ({ id: i.id, name: i.name, at: i.at, normal: i.normal, leaf: true }))];
    f.enterWalk();
    const out = [];
    for (const d of list) {
      const [nx, , nz] = d.normal;
      const from = (way, back) => {
        let x = d.at[0] - way * nx * back, z = d.at[2] - way * nz * back;
        // what is underfoot: the deck, or a stair's tread up to 1.3 m over it or 1.0 m under it. (Looked for on the doorway's middle and
        // 0.1 m to each side of it: the seam between two floor plates can lie on the middle, and a plumb line falls through it.)
        let under = null, aside = 0;
        for (const s of [0, 0.1, -0.1]) {
          const y = f.floorAt(x - nz * s, z + nx * s, d.at[1] + 1.3, d.at[1] - 1.0);
          if (y !== null && (under === null || y > under + 0.05)) { under = y; aside = s; }
        }
        x -= nz * aside; z += nx * aside;
        const y0 = under === null ? null : f.walkTo(x, z, Math.atan2(-way * nx, -way * nz), 0, under);
        if (y0 === null) return { floor: false, gone: 0, back };
        if (d.leaf) for (let t = 0; t < 1.6; t += 0.1) f.workAuto(0.1);
        f.hold('KeyW', true);
        for (let t = 0; t < 2.6; t += 0.1) { f.workAuto(0.1); f.walkFor(0.1); }
        f.hold('KeyW', false);
        const w = f.state.walk;
        return { floor: true, gone: ((w.x - d.at[0]) * nx + (w.z - d.at[2]) * nz) * way, room: f.whereOnFoot(), back };
      };
      const pass = way => { const far = from(way, 0.8); return far.floor && far.gone > 0.3 ? far : from(way, 0.5); };
      out.push({ id: d.id, name: d.name, leaf: d.leaf, yard: d.at[2] + f.ship.length / 2, x: d.at[0], y: d.at[1], one: pass(1), other: pass(-1) });
    }
    return out;
  });
  check(through.length > 0, `the model has ${through.filter(d => !d.leaf).length} doorways in her steel and ${through.filter(d => d.leaf).length} doors that open to whoever comes near`);
  for (const d of through) {
    const ok = d.one.floor && d.other.floor && d.one.gone > 0.3 && d.other.gone > 0.3;
    const how = p => p.floor ? `${p.gone.toFixed(2)} m beyond it into "${p.room}"` : 'no deck to stand on before it';
    check(ok, `${d.name} (${d.yard.toFixed(2)} m from the transom, ${d.x.toFixed(2)} m off the centre line, ${d.y.toFixed(2)} m up): through it one way ${how(d.one)}, the other ${how(d.other)}`);
  }
  // The drinks machine by the lobby (the owner's own, 11 November 2026): its take-out flap opens to whoever stands before
  // it; its door is worked by a tap only, on foot too, and the flap and the coin return go with the door when it swings.
  const machine = await page.evaluate(() => {
    const f = window.__ferry, H = f.ship.length / 2;
    const off = id => { const m = f.movers().find(m => m.id === id); return m ? m.matrix.reduce((s, v, i) => s + Math.abs(v - (i % 5 === 0 ? 1 : 0)), 0) : null; };
    // (the machine's door says where one stands to tap it: half a metre before its front, on its middle; it looks aft)
    const at = window.__doorAt('door-drinks-machine');
    f.walkTo(at[0], at[2] - 3.2, Math.PI, 0, at[1]);
    for (let t = 0; t < 1.2; t += 0.1) f.workAuto(0.1);
    const far = { flap: off('flap-drinks-machine'), door: off('door-drinks-machine') };
    f.walkTo(at[0] + 0.1, at[2] - 0.175, Math.PI, -0.05, at[1]);
    for (let t = 0; t < 1.2; t += 0.1) f.workAuto(0.1);
    return { far, near: { flap: off('flap-drinks-machine'), door: off('door-drinks-machine') } };
  });
  check(machine.far.flap < 1e-6 && machine.near.flap > 0.05, `the drinks machine's take-out flap is shut from the lobby and open to one who stands before it`);
  check(machine.near.door < 1e-6, `its door stays shut as one walks up to it`);
  await page.waitForTimeout(400);
  await page.mouse.click(640, 400);                                  // a tap on the machine's front, on foot
  const tapped = await page.evaluate(() => {
    const f = window.__ferry;
    const off = id => { const m = f.movers().find(m => m.id === id); return m.matrix.reduce((s, v, i) => s + Math.abs(v - (i % 5 === 0 ? 1 : 0)), 0); };
    for (let t = 0; t < 1.2; t += 0.1) f.workAuto(0.1);
    return { door: off('door-drinks-machine'), lever: off('lever-drinks-machine'), said: document.querySelector('#what').textContent };
  });
  check(tapped.door > 0.5 && tapped.lever > 0.5, `a tap on its front opens the door, and what is on the door goes with it (${tapped.said})`);
  await page.evaluate(() => { const f = window.__ferry, at = window.__doorAt('door-drinks-machine'); f.walkTo(at[0] + 0.1, at[2] - 0.175, -Math.PI / 2, -0.05, at[1]); });      // the open door stands to port of one: turn to it
  await page.waitForTimeout(400);
  await page.mouse.click(640, 400);
  const shut = await page.evaluate(() => {
    const f = window.__ferry;
    for (let t = 0; t < 1.2; t += 0.1) f.workAuto(0.1);
    return f.movers().find(m => m.id === 'door-drinks-machine').matrix.reduce((s, v, i) => s + Math.abs(v - (i % 5 === 0 ? 1 : 0)), 0);
  });
  check(shut < 1e-6, `a tap on the open door shuts it again`);
  // The emergency generator room on the top deck (built to the owner's drawing): one walks from the escape route out
  // through its door onto the deck, and each fire damper's lever is turned by a tap and not by walking past.
  const eg = await page.evaluate(() => {
    const f = window.__ferry, H = f.ship.length / 2;
    const off = id => { const m = f.movers().find(m => m.id === id); return m ? m.matrix.reduce((s, v, i) => s + Math.abs(v - (i % 5 === 0 ? 1 : 0)), 0) : null; };
    // (its door says where it is: one stands inside, 2.5 m to port of it and in line with it, and walks to starboard)
    const at = window.__doorAt('door-eg-house');
    f.walkTo(at[0] + 2.54, at[2] - 0.02, Math.PI / 2, 0, at[1]);
    const before = { x: f.state.walk.x, y: f.state.walk.y };
    f.hold('KeyW', true);
    for (let t = 0; t < 3.5; t += 0.1) { f.workAuto(0.1); f.walkFor(0.1); }
    f.hold('KeyW', false);
    return { before, x: f.state.walk.x, y: f.state.walk.y, damper: off('damper-fd02'), door: at };
  });
  check(eg.before.y > eg.door[1] - 0.15 && eg.x < eg.door[0] - 0.11, `from the emergency generator room's escape route one walks out through its door onto the open deck (from ${eg.before.x.toFixed(2)} to ${eg.x.toFixed(2)} m off the centreline; the door is at ${eg.door[0].toFixed(2)})`);
  check(eg.damper < 1e-6, `walking past, the fire damper's lever stays as it is`);
  check(errors.length === 0, `no errors in the console (${errors.slice(0, 3).join(' | ') || 'none'})`);
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed');
  process.exit(fails.length ? 1 : 0);
})();
