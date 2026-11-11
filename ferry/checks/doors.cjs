// Every door aboard that is hers opens.
//
//   node ferry/checks/doors.cjs          (the site served on port 8765: python3 -m http.server 8765)
//
// The owner, 11 November 2026: "The door needs to be able to open nothing is ornamental". Every door the model says can be
// worked (its `inputs` with auto: "near": cabin doors, weathertight doors, the stairs' sliding doors, the hose box, the
// gate, the hatches) is opened as a tap opens it, and must have moved; shut again, it must be back. Then on foot: walking
// down the middle of the crew's corridor leaves the cabin doors shut, turning into the mess opens its door and lets one in,
// and the corridor's aft door lets one out onto the platform.
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
  const walk = await page.evaluate(() => {
    const f = window.__ferry, H = 17.25, DECK = 9.1;
    const angle = id => Math.max(...f.movers().filter(m => m.input === id).map(m => Math.abs(Math.atan2(m.matrix[8], m.matrix[0]))));
    f.enterWalk();
    const go = (x, yard, yaw, seconds) => { f.walkTo(x, yard - H, yaw, 0, DECK); f.hold('KeyW', true); let most = {}; for (let t = 0; t < seconds; t += 0.1) { f.workAuto(0.1); f.walkFor(0.1);
      for (const id of ['door-mess', 'door-galley', 'door-crew-cabin', 'door-master-cabin']) most[id] = Math.max(most[id] || 0, angle(id)); } f.hold('KeyW', false); const w = f.state.walk; return { x: w.x, yard: w.z + H, most }; };
    const along = go(0.0, 8.0, Math.PI, 11.5);                       // down the middle, from aft to the wheelhouse door
    const mess = go(0.0, 14.55, -Math.PI / 2, 2.5);                  // from the middle, turning to port into the mess
    const messOpen = mess.most['door-mess'];                          // the widest it stood while one walked through
    const outAft = go(0.0, 7.2, 0, 3.0);                             // aft, out through the corridor's door
    return { along, mess, messOpen, outAft };
  });
  const most = Math.max(...Object.values(walk.along.most));
  check(walk.along.yard > 18.5 && most < 0.02, `walking down the middle of the corridor (to ${walk.along.yard.toFixed(2)} m) the cabin doors stay shut (most opened ${(most * 57.3).toFixed(0)}°)`);
  check(walk.mess.x > 0.9 && walk.messOpen > 1.2, `turning into the mess, its door opens (${(walk.messOpen * 57.3).toFixed(0)}°) and one walks in (to ${walk.mess.x.toFixed(2)} m off the centreline)`);
  check(walk.outAft.yard < 5.7, `the corridor's aft door lets one out onto the platform (to ${walk.outAft.yard.toFixed(2)} m from the transom)`);
  // The drinks machine in the lobby (the owner's own, 11 November 2026): its take-out flap opens to whoever stands before
  // it; its door is worked by a tap only, on foot too, and the flap and the coin return go with the door when it swings.
  const machine = await page.evaluate(() => {
    const f = window.__ferry, H = 17.25;
    const off = id => { const m = f.movers().find(m => m.id === id); return m ? m.matrix.reduce((s, v, i) => s + Math.abs(v - (i % 5 === 0 ? 1 : 0)), 0) : null; };
    f.walkTo(2.1, 6.6 - H, Math.PI, 0, 6.5);
    for (let t = 0; t < 1.2; t += 0.1) f.workAuto(0.1);
    const far = { flap: off('flap-drinks-machine'), door: off('door-drinks-machine') };
    f.walkTo(2.2, 8.0 - H, Math.PI, -0.05, 6.5);
    for (let t = 0; t < 1.2; t += 0.1) f.workAuto(0.1);
    return { far, near: { flap: off('flap-drinks-machine'), door: off('door-drinks-machine') } };
  });
  check(machine.far.flap < 1e-6 && machine.near.flap > 0.05, `the drinks machine's take-out flap is shut from across the lobby and open to one who stands before it`);
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
  await page.evaluate(() => { const f = window.__ferry; f.walkTo(2.2, 8.0 - 17.25, -Math.PI / 2, -0.05, 6.5); });      // the open door stands to port of one: turn to it
  await page.waitForTimeout(400);
  await page.mouse.click(640, 400);
  const shut = await page.evaluate(() => {
    const f = window.__ferry;
    for (let t = 0; t < 1.2; t += 0.1) f.workAuto(0.1);
    return f.movers().find(m => m.id === 'door-drinks-machine').matrix.reduce((s, v, i) => s + Math.abs(v - (i % 5 === 0 ? 1 : 0)), 0);
  });
  check(shut < 1e-6, `a tap on the open door shuts it again`);
  check(errors.length === 0, `no errors in the console (${errors.slice(0, 3).join(' | ') || 'none'})`);
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed');
  process.exit(fails.length ? 1 : 0);
})();
