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
    const rods = header.movers.filter(m => m.kind === 'aim' && m.extend && m.input === 'stern-ramp');
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
