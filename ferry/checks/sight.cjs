#!/usr/bin/env node
/**
 * Checks that what is read on the navigation bridge is read over what is worked (the owner, 12 November 2026: "the panels
 * and lever need to be placed more intelligent because now some levers are blocking some panels, look at the bridge as an
 * end user"; of the engine levers standing before their own dials: "is that really normal").
 *
 *     python3 -m http.server 8765        (in the site's root)
 *     node ferry/checks/sight.cjs [http://localhost:8765/ferry/]
 *
 * A line is drawn from the eye to a point of an instrument, in the page's own model, and no lever may stand in it: its
 * grip, its arm or its drum. The eye is the walker's, 1.6 m over the deck, at every place of a grid abaft the console
 * block, from side to side of the room and back to its after wall (whether a walker can stand at each or not); the points
 * are a grid over what is read of each instrument: across its whole breadth, and from 15 % of its height up (the lowest
 * 4 cm of a display in the upstand are its bezel and its row of keys; from the room's after corners a grip does come
 * before that strip of the two displays nearest the levers, and never before a picture). It is asked with the levers at
 * stop, with both engines full ahead and full astern, and with the thruster full over to each side:
 *   - the instruments and displays set in the console's upstand, from the whole room abaft the block;
 *   - the panels that lie flat on the level strip, from the helm and forward of it (from further aft a grip does come
 *     before their after edge: they are worked standing at the block, where nothing is before them);
 *   - the two dials of each wing station, from behind the station and from two metres abaft it.
 * It reads the places from the file and the register (ship.bridge, each component's box); only the wing dials' places are
 * the builder's own measures (blender/wheelhouse.py, wing_console), since a wing station is one component.
 *
 * Needs Playwright with Chromium (software rendering is enough). Exits non-zero if a check fails.
 */
const { chromium } = require('playwright');
const url = process.argv[2] || process.env.CHISUM_URL || 'http://localhost:8765/ferry/';
const fails = [];
const check = (ok, text) => { console.log((ok ? 'ok    ' : 'FAIL  ') + text); if (!ok) fails.push(text); };

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(url + '?sight=' + Date.now());
  await page.waitForFunction(() => window.__ferry && document.body.classList.contains('ready') && window.__ferry.systems, null, { timeout: 180000 });

  const out = await page.evaluate(async () => {
    const T = await import('three');
    const f = window.__ferry, ship = f.ship, HALF = ship.length / 2, { shift: SHIFT, deck: DECK, wing: WING } = ship.bridge;
    const EYE = 1.6;
    const P = (x, yard, h) => new T.Vector3(x, DECK + h, yard + SHIFT - HALF);      // the bridge's own measures → the model's
    const yardOf = z => z - SHIFT + HALF;
    f.enterWalk();
    f.walkTo(0, 20.9 + SHIFT - HALF, Math.PI, 0, DECK);
    const scene = f.look.scene;
    const group = id => scene.getObjectByName(id);
    const CONSOLE = ['lever-engine-p', 'lever-engine-s', 'lever-thruster'];
    const ray = new T.Raycaster();
    // The lever that stands between an eye and a point, or null: only the levers are asked, so nothing else can answer for one.
    const between = (eye, point, levers) => {
      const d = point.clone().sub(eye), far = d.length() - 0.004;
      ray.set(eye, d.normalize()); ray.near = 0; ray.far = far;
      for (const id of levers) if (ray.intersectObject(group(id), true).length) return id;
      return null;
    };
    const settle = () => { for (let t = 0; t < 3; t += 0.1) f.workSteps(0.1); scene.updateMatrixWorld(true); };
    const put = (id, at) => { for (let k = 0; k < 16 && f.control(id).at !== at; k++) f.step(id); };
    const homes = Object.fromEntries(CONSOLE.map(id => [id, f.control(id).at]));
    const ends = id => f.control(id).steps.length - 1;
    const STATES = [
      ['at stop', {}],
      ['both engines full ahead', { 'lever-engine-p': 'max', 'lever-engine-s': 'max' }],
      ['both engines full astern', { 'lever-engine-p': 0, 'lever-engine-s': 0 }],
      ['the thruster full to starboard', { 'lever-thruster': 'max' }],
      ['the thruster full to port', { 'lever-thruster': 0 }],
    ];
    const set = state => { for (const id of CONSOLE) put(id, state[id] === undefined ? homes[id] : state[id] === 'max' ? ends(id) : state[id]); settle(); };

    // ---- what is read: the register's components with a place in the model
    const comps = f.systems.data.components.filter(c => c.room === 'wheelhouse' && c.box && c.part === 'bridge');
    const atYard = c => yardOf(c.at[2]), atH = c => c.at[1] - DECK, tall = c => c.box[1][1] - c.box[0][1];
    const upright = comps.filter(c => atYard(c) > 22.5 && atYard(c) < 22.85 && Math.abs(atH(c) - 1.0) < 0.02 && tall(c) > 0.12);
    const flat = comps.filter(c => atYard(c) > 22.5 && atYard(c) < 22.72 && Math.abs(atH(c) - 1.0) < 0.02 && tall(c) < 0.06);
    const GRID = [0.08, 0.29, 0.5, 0.71, 0.92], UP = [0.15, 0.34, 0.53, 0.72, 0.92];
    // an upright instrument leans back: its face runs from the box's low after edge to its high forward one; what is read
    // of it begins over its bezel and its keys
    const facePoints = c => GRID.flatMap(u => UP.map(v => new T.Vector3(c.box[0][0] + u * (c.box[1][0] - c.box[0][0]), c.box[0][1] + v * tall(c), c.box[0][2] + v * (c.box[1][2] - c.box[0][2]))));
    const topPoints = c => GRID.flatMap(u => GRID.map(v => new T.Vector3(c.box[0][0] + u * (c.box[1][0] - c.box[0][0]), c.box[1][1], c.box[0][2] + v * (c.box[1][2] - c.box[0][2]))));
    const eyes = (x0, x1, dx, y0, y1, dy) => { const e = []; for (let x = x0; x <= x1 + 1e-9; x += dx) for (let y = y0; y <= y1 + 1e-9; y += dy) e.push(P(x, y, EYE)); return e; };
    const ask = (eyeList, targets, levers) => {
      let lines = 0; const bad = [];
      for (const e of eyeList) for (const [id, pts] of targets) for (const q of pts) {
        lines++;
        const by = between(e, q, levers);
        if (by) bad.push(`${id} behind ${by} from x ${e.x.toFixed(2)}, ${yardOf(e.z).toFixed(2)} m`);
      }
      return { lines, bad: bad.length, first: bad.slice(0, 3) };
    };

    const room = eyes(-2.7, 2.7, 0.3, 19.75, 21.9, 0.215), helm = eyes(-2.7, 2.7, 0.3, 20.9, 21.9, 0.2);     // the room is 2.92 m to each side inside its linings, its after wall at 19.5 m
    const res = { upright: upright.map(c => c.id), flat: flat.map(c => c.id), room: room.length, helm: helm.length, states: [], wings: [] };
    // ---- the check must be able to see a lever: a point 6 cm before the port engine's grip, from behind the wheel, is behind it
    set({});
    const grip = new T.Box3().setFromObject(group('lever-engine-p')), mid = grip.getCenter(new T.Vector3());
    const top = new T.Vector3(mid.x, grip.max.y - 0.02, mid.z);
    res.sees = between(P(mid.x, 20.9, EYE), top.clone().add(top.clone().sub(P(mid.x, 20.9, EYE)).normalize().multiplyScalar(0.06)), CONSOLE);
    res.gripTop = grip.max.y - DECK;
    res.leverYard = yardOf(mid.z);

    // ---- the wing stations: the two dials in the upright face (blender/wheelhouse.py, wing_console)
    const c20 = Math.cos(20 * Math.PI / 180), s20 = Math.sin(20 * Math.PI / 180);
    const y0 = 22.75 - 0.17, yf = y0 + 0.24, hf = 0.88 + 0.10 * (0.98 - 0.88) / 0.22;
    const dial = (side, u) => {
      const x = side * (WING - 0.385 - 0.315 + u), c = P(x, yf + 0.110 * s20, hf + 0.110 * c20), pts = [c];
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; pts.push(P(x + 0.055 * Math.cos(a), yf + (0.110 + 0.055 * Math.sin(a)) * s20, hf + (0.110 + 0.055 * Math.sin(a)) * c20)); }
      return pts;
    };

    for (const [name, state] of STATES) {
      set(state);
      const r = { name, up: ask(room, upright.map(c => [c.id, facePoints(c)]), CONSOLE), flat: ask(helm, flat.map(c => [c.id, topPoints(c)]), CONSOLE), wing: [] };
      for (const [side, tail, word] of [[1, '-wp', 'port'], [-1, '-ws', 'starboard']]) {
        const xs = side * (WING - 0.385), xa = Math.min(xs - 0.6, xs + 0.6);
        r.wing.push({ word, ...ask(eyes(xa, xa + 1.2, 0.2, 20.3, 22.3, 0.25), [[`the rudder angle dial, ${word} wing`, dial(side, 0.20)], [`the revolutions dial, ${word} wing`, dial(side, 0.50)]], CONSOLE.map(id => id + tail)) });
      }
      res.states.push(r);
    }
    set({});
    return res;
  });

  check(out.sees === 'lever-engine-p', `the check sees a lever that is in the way: a point 6 cm before the port engine lever's grip, from behind the wheel, is behind it (${out.sees}); its grip's top is ${out.gripTop.toFixed(3)} m over the deck, at ${out.leverYard.toFixed(2)} m`);
  check(out.upright.length >= 8 && ['PRP-06', 'STR-06', 'NAV-06', 'NAV-01', 'NAV-10', 'NAV-05'].every(id => out.upright.includes(id)),
    `${out.upright.length} instruments and displays are set in the console's upstand (${out.upright.join(', ')})`);
  check(out.flat.length >= 2 && ['PRP-04', 'PRP-05'].every(id => out.flat.includes(id)), `${out.flat.length} panels lie on the level strip (${out.flat.join(', ')})`);
  for (const s of out.states) {
    check(s.up.bad === 0, `levers ${s.name}: from ${out.room} places of the eye abaft the block no lever stands before an instrument of the upstand (${s.up.lines} lines of sight${s.up.bad ? `, ${s.up.bad} cut: ${s.up.first.join('; ')}` : ''})`);
    check(s.flat.bad === 0, `levers ${s.name}: from ${out.helm} places from the helm forward no lever stands before a panel of the level strip (${s.flat.lines} lines${s.flat.bad ? `, ${s.flat.bad} cut: ${s.flat.first.join('; ')}` : ''})`);
    for (const w of s.wing) check(w.bad === 0, `levers ${s.name}: at the ${w.word} wing station no lever stands before a dial (${w.lines} lines${w.bad ? `, ${w.bad} cut: ${w.first.join('; ')}` : ''})`);
  }
  check(errors.length === 0, `the page raised no error (${errors.length ? errors.slice(0, 2).join(' | ') : 'none'})`);
  await browser.close();
  console.log(fails.length ? `\n${fails.length} failed` : '\nall passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
