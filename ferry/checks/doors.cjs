// Every door aboard opens, and every doorway lets one through.
//
//   node ferry/checks/doors.cjs          (the site served on port 8765: python3 -m http.server 8765)
//
// The owner, 11 November 2026: "The door needs to be able to open nothing is ornamental". Every door the model says can be
// worked (its `inputs` with auto: the watertight doors, the wheelhouse's doors and gate, the generator room's door, the
// hatch, the drinks machine) is opened as a tap opens it, and must have moved; shut again, it must be back. Then on foot,
// aboard the 68 m ship: through her watertight doors from the engine room aft to the steering gear and forward to the
// thruster room; from the lanes through a casing's doorway; down the accommodation's corridor from its after door into
// the wheelhouse; into the mess; the drinks machine; out of the generator room.
const { chromium } = require('playwright');
const fails = [];
const check = (ok, text) => { console.log((ok ? 'ok    ' : 'FAIL  ') + text); if (!ok) fails.push(text); };
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://localhost:8765/ferry/?t=' + Date.now());
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
    for (const def of header.inputs.filter(i => i.auto)) {
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
    const f = window.__ferry, label = [...document.querySelectorAll('#bar label .lbl')].map(e => e.textContent);
    const lean = () => { const m = f.movers().find(m => m.id === 'stern-ramp'); return m ? Math.atan2(m.matrix[6], m.matrix[5]) * 180 / Math.PI : null; };
    const raised = lean();
    f.setInput('stern-ramp', 90);
    const lowered = lean();
    f.setInput('stern-ramp', 0);
    return { label, raised, lowered, again: lean() };
  });
  check(ramp.label.includes('Stern ramp') && Math.abs(ramp.raised) < 1e-6 && Math.abs(Math.abs(ramp.lowered) - 90) < 0.01 && Math.abs(ramp.again) < 1e-6,
    `the stern ramp has its control in the bar and lowers through 90° to lie level with the car deck, and is raised again (${ramp.lowered === null ? 'no such part' : ramp.lowered.toFixed(1) + '°'})`);
  const walk = await page.evaluate(() => {
    const f = window.__ferry, H = f.ship.length / 2, AHEAD = Math.PI, ASTERN = 0, PORT = -Math.PI / 2;
    f.enterWalk();
    const go = (x, yard, yaw, seconds, level) => {
      const y0 = f.walkTo(x, yard - H, yaw, 0, level);
      f.hold('KeyW', true);
      for (let t = 0; t < seconds; t += 0.1) { f.workAuto(0.1); f.walkFor(0.1); }
      f.hold('KeyW', false);
      const w = f.state.walk;
      return { y0, x: w.x, y: w.y, yard: w.z + H, room: f.whereOnFoot() };
    };
    return {
      aft: go(0.0, 13.0, ASTERN, 12, -1.2),          // from the engine room's after flat, aft through two watertight doors
      forward: go(0.0, 26.0, AHEAD, 24, -2.0),       // from the auxiliary engine room, forward through three
      store: go(4.4, 48.95, PORT, 2.5, 1.8),         // from the lanes into the bosun's store
      corridor: go(0.0, 20.5, AHEAD, 22, 9.3),       // from the open deck, in at the corridor's after door, to the wheelhouse
      mess: go(0.0, 24.37, PORT, 2.5, 9.3),          // from the corridor into the mess
    };
  });
  check(walk.aft.y0 !== null && walk.aft.yard < 4.4 && Math.abs(walk.aft.y - -0.05) < 0.06,
    `from the engine room aft through the watertight doors, up the steps in the shaft space, into the steering gear room (to ${walk.aft.yard.toFixed(2)} m from the transom, "${walk.aft.room}")`);
  check(walk.forward.y0 !== null && walk.forward.yard > 51.4,
    `from the auxiliary engine room forward through three watertight doors into the thruster room (to ${walk.forward.yard.toFixed(2)} m, "${walk.forward.room}")`);
  check(walk.store.x > 5.5, `from the lanes through the casing's doorway into the bosun's store (to ${walk.store.x.toFixed(2)} m off the centreline, "${walk.store.room}")`);
  check(walk.corridor.yard > 50.4 && /Wheelhouse/i.test(walk.corridor.room),
    `in at the corridor's after door, down the corridor and through its door into the wheelhouse (to ${walk.corridor.yard.toFixed(2)} m, "${walk.corridor.room}")`);
  check(walk.mess.x > 1.2 && /mess/i.test(walk.mess.room), `from the corridor through its doorway into the mess (to ${walk.mess.x.toFixed(2)} m off the centreline, "${walk.mess.room}")`);
  // The drinks machine by the lobby (the owner's own, 11 November 2026): its take-out flap opens to whoever stands before
  // it; its door is worked by a tap only, on foot too, and the flap and the coin return go with the door when it swings.
  const machine = await page.evaluate(() => {
    const f = window.__ferry, H = f.ship.length / 2;
    const off = id => { const m = f.movers().find(m => m.id === id); return m ? m.matrix.reduce((s, v, i) => s + Math.abs(v - (i % 5 === 0 ? 1 : 0)), 0) : null; };
    f.walkTo(4.4, 25.5 - H, Math.PI, 0, 6.5);
    for (let t = 0; t < 1.2; t += 0.1) f.workAuto(0.1);
    const far = { flap: off('flap-drinks-machine'), door: off('door-drinks-machine') };
    f.walkTo(4.5, 28.5 - H, Math.PI, -0.05, 6.5);
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
  await page.evaluate(() => { const f = window.__ferry; f.walkTo(4.5, 28.5 - f.ship.length / 2, -Math.PI / 2, -0.05, 6.5); });      // the open door stands to port of one: turn to it
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
    f.walkTo(0.25, 30.48 - H, Math.PI / 2, 0, 12.05);
    const before = { x: f.state.walk.x, y: f.state.walk.y };
    f.hold('KeyW', true);
    for (let t = 0; t < 3.5; t += 0.1) { f.workAuto(0.1); f.walkFor(0.1); }
    f.hold('KeyW', false);
    return { before, x: f.state.walk.x, y: f.state.walk.y, damper: off('damper-fd02') };
  });
  check(eg.before.y > 11.9 && eg.x < -2.4, `from the emergency generator room's escape route one walks out through its door onto the top deck (from ${eg.before.x.toFixed(2)} to ${eg.x.toFixed(2)} m off the centreline)`);
  check(eg.damper < 1e-6, `walking past, the fire damper's lever stays as it is`);
  check(errors.length === 0, `no errors in the console (${errors.slice(0, 3).join(' | ') || 'none'})`);
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed');
  process.exit(fails.length ? 1 : 0);
})();
